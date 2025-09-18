// Debug script to test AI Brain Monitor
// Run this in the browser console to test AI tracking

console.log('🔧 [Debug] Starting AI Monitor debug...');

// Check if AI monitoring is loaded
const checkAIMonitor = () => {
  const toggle = document.querySelector('button[title*="AI Brain Monitor"]');
  console.log('🧠 [Debug] AI Monitor toggle button found:', !!toggle);
  
  if (toggle) {
    console.log('✅ [Debug] AI Monitor toggle button is present');
    toggle.style.border = '3px solid yellow';
    toggle.style.animation = 'pulse 1s infinite';
  } else {
    console.log('❌ [Debug] AI Monitor toggle button not found');
  }
  
  return !!toggle;
};

// Test behavior tracking
const testBehaviorTracking = () => {
  console.log('🔍 [Debug] Testing behavior tracking...');
  
  // Find product cards
  const productCards = document.querySelectorAll('[data-product-id]');
  console.log('📦 [Debug] Found product cards:', productCards.length);
  
  if (productCards.length > 0) {
    const firstCard = productCards[0];
    const productId = firstCard.getAttribute('data-product-id');
    console.log('🎯 [Debug] Testing with product ID:', productId);
    
    // Simulate hover
    console.log('👆 [Debug] Simulating hover...');
    firstCard.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    
    setTimeout(() => {
      firstCard.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
      console.log('👆 [Debug] Hover simulation complete');
    }, 1000);
    
    // Simulate click
    setTimeout(() => {
      console.log('🖱️ [Debug] Simulating click...');
      firstCard.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    }, 1500);
  }
};

// Listen for AI events
const listenForAIEvents = () => {
  console.log('👂 [Debug] Setting up event listeners...');
  
  window.addEventListener('behavior-tracked', (event) => {
    console.log('🎉 [Debug] Behavior event captured:', event.detail);
  });
  
  window.addEventListener('predictive-prefetch', (event) => {
    console.log('🚀 [Debug] Prefetch event captured:', event.detail);
  });
  
  window.addEventListener('conversion-strategy', (event) => {
    console.log('💰 [Debug] Conversion strategy event:', event.detail);
  });
};

// Run debug sequence
const runDebug = () => {
  console.log('🚀 [Debug] Running AI Monitor debug sequence...');
  
  listenForAIEvents();
  
  setTimeout(() => {
    if (checkAIMonitor()) {
      testBehaviorTracking();
    }
  }, 1000);
  
  // Check for dashboard after 3 seconds
  setTimeout(() => {
    const dashboard = document.querySelector('[class*="ai-monitoring-dashboard"], [class*="brain"]');
    console.log('📊 [Debug] AI Dashboard found:', !!dashboard);
  }, 3000);
};

// Start debug
runDebug();

console.log('🔧 [Debug] Debug script loaded. Watch for events above.');
console.log('💡 [Debug] Try hovering over product cards or clicking the 🧠 button');