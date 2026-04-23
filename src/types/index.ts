export interface Profile {
  id: number
  name: string
  is_active: number
  created_at: string
}

export interface Provider {
  id: number
  profile_id: number
  name: string
  type: string
  api_base_url: string | null
  platform_url: string | null
  logo: string | null
  created_at: string
}

export type ProviderType = 
  | 'openai' 
  | 'anthropic' 
  | 'google' 
  | 'azure' 
  | 'ollama' 
  | 'lmstudio'
  | 'openrouter'
  | 'custom'

export interface Model {
  id: number
  provider_id: number
  name: string
  display_name: string | null
  input_cost: number
  output_cost: number
  max_tokens: number | null
  context_window: number | null
  created_at: string
}

export interface ApiKey {
  id: number
  provider_id: number
  label: string
  key: string
  org_id: string | null
  created_at: string
}

export const PROVIDER_DEFAULTS: Record<ProviderType, { api_base_url: string; platform_url: string }> = {
  openai: {
    api_base_url: 'https://api.openai.com/v1',
    platform_url: 'https://platform.openai.com'
  },
  anthropic: {
    api_base_url: 'https://api.anthropic.com',
    platform_url: 'https://console.anthropic.com'
  },
  google: {
    api_base_url: 'https://generativelanguage.googleapis.com/v1beta',
    platform_url: 'https://aistudio.google.com'
  },
  azure: {
    api_base_url: 'https://{resource}.openai.azure.com',
    platform_url: 'https://portal.azure.com'
  },
  ollama: {
    api_base_url: 'http://localhost:11434',
    platform_url: 'https://ollama.ai'
  },
  lmstudio: {
    api_base_url: 'http://localhost:1234/v1',
    platform_url: 'https://lmstudio.ai'
  },
  openrouter: {
    api_base_url: 'https://openrouter.ai/api/v1',
    platform_url: 'https://openrouter.ai'
  },
  custom: {
    api_base_url: '',
    platform_url: ''
  }
}

export const DEFAULT_MODELS: Record<ProviderType, Array<{ name: string; display_name: string; input_cost: number; output_cost: number; context_window: number }>> = {
  openai: [
    { name: 'gpt-4o', display_name: 'GPT-4o', input_cost: 2.5, output_cost: 10, context_window: 128000 },
    { name: 'gpt-4o-mini', display_name: 'GPT-4o Mini', input_cost: 0.15, output_cost: 0.6, context_window: 128000 },
    { name: 'gpt-4-turbo', display_name: 'GPT-4 Turbo', input_cost: 10, output_cost: 30, context_window: 128000 },
    { name: 'gpt-3.5-turbo', display_name: 'GPT-3.5 Turbo', input_cost: 0.5, output_cost: 1.5, context_window: 16385 },
  ],
  anthropic: [
    { name: 'claude-sonnet-4-20250514', display_name: 'Claude Sonnet 4', input_cost: 3, output_cost: 15, context_window: 200000 },
    { name: 'claude-3-5-sonnet-20241022', display_name: 'Claude 3.5 Sonnet', input_cost: 3, output_cost: 15, context_window: 200000 },
    { name: 'claude-3-5-haiku-20241022', display_name: 'Claude 3.5 Haiku', input_cost: 0.8, output_cost: 4, context_window: 200000 },
    { name: 'claude-3-opus-20240229', display_name: 'Claude 3 Opus', input_cost: 15, output_cost: 75, context_window: 200000 },
  ],
  google: [
    { name: 'gemini-2.0-flash', display_name: 'Gemini 2.0 Flash', input_cost: 0.1, output_cost: 0.4, context_window: 1000000 },
    { name: 'gemini-1.5-pro', display_name: 'Gemini 1.5 Pro', input_cost: 1.25, output_cost: 5, context_window: 2000000 },
    { name: 'gemini-1.5-flash', display_name: 'Gemini 1.5 Flash', input_cost: 0.075, output_cost: 0.3, context_window: 1000000 },
  ],
  azure: [
    { name: 'gpt-4o', display_name: 'GPT-4o (Azure)', input_cost: 2.5, output_cost: 10, context_window: 128000 },
    { name: 'gpt-4', display_name: 'GPT-4 (Azure)', input_cost: 30, output_cost: 60, context_window: 8192 },
  ],
  ollama: [
    { name: 'llama3.2', display_name: 'Llama 3.2', input_cost: 0, output_cost: 0, context_window: 128000 },
    { name: 'mistral', display_name: 'Mistral', input_cost: 0, output_cost: 0, context_window: 32000 },
    { name: 'codellama', display_name: 'Code Llama', input_cost: 0, output_cost: 0, context_window: 16000 },
  ],
  lmstudio: [
    { name: 'local-model', display_name: 'Local Model', input_cost: 0, output_cost: 0, context_window: 4096 },
  ],
  openrouter: [
    { name: 'openai/gpt-4o', display_name: 'GPT-4o (via OpenRouter)', input_cost: 2.5, output_cost: 10, context_window: 128000 },
    { name: 'anthropic/claude-3.5-sonnet', display_name: 'Claude 3.5 Sonnet (via OpenRouter)', input_cost: 3, output_cost: 15, context_window: 200000 },
  ],
  custom: []
}
