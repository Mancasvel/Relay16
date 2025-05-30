export interface DVMCPTool {
  id: string;
  name: string;
  description: string;
  category: DVMCPCategory;
  capabilities: string[];
  pricing?: DVMCPPricing;
  metadata?: Record<string, any>;
  endpoint?: string;
  status: 'active' | 'inactive' | 'error';
}

export enum DVMCPCategory {
  TEXT_PROCESSING = 'text_processing',
  IMAGE_GENERATION = 'image_generation',
  ANALYSIS = 'analysis',
  COMPUTATION = 'computation',
  TRANSLATION = 'translation',
  SUMMARIZATION = 'summarization',
  SOCIAL_ANALYTICS = 'social_analytics',
  CONTENT_MODERATION = 'content_moderation',
}

export interface DVMCPPricing {
  model: 'free' | 'pay_per_use' | 'subscription';
  amount?: number;
  currency?: string;
  credits?: number;
}

export interface DVMCPRequest {
  id: string;
  toolId: string;
  parameters: Record<string, any>;
  timestamp: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  response?: DVMCPResponse;
}

export interface DVMCPResponse {
  requestId: string;
  result: any;
  metadata?: Record<string, any>;
  error?: string;
  timestamp: number;
  cost?: number;
}

export interface DVMCPProvider {
  pubkey: string;
  name: string;
  description?: string;
  website?: string;
  tools: DVMCPTool[];
  reputation: number;
  totalRequests: number;
  successRate: number;
}

export interface DVMCPSession {
  id: string;
  providerId: string;
  toolId: string;
  parameters: Record<string, any>;
  created_at: number;
  status: 'active' | 'completed' | 'cancelled';
  messages: DVMCPMessage[];
}

export interface DVMCPMessage {
  id: string;
  sessionId: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: number;
  metadata?: Record<string, any>;
} 