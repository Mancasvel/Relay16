/**
 * Common utilities for Nostr operations
 */
import * as nip19 from 'nostr-tools/nip19';
/**
 * Convert timestamp to human readable format
 */
export function formatTimestamp(timestamp) {
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    if (days > 0) {
        return `${days}d ago`;
    }
    else if (hours > 0) {
        return `${hours}h ago`;
    }
    else if (minutes > 0) {
        return `${minutes}m ago`;
    }
    else {
        return `${seconds}s ago`;
    }
}
/**
 * Truncate text to specified length
 */
export function truncateText(text, maxLength = 100) {
    if (text.length <= maxLength)
        return text;
    return text.substring(0, maxLength - 3) + '...';
}
/**
 * Extract URLs from text
 */
export function extractUrls(text) {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.match(urlRegex) || [];
}
/**
 * Extract hashtags from text
 */
export function extractHashtagsFromText(text) {
    const hashtagRegex = /#(\w+)/g;
    const matches = text.match(hashtagRegex) || [];
    return matches.map(tag => tag.substring(1).toLowerCase());
}
/**
 * Extract mentions from text (npub, nprofile)
 */
export function extractMentionsFromText(text) {
    const mentionRegex = /(nostr:)?(npub1[a-z0-9]+|nprofile1[a-z0-9]+)/g;
    const matches = text.match(mentionRegex) || [];
    return matches.map(mention => {
        const cleaned = mention.replace('nostr:', '');
        try {
            const decoded = nip19.decode(cleaned);
            if (decoded.type === 'npub') {
                return decoded.data;
            }
            else if (decoded.type === 'nprofile') {
                return decoded.data.pubkey;
            }
        }
        catch (error) {
            console.warn('Failed to decode mention:', mention);
        }
        return '';
    }).filter(Boolean);
}
/**
 * Convert pubkey to npub format
 */
export function pubkeyToNpub(pubkey) {
    try {
        return nip19.npubEncode(pubkey);
    }
    catch (error) {
        console.warn('Failed to encode pubkey:', error);
        return pubkey;
    }
}
/**
 * Convert npub to pubkey format
 */
export function npubToPubkey(npub) {
    try {
        const decoded = nip19.decode(npub);
        if (decoded.type === 'npub') {
            return decoded.data;
        }
    }
    catch (error) {
        console.warn('Failed to decode npub:', error);
    }
    return npub;
}
/**
 * Convert event ID to nevent format
 */
export function eventIdToNevent(eventId, relays) {
    try {
        return nip19.neventEncode({
            id: eventId,
            relays: relays || []
        });
    }
    catch (error) {
        console.warn('Failed to encode event ID:', error);
        return eventId;
    }
}
/**
 * Convert nevent to event ID
 */
export function neventToEventId(nevent) {
    try {
        const decoded = nip19.decode(nevent);
        if (decoded.type === 'nevent') {
            return decoded.data.id;
        }
    }
    catch (error) {
        console.warn('Failed to decode nevent:', error);
    }
    return nevent;
}
/**
 * Validate hex string
 */
export function isValidHex(str, expectedLength) {
    if (typeof str !== 'string')
        return false;
    if (expectedLength && str.length !== expectedLength)
        return false;
    return /^[0-9a-fA-F]+$/.test(str);
}
/**
 * Validate Nostr event structure
 */
export function isValidEvent(event) {
    return (typeof event === 'object' &&
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
        isValidHex(event.sig, 128));
}
/**
 * Sort events by timestamp (newest first)
 */
export function sortEventsByTime(events) {
    return [...events].sort((a, b) => b.created_at - a.created_at);
}
/**
 * Remove duplicate events by ID
 */
export function deduplicateEvents(events) {
    const seen = new Set();
    return events.filter(event => {
        if (seen.has(event.id)) {
            return false;
        }
        seen.add(event.id);
        return true;
    });
}
/**
 * Filter events by kind
 */
export function filterEventsByKind(events, kinds) {
    return events.filter(event => kinds.includes(event.kind));
}
/**
 * Filter events by author
 */
export function filterEventsByAuthor(events, authors) {
    return events.filter(event => authors.includes(event.pubkey));
}
/**
 * Filter events by time range
 */
export function filterEventsByTimeRange(events, since, until) {
    return events.filter(event => {
        if (since && event.created_at < since)
            return false;
        if (until && event.created_at > until)
            return false;
        return true;
    });
}
/**
 * Generate a random string
 */
export function generateRandomString(length = 16) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}
/**
 * Debounce function
 */
export function debounce(func, wait) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}
/**
 * Throttle function
 */
export function throttle(func, limit) {
    let inThrottle;
    return (...args) => {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}
/**
 * Sleep utility
 */
export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
/**
 * Retry function with exponential backoff
 */
export async function retry(fn, maxAttempts = 3, baseDelay = 1000) {
    let lastError;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await fn();
        }
        catch (error) {
            lastError = error instanceof Error ? error : new Error(String(error));
            if (attempt === maxAttempts) {
                throw lastError;
            }
            const delay = baseDelay * Math.pow(2, attempt - 1);
            await sleep(delay);
        }
    }
    throw lastError;
}
//# sourceMappingURL=utils.js.map