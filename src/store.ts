import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { nanoid } from './util/nanoid'
import { db } from './db'
import type { Item, ItemType } from './types'
import { matchesQuery } from './util/search'

type SortKey = 'updatedAt' | 'type'

type State = {
  items: Item[]
  filtered: string[]
  selectedId?: string
  searchOpen: boolean
  query: string
  sort: SortKey
  filterType: ItemType | null
  loading: boolean
}

type Actions = {
  load: () => Promise<void>
  add: (type: ItemType) => Promise<Item>
  update: (id: string, patch: Partial<Item>) => Promise<void>
  remove: (id: string) => Promise<void>
  removeAll: () => Promise<void>
  toggleDone: (id: string) => Promise<void>
  setSelected: (id?: string) => void
  setQuery: (q: string) => void
  setSearchOpen: (v: boolean) => void
  setSort: (sort: SortKey) => void
  setFilterType: (type: ItemType | null) => void
  exportJson: () => Promise<string>
  importJson: (json: string) => Promise<void>
  applyFilter: () => void
}

export const useStore = create<State & Actions>()(
  (typeof import.meta !== 'undefined' && import.meta.env?.DEV ? devtools : (fn: any) => fn)((set: any, get: any) => ({
    items: [],
    filtered: [],
    selectedId: undefined,
    searchOpen: false,
    query: '',
    sort: 'updatedAt',
    filterType: null,
    loading: true,
    

    load: async () => {
      const items = await db.items.orderBy('updatedAt').reverse().toArray()
      set({ items, filtered: items.map((i) => i.id), loading: false })
    },

    add: async (type: ItemType) => {
      const now = Date.now()
      const base: Item = {
        id: nanoid(),
        type,
        title:
          type === 'todo'
            ? 'New ToDo'
            : type === 'memo'
            ? 'New Memo'
            : type === 'link'
            ? 'New Link'
            : type === 'list'
            ? 'New List'
            : 'New Date',
        tags: [],
        createdAt: now,
        updatedAt: now,
      }
      if (type === 'todo') base.done = false
      if (type === 'memo' || type === 'date') base.content = ''
      if (type === 'list') base.list = ['']
      if (type === 'link') base.href = ''
      await db.items.put(base)
      const items = [base, ...get().items]
      set({ items, filtered: items.map((i) => i.id) })
      return base
    },

    update: async (id: string, patch: Partial<Item>) => {
      try {
        const current = get().items.find((i: Item) => i.id === id)
        if (!current) return
        
        const next: Item = { 
          ...current, 
          ...patch
        }
        
        await db.items.put(next)
        const items = get().items.map((i: Item) => (i.id === id ? next : i))
        set({ items })
      } catch (error) {
      }
    },

    remove: async (id: string) => {
      const items = get().items.filter((i: Item) => i.id !== id)
      set({ items })
      get().applyFilter()
      await db.items.delete(id)
    },
    removeAll: async () => {
      set({ items: [], filtered: [] })
      await db.items.clear()
    },

    toggleDone: async (id: string) => {
      const item = get().items.find((i: Item) => i.id === id)
      if (!item) return
      await get().update(id, { done: !item.done })
    },

    setSelected: (id?: string) => set({ selectedId: id }),
    
    setQuery: (q: string) => {
      set({ query: q })
      get().applyFilter()
    },
    setSearchOpen: (v: boolean) => set({ searchOpen: v }),
    setSort: (sort: SortKey) => {
      set({ sort })
      get().applyFilter()
    },
    setFilterType: (type: ItemType | null) => {
      set({ filterType: type })
      get().applyFilter()
    },

    exportJson: async () => {
      const items = await db.items.toArray()
      return JSON.stringify({ version: 1, items }, null, 2)
    },
    importJson: async (json: string) => {
      const data = JSON.parse(json)
      if (!data || !Array.isArray(data.items)) return
      await db.transaction('rw', db.items, async () => {
        for (const it of data.items) await db.items.put(it)
      })
      await get().load()
    },

    applyFilter: () => {
      try {
        const { items, query, sort, filterType } = get()
        
        if (!items || !Array.isArray(items)) {
          set({ filtered: [] })
          return
        }
        
        let filtered = [...items]
        
        if (query && query.trim()) {
          filtered = filtered.filter((i) => {
            try {
              return matchesQuery(i, query)
            } catch (error) {
              return false
            }
          })
        }
        
        if (filterType !== null && filterType !== undefined) {
          filtered = filtered.filter((i) => i.type === filterType)
        }
        
        if (sort === 'updatedAt') {
          filtered = filtered.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))
        } else if (sort === 'type') {
          filtered = filtered.sort((a, b) => {
            try {
              const typeOrder = { todo: 0, memo: 1, link: 2, list: 3, date: 4 }
              const orderA = typeOrder[a.type as keyof typeof typeOrder] ?? 999
              const orderB = typeOrder[b.type as keyof typeof typeOrder] ?? 999
              return orderA - orderB
            } catch (error) {
              return 0
            }
          })
        }
        
        const ids = filtered.map((i) => i.id).filter(Boolean)
        set({ filtered: ids })
      } catch (error) {
        set({ filtered: [] })
      }
    },
  }))
)
