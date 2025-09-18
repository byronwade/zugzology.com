"use client";

import { useEffect } from 'react';
import { aiConfig, aiFeatures } from '@/lib/config/ai-config';

export function AISystemLogger() {
  useEffect(() => {
    // Show AI system status immediately
    console.log('🤖 ===== AI SYSTEM STATUS =====');
    console.log('🤖 Configuration:', {
      enabled: aiConfig.enabled,
      provider: aiConfig.provider,
      model: aiConfig.model,
      hasApiKey: Boolean(aiConfig.apiKey),
      apiKeyPreview: aiConfig.apiKey ? `${aiConfig.apiKey.substring(0, 10)}...` : 'None'
    });
    
    console.log('🤖 Features Status:');
    Object.entries(aiFeatures).forEach(([feature, enabled]) => {
      console.log(`  ${enabled ? '✅' : '❌'} ${feature}: ${enabled}`);
    });

    console.log('🤖 Environment Variables:');
    console.log('  NEXT_PUBLIC_AI_PROVIDER:', process.env.NEXT_PUBLIC_AI_PROVIDER);
    console.log('  NEXT_PUBLIC_AI_MODEL:', process.env.NEXT_PUBLIC_AI_MODEL);
    console.log('  NEXT_PUBLIC_USER_TRACKING:', process.env.NEXT_PUBLIC_USER_TRACKING);
    console.log('  NEXT_PUBLIC_AI_HOMEPAGE_PERSONALIZATION:', process.env.NEXT_PUBLIC_AI_HOMEPAGE_PERSONALIZATION);
    console.log('  NEXT_PUBLIC_AI_CUSTOMER_SUPPORT:', process.env.NEXT_PUBLIC_AI_CUSTOMER_SUPPORT);
    console.log('  NEXT_PUBLIC_AI_SEARCH_ENHANCEMENT:', process.env.NEXT_PUBLIC_AI_SEARCH_ENHANCEMENT);
    console.log('  NEXT_PUBLIC_AI_PRODUCT_DESCRIPTIONS:', process.env.NEXT_PUBLIC_AI_PRODUCT_DESCRIPTIONS);

    if (!aiConfig.enabled) {
      console.warn('⚠️ AI System is DISABLED. Possible reasons:');
      console.warn('  - No API key provided');
      console.warn('  - Provider not supported');
      console.warn('  - Environment variables not set correctly');
    } else {
      console.log('🎉 AI System is ENABLED and ready!');
      console.log('🎯 Look for these components:');
      console.log('  💬 Chat button (bottom-right) - AI Customer Support');
      console.log('  🔍 Search suggestions - Type in search bar');
      console.log('  ✨ Product enhancements - Visit product pages');
      console.log('  🏠 Homepage personalization - Browse and return');
    }
    
    console.log('🤖 ========================');
  }, []);

  return null; // This component doesn't render anything
}

export default AISystemLogger;