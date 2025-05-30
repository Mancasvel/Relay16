import { ContentModerationRequest, ContentModerationResponse, AIToolResponse, OpenRouterConfig } from './types'

export interface ModerationRule {
  type: 'spam' | 'toxicity' | 'harassment' | 'hate-speech' | 'nsfw' | 'violence' | 'self-harm'
  threshold: number
  action: 'allow' | 'warn' | 'block'
}

export interface ModerationContext {
  platform?: string
  userReputation?: number
  communityGuidelines?: string[]
}

export interface DetailedModerationResponse extends ContentModerationResponse {
  scores: Record<string, number>
  flaggedPhrases: string[]
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  recommendations: string[]
}

export class ContentModerator {
  private config: OpenRouterConfig
  private rules: ModerationRule[]

  constructor(config: OpenRouterConfig, rules: ModerationRule[] = []) {
    this.config = config
    this.rules = rules.length > 0 ? rules : this.getDefaultRules()
  }

  async moderateContent(
    request: ContentModerationRequest,
    context?: ModerationContext
  ): Promise<DetailedModerationResponse> {
    try {
      const prompt = this.buildModerationPrompt(request.content, request.strictness || 'medium', context)
      const response = await this.makeAPICall(prompt)
      return this.parseModerationResponse(response, request.content)
    } catch (error) {
      return {
        isAppropriate: true, // Default to allowing content on error
        confidence: 0,
        reasons: [`Moderation failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
        categories: [],
        suggestedAction: 'allow',
        scores: {},
        flaggedPhrases: [],
        riskLevel: 'low',
        recommendations: ['Manual review recommended due to moderation error']
      }
    }
  }

  async batchModerateContent(
    contents: string[],
    strictness: 'low' | 'medium' | 'high' = 'medium',
    context?: ModerationContext
  ): Promise<DetailedModerationResponse[]> {
    const promises = contents.map(content => 
      this.moderateContent({ content, strictness }, context)
    )
    return Promise.all(promises)
  }

  async detectSpam(content: string): Promise<{
    isSpam: boolean
    confidence: number
    indicators: string[]
  }> {
    const prompt = `Analyze this content for spam indicators. Look for:
- Repetitive text or phrases
- Excessive links or promotional content
- Suspicious patterns or bot-like behavior
- Off-topic or irrelevant content

Content: "${content}"

Respond with JSON: {"isSpam": boolean, "confidence": 0-1, "indicators": ["indicator1", "indicator2"]}`

    try {
      const response = await this.makeAPICall(prompt)
      const parsed = JSON.parse(response)
      return {
        isSpam: parsed.isSpam || false,
        confidence: parsed.confidence || 0,
        indicators: parsed.indicators || []
      }
    } catch (error) {
      return {
        isSpam: false,
        confidence: 0,
        indicators: ['Analysis failed']
      }
    }
  }

  async analyzeToxicity(content: string): Promise<{
    isToxic: boolean
    score: number
    categories: string[]
  }> {
    const prompt = `Analyze this content for toxicity. Consider:
- Hate speech or discriminatory language
- Personal attacks or harassment
- Threats or violent language
- Profanity or inappropriate language

Content: "${content}"

Respond with JSON: {"isToxic": boolean, "score": 0-1, "categories": ["category1", "category2"]}`

    try {
      const response = await this.makeAPICall(prompt)
      const parsed = JSON.parse(response)
      return {
        isToxic: parsed.isToxic || false,
        score: parsed.score || 0,
        categories: parsed.categories || []
      }
    } catch (error) {
      return {
        isToxic: false,
        score: 0,
        categories: ['Analysis failed']
      }
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
            "content": "You are a content moderation assistant. Analyze content objectively and provide detailed assessments for content safety."
          },
          {
            "role": "user",
            "content": prompt
          }
        ],
        temperature: 0.3, // Lower temperature for more consistent moderation
        max_tokens: 500
      })
    })

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`)
    }

    const data = await response.json()
    return data.choices[0]?.message?.content || ''
  }

  private buildModerationPrompt(
    content: string, 
    strictness: 'low' | 'medium' | 'high',
    context?: ModerationContext
  ): string {
    let prompt = `Moderate this content for safety and appropriateness:\n\n"${content}"\n\n`
    
    prompt += `Strictness level: ${strictness}\n`
    
    if (context?.platform) {
      prompt += `Platform: ${context.platform}\n`
    }
    
    if (context?.communityGuidelines) {
      prompt += `Community guidelines: ${context.communityGuidelines.join(', ')}\n`
    }
    
    prompt += `\nAnalyze for the following categories:
- Spam or promotional content
- Toxicity and harassment
- Hate speech or discrimination
- NSFW or inappropriate content
- Violence or threats
- Self-harm content

Provide a detailed assessment with confidence scores (0-1) for each category.

Respond with JSON in this format:
{
  "isAppropriate": boolean,
  "confidence": 0-1,
  "reasons": ["reason1", "reason2"],
  "categories": ["category1", "category2"],
  "suggestedAction": "allow|warn|block",
  "scores": {
    "spam": 0-1,
    "toxicity": 0-1,
    "hate_speech": 0-1,
    "nsfw": 0-1,
    "violence": 0-1,
    "self_harm": 0-1
  },
  "flaggedPhrases": ["phrase1", "phrase2"],
  "riskLevel": "low|medium|high|critical",
  "recommendations": ["rec1", "rec2"]
}`
    
    return prompt
  }

  private parseModerationResponse(response: string, originalContent: string): DetailedModerationResponse {
    try {
      const parsed = JSON.parse(response)
      return {
        isAppropriate: parsed.isAppropriate ?? true,
        confidence: parsed.confidence ?? 0,
        reasons: parsed.reasons ?? [],
        categories: parsed.categories ?? [],
        suggestedAction: parsed.suggestedAction ?? 'allow',
        scores: parsed.scores ?? {},
        flaggedPhrases: parsed.flaggedPhrases ?? [],
        riskLevel: parsed.riskLevel ?? 'low',
        recommendations: parsed.recommendations ?? []
      }
    } catch (error) {
      // Fallback parsing if JSON fails
      const isAppropriate = !response.toLowerCase().includes('inappropriate') && 
                           !response.toLowerCase().includes('block') &&
                           !response.toLowerCase().includes('harmful')
      
      return {
        isAppropriate,
        confidence: 0.5,
        reasons: isAppropriate ? [] : ['Content flagged by AI moderation'],
        categories: [],
        suggestedAction: isAppropriate ? 'allow' : 'warn',
        scores: {},
        flaggedPhrases: [],
        riskLevel: 'medium',
        recommendations: ['Manual review recommended']
      }
    }
  }

  private getDefaultRules(): ModerationRule[] {
    return [
      { type: 'spam', threshold: 0.7, action: 'block' },
      { type: 'toxicity', threshold: 0.8, action: 'block' },
      { type: 'harassment', threshold: 0.75, action: 'block' },
      { type: 'hate-speech', threshold: 0.6, action: 'block' },
      { type: 'nsfw', threshold: 0.8, action: 'warn' },
      { type: 'violence', threshold: 0.7, action: 'block' },
      { type: 'self-harm', threshold: 0.5, action: 'block' }
    ]
  }
}

export function createContentModerator(
  config: OpenRouterConfig, 
  rules?: ModerationRule[]
): ContentModerator {
  return new ContentModerator(config, rules)
} 