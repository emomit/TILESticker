import { useEffect } from 'react'
import { LayoutGroup } from 'framer-motion'
import { useStore } from './store'
import { useAuth } from './hooks/useAuth'
import { AppHeader } from './components/AppHeader'
import { SearchBar } from './components/SearchBar'
import { Board } from './components/Board'
import { ItemEditorModal } from './components/ItemEditorModal'
import { Splash } from './components/Splash'

export default function App() {
  const { user, loading: authLoading } = useAuth()

  const selectedId = useStore((s) => s.selectedId)
  const items = useStore((s) => s.items)
  const cloudHydrated = useStore((s) => s.cloudHydrated)

  const load = useStore((s) => s.load)
  const syncToCloud = useStore((s) => s.syncToCloud)
  const syncFromCloud = useStore((s) => s.syncFromCloud)
  const setupRealtimeSync = useStore((s) => s.setupRealtimeSync)
  const initializeCloudFirst = useStore((s) => s.initializeCloudFirst)
  const setCurrentUserId = useStore((s) => s.setCurrentUserId)

  const selectedItem = items.find((i) => i.id === selectedId)

  // 初期ロード
  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    if (user && !authLoading) {
      setCurrentUserId(user.id)
      initializeCloudFirst(user.id)
      syncFromCloud(user.id)
      const unsubscribe = setupRealtimeSync(user.id)
      
      return () => {
        unsubscribe()
      }
    } else if (!user && !authLoading) {
      setCurrentUserId(undefined)
    }
    return undefined
  }, [user, authLoading, syncFromCloud, setupRealtimeSync, initializeCloudFirst, setCurrentUserId])

  useEffect(() => {
    const { cloudFirst } = useStore.getState()
    if (user && cloudHydrated && !cloudFirst) {
      const t = setTimeout(() => {
        syncToCloud(user.id)
      }, 1000)
      return () => clearTimeout(t)
    }
    return undefined
  }, [user, cloudHydrated, useStore.getState().items, syncToCloud])

  useEffect(() => {
    if (user && cloudHydrated) {
      const id = setInterval(() => {
        syncFromCloud(user.id)
      }, 5000)
      return () => clearInterval(id)
    }
    return undefined
  }, [user, cloudHydrated, syncFromCloud])

  return (
    <LayoutGroup>
      <div className="h-screen flex flex-col overflow-hidden bg-[color:var(--clay-base)]/10">
        <Splash onDone={() => {}} />
        <AppHeader />
        <div className="pt-16 flex-1 overflow-auto">
          <SearchBar />
          <Board />
        </div>
        <ItemEditorModal item={selectedItem} />
      </div>
    </LayoutGroup>
  )
}
