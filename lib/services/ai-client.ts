// Universal AI Client supporting multiple providers
import { aiConfig } from '@/lib/config/ai-config';

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIResponse {
  content: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  fallback?: boolean;
}

class AIClient {
  private config = aiConfig;
  
  private fallbackResponses = {
    quota_exceeded: 'Our AI service is currently at capacity. Please try again later or contact support for immediate assistance.',
    api_error: 'We\'re experiencing technical difficulties. Please try again or contact our support team.',
    disabled: 'AI features are currently unavailable. Please contact support for assistance.',
    search_suggestions: 'Try searching for: mushroom spawn, growing kits, substrates, or cultivation supplies',
    product_recommendations: 'Check out our best-selling mushroom growing kits and cultivation supplies.',
    support: 'For immediate help, please email support@zugzology.com or check our FAQ section.'
  };
  
  private getFallbackResponse(type: keyof typeof this.fallbackResponses): string {
    return this.fallbackResponses[type] || this.fallbackResponses.api_error;
  }

  async chat(messages: AIMessage[], options?: {
    maxTokens?: number;
    temperature?: number;
  }): Promise<AIResponse> {
    if (!this.config.enabled) {
      throw new Error('AI features are disabled. Please configure AI_API_KEY environment variable.');
    }

    const { provider, apiKey } = this.config;

    const requiresApiKey = !['ollama', 'lmstudio'].includes(provider);

    if (requiresApiKey && !apiKey) {
      console.warn(`[AI Client] Missing API key for provider "${provider}". Returning fallback response.`);
      return {
        content: this.getFallbackResponse('disabled'),
        usage: undefined,
        fallback: true,
      };
    }

    try {
      switch (provider) {
        case 'openai':
        case 'groq':
        case 'together':
        case 'mistral':
        case 'perplexity':
        case 'deepseek':
        case 'xai':
        case 'ollama':
        case 'lmstudio':
          return await this.openAICompatibleChat(messages, options);
        
        case 'anthropic':
          return await this.anthropicChat(messages, options);
        
        case 'google':
          return await this.googleChat(messages, options);
        
        case 'cohere':
          return await this.cohereChat(messages, options);
        
        default:
          throw new Error(`Unsupported AI provider: ${provider}`);
      }
    } catch (error) {
      console.error('AI Chat Error:', error);
      throw error;
    }
  }

  private async openAICompatibleChat(messages: AIMessage[], options?: {
    maxTokens?: number;
    temperature?: number;
  }): Promise<AIResponse> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add authorization header if API key exists (not needed for local models)
    if (this.config.apiKey) {
      headers['Authorization'] = `Bearer ${this.config.apiKey}`;
    }

    const response = await fetch(`${this.config.baseURL}/chat/completions`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: this.config.model,
        messages,
        max_tokens: options?.maxTokens || this.config.maxTokens,
        temperature: options?.temperature || this.config.temperature,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      
      // Handle quota exceeded specifically
      if (response.status === 429) {
        console.warn('[AI Client] Quota exceeded - using fallback');
        return {
          content: this.getFallbackResponse('quota_exceeded'),
          usage: undefined,
          fallback: true
        };
      }
      
      // Handle other errors
      console.error(`[AI Client] API Error: ${response.status} - ${errorText}`);
      return {
        content: this.getFallbackResponse('api_error'),
        usage: undefined,
        fallback: true
      };
    }

    const data = await response.json();
    
    return {
      content: data.choices[0]?.message?.content || '',
      usage: data.usage,
    };
  }

  private async anthropicChat(messages: AIMessage[], options?: {
    maxTokens?: number;
    temperature?: number;
  }): Promise<AIResponse> {
    // Convert messages format for Anthropic
    const systemMessage = messages.find(m => m.role === 'system');
    const conversationMessages = messages.filter(m => m.role !== 'system');

    const apiKey = this.config.apiKey;

    if (!apiKey) {
      console.warn('[AI Client] Anthropic provider selected without API key - returning fallback response');
      return {
        content: this.getFallbackResponse('disabled'),
        usage: undefined,
        fallback: true,
      };
    }

    const response = await fetch(`${this.config.baseURL}/v1/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: this.config.model,
        max_tokens: options?.maxTokens || this.config.maxTokens,
        temperature: options?.temperature || this.config.temperature,
        system: systemMessage?.content,
        messages: conversationMessages,
      }),
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        console.warn('[AI Client] Anthropic authorization error - returning fallback response');
        return {
          content: this.getFallbackResponse('disabled'),
          usage: undefined,
          fallback: true,
        };
      }

      if (response.status === 429) {
        console.warn('[AI Client] Anthropic quota exceeded - returning fallback response');
        return {
          content: this.getFallbackResponse('quota_exceeded'),
          usage: undefined,
          fallback: true,
        };
      }

      const errorText = await response.text();
      console.error(`[AI Client] Anthropic API error: ${response.status} - ${errorText}`);
      return {
        content: this.getFallbackResponse('api_error'),
        usage: undefined,
        fallback: true,
      };
    }

    const data = await response.json();
    
    return {
      content: data.content[0]?.text || '',
      usage: data.usage,
    };
  }

  private async googleChat(messages: AIMessage[], options?: {
    maxTokens?: number;
    temperature?: number;
  }): Promise<AIResponse> {
    const systemMessage = messages.find(m => m.role === 'system');
    const conversationMessages = messages.filter(m => m.role !== 'system');

    const contents = conversationMessages.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    const requestBody: any = {
      contents,
      generationConfig: {
        maxOutputTokens: options?.maxTokens || this.config.maxTokens,
        temperature: options?.temperature || this.config.temperature,
      }
    };

    if (systemMessage) {
      requestBody.systemInstruction = {
        parts: [{ text: systemMessage.content }]
      };
    }

    const response = await fetch(`${this.config.baseURL}/models/${this.config.model}:generateContent?key=${this.config.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Google AI Error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    
    return {
      content: data.candidates?.[0]?.content?.parts?.[0]?.text || '',
      usage: data.usageMetadata,
    };
  }

  private async cohereChat(messages: AIMessage[], options?: {
    maxTokens?: number;
    temperature?: number;
  }): Promise<AIResponse> {
    const systemMessage = messages.find(m => m.role === 'system');
    const conversationMessages = messages.filter(m => m.role !== 'system');

    const chatHistory = conversationMessages.slice(0, -1).map(msg => ({
      role: msg.role === 'assistant' ? 'CHATBOT' : 'USER',
      message: msg.content
    }));

    const lastMessage = conversationMessages[conversationMessages.length - 1];

    const requestBody: any = {
      model: this.config.model,
      message: lastMessage?.content || '',
      max_tokens: options?.maxTokens || this.config.maxTokens,
      temperature: options?.temperature || this.config.temperature,
    };

    if (systemMessage) {
      requestBody.preamble = systemMessage.content;
    }

    if (chatHistory.length > 0) {
      requestBody.chat_history = chatHistory;
    }

    const response = await fetch(`${this.config.baseURL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Cohere API Error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    
    return {
      content: data.text || '',
      usage: data.meta?.billed_units,
    };
  }

  // Simple completion method for quick tasks
  async complete(prompt: string, options?: {
    maxTokens?: number;
    temperature?: number;
  }): Promise<string> {
    const messages: AIMessage[] = [
      { role: 'user', content: prompt }
    ];

    const response = await this.chat(messages, options);
    return response.content;
  }

  // Check if AI is available
  isAvailable(): boolean {
    return this.config.enabled;
  }

  // Get current model info
  getModelInfo() {
    return {
      provider: this.config.provider,
      model: this.config.model,
      enabled: this.config.enabled,
    };
  }
}

// Export singleton instance
export const aiClient = new AIClient();
export default aiClient;
