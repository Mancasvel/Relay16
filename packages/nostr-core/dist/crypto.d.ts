/**
 * Secure cryptographic operations for Nostr keys
 * Uses WebCrypto API for secure key storage and operations
 */
import type { EncryptedKeys } from './types';
/**
 * Generate a random salt for key derivation
 */
export declare function generateSalt(): Uint8Array;
/**
 * Generate a random IV for encryption
 */
export declare function generateIV(): Uint8Array;
/**
 * Derive an encryption key from a password using PBKDF2
 */
export declare function deriveKey(password: string, salt: Uint8Array, iterations?: number): Promise<CryptoKey>;
/**
 * Encrypt a private key with a password
 */
export declare function encryptPrivateKey(privateKey: string, password: string): Promise<EncryptedKeys>;
/**
 * Decrypt a private key with a password
 */
export declare function decryptPrivateKey(encryptedKeys: EncryptedKeys, password: string): Promise<string>;
/**
 * Validate if a string is a valid hex private key
 */
export declare function isValidPrivateKey(key: string): boolean;
/**
 * Validate if a string is a valid hex public key
 */
export declare function isValidPublicKey(key: string): boolean;
/**
 * Generate a secure random hex string
 */
export declare function generateRandomHex(length: number): string;
/**
 * Constant-time string comparison to prevent timing attacks
 */
export declare function constantTimeStringEqual(a: string, b: string): boolean;
/**
 * Secure memory clearing (best effort)
 * Note: JavaScript doesn't have true secure memory clearing,
 * but this helps reduce the window of exposure
 */
export declare function secureWipe(obj: any): void;
//# sourceMappingURL=crypto.d.ts.map