# AI Features Testing Guide

## 🔐 FIRST - SECURE YOUR API KEY!

**CRITICAL**: The API key you shared earlier is now publicly exposed. You MUST:

1. **Go to OpenAI Platform**: [platform.openai.com](https://platform.openai.com)
2. **Revoke the key**: `sk-proj-77pbHQf1hu9...`
3. **Create a new key**
4. **Update .env.local** with the new key

## ✅ Setup Verification

After securing your API key, update your `.env.local`:

```env
# Replace with your NEW secure API key
AI_API_KEY=sk-proj-YOUR_NEW_SECURE_KEY

# Verify these settings are enabled
NEXT_PUBLIC_AI_PROVIDER=openai
NEXT_PUBLIC_AI_MODEL=gpt-4o-mini
NEXT_PUBLIC_AI_PRODUCT_DESCRIPTIONS=true
NEXT_PUBLIC_AI_SEARCH_ENHANCEMENT=true
NEXT_PUBLIC_AI_CUSTOMER_SUPPORT=true
NEXT_PUBLIC_AI_HOMEPAGE_PERSONALIZATION=true
NEXT_PUBLIC_USER_TRACKING=true
```

## 🧪 Testing Each AI Feature

### 1. AI Customer Support Chat
**What to test:**
- Look for a floating chat button (💬) in the bottom-right corner
- Click it to open the AI chat assistant
- Ask questions like:
  - "What growing kit should I buy as a beginner?"
  - "How do I sterilize my growing medium?"
  - "What's the difference between oyster and shiitake mushrooms?"

**Expected result:**
- Chat window opens with AI assistant
- Responses are mushroom cultivation focused
- Shows "AI Powered" badge

### 2. AI Search Suggestions
**What to test:**
- Go to the search bar in the header
- Start typing search terms like:
  - "oyster"
  - "growing"
  - "kit"
  - "substrate"

**Expected result:**
- AI-powered suggestions appear below search bar
- Shows "AI Suggestions" header with sparkle icon
- Suggestions are relevant to mushroom growing

### 3. AI Product Enhancements
**What to test:**
- Visit any product page (e.g., `/products/[product-handle]`)
- Look for "AI-Enhanced Product Info" section
- Click to expand it

**Expected result:**
- Collapsible section with AI-generated content
- Enhanced description, growing tips, benefits
- "AI Powered" badge visible

### 4. AI Homepage Personalization
**What to test:**
- Visit the homepage multiple times
- Search for different products
- Browse different categories
- Return to homepage

**Expected result:**
- Notice homepage sections may reorder based on your behavior
- See "Personalized for you" indicator if AI is active
- Different users see different layouts over time

### 5. User Behavior Tracking
**What to test:**
- Browse different products
- Use search functionality
- Spend time on different pages
- Check browser developer tools > Application > Local Storage

**Expected result:**
- `user_session` data stored locally
- No personal information stored
- Session data tracks interactions anonymously

## 🔍 Debugging

### Check if AI is Working

1. **Open browser developer tools** (F12)
2. **Go to Console tab**
3. **Look for AI-related logs** when using features

### Test API Connection

1. **Go to**: `/api/ai/support` (POST request)
2. **Send test data**:
```json
{
  "message": "Hello, test message",
  "history": []
}
```

### Verify Environment Variables

1. **Check**: All AI environment variables are set
2. **Verify**: API key is valid and not the compromised one
3. **Confirm**: Feature flags are enabled

## 🚨 Troubleshooting

### AI Features Not Showing
- ✅ Check API key is set and valid
- ✅ Verify feature flags are `true`
- ✅ Ensure no browser errors in console
- ✅ Try refreshing the page

### Chat Not Working
- ✅ Check network tab for API errors
- ✅ Verify OpenAI API key has credit
- ✅ Check console for error messages

### Search Suggestions Not Appearing
- ✅ Type at least 2 characters
- ✅ Wait a moment for AI response
- ✅ Check network requests to `/api/ai/search-suggestions`

### Homepage Not Personalizing
- ✅ Ensure `NEXT_PUBLIC_USER_TRACKING=true`
- ✅ Browse some products first to generate data
- ✅ Check if you see "Personalized for you" indicator

## 📊 Monitoring Costs

### Check Usage
1. **OpenAI Dashboard**: [platform.openai.com/usage](https://platform.openai.com/usage)
2. **Monitor daily usage**
3. **Set usage limits** to control costs

### Expected Costs (Testing)
- **Light testing**: $0.01-0.05 per day
- **Heavy testing**: $0.10-0.50 per day
- **Production**: $5-25 per month (1000 visitors/day)

## 🎯 Success Criteria

After testing, you should see:

- ✅ AI chat assistant responds to mushroom growing questions
- ✅ Search shows intelligent suggestions
- ✅ Product pages have AI-generated enhancements
- ✅ Homepage adapts to your browsing behavior
- ✅ All features work without breaking the site

## 🔄 Switching Providers

Want to try a different AI provider? Update these variables:

### For Groq (Ultra-Fast, Cheap)
```env
NEXT_PUBLIC_AI_PROVIDER=groq
AI_API_KEY=your_groq_key
NEXT_PUBLIC_AI_MODEL=llama-3.3-70b-versatile
```

### For Google Gemini (Fast, Cheap)
```env
NEXT_PUBLIC_AI_PROVIDER=google
AI_API_KEY=your_google_ai_key
NEXT_PUBLIC_AI_MODEL=gemini-1.5-flash
```

### For Claude 3.5 (Highest Quality)
```env
NEXT_PUBLIC_AI_PROVIDER=anthropic
AI_API_KEY=your_anthropic_key
NEXT_PUBLIC_AI_MODEL=claude-3-5-haiku-20241022
```

## 📈 Next Steps

Once AI features are working:

1. **Monitor performance** and costs
2. **Test different AI providers** for optimal results
3. **Enable more features** as needed
4. **Customize prompts** for your specific products
5. **Set up A/B testing** for layout variations

The AI system is now ready for testing! Remember to secure your API key first, then enjoy exploring the intelligent features.