import { describe, it, expect } from 'vitest'
import { matchesQuery, isValidUrl } from '@/util/search'

const item = {
  id: '1',
  type: 'memo' as const,
  title: '開発メモ React Zustand',
  content: 'Dexie と Framer Motion を使う',
  tags: ['react', 'dexie', 'typescript'],
  createdAt: 0,
  updatedAt: 0,
}

const itemWithTags = {
  id: '2',
  type: 'todo' as const,
  title: 'テストタスク',
  content: 'テストを書く',
  tags: ['test', 'unit-test'],
  createdAt: 0,
  updatedAt: 0,
}

const itemWithoutTags = {
  id: '3',
  type: 'link' as const,
  title: 'リンク',
  content: 'リンクの説明',
  tags: [],
  createdAt: 0,
  updatedAt: 0,
}

describe('search utils', () => {
  describe('matchesQuery', () => {
    it('matches tokens across fields (case insensitive)', () => {
      expect(matchesQuery(item, 'React')).toBe(true)
      expect(matchesQuery(item, 'react')).toBe(true)
      expect(matchesQuery(item, 'REACT')).toBe(true)
      expect(matchesQuery(item, 'dex')).toBe(true)
      expect(matchesQuery(item, 'framer')).toBe(true)
      expect(matchesQuery(item, 'nextjs')).toBe(false)
    })

    it('handles empty query', () => {
      expect(matchesQuery(item, '')).toBe(true)
      expect(matchesQuery(item, '   ')).toBe(true)
    })

    it('handles partial matches', () => {
      expect(matchesQuery(item, 'motion')).toBe(true)
      expect(matchesQuery(item, 'zust')).toBe(true)
      expect(matchesQuery(item, 'dex')).toBe(true)
    })

    it('handles tag-only search with #', () => {
      expect(matchesQuery(itemWithTags, '#test')).toBe(true)
      expect(matchesQuery(itemWithTags, '#unit')).toBe(true)
      expect(matchesQuery(itemWithTags, '#nonexistent')).toBe(false)
      expect(matchesQuery(itemWithoutTags, '#any')).toBe(false)
    })

    it('handles # only query', () => {
      expect(matchesQuery(itemWithTags, '#')).toBe(true)
      expect(matchesQuery(itemWithoutTags, '#')).toBe(false)
    })

    it('handles mixed tag and content search', () => {
      expect(matchesQuery(itemWithTags, 'test')).toBe(true)
      expect(matchesQuery(itemWithTags, '#test')).toBe(true)
      expect(matchesQuery(itemWithTags, 'nonexistent')).toBe(false)
    })
  })

  describe('isValidUrl', () => {
    it('accepts http and https', () => {
      expect(isValidUrl('https://example.com')).toBe(true)
      expect(isValidUrl('http://example.com')).toBe(true)
      expect(isValidUrl('https://www.example.com')).toBe(true)
    })

    it('rejects invalid schemes', () => {
      expect(isValidUrl('ftp://example.com')).toBe(false)
      expect(isValidUrl('javascript:alert(1)')).toBe(false)
      expect(isValidUrl('file:///path/to/file')).toBe(false)
    })

    it('handles complex URLs', () => {
      expect(isValidUrl('https://sub.example.com/path?query=value#fragment')).toBe(true)
      expect(isValidUrl('https://example.co.uk')).toBe(true)
      expect(isValidUrl('https://example.com:8080')).toBe(true)
    })

    it('rejects non-URLs', () => {
      expect(isValidUrl('not a url')).toBe(false)
      expect(isValidUrl('example.com')).toBe(false)
      expect(isValidUrl('')).toBe(false)
    })
  })
})

