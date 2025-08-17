import type { Item } from '@/types'

const tokenize = (q: string) => q.toLowerCase().trim().split(/[\s,]+/).filter(Boolean)

export function matchesQuery(item: Item, q: string) {
  const tokens = tokenize(q)
  if (!tokens.length) return true
  
  if (q.startsWith('#')) {
    const tagQuery = q.slice(1).toLowerCase().trim()
    
    if (!item.tags || item.tags.length === 0) return false
    
    if (!tagQuery) return true
    
    const itemTags = item.tags.map(tag => tag.toLowerCase())
    return itemTags.some(tag => tag.includes(tagQuery))
  }
  
  const hay = (
    [item.title, item.content ?? '', item.href ?? '', ...(item.tags || [])]
      .join(' ') 
      .toLowerCase()
  )
  return tokens.every((t) => hay.includes(t))
}

export function isValidUrl(url: string) {
  try {
    const u = new URL(url)
    return ['http:', 'https:'].includes(u.protocol)
  } catch {
    return false
  }
}

