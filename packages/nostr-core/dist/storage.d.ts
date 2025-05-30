/**
 * Secure storage utilities for Nostr keys and data
 */
import type { EncryptedKeys } from './types';
declare class NostrStorage {
    private db;
    private readonly dbName;
    private readonly dbVersion;
    /**
     * Initialize the database
     */
    init(): Promise<void>;
    /**
     * Store encrypted keys
     */
    storeKeys(keyId: string, encryptedKeys: EncryptedKeys): Promise<void>;
    /**
     * Retrieve encrypted keys
     */
    getKeys(keyId: string): Promise<EncryptedKeys | undefined>;
    /**
     * Delete stored keys
     */
    deleteKeys(keyId: string): Promise<void>;
    /**
     * List all stored key IDs
     */
    listKeyIds(): Promise<string[]>;
    /**
     * Store profile data
     */
    storeProfile(pubkey: string, profile: any): Promise<void>;
    /**
     * Retrieve profile data
     */
    getProfile(pubkey: string): Promise<any | undefined>;
    /**
     * Store event data
     */
    storeEvent(eventId: string, event: any, relayUrl: string): Promise<void>;
    /**
     * Retrieve event data
     */
    getEvent(eventId: string): Promise<any | undefined>;
    /**
     * Store setting
     */
    storeSetting(key: string, value: any): Promise<void>;
    /**
     * Retrieve setting
     */
    getSetting(key: string): Promise<any | undefined>;
    /**
     * Clear all data
     */
    clearAll(): Promise<void>;
    /**
     * Close database connection
     */
    close(): void;
}
export declare const storage: NostrStorage;
export { NostrStorage };
/**
 * Simple localStorage fallback for environments without IndexedDB
 */
export declare class LocalStorageAdapter {
    private prefix;
    private getKey;
    storeKeys(keyId: string, encryptedKeys: EncryptedKeys): Promise<void>;
    getKeys(keyId: string): Promise<EncryptedKeys | undefined>;
    deleteKeys(keyId: string): Promise<void>;
    listKeyIds(): Promise<string[]>;
    storeSetting(key: string, value: any): Promise<void>;
    getSetting(key: string): Promise<any | undefined>;
    clearAll(): Promise<void>;
}
//# sourceMappingURL=storage.d.ts.map