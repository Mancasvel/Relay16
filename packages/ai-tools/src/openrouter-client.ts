/**
 * OpenRouter API client for AI operations
 */

import type { OpenRouterConfig, AIToolResponse } from './types'

export class OpenRouterClient {
  private config: OpenRouterConfig
  private baseUrl: string

  constructor(config: OpenRouterConfig) {
    this.config = config
    this.baseUrl = config.baseUrl || 'https://openrouter.ai/api/v1'
  }

  /**
   * Make a chat completion request
   */
  async chatCompletion(
    messages: Array<{ role: string; content: string }>,
    options: {
      model?: string
      maxTokens?: number
      temperature?: number
      stream?: boolean
    } = {}
  ): Promise<AIToolResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://relay16.app',
          'X-Title': 'Relay16 - Nostr Social Client'
        },
        body: JSON.stringify({
          model: options.model || this.config.model || 'anthropic/claude-3.5-sonnet',
          messages,
          max_tokens: options.maxTokens || 1000,
          temperature: options.temperature || 0.7,
          stream: options.stream || false
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`OpenRouter API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`)
      }

      const data = await response.json()
      
      return {
        success: true,
        data: data.choices[0]?.message?.content || '',
        usage: data.usage ? {
          promptTokens: data.usage.prompt_tokens,
          completionTokens: data.usage.completion_tokens,
          totalTokens: data.usage.total_tokens
        } : undefined
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  /**
   * Get available models
   */
  async getModels(): Promise<AIToolResponse<any[]>> {
    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch models: ${response.status}`)
      }

      const data = await response.json()
      
      return {
        success: true,
        data: data.data || []
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  /**
   * Check API key validity
   */
  async validateApiKey(): Promise<boolean> {
    try {
      const response = await this.chatCompletion([
        { role: 'user', content: 'Hello' }
      ], { maxTokens: 5 })
      
      return response.success
    } catch (error) {
      return false
    }
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<OpenRouterConfig>): void {
    this.config = { ...this.config, ...newConfig }
    if (newConfig.baseUrl) {
      this.baseUrl = newConfig.baseUrl
    }
  }

  /**
   * Get current configuration (without API key)
   */
  getConfig(): Omit<OpenRouterConfig, 'apiKey'> {
    const { apiKey, ...config } = this.config
    return config
  }
} 