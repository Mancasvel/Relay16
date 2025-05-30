/**
 * Nostr key management utilities
 */

import { generateSecretKey, getPublicKey } from 'nostr-tools/pure'
import { bytesToHex, hexToBytes } from '@noble/hashes/utils'
import type { UserKeys } from './types'
import { isValidPrivateKey, isValidPublicKey } from './crypto'

/**
 * Generate a new Nostr key pair
 */
export function generateKeyPair(): UserKeys {
  const privateKeyBytes = generateSecretKey() // Returns Uint8Array
  const privateKey = bytesToHex(privateKeyBytes) // Convert to hex string
  const publicKey = getPublicKey(privateKeyBytes) // Pass Uint8Array
  
  return {
    privateKey,
    publicKey
  }
}

/**
 * Derive public key from private key
 */
export function getPublicKeyFromPrivate(privateKey: string): string {
  if (!isValidPrivateKey(privateKey)) {
    throw new Error('Invalid private key format')
  }
  
  const privateKeyBytes = hexToBytes(privateKey)
  return getPublicKey(privateKeyBytes)
}

/**
 * Validate a key pair
 */
export function validateKeyPair(keys: UserKeys): boolean {
  if (!isValidPrivateKey(keys.privateKey)) return false
  if (!isValidPublicKey(keys.publicKey)) return false
  
  // Verify that the public key matches the private key
  const privateKeyBytes = hexToBytes(keys.privateKey)
  const derivedPublicKey = getPublicKey(privateKeyBytes)
  return derivedPublicKey === keys.publicKey
}

/**
 * Import private key and derive public key
 */
export function importPrivateKey(privateKey: string): UserKeys {
  if (!isValidPrivateKey(privateKey)) {
    throw new Error('Invalid private key format')
  }
  
  const privateKeyBytes = hexToBytes(privateKey)
  const publicKey = getPublicKey(privateKeyBytes)
  
  return {
    privateKey,
    publicKey
  }
} 