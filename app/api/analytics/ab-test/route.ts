import { NextRequest, NextResponse } from 'next/server';

interface ABTestEvent {
  eventType: string;
  testId: string;
  variantId: string;
  data?: any;
  timestamp: number;
  sessionId: string;
}

// Simple in-memory store for AB test data (in production, use a database)
const abTestEvents: ABTestEvent[] = [];
const MAX_EVENTS = 10000; // Limit memory usage

export async function POST(request: NextRequest) {
  try {
    const event: ABTestEvent = await request.json();

    // Validate required fields
    if (!event.eventType || !event.testId || !event.variantId || !event.sessionId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Add timestamp if not provided
    if (!event.timestamp) {
      event.timestamp = Date.now();
    }

    // Store event (in production, save to database)
    abTestEvents.push(event);

    // Prevent memory overflow
    if (abTestEvents.length > MAX_EVENTS) {
      abTestEvents.splice(0, abTestEvents.length - MAX_EVENTS);
    }

    // Log for development (remove in production)
    if (process.env.NODE_ENV === 'development') {
      console.log('AB Test Event:', event);
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('AB Test Analytics Error:', error);
    return NextResponse.json(
      { error: 'Unable to track AB test event' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const testId = url.searchParams.get('testId');
    const action = url.searchParams.get('action') || 'summary';

    if (action === 'summary') {
      return getTestSummary(testId);
    } else if (action === 'events') {
      return getTestEvents(testId);
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

  } catch (error) {
    console.error('AB Test Analytics GET Error:', error);
    return NextResponse.json(
      { error: 'Unable to get AB test data' },
      { status: 500 }
    );
  }
}

function getTestSummary(testId?: string | null) {
  const events = testId 
    ? abTestEvents.filter(e => e.testId === testId)
    : abTestEvents;

  if (events.length === 0) {
    return NextResponse.json({ 
      message: 'No events found',
      testId,
      summary: null 
    });
  }

  // Group by test and variant
  const summary: { [testId: string]: { [variantId: string]: any } } = {};

  events.forEach(event => {
    if (!summary[event.testId]) {
      summary[event.testId] = {};
    }
    
    if (!summary[event.testId][event.variantId]) {
      summary[event.testId][event.variantId] = {
        variantId: event.variantId,
        impressions: 0,
        conversions: 0,
        interactions: 0,
        uniqueSessions: new Set(),
        events: []
      };
    }

    const variant = summary[event.testId][event.variantId];
    
    if (event.eventType === 'variant_shown') {
      variant.impressions++;
    } else if (event.eventType === 'conversion') {
      variant.conversions++;
    } else {
      variant.interactions++;
    }
    
    variant.uniqueSessions.add(event.sessionId);
    variant.events.push(event.eventType);
  });

  // Calculate conversion rates and clean up
  Object.keys(summary).forEach(testId => {
    Object.keys(summary[testId]).forEach(variantId => {
      const variant = summary[testId][variantId];
      variant.conversionRate = variant.impressions > 0 
        ? (variant.conversions / variant.impressions * 100).toFixed(2) + '%'
        : '0%';
      variant.uniqueSessions = variant.uniqueSessions.size;
      delete variant.events; // Remove detailed events from summary
    });
  });

  return NextResponse.json({
    testId,
    totalEvents: events.length,
    summary: testId ? summary[testId] : summary,
    timeRange: {
      start: new Date(Math.min(...events.map(e => e.timestamp))).toISOString(),
      end: new Date(Math.max(...events.map(e => e.timestamp))).toISOString()
    }
  });
}

function getTestEvents(testId?: string | null) {
  const events = testId 
    ? abTestEvents.filter(e => e.testId === testId)
    : abTestEvents;

  // Sort by timestamp (newest first)
  const sortedEvents = events
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 1000); // Limit to last 1000 events

  return NextResponse.json({
    testId,
    events: sortedEvents,
    totalCount: events.length
  });
}

// Cleanup endpoint for development
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const testId = url.searchParams.get('testId');

    if (testId) {
      // Remove events for specific test
      const initialLength = abTestEvents.length;
      for (let i = abTestEvents.length - 1; i >= 0; i--) {
        if (abTestEvents[i].testId === testId) {
          abTestEvents.splice(i, 1);
        }
      }
      
      return NextResponse.json({
        message: `Removed ${initialLength - abTestEvents.length} events for test ${testId}`
      });
    } else {
      // Clear all events
      const removedCount = abTestEvents.length;
      abTestEvents.length = 0;
      
      return NextResponse.json({
        message: `Removed ${removedCount} events`
      });
    }

  } catch (error) {
    console.error('AB Test Analytics DELETE Error:', error);
    return NextResponse.json(
      { error: 'Unable to delete AB test data' },
      { status: 500 }
    );
  }
}