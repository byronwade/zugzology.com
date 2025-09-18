import { NextRequest, NextResponse } from 'next/server';
import { aiClient } from '@/lib/services/ai-client';
import { isAIFeatureEnabled } from '@/lib/config/ai-config';

interface SupportMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function POST(request: NextRequest) {
  console.log('🚀 [AI API] Support endpoint called');
  
  try {
    // Check if AI customer support is enabled
    const isEnabled = isAIFeatureEnabled('customerSupport');
    console.log('🚀 [AI API] Support feature enabled:', isEnabled);
    
    if (!isEnabled) {
      console.log('🚀 [AI API] Support disabled - returning 503');
      return NextResponse.json(
        { error: 'AI customer support is not enabled' },
        { status: 503 }
      );
    }

    const { message, history } = await request.json();
    console.log('🚀 [AI API] Request data:', { 
      messageLength: message?.length, 
      historyCount: history?.length 
    });

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Build conversation context
    const systemPrompt = `You are a helpful customer support assistant for Zugzology, a premium mushroom growing supplies store. You specialize in:

- Mushroom cultivation techniques and best practices
- Product recommendations for growing supplies
- Troubleshooting growing problems
- Beginner guidance and education
- Safety and sterilization practices

Key products we sell:
- Growing kits (oyster, shiitake, lion's mane)
- Substrates and growing mediums
- Sterilization equipment
- Tools and supplies
- Spores and cultures

Guidelines:
- Be helpful, friendly, and knowledgeable
- Provide specific, actionable advice
- Recommend products when relevant
- Ask clarifying questions if needed
- Stay focused on mushroom cultivation topics
- If asked about unrelated topics, politely redirect
- Keep responses concise but informative
- Emphasize safety and proper techniques

Always aim to be educational while being sales-supportive.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...(Array.isArray(history) ? history.slice(-5) : []), // Last 5 messages for context
      { role: 'user', content: message }
    ];

    console.log('🚀 [AI API] Calling AI client with', messages.length, 'messages');
    
    const response = await aiClient.chat(messages, {
      maxTokens: 500,
      temperature: 0.7
    });

    console.log('🚀 [AI API] AI response received:', { 
      contentLength: response.content?.length,
      usage: response.usage 
    });

    return NextResponse.json({
      response: response.content,
      usage: response.usage
    });

  } catch (error) {
    console.error('AI Support API Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Unable to process your request at this time',
        fallback: "I'm having trouble connecting right now. For immediate help, please contact our support team or check our knowledge base."
      },
      { status: 500 }
    );
  }
}