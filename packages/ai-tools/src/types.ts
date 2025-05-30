/**
 * Types for AI tools package
 */

export interface OpenRouterConfig {
  apiKey: string
  baseUrl?: string
  model?: string
  timeout?: number
  siteUrl?: string
  siteName?: string
}

export interface ConversationSummaryRequest {
  events: any[]
  maxLength?: number
  language?: string
}

export interface ConversationSummaryResponse {
  summary: string
  keyPoints: string[]
  participants: string[]
  sentiment: 'positive' | 'negative' | 'neutral'
  topics: string[]
}

export interface PostAssistantRequest {
  content: string
  context?: string
  tone?: 'casual' | 'professional' | 'friendly' | 'formal'
  maxLength?: number
}

export interface PostAssistantResponse {
  suggestions: string[]
  hashtags: string[]
  improvements: string[]
  translation?: string
}

export interface ContentModerationRequest {
  content: string
  strictness?: 'low' | 'medium' | 'high'
}

export interface ContentModerationResponse {
  isAppropriate: boolean
  confidence: number
  reasons: string[]
  categories: string[]
  suggestedAction: 'allow' | 'warn' | 'block'
}

export interface AIToolResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}

export interface AIToolConfig {
  openRouter: OpenRouterConfig
  rateLimit?: {
    requests: number
    period: number // seconds
  }
} 