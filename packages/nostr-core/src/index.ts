// Main exports for @relay16/nostr-core
export * from './crypto'
export * from './relay'
export * from './events'
export * from './keys'
export * from './storage'
export * from './types'
export * from './utils'

// Re-export commonly used nostr-tools functions with correct API
export {
  getEventHash,
  verifyEvent,
  finalizeEvent,
  generateSecretKey,
  getPublicKey
} from 'nostr-tools/pure'

export {
  SimplePool
} from 'nostr-tools/pool'

export * as nip19 from 'nostr-tools/nip19' 