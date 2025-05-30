/**
 * Nostr key management utilities
 */
import type { UserKeys } from './types';
/**
 * Generate a new Nostr key pair
 */
export declare function generateKeyPair(): UserKeys;
/**
 * Derive public key from private key
 */
export declare function getPublicKeyFromPrivate(privateKey: string): string;
/**
 * Validate a key pair
 */
export declare function validateKeyPair(keys: UserKeys): boolean;
/**
 * Import private key and derive public key
 */
export declare function importPrivateKey(privateKey: string): UserKeys;
//# sourceMappingURL=keys.d.ts.map