export interface AIService {
  id: string;
  name: string;
  description: string;
  type: AIServiceType;
  model?: string;
  provider: 'openrouter' | 'openai' | 'anthropic' | 'local';
  status: 'active' | 'inactive' | 'error';
  lastUsed?: number;
}

export enum AIServiceType {
  SUMMARIZATION = 'summarization',
  WRITING_ASSISTANT = 'writing_assistant',
  CONTENT_MODERATION = 'content_moderation',
  TRANSLATION = 'translation',
  SENTIMENT_ANALYSIS = 'sentiment_analysis',
  TOPIC_EXTRACTION = 'topic_extraction',
}

export interface ConversationSummary {
  id: string;
  threadId: string;
  summary: string;
  keyPoints: string[];
  participants: string[];
  sentiment: 'positive' | 'negative' | 'neutral' | 'mixed';
  topics: string[];
  created_at: number;
  messageCount: number;
}

export interface WritingAssistance {
  id: string;
  originalContent: string;
  suggestions: WritingSuggestion[];
  improvedVersion?: string;
  tone?: 'casual' | 'professional' | 'friendly' | 'formal';
  purpose?: 'inform' | 'entertain' | 'persuade' | 'discuss';
  created_at: number;
}

export interface WritingSuggestion {
  type: 'grammar' | 'style' | 'clarity' | 'tone' | 'length' | 'engagement';
  description: string;
  suggestion: string;
  confidence: number;
  applied?: boolean;
}

export interface AIRequest {
  id: string;
  serviceId: string;
  input: any;
  output?: any;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
  created_at: number;
  completed_at?: number;
  tokens_used?: number;
  cost?: number;
}

export interface OpenRouterRequest {
  model: string;
  messages: OpenRouterMessage[];
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  stop?: string[];
}

export interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  name?: string;
}

export interface OpenRouterResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: OpenRouterMessage;
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
} 