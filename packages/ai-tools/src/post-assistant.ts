import { PostAssistantRequest, PostAssistantResponse, AIToolResponse, OpenRouterConfig } from './types'

export interface PostAssistantConfig {
  maxLength?: number
  tone?: 'casual' | 'professional' | 'friendly' | 'formal'
  includeHashtags?: boolean
  targetAudience?: string
}

export interface PostImprovementSuggestion {
  type: 'grammar' | 'clarity' | 'engagement' | 'hashtags' | 'structure'
  original: string
  suggestion: string
  reason: string
  confidence: number
}

export interface ExtendedPostAssistantResponse extends AIToolResponse {
  suggestions?: PostImprovementSuggestion[]
  improvedText?: string
  generatedHashtags?: string[]
  sentiment?: {
    score: number
    label: 'positive' | 'negative' | 'neutral'
  }
}

export class PostAssistant {
  private config: OpenRouterConfig

  constructor(config: OpenRouterConfig) {
    this.config = config
  }

  async improvePost(
    content: string,
    config: PostAssistantConfig = {}
  ): Promise<ExtendedPostAssistantResponse> {
    const prompt = this.buildImprovementPrompt(content, config)
    
    try {
      const response = await this.makeAPICall(prompt)
      return this.parseImprovementResponse(response, content)
    } catch (error) {
      return {
        success: false,
        error: `Failed to improve post: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  async generatePost(
    topic: string,
    config: PostAssistantConfig = {}
  ): Promise<ExtendedPostAssistantResponse> {
    const prompt = this.buildGenerationPrompt(topic, config)
    
    try {
      const response = await this.makeAPICall(prompt)
      return this.parseGenerationResponse(response, topic)
    } catch (error) {
      return {
        success: false,
        error: `Failed to generate post: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  async generateHashtags(content: string, maxCount: number = 5): Promise<string[]> {
    const prompt = `Generate ${maxCount} relevant hashtags for this social media post. Return only the hashtags, one per line, without the # symbol:\n\n"${content}"`
    
    try {
      const response = await this.makeAPICall(prompt)
      return response
        .split('\n')
        .map((tag: string) => tag.trim())
        .filter((tag: string) => tag.length > 0)
        .slice(0, maxCount)
    } catch (error) {
      throw new Error(`Failed to generate hashtags: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private async makeAPICall(prompt: string): Promise<string> {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.config.apiKey}`,
        "HTTP-Referer": this.config.siteUrl || "https://relay16.app",
        "X-Title": this.config.siteName || "Relay16",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": this.config.model || "nvidia/llama-3.1-nemotron-ultra-253b-v1:free",
        "messages": [
          {
            "role": "system",
            "content": "You are a helpful writing assistant that improves social media posts."
          },
          {
            "role": "user",
            "content": prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    })

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`)
    }

    const data = await response.json()
    return data.choices[0]?.message?.content || ''
  }

  private buildImprovementPrompt(content: string, config: PostAssistantConfig): string {
    let prompt = `Please analyze and improve this social media post:\n\n"${content}"\n\n`
    
    prompt += 'Provide suggestions for improvement in the following areas:\n'
    prompt += '- Grammar and spelling\n'
    prompt += '- Clarity and readability\n'
    prompt += '- Engagement potential\n'
    prompt += '- Overall structure\n'
    
    if (config.tone) {
      prompt += `\nAdjust the tone to be ${config.tone}.`
    }
    
    if (config.maxLength) {
      prompt += `\nKeep the improved version under ${config.maxLength} characters.`
    }
    
    if (config.targetAudience) {
      prompt += `\nTarget audience: ${config.targetAudience}`
    }
    
    if (config.includeHashtags) {
      prompt += '\nAlso suggest relevant hashtags.'
    }
    
    prompt += '\n\nFormat your response as JSON with the following structure:\n'
    prompt += '{\n'
    prompt += '  "suggestions": [{"type": "grammar|clarity|engagement|structure", "original": "text", "suggestion": "improved text", "reason": "explanation", "confidence": 0.8}],\n'
    prompt += '  "improvedText": "complete improved version",\n'
    prompt += '  "generatedHashtags": ["hashtag1", "hashtag2"],\n'
    prompt += '  "sentiment": {"score": 0.7, "label": "positive"}\n'
    prompt += '}'
    
    return prompt
  }

  private buildGenerationPrompt(topic: string, config: PostAssistantConfig): string {
    let prompt = `Create an engaging social media post about: ${topic}\n\n`
    
    if (config.tone) {
      prompt += `Tone: ${config.tone}\n`
    }
    
    if (config.maxLength) {
      prompt += `Maximum length: ${config.maxLength} characters\n`
    }
    
    if (config.targetAudience) {
      prompt += `Target audience: ${config.targetAudience}\n`
    }
    
    prompt += '\nMake it engaging, authentic, and shareable.'
    
    if (config.includeHashtags) {
      prompt += ' Include relevant hashtags.'
    }
    
    return prompt
  }

  private parseImprovementResponse(content: string, originalContent: string): ExtendedPostAssistantResponse {
    try {
      const parsed = JSON.parse(content)
      return {
        success: true,
        data: {
          suggestions: parsed.suggestions || [],
          hashtags: parsed.generatedHashtags || [],
          improvements: [parsed.improvedText || originalContent],
        },
        suggestions: parsed.suggestions || [],
        improvedText: parsed.improvedText,
        generatedHashtags: parsed.generatedHashtags || [],
        sentiment: parsed.sentiment
      }
    } catch (error) {
      // Fallback if JSON parsing fails
      return {
        success: true,
        data: {
          suggestions: [],
          hashtags: [],
          improvements: [content],
        },
        suggestions: [{
          type: 'structure',
          original: originalContent,
          suggestion: content,
          reason: 'AI-generated improvement',
          confidence: 0.8
        }]
      }
    }
  }

  private parseGenerationResponse(content: string, topic: string): ExtendedPostAssistantResponse {
    return {
      success: true,
      data: {
        suggestions: [],
        hashtags: [],
        improvements: [content],
      },
      suggestions: [],
      improvedText: content
    }
  }
}

export function createPostAssistant(config: OpenRouterConfig): PostAssistant {
  return new PostAssistant(config)
} 