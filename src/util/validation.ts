import type { Item } from '@/types'

export const VALIDATION_LIMITS = {
  title: 200,
  content: 20000,
  href: 2048,
  tags: 50,
  listItems: 100,
  listItemLength: 500
} as const

export function validateItem(item: Partial<Item>): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  if (item.title !== undefined) {
    if (!item.title.trim()) {
      errors.push('Title is required')
    } else if (item.title.length > VALIDATION_LIMITS.title) {
      errors.push(`Title must be ${VALIDATION_LIMITS.title} characters or less`)
    }
  }

  if (item.content !== undefined && item.content !== null) {
    if (item.content.length > VALIDATION_LIMITS.content) {
      errors.push(`Content must be ${VALIDATION_LIMITS.content} characters or less`)
    }
  }

  if (item.href !== undefined && item.href !== null) {
    if (item.href.length > VALIDATION_LIMITS.href) {
      errors.push(`URL must be ${VALIDATION_LIMITS.href} characters or less`)
    }
    if (item.href && !isValidUrl(item.href)) {
      errors.push('Please enter a valid URL')
    }
  }

  if (item.list !== undefined && item.list !== null) {
    if (item.list.length > VALIDATION_LIMITS.listItems) {
      errors.push(`List items must be ${VALIDATION_LIMITS.listItems} or less`)
    }
    for (const listItem of item.list) {
      if (listItem.length > VALIDATION_LIMITS.listItemLength) {
        errors.push(`List item must be ${VALIDATION_LIMITS.listItemLength} characters or less`)
      }
    }
  }

  if (item.tags !== undefined && item.tags !== null) {
    if (item.tags.length > VALIDATION_LIMITS.tags) {
      errors.push(`Tags must be ${VALIDATION_LIMITS.tags} or less`)
    }
    for (const tag of item.tags) {
      if (tag.length > 50) {
        errors.push('Tag must be 50 characters or less')
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

function isValidUrl(string: string): boolean {
  try {
    new URL(string)
    return true
  } catch (_) {
    return false
  }
}

export function sanitizeItem(item: Partial<Item>): Partial<Item> {
  const sanitized = { ...item }

  if (sanitized.title !== undefined) {
    sanitized.title = sanitized.title.trim()
  }

  if (sanitized.content !== undefined && sanitized.content !== null) {
    sanitized.content = sanitized.content.trim()
  }

  if (sanitized.tags !== undefined && sanitized.tags !== null) {
    sanitized.tags = sanitized.tags
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0)
      .slice(0, VALIDATION_LIMITS.tags)
  }

  if (sanitized.list !== undefined && sanitized.list !== null) {
    sanitized.list = sanitized.list
      .map(item => item.trim())
      .filter(item => item.length > 0)
      .slice(0, VALIDATION_LIMITS.listItems)
  }

  return sanitized
}
