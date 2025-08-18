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
  const cloudFirst = useStore((s) => s.cloudFirst)

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
    } else if (!user && !authLoading) {
      setCurrentUserId(undefined)
    }
    return undefined
  }, [user, authLoading, initializeCloudFirst, setCurrentUserId])

  useEffect(() => {
    if (user && cloudFirst) {
      syncFromCloud(user.id)
      const unsubscribe = setupRealtimeSync(user.id)
      
      return () => {
        unsubscribe()
      }
    }
    return undefined
  }, [user, cloudFirst, syncFromCloud, setupRealtimeSync])

  useEffect(() => {
    if (user && cloudFirst) {
      const id = setInterval(() => {
        syncFromCloud(user.id)
      }, 5000)
      return () => clearInterval(id)
    }
    return undefined
  }, [user, cloudFirst, syncFromCloud])

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
