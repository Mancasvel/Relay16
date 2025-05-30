export interface DVMCPConfig {
  bridge: {
    enabled: boolean
    port: number
    host: string
    corsOrigins: string[]
  }
  providers: {
    discovery: {
      enabled: boolean
      relays: string[]
      refreshInterval: number // minutes
    }
    whitelist?: string[] // pubkeys
    blacklist?: string[] // pubkeys
  }
  ai: {
    openRouter: {
      apiKey?: string
      baseUrl: string
      defaultModel: string
      timeout: number // seconds
    }
    rateLimit: {
      requests: number
      period: number // seconds
    }
  }
  security: {
    enableSignatureVerification: boolean
    maxRequestSize: number // bytes
    allowedDomains: string[]
  }
}

export const DEFAULT_DVMCP_CONFIG: DVMCPConfig = {
  bridge: {
    enabled: true,
    port: 3001,
    host: 'localhost',
    corsOrigins: ['http://localhost:3000', 'http://localhost:5173']
  },
  providers: {
    discovery: {
      enabled: true,
      relays: [
        'wss://relay.damus.io',
        'wss://nos.lol'
      ],
      refreshInterval: 30 // 30 minutes
    }
  },
  ai: {
    openRouter: {
      baseUrl: 'https://openrouter.ai/api/v1',
      defaultModel: 'anthropic/claude-3-haiku:beta',
      timeout: 30
    },
    rateLimit: {
      requests: 100,
      period: 3600 // 1 hour
    }
  },
  security: {
    enableSignatureVerification: true,
    maxRequestSize: 1024 * 1024, // 1MB
    allowedDomains: ['localhost', '127.0.0.1']
  }
}

// DVMCP Tool Categories mapping
export const DVMCP_CATEGORIES = {
  TEXT_GENERATION: 5000,
  IMAGE_GENERATION: 5001,
  TEXT_ANALYSIS: 5002,
  TRANSLATION: 5003,
  SUMMARIZATION: 5004,
  CONVERSATION: 5005
} as const

export const DVMCP_KINDS = {
  REQUEST: 5050,
  RESPONSE: 5051,
  JOB_FEEDBACK: 7000
} as const

// Standard DVMCP event templates
export const createDVMCPRequest = (
  toolId: string,
  input: string,
  options: Record<string, any> = {}
) => ({
  kind: DVMCP_KINDS.REQUEST,
  tags: [
    ['i', input, 'text'],
    ['output', 'text/plain'],
    ['relays', 'wss://relay.damus.io'],
    ['p', toolId],
    ...Object.entries(options).map(([key, value]) => ['param', key, String(value)])
  ]
})

export const createDVMCPResponse = (
  requestEventId: string,
  result: string,
  cost?: number
) => ({
  kind: DVMCP_KINDS.RESPONSE,
  tags: [
    ['request', requestEventId],
    ['e', requestEventId],
    ...(cost ? [['amount', String(cost), 'msats']] : [])
  ],
  content: result
})

export default DEFAULT_DVMCP_CONFIG 