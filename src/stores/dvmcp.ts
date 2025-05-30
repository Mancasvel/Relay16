import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { DVMCPTool, DVMCPProvider, DVMCPRequest, DVMCPSession, DVMCPCategory } from '@/types/dvmcp'

interface DVMCPState {
  // Providers and tools
  providers: DVMCPProvider[]
  tools: DVMCPTool[]
  availableCategories: DVMCPCategory[]
  
  // Active sessions and requests
  activeSessions: DVMCPSession[]
  requests: DVMCPRequest[]
  
  // Discovery state
  discoveryLoading: boolean
  discoveryError: string | null
  lastDiscoveryTime: number
  
  // Tool usage
  selectedTool: DVMCPTool | null
  toolHistory: { toolId: string; timestamp: number; success: boolean }[]
  
  // Actions
  setProviders: (providers: DVMCPProvider[]) => void
  addProvider: (provider: DVMCPProvider) => void
  setTools: (tools: DVMCPTool[]) => void
  addTool: (tool: DVMCPTool) => void
  updateToolStatus: (toolId: string, status: DVMCPTool['status']) => void
  setSelectedTool: (tool: DVMCPTool | null) => void
  addSession: (session: DVMCPSession) => void
  updateSession: (sessionId: string, updates: Partial<DVMCPSession>) => void
  removeSession: (sessionId: string) => void
  addRequest: (request: DVMCPRequest) => void
  updateRequest: (requestId: string, updates: Partial<DVMCPRequest>) => void
  addToHistory: (toolId: string, success: boolean) => void
  setDiscoveryLoading: (loading: boolean) => void
  setDiscoveryError: (error: string | null) => void
  updateLastDiscoveryTime: () => void
  clearAll: () => void
}

export const useDVMCPStore = create<DVMCPState>()(
  persist(
    (set, get) => ({
      // Initial state
      providers: [],
      tools: [],
      availableCategories: Object.values(DVMCPCategory),
      activeSessions: [],
      requests: [],
      discoveryLoading: false,
      discoveryError: null,
      lastDiscoveryTime: 0,
      selectedTool: null,
      toolHistory: [],

      // Actions
      setProviders: (providers) => set({ providers }),

      addProvider: (provider) => set((state) => ({
        providers: [...state.providers.filter(p => p.pubkey !== provider.pubkey), provider]
      })),

      setTools: (tools) => set({ tools }),

      addTool: (tool) => set((state) => ({
        tools: [...state.tools.filter(t => t.id !== tool.id), tool]
      })),

      updateToolStatus: (toolId, status) => set((state) => ({
        tools: state.tools.map(tool =>
          tool.id === toolId ? { ...tool, status } : tool
        )
      })),

      setSelectedTool: (tool) => set({ selectedTool: tool }),

      addSession: (session) => set((state) => ({
        activeSessions: [...state.activeSessions, session]
      })),

      updateSession: (sessionId, updates) => set((state) => ({
        activeSessions: state.activeSessions.map(session =>
          session.id === sessionId ? { ...session, ...updates } : session
        )
      })),

      removeSession: (sessionId) => set((state) => ({
        activeSessions: state.activeSessions.filter(session => session.id !== sessionId)
      })),

      addRequest: (request) => set((state) => ({
        requests: [request, ...state.requests].slice(0, 100) // Keep only latest 100 requests
      })),

      updateRequest: (requestId, updates) => set((state) => ({
        requests: state.requests.map(request =>
          request.id === requestId ? { ...request, ...updates } : request
        )
      })),

      addToHistory: (toolId, success) => set((state) => ({
        toolHistory: [
          { toolId, timestamp: Date.now(), success },
          ...state.toolHistory
        ].slice(0, 1000) // Keep only latest 1000 entries
      })),

      setDiscoveryLoading: (loading) => set({ discoveryLoading: loading }),

      setDiscoveryError: (error) => set({ discoveryError: error }),

      updateLastDiscoveryTime: () => set({ lastDiscoveryTime: Date.now() }),

      clearAll: () => set({
        providers: [],
        tools: [],
        activeSessions: [],
        requests: [],
        selectedTool: null,
        toolHistory: [],
        discoveryLoading: false,
        discoveryError: null,
        lastDiscoveryTime: 0,
      }),
    }),
    {
      name: 'relay16-dvmcp-storage',
      partialize: (state) => ({
        providers: state.providers,
        tools: state.tools,
        toolHistory: state.toolHistory,
        lastDiscoveryTime: state.lastDiscoveryTime,
      }),
    }
  )
) 