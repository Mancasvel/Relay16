/**
 * Common utilities for Nostr operations
 */

import * as nip19 from 'nostr-tools/nip19'
import type { NostrEvent } from './types'

/**
 * Convert timestamp to human readable format
 */
export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp * 1000)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  
  if (days > 0) {
    return `${days}d ago`
  } else if (hours > 0) {
    return `${hours}h ago`
  } else if (minutes > 0) {
    return `${minutes}m ago`
  } else {
    return `${seconds}s ago`
  }
}

/**
 * Truncate text to specified length
 */
export function truncateText(text: string, maxLength: number = 100): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength - 3) + '...'
}

/**
 * Extract URLs from text
 */
export function extractUrls(text: string): string[] {
  const urlRegex = /(https?:\/\/[^\s]+)/g
  return text.match(urlRegex) || []
}

/**
 * Extract hashtags from text
 */
export function extractHashtagsFromText(text: string): string[] {
  const hashtagRegex = /#(\w+)/g
  const matches = text.match(hashtagRegex) || []
  return matches.map(tag => tag.substring(1).toLowerCase())
}

/**
 * Extract mentions from text (npub, nprofile)
 */
export function extractMentionsFromText(text: string): string[] {
  const mentionRegex = /(nostr:)?(npub1[a-z0-9]+|nprofile1[a-z0-9]+)/g
  const matches = text.match(mentionRegex) || []
  
  return matches.map(mention => {
    const cleaned = mention.replace('nostr:', '')
    try {
      const decoded = nip19.decode(cleaned)
      if (decoded.type === 'npub') {
        return decoded.data as string
      } else if (decoded.type === 'nprofile') {
        return (decoded.data as any).pubkey
      }
    } catch (error) {
      console.warn('Failed to decode mention:', mention)
    }
    return ''
  }).filter(Boolean)
}

/**
 * Convert pubkey to npub format
 */
export function pubkeyToNpub(pubkey: string): string {
  try {
    return nip19.npubEncode(pubkey)
  } catch (error) {
    console.warn('Failed to encode pubkey:', error)
    return pubkey
  }
}

/**
 * Convert npub to pubkey format
 */
export function npubToPubkey(npub: string): string {
  try {
    const decoded = nip19.decode(npub)
    if (decoded.type === 'npub') {
      return decoded.data as string
    }
  } catch (error) {
    console.warn('Failed to decode npub:', error)
  }
  return npub
}

/**
 * Convert event ID to nevent format
 */
export function eventIdToNevent(eventId: string, relays?: string[]): string {
  try {
    return nip19.neventEncode({
      id: eventId,
      relays: relays || []
    })
  } catch (error) {
    console.warn('Failed to encode event ID:', error)
    return eventId
  }
}

/**
 * Convert nevent to event ID
 */
export function neventToEventId(nevent: string): string {
  try {
    const decoded = nip19.decode(nevent)
    if (decoded.type === 'nevent') {
      return (decoded.data as any).id
    }
  } catch (error) {
    console.warn('Failed to decode nevent:', error)
  }
  return nevent
}

/**
 * Validate hex string
 */
export function isValidHex(str: string, expectedLength?: number): boolean {
  if (typeof str !== 'string') return false
  if (expectedLength && str.length !== expectedLength) return false
  return /^[0-9a-fA-F]+$/.test(str)
}

/**
 * Validate Nostr event structure
 */
export function isValidEvent(event: any): event is NostrEvent {
  return (
    typeof event === 'object' &&
    event !== null &&
    typeof event.id === 'string' &&
    typeof event.pubkey === 'string' &&
    typeof event.created_at === 'number' &&
    typeof event.kind === 'number' &&
    typeof event.content === 'string' &&
    Array.isArray(event.tags) &&
    typeof event.sig === 'string' &&
    isValidHex(event.id, 64) &&
    isValidHex(event.pubkey, 64) &&
    isValidHex(event.sig, 128)
  )
}

/**
 * Sort events by timestamp (newest first)
 */
export function sortEventsByTime(events: NostrEvent[]): NostrEvent[] {
  return [...events].sort((a, b) => b.created_at - a.created_at)
}

/**
 * Remove duplicate events by ID
 */
export function deduplicateEvents(events: NostrEvent[]): NostrEvent[] {
  const seen = new Set<string>()
  return events.filter(event => {
    if (seen.has(event.id)) {
      return false
    }
    seen.add(event.id)
    return true
  })
}

/**
 * Filter events by kind
 */
export function filterEventsByKind(events: NostrEvent[], kinds: number[]): NostrEvent[] {
  return events.filter(event => kinds.includes(event.kind))
}

/**
 * Filter events by author
 */
export function filterEventsByAuthor(events: NostrEvent[], authors: string[]): NostrEvent[] {
  return events.filter(event => authors.includes(event.pubkey))
}

/**
 * Filter events by time range
 */
export function filterEventsByTimeRange(
  events: NostrEvent[], 
  since?: number, 
  until?: number
): NostrEvent[] {
  return events.filter(event => {
    if (since && event.created_at < since) return false
    if (until && event.created_at > until) return false
    return true
  })
}

/**
 * Generate a random string
 */
export function generateRandomString(length: number = 16): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

/**
 * Sleep utility
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Retry function with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      
      if (attempt === maxAttempts) {
        throw lastError
      }
      
      const delay = baseDelay * Math.pow(2, attempt - 1)
      await sleep(delay)
    }
  }
  
  throw lastError!
} 