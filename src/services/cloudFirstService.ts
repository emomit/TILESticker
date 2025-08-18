import { supabase } from '@/lib/supabase'
import { db } from '@/db'
import type { Item } from '@/types'
import { validateItem, sanitizeItem } from '@/util/validation'
import { nanoid } from '@/util/nanoid'

export class CloudFirstService {
  private static instance: CloudFirstService

  static getInstance(): CloudFirstService {
    if (!CloudFirstService.instance) {
      CloudFirstService.instance = new CloudFirstService()
    }
    return CloudFirstService.instance
  }

  async isCloudEmpty(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('items')
        .select('id')
        .eq('user_id', userId)
        .limit(1)

      if (error) return false

      return !data || data.length === 0
    } catch (error) {
      return false
    }
  }

  async uploadLocalData(userId: string): Promise<void> {
    try {
      const localItems = await db.items.toArray()

      for (const item of localItems) {
        const sanitizedItem = sanitizeItem(item)
        const validation = validateItem(sanitizedItem)
        
        if (!validation.isValid) continue

        const supabaseItem = {
          id: item.id,
          user_id: userId,
          type: item.type,
          title: sanitizedItem.title,
          content: sanitizedItem.content,
          done: item.done ?? false,
          href: sanitizedItem.href,
          list: sanitizedItem.list,
          date: item.date,
          tags: sanitizedItem.tags ?? [],
          color: item.color,
          created_at: new Date(item.createdAt).toISOString(),
          updated_at: new Date(item.updatedAt).toISOString(),
          deleted_at: null,
        }

        const { error } = await supabase
          .from('items')
          .upsert(supabaseItem, { onConflict: 'id' })

        if (error) {
          // Handle error silently
        }
      }
    } catch (error) {
      // Handle error silently
    }
  }

  async addItem(type: string, userId: string): Promise<Item | null> {
    try {
      const now = Date.now()
      const id = nanoid(12)
      
      const baseItem = {
        id,
        type,
        title: type === 'todo' ? 'New ToDo' : 
               type === 'memo' ? 'New Memo' : 
               type === 'link' ? 'New Link' : 
               type === 'list' ? 'New List' : 'New Date',
        content: type === 'memo' || type === 'date' ? '' : undefined,
        done: type === 'todo' ? false : undefined,
        href: type === 'link' ? '' : undefined,
        list: type === 'list' ? [''] : undefined,
        tags: [],
        createdAt: now,
        updatedAt: now,
      }

      const supabaseItem = {
        id,
        user_id: userId,
        type,
        title: baseItem.title,
        content: baseItem.content || '',
        done: baseItem.done || false,
        href: baseItem.href || '',
        list: baseItem.list || [],
        date: null,
        tags: [],
        color: null,
        created_at: new Date(now).toISOString(),
        updated_at: new Date(now).toISOString(),
        deleted_at: null,
      }

      const { data, error } = await supabase
        .from('items')
        .insert([supabaseItem])
        .select()
        .single()

      if (error) return null

      // クラウドから返されたデータでローカルを更新
      const localItem: Item = {
        id: data.id,
        type: data.type,
        title: data.title,
        content: data.content,
        done: data.done,
        href: data.href,
        list: data.list,
        date: data.date,
        tags: data.tags || [],
        color: data.color,
        createdAt: new Date(data.created_at).getTime(),
        updatedAt: new Date(data.updated_at).getTime(),
      }

      await db.items.put(localItem)
      console.log('Added item via cloud:', localItem.id)
      return localItem
    } catch (error) {
      console.error('Add item failed:', error)
      return null
    }
  }

  // アイテム更新（クラウドファースト）
  async updateItem(id: string, patch: Partial<Item>, userId: string): Promise<Item | null> {
    try {
      const sanitizedPatch = sanitizeItem(patch)
      const validation = validateItem(sanitizedPatch)
      if (!validation.isValid) {
        console.error('Validation error:', validation.errors)
        return null
      }

      const updateData: any = {
        updated_at: new Date().toISOString(),
      }

      // 更新対象のフィールドのみ設定
      if (sanitizedPatch.title !== undefined) updateData.title = sanitizedPatch.title
      if (sanitizedPatch.content !== undefined) updateData.content = sanitizedPatch.content
      if (sanitizedPatch.done !== undefined) updateData.done = sanitizedPatch.done
      if (sanitizedPatch.href !== undefined) updateData.href = sanitizedPatch.href
      if (sanitizedPatch.list !== undefined) updateData.list = sanitizedPatch.list
      if (sanitizedPatch.date !== undefined) updateData.date = sanitizedPatch.date
      if (sanitizedPatch.tags !== undefined) updateData.tags = sanitizedPatch.tags
      if (sanitizedPatch.color !== undefined) updateData.color = sanitizedPatch.color

      const { data, error } = await supabase
        .from('items')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single()

      if (error) return null

      // クラウドから返されたデータでローカルを更新
      const localItem: Item = {
        id: data.id,
        type: data.type,
        title: data.title,
        content: data.content,
        done: data.done,
        href: data.href,
        list: data.list,
        date: data.date,
        tags: data.tags || [],
        color: data.color,
        createdAt: new Date(data.created_at).getTime(),
        updatedAt: new Date(data.updated_at).getTime(),
      }

      await db.items.put(localItem)
      console.log('Updated item via cloud:', localItem.id)
      return localItem
    } catch (error) {
      console.error('Update item failed:', error)
      return null
    }
  }

  // アイテム削除（クラウドファースト）
  async deleteItem(id: string, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('items')
        .update({ 
          deleted_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', userId)

      if (error) {
        console.error('Cloud delete error:', error)
        return false
      }

      // ローカルIndexedDBからも削除
      try {
        await db.items.delete(id)
      } catch (localError) {
        console.error('Local delete error:', localError)
      }

      console.log('Deleted item via cloud:', id)
      return true
    } catch (error) {
      console.error('Delete item failed:', error)
      return false
    }
  }

  async isOnline(): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('items')
        .select('id')
        .limit(1)
      
      return !error
    } catch {
      return false
    }
  }
}
