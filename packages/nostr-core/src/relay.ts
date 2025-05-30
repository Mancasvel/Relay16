/**
 * Relay connection and management utilities
 */

import { SimplePool } from 'nostr-tools/pool'
import type { Filter, Event } from 'nostr-tools'
import type { 
  RelayConnection, 
  SubscriptionConfig, 
  EnhancedNostrEvent,
  NostrEvent 
} from './types'

export class RelayManager {
  private pool: SimplePool
  private connections: Map<string, RelayConnection> = new Map()
  private subscriptions: Map<string, any> = new Map()

  constructor() {
    this.pool = new SimplePool()
  }

  /**
   * Add a relay to the connection pool
   */
  async addRelay(url: string, options: { read?: boolean; write?: boolean } = {}): Promise<void> {
    const connection: RelayConnection = {
      url,
      status: 'connecting',
      read: options.read ?? true,
      write: options.write ?? true
    }

    this.connections.set(url, connection)

    try {
      // SimplePool handles connections automatically
      connection.status = 'connected'
      connection.lastConnected = Date.now()
    } catch (error) {
      connection.status = 'error'
      connection.error = error instanceof Error ? error.message : 'Unknown error'
    }

    this.connections.set(url, connection)
  }

  /**
   * Remove a relay from the connection pool
   */
  removeRelay(url: string): void {
    this.connections.delete(url)
  }

  /**
   * Get all relay connections
   */
  getConnections(): RelayConnection[] {
    return Array.from(this.connections.values())
  }

  /**
   * Get connected relays for reading
   */
  getReadRelays(): string[] {
    return Array.from(this.connections.values())
      .filter(conn => conn.status === 'connected' && conn.read)
      .map(conn => conn.url)
  }

  /**
   * Get connected relays for writing
   */
  getWriteRelays(): string[] {
    return Array.from(this.connections.values())
      .filter(conn => conn.status === 'connected' && conn.write)
      .map(conn => conn.url)
  }

  /**
   * Subscribe to events from relays
   */
  subscribe(
    subscriptionId: string,
    config: SubscriptionConfig,
    onEvent: (event: EnhancedNostrEvent) => void,
    onEose?: () => void
  ): void {
    const relays = config.relayUrls || this.getReadRelays()
    
    if (relays.length === 0) {
      throw new Error('No relays available for subscription')
    }

    const sub = this.pool.subscribeMany(
      relays,
      config.filters as Filter[],
      {
        onevent: (event: Event) => {
          const enhancedEvent: EnhancedNostrEvent = {
            ...event,
            verified: true, // SimplePool verifies by default
            receivedAt: Date.now()
          }
          onEvent(enhancedEvent)
        },
        oneose: onEose
      }
    )

    this.subscriptions.set(subscriptionId, sub)
  }

  /**
   * Unsubscribe from events
   */
  unsubscribe(subscriptionId: string): void {
    const sub = this.subscriptions.get(subscriptionId)
    if (sub) {
      sub.close()
      this.subscriptions.delete(subscriptionId)
    }
  }

  /**
   * Publish an event to relays
   */
  async publish(event: NostrEvent, relayUrls?: string[]): Promise<void> {
    const relays = relayUrls || this.getWriteRelays()
    
    if (relays.length === 0) {
      throw new Error('No relays available for publishing')
    }

    const promises = this.pool.publish(relays, event)
    await Promise.allSettled(promises)
  }

  /**
   * Get a single event by filter
   */
  async getEvent(
    filter: Filter,
    relayUrls?: string[]
  ): Promise<EnhancedNostrEvent | null> {
    const relays = relayUrls || this.getReadRelays()
    
    if (relays.length === 0) {
      return null
    }

    const event = await this.pool.get(relays, filter)
    
    if (!event) return null

    return {
      ...event,
      verified: true,
      receivedAt: Date.now()
    }
  }

  /**
   * Close all connections and cleanup
   */
  close(): void {
    // Close all subscriptions
    for (const sub of this.subscriptions.values()) {
      sub.close()
    }
    this.subscriptions.clear()

    // Close the pool
    this.pool.close(Array.from(this.connections.keys()))
    
    // Clear connections
    this.connections.clear()
  }

  /**
   * Get relay information
   */
  async getRelayInfo(url: string): Promise<any> {
    try {
      const response = await fetch(url.replace('wss://', 'https://').replace('ws://', 'http://'), {
        headers: {
          'Accept': 'application/nostr+json'
        }
      })
      
      if (response.ok) {
        return await response.json()
      }
    } catch (error) {
      console.warn(`Failed to get relay info for ${url}:`, error)
    }
    
    return null
  }
} 