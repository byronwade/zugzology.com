"use client";

import { userBehaviorTracker } from './user-behavior-tracker';

export interface BehaviorScore {
  productId: string;
  score: number;
  signals: {
    views: number;
    hovers: number;
    hoverDuration: number;
    wishlistAdded: boolean;
    cartAdded: boolean;
    purchased: boolean;
    searchAppearances: number;
    categoryMatch: boolean;
    priceRangeMatch: boolean;
    relatedProductViews: number;
  };
  lastInteraction: number;
  predictedAction: 'view' | 'wishlist' | 'cart' | 'purchase' | null;
  confidence: number;
}

export interface UserProfile {
  userId?: string;
  sessionId: string;
  preferences: {
    categories: Map<string, number>;
    priceRange: { min: number; max: number };
    brands: Map<string, number>;
    features: Map<string, number>;
  };
  behaviorScores: Map<string, BehaviorScore>;
  searchHistory: string[];
  failedSearches?: Array<{
    query: string;
    searchIntent: any;
    timestamp: number;
    frequency: number;
  }>;
  purchaseHistory: string[];
  wishlist: string[];
  cart: string[];
}

class AdvancedBehaviorTracker {
  private userProfile: UserProfile;
  private hoverTimers: Map<string, number> = new Map();
  private hoverStartTimes: Map<string, number> = new Map();
  private interactionWeights = {
    hover: 1,
    hoverDuration: 0.5, // per second
    view: 3,
    wishlist: 10,
    cart: 15,
    purchase: 25,
    search: 2,
    relatedView: 4
  };
  private predictionThresholds = {
    view: 5,
    wishlist: 15,
    cart: 25,
    purchase: 40
  };

  constructor() {
    this.userProfile = this.initializeProfile();
    if (typeof window !== 'undefined') {
      this.loadProfile();
      this.setupAdvancedTracking();
    }
  }

  private initializeProfile(): UserProfile {
    return {
      sessionId: this.generateSessionId(),
      preferences: {
        categories: new Map(),
        priceRange: { min: 0, max: Infinity },
        brands: new Map(),
        features: new Map()
      },
      behaviorScores: new Map(),
      searchHistory: [],
      purchaseHistory: [],
      wishlist: [],
      cart: []
    };
  }

  private generateSessionId(): string {
    return `adv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private loadProfile() {
    try {
      const savedProfile = localStorage.getItem('advanced_user_profile');
      if (savedProfile) {
        const parsed = JSON.parse(savedProfile);
        
        // Reconstruct Maps from saved data
        this.userProfile = {
          ...parsed,
          preferences: {
            categories: new Map(parsed.preferences.categories),
            priceRange: parsed.preferences.priceRange,
            brands: new Map(parsed.preferences.brands),
            features: new Map(parsed.preferences.features)
          },
          behaviorScores: new Map(parsed.behaviorScores)
        };
      }

      // Load search history from browser
      this.loadSearchHistory();
    } catch (error) {
      console.error('Error loading advanced profile:', error);
    }
  }

  private loadSearchHistory() {
    try {
      // Try to get search history from sessionStorage
      const recentSearches = sessionStorage.getItem('recent_searches');
      if (recentSearches) {
        this.userProfile.searchHistory = JSON.parse(recentSearches);
      }

      // Also check localStorage for persistent searches
      const savedSearches = localStorage.getItem('search_history');
      if (savedSearches) {
        const parsed = JSON.parse(savedSearches);
        this.userProfile.searchHistory = [
          ...new Set([...this.userProfile.searchHistory, ...parsed])
        ].slice(0, 50); // Keep last 50 unique searches
      }
    } catch (error) {
      console.error('Error loading search history:', error);
    }
  }

  private saveProfile() {
    try {
      const profileToSave = {
        ...this.userProfile,
        preferences: {
          categories: Array.from(this.userProfile.preferences.categories.entries()),
          priceRange: this.userProfile.preferences.priceRange,
          brands: Array.from(this.userProfile.preferences.brands.entries()),
          features: Array.from(this.userProfile.preferences.features.entries())
        },
        behaviorScores: Array.from(this.userProfile.behaviorScores.entries())
      };
      
      localStorage.setItem('advanced_user_profile', JSON.stringify(profileToSave));
    } catch (error) {
      console.error('Error saving advanced profile:', error);
    }
  }

  private setupAdvancedTracking() {
    // Enhanced hover tracking with duration
    document.addEventListener('mouseenter', this.handleMouseEnter, true);
    document.addEventListener('mouseleave', this.handleMouseLeave, true);
    
    // Track link clicks with intent prediction
    document.addEventListener('click', this.handleClick, true);
    
    // Track form inputs for search
    document.addEventListener('input', this.handleSearchInput, true);
    
    // Track scroll patterns
    this.setupScrollTracking();
    
    // Save profile periodically
    setInterval(() => this.saveProfile(), 15000);
    
    // Track page visibility
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.saveProfile();
      }
    });
  }

  private handleMouseEnter = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    if (!target || typeof target.closest !== 'function') return;
    const productElement = target.closest('[data-product-id]');
    
    if (productElement) {
      const productId = productElement.getAttribute('data-product-id');
      if (productId) {
        console.log('🔍 [AI Tracker] Mouse enter detected for product:', productId);
        this.hoverStartTimes.set(productId, Date.now());
        
        // Clear any existing timer
        const existingTimer = this.hoverTimers.get(productId);
        if (existingTimer) {
          clearTimeout(existingTimer);
        }
        
        // Set timer to track significant hovers (>500ms)
        const timer = window.setTimeout(() => {
          this.trackHover(productId, 500);
        }, 500);
        
        this.hoverTimers.set(productId, timer);
      }
    }
  };

  private handleMouseLeave = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    if (!target || typeof target.closest !== 'function') return;
    const productElement = target.closest('[data-product-id]');
    
    if (productElement) {
      const productId = productElement.getAttribute('data-product-id');
      if (productId) {
        console.log('🔍 [AI Tracker] Mouse leave detected for product:', productId);
        const startTime = this.hoverStartTimes.get(productId);
        if (startTime) {
          const duration = Date.now() - startTime;
          console.log('🔍 [AI Tracker] Hover duration:', duration, 'ms');
          if (duration > 200) { // Track hovers longer than 200ms
            this.trackHover(productId, duration);
          }
          this.hoverStartTimes.delete(productId);
        }
        
        const timer = this.hoverTimers.get(productId);
        if (timer) {
          clearTimeout(timer);
          this.hoverTimers.delete(productId);
        }
      }
    }
  };

  private handleClick = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    
    // Track product clicks
    const productElement = target.closest('[data-product-id]');
    if (productElement) {
      const productId = productElement.getAttribute('data-product-id');
      if (productId) {
        this.updateBehaviorScore(productId, 'view');
      }
    }
    
    // Track wishlist clicks
    if (target.closest('[data-wishlist-add]')) {
      const productId = target.closest('[data-wishlist-add]')?.getAttribute('data-product-id');
      if (productId) {
        this.trackWishlistAdd(productId);
      }
    }
    
    // Track cart clicks
    if (target.closest('[data-cart-add]')) {
      const productId = target.closest('[data-cart-add]')?.getAttribute('data-product-id');
      if (productId) {
        this.trackCartAdd(productId);
      }
    }
  };

  private handleSearchInput = (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (target.type === 'search' || target.name === 'search' || target.placeholder?.toLowerCase().includes('search')) {
      const query = target.value.trim();
      if (query.length > 2) {
        // Debounced search tracking
        clearTimeout((window as any).__searchTimeout);
        (window as any).__searchTimeout = setTimeout(() => {
          this.trackSearch(query);
        }, 500);
      }
    }
  };

  private setupScrollTracking() {
    let scrollTimer: NodeJS.Timeout;
    let lastScrollPosition = 0;
    
    window.addEventListener('scroll', () => {
      clearTimeout(scrollTimer);
      
      scrollTimer = setTimeout(() => {
        const currentPosition = window.scrollY;
        const scrollDirection = currentPosition > lastScrollPosition ? 'down' : 'up';
        const scrollSpeed = Math.abs(currentPosition - lastScrollPosition);
        
        // Track fast scrolling as scanning behavior
        if (scrollSpeed > 500) {
          this.trackBehavior('scanning', { speed: scrollSpeed, direction: scrollDirection });
        }
        
        lastScrollPosition = currentPosition;
      }, 100);
    });
  }

  // Core tracking methods
  public trackHover(productId: string, duration: number) {
    const score = this.getOrCreateBehaviorScore(productId);
    score.signals.hovers++;
    score.signals.hoverDuration += duration;
    const scoreIncrease = this.interactionWeights.hover + (duration / 1000) * this.interactionWeights.hoverDuration;
    score.score += scoreIncrease;
    score.lastInteraction = Date.now();
    
    // Emit event for real-time monitoring
    if (typeof window !== 'undefined') {
      console.log('🔍 [AI Tracker] Hover event:', { productId, duration, score: Math.round(scoreIncrease) });
      window.dispatchEvent(new CustomEvent('behavior-tracked', {
        detail: {
          type: 'hover',
          productId,
          duration,
          score: Math.round(scoreIncrease),
          totalScore: Math.round(score.score),
          timestamp: Date.now()
        }
      }));
    }
    
    this.updatePrediction(productId);
    this.prefetchIfNeeded(productId);
  }

  public trackProductView(productId: string, productData?: any) {
    const score = this.getOrCreateBehaviorScore(productId);
    score.signals.views++;
    score.score += this.interactionWeights.view;
    score.lastInteraction = Date.now();
    
    // Update category preferences
    if (productData?.category) {
      const categoryScore = this.userProfile.preferences.categories.get(productData.category) || 0;
      this.userProfile.preferences.categories.set(productData.category, categoryScore + 1);
    }
    
    // Update price range preferences
    if (productData?.price) {
      const price = parseFloat(productData.price);
      if (!isNaN(price)) {
        this.updatePriceRange(price);
      }
    }
    
    // Emit event for real-time monitoring
    if (typeof window !== 'undefined') {
      console.log('🔍 [AI Tracker] View event:', { productId, category: productData?.category, score: this.interactionWeights.view });
      window.dispatchEvent(new CustomEvent('behavior-tracked', {
        detail: {
          type: 'view',
          productId,
          category: productData?.category,
          price: productData?.price,
          score: this.interactionWeights.view,
          totalScore: Math.round(score.score),
          timestamp: Date.now()
        }
      }));
    }
    
    this.updatePrediction(productId);
    this.trackRelatedProducts(productId);
  }

  public trackWishlistAdd(productId: string) {
    const score = this.getOrCreateBehaviorScore(productId);
    score.signals.wishlistAdded = true;
    score.score += this.interactionWeights.wishlist;
    score.lastInteraction = Date.now();
    
    if (!this.userProfile.wishlist.includes(productId)) {
      this.userProfile.wishlist.push(productId);
    }
    
    // Emit event for real-time monitoring
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('behavior-tracked', {
        detail: {
          type: 'wishlist',
          productId,
          action: 'add',
          score: this.interactionWeights.wishlist,
          totalScore: Math.round(score.score),
          timestamp: Date.now()
        }
      }));
      
      // Trigger immediate re-scoring of all products
      window.dispatchEvent(new CustomEvent('user-behavior-changed', {
        detail: { type: 'wishlist_add', productId, impactLevel: 'high' }
      }));
    }
    
    this.updatePrediction(productId);
    this.boostRelatedProducts(productId, 0.5);
    this.saveProfile(); // Save immediately after wishlist changes
  }

  public trackWishlistRemove(productId: string) {
    const score = this.getOrCreateBehaviorScore(productId);
    score.signals.wishlistAdded = false;
    score.score = Math.max(0, score.score - this.interactionWeights.wishlist);
    score.lastInteraction = Date.now();
    
    this.userProfile.wishlist = this.userProfile.wishlist.filter(id => id !== productId);
    
    // Emit event for real-time monitoring
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('behavior-tracked', {
        detail: {
          type: 'wishlist',
          productId,
          action: 'remove',
          score: -this.interactionWeights.wishlist,
          totalScore: Math.round(score.score),
          timestamp: Date.now()
        }
      }));
      
      // Trigger immediate re-scoring
      window.dispatchEvent(new CustomEvent('user-behavior-changed', {
        detail: { type: 'wishlist_remove', productId, impactLevel: 'medium' }
      }));
    }
    
    this.updatePrediction(productId);
    this.saveProfile();
  }

  public trackCartAdd(productId: string) {
    const score = this.getOrCreateBehaviorScore(productId);
    score.signals.cartAdded = true;
    score.score += this.interactionWeights.cart;
    score.lastInteraction = Date.now();
    
    if (!this.userProfile.cart.includes(productId)) {
      this.userProfile.cart.push(productId);
    }
    
    // Emit event for real-time monitoring
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('behavior-tracked', {
        detail: {
          type: 'cart',
          productId,
          action: 'add',
          score: this.interactionWeights.cart,
          totalScore: Math.round(score.score),
          timestamp: Date.now()
        }
      }));
      
      // Trigger immediate re-scoring - cart adds are very high intent
      window.dispatchEvent(new CustomEvent('user-behavior-changed', {
        detail: { type: 'cart_add', productId, impactLevel: 'critical' }
      }));
    }
    
    this.updatePrediction(productId);
    this.boostRelatedProducts(productId, 0.7);
    this.saveProfile(); // Save immediately after cart changes
  }

  public trackCartRemove(productId: string) {
    const score = this.getOrCreateBehaviorScore(productId);
    score.signals.cartAdded = false;
    score.score = Math.max(0, score.score - this.interactionWeights.cart);
    score.lastInteraction = Date.now();
    
    this.userProfile.cart = this.userProfile.cart.filter(id => id !== productId);
    
    // Emit event for real-time monitoring
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('behavior-tracked', {
        detail: {
          type: 'cart',
          productId,
          action: 'remove',
          score: -this.interactionWeights.cart,
          totalScore: Math.round(score.score),
          timestamp: Date.now()
        }
      }));
      
      // Trigger immediate re-scoring
      window.dispatchEvent(new CustomEvent('user-behavior-changed', {
        detail: { type: 'cart_remove', productId, impactLevel: 'high' }
      }));
    }
    
    this.updatePrediction(productId);
    this.saveProfile();
  }

  public trackPurchase(productId: string) {
    const score = this.getOrCreateBehaviorScore(productId);
    score.signals.purchased = true;
    score.score += this.interactionWeights.purchase;
    score.lastInteraction = Date.now();
    
    if (!this.userProfile.purchaseHistory.includes(productId)) {
      this.userProfile.purchaseHistory.push(productId);
    }
    
    this.updatePrediction(productId);
    this.boostRelatedProducts(productId, 1.0);
  }

  public trackSearch(query: string, resultsFound: number = 0, matchedProducts: string[] = []) {
    const normalizedQuery = query.toLowerCase().trim();
    
    if (!this.userProfile.searchHistory.includes(normalizedQuery)) {
      this.userProfile.searchHistory.unshift(normalizedQuery);
      this.userProfile.searchHistory = this.userProfile.searchHistory.slice(0, 50);
    }
    
    // Extract search intent and keywords
    const searchIntent = this.analyzeSearchIntent(normalizedQuery);
    
    // Boost scores for products that match search terms
    this.userProfile.behaviorScores.forEach((score, productId) => {
      if (matchedProducts.includes(productId)) {
        score.signals.searchAppearances++;
        score.score += this.interactionWeights.search;
      }
    });
    
    // Track failed searches for product gap analysis
    if (resultsFound === 0) {
      this.trackFailedSearch(normalizedQuery, searchIntent);
    }
    
    // Boost related product categories based on search intent
    this.boostCategoryFromSearch(searchIntent);
    
    // Emit event for real-time monitoring
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('behavior-tracked', {
        detail: {
          type: 'search',
          query: normalizedQuery,
          searchIntent,
          resultsFound,
          matchedProducts: matchedProducts.length,
          searchCount: this.userProfile.searchHistory.length,
          score: this.interactionWeights.search,
          timestamp: Date.now()
        }
      }));
      
      // Trigger re-scoring if this is a meaningful search
      if (resultsFound > 0 || searchIntent.category) {
        window.dispatchEvent(new CustomEvent('user-behavior-changed', {
          detail: { type: 'search_performed', query: normalizedQuery, impactLevel: 'medium' }
        }));
      }
    }
    
    this.saveSearchHistory();
  }

  private analyzeSearchIntent(query: string) {
    const intent = {
      category: null as string | null,
      productType: null as string | null,
      keywords: query.split(/\s+/).filter(word => word.length > 2),
      intent: 'general' as 'general' | 'specific' | 'comparative' | 'instructional'
    };

    // Category mapping for mushroom cultivation store
    const categoryMappings = {
      'grow': 'grow-supplies',
      'kit': 'grow-supplies', 
      'kits': 'grow-supplies',
      'growing': 'grow-supplies',
      'cultivation': 'grow-supplies',
      'substrate': 'grow-supplies',
      'spawn': 'grow-supplies',
      'spore': 'microscopy-use',
      'spores': 'microscopy-use',
      'syringe': 'microscopy-use',
      'liquid culture': 'liquid-culture',
      'culture': 'liquid-culture',
      'supplement': 'medicinal',
      'tincture': 'medicinal',
      'extract': 'medicinal',
      'wellness': 'medicinal',
      'reishi': 'medicinal',
      'lions mane': 'medicinal',
      'shiitake': 'culinary',
      'oyster': 'culinary',
      'food': 'culinary',
      'cooking': 'culinary',
      'mushroom': 'general'
    };

    // Detect category intent
    for (const [keyword, category] of Object.entries(categoryMappings)) {
      if (query.includes(keyword)) {
        intent.category = category;
        break;
      }
    }

    // Detect search intent type
    if (query.includes('vs') || query.includes('compare') || query.includes('difference')) {
      intent.intent = 'comparative';
    } else if (query.includes('how to') || query.includes('guide') || query.includes('instructions')) {
      intent.intent = 'instructional';
    } else if (intent.keywords.length <= 2 && intent.category) {
      intent.intent = 'specific';
    }

    return intent;
  }

  private trackFailedSearch(query: string, searchIntent: any) {
    // Store failed searches for product gap analysis
    if (!this.userProfile.failedSearches) {
      this.userProfile.failedSearches = [];
    }
    
    this.userProfile.failedSearches.unshift({
      query,
      searchIntent,
      timestamp: Date.now(),
      frequency: 1
    });
    
    // Keep only last 20 failed searches
    this.userProfile.failedSearches = this.userProfile.failedSearches.slice(0, 20);
    
    // Emit special event for failed searches
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('behavior-tracked', {
        detail: {
          type: 'failed_search',
          query,
          searchIntent,
          score: 0,
          timestamp: Date.now()
        }
      }));
    }
  }

  private boostCategoryFromSearch(searchIntent: any) {
    if (searchIntent.category) {
      const currentScore = this.userProfile.preferences.categories.get(searchIntent.category) || 0;
      this.userProfile.preferences.categories.set(searchIntent.category, currentScore + 3);
    }
    
    // Boost specific product types
    searchIntent.keywords.forEach((keyword: string) => {
      const currentScore = this.userProfile.preferences.categories.get(keyword) || 0;
      this.userProfile.preferences.categories.set(keyword, currentScore + 1);
    });
  }

  private trackBehavior(type: string, data: any) {
    // Generic behavior tracking for analysis
    userBehaviorTracker.trackInteraction(type as any, data);
  }

  private trackRelatedProducts(productId: string) {
    // Track views of related products to identify patterns
    // This would integrate with your product recommendation system
  }

  private boostRelatedProducts(productId: string, factor: number) {
    // Boost scores of products related to this one
    // This helps predict cross-sell opportunities
  }

  private getOrCreateBehaviorScore(productId: string): BehaviorScore {
    let score = this.userProfile.behaviorScores.get(productId);
    
    if (!score) {
      score = {
        productId,
        score: 0,
        signals: {
          views: 0,
          hovers: 0,
          hoverDuration: 0,
          wishlistAdded: false,
          cartAdded: false,
          purchased: false,
          searchAppearances: 0,
          categoryMatch: false,
          priceRangeMatch: false,
          relatedProductViews: 0
        },
        lastInteraction: Date.now(),
        predictedAction: null,
        confidence: 0
      };
      
      this.userProfile.behaviorScores.set(productId, score);
    }
    
    return score;
  }

  private updatePrediction(productId: string) {
    const score = this.userProfile.behaviorScores.get(productId);
    if (!score) return;
    
    // Calculate prediction based on score thresholds
    let predictedAction: BehaviorScore['predictedAction'] = null;
    let confidence = 0;
    
    if (score.score >= this.predictionThresholds.purchase) {
      predictedAction = 'purchase';
      confidence = Math.min(95, 50 + score.score);
    } else if (score.score >= this.predictionThresholds.cart) {
      predictedAction = 'cart';
      confidence = Math.min(85, 40 + score.score);
    } else if (score.score >= this.predictionThresholds.wishlist) {
      predictedAction = 'wishlist';
      confidence = Math.min(75, 30 + score.score);
    } else if (score.score >= this.predictionThresholds.view) {
      predictedAction = 'view';
      confidence = Math.min(65, 20 + score.score);
    }
    
    // Adjust confidence based on recency
    const hoursSinceInteraction = (Date.now() - score.lastInteraction) / (1000 * 60 * 60);
    if (hoursSinceInteraction > 24) {
      confidence *= 0.8;
    } else if (hoursSinceInteraction > 72) {
      confidence *= 0.6;
    }
    
    score.predictedAction = predictedAction;
    score.confidence = confidence;
  }

  private updatePriceRange(price: number) {
    const range = this.userProfile.preferences.priceRange;
    const viewedPrices = Array.from(this.userProfile.behaviorScores.values())
      .map(s => s.signals.priceRangeMatch ? price : 0)
      .filter(p => p > 0);
    
    if (viewedPrices.length > 0) {
      range.min = Math.min(...viewedPrices) * 0.8;
      range.max = Math.max(...viewedPrices) * 1.2;
    }
  }

  private prefetchIfNeeded(productId: string) {
    const score = this.userProfile.behaviorScores.get(productId);
    if (!score) return;
    
    // Trigger prefetch if confidence is high
    if (score.confidence > 60 && score.predictedAction) {
      this.triggerPrefetch(productId, score.predictedAction);
    }
  }

  private triggerPrefetch(productId: string, action: string) {
    // Emit custom event for prefetch system
    window.dispatchEvent(new CustomEvent('predictive-prefetch', {
      detail: { productId, action, confidence: this.userProfile.behaviorScores.get(productId)?.confidence }
    }));
  }

  private saveSearchHistory() {
    try {
      sessionStorage.setItem('recent_searches', JSON.stringify(this.userProfile.searchHistory.slice(0, 10)));
      localStorage.setItem('search_history', JSON.stringify(this.userProfile.searchHistory));
    } catch (error) {
      console.error('Error saving search history:', error);
    }
  }

  private updateBehaviorScore(productId: string, actionType: string) {
    // This method is referenced but not defined in the current code
    // Let's add it to handle generic behavior scoring
    const score = this.getOrCreateBehaviorScore(productId);
    
    switch (actionType) {
      case 'view':
        this.trackProductView(productId);
        break;
      case 'hover':
        this.trackHover(productId, 1000); // Default hover duration
        break;
      case 'wishlist':
        this.trackWishlistAdd(productId);
        break;
      case 'cart':
        this.trackCartAdd(productId);
        break;
    }
  }

  // Public API methods
  public getPredictedProducts(limit: number = 10): Array<{ productId: string; score: number; prediction: string }> {
    return Array.from(this.userProfile.behaviorScores.entries())
      .filter(([_, score]) => score.predictedAction && score.confidence > 50)
      .sort((a, b) => b[1].score - a[1].score)
      .slice(0, limit)
      .map(([productId, score]) => ({
        productId,
        score: score.score,
        prediction: score.predictedAction || 'view'
      }));
  }

  public getHighIntentProducts(): string[] {
    return Array.from(this.userProfile.behaviorScores.entries())
      .filter(([_, score]) => score.confidence > 70 && (score.predictedAction === 'cart' || score.predictedAction === 'purchase'))
      .sort((a, b) => b[1].confidence - a[1].confidence)
      .map(([productId]) => productId);
  }

  public getUserPreferences() {
    return {
      topCategories: Array.from(this.userProfile.preferences.categories.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5),
      priceRange: this.userProfile.preferences.priceRange,
      searchHistory: this.userProfile.searchHistory.slice(0, 10),
      wishlist: this.userProfile.wishlist,
      cart: this.userProfile.cart
    };
  }

  public getConversionPrediction(productId: string): { likelihood: number; nextAction: string | null } {
    const score = this.userProfile.behaviorScores.get(productId);
    if (!score) {
      return { likelihood: 0, nextAction: null };
    }
    
    return {
      likelihood: score.confidence,
      nextAction: score.predictedAction
    };
  }

  public getBehaviorData() {
    return {
      interactions: Array.from(this.userProfile.behaviorScores.values()),
      searchHistory: this.userProfile.searchHistory,
      viewedProducts: Array.from(this.userProfile.behaviorScores.keys()),
      timeOnSite: Date.now() - this.userProfile.sessionId.split('_')[1] || 0,
      sessionCount: 1,
      categories: Array.from(this.userProfile.preferences.categories.keys())
    };
  }

  public clearData() {
    this.userProfile = this.initializeProfile();
    localStorage.removeItem('advanced_user_profile');
    localStorage.removeItem('search_history');
    sessionStorage.removeItem('recent_searches');
  }
}

// Export singleton instance
export const advancedBehaviorTracker = new AdvancedBehaviorTracker();
export default advancedBehaviorTracker;