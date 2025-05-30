import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { NostrEvent, NostrRelay, UserProfile, NostrNote } from '@/types/nostr'

interface NostrState {
  // User state
  userKeys: { privateKey: string; publicKey: string } | null
  userProfile: UserProfile | null
  currentUser: { pubkey: string; privkey?: string } | null
  
  // Relays
  relays: NostrRelay[]
  connectedRelays: Set<string>
  
  // Events and notes
  events: Map<string, NostrEvent>
  notes: NostrNote[]
  profiles: Map<string, UserProfile>
  
  // Feed state
  feedLoading: boolean
  feedError: string | null
  lastUpdateTime: number
  
  // Profile state
  profileLoading: boolean
  profileError: string | null
  
  // Actions
  setUserKeys: (keys: { privateKey: string; publicKey: string }) => void
  setUserProfile: (profile: UserProfile) => void
  setCurrentUser: (user: { pubkey: string; privkey?: string } | null) => void
  addRelay: (relay: Omit<NostrRelay, 'connected'>) => void
  removeRelay: (url: string) => void
  updateRelayConnection: (url: string, connected: boolean) => void
  addEvent: (event: NostrEvent) => void
  addEvents: (events: NostrEvent[]) => void
  addProfile: (profile: UserProfile) => void
  addProfiles: (profiles: UserProfile[]) => void
  setNotes: (notes: NostrNote[]) => void
  addNote: (note: NostrNote) => void
  setFeedLoading: (loading: boolean) => void
  setFeedError: (error: string | null) => void
  setProfileLoading: (loading: boolean) => void
  setProfileError: (error: string | null) => void
  updateLastUpdateTime: () => void
  clearAll: () => void
}

const defaultRelays: NostrRelay[] = [
  { url: 'wss://relay.damus.io', read: true, write: true, connected: false },
  { url: 'wss://nos.lol', read: true, write: true, connected: false },
  { url: 'wss://relay.snort.social', read: true, write: true, connected: false },
  { url: 'wss://relay.nostr.band', read: true, write: false, connected: false },
]

export const useNostrStore = create<NostrState>()(
  persist(
    (set, get) => ({
      // Initial state
      userKeys: null,
      userProfile: null,
      currentUser: null,
      relays: defaultRelays,
      connectedRelays: new Set(),
      events: new Map(),
      notes: [],
      profiles: new Map(),
      feedLoading: false,
      feedError: null,
      lastUpdateTime: 0,
      profileLoading: false,
      profileError: null,

      // Actions
      setUserKeys: (keys) => set({ userKeys: keys }),

      setUserProfile: (profile) => set({ userProfile: profile }),

      setCurrentUser: (user) => set({ currentUser: user }),

      addRelay: (relay) => set((state) => ({
        relays: [...state.relays, { ...relay, connected: false }]
      })),

      removeRelay: (url) => set((state) => ({
        relays: state.relays.filter(relay => relay.url !== url)
      })),

      updateRelayConnection: (url, connected) => set((state) => {
        const updatedRelays = state.relays.map(relay =>
          relay.url === url ? { ...relay, connected } : relay
        )
        const connectedRelays = new Set(state.connectedRelays)
        if (connected) {
          connectedRelays.add(url)
        } else {
          connectedRelays.delete(url)
        }
        return { relays: updatedRelays, connectedRelays }
      }),

      addEvent: (event) => set((state) => {
        const newEvents = new Map(state.events)
        newEvents.set(event.id, event)
        return { events: newEvents }
      }),

      addEvents: (events) => set((state) => {
        const newEvents = new Map(state.events)
        events.forEach(event => newEvents.set(event.id, event))
        return { events: newEvents }
      }),

      addProfile: (profile) => set((state) => {
        const newProfiles = new Map(state.profiles)
        newProfiles.set(profile.pubkey, profile)
        return { profiles: newProfiles }
      }),

      addProfiles: (profiles) => set((state) => {
        const newProfiles = new Map(state.profiles)
        profiles.forEach(profile => newProfiles.set(profile.pubkey, profile))
        return { profiles: newProfiles }
      }),

      setNotes: (notes) => set({ notes }),

      addNote: (note) => set((state) => ({
        notes: [note, ...state.notes].slice(0, 1000) // Keep only latest 1000 notes
      })),

      setFeedLoading: (loading) => set({ feedLoading: loading }),

      setFeedError: (error) => set({ feedError: error }),

      setProfileLoading: (loading) => set({ profileLoading: loading }),

      setProfileError: (error) => set({ profileError: error }),

      updateLastUpdateTime: () => set({ lastUpdateTime: Date.now() }),

      clearAll: () => set({
        userKeys: null,
        userProfile: null,
        currentUser: null,
        events: new Map(),
        notes: [],
        profiles: new Map(),
        feedLoading: false,
        feedError: null,
        profileLoading: false,
        profileError: null,
        lastUpdateTime: 0,
      }),
    }),
    {
      name: 'relay16-nostr-storage',
      partialize: (state) => ({
        userKeys: state.userKeys,
        userProfile: state.userProfile,
        currentUser: state.currentUser,
        relays: state.relays,
        profiles: Object.fromEntries(state.profiles),
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.profiles && typeof state.profiles === 'object') {
          state.profiles = new Map(Object.entries(state.profiles))
        }
      },
    }
  )
) 