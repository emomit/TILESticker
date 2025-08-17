import { AppHeader } from './components/AppHeader'
import { SearchBar } from './components/SearchBar'
import { Board } from './components/Board'
import { ItemEditorModal } from './components/ItemEditorModal'
import { Splash } from './components/Splash'
import { LayoutGroup } from 'framer-motion'
import { useStore } from './store'

export function App() {
  const selectedId = useStore((s) => s.selectedId)
  const items = useStore((s) => s.items)
  const selectedItem = items.find((i) => i.id === selectedId)

  return (
    <LayoutGroup>
      <div className="h-screen flex flex-col overflow-hidden">
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
