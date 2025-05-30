/**
 * Secure storage utilities for Nostr keys and data
 */

import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { EncryptedKeys, UserKeys } from './types'

interface NostrDB extends DBSchema {
  keys: {
    key: string
    value: EncryptedKeys
  }
  profiles: {
    key: string
    value: {
      pubkey: string
      profile: any
      lastUpdated: number
    }
  }
  events: {
    key: string
    value: {
      id: string
      event: any
      relayUrl: string
      receivedAt: number
    }
    indexes: {
      'relayUrl': string
      'receivedAt': number
    }
  }
  settings: {
    key: string
    value: any
  }
}

class NostrStorage {
  private db: IDBPDatabase<NostrDB> | null = null
  private readonly dbName = 'relay16-nostr'
  private readonly dbVersion = 1

  /**
   * Initialize the database
   */
  async init(): Promise<void> {
    if (this.db) return

    this.db = await openDB<NostrDB>(this.dbName, this.dbVersion, {
      upgrade(db) {
        // Keys store
        if (!db.objectStoreNames.contains('keys')) {
          db.createObjectStore('keys')
        }

        // Profiles store
        if (!db.objectStoreNames.contains('profiles')) {
          db.createObjectStore('profiles')
        }

        // Events store
        if (!db.objectStoreNames.contains('events')) {
          const eventStore = db.createObjectStore('events')
          eventStore.createIndex('relayUrl', 'relayUrl')
          eventStore.createIndex('receivedAt', 'receivedAt')
        }

        // Settings store
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings')
        }
      }
    })
  }

  /**
   * Store encrypted keys
   */
  async storeKeys(keyId: string, encryptedKeys: EncryptedKeys): Promise<void> {
    await this.init()
    if (!this.db) throw new Error('Database not initialized')
    
    await this.db.put('keys', encryptedKeys, keyId)
  }

  /**
   * Retrieve encrypted keys
   */
  async getKeys(keyId: string): Promise<EncryptedKeys | undefined> {
    await this.init()
    if (!this.db) throw new Error('Database not initialized')
    
    return await this.db.get('keys', keyId)
  }

  /**
   * Delete stored keys
   */
  async deleteKeys(keyId: string): Promise<void> {
    await this.init()
    if (!this.db) throw new Error('Database not initialized')
    
    await this.db.delete('keys', keyId)
  }

  /**
   * List all stored key IDs
   */
  async listKeyIds(): Promise<string[]> {
    await this.init()
    if (!this.db) throw new Error('Database not initialized')
    
    return await this.db.getAllKeys('keys') as string[]
  }

  /**
   * Store profile data
   */
  async storeProfile(pubkey: string, profile: any): Promise<void> {
    await this.init()
    if (!this.db) throw new Error('Database not initialized')
    
    await this.db.put('profiles', {
      pubkey,
      profile,
      lastUpdated: Date.now()
    }, pubkey)
  }

  /**
   * Retrieve profile data
   */
  async getProfile(pubkey: string): Promise<any | undefined> {
    await this.init()
    if (!this.db) throw new Error('Database not initialized')
    
    const result = await this.db.get('profiles', pubkey)
    return result?.profile
  }

  /**
   * Store event data
   */
  async storeEvent(eventId: string, event: any, relayUrl: string): Promise<void> {
    await this.init()
    if (!this.db) throw new Error('Database not initialized')
    
    await this.db.put('events', {
      id: eventId,
      event,
      relayUrl,
      receivedAt: Date.now()
    }, eventId)
  }

  /**
   * Retrieve event data
   */
  async getEvent(eventId: string): Promise<any | undefined> {
    await this.init()
    if (!this.db) throw new Error('Database not initialized')
    
    const result = await this.db.get('events', eventId)
    return result?.event
  }

  /**
   * Store setting
   */
  async storeSetting(key: string, value: any): Promise<void> {
    await this.init()
    if (!this.db) throw new Error('Database not initialized')
    
    await this.db.put('settings', value, key)
  }

  /**
   * Retrieve setting
   */
  async getSetting(key: string): Promise<any | undefined> {
    await this.init()
    if (!this.db) throw new Error('Database not initialized')
    
    return await this.db.get('settings', key)
  }

  /**
   * Clear all data
   */
  async clearAll(): Promise<void> {
    await this.init()
    if (!this.db) throw new Error('Database not initialized')
    
    await this.db.clear('keys')
    await this.db.clear('profiles')
    await this.db.clear('events')
    await this.db.clear('settings')
  }

  /**
   * Close database connection
   */
  close(): void {
    if (this.db) {
      this.db.close()
      this.db = null
    }
  }
}

// Export singleton instance
export const storage = new NostrStorage()

// Export class for custom instances
export { NostrStorage }

/**
 * Simple localStorage fallback for environments without IndexedDB
 */
export class LocalStorageAdapter {
  private prefix = 'relay16-nostr:'

  private getKey(store: string, key: string): string {
    return `${this.prefix}${store}:${key}`
  }

  async storeKeys(keyId: string, encryptedKeys: EncryptedKeys): Promise<void> {
    localStorage.setItem(
      this.getKey('keys', keyId),
      JSON.stringify(encryptedKeys)
    )
  }

  async getKeys(keyId: string): Promise<EncryptedKeys | undefined> {
    const data = localStorage.getItem(this.getKey('keys', keyId))
    return data ? JSON.parse(data) : undefined
  }

  async deleteKeys(keyId: string): Promise<void> {
    localStorage.removeItem(this.getKey('keys', keyId))
  }

  async listKeyIds(): Promise<string[]> {
    const keys: string[] = []
    const prefix = this.getKey('keys', '')
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(prefix)) {
        keys.push(key.substring(prefix.length))
      }
    }
    
    return keys
  }

  async storeSetting(key: string, value: any): Promise<void> {
    localStorage.setItem(
      this.getKey('settings', key),
      JSON.stringify(value)
    )
  }

  async getSetting(key: string): Promise<any | undefined> {
    const data = localStorage.getItem(this.getKey('settings', key))
    return data ? JSON.parse(data) : undefined
  }

  async clearAll(): Promise<void> {
    const keysToRemove: string[] = []
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(this.prefix)) {
        keysToRemove.push(key)
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key))
  }
} 