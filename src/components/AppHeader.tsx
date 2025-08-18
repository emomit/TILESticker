import { useState, useRef } from 'react'
import { useStore } from '@/store'
import { motion, AnimatePresence } from 'framer-motion'
import type { ItemType } from '@/types'
import { COLORS, ICON, KEY } from '@/constants/ui'
import { Icon } from './ui/Icon'
import { useAuth } from '@/hooks/useAuth'
import { AuthModal } from './AuthModal'

export function AppHeader() {
  const add = useStore((s) => s.add)
  const setSearchOpen = useStore((s) => s.setSearchOpen)
  const setSort = useStore((s) => s.setSort)
  const setFilterType = useStore((s) => s.setFilterType)
  const sort = useStore((s) => s.sort)
  const filterType = useStore((s) => s.filterType)
  const exportJson = useStore((s) => s.exportJson)
  const importJson = useStore((s) => s.importJson)
  const [sortMenuOpen, setSortMenuOpen] = useState(false)
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const { user, signOut, signOutLocal, isAuthenticated } = useAuth()

  const handleSort = () => {
    setSortMenuOpen(!sortMenuOpen)
  }

  const handleFilter = (type: ItemType | null) => {
    const nextType = filterType === type ? null : type
    setFilterType(nextType)
    setSort(nextType === null ? 'createdAt' : 'type')
    setSortMenuOpen(false)
  }

  const handleFilterEnd = () => {
    setFilterType(null)
    setSort('createdAt')
    setSortMenuOpen(false)
  }

  const handleSortChange = () => {
    const newSort = sort === 'createdAt' ? 'type' : 'createdAt'
    setSort(newSort)
  }

  const handleLogout = async () => {
    try {
      await signOutLocal()
      if (isAuthenticated) {
        try {
          await signOut()
        } catch (e) {
          // Handle error silently
        }
      }
    } catch (err) {
      // Handle error silently
    } finally {
      setLogoutConfirmOpen(false)
    }
  }

  const handleExport = () => {
    exportJson()
  }

  const handleImport = () => {
    fileRef.current?.click()
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        if (content) {
          importJson(content)
        }
      }
      reader.readAsText(file)
    }
    event.target.value = ''
  }

  return (
    <>
      <header className="hidden md:flex fixed top-0 inset-x-0 z-[80] items-center justify-between h-16 px-4 bg-[color:var(--clay-base)]/80 backdrop-blur backdrop-saturate-200 border-b-2 border-black/5 no-select">
        <div className="flex items-center gap-3">
          <button
            className="rounded-full w-10 h-10 grid place-items-center shadow ring-2 ring-gray-400/20 hover:brightness-105 border border-black/10 text-black/80"
            style={{ background: '#ffc4f1' }}
            aria-label="ToDoを追加"
            onClick={async () => { await add('todo') }}
            title="ToDo"
          >＋</button>
          <button
            className="rounded-full w-10 h-10 grid place-items-center shadow ring-2 ring-gray-400/20 hover:brightness-105 border border-black/10 text-black/80"
            style={{ background: '#fffbb5' }}
            aria-label="メモを追加"
            onClick={async () => { await add('memo') }}
            title="Memo"
          >＋</button>
          <button
            className="rounded-full w-10 h-10 grid place-items-center shadow ring-2 ring-gray-400/20 hover:brightness-105 border border-black/10 text-black/80"
            style={{ background: '#a6e2ff' }}
            aria-label="LINKを追加"
            onClick={async () => { await add('link') }}
            title="LINK"
          >＋</button>
          <button
            className="rounded-full w-10 h-10 grid place-items-center shadow ring-2 ring-gray-400/20 hover:brightness-105 border border-black/10 text-black/80"
            style={{ background: '#dbc9ff' }}
            aria-label="LISTを追加"
            onClick={async () => { await add('list') }}
            title="LIST"
          >＋</button>
          <button
            className="rounded-full w-10 h-10 grid place-items-center shadow ring-2 ring-gray-400/20 hover:brightness-105 border border-black/10 text-black/80"
            style={{ background: '#a6ffe4' }}
            aria-label="DATEを追加"
            onClick={async () => { await add('date') }}
            title="DATE"
          >＋</button>
        </div>

        <div className="flex items-center gap-3">
          <button
            className="rounded-full w-10 h-10 grid place-items-center shadow ring-2 ring-gray-400/20 hover:brightness-105 border border-black/10 text-black/80"
            style={{ background: 'transparent' }}
            aria-label="検索"
            onClick={() => setSearchOpen(true)}
            title="検索"
          >
            <Icon name="search" size={18} filled={false} />
          </button>
          <button
            className="rounded-full w-10 h-10 grid place-items-center shadow ring-2 ring-gray-400/20 hover:brightness-105 border border-black/10 text-black/80"
            style={{ background: 'transparent' }}
            aria-label="フィルター・ソート"
            onClick={handleSort}
            title="フィルター・ソートメニューを開く"
          >
            <Icon name="menu" size={18} filled={sortMenuOpen} />
          </button>
          <button
            className="rounded-full w-10 h-10 grid place-items-center shadow ring-2 ring-gray-400/20 hover:brightness-105 border border-black/10 text-black/80"
            style={{ background: 'transparent' }}
            aria-label={user ? "ログアウト" : "ログイン"}
            onClick={user ? () => setLogoutConfirmOpen(true) : () => setAuthModalOpen(true)}
            title={user ? "ログアウト" : "ログイン"}
          >
            <Icon name={user ? "logout" : "login"} size={18} filled={false} />
          </button>
        </div>
      </header>

      {sortMenuOpen && (
        <div className="hidden md:block fixed right-4 top-20 z-[60] pointer-events-auto">
          <div className="isolate filter bg-[color:var(--clay-base)]/80 backdrop-blur-md backdrop-saturate-200 rounded-full shadow-lg border border-black/10">
            <AnimatePresence initial={false} mode="wait">
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0, transition: { duration: 0.2, ease: 'easeOut' } }}
                exit={{ opacity: 0, scale: 0.96, y: -4, transition: { duration: 0.15, ease: 'easeIn' } }}
                style={{ willChange: 'opacity, transform' }}
              >
                <div className="flex flex-col gap-2 p-3">
                  <button
                    className={`rounded-full w-10 h-10 grid place-items-center shadow ring-2 hover:brightness-105 border border-black/10 text-black/80 ${
                      sort === 'type' ? 'ring-blue-400' : 'ring-gray-400/20'
                    }`}
                    style={{ background: 'transparent' }}
                    aria-label="ソート"
                    onClick={handleSortChange}
                    title={`ソート: ${sort === 'createdAt' ? '作成順' : '種類'}`}
                  >
                    <Icon name="sort" size={18} filled={sort === 'type'} />
                  </button>
                  <button
                    className={`rounded-full w-10 h-10 grid place-items-center shadow ring-2 ring-gray-400/20 hover:brightness-105 border border-black/10 text-black/80 ${filterType === 'todo' ? 'ring-4 ring-pink-400' : ''}`}
                    style={{ background: '#ffc4f1' }}
                    onClick={() => handleFilter('todo')}
                    title="ToDoのみ表示"
                  >✓</button>
                  <button
                    className={`rounded-full w-10 h-10 grid place-items-center shadow ring-2 ring-gray-400/20 hover:brightness-105 border border-black/10 text-black/80 ${filterType === 'memo' ? 'ring-4 ring-yellow-400' : ''}`}
                    style={{ background: '#fffbb5' }}
                    onClick={() => handleFilter('memo')}
                    title="メモのみ表示"
                  >✓</button>
                  <button
                    className={`rounded-full w-10 h-10 grid place-items-center shadow ring-2 ring-gray-400/20 hover:brightness-105 border border-black/10 text-black/80 ${filterType === 'link' ? 'ring-4 ring-blue-400' : ''}`}
                    style={{ background: '#a6e2ff' }}
                    onClick={() => handleFilter('link')}
                    title="LINKのみ表示"
                  >✓</button>
                  <button
                    className={`rounded-full w-10 h-10 grid place-items-center shadow ring-2 ring-gray-400/20 hover:brightness-105 border border-black/10 text-black/80 ${filterType === 'list' ? 'ring-4 ring-purple-400' : ''}`}
                    style={{ background: '#dbc9ff' }}
                    onClick={() => handleFilter('list')}
                    title="LISTのみ表示"
                  >✓</button>
                  <button
                    className={`rounded-full w-10 h-10 grid place-items-center shadow ring-2 ring-gray-400/20 hover:brightness-105 border border-black/10 text-black/80 ${filterType === 'date' ? 'ring-4 ring-green-400' : ''}`}
                    style={{ background: '#a6ffe4' }}
                    onClick={() => handleFilter('date')}
                    title="DATEのみ表示"
                  >✓</button>
                  <button
                    className="rounded-full w-10 h-10 grid place-items-center shadow ring-2 ring-gray-400/20 hover:brightness-105 border border-black/10 text-black/80"
                    style={{ background: 'transparent' }}
                    onClick={handleFilterEnd}
                    title="フィルター終了"
                  >
                    <Icon name="close" size={18} filled={false} />
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      )}

      

      <div className="md:hidden fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
        <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 bg-[color:var(--clay-base)]/90 backdrop-blur backdrop-saturate-200 rounded-full shadow-lg border border-black/10">
          <button
            className="rounded-full w-10 h-10 sm:w-12 sm:h-12 grid place-items-center shadow ring-2 ring-gray-400/20 hover:brightness-105 border border-black/10 text-black/80"
            style={{ background: '#ffc4f1' }}
            aria-label="ToDoを追加"
            onClick={async () => { await add('todo') }}
            title="ToDo"
          >＋</button>
          <button
            className="rounded-full w-10 h-10 sm:w-12 sm:h-12 grid place-items-center shadow ring-2 ring-gray-400/20 hover:brightness-105 border border-black/10 text-black/80"
            style={{ background: '#fffbb5' }}
            aria-label="メモを追加"
            onClick={async () => { await add('memo') }}
            title="Memo"
          >＋</button>
          <button
            className="rounded-full w-10 h-10 sm:w-12 sm:h-12 grid place-items-center shadow ring-2 ring-gray-400/20 hover:brightness-105 border border-black/10 text-black/80"
            style={{ background: '#a6e2ff' }}
            aria-label="LINKを追加"
            onClick={async () => { await add('link') }}
            title="LINK"
          >＋</button>
          <button
            className="rounded-full w-10 h-10 sm:w-12 sm:h-12 grid place-items-center shadow ring-2 ring-gray-400/20 hover:brightness-105 border border-black/10 text-black/80"
            style={{ background: '#dbc9ff' }}
            aria-label="LISTを追加"
            onClick={async () => { await add('list') }}
            title="LIST"
          >＋</button>
          <button
            className="rounded-full w-10 h-10 sm:w-12 sm:h-12 grid place-items-center shadow ring-2 ring-gray-400/20 hover:brightness-105 border border-black/10 text-black/80"
            style={{ background: '#a6ffe4' }}
            aria-label="DATEを追加"
            onClick={async () => { await add('date') }}
            title="DATE"
          >＋</button>

          <button
            className="rounded-full w-10 h-10 sm:w-12 sm:h-12 grid place-items-center shadow ring-2 ring-gray-400/20 hover:brightness-105 border border-black/10 text-black/80"
            style={{ background: 'transparent' }}
            aria-label="検索"
            onClick={() => setSearchOpen(true)}
            title="検索"
          >
            <Icon name="search" size={20} filled={false} />
          </button>
          <button
            className="rounded-full w-10 h-10 sm:w-12 sm:h-12 grid place-items-center shadow ring-2 ring-gray-400/20 hover:brightness-105 border border-black/10 text-black/80"
            style={{ background: 'transparent' }}
            aria-label="フィルター"
            onClick={handleSort}
            title="フィルターメニューを開く"
          >
            <Icon name="menu" size={20} filled={sortMenuOpen} />
          </button>
        </div>
      </div>

      <div className="md:hidden fixed bottom-32 right-4 z-50 pointer-events-none">
        <div className="isolate filter bg-[color:var(--clay-base)]/95 backdrop-blur backdrop-saturate-200 rounded-full shadow-lg border border-black/10 no-select">
          <AnimatePresence initial={false} mode="wait">
            {sortMenuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 6 }}
                animate={{ opacity: 1, scale: 1, y: 0, transition: { duration: 0.2, ease: 'easeOut' } }}
                exit={{ opacity: 0, scale: 0.96, y: 6, transition: { duration: 0.15, ease: 'easeIn' } }}
                style={{ willChange: 'opacity, transform' }}
                className="pointer-events-auto"
              >
                <div className="flex flex-col gap-1.5 sm:gap-2 p-2.5 sm:p-3">
                  <button
                    className="rounded-full w-10 h-10 sm:w-12 sm:h-12 grid place-items-center shadow ring-2 ring-gray-400/20 hover:brightness-105 border border-black/10 text-black/80 mb-2"
                    style={{ background: 'transparent' }}
                    aria-label={user ? "ログアウト" : "ログイン"}
                    onClick={user ? () => setLogoutConfirmOpen(true) : () => setAuthModalOpen(true)}
                    title={user ? "ログアウト" : "ログイン"}
                  >
                    <Icon name={user ? "logout" : "login"} size={20} filled={false} />
                  </button>
                  
                  <div className="w-full h-px bg-gray-200 opacity-60 mb-2"></div>
                  
                  <button
                    className={`rounded-full w-10 h-10 sm:w-12 sm:h-12 grid place-items-center shadow ring-2 hover:brightness-105 border border-black/10 text-black/80 ${
                      sort === 'type' ? 'ring-blue-400' : 'ring-gray-400/20'
                    }`}
                    style={{ background: 'transparent' }}
                    aria-label="ソート"
                    onClick={handleSortChange}
                    title={`ソート: ${sort === 'createdAt' ? '作成順' : '種類'}`}
                  >
                    <Icon name="sort" size={20} filled={sort === 'type'} />
                  </button>
                  <button
                    className={`rounded-full w-10 h-10 sm:w-12 sm:h-12 grid place-items-center shadow ring-2 ring-gray-400/20 hover:brightness-105 border border-black/10 text-black/80 ${filterType === 'todo' ? 'ring-4 ring-pink-400' : ''}`}
                    style={{ background: '#ffc4f1' }}
                    onClick={() => handleFilter('todo')}
                    title="ToDoのみ表示"
                  >✓</button>
                  <button
                    className={`rounded-full w-10 h-10 sm:w-12 sm:h-12 grid place-items-center shadow ring-2 ring-gray-400/20 hover:brightness-105 border border-black/10 text-black/80 ${filterType === 'memo' ? 'ring-4 ring-yellow-400' : ''}`}
                    style={{ background: '#fffbb5' }}
                    onClick={() => handleFilter('memo')}
                    title="メモのみ表示"
                  >✓</button>
                  <button
                    className={`rounded-full w-10 h-10 sm:w-12 sm:h-12 grid place-items-center shadow ring-2 ring-gray-400/20 hover:brightness-105 border border-black/10 text-black/80 ${filterType === 'link' ? 'ring-4 ring-blue-400' : ''}`}
                    style={{ background: '#a6e2ff' }}
                    onClick={() => handleFilter('link')}
                    title="LINKのみ表示"
                  >✓</button>
                  <button
                    className={`rounded-full w-10 h-10 sm:w-12 sm:h-12 grid place-items-center shadow ring-2 ring-gray-400/20 hover:brightness-105 border border-black/10 text-black/80 ${filterType === 'list' ? 'ring-4 ring-purple-400' : ''}`}
                    style={{ background: '#dbc9ff' }}
                    onClick={() => handleFilter('list')}
                    title="LISTのみ表示"
                  >✓</button>
                  <button
                    className={`rounded-full w-10 h-10 sm:w-12 sm:h-12 grid place-items-center shadow ring-2 ring-gray-400/20 hover:brightness-105 border border-black/10 text-black/80 ${filterType === 'date' ? 'ring-4 ring-green-400' : ''}`}
                    style={{ background: '#a6ffe4' }}
                    onClick={() => handleFilter('date')}
                    title="DATEのみ表示"
                  >✓</button>
                  <button
                    className="rounded-full w-10 h-10 sm:w-12 sm:h-12 grid place-items-center shadow ring-2 ring-gray-400/20 hover:brightness-105 border border-black/10 text-black/80"
                    style={{ background: 'transparent' }}
                    onClick={handleFilterEnd}
                    title="フィルター終了"
                  >
                    <Icon name="close" size={20} filled={false} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
      />

      <AnimatePresence>
        {logoutConfirmOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-black/20 backdrop-blur-sm"
              onClick={() => setLogoutConfirmOpen(false)}
              aria-hidden="true"
            />
            <motion.div
              className="relative bg-[color:var(--clay-base)]/90 backdrop-blur-md backdrop-saturate-200 rounded-2xl shadow-xl border border-black/10 p-6 w-full max-w-md mx-4"
              initial={{ y: 40, scale: 0.96, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ y: 40, scale: 0.98, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <h3 className="text-lg font-semibold text-black/80 mb-4">ログアウト確認</h3>
                <p className="text-black/60 mb-6">本当にログアウトしますか？</p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => setLogoutConfirmOpen(false)}
                    className="px-4 py-2 rounded-lg bg-gray-200/80 backdrop-blur-sm text-black/70 hover:bg-gray-300/80 transition-colors"
                  >
                    キャンセル
                  </button>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 rounded-lg bg-red-500/80 backdrop-blur-sm text-white hover:bg-red-600/80 transition-colors"
                  >
                    ログアウト
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
