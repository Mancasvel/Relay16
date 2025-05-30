/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_OPENROUTER_API_KEY: string
  readonly VITE_OPENROUTER_DEFAULT_MODEL: string
  readonly VITE_OPENROUTER_BASE_URL: string
  readonly VITE_OPENROUTER_SITE_URL: string
  readonly VITE_OPENROUTER_SITE_NAME: string
  readonly VITE_AI_RATE_LIMIT_REQUESTS: string
  readonly VITE_AI_RATE_LIMIT_PERIOD: string
  readonly VITE_APP_NAME: string
  readonly VITE_APP_DESCRIPTION: string
  readonly VITE_APP_VERSION: string
  readonly VITE_DEFAULT_RELAYS: string
  readonly VITE_DEBUG_MODE: string
  readonly VITE_LOG_LEVEL: string
  readonly NODE_ENV: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
} 