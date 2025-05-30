import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTimeAgo(timestamp: number): string {
  const now = Date.now() / 1000
  const diffInSeconds = now - timestamp
  
  if (diffInSeconds < 60) {
    return `${Math.floor(diffInSeconds)}s`
  } else if (diffInSeconds < 3600) {
    return `${Math.floor(diffInSeconds / 60)}m`
  } else if (diffInSeconds < 86400) {
    return `${Math.floor(diffInSeconds / 3600)}h`
  } else if (diffInSeconds < 2592000) {
    return `${Math.floor(diffInSeconds / 86400)}d`
  } else if (diffInSeconds < 31536000) {
    return `${Math.floor(diffInSeconds / 2592000)}mo`
  } else {
    return `${Math.floor(diffInSeconds / 31536000)}y`
  }
}

export function formatNumber(num: number): string {
  if (num < 1000) {
    return num.toString()
  } else if (num < 1000000) {
    return `${(num / 1000).toFixed(1)}K`
  } else if (num < 1000000000) {
    return `${(num / 1000000).toFixed(1)}M`
  } else {
    return `${(num / 1000000000).toFixed(1)}B`
  }
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + "..."
}

export function extractHashtags(text: string): string[] {
  const hashtagRegex = /#[a-zA-Z0-9_]+/g
  return text.match(hashtagRegex) || []
}

export function extractMentions(text: string): string[] {
  const mentionRegex = /@[a-zA-Z0-9_]+/g
  return text.match(mentionRegex) || []
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

export function isValidNostrPublicKey(pubkey: string): boolean {
  return /^[0-9a-f]{64}$/i.test(pubkey)
}

export function isValidRelayUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'ws:' || parsed.protocol === 'wss:'
  } catch {
    return false
  }
}

export function shortenPubkey(pubkey: string, length: number = 8): string {
  if (pubkey.length <= length * 2) return pubkey
  return `${pubkey.substring(0, length)}...${pubkey.substring(pubkey.length - length)}`
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
} 