/**
 * Secure cryptographic operations for Nostr keys
 * Uses WebCrypto API for secure key storage and operations
 */

import type { UserKeys, EncryptedKeys } from './types'

// WebCrypto constants
const ALGORITHM = 'AES-GCM'
const KEY_LENGTH = 256
const IV_LENGTH = 12
const SALT_LENGTH = 16

/**
 * Generate a random salt for key derivation
 */
export function generateSalt(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(SALT_LENGTH))
}

/**
 * Generate a random IV for encryption
 */
export function generateIV(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(IV_LENGTH))
}

/**
 * Derive an encryption key from a password using PBKDF2
 */
export async function deriveKey(
  password: string,
  salt: Uint8Array,
  iterations: number = 100000
): Promise<CryptoKey> {
  const encoder = new TextEncoder()
  const passwordBuffer = encoder.encode(password)
  
  const importedKey = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    'PBKDF2',
    false,
    ['deriveKey']
  )
  
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations,
      hash: 'SHA-256'
    },
    importedKey,
    {
      name: ALGORITHM,
      length: KEY_LENGTH
    },
    false,
    ['encrypt', 'decrypt']
  )
}

/**
 * Encrypt a private key with a password
 */
export async function encryptPrivateKey(
  privateKey: string,
  password: string
): Promise<EncryptedKeys> {
  const salt = generateSalt()
  const iv = generateIV()
  const key = await deriveKey(password, salt)
  
  const encoder = new TextEncoder()
  const privateKeyBuffer = encoder.encode(privateKey)
  
  const encryptedBuffer = await crypto.subtle.encrypt(
    {
      name: ALGORITHM,
      iv
    },
    key,
    privateKeyBuffer
  )
  
  // Convert to base64 for storage
  const encryptedPrivateKey = btoa(String.fromCharCode(...new Uint8Array(encryptedBuffer)))
  const saltBase64 = btoa(String.fromCharCode(...salt))
  const ivBase64 = btoa(String.fromCharCode(...iv))
  
  // Extract public key (this would come from the keys parameter in real usage)
  // For now, we'll assume it's provided separately
  return {
    encryptedPrivateKey,
    publicKey: '', // This should be passed in or derived
    salt: saltBase64,
    iv: ivBase64
  }
}

/**
 * Decrypt a private key with a password
 */
export async function decryptPrivateKey(
  encryptedKeys: EncryptedKeys,
  password: string
): Promise<string> {
  // Convert from base64
  const encryptedBuffer = Uint8Array.from(
    atob(encryptedKeys.encryptedPrivateKey),
    c => c.charCodeAt(0)
  )
  const salt = Uint8Array.from(
    atob(encryptedKeys.salt),
    c => c.charCodeAt(0)
  )
  const iv = Uint8Array.from(
    atob(encryptedKeys.iv),
    c => c.charCodeAt(0)
  )
  
  const key = await deriveKey(password, salt)
  
  const decryptedBuffer = await crypto.subtle.decrypt(
    {
      name: ALGORITHM,
      iv
    },
    key,
    encryptedBuffer
  )
  
  const decoder = new TextDecoder()
  return decoder.decode(decryptedBuffer)
}

/**
 * Validate if a string is a valid hex private key
 */
export function isValidPrivateKey(key: string): boolean {
  if (typeof key !== 'string') return false
  if (key.length !== 64) return false
  return /^[0-9a-fA-F]{64}$/.test(key)
}

/**
 * Validate if a string is a valid hex public key
 */
export function isValidPublicKey(key: string): boolean {
  if (typeof key !== 'string') return false
  if (key.length !== 64) return false
  return /^[0-9a-fA-F]{64}$/.test(key)
}

/**
 * Generate a secure random hex string
 */
export function generateRandomHex(length: number): string {
  const bytes = crypto.getRandomValues(new Uint8Array(length / 2))
  return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('')
}

/**
 * Constant-time string comparison to prevent timing attacks
 */
export function constantTimeStringEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  
  let equal = 0
  for (let i = 0; i < a.length; i++) {
    equal |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  
  return equal === 0
}

/**
 * Secure memory clearing (best effort)
 * Note: JavaScript doesn't have true secure memory clearing,
 * but this helps reduce the window of exposure
 */
export function secureWipe(obj: any): void {
  if (typeof obj === 'string') {
    // Strings are immutable in JS, but we can overwrite references
    obj = '\0'.repeat(obj.length)
  } else if (typeof obj === 'object' && obj !== null) {
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        obj[key] = '\0'.repeat(obj[key].length)
      }
      delete obj[key]
    }
  }
} 