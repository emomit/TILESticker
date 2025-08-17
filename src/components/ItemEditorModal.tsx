import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '@/store'
import type { Item } from '@/types'
import { isValidUrl } from '@/util/search'
import { TagEditor } from './TagEditor'
import clsx from 'clsx'

type Props = { item?: Item }

export function ItemEditorModal({ item }: Props) {
  const [visible, setVisible] = useState(false)
  const [tempData, setTempData] = useState<Partial<Item>>({})
  const tempDataRef = useRef<Partial<Item>>({})
  const titleRef = useRef<HTMLInputElement>(null)
  const selectedId = useStore((s) => s.selectedId)
  const update = useStore((s) => s.update)
  const setSelected = useStore((s) => s.setSelected)
  const id = selectedId

  const setTempDataWithRef = (data: Partial<Item>) => {
    setTempData(data)
    tempDataRef.current = data
  }

  useEffect(() => {
    if (id) {
      const prev = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      setVisible(true)
      setTempData({})
      tempDataRef.current = {}
      setTimeout(() => titleRef.current?.focus(), 0)
      const onKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          document.body.style.overflow = ''
          if (Object.keys(tempDataRef.current).length > 0) {
            update(id, tempDataRef.current)
          }
          setSelected(undefined)
        }
      }
      window.addEventListener('keydown', onKey)
      return () => {
        document.body.style.overflow = prev
        window.removeEventListener('keydown', onKey)
      }
    }
    return undefined
  }, [id, setSelected])

  if (!id || !item) return null

  const displayItem = { ...item, ...tempData }

  const baseColor =
    item.color?.base ??
    (item.type === 'todo'
      ? '#ffc4f1'
      : item.type === 'memo'
      ? '#fffbb5'
      : item.type === 'link'
      ? '#a6e2ff'
      : item.type === 'list'
      ? '#dbc9ff'
      : '#a6ffe4')

  const getDarkerColor = (baseColor: string) => {
    const colorMap: { [key: string]: string } = {
      '#ffc4f1': '#e91e63',
      '#fffbb5': '#ff9800',
      '#a6e2ff': '#2196f3',
      '#dbc9ff': '#9c27b0',
      '#a6ffe4': '#4caf50'
    }
    return colorMap[baseColor] || '#666666'
  }

  const body = (
    <>
      {item && visible && (
        <style>{`
          [data-card-id="${item.id}"] {
            opacity: 0 !important;
            pointer-events: none !important;
          }
        `}</style>
      )}
      <AnimatePresence onExitComplete={() => setSelected(undefined)}>
        {item && visible && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
                      <div
              className="absolute inset-0 bg-black/30 backdrop-blur-md z-0"
              onClick={() => {
                if (Object.keys(tempData).length > 0) {
                  update(item.id, tempData)
                }
                setVisible(false)
              }}
              aria-hidden="true"
            />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="editor-title"
            layoutId={`card-${item.id}`}
            initial={{ y: 40, scale: 0.96, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1, transition: { type: 'spring', stiffness: 140, damping: 15, mass: 0.6 } }}
            exit={{ y: 40, scale: 0.98, opacity: 1 }}
            className="relative z-60 clay rounded-2xl w-[min(760px,92vw)] max-h-[80vh] overflow-hidden backdrop-blur-sm"
            style={{ ['--clay-base' as any]: baseColor, borderRadius: 20, zIndex: 60 }}
          >
            <div className="p-5">
              <input
                ref={titleRef}
                id="editor-title"
                className="w-full text-lg font-medium bg-white/50 rounded-lg p-3"
                placeholder="Title"
                value={displayItem.title}
                onChange={(e) => setTempDataWithRef({ ...tempData, title: e.target.value })}
              />
            </div>
            <div className="p-5 grid grid-cols-2 gap-6">
              <div>
                {item.type === 'todo' && (
                  <label className="flex items-center gap-2">
                    <div
                      className={clsx(
                        'rounded-md w-5 h-5 flex items-center justify-center text-xs transition-colors cursor-pointer',
                        displayItem.done 
                          ? 'bg-pink-600 text-white' 
                          : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                      )}
                      onClick={() => setTempDataWithRef({ ...tempData, done: !displayItem.done })}
                    >
                      {displayItem.done ? '✓' : ''}
                    </div>
                    <span>完了</span>
                  </label>
                )}
                {item.type === 'memo' && (
                  <textarea
                    className="w-full h-48 resize-y bg-white/50 rounded-lg p-3"
                    placeholder="Content"
                    value={displayItem.content ?? ''}
                    onChange={(e) => setTempDataWithRef({ ...tempData, content: e.target.value })}
                  />
                )}
                {item.type === 'link' && (
                  <div className="flex flex-col gap-2">
                    <input
                      className="w-full bg-white/80 rounded-lg p-3"
                      placeholder="URL (https://example.com)"
                      value={displayItem.href ?? ''}
                      onChange={(e) => setTempDataWithRef({ ...tempData, href: e.target.value })}
                      aria-invalid={displayItem.href ? !isValidUrl(displayItem.href) : false}
                    />
                    {displayItem.href && !isValidUrl(displayItem.href) && (
                      <div className="text-xs text-red-600">URLが不正です</div>
                    )}
                    {displayItem.href && isValidUrl(displayItem.href) && (
                      <a className="text-sm underline" href={displayItem.href} target="_blank" rel="noreferrer noopener">
                        開く ↗
                      </a>
                    )}
                  </div>
                )}
                {item.type === 'list' && (
                  <div className="flex flex-col gap-2">
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {(displayItem.list || ['']).map((listItem: string, index: number) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="flex-1 relative">
                            <input
                              className="w-full bg-white/50 rounded-lg p-2 pr-8 text-sm"
                              placeholder="List item"
                              value={listItem}
                              onChange={(e) => {
                                const newList = [...(displayItem.list || [''])]
                                newList[index] = e.target.value
                                setTempDataWithRef({ ...tempData, list: newList })
                              }}
                            />
                            {(displayItem.list || ['']).length > 1 && (
                              <button
                                type="button"
                                className="absolute right-1 top-1/2 -translate-y-1/2 text-white text-xs w-6 h-6 rounded transition-all duration-200 flex items-center justify-center"
                                style={{ 
                                  backgroundColor: getDarkerColor(baseColor),
                                  filter: 'brightness(1)'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.filter = 'brightness(1.2)'
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.filter = 'brightness(1)'
                                }}
                                onClick={() => {
                                  const newList = [...(displayItem.list || [''])]
                                  newList.splice(index, 1)
                                  setTempDataWithRef({ ...tempData, list: newList })
                                }}
                              >
                                ×
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      className="text-white text-sm rounded-md p-2 mt-2 transition-all duration-200"
                      style={{ 
                        backgroundColor: getDarkerColor(baseColor),
                        filter: 'brightness(1)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.filter = 'brightness(1.2)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.filter = 'brightness(1)'
                      }}
                      onClick={() => {
                        const newList = [...(displayItem.list || ['']), '']
                        setTempDataWithRef({ ...tempData, list: newList })
                      }}
                    >
                      + 項目を追加
                    </button>
                  </div>
                )}
                {item.type === 'date' && (
                  <div className="flex flex-col gap-2">
                    <input
                      type="date"
                      className="w-full bg-white/50 rounded-lg p-2"
                      value={displayItem.date?.selectedDate ?? ''}
                      onChange={(e) => setTempDataWithRef({ 
                        ...tempData,
                        date: { 
                          selectedDate: e.target.value,
                          note: displayItem.date?.note || ''
                        } 
                      })}
                    />
                    <textarea
                      className="w-full h-20 resize-y bg-white/50 rounded-lg p-2"
                      placeholder="Note"
                      value={displayItem.date?.note ?? ''}
                      onChange={(e) => setTempDataWithRef({ 
                        ...tempData,
                        date: { 
                          selectedDate: displayItem.date?.selectedDate || '',
                          note: e.target.value
                        } 
                      })}
                    />
                  </div>
                )}
              </div>
              <div>
                <TagEditor 
                  item={displayItem} 
                  tempData={tempData} 
                  setTempData={setTempDataWithRef} 
                  baseColor={baseColor}
                  getDarkerColor={getDarkerColor}
                />
              </div>
            </div>
            <div className="p-5 flex gap-2 justify-end">
              <button
                type="button"
                className="text-white px-4 py-2 rounded-md transition-all duration-200"
                style={{ 
                  backgroundColor: '#ef4444',
                  filter: 'brightness(1)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.filter = 'brightness(1.2)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.filter = 'brightness(1)'
                }}
                onClick={() => {
                  document.body.style.overflow = ''
                  useStore.getState().remove(item.id)
                }}
              >
                削除
              </button>
              <button
                type="button"
                className="text-white px-4 py-2 rounded-md transition-all duration-200"
                style={{ 
                  backgroundColor: '#6b7280',
                  filter: 'brightness(1)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.filter = 'brightness(1.2)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.filter = 'brightness(1)'
                }}
                onClick={() => {
                  document.body.style.overflow = ''
                  if (Object.keys(tempData).length > 0) {
                    update(item.id, tempData)
                  }
                  setSelected(undefined)
                }}
              >
                閉じる
              </button>
            </div>
          </motion.div>
        </motion.div>
        )}
      </AnimatePresence>
    </>
  )

  return body
}
