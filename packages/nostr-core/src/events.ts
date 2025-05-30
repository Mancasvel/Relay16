/**
 * Nostr event creation and manipulation utilities
 */

import { finalizeEvent, verifyEvent } from 'nostr-tools/pure'
import { hexToBytes } from '@noble/hashes/utils'
import type { EventTemplate, NostrEvent, NostrKind } from './types'

/**
 * Create and sign a Nostr event
 */
export function createEvent(
  template: EventTemplate,
  privateKey: string
): NostrEvent {
  const privateKeyBytes = hexToBytes(privateKey)
  
  const eventTemplate = {
    kind: template.kind,
    content: template.content,
    tags: template.tags,
    created_at: template.created_at || Math.floor(Date.now() / 1000)
  }
  
  return finalizeEvent(eventTemplate, privateKeyBytes)
}

/**
 * Verify a Nostr event signature
 */
export function verifyEventSignature(event: NostrEvent): boolean {
  return verifyEvent(event)
}

/**
 * Create a text note event (kind 1)
 */
export function createTextNote(
  content: string,
  privateKey: string,
  tags: string[][] = []
): NostrEvent {
  return createEvent({
    kind: 1,
    content,
    tags
  }, privateKey)
}

/**
 * Create a metadata event (kind 0)
 */
export function createMetadataEvent(
  metadata: Record<string, any>,
  privateKey: string
): NostrEvent {
  return createEvent({
    kind: 0,
    content: JSON.stringify(metadata),
    tags: []
  }, privateKey)
}

/**
 * Create a contacts event (kind 3)
 */
export function createContactsEvent(
  contacts: Array<{ pubkey: string; relayUrl?: string; petname?: string }>,
  privateKey: string
): NostrEvent {
  const tags = contacts.map(contact => {
    const tag = ['p', contact.pubkey]
    if (contact.relayUrl) tag.push(contact.relayUrl)
    if (contact.petname) tag.push(contact.petname)
    return tag
  })

  return createEvent({
    kind: 3,
    content: '',
    tags
  }, privateKey)
}

/**
 * Create a reaction event (kind 7)
 */
export function createReactionEvent(
  targetEventId: string,
  targetAuthor: string,
  reaction: string,
  privateKey: string
): NostrEvent {
  return createEvent({
    kind: 7,
    content: reaction,
    tags: [
      ['e', targetEventId],
      ['p', targetAuthor]
    ]
  }, privateKey)
}

/**
 * Create a delete event (kind 5)
 */
export function createDeleteEvent(
  eventIdsToDelete: string[],
  reason: string,
  privateKey: string
): NostrEvent {
  const tags = eventIdsToDelete.map(id => ['e', id])
  
  return createEvent({
    kind: 5,
    content: reason,
    tags
  }, privateKey)
}

/**
 * Create a repost event (kind 6)
 */
export function createRepostEvent(
  originalEventId: string,
  originalAuthor: string,
  relayUrl: string,
  privateKey: string
): NostrEvent {
  return createEvent({
    kind: 6,
    content: '',
    tags: [
      ['e', originalEventId, relayUrl],
      ['p', originalAuthor]
    ]
  }, privateKey)
}

/**
 * Extract mentions from event tags
 */
export function extractMentions(event: NostrEvent): string[] {
  return event.tags
    .filter(tag => tag[0] === 'p' && tag[1])
    .map(tag => tag[1])
}

/**
 * Extract event references from event tags
 */
export function extractEventReferences(event: NostrEvent): string[] {
  return event.tags
    .filter(tag => tag[0] === 'e' && tag[1])
    .map(tag => tag[1])
}

/**
 * Extract hashtags from event tags
 */
export function extractHashtags(event: NostrEvent): string[] {
  return event.tags
    .filter(tag => tag[0] === 't' && tag[1])
    .map(tag => tag[1])
}

/**
 * Add hashtags to event content and tags
 */
export function addHashtagsToEvent(
  template: EventTemplate,
  hashtags: string[]
): EventTemplate {
  const hashtagTags = hashtags.map(tag => ['t', tag.toLowerCase().replace('#', '')])
  
  return {
    ...template,
    tags: [...template.tags, ...hashtagTags]
  }
}

/**
 * Check if event is a reply
 */
export function isReply(event: NostrEvent): boolean {
  return event.tags.some(tag => tag[0] === 'e')
}

/**
 * Check if event mentions a specific pubkey
 */
export function mentionsPubkey(event: NostrEvent, pubkey: string): boolean {
  return event.tags.some(tag => tag[0] === 'p' && tag[1] === pubkey)
}

/**
 * Get event age in seconds
 */
export function getEventAge(event: NostrEvent): number {
  return Math.floor(Date.now() / 1000) - event.created_at
}

/**
 * Check if event is recent (within specified seconds)
 */
export function isRecentEvent(event: NostrEvent, maxAgeSeconds: number = 3600): boolean {
  return getEventAge(event) <= maxAgeSeconds
} 