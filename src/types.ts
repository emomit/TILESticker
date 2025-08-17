export type ItemType = 'todo' | 'memo' | 'link' | 'list' | 'date'

export type Item = {
  id: string
  type: ItemType
  title: string
  content?: string
  done?: boolean
  href?: string
  list?: string[]
  date?: { selectedDate: string; note: string }
  tags: string[]
  color?: { base?: string; shadow?: string; highlight?: string }
  createdAt: number
  updatedAt: number
}
