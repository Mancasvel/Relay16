import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { AIService, ConversationSummary, WritingAssistance, AIRequest, AIServiceType } from '@/types/ai'

// Get configuration from environment variables
const getEnvConfig = () => ({
  apiKey: import.meta.env.VITE_OPENROUTER_API_KEY || null,
  defaultModel: import.meta.env.VITE_OPENROUTER_DEFAULT_MODEL || 'nvidia/llama-3.1-nemotron-ultra-253b-v1:free',
  baseUrl: import.meta.env.VITE_OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
  siteUrl: import.meta.env.VITE_OPENROUTER_SITE_URL || 'https://relay16.app',
  siteName: import.meta.env.VITE_OPENROUTER_SITE_NAME || 'Relay16',
  appName: import.meta.env.VITE_APP_NAME || 'Relay16'
})

interface AIState {
  // Services
  services: AIService[]
  activeService: AIService | null
  
  // Summaries
  summaries: ConversationSummary[]
  summaryLoading: boolean
  summaryError: string | null
  
  // Writing assistance
  writingAssistance: WritingAssistance[]
  currentAssistance: WritingAssistance | null
  assistanceLoading: boolean
  assistanceError: string | null
  
  // Requests and history
  requests: AIRequest[]
  totalTokensUsed: number
  totalCost: number
  
  // Configuration
  openRouterApiKey: string | null
  openRouterConfig: { apiKey: string | null }
  preferredModels: Record<AIServiceType, string>
  
  // Actions
  setServices: (services: AIService[]) => void
  setActiveService: (service: AIService | null) => void
  addSummary: (summary: ConversationSummary) => void
  setSummaryLoading: (loading: boolean) => void
  setSummaryError: (error: string | null) => void
  addWritingAssistance: (assistance: WritingAssistance) => void
  setCurrentAssistance: (assistance: WritingAssistance | null) => void
  setAssistanceLoading: (loading: boolean) => void
  setAssistanceError: (error: string | null) => void
  addRequest: (request: AIRequest) => void
  updateRequest: (requestId: string, updates: Partial<AIRequest>) => void
  setOpenRouterApiKey: (key: string) => void
  setOpenRouterConfig: (config: { apiKey: string | null }) => void
  setPreferredModel: (serviceType: AIServiceType, model: string) => void
  updateUsageStats: (tokens: number, cost: number) => void
  clearAll: () => void
}

const envConfig = getEnvConfig()

const defaultServices: AIService[] = [
  {
    id: 'conversation-summarizer',
    name: 'Conversation Summarizer',
    description: 'Summarizes long Nostr conversations and extracts key points',
    type: AIServiceType.SUMMARIZATION,
    model: envConfig.defaultModel,
    provider: 'openrouter',
    status: 'active',
  },
  {
    id: 'writing-assistant',
    name: 'Writing Assistant',
    description: 'Helps improve posts before publishing with suggestions and corrections',
    type: AIServiceType.WRITING_ASSISTANT,
    model: envConfig.defaultModel,
    provider: 'openrouter',
    status: 'active',
  },
  {
    id: 'content-moderator',
    name: 'Content Moderator',
    description: 'Analyzes content for potential issues and provides moderation insights',
    type: AIServiceType.CONTENT_MODERATION,
    model: envConfig.defaultModel,
    provider: 'openrouter',
    status: 'active',
  },
]

const defaultPreferredModels: Record<AIServiceType, string> = {
  [AIServiceType.SUMMARIZATION]: envConfig.defaultModel,
  [AIServiceType.WRITING_ASSISTANT]: envConfig.defaultModel,
  [AIServiceType.CONTENT_MODERATION]: envConfig.defaultModel,
  [AIServiceType.TRANSLATION]: envConfig.defaultModel,
  [AIServiceType.SENTIMENT_ANALYSIS]: envConfig.defaultModel,
  [AIServiceType.TOPIC_EXTRACTION]: envConfig.defaultModel,
}

export const useAIStore = create<AIState>()(
  persist(
    (set, get) => ({
      // Initial state with environment variables
      services: defaultServices,
      activeService: null,
      summaries: [],
      summaryLoading: false,
      summaryError: null,
      writingAssistance: [],
      currentAssistance: null,
      assistanceLoading: false,
      assistanceError: null,
      requests: [],
      totalTokensUsed: 0,
      totalCost: 0,
      openRouterApiKey: envConfig.apiKey,
      openRouterConfig: { apiKey: envConfig.apiKey },
      preferredModels: defaultPreferredModels,

      // Actions
      setServices: (services) => set({ services }),

      setActiveService: (service) => set({ activeService: service }),

      addSummary: (summary) => set((state) => ({
        summaries: [summary, ...state.summaries].slice(0, 100) // Keep only latest 100
      })),

      setSummaryLoading: (loading) => set({ summaryLoading: loading }),

      setSummaryError: (error) => set({ summaryError: error }),

      addWritingAssistance: (assistance) => set((state) => ({
        writingAssistance: [assistance, ...state.writingAssistance].slice(0, 50) // Keep only latest 50
      })),

      setCurrentAssistance: (assistance) => set({ currentAssistance: assistance }),

      setAssistanceLoading: (loading) => set({ assistanceLoading: loading }),

      setAssistanceError: (error) => set({ assistanceError: error }),

      addRequest: (request) => set((state) => ({
        requests: [request, ...state.requests].slice(0, 200) // Keep only latest 200
      })),

      updateRequest: (requestId, updates) => set((state) => ({
        requests: state.requests.map(request =>
          request.id === requestId ? { ...request, ...updates } : request
        )
      })),

      setOpenRouterApiKey: (key) => set({ 
        openRouterApiKey: key,
        openRouterConfig: { apiKey: key }
      }),

      setOpenRouterConfig: (config) => set({ 
        openRouterConfig: config,
        openRouterApiKey: config.apiKey
      }),

      setPreferredModel: (serviceType, model) => set((state) => ({
        preferredModels: { ...state.preferredModels, [serviceType]: model }
      })),

      updateUsageStats: (tokens, cost) => set((state) => ({
        totalTokensUsed: state.totalTokensUsed + tokens,
        totalCost: state.totalCost + cost,
      })),

      clearAll: () => set({
        summaries: [],
        writingAssistance: [],
        currentAssistance: null,
        requests: [],
        totalTokensUsed: 0,
        totalCost: 0,
        summaryLoading: false,
        summaryError: null,
        assistanceLoading: false,
        assistanceError: null,
      }),
    }),
    {
      name: 'relay16-ai-storage',
      partialize: (state) => ({
        services: state.services,
        summaries: state.summaries,
        writingAssistance: state.writingAssistance,
        openRouterApiKey: state.openRouterApiKey,
        openRouterConfig: state.openRouterConfig,
        preferredModels: state.preferredModels,
        totalTokensUsed: state.totalTokensUsed,
        totalCost: state.totalCost,
      }),
    }
  )
) 