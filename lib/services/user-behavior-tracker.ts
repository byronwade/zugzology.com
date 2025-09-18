"use client";

export interface UserInteraction {
  type: 'page_view' | 'product_view' | 'search' | 'add_to_cart' | 'purchase' | 'time_on_page' | 'scroll_depth' | 'click';
  timestamp: number;
  data: any;
  sessionId: string;
  userId?: string;
}

export interface UserSession {
  sessionId: string;
  userId?: string;
  startTime: number;
  lastActivity: number;
  deviceType: 'mobile' | 'tablet' | 'desktop';
  userAgent: string;
  referrer?: string;
  interactions: UserInteraction[];
}

class UserBehaviorTracker {
  private sessionId: string;
  private userId?: string;
  private interactions: UserInteraction[] = [];
  private sessionStartTime: number;
  private lastActivity: number;
  private isTracking: boolean = false;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.sessionStartTime = Date.now();
    this.lastActivity = Date.now();
    
    // Only initialize if in browser
    if (typeof window !== 'undefined') {
      this.initializeTracking();
    }
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private initializeTracking() {
    // Check if tracking is enabled
    const trackingEnabled = process.env.NEXT_PUBLIC_USER_TRACKING === 'true' || 
                           process.env.NEXT_PUBLIC_AI_HOMEPAGE_PERSONALIZATION === 'true';
    
    if (!trackingEnabled) {
      return;
    }

    this.isTracking = true;
    
    // Load existing session data
    this.loadSession();
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Start automatic saving
    this.startAutoSave();
    
    // Track initial page view
    this.trackPageView(window.location.pathname);
  }

  private loadSession() {
    try {
      const savedSession = localStorage.getItem('user_session');
      if (savedSession) {
        const session: UserSession = JSON.parse(savedSession);
        
        // Continue session if less than 30 minutes old
        if (Date.now() - session.lastActivity < 30 * 60 * 1000) {
          this.sessionId = session.sessionId;
          this.userId = session.userId;
          this.interactions = session.interactions || [];
          this.sessionStartTime = session.startTime;
        }
      }
    } catch (error) {
      console.error('Error loading session:', error);
    }
  }

  private saveSession() {
    if (!this.isTracking) return;
    
    try {
      const session: UserSession = {
        sessionId: this.sessionId,
        userId: this.userId,
        startTime: this.sessionStartTime,
        lastActivity: this.lastActivity,
        deviceType: this.getDeviceType(),
        userAgent: navigator.userAgent,
        referrer: document.referrer,
        interactions: this.interactions.slice(-100) // Keep last 100 interactions
      };
      
      localStorage.setItem('user_session', JSON.stringify(session));
    } catch (error) {
      console.error('Error saving session:', error);
    }
  }

  private setupEventListeners() {
    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.saveSession();
      } else {
        this.updateActivity();
      }
    });

    // Track beforeunload
    window.addEventListener('beforeunload', () => {
      this.saveSession();
    });

    // Track scroll depth
    let maxScrollDepth = 0;
    window.addEventListener('scroll', () => {
      const scrollDepth = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
      if (scrollDepth > maxScrollDepth) {
        maxScrollDepth = scrollDepth;
        this.trackInteraction('scroll_depth', { depth: scrollDepth });
      }
    });

    // Track clicks on product links
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      const productLink = target.closest('[data-product-id]');
      
      if (productLink) {
        const productId = productLink.getAttribute('data-product-id');
        this.trackInteraction('click', {
          type: 'product_click',
          productId,
          element: target.tagName,
          position: this.getElementPosition(productLink)
        });
      }
    });
  }

  private startAutoSave() {
    // Save session every 30 seconds
    setInterval(() => {
      this.saveSession();
    }, 30000);
  }

  private getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }

  private getElementPosition(element: Element): { x: number; y: number } {
    const rect = element.getBoundingClientRect();
    return {
      x: Math.round(rect.left + rect.width / 2),
      y: Math.round(rect.top + rect.height / 2)
    };
  }

  private updateActivity() {
    this.lastActivity = Date.now();
  }

  private trackInteraction(type: UserInteraction['type'], data: any) {
    if (!this.isTracking) return;

    this.updateActivity();
    
    const interaction: UserInteraction = {
      type,
      timestamp: Date.now(),
      data,
      sessionId: this.sessionId,
      userId: this.userId
    };

    this.interactions.push(interaction);
    
    // Keep interactions array manageable
    if (this.interactions.length > 200) {
      this.interactions = this.interactions.slice(-150);
    }
  }

  // Public tracking methods
  public trackPageView(path: string, additionalData?: any) {
    this.trackInteraction('page_view', {
      path,
      referrer: document.referrer,
      timestamp: Date.now(),
      ...additionalData
    });
  }

  public trackProductView(productId: string, productData?: any) {
    this.trackInteraction('product_view', {
      productId,
      product: productData,
      timestamp: Date.now()
    });
  }

  public trackSearch(query: string, results?: number, filters?: any) {
    this.trackInteraction('search', {
      query,
      resultsCount: results,
      filters,
      timestamp: Date.now()
    });
  }

  public trackAddToCart(productId: string, quantity?: number, variant?: any) {
    this.trackInteraction('add_to_cart', {
      productId,
      quantity,
      variant,
      timestamp: Date.now()
    });
  }

  public trackPurchase(orderData: any) {
    this.trackInteraction('purchase', {
      ...orderData,
      timestamp: Date.now()
    });
  }

  public trackTimeOnPage(path: string, timeSpent: number) {
    this.trackInteraction('time_on_page', {
      path,
      timeSpent,
      timestamp: Date.now()
    });
  }

  public setUserId(userId: string) {
    this.userId = userId;
    this.saveSession();
  }

  // Get user behavior data for AI personalization
  public getBehaviorData() {
    const interactions = this.interactions;
    const searches = interactions.filter(i => i.type === 'search').map(i => i.data.query);
    const viewedProducts = interactions.filter(i => i.type === 'product_view').map(i => i.data.productId);
    const pages = interactions.filter(i => i.type === 'page_view').map(i => i.data.path);
    
    // Extract categories from page views
    const categories = pages
      .filter(path => path.includes('/collections/') || path.includes('/categories/'))
      .map(path => path.split('/').pop())
      .filter(Boolean);

    // Calculate total time on site
    const pageTimeInteractions = interactions.filter(i => i.type === 'time_on_page');
    const totalTimeOnSite = pageTimeInteractions.reduce((sum, i) => sum + (i.data.timeSpent || 0), 0);

    // Count sessions
    const uniqueSessions = new Set(interactions.map(i => i.sessionId)).size;

    return {
      searchHistory: [...new Set(searches)].slice(-20), // Last 20 unique searches
      viewedProducts: [...new Set(viewedProducts)].slice(-30), // Last 30 unique products
      categories: [...new Set(categories)],
      timeOnSite: totalTimeOnSite,
      sessionCount: uniqueSessions,
      lastVisit: new Date(this.lastActivity),
      deviceType: this.getDeviceType(),
      interactions: interactions.slice(-50) // Last 50 interactions for analysis
    };
  }

  // Get session data for analytics
  public getSessionData(): UserSession {
    return {
      sessionId: this.sessionId,
      userId: this.userId,
      startTime: this.sessionStartTime,
      lastActivity: this.lastActivity,
      deviceType: this.getDeviceType(),
      userAgent: navigator.userAgent,
      referrer: document.referrer,
      interactions: this.interactions
    };
  }

  // Clear tracking data (for privacy compliance)
  public clearData() {
    this.interactions = [];
    localStorage.removeItem('user_session');
    this.sessionId = this.generateSessionId();
    this.sessionStartTime = Date.now();
  }

  // Check if tracking is enabled
  public isTrackingEnabled(): boolean {
    return this.isTracking;
  }
}

// Export singleton instance
export const userBehaviorTracker = new UserBehaviorTracker();
export default userBehaviorTracker;