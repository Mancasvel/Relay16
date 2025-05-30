export interface RelayConfig {
  url: string
  read: boolean
  write: boolean
  auth?: boolean
  description?: string
  region?: 'global' | 'eu' | 'us' | 'asia'
  priority?: number
}

export const DEFAULT_RELAYS: RelayConfig[] = [
  // High priority, reliable relays
  {
    url: 'wss://relay.damus.io',
    read: true,
    write: true,
    description: 'Damus relay - High reliability',
    region: 'global',
    priority: 1
  },
  {
    url: 'wss://nos.lol',
    read: true,
    write: true,
    description: 'nos.lol - Community relay',
    region: 'global',
    priority: 1
  },
  {
    url: 'wss://relay.nostr.info',
    read: true,
    write: true,
    description: 'nostr.info - General purpose',
    region: 'global',
    priority: 2
  },
  
  // Regional relays
  {
    url: 'wss://nostr-pub.wellorder.net',
    read: true,
    write: true,
    description: 'WellOrder - EU region',
    region: 'eu',
    priority: 2
  },
  {
    url: 'wss://relay.nostr.band',
    read: true,
    write: false,
    description: 'nostr.band - Read-only aggregator',
    region: 'global',
    priority: 3
  },
  
  // Specialized relays
  {
    url: 'wss://eden.nostr.land',
    read: true,
    write: true,
    description: 'Eden - Community relay',
    region: 'global',
    priority: 2
  },
  {
    url: 'wss://relay.snort.social',
    read: true,
    write: true,
    description: 'Snort relay',
    region: 'global',
    priority: 2
  }
]

export const DVMCP_RELAYS: RelayConfig[] = [
  {
    url: 'wss://relay.damus.io',
    read: true,
    write: true,
    description: 'Primary DVMCP relay',
    region: 'global',
    priority: 1
  },
  {
    url: 'wss://nos.lol',
    read: true,
    write: true,
    description: 'Secondary DVMCP relay',
    region: 'global',
    priority: 2
  }
]

export const getRelaysByRegion = (region: RelayConfig['region']) => {
  return DEFAULT_RELAYS.filter(relay => relay.region === region || relay.region === 'global')
}

export const getWriteRelays = () => {
  return DEFAULT_RELAYS.filter(relay => relay.write)
}

export const getReadRelays = () => {
  return DEFAULT_RELAYS.filter(relay => relay.read)
}

export const getRelaysByPriority = (priority: number) => {
  return DEFAULT_RELAYS.filter(relay => relay.priority === priority)
} 