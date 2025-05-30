/**
 * Secure storage utilities for Nostr keys and data
 */
import { openDB } from 'idb';
class NostrStorage {
    db = null;
    dbName = 'relay16-nostr';
    dbVersion = 1;
    /**
     * Initialize the database
     */
    async init() {
        if (this.db)
            return;
        this.db = await openDB(this.dbName, this.dbVersion, {
            upgrade(db) {
                // Keys store
                if (!db.objectStoreNames.contains('keys')) {
                    db.createObjectStore('keys');
                }
                // Profiles store
                if (!db.objectStoreNames.contains('profiles')) {
                    db.createObjectStore('profiles');
                }
                // Events store
                if (!db.objectStoreNames.contains('events')) {
                    const eventStore = db.createObjectStore('events');
                    eventStore.createIndex('relayUrl', 'relayUrl');
                    eventStore.createIndex('receivedAt', 'receivedAt');
                }
                // Settings store
                if (!db.objectStoreNames.contains('settings')) {
                    db.createObjectStore('settings');
                }
            }
        });
    }
    /**
     * Store encrypted keys
     */
    async storeKeys(keyId, encryptedKeys) {
        await this.init();
        if (!this.db)
            throw new Error('Database not initialized');
        await this.db.put('keys', encryptedKeys, keyId);
    }
    /**
     * Retrieve encrypted keys
     */
    async getKeys(keyId) {
        await this.init();
        if (!this.db)
            throw new Error('Database not initialized');
        return await this.db.get('keys', keyId);
    }
    /**
     * Delete stored keys
     */
    async deleteKeys(keyId) {
        await this.init();
        if (!this.db)
            throw new Error('Database not initialized');
        await this.db.delete('keys', keyId);
    }
    /**
     * List all stored key IDs
     */
    async listKeyIds() {
        await this.init();
        if (!this.db)
            throw new Error('Database not initialized');
        return await this.db.getAllKeys('keys');
    }
    /**
     * Store profile data
     */
    async storeProfile(pubkey, profile) {
        await this.init();
        if (!this.db)
            throw new Error('Database not initialized');
        await this.db.put('profiles', {
            pubkey,
            profile,
            lastUpdated: Date.now()
        }, pubkey);
    }
    /**
     * Retrieve profile data
     */
    async getProfile(pubkey) {
        await this.init();
        if (!this.db)
            throw new Error('Database not initialized');
        const result = await this.db.get('profiles', pubkey);
        return result?.profile;
    }
    /**
     * Store event data
     */
    async storeEvent(eventId, event, relayUrl) {
        await this.init();
        if (!this.db)
            throw new Error('Database not initialized');
        await this.db.put('events', {
            id: eventId,
            event,
            relayUrl,
            receivedAt: Date.now()
        }, eventId);
    }
    /**
     * Retrieve event data
     */
    async getEvent(eventId) {
        await this.init();
        if (!this.db)
            throw new Error('Database not initialized');
        const result = await this.db.get('events', eventId);
        return result?.event;
    }
    /**
     * Store setting
     */
    async storeSetting(key, value) {
        await this.init();
        if (!this.db)
            throw new Error('Database not initialized');
        await this.db.put('settings', value, key);
    }
    /**
     * Retrieve setting
     */
    async getSetting(key) {
        await this.init();
        if (!this.db)
            throw new Error('Database not initialized');
        return await this.db.get('settings', key);
    }
    /**
     * Clear all data
     */
    async clearAll() {
        await this.init();
        if (!this.db)
            throw new Error('Database not initialized');
        await this.db.clear('keys');
        await this.db.clear('profiles');
        await this.db.clear('events');
        await this.db.clear('settings');
    }
    /**
     * Close database connection
     */
    close() {
        if (this.db) {
            this.db.close();
            this.db = null;
        }
    }
}
// Export singleton instance
export const storage = new NostrStorage();
// Export class for custom instances
export { NostrStorage };
/**
 * Simple localStorage fallback for environments without IndexedDB
 */
export class LocalStorageAdapter {
    prefix = 'relay16-nostr:';
    getKey(store, key) {
        return `${this.prefix}${store}:${key}`;
    }
    async storeKeys(keyId, encryptedKeys) {
        localStorage.setItem(this.getKey('keys', keyId), JSON.stringify(encryptedKeys));
    }
    async getKeys(keyId) {
        const data = localStorage.getItem(this.getKey('keys', keyId));
        return data ? JSON.parse(data) : undefined;
    }
    async deleteKeys(keyId) {
        localStorage.removeItem(this.getKey('keys', keyId));
    }
    async listKeyIds() {
        const keys = [];
        const prefix = this.getKey('keys', '');
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(prefix)) {
                keys.push(key.substring(prefix.length));
            }
        }
        return keys;
    }
    async storeSetting(key, value) {
        localStorage.setItem(this.getKey('settings', key), JSON.stringify(value));
    }
    async getSetting(key) {
        const data = localStorage.getItem(this.getKey('settings', key));
        return data ? JSON.parse(data) : undefined;
    }
    async clearAll() {
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(this.prefix)) {
                keysToRemove.push(key);
            }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
    }
}
//# sourceMappingURL=storage.js.map