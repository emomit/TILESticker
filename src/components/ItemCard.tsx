import { motion } from 'framer-motion'
import type { Item } from '@/types'
import clsx from 'clsx'
import { useStore } from '@/store'
import { MiniCalendar } from './MiniCalendar'
import { useState, useEffect } from 'react'
import { COLORS } from '@/constants/ui'
import { useAuth } from '@/hooks/useAuth'

type Props = { item: Item; onClick: () => void; isCommandPressed?: boolean }

export function ItemCard({ item, onClick, isCommandPressed = false }: Props) {
  const baseColor =
    item.color?.base ??
    (item.type === 'todo'
      ? COLORS.todo
      : item.type === 'memo'
      ? COLORS.memo
      : item.type === 'link'
      ? COLORS.link
      : item.type === 'list'
      ? COLORS.list
      : COLORS.date)
  const selectedId = useStore((s) => s.selectedId)
  const isSelected = selectedId === item.id
  const remove = useStore((s) => s.remove)
  const [isLocalCommandPressed, setIsLocalCommandPressed] = useState(false)
  const { user } = useAuth()

  const handleLinkClick = (e: React.MouseEvent) => {
    if (item.type === 'link' && item.href) {
      e.stopPropagation()
      window.open(item.href, '_blank')
    }
  }

  const toggleDone = useStore((s) => s.toggleDone)
  
  const handleTodoToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    toggleDone(item.id)
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        setIsLocalCommandPressed(true)
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (!e.metaKey && !e.ctrlKey) {
        setIsLocalCommandPressed(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  const handleClick = (e: React.MouseEvent | React.TouchEvent) => {
    if (isLocalCommandPressed) {
      e.preventDefault()
      e.stopPropagation()
      remove(item.id, user?.id)
      return
    }
    onClick()
  }

  return (
    <motion.div
      role="button"
      tabIndex={0}
      layoutId={`card-${item.id}`}
      data-card-id={item.id}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleClick(e as any)
        }
      }}
      className={clsx(
        'clay relative p-3 sm:p-4 text-left w-full h-32 sm:h-36 flex flex-col min-w-0 no-select'
      )}
      style={{ 
        ['--clay-base' as any]: baseColor, 
        borderRadius: 16, 
        zIndex: isSelected ? 60 : 1,
        cursor: isLocalCommandPressed ? 'pointer' : 'default'
      }}
      aria-selected={isSelected}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ 
        duration: 0.15,
        ease: [0.2, 0.4, 0.2, 0.8]
      }}
    >
      <div className="text-xs absolute left-3 top-3 px-2 py-0.5 rounded-full bg-white/40 border-white/10 border border-opacity-50">{item.type.toUpperCase()}</div>
      
      <div className="mt-6 font-medium pr-6 truncate">{item.title || '(無題)'}</div>
      
      {item.type === 'memo' && (
        <div className="text-xs opacity-70 mt-2 min-w-0" style={{
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}>
          {item.content || ''}
        </div>
      )}
      
      <div className={clsx(
        "flex-1 flex flex-col min-h-0 min-w-0",
        item.type === 'list' ? "justify-start" : "justify-end"
      )}>
        <div className="min-w-0">
        {item.type === 'todo' && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleTodoToggle}
              aria-pressed={item.done}
              aria-label="完了切替"
              className={clsx(
                'rounded-md w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center text-sm transition-colors cursor-pointer flex-shrink-0',
                item.done 
                  ? 'bg-pink-600 text-white' 
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              )}
            >
              {item.done ? '✓' : ''}
            </button>
            <div className="text-xs opacity-70 truncate whitespace-nowrap min-w-0 flex-1">{item.content || ''}</div>
          </div>
        )}
        
        {item.type === 'list' && (
          <div className="text-xs opacity-70 min-w-0">
            {item.list && item.list.length > 0 ? (
              <div className="space-y-0.5">
                {item.list.length <= 2 ? (
                  <div className="min-w-0">
                    {item.list.map((listItem, index) => (
                      <div key={index} className="truncate whitespace-nowrap min-w-0">• {listItem}</div>
                    ))}
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <div className="flex-1 min-w-0">
                      {item.list.slice(0, 2).map((listItem, index) => (
                        <div key={index} className="truncate whitespace-nowrap min-w-0">• {listItem}</div>
                      ))}
                    </div>
                    <div className="flex-1 min-w-0">
                      {item.list.length >= 3 && (
                        <div className="truncate whitespace-nowrap min-w-0">• {item.list[2]}</div>
                      )}
                      {item.list.length === 4 && (
                        <div className="truncate whitespace-nowrap min-w-0">• {item.list[3]}</div>
                      )}
                      {item.list.length > 4 && (
                        <div className="opacity-50">+{item.list.length - 3} more</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="truncate whitespace-nowrap min-w-0">リスト項目を追加してください</div>
            )}
          </div>
        )}
        
        {item.type === 'link' && (
          <div 
            className="text-xs opacity-70 truncate whitespace-nowrap min-w-0 cursor-pointer hover:underline"
            onClick={handleLinkClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleLinkClick(e as any)
              }
            }}
          >
            {item.href || ''}
          </div>
        )}
        
        {item.type === 'date' && (
          <div className="text-xs opacity-70 min-w-0">
            <div className="truncate whitespace-nowrap min-w-0">
              Date: {item.date?.selectedDate || 'DATE'}
            </div>
            <div className="truncate whitespace-nowrap min-w-0">
              Note: {item.date?.note || ''}
            </div>
          </div>
        )}
        </div>
      </div>
      
      <div className="mt-2 text-xs opacity-70 flex gap-1 flex-nowrap min-h-[20px] min-w-0 overflow-hidden">
        {(() => {
          const tags = item.tags || []
          const maxChars = 25
          
          const sortedTags = [...tags].sort((a, b) => a.length - b.length)
          
          let currentLength = 0
          const displayedTags: string[] = []
          
          for (const tag of sortedTags) {
            const tagText = `#${tag}`
            const newLength = currentLength + (displayedTags.length > 0 ? 1 : 0) + tagText.length
            
            if (newLength <= maxChars) {
              displayedTags.push(tag)
              currentLength = newLength
            } else {
              break
            }
          }
          
          return (
            <>
              {displayedTags.map((t) => (
                <span key={t} className="px-1.5 py-0.5 rounded bg-black/5 truncate flex-shrink-0 whitespace-nowrap">#{t}</span>
              ))}
              {displayedTags.length < tags.length && (
                <span className="px-1.5 py-0.5 rounded bg-black/5 opacity-50 flex-shrink-0 whitespace-nowrap">
                  +{tags.length - displayedTags.length}
                </span>
              )}
            </>
          )
        })()}
      </div>
    </motion.div>
  )
}
