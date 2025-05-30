import { Event as NostrEvent, UnsignedEvent } from 'nostr-tools';
export interface RelayConnection {
    url: string;
    status: 'connected' | 'connecting' | 'disconnected' | 'error';
    read: boolean;
    write: boolean;
    lastConnected?: number;
    error?: string;
}
export interface NostrProfile {
    name?: string;
    display_name?: string;
    about?: string;
    picture?: string;
    banner?: string;
    website?: string;
    nip05?: string;
    lud16?: string;
    lud06?: string;
}
export interface EnhancedNostrEvent extends NostrEvent {
    verified?: boolean;
    relayUrl?: string;
    receivedAt?: number;
}
export interface UserKeys {
    privateKey: string;
    publicKey: string;
}
export interface EncryptedKeys {
    encryptedPrivateKey: string;
    publicKey: string;
    salt: string;
    iv: string;
}
export interface NostrFilter {
    ids?: string[];
    authors?: string[];
    kinds?: number[];
    since?: number;
    until?: number;
    limit?: number;
    '#e'?: string[];
    '#p'?: string[];
    '#t'?: string[];
    search?: string;
}
export interface SubscriptionConfig {
    filters: NostrFilter[];
    relayUrls?: string[];
    timeout?: number;
    maxEvents?: number;
}
export interface EventTemplate {
    kind: number;
    content: string;
    tags: string[][];
    created_at?: number;
}
export declare const NostrKinds: {
    readonly METADATA: 0;
    readonly TEXT_NOTE: 1;
    readonly RECOMMEND_RELAY: 2;
    readonly CONTACTS: 3;
    readonly ENCRYPTED_DIRECT_MESSAGE: 4;
    readonly DELETE: 5;
    readonly REACTION: 7;
    readonly BADGE_AWARD: 8;
    readonly CHANNEL_CREATION: 40;
    readonly CHANNEL_METADATA: 41;
    readonly CHANNEL_MESSAGE: 42;
    readonly CHANNEL_HIDE_MESSAGE: 43;
    readonly CHANNEL_MUTE_USER: 44;
    readonly REPORTING: 1984;
    readonly ZAP_REQUEST: 9734;
    readonly ZAP: 9735;
    readonly RELAY_LIST_METADATA: 10002;
    readonly CLIENT_AUTHENTICATION: 22242;
    readonly WALLET_INFO: 13194;
    readonly WALLET_REQUEST: 23194;
    readonly WALLET_RESPONSE: 23195;
    readonly NWC_INFO: 13194;
    readonly NWC_REQUEST: 23194;
    readonly NWC_RESPONSE: 23195;
    readonly HTTP_AUTH: 27235;
    readonly DVMCP_REQUEST: 5050;
    readonly DVMCP_RESPONSE: 5051;
    readonly DVMCP_FEEDBACK: 7000;
};
export type NostrKind = typeof NostrKinds[keyof typeof NostrKinds];
export interface RelayPolicy {
    payment_required?: boolean;
    restricted_writes?: boolean;
    created_at_lower_limit?: number;
    created_at_upper_limit?: number;
    kind_whitelist?: number[];
    kind_blacklist?: number[];
}
export interface RelayInformation {
    name?: string;
    description?: string;
    pubkey?: string;
    contact?: string;
    supported_nips?: number[];
    software?: string;
    version?: string;
    limitation?: RelayPolicy;
    relay_countries?: string[];
    language_tags?: string[];
    tags?: string[];
    posting_policy?: string;
    payments_url?: string;
    fees?: Record<string, number>;
    icon?: string;
}
export type { NostrEvent, UnsignedEvent };
//# sourceMappingURL=types.d.ts.map