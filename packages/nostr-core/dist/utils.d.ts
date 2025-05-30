/**
 * Common utilities for Nostr operations
 */
import type { NostrEvent } from './types';
/**
 * Convert timestamp to human readable format
 */
export declare function formatTimestamp(timestamp: number): string;
/**
 * Truncate text to specified length
 */
export declare function truncateText(text: string, maxLength?: number): string;
/**
 * Extract URLs from text
 */
export declare function extractUrls(text: string): string[];
/**
 * Extract hashtags from text
 */
export declare function extractHashtagsFromText(text: string): string[];
/**
 * Extract mentions from text (npub, nprofile)
 */
export declare function extractMentionsFromText(text: string): string[];
/**
 * Convert pubkey to npub format
 */
export declare function pubkeyToNpub(pubkey: string): string;
/**
 * Convert npub to pubkey format
 */
export declare function npubToPubkey(npub: string): string;
/**
 * Convert event ID to nevent format
 */
export declare function eventIdToNevent(eventId: string, relays?: string[]): string;
/**
 * Convert nevent to event ID
 */
export declare function neventToEventId(nevent: string): string;
/**
 * Validate hex string
 */
export declare function isValidHex(str: string, expectedLength?: number): boolean;
/**
 * Validate Nostr event structure
 */
export declare function isValidEvent(event: any): event is NostrEvent;
/**
 * Sort events by timestamp (newest first)
 */
export declare function sortEventsByTime(events: NostrEvent[]): NostrEvent[];
/**
 * Remove duplicate events by ID
 */
export declare function deduplicateEvents(events: NostrEvent[]): NostrEvent[];
/**
 * Filter events by kind
 */
export declare function filterEventsByKind(events: NostrEvent[], kinds: number[]): NostrEvent[];
/**
 * Filter events by author
 */
export declare function filterEventsByAuthor(events: NostrEvent[], authors: string[]): NostrEvent[];
/**
 * Filter events by time range
 */
export declare function filterEventsByTimeRange(events: NostrEvent[], since?: number, until?: number): NostrEvent[];
/**
 * Generate a random string
 */
export declare function generateRandomString(length?: number): string;
/**
 * Debounce function
 */
export declare function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void;
/**
 * Throttle function
 */
export declare function throttle<T extends (...args: any[]) => any>(func: T, limit: number): (...args: Parameters<T>) => void;
/**
 * Sleep utility
 */
export declare function sleep(ms: number): Promise<void>;
/**
 * Retry function with exponential backoff
 */
export declare function retry<T>(fn: () => Promise<T>, maxAttempts?: number, baseDelay?: number): Promise<T>;
//# sourceMappingURL=utils.d.ts.map