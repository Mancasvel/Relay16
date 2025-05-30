/**
 * Nostr event creation and manipulation utilities
 */
import type { EventTemplate, NostrEvent } from './types';
/**
 * Create and sign a Nostr event
 */
export declare function createEvent(template: EventTemplate, privateKey: string): NostrEvent;
/**
 * Verify a Nostr event signature
 */
export declare function verifyEventSignature(event: NostrEvent): boolean;
/**
 * Create a text note event (kind 1)
 */
export declare function createTextNote(content: string, privateKey: string, tags?: string[][]): NostrEvent;
/**
 * Create a metadata event (kind 0)
 */
export declare function createMetadataEvent(metadata: Record<string, any>, privateKey: string): NostrEvent;
/**
 * Create a contacts event (kind 3)
 */
export declare function createContactsEvent(contacts: Array<{
    pubkey: string;
    relayUrl?: string;
    petname?: string;
}>, privateKey: string): NostrEvent;
/**
 * Create a reaction event (kind 7)
 */
export declare function createReactionEvent(targetEventId: string, targetAuthor: string, reaction: string, privateKey: string): NostrEvent;
/**
 * Create a delete event (kind 5)
 */
export declare function createDeleteEvent(eventIdsToDelete: string[], reason: string, privateKey: string): NostrEvent;
/**
 * Create a repost event (kind 6)
 */
export declare function createRepostEvent(originalEventId: string, originalAuthor: string, relayUrl: string, privateKey: string): NostrEvent;
/**
 * Extract mentions from event tags
 */
export declare function extractMentions(event: NostrEvent): string[];
/**
 * Extract event references from event tags
 */
export declare function extractEventReferences(event: NostrEvent): string[];
/**
 * Extract hashtags from event tags
 */
export declare function extractHashtags(event: NostrEvent): string[];
/**
 * Add hashtags to event content and tags
 */
export declare function addHashtagsToEvent(template: EventTemplate, hashtags: string[]): EventTemplate;
/**
 * Check if event is a reply
 */
export declare function isReply(event: NostrEvent): boolean;
/**
 * Check if event mentions a specific pubkey
 */
export declare function mentionsPubkey(event: NostrEvent, pubkey: string): boolean;
/**
 * Get event age in seconds
 */
export declare function getEventAge(event: NostrEvent): number;
/**
 * Check if event is recent (within specified seconds)
 */
export declare function isRecentEvent(event: NostrEvent, maxAgeSeconds?: number): boolean;
//# sourceMappingURL=events.d.ts.map