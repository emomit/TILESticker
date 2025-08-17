import { useRef } from 'react'
import type { Item } from '@/types'

type Props = {
  item: Item
  tempData: Partial<Item>
  setTempData: (data: Partial<Item>) => void
  baseColor: string
  getDarkerColor: (color: string) => string
}

export function TagEditor({ 
  item, 
  tempData, 
  setTempData, 
  baseColor, 
  getDarkerColor 
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const currentTags = tempData.tags || item.tags || []
  
  const addTag = (t: string) => {
    const tags = Array.from(new Set([...currentTags, t])).filter(Boolean)
    setTempData({ ...tempData, tags })
  }
  
  const removeTag = (t: string) => {
    const tags = currentTags.filter((x) => x !== t)
    setTempData({ ...tempData, tags })
  }
  
  return (
    <div>
      <div className="flex flex-col gap-2 sm:flex-row mb-2">
        <input ref={inputRef} className="flex-1 bg-white/50 rounded-lg p-3" placeholder="Add tag" />
        <button
          className="text-white px-3 py-2 text-sm rounded-md transition-all duration-200"
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
            const v = inputRef.current?.value?.trim()
            if (!v) return
            addTag(v)
            if (inputRef.current) inputRef.current.value = ''
          }}
        >
          追加
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {currentTags.map((t) => (
          <span key={t} className="px-2 py-1 rounded bg-black/5 text-sm">
            #{t}
            <button className="ml-1 opacity-60 hover:opacity-100" aria-label={`${t}を削除`} onClick={() => removeTag(t)}>
              ×
            </button>
          </span>
        ))}
      </div>
    </div>
  )
}
