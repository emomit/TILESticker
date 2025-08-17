import Dexie, { Table } from 'dexie'
import type { Item } from './types'

export class ClayDB extends Dexie {
  items!: Table<Item, string>
  constructor() {
    super('tilesticker')
    this.version(1).stores({
      items: 'id, title, updatedAt, *tags, content',
    })
  }
}

export const db = new ClayDB()

