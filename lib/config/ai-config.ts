// AI Configuration and Feature Flags
// Supports multiple AI providers with cost-effective models

export interface AIConfig {
  enabled: boolean;
  provider: 'openai' | 'anthropic' | 'groq' | 'together' | 'ollama' | 'google' | 'mistral' | 'cohere' | 'perplexity' | 'lmstudio' | 'deepseek' | 'xai';
  apiKey?: string;
  model: string;
  baseURL?: string;
  maxTokens: number;
  temperature: number;
}

export interface AIFeatures {
  productDescriptions: boolean;
  searchEnhancement: boolean;
  recommendations: boolean;
  bundleSuggestions: boolean;
  customerSupport: boolean;
  growingGuides: boolean;
}

// Cost-effective model configurations with performance ratings
export const AI_MODELS = {
  // OpenAI - Best quality, moderate cost
  'gpt-4o-mini': { provider: 'openai', cost: 'low', performance: 'excellent', speed: 'fast' },
  'gpt-3.5-turbo': { provider: 'openai', cost: 'low', performance: 'good', speed: 'fast' },
  'gpt-4o': { provider: 'openai', cost: 'high', performance: 'excellent', speed: 'medium' },
  
  // Anthropic - Excellent reasoning, moderate cost
  'claude-3-5-sonnet-20241022': { provider: 'anthropic', cost: 'medium', performance: 'excellent', speed: 'fast' },
  'claude-3-5-haiku-20241022': { provider: 'anthropic', cost: 'low', performance: 'good', speed: 'very-fast' },
  'claude-3-haiku-20240307': { provider: 'anthropic', cost: 'low', performance: 'good', speed: 'fast' },
  
  // Groq - Ultra fast, very cheap
  'llama-3.3-70b-versatile': { provider: 'groq', cost: 'low', performance: 'excellent', speed: 'ultra-fast' },
  'llama-3.1-8b-instant': { provider: 'groq', cost: 'very-low', performance: 'good', speed: 'ultra-fast' },
  'mixtral-8x7b-32768': { provider: 'groq', cost: 'low', performance: 'good', speed: 'ultra-fast' },
  'gemma2-9b-it': { provider: 'groq', cost: 'very-low', performance: 'medium', speed: 'ultra-fast' },
  
  // Google AI - Good performance, competitive pricing
  'gemini-1.5-flash': { provider: 'google', cost: 'very-low', performance: 'good', speed: 'fast' },
  'gemini-1.5-pro': { provider: 'google', cost: 'medium', performance: 'excellent', speed: 'medium' },
  'gemini-2.0-flash-exp': { provider: 'google', cost: 'low', performance: 'excellent', speed: 'fast' },
  
  // Mistral AI - Excellent European option
  'mistral-small-latest': { provider: 'mistral', cost: 'low', performance: 'good', speed: 'fast' },
  'mistral-large-latest': { provider: 'mistral', cost: 'medium', performance: 'excellent', speed: 'medium' },
  'pixtral-12b-2409': { provider: 'mistral', cost: 'low', performance: 'good', speed: 'fast' },
  
  // Together AI - Cost-effective hosting
  'meta-llama/Llama-3.2-3B-Instruct-Turbo': { provider: 'together', cost: 'very-low', performance: 'medium', speed: 'fast' },
  'meta-llama/Llama-3.1-8B-Instruct-Turbo': { provider: 'together', cost: 'low', performance: 'good', speed: 'fast' },
  'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo': { provider: 'together', cost: 'medium', performance: 'excellent', speed: 'medium' },
  'mistralai/Mixtral-8x7B-Instruct-v0.1': { provider: 'together', cost: 'low', performance: 'good', speed: 'fast' },
  
  // Cohere - Excellent for text generation
  'command-r-plus': { provider: 'cohere', cost: 'medium', performance: 'excellent', speed: 'medium' },
  'command-r': { provider: 'cohere', cost: 'low', performance: 'good', speed: 'fast' },
  'command': { provider: 'cohere', cost: 'low', performance: 'good', speed: 'fast' },
  
  // Perplexity - Great for search and reasoning
  'llama-3.1-sonar-large-128k-online': { provider: 'perplexity', cost: 'medium', performance: 'excellent', speed: 'medium' },
  'llama-3.1-sonar-small-128k-online': { provider: 'perplexity', cost: 'low', performance: 'good', speed: 'fast' },
  
  // DeepSeek - Ultra cheap Chinese models
  'deepseek-chat': { provider: 'deepseek', cost: 'very-low', performance: 'good', speed: 'fast' },
  'deepseek-coder': { provider: 'deepseek', cost: 'very-low', performance: 'good', speed: 'fast' },
  
  // xAI - Grok models
  'grok-2-1212': { provider: 'xai', cost: 'medium', performance: 'excellent', speed: 'medium' },
  'grok-2-vision-1212': { provider: 'xai', cost: 'medium', performance: 'excellent', speed: 'medium' },
  
  // Local models
  'llama3.2:3b': { provider: 'ollama', cost: 'free', performance: 'medium', speed: 'medium' },
  'llama3.1:8b': { provider: 'ollama', cost: 'free', performance: 'good', speed: 'medium' },
  'llama3.1:70b': { provider: 'ollama', cost: 'free', performance: 'excellent', speed: 'slow' },
  'qwen2.5:7b': { provider: 'ollama', cost: 'free', performance: 'good', speed: 'medium' },
  
  // LM Studio (local)
  'lmstudio-local': { provider: 'lmstudio', cost: 'free', performance: 'variable', speed: 'variable' },
} as const;

function getAIConfig(): AIConfig {
  const provider = (process.env.NEXT_PUBLIC_AI_PROVIDER as AIConfig['provider']) || 'groq';
  // API key should only be accessed on the server
  const apiKey = typeof window === 'undefined' ? process.env.AI_API_KEY : undefined;
  
  // Default to free/cheap models if no API key
  const defaultModels = {
    openai: 'gpt-4o-mini',
    anthropic: 'claude-3-5-haiku-20241022',
    groq: 'llama-3.3-70b-versatile',
    together: 'meta-llama/Llama-3.1-8B-Instruct-Turbo',
    google: 'gemini-1.5-flash',
    mistral: 'mistral-small-latest',
    cohere: 'command-r',
    perplexity: 'llama-3.1-sonar-small-128k-online',
    deepseek: 'deepseek-chat',
    xai: 'grok-2-1212',
    ollama: 'llama3.1:8b',
    lmstudio: 'lmstudio-local'
  };

  const model = process.env.NEXT_PUBLIC_AI_MODEL || defaultModels[provider];
  
  const baseURLs = {
    openai: 'https://api.openai.com/v1',
    anthropic: 'https://api.anthropic.com',
    groq: 'https://api.groq.com/openai/v1',
    together: 'https://api.together.xyz/v1',
    google: 'https://generativelanguage.googleapis.com/v1beta',
    mistral: 'https://api.mistral.ai/v1',
    cohere: 'https://api.cohere.com/v1',
    perplexity: 'https://api.perplexity.ai',
    deepseek: 'https://api.deepseek.com/v1',
    xai: 'https://api.x.ai/v1',
    ollama: process.env.OLLAMA_HOST || 'http://localhost:11434/v1',
    lmstudio: process.env.LMSTUDIO_HOST || 'http://localhost:1234/v1'
  };

  return {
    enabled: process.env.NEXT_PUBLIC_AI_ENABLED === 'true' || Boolean(apiKey) || provider === 'ollama' || provider === 'lmstudio',
    provider,
    apiKey,
    model,
    baseURL: process.env.AI_BASE_URL || baseURLs[provider],
    maxTokens: parseInt(process.env.AI_MAX_TOKENS || '1000'),
    temperature: parseFloat(process.env.AI_TEMPERATURE || '0.7')
  };
}

function getAIFeatures(): AIFeatures {
  const config = getAIConfig();
  
  // If AI is disabled, all features are disabled
  if (!config.enabled) {
    return {
      productDescriptions: false,
      searchEnhancement: false,
      recommendations: false,
      bundleSuggestions: false,
      customerSupport: false,
      growingGuides: false
    };
  }

  return {
    productDescriptions: process.env.NEXT_PUBLIC_AI_PRODUCT_DESCRIPTIONS === 'true',
    searchEnhancement: process.env.NEXT_PUBLIC_AI_SEARCH_ENHANCEMENT === 'true',
    recommendations: process.env.NEXT_PUBLIC_AI_RECOMMENDATIONS === 'true',
    bundleSuggestions: process.env.NEXT_PUBLIC_AI_BUNDLE_SUGGESTIONS === 'true',
    customerSupport: process.env.NEXT_PUBLIC_AI_CUSTOMER_SUPPORT === 'true',
    growingGuides: process.env.NEXT_PUBLIC_AI_GROWING_GUIDES === 'true'
  };
}

export const aiConfig = getAIConfig();
export const aiFeatures = getAIFeatures();

// Debug logging
if (typeof window !== 'undefined') {
  console.log('🤖 [AI System] Configuration loaded:', {
    enabled: aiConfig.enabled,
    provider: aiConfig.provider,
    model: aiConfig.model,
    hasApiKey: Boolean(aiConfig.apiKey),
    features: aiFeatures
  });
}

// Utility to check if a specific AI feature is enabled
export function isAIFeatureEnabled(feature: keyof AIFeatures): boolean {
  return aiFeatures[feature];
}

// Utility to get AI model info
export function getModelInfo(model: string) {
  return AI_MODELS[model as keyof typeof AI_MODELS];
}

export default {
  config: aiConfig,
  features: aiFeatures,
  isFeatureEnabled: isAIFeatureEnabled,
  getModelInfo
};