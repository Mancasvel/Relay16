/**
 * AI-powered conversation summarizer for Nostr events
 */

import type { NostrEvent } from '@relay16/nostr-core'
import { OpenRouterClient } from './openrouter-client'
import type { 
  ConversationSummaryRequest, 
  ConversationSummaryResponse, 
  AIToolResponse,
  OpenRouterConfig 
} from './types'

export class ConversationSummarizer {
  private client: OpenRouterClient

  constructor(config: OpenRouterConfig) {
    this.client = new OpenRouterClient(config)
  }

  /**
   * Summarize a conversation from Nostr events
   */
  async summarizeConversation(
    request: ConversationSummaryRequest
  ): Promise<AIToolResponse<ConversationSummaryResponse>> {
    try {
      // Prepare conversation text from events
      const conversationText = this.prepareConversationText(request.events)
      
      if (!conversationText.trim()) {
        return {
          success: false,
          error: 'No content to summarize'
        }
      }

      // Create prompt for summarization
      const prompt = this.createSummaryPrompt(conversationText, request)
      
      // Call AI API
      const response = await this.client.chatCompletion([
        {
          role: 'system',
          content: 'You are an expert at summarizing conversations. Provide clear, concise summaries with key insights.'
        },
        {
          role: 'user',
          content: prompt
        }
      ], {
        maxTokens: request.maxLength || 500,
        temperature: 0.3
      })

      if (!response.success) {
        return response
      }

      // Parse AI response
      const summary = this.parseAIResponse(response.data as string)
      
      return {
        success: true,
        data: summary,
        usage: response.usage
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  /**
   * Prepare conversation text from Nostr events
   */
  private prepareConversationText(events: NostrEvent[]): string {
    // Sort events by timestamp
    const sortedEvents = events
      .filter(event => event.kind === 1) // Only text notes
      .sort((a, b) => a.created_at - b.created_at)

    return sortedEvents
      .map(event => {
        const timestamp = new Date(event.created_at * 1000).toLocaleTimeString()
        const author = event.pubkey.substring(0, 8) + '...'
        return `[${timestamp}] ${author}: ${event.content}`
      })
      .join('\n')
  }

  /**
   * Create summarization prompt
   */
  private createSummaryPrompt(
    conversationText: string, 
    request: ConversationSummaryRequest
  ): string {
    const language = request.language || 'English'
    
    return `Please analyze and summarize the following conversation in ${language}:

${conversationText}

Provide a JSON response with the following structure:
{
  "summary": "A concise summary of the main discussion",
  "keyPoints": ["Key point 1", "Key point 2", "Key point 3"],
  "participants": ["participant1", "participant2"],
  "sentiment": "positive|negative|neutral",
  "topics": ["topic1", "topic2", "topic3"]
}

Focus on:
- Main themes and conclusions
- Important decisions or agreements
- Key participants and their contributions
- Overall tone and sentiment
- Relevant topics discussed

Keep the summary concise but informative.`
  }

  /**
   * Parse AI response into structured format
   */
  private parseAIResponse(aiResponse: string): ConversationSummaryResponse {
    try {
      // Try to extract JSON from response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        return {
          summary: parsed.summary || 'No summary available',
          keyPoints: Array.isArray(parsed.keyPoints) ? parsed.keyPoints : [],
          participants: Array.isArray(parsed.participants) ? parsed.participants : [],
          sentiment: ['positive', 'negative', 'neutral'].includes(parsed.sentiment) 
            ? parsed.sentiment 
            : 'neutral',
          topics: Array.isArray(parsed.topics) ? parsed.topics : []
        }
      }
    } catch (error) {
      console.warn('Failed to parse AI response as JSON:', error)
    }

    // Fallback: treat entire response as summary
    return {
      summary: aiResponse,
      keyPoints: [],
      participants: [],
      sentiment: 'neutral',
      topics: []
    }
  }

  /**
   * Get conversation statistics
   */
  getConversationStats(events: NostrEvent[]): {
    totalMessages: number
    uniqueParticipants: number
    timeSpan: number
    averageMessageLength: number
  } {
    const textEvents = events.filter(event => event.kind === 1)
    const participants = new Set(textEvents.map(event => event.pubkey))
    
    const timestamps = textEvents.map(event => event.created_at)
    const timeSpan = timestamps.length > 0 
      ? Math.max(...timestamps) - Math.min(...timestamps)
      : 0

    const totalLength = textEvents.reduce((sum, event) => sum + event.content.length, 0)
    const averageLength = textEvents.length > 0 ? totalLength / textEvents.length : 0

    return {
      totalMessages: textEvents.length,
      uniqueParticipants: participants.size,
      timeSpan,
      averageMessageLength: Math.round(averageLength)
    }
  }

  /**
   * Update OpenRouter configuration
   */
  updateConfig(config: Partial<OpenRouterConfig>): void {
    this.client.updateConfig(config)
  }
} 