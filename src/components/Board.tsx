import { useEffect, useMemo, useState, forwardRef } from 'react'
import { useStore } from '@/store'
import { ItemCard } from './ItemCard'
import { AnimatePresence, motion } from 'framer-motion'
import type { Item } from '@/types'

export function Board() {
  const items = useStore((s) => s.items)
  const filtered = useStore((s) => s.filtered)
  const load = useStore((s) => s.load)
  const setSelected = useStore((s) => s.setSelected)
  const query = useStore((s) => s.query)
  const sort = useStore((s) => s.sort)
  const removeAll = useStore((s) => s.removeAll)
  const [isCommandPressed, setIsCommandPressed] = useState(false)

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        setIsCommandPressed(true)
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (!e.metaKey && !e.ctrlKey) {
        setIsCommandPressed(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [removeAll])

  const sortedAndFilteredItems = useMemo(() => {
    try {
      if (!items || !Array.isArray(items) || !filtered || !Array.isArray(filtered)) {
        return []
      }
      
      let result = items.filter(item => {
        try {
          return item && item.id && filtered.includes(item.id)
        } catch (error) {
          return false
        }
      })
      
      if (sort === 'createdAt') {
        result = result.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
      } else if (sort === 'type') {
        const typeOrder = { todo: 0, memo: 1, link: 2, list: 3, date: 4 }
        result = result.sort((a, b) => {
          try {
            const orderA = typeOrder[a.type as keyof typeof typeOrder] ?? 999
            const orderB = typeOrder[b.type as keyof typeof typeOrder] ?? 999
            return orderA - orderB
          } catch (error) {
            return 0
          }
        })
      }
      
      return result
    } catch (error) {
      return []
    }
  }, [items, filtered, sort])

  return (
    <Grid 
      items={sortedAndFilteredItems} 
      setSelected={setSelected} 
      query={query}
      isCommandPressed={isCommandPressed}
    />
  )
}

const ItemCardWrapper = forwardRef<HTMLDivElement, {
  item: Item;
  setSelected: (id: string) => void;
  isCommandPressed: boolean;
}>(({ item, setSelected, isCommandPressed }, ref) => {
  return (
    <motion.div
      ref={ref}
      layout
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ 
        opacity: isCommandPressed ? 0.6 : 1, 
        scale: isCommandPressed ? 0.95 : 1, 
        y: 0 
      }}
      exit={{ 
        opacity: 0, 
        scale: 0.95, 
        y: -10,
        transition: { duration: 0.15, ease: [0.2, 0.4, 0.2, 0.8] }
      }}
      transition={{ 
        duration: 0.2, ease: [0.2, 0.4, 0.2, 0.8],
        layout: { duration: 0.2, ease: [0.2, 0.4, 0.2, 0.8] }
      }}
    >
      <ItemCard 
        item={item} 
        onClick={() => setSelected(item.id)}
        isCommandPressed={isCommandPressed}
      />
    </motion.div>
  )
})

function Grid({ items, setSelected, query, isCommandPressed }: { 
  items: Item[]; 
  setSelected: (id: string) => void; 
  query: string;
  isCommandPressed: boolean;
}) {
  return (
    <div className="px-4 pb-6 no-select">
      <motion.div
        layout
        layoutId="grid"
        className="grid gap-2 md:gap-3 md:[grid-template-columns:repeat(auto-fill,minmax(220px,1fr))] grid-flow-row-dense"
        style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}
        transition={{ 
          duration: 0.2, 
          ease: [0.2, 0.4, 0.2, 0.8],
          layout: { duration: 0.2, ease: [0.2, 0.4, 0.2, 0.8] }
        }}
      >
        <AnimatePresence mode="popLayout">
          {items.map((item, index) => (
            <ItemCardWrapper
              key={item.id}
              item={item}
              setSelected={setSelected}
              isCommandPressed={isCommandPressed}
            />
          ))}
        </AnimatePresence>
      </motion.div>
      {items.length === 0 && !query && (
        <div className="mt-10 text-center opacity-70">右上「＋」でカードを追加</div>
      )}
      {query && items.length === 0 && (
        <div className="mt-10 text-center opacity-70">一致する要素がありません</div>
      )}
    </div>
  )
}
