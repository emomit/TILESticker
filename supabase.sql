create extension if not exists "pgcrypto";

create type item_type as enum ('todo','memo','link','list','date');

create table if not exists items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type item_type not null,
  title text not null check (length(title) <= 200),
  content text check (length(content) <= 20000),
  done boolean not null default false,
  href text check (length(href) <= 2048),
  list text[],
  date jsonb,
  tags text[] not null default '{}',
  color jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists idx_items_user_id on items(user_id);
create index if not exists idx_items_user_type_created on items(user_id, type, created_at desc);
create index if not exists idx_items_tags_gin on items using gin (tags);
create index if not exists idx_items_date_gin on items using gin (date);
create index if not exists idx_items_deleted_at on items(deleted_at) where deleted_at is not null;

create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end; $$ language plpgsql;

drop trigger if exists trg_set_updated_at on items;
create trigger trg_set_updated_at
before update on items
for each row execute function set_updated_at();

alter table items enable row level security;

create policy "Users can view own items" on items
  for select using (
    auth.uid() = user_id and deleted_at is null
  );

create policy "Users can insert own items" on items
  for insert with check (
    auth.uid() = user_id
  );

create policy "Users can update own items" on items
  for update using (
    auth.uid() = user_id and deleted_at is null
  ) with check (
    auth.uid() = user_id and deleted_at is null
  );

create policy "Users can soft delete own items" on items
  for update using (
    auth.uid() = user_id and deleted_at is null
  ) with check (
    auth.uid() = user_id
  );

create or replace function soft_delete_item(item_id uuid)
returns void as $$
begin
  update items 
  set deleted_at = now()
  where id = item_id and user_id = auth.uid() and deleted_at is null;
end; $$ language plpgsql security definer;

create or replace function hard_delete_item(item_id uuid)
returns void as $$
begin
  delete from items 
  where id = item_id and user_id = auth.uid();
end; $$ language plpgsql security definer;

create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  table_name text not null,
  record_id uuid not null,
  action text not null,
  old_data jsonb,
  new_data jsonb,
  created_at timestamptz not null default now()
);

alter table audit_logs enable row level security;
create policy "Users can view own audit logs" on audit_logs
  for select using (auth.uid() = user_id);

create or replace function audit_items_changes()
returns trigger as $$
begin
  if tg_op = 'INSERT' then
    insert into audit_logs (user_id, table_name, record_id, action, new_data)
    values (new.user_id, 'items', new.id, 'INSERT', to_jsonb(new));
    return new;
  elsif tg_op = 'UPDATE' then
    insert into audit_logs (user_id, table_name, record_id, action, old_data, new_data)
    values (new.user_id, 'items', new.id, 'UPDATE', to_jsonb(old), to_jsonb(new));
    return new;
  elsif tg_op = 'DELETE' then
    insert into audit_logs (user_id, table_name, record_id, action, old_data)
    values (old.user_id, 'items', old.id, 'DELETE', to_jsonb(old));
    return old;
  end if;
  return null;
end; $$ language plpgsql;

create trigger trg_audit_items
after insert or update or delete on items
for each row execute function audit_items_changes();
