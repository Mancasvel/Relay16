// Enhanced Nostr types for Relay16
import { Event as NostrEvent, UnsignedEvent } from 'nostr-tools'

export interface RelayConnection {
  url: string
  status: 'connected' | 'connecting' | 'disconnected' | 'error'
  read: boolean
  write: boolean
  lastConnected?: number
  error?: string
}

export interface NostrProfile {
  name?: string
  display_name?: string
  about?: string
  picture?: string
  banner?: string
  website?: string
  nip05?: string
  lud16?: string
  lud06?: string
}

export interface EnhancedNostrEvent extends NostrEvent {
  // Add computed fields
  verified?: boolean
  relayUrl?: string
  receivedAt?: number
}

export interface UserKeys {
  privateKey: string
  publicKey: string
}

export interface EncryptedKeys {
  encryptedPrivateKey: string
  publicKey: string
  salt: string
  iv: string
}

export interface NostrFilter {
  ids?: string[]
  authors?: string[]
  kinds?: number[]
  since?: number
  until?: number
  limit?: number
  '#e'?: string[]
  '#p'?: string[]
  '#t'?: string[]
  search?: string
}

export interface SubscriptionConfig {
  filters: NostrFilter[]
  relayUrls?: string[]
  timeout?: number
  maxEvents?: number
}

export interface EventTemplate {
  kind: number
  content: string
  tags: string[][]
  created_at?: number
}

// Nostr Kind constants
export const NostrKinds = {
  METADATA: 0,
  TEXT_NOTE: 1,
  RECOMMEND_RELAY: 2,
  CONTACTS: 3,
  ENCRYPTED_DIRECT_MESSAGE: 4,
  DELETE: 5,
  REACTION: 7,
  BADGE_AWARD: 8,
  CHANNEL_CREATION: 40,
  CHANNEL_METADATA: 41,
  CHANNEL_MESSAGE: 42,
  CHANNEL_HIDE_MESSAGE: 43,
  CHANNEL_MUTE_USER: 44,
  REPORTING: 1984,
  ZAP_REQUEST: 9734,
  ZAP: 9735,
  RELAY_LIST_METADATA: 10002,
  CLIENT_AUTHENTICATION: 22242,
  WALLET_INFO: 13194,
  WALLET_REQUEST: 23194,
  WALLET_RESPONSE: 23195,
  NWC_INFO: 13194,
  NWC_REQUEST: 23194,
  NWC_RESPONSE: 23195,
  HTTP_AUTH: 27235,
  // DVMCP kinds
  DVMCP_REQUEST: 5050,
  DVMCP_RESPONSE: 5051,
  DVMCP_FEEDBACK: 7000
} as const

export type NostrKind = typeof NostrKinds[keyof typeof NostrKinds]

export interface RelayPolicy {
  payment_required?: boolean
  restricted_writes?: boolean
  created_at_lower_limit?: number
  created_at_upper_limit?: number
  kind_whitelist?: number[]
  kind_blacklist?: number[]
}

export interface RelayInformation {
  name?: string
  description?: string
  pubkey?: string
  contact?: string
  supported_nips?: number[]
  software?: string
  version?: string
  limitation?: RelayPolicy
  relay_countries?: string[]
  language_tags?: string[]
  tags?: string[]
  posting_policy?: string
  payments_url?: string
  fees?: Record<string, number>
  icon?: string
}

export type { NostrEvent, UnsignedEvent } 