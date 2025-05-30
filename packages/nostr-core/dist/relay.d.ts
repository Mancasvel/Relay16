/**
 * Relay connection and management utilities
 */
import type { Filter } from 'nostr-tools';
import type { RelayConnection, SubscriptionConfig, EnhancedNostrEvent, NostrEvent } from './types';
export declare class RelayManager {
    private pool;
    private connections;
    private subscriptions;
    constructor();
    /**
     * Add a relay to the connection pool
     */
    addRelay(url: string, options?: {
        read?: boolean;
        write?: boolean;
    }): Promise<void>;
    /**
     * Remove a relay from the connection pool
     */
    removeRelay(url: string): void;
    /**
     * Get all relay connections
     */
    getConnections(): RelayConnection[];
    /**
     * Get connected relays for reading
     */
    getReadRelays(): string[];
    /**
     * Get connected relays for writing
     */
    getWriteRelays(): string[];
    /**
     * Subscribe to events from relays
     */
    subscribe(subscriptionId: string, config: SubscriptionConfig, onEvent: (event: EnhancedNostrEvent) => void, onEose?: () => void): void;
    /**
     * Unsubscribe from events
     */
    unsubscribe(subscriptionId: string): void;
    /**
     * Publish an event to relays
     */
    publish(event: NostrEvent, relayUrls?: string[]): Promise<void>;
    /**
     * Get a single event by filter
     */
    getEvent(filter: Filter, relayUrls?: string[]): Promise<EnhancedNostrEvent | null>;
    /**
     * Close all connections and cleanup
     */
    close(): void;
    /**
     * Get relay information
     */
    getRelayInfo(url: string): Promise<any>;
}
//# sourceMappingURL=relay.d.ts.map