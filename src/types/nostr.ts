export interface NostrEvent {
  id: string;
  pubkey: string;
  created_at: number;
  kind: number;
  tags: string[][];
  content: string;
  sig: string;
}

export interface NostrFilter {
  ids?: string[];
  authors?: string[];
  kinds?: number[];
  since?: number;
  until?: number;
  limit?: number;
  search?: string;
  '#e'?: string[];
  '#p'?: string[];
}

export interface NostrRelay {
  url: string;
  read: boolean;
  write: boolean;
  connected: boolean;
}

export interface UserProfile {
  pubkey: string;
  name?: string;
  display_name?: string;
  about?: string;
  picture?: string;
  banner?: string;
  website?: string;
  nip05?: string;
  lud06?: string;
  lud16?: string;
}

export interface ContactList {
  pubkey: string;
  contacts: string[];
  relays: Record<string, { read: boolean; write: boolean }>;
}

export interface NostrNote {
  id: string;
  pubkey: string;
  content: string;
  created_at: number;
  tags: string[][];
  replies: string[];
  mentions: string[];
  reactions: Record<string, number>;
  reposted_by?: string[];
  profile?: UserProfile;
}

export enum NostrKind {
  METADATA = 0,
  TEXT_NOTE = 1,
  RECOMMEND_RELAY = 2,
  CONTACTS = 3,
  ENCRYPTED_DIRECT_MESSAGE = 4,
  DELETE = 5,
  REPOST = 6,
  REACTION = 7,
  CHANNEL_CREATION = 40,
  CHANNEL_METADATA = 41,
  CHANNEL_MESSAGE = 42,
  CHANNEL_HIDE_MESSAGE = 43,
  CHANNEL_MUTE_USER = 44,
  ZAP_REQUEST = 9734,
  ZAP = 9735,
  RELAY_LIST_METADATA = 10002,
}

export interface NostrEventWithProfile extends NostrEvent {
  profile?: UserProfile;
  replyTo?: NostrEvent;
  rootEvent?: NostrEvent;
} 