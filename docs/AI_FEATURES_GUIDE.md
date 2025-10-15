# AI Features Integration Guide

This guide explains how to configure and use the optional AI features in your Zugzology e-commerce store. These features enhance the shopping experience while remaining completely optional.

## Overview

The AI system is designed to be:
- **Optional**: Works with or without AI - no features break if disabled
- **Cost-effective**: Uses cheap AI models to minimize expenses
- **Feature-flagged**: Individual features can be enabled/disabled
- **Provider-agnostic**: Supports multiple AI providers for flexibility

## Supported AI Providers

### 🚀 High-Performance Options (Recommended)

1. **Groq** (Ultra-Fast, Great Value)
   - Models: `llama-3.3-70b-versatile`, `llama-3.1-8b-instant`, `mixtral-8x7b-32768`
   - Speed: ~800 tokens/second (fastest available)
   - Cost: $0.05-0.59 per 1M tokens
   - Best for: Real-time features, chat, search suggestions

2. **Google Gemini** (Fast & Cheap)
   - Models: `gemini-2.0-flash-exp`, `gemini-1.5-flash`, `gemini-1.5-pro`
   - Speed: Very fast
   - Cost: $0.075-1.25 per 1M tokens
   - Best for: Balanced performance, multimodal features

3. **Claude 3.5** (Highest Quality)
   - Models: `claude-3-5-sonnet-20241022`, `claude-3-5-haiku-20241022`
   - Speed: Fast
   - Cost: $0.25-3.00 per 1M tokens
   - Best for: Product descriptions, complex reasoning

4. **DeepSeek** (Ultra-Cheap)
   - Models: `deepseek-chat`, `deepseek-coder`
   - Speed: Fast
   - Cost: $0.14 per 1M tokens (cheapest available)
   - Best for: High-volume applications

5. **OpenAI** (Most Reliable)
   - Models: `gpt-4o-mini`, `gpt-4o`, `gpt-3.5-turbo`
   - Cost: $0.15-2.50 per 1M tokens
   - Best for: Proven reliability, consistent quality

6. **Local Models** (Free, Private)
   - Ollama: `llama3.1:8b`, `qwen2.5:7b`
   - LM Studio: Any compatible model
   - Cost: Free (requires local GPU)
   - Best for: Privacy, no API costs

### 🌍 Additional Providers

- **Mistral AI**: European option, GDPR-friendly
- **Cohere**: Excellent text generation
- **Perplexity**: Great for search-focused tasks
- **xAI (Grok)**: Latest models from X/Twitter

## Quick Setup

### 1. Choose Your Provider

For most users, we recommend **Groq** for the best speed/cost ratio:

```bash
# Copy environment template
cp .env.example .env.local

# Edit .env.local with these settings:
NEXT_PUBLIC_AI_PROVIDER=groq
AI_API_KEY=your_groq_api_key
NEXT_PUBLIC_AI_MODEL=llama-3.3-70b-versatile
```

### 2. Get API Key

**Top Recommendations:**
- **Groq**: [console.groq.com](https://console.groq.com) (free $25 credit, ultra-fast)
- **Google AI**: [ai.google.dev](https://ai.google.dev) (free tier, competitive pricing)
- **DeepSeek**: [platform.deepseek.com](https://platform.deepseek.com) (ultra-cheap, generous free tier)
- **Anthropic**: [console.anthropic.com](https://console.anthropic.com) (best quality, $5 credit)
- **OpenAI**: [platform.openai.com](https://platform.openai.com) (most reliable)

### 3. Enable Features

Choose which AI features to enable:

```env
# Enable specific features (set to true)
NEXT_PUBLIC_AI_PRODUCT_DESCRIPTIONS=true
NEXT_PUBLIC_AI_SEARCH_ENHANCEMENT=true
NEXT_PUBLIC_AI_RECOMMENDATIONS=true
NEXT_PUBLIC_AI_BUNDLE_SUGGESTIONS=true
NEXT_PUBLIC_AI_CUSTOMER_SUPPORT=true
NEXT_PUBLIC_AI_GROWING_GUIDES=true
NEXT_PUBLIC_AI_HOMEPAGE_PERSONALIZATION=true

# User behavior tracking (required for homepage personalization)
NEXT_PUBLIC_USER_TRACKING=true
```

## AI Features Explained

### 1. Product Description Enhancement
- **What**: AI-generated enhanced descriptions, growing tips, and benefits
- **Where**: Product detail pages
- **Cost**: ~100-300 tokens per product
- **Value**: Better product information, increased conversions

### 2. Search Enhancement  
- **What**: Smart search suggestions and query improvements
- **Where**: Search dropdown, search results
- **Cost**: ~50-150 tokens per search
- **Value**: Better search experience, find products faster

### 3. Product Recommendations
- **What**: AI-powered "customers also bought" and related products
- **Where**: Product pages, cart
- **Cost**: ~200-400 tokens per recommendation set
- **Value**: Increased average order value

### 4. Bundle Suggestions
- **What**: Smart product bundles based on growing workflows
- **Where**: Product pages, checkout
- **Cost**: ~300-500 tokens per bundle generation
- **Value**: Higher cart values, better customer experience

### 5. Customer Support Chat
- **What**: AI assistant for growing questions and product help
- **Where**: Floating chat button on all pages
- **Cost**: ~200-600 tokens per conversation
- **Value**: 24/7 support, reduced support tickets

### 6. Growing Guides
- **What**: Personalized cultivation guides for products
- **Where**: Product pages, knowledge base
- **Cost**: ~400-800 tokens per guide
- **Value**: Customer education, reduced returns

### 7. Dynamic Homepage Layouts
- **What**: AI-personalized homepage sections based on user behavior
- **Where**: Homepage, landing pages
- **Cost**: ~500-1000 tokens per layout generation
- **Value**: Increased engagement, personalized experience

### 8. A/B Testing Framework
- **What**: Built-in testing for different AI-generated layouts
- **Where**: Any page component
- **Cost**: No additional AI cost (analytics only)
- **Value**: Data-driven optimization, conversion improvement

## Cost Estimation

Based on a medium-traffic store (1000 visitors/day):

| Provider | Monthly Cost | Features Enabled | Notes |
|----------|-------------|------------------|-------|
| Groq | $5-15 | All features | Fastest, most cost-effective |
| Together AI | $10-25 | All features | Good balance |
| OpenAI | $20-50 | All features | Most reliable |
| Ollama | $0 | All features | Free but requires local server |

## Configuration Reference

### Environment Variables

```env
# AI Provider Configuration
NEXT_PUBLIC_AI_PROVIDER=groq                    # Provider choice
AI_API_KEY=your_api_key                         # API key (required except Ollama)
NEXT_PUBLIC_AI_MODEL=llama-3.1-8b-instant     # Model name (optional)
AI_MAX_TOKENS=1000                              # Max response length
AI_TEMPERATURE=0.7                              # Creativity level (0-1)
AI_BASE_URL=https://api.groq.com/openai/v1     # Custom API endpoint

# Feature Flags (true/false)
NEXT_PUBLIC_AI_PRODUCT_DESCRIPTIONS=true
NEXT_PUBLIC_AI_SEARCH_ENHANCEMENT=true
NEXT_PUBLIC_AI_RECOMMENDATIONS=true
NEXT_PUBLIC_AI_BUNDLE_SUGGESTIONS=true
NEXT_PUBLIC_AI_CUSTOMER_SUPPORT=true
NEXT_PUBLIC_AI_GROWING_GUIDES=true

# Ollama Configuration (if using local)
OLLAMA_HOST=http://localhost:11434/v1
```

### Model Recommendations by Use Case

**Fastest/Cheapest** (for high-traffic stores):
```env
NEXT_PUBLIC_AI_PROVIDER=groq
NEXT_PUBLIC_AI_MODEL=llama-3.1-8b-instant
```

**Best Quality** (for premium experience):
```env
NEXT_PUBLIC_AI_PROVIDER=openai
NEXT_PUBLIC_AI_MODEL=gpt-4o-mini
```

**Completely Free** (requires local setup):
```env
NEXT_PUBLIC_AI_PROVIDER=ollama
NEXT_PUBLIC_AI_MODEL=llama3.2:3b
OLLAMA_HOST=http://localhost:11434/v1
```

## Integration Guide

### Adding AI Components to Pages

The AI components are designed to integrate seamlessly:

#### Dynamic Homepage
```tsx
import DynamicHomepage from '@/components/ai/dynamic-homepage';
import BehaviorTrackingProvider from '@/components/providers/behavior-tracking-provider';

export default function HomePage({ products, collections }) {
  const defaultSections = [
    { id: 'hero', type: 'hero', title: 'Welcome', priority: 1 },
    { id: 'featured', type: 'featured-products', title: 'Featured', priority: 2 },
    // ... more sections
  ];

  return (
    <BehaviorTrackingProvider>
      <DynamicHomepage 
        defaultSections={defaultSections}
        products={products}
        collections={collections}
      />
    </BehaviorTrackingProvider>
  );
}
```

#### A/B Testing Framework
```tsx
import ABTestFramework, { SimpleABTest } from '@/components/ai/ab-testing-framework';

// Complex component testing
const testConfig = {
  testId: 'hero-layout-test',
  testName: 'Hero Section Layout',
  enabled: true,
  variants: [
    { id: 'original', name: 'Original', weight: 50, component: OriginalHero },
    { id: 'new', name: 'New Design', weight: 50, component: NewHero }
  ]
};

<ABTestFramework 
  config={testConfig} 
  fallbackComponent={OriginalHero}
  componentProps={{ products }}
/>

// Simple element testing
<SimpleABTest
  testId="cta-button-text"
  variants={[
    { id: 'a', content: 'Buy Now', weight: 50 },
    { id: 'b', content: 'Start Growing', weight: 50 }
  ]}
  fallback="Shop Now"
/>
```

#### Product Pages
```tsx
import AIProductEnhancement from '@/components/ai/ai-product-enhancement';

export default function ProductPage({ product }) {
  return (
    <div>
      {/* Existing product content */}
      <AIProductEnhancement product={product} />
      {/* More content */}
    </div>
  );
}
```

#### Search Pages
```tsx
import AISearchSuggestions from '@/components/ai/ai-search-suggestions';

export default function SearchPage() {
  return (
    <div>
      {/* Existing search */}
      <AISearchSuggestions 
        query={searchQuery}
        onSuggestionClick={handleSuggestion}
      />
    </div>
  );
}
```

#### Global Support Chat
```tsx
import AICustodySupport from '@/components/ai/ai-customer-support';

export default function Layout() {
  return (
    <div>
      {/* Your layout */}
      <AICustodySupport />
    </div>
  );
}
```

## Testing Setup

### 1. Local Development
```bash
# Start with Ollama (free)
docker run -d -v ollama:/root/.ollama -p 11434:11434 ollama/ollama
ollama run llama3.2:3b

# Set environment
NEXT_PUBLIC_AI_PROVIDER=ollama
NEXT_PUBLIC_AI_MODEL=llama3.2:3b
NEXT_PUBLIC_AI_PRODUCT_DESCRIPTIONS=true
```

### 2. Production Testing
```bash
# Start with small credits
NEXT_PUBLIC_AI_PROVIDER=groq
AI_API_KEY=your_test_key
# Enable one feature at a time
NEXT_PUBLIC_AI_CUSTOMER_SUPPORT=true
```

## Monitoring and Analytics

The AI system includes built-in monitoring:

- Token usage tracking
- Error rate monitoring  
- Performance metrics
- Cost estimation
- Feature usage analytics

Access monitoring via:
```
/api/ai/metrics (if implemented)
```

## Troubleshooting

### Common Issues

**AI features not showing**:
- Check `AI_API_KEY` is set
- Verify feature flags are `true`
- Check browser console for errors

**High costs**:
- Switch to cheaper model (llama-3.1-8b-instant)
- Reduce `AI_MAX_TOKENS`
- Disable unused features

**Slow responses**:
- Use Groq for fastest responses
- Reduce temperature and max tokens
- Implement caching

**Poor quality responses**:
- Switch to better model (gpt-4o-mini)
- Increase temperature slightly
- Provide more context

### Support

For AI feature support:
1. Check the [troubleshooting guide](#troubleshooting)
2. Review [configuration reference](#configuration-reference)
3. Test with different providers/models
4. Contact support with specific error messages

## Security Considerations

- API keys are server-side only (not exposed to client)
- All AI requests are proxied through your API routes
- User data is not stored by AI providers
- Conversations are not persisted beyond session
- Rate limiting is implemented on all AI endpoints

## Future Enhancements

Planned features:
- Visual product recommendations
- Inventory-aware bundling
- Multi-language support
- Advanced analytics dashboard
- A/B testing framework