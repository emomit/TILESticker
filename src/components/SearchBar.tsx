import { useStore } from '@/store'
import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Icon } from './ui/Icon'

export function SearchBar() {
  const open = useStore((s) => s.searchOpen)
  const setOpen = useStore((s) => s.setSearchOpen)
  const query = useStore((s) => s.query)
  const setQuery = useStore((s) => s.setQuery)
  const ref = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) setTimeout(() => ref.current?.focus(), 0)
  }, [open])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault()
        setOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [setOpen])

  return (
    <AnimatePresence mode="wait">
      {open && (
        <>
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="hidden md:block fixed right-4 top-20 z-[60]"
            transition={{ 
              duration: 0.2, 
              ease: "easeOut",
              opacity: { duration: 0.2 },
              y: { duration: 0.2 }
            }}
          >
            <div className="flex items-center gap-2 p-3 bg-[color:var(--clay-base)]/80 rounded-full shadow-lg border border-black/10 max-w-md no-select" style={{ backdropFilter: 'blur(12px) saturate(3)' }}>
              <Icon name={query.startsWith('#') ? "tag" : "search"} size={18} filled={false} />
              <input
                ref={ref}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={query.startsWith('#') ? "タグを検索" : "検索"}
                className="flex-1 transparent-input py-1 min-w-[200px]"
                aria-label="検索"
              />
              <button 
                onClick={() => setOpen(false)} 
                className="rounded-full w-8 h-8 grid place-items-center hover:brightness-105 transition-all duration-200"
              >
                <Icon name="close" size={16} filled={false} />
              </button>
            </div>
          </motion.div>

          <motion.div
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="md:hidden fixed inset-x-0 bottom-32 z-50 flex justify-center"
            transition={{ 
              duration: 0.2, 
              ease: "easeOut",
              opacity: { duration: 0.2 },
              y: { duration: 0.2 }
            }}
          >
            <div className="flex items-center gap-2 p-2.5 bg-[color:var(--clay-base)]/95 rounded-full shadow-lg border border-black/10 max-w-sm no-select" style={{ backdropFilter: 'blur(8px) saturate(3)' }}>
              <Icon name={query.startsWith('#') ? "tag" : "search"} size={18} filled={false} />
              <input
                ref={ref}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={query.startsWith('#') ? "タグを検索" : "検索"}
                className="flex-1 transparent-input py-1 min-w-[150px]"
                aria-label="検索"
              />
              <button 
                onClick={() => setOpen(false)} 
                className="rounded-full w-8 h-8 grid place-items-center hover:brightness-105 transition-all duration-200"
              >
                <Icon name="close" size={16} filled={false} />
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
