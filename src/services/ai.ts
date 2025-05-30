import { useAIStore } from '@/stores/ai'
import { NostrNote } from '@/types/nostr'
import { OpenRouterRequest, OpenRouterResponse, ConversationSummary, WritingAssistance, WritingSuggestion } from '@/types/ai'
import { PostAssistant } from '@packages/ai-tools/src/post-assistant'
import { ContentModerator } from '@packages/ai-tools/src/content-moderator'
import { OpenRouterConfig } from '@packages/ai-tools/src/types'

/**
 * Get OpenRouter configuration from environment variables
 */
export const getOpenRouterConfig = (): OpenRouterConfig => {
  const config = {
    apiKey: import.meta.env.VITE_OPENROUTER_API_KEY || '',
    model: import.meta.env.VITE_OPENROUTER_DEFAULT_MODEL || 'nvidia/llama-3.1-nemotron-ultra-253b-v1:free',
    baseUrl: import.meta.env.VITE_OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
    siteUrl: import.meta.env.VITE_OPENROUTER_SITE_URL || 'https://relay16.app',
    siteName: import.meta.env.VITE_OPENROUTER_SITE_NAME || 'Relay16',
    timeout: 30000
  }

  if (!config.apiKey) {
    throw new Error('OpenRouter API key is required. Please set VITE_OPENROUTER_API_KEY in your environment variables.')
  }

  return config
}

// Singleton instances
let postAssistantInstance: PostAssistant | null = null
let contentModeratorInstance: ContentModerator | null = null

/**
 * Get PostAssistant instance with proper configuration
 */
export const getPostAssistant = (): PostAssistant => {
  if (!postAssistantInstance) {
    const config = getOpenRouterConfig()
    postAssistantInstance = new PostAssistant(config)
  }
  return postAssistantInstance
}

/**
 * Get ContentModerator instance with proper configuration
 */
export const getContentModerator = (): ContentModerator => {
  if (!contentModeratorInstance) {
    const config = getOpenRouterConfig()
    contentModeratorInstance = new ContentModerator(config)
  }
  return contentModeratorInstance
}

/**
 * Reset all AI tool instances (useful for config changes)
 */
export const resetAIInstances = (): void => {
  postAssistantInstance = null
  contentModeratorInstance = null
}

/**
 * Check if OpenRouter is properly configured
 */
export const isOpenRouterConfigured = (): boolean => {
  try {
    const config = getOpenRouterConfig()
    return !!config.apiKey
  } catch {
    return false
  }
}

/**
 * AI Service class for centralized AI operations
 */
class AIService {
  private postAssistant: PostAssistant
  private contentModerator: ContentModerator

  constructor() {
    const config = getOpenRouterConfig()
    this.postAssistant = new PostAssistant(config)
    this.contentModerator = new ContentModerator(config)
  }

  private getApiKey(): string {
    const { openRouterApiKey } = useAIStore.getState()
    if (!openRouterApiKey) {
      const envApiKey = import.meta.env.VITE_OPENROUTER_API_KEY
      if (!envApiKey) {
        throw new Error('OpenRouter API key not configured')
      }
      return envApiKey
    }
    return openRouterApiKey
  }

  private async makeRequest(endpoint: string, data: any): Promise<any> {
    const apiKey = this.getApiKey()
    
    const response = await fetch(`https://openrouter.ai/api/v1${endpoint}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": import.meta.env.VITE_OPENROUTER_SITE_URL || "https://relay16.app",
        "X-Title": import.meta.env.VITE_OPENROUTER_SITE_NAME || "Relay16",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.statusText}`)
    }

    return response.json()
  }

  async generateCompletion(
    prompt: string, 
    model: string = import.meta.env.VITE_OPENROUTER_DEFAULT_MODEL || 'nvidia/llama-3.1-nemotron-ultra-253b-v1:free',
    maxTokens: number = 1000
  ): Promise<string> {
    const request: OpenRouterRequest = {
      model,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: maxTokens,
      temperature: 0.7
    }

    const response: OpenRouterResponse = await this.makeRequest('/chat/completions', request)
    
    if (!response.choices || response.choices.length === 0) {
      throw new Error('No response from AI model')
    }

    return response.choices[0].message.content
  }

  // Writing Assistant Methods
  async improvePost(content: string, options?: {
    tone?: 'casual' | 'professional' | 'friendly' | 'formal'
    maxLength?: number
    includeHashtags?: boolean
    targetAudience?: string
  }) {
    return this.postAssistant.improvePost(content, options)
  }

  async generatePost(topic: string, options?: {
    tone?: 'casual' | 'professional' | 'friendly' | 'formal'
    maxLength?: number
    includeHashtags?: boolean
    targetAudience?: string
  }) {
    return this.postAssistant.generatePost(topic, options)
  }

  async generateHashtags(content: string, maxCount: number = 5) {
    return this.postAssistant.generateHashtags(content, maxCount)
  }

  // Content Moderation Methods
  async moderateContent(content: string, strictness: 'low' | 'medium' | 'high' = 'medium') {
    return this.contentModerator.moderateContent({ content, strictness })
  }

  async detectSpam(content: string) {
    return this.contentModerator.detectSpam(content)
  }

  async analyzeToxicity(content: string) {
    return this.contentModerator.analyzeToxicity(content)
  }

  async batchModerateContent(contents: string[], strictness: 'low' | 'medium' | 'high' = 'medium') {
    return this.contentModerator.batchModerateContent(contents, strictness)
  }

  async summarizeConversation(notes: NostrNote[]): Promise<ConversationSummary> {
    if (notes.length === 0) {
      throw new Error('No notes to summarize')
    }

    const conversationText = notes
      .map(note => `${note.profile?.name || 'Anonymous'}: ${note.content}`)
      .join('\n\n')

    const prompt = `Please provide a concise summary of this Nostr conversation. Focus on the main topics, key points, and any conclusions or decisions made.

Conversation:
${conversationText}

Please format your response as:
**Main Topic:** [topic]
**Key Points:**
- [point 1]
- [point 2]
- [point 3]

**Participants:** [list of participants]
**Sentiment:** [overall mood/tone]
**Action Items:** [if any]`

    try {
      const response = await this.generateCompletion(prompt, undefined, 800)
      
      const summary: ConversationSummary = {
        id: `summary-${Date.now()}`,
        threadId: notes[0]?.id || `thread-${Date.now()}`,
        summary: response,
        keyPoints: this.extractTopics(response),
        participants: [...new Set(notes.map(note => note.pubkey))],
        sentiment: 'neutral',
        topics: this.extractTopics(response),
        created_at: Date.now(),
        messageCount: notes.length
      }

      return summary
    } catch (error) {
      throw new Error(`Failed to summarize conversation: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async assistWithWriting(content: string, context?: string): Promise<WritingAssistance> {
    const prompt = `Please help improve this social media post for Nostr. Provide specific suggestions for better engagement, clarity, and impact.

Original post: "${content}"
${context ? `Context: ${context}` : ''}

Please provide:
1. Overall assessment
2. Specific suggestions for improvement
3. Alternative versions if applicable
4. Hashtag recommendations
5. Tone and style feedback

Keep suggestions practical and focused on Nostr/social media best practices.`

    try {
      const response = await this.generateCompletion(prompt, undefined, 1000)
      
      const assistance: WritingAssistance = {
        id: `assistance-${Date.now()}`,
        originalContent: content,
        suggestions: this.parseSuggestions(response),
        improvedVersion: this.extractImprovedVersions(response)[0] || content,
        created_at: Date.now()
      }

      return assistance
    } catch (error) {
      throw new Error(`Failed to provide writing assistance: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Alias for backward compatibility
  async improveWriting(content: string, context?: string): Promise<WritingAssistance> {
    return this.assistWithWriting(content, context)
  }

  private extractTopics(text: string): string[] {
    const topicMatch = text.match(/\*\*Key Points:\*\*(.*?)(?:\*\*|$)/s)
    if (topicMatch) {
      return topicMatch[1]
        .split('\n')
        .filter(line => line.trim().startsWith('-'))
        .map(line => line.replace(/^-\s*/, '').trim())
        .filter(topic => topic.length > 0)
    }
    return []
  }

  private parseSuggestions(text: string): WritingSuggestion[] {
    const suggestions: WritingSuggestion[] = []
    const lines = text.split('\n')
    
    lines.forEach((line, index) => {
      if (line.includes('suggestion') || line.includes('improve') || line.includes('consider')) {
        suggestions.push({
          type: 'style',
          description: line.trim(),
          suggestion: line.trim(),
          confidence: 0.8
        })
      }
    })
    
    return suggestions.slice(0, 5) // Limit to 5 suggestions
  }

  private extractImprovedVersions(text: string): string[] {
    const versionRegex = /(?:Alternative|Improved|Better).*?version[:\s]*["\"]?(.*?)["\"]?(?:\n|$)/gi
    const matches = Array.from(text.matchAll(versionRegex))
    return matches.map(match => match[1]?.trim()).filter(Boolean)
  }

  private extractHashtags(text: string): string[] {
    const hashtagRegex = /#\w+/g
    const hashtags = text.match(hashtagRegex) || []
    return [...new Set(hashtags)].slice(0, 8) // Unique hashtags, max 8
  }

  private calculateScore(text: string): number {
    let score = 50 // Base score
    
    if (text.includes('excellent') || text.includes('great')) score += 20
    if (text.includes('good')) score += 10
    if (text.includes('needs improvement') || text.includes('unclear')) score -= 15
    if (text.includes('poor') || text.includes('confusing')) score -= 25
    
    return Math.max(0, Math.min(100, score))
  }
}

// Export singleton instance
export const aiService = new AIService()

// Export convenience functions
export const {
  generateCompletion,
  summarizeConversation,
  assistWithWriting,
  improvePost,
  generatePost,
  generateHashtags,
  moderateContent,
  detectSpam,
  analyzeToxicity,
  batchModerateContent
} = aiService

// Additional convenience exports
export const quickSummarize = async (notes: NostrNote[]): Promise<ConversationSummary> => {
  return aiService.summarizeConversation(notes)
}

export const improveText = async (text: string, context?: string): Promise<WritingAssistance> => {
  return aiService.assistWithWriting(text, context)
}

// Default export
export default aiService 