import { useEffect, useCallback, useRef } from 'react'
import { Event, Filter, generateSecretKey, getPublicKey, finalizeEvent, SimplePool, UnsignedEvent } from 'nostr-tools'
import { useNostrStore } from '@/stores/nostr'
import { NostrEvent, NostrFilter, NostrKind, UserProfile } from '@/types/nostr'

interface UseNostrReturn {
  publishEvent: (event: Partial<NostrEvent>) => Promise<void>
  subscribeToFeed: (filters: NostrFilter[]) => () => void
  subscribeToProfile: (pubkey: string) => () => void
  subscribeToUserNotes: (pubkey: string) => () => void
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>
  generateKeys: () => { privateKey: string; publicKey: string }
  generateKeyPair: () => { privateKey: string; publicKey: string }
  importPrivateKey: (privateKey: string) => { privateKey: string; publicKey: string }
  connectToRelays: () => Promise<void>
  connectToRelay: (url: string) => Promise<void>
  disconnectFromRelays: () => void
  disconnectFromRelay: (url: string) => void
  currentUser: { pubkey: string; privkey?: string } | null
  isConnected: boolean
}

export function useNostr(): UseNostrReturn {
  const {
    relays,
    userKeys,
    currentUser,
    connectedRelays,
    updateRelayConnection,
    addEvent,
    addProfile,
    setCurrentUser,
    setFeedLoading,
    setFeedError,
  } = useNostrStore()

  const pool = useRef<SimplePool | null>(null)
  const subscriptions = useRef<Set<() => void>>(new Set())

  const connectToRelays = useCallback(async () => {
    const currentRelays = useNostrStore.getState().relays
    setFeedLoading(true)
    setFeedError(null)

    try {
      if (!pool.current) {
        pool.current = new SimplePool()
      }
      
      // Try to connect to all relays
      for (const relayConfig of currentRelays) {
        try {
          // SimplePool handles connections internally
          updateRelayConnection(relayConfig.url, true)
        } catch (error) {
          console.error(`Failed to connect to ${relayConfig.url}:`, error)
          updateRelayConnection(relayConfig.url, false)
        }
      }
    } catch (error) {
      setFeedError('Failed to connect to relays')
      console.error('Relay connection error:', error)
    } finally {
      setFeedLoading(false)
    }
  }, [updateRelayConnection, setFeedLoading, setFeedError])

  const connectToRelay = useCallback(async (url: string) => {
    try {
      if (!pool.current) {
        pool.current = new SimplePool()
      }
      updateRelayConnection(url, true)
    } catch (error) {
      console.error(`Failed to connect to ${url}:`, error)
      updateRelayConnection(url, false)
      throw error
    }
  }, [updateRelayConnection])

  const disconnectFromRelays = useCallback(() => {
    const currentRelays = useNostrStore.getState().relays
    
    // Clean up subscriptions
    subscriptions.current.forEach(unsub => unsub())
    subscriptions.current.clear()

    // Close pool
    if (pool.current) {
      pool.current.close(currentRelays.map(r => r.url))
      pool.current = null
    }

    // Update store
    currentRelays.forEach(relay => updateRelayConnection(relay.url, false))
  }, [updateRelayConnection])

  const disconnectFromRelay = useCallback((url: string) => {
    if (pool.current) {
      pool.current.close([url])
    }
    updateRelayConnection(url, false)
  }, [updateRelayConnection])

  const publishEvent = useCallback(async (eventData: Partial<NostrEvent>) => {
    if (!userKeys || !pool.current) {
      throw new Error('No user keys available or not connected')
    }

    const currentRelays = useNostrStore.getState().relays

    const unsignedEvent: UnsignedEvent = {
      kind: eventData.kind || NostrKind.TEXT_NOTE,
      content: eventData.content || '',
      tags: eventData.tags || [],
      created_at: Math.floor(Date.now() / 1000),
      pubkey: userKeys.publicKey,
    }

    // Convert hex private key to Uint8Array
    const privateKeyBytes = new Uint8Array(userKeys.privateKey.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)))
    const signedEvent = finalizeEvent(unsignedEvent, privateKeyBytes)
    
    const relayUrls = currentRelays.filter(r => r.write).map(r => r.url)
    await pool.current.publish(relayUrls, signedEvent)
    addEvent(signedEvent as NostrEvent)
  }, [userKeys, addEvent])

  const subscribeToFeed = useCallback((filters: NostrFilter[]) => {
    if (!pool.current) {
      setFeedError('Not connected to relays')
      return () => {}
    }

    const currentRelays = useNostrStore.getState().relays
    const relayUrls = currentRelays.filter(r => r.read).map(r => r.url)
    
    const sub = pool.current.subscribeMany(
      relayUrls,
      filters as Filter[],
      {
        onevent(event: Event) {
          addEvent(event as NostrEvent)
        },
        oneose() {
          console.log('End of stored events')
        }
      }
    )

    const unsubscribe = () => {
      sub.close()
      subscriptions.current.delete(unsubscribe)
    }

    subscriptions.current.add(unsubscribe)
    return unsubscribe
  }, [addEvent, setFeedError])

  const subscribeToProfile = useCallback((pubkey: string) => {
    if (!pool.current) {
      return () => {}
    }

    const filters: NostrFilter[] = [
      { kinds: [NostrKind.METADATA], authors: [pubkey], limit: 1 }
    ]

    const currentRelays = useNostrStore.getState().relays
    const relayUrls = currentRelays.filter(r => r.read).map(r => r.url)

    const sub = pool.current.subscribeMany(
      relayUrls,
      filters as Filter[],
      {
        onevent(event: Event) {
          if (event.kind === NostrKind.METADATA) {
            try {
              const profileData = JSON.parse(event.content)
              const profile: UserProfile = {
                pubkey: event.pubkey,
                ...profileData
              }
              addProfile(profile)
            } catch (error) {
              console.error('Failed to parse profile metadata:', error)
            }
          }
        }
      }
    )

    const unsubscribe = () => {
      sub.close()
      subscriptions.current.delete(unsubscribe)
    }

    subscriptions.current.add(unsubscribe)
    return unsubscribe
  }, [addProfile])

  const subscribeToUserNotes = useCallback((pubkey: string) => {
    if (!pool.current) {
      return () => {}
    }

    const filters: NostrFilter[] = [
      { kinds: [NostrKind.TEXT_NOTE], authors: [pubkey], limit: 50 }
    ]

    const currentRelays = useNostrStore.getState().relays
    const relayUrls = currentRelays.filter(r => r.read).map(r => r.url)

    const sub = pool.current.subscribeMany(
      relayUrls,
      filters as Filter[],
      {
        onevent(event: Event) {
          addEvent(event as NostrEvent)
        }
      }
    )

    const unsubscribe = () => {
      sub.close()
      subscriptions.current.delete(unsubscribe)
    }

    subscriptions.current.add(unsubscribe)
    return unsubscribe
  }, [addEvent])

  const updateProfile = useCallback(async (profile: Partial<UserProfile>) => {
    if (!userKeys || !pool.current) {
      throw new Error('No user keys available or not connected')
    }

    const currentRelays = useNostrStore.getState().relays

    const unsignedEvent: UnsignedEvent = {
      kind: NostrKind.METADATA,
      content: JSON.stringify(profile),
      tags: [],
      created_at: Math.floor(Date.now() / 1000),
      pubkey: userKeys.publicKey,
    }

    // Convert hex private key to Uint8Array
    const privateKeyBytes = new Uint8Array(userKeys.privateKey.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)))
    const signedEvent = finalizeEvent(unsignedEvent, privateKeyBytes)
    
    const relayUrls = currentRelays.filter(r => r.write).map(r => r.url)
    await pool.current.publish(relayUrls, signedEvent)
  }, [userKeys])

  const generateKeys = useCallback(() => {
    const privateKey = generateSecretKey()
    const publicKey = getPublicKey(privateKey)
    return { 
      privateKey: Array.from(privateKey, byte => byte.toString(16).padStart(2, '0')).join(''),
      publicKey 
    }
  }, [])

  const generateKeyPair = useCallback(() => {
    return generateKeys()
  }, [generateKeys])

  const importPrivateKey = useCallback((privateKey: string) => {
    try {
      // Remove any spaces or formatting
      const cleanKey = privateKey.replace(/\s/g, '')
      
      // Convert hex string to Uint8Array
      const privateKeyBytes = new Uint8Array(cleanKey.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)))
      const publicKey = getPublicKey(privateKeyBytes)
      
      const keys = { privateKey: cleanKey, publicKey }
      
      // Set in store
      setCurrentUser({ pubkey: publicKey, privkey: cleanKey })
      
      return keys
    } catch (error) {
      throw new Error('Invalid private key format')
    }
  }, [setCurrentUser])

  const isConnected = connectedRelays.size > 0

  // Auto-connect on mount if we have relays configured
  useEffect(() => {
    if (relays.length > 0 && !pool.current) {
      connectToRelays()
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pool.current) {
        disconnectFromRelays()
      }
    }
  }, [])

  return {
    publishEvent,
    subscribeToFeed,
    subscribeToProfile,
    subscribeToUserNotes,
    updateProfile,
    generateKeys,
    generateKeyPair,
    importPrivateKey,
    connectToRelays,
    connectToRelay,
    disconnectFromRelays,
    disconnectFromRelay,
    currentUser,
    isConnected,
  }
} 