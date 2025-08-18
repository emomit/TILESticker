import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { nanoid } from './util/nanoid'
import { db } from './db'
import type { Item, ItemType } from './types'
import { matchesQuery } from './util/search'

import { CloudFirstService } from './services/cloudFirstService'
import { validateItem, sanitizeItem } from './util/validation'
import { supabase } from './lib/supabase'

type SortKey = 'createdAt' | 'updatedAt' | 'type'

type State = {
  items: Item[]
  filtered: string[]
  selectedId?: string
  searchOpen: boolean
  query: string
  sort: SortKey
  filterType: ItemType | null
  loading: boolean
  syncing: boolean
  lastSyncTime: number
  cloudHydrated: boolean
  cloudFirst: boolean
  currentUserId?: string
}

type Actions = {
  load: () => Promise<void>
  add: (type: ItemType) => Promise<Item>
  update: (id: string, patch: Partial<Item>) => Promise<void>
  remove: (id: string, userId?: string) => Promise<void>
  removeAll: (userId?: string) => Promise<void>
  toggleDone: (id: string) => Promise<void>
  setSelected: (id?: string) => void
  setQuery: (q: string) => void
  setSearchOpen: (v: boolean) => void
  setSort: (sort: SortKey) => void
  setFilterType: (type: ItemType | null) => void
  exportJson: () => Promise<string>
  importJson: (json: string) => Promise<void>
  applyFilter: () => void
  syncToCloud: (userId: string) => Promise<void>
  syncFromCloud: (userId: string) => Promise<void>
  setupRealtimeSync: (userId: string) => () => void
  softDelete: (id: string, userId?: string) => Promise<void>
  setCloudHydrated: (v: boolean) => void
  setCloudFirst: (v: boolean) => void
  setCurrentUserId: (userId?: string) => void
  initializeCloudFirst: (userId: string) => Promise<void>
}

export const useStore = create<State & Actions>()(
  (import.meta.env?.DEV ? devtools : (fn: any) => fn)((set: any, get: any) => ({
    items: [],
    filtered: [],
    selectedId: undefined,
    searchOpen: false,
    query: '',
    sort: 'createdAt',
    filterType: null,
    loading: true,
    syncing: false,
    lastSyncTime: 0,
    cloudHydrated: false,
    cloudFirst: false,
    currentUserId: undefined,
    

    load: async () => {
      const items = await db.items.orderBy('createdAt').reverse().toArray()
      set({ items, filtered: items.map((i) => i.id), loading: false })
    },

    add: async (type: ItemType) => {
      const { cloudFirst, currentUserId } = get()
      
      if (cloudFirst && currentUserId) {
        // Cloud-first: Supabaseで追加
        const cloudService = CloudFirstService.getInstance()
        const newItem = await cloudService.addItem(type, currentUserId)
        
        if (newItem) {
          const items = [newItem, ...get().items]
          set({ items, filtered: items.map((i) => i.id) })
          return newItem
        } else {
                  // Fallback to local
        }
      }
      
      // ローカル追加（フォールバックまたはcloudFirst=false）
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
      const { cloudFirst, currentUserId } = get()
      
      if (cloudFirst && currentUserId) {
        // Cloud-first: Supabaseで更新
        const cloudService = CloudFirstService.getInstance()
        const updatedItem = await cloudService.updateItem(id, patch, currentUserId)
        
        if (updatedItem) {
          const items = get().items.map((i: Item) => (i.id === id ? updatedItem : i))
          set({ items })
          get().applyFilter()
          return
        } else {
          // 失敗時はローカルフォールバック
          console.warn('Cloud update failed, falling back to local')
        }
      }
      
      // ローカル更新（フォールバックまたはcloudFirst=false）
      try {
        const current = get().items.find((i: Item) => i.id === id)
        if (!current) return
        
        const sanitizedPatch = sanitizeItem(patch)
        const validation = validateItem({ ...current, ...sanitizedPatch })
        if (!validation.isValid) return
        
        const next: Item = { ...current, ...sanitizedPatch, updatedAt: Date.now() }
        await db.items.put(next)
        const items = get().items.map((i: Item) => (i.id === id ? next : i))
        set({ items })
        get().applyFilter()
      } catch (error) {
        console.error('Update error:', error)
      }
    },

    remove: async (id: string, userId?: string) => {
      const { cloudFirst, currentUserId } = get()
      const user = userId || currentUserId
      
      if (cloudFirst && user) {
        // Cloud-first: Supabaseで削除
        const cloudService = CloudFirstService.getInstance()
        const success = await cloudService.deleteItem(id, user)
        
        if (success) {
          const items = get().items.filter((i: Item) => i.id !== id)
          set({ items })
          get().applyFilter()
          return
        } else {
          // 失敗時はローカルフォールバック
          console.warn('Cloud delete failed, falling back to local')
        }
      }
      
      // ローカル削除（フォールバックまたはcloudFirst=false）
      try {
        const items = get().items.filter((i: Item) => i.id !== id)
        set({ items })
        get().applyFilter()
        await db.items.delete(id)
        
        // 削除後にクラウド同期（ユーザーIDがある場合）
        if (userId) {
          try {
            await get().syncToCloud(userId)
            console.log('Delete sync completed for item:', id)
          } catch (syncError) {
            console.error('Delete sync failed:', syncError)
          }
        }
      } catch (error) {
        console.error('Remove error:', error)
      }
    },

    removeAll: async (userId?: string) => {
      const { cloudFirst, currentUserId } = get()
      const user = userId || currentUserId
      
      if (cloudFirst && user) {
        // Cloud-first: 全てのアイテムを削除
        const cloudService = CloudFirstService.getInstance()
        const items = get().items
        
        for (const item of items) {
          await cloudService.deleteItem(item.id, user)
        }
        
        set({ items: [], filtered: [] })
        await db.items.clear()
        return
      }
      
      // ローカル削除（フォールバックまたはcloudFirst=false）
      try {
        set({ items: [], filtered: [] })
        await db.items.clear()
        
        // 削除後にクラウド同期（ユーザーIDがある場合）
        if (userId) {
          try {
            await get().syncToCloud(userId)
            console.log('RemoveAll sync completed')
          } catch (syncError) {
            console.error('RemoveAll sync failed:', syncError)
          }
        }
      } catch (error) {
        console.error('RemoveAll error:', error)
      }
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
        
        if (sort === 'createdAt') {
          filtered = filtered.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
        } else if (sort === 'updatedAt') {
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

    syncToCloud: async (userId: string) => {
      // Cloud-first mode only - no action needed
    },

    syncFromCloud: async (userId: string) => {
      const { cloudFirst } = get()
      if (!cloudFirst) {
        console.log('Cloud-first mode not enabled')
        return
      }
      
      console.log('Starting syncFromCloud for user:', userId)
      try {
        const { data: cloudItems, error } = await supabase
          .from('items')
          .select('*')
          .eq('user_id', userId)
          .is('deleted_at', null)
          .order('updated_at', { ascending: false })

        if (error) {
          console.error('Supabase error:', error)
          return
        }
        
        console.log('Cloud items found:', cloudItems?.length || 0)

        // 現在のローカルアイテムを取得
        const currentLocalItems = await db.items.toArray()
        const localItemIds = new Set(currentLocalItems.map(item => item.id))

        for (const cloudItem of cloudItems) {
          const localItem: Item = {
            id: cloudItem.id,
            type: cloudItem.type,
            title: cloudItem.title,
            content: cloudItem.content,
            done: cloudItem.done,
            href: cloudItem.href,
            list: cloudItem.list,
            date: cloudItem.date,
            tags: cloudItem.tags || [],
            color: cloudItem.color,
            createdAt: new Date(cloudItem.created_at).getTime(),
            updatedAt: new Date(cloudItem.updated_at).getTime(),
          }

          await db.items.put(localItem)
        }

        // クラウドに存在しないローカルアイテムを削除（削除されたアイテム）
        const cloudItemIds = new Set(cloudItems.map(item => item.id))
        for (const localItem of currentLocalItems) {
          if (!cloudItemIds.has(localItem.id)) {
            try {
              await db.items.delete(localItem.id)
            } catch (error) {
              console.error('Failed to delete local item:', localItem.id, error)
            }
          }
        }

        await get().load()
        set({ cloudHydrated: true })
        console.log('SyncFromCloud completed successfully')
      } catch (error) {
        console.error('SyncFromCloud error:', error)
      }
    },

    setupRealtimeSync: (userId: string) => {
      const { cloudFirst } = get()
      if (!cloudFirst) return () => {}
      
      const subscription = supabase
        .channel('items_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'items',
            filter: `user_id=eq.${userId}`,
          },
          async () => {
            await get().syncFromCloud(userId)
          }
        )
        .subscribe()

      return () => {
        subscription.unsubscribe()
      }
    },

    softDelete: async (id: string, userId?: string) => {
      const { cloudFirst, currentUserId } = get()
      const user = userId || currentUserId
      
      if (cloudFirst && user) {
        const cloudService = CloudFirstService.getInstance()
        const success = await cloudService.deleteItem(id, user)
        
        if (success) {
          const items = get().items.filter((i: Item) => i.id !== id)
          set({ items })
          get().applyFilter()
          // ローカルIndexedDBからも削除
          try {
            await db.items.delete(id)
          } catch (error) {
            console.error('Local delete error:', error)
          }
          return
        } else {
          console.warn('Cloud delete failed, falling back to local')
        }
      }
      
      // Local fallback
      try {
        const items = get().items.filter((i: Item) => i.id !== id)
        set({ items })
        get().applyFilter()
        await db.items.delete(id)
      } catch (error) {
        console.error('Soft delete error:', error)
      }
    },

    setCloudHydrated: (v: boolean) => set({ cloudHydrated: v }),
    setCloudFirst: (v: boolean) => set({ cloudFirst: v }),
    setCurrentUserId: (userId?: string) => set({ currentUserId: userId }),

    initializeCloudFirst: async (userId: string) => {
      console.log('Initializing cloud-first mode for user:', userId)
      const cloudService = CloudFirstService.getInstance()
      
      const isEmpty = await cloudService.isCloudEmpty(userId)
      console.log('Cloud is empty:', isEmpty)
      
      if (isEmpty) {
        console.log('Uploading local data to cloud')
        await cloudService.uploadLocalData(userId)
      }
      
      set({ cloudFirst: true, currentUserId: userId })
      console.log('Cloud-first mode initialized')
    },
  }))
)
