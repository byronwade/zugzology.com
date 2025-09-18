import { NextRequest, NextResponse } from 'next/server';

interface VitalsData {
  metric: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  navigationType: string;
  url: string;
  userAgent: string;
  timestamp: number;
}

// In-memory store for demo (use database in production)
const vitalsStore: VitalsData[] = [];
const MAX_STORE_SIZE = 1000;

export async function POST(request: NextRequest) {
  try {
    const data: VitalsData = await request.json();
    
    // Validate data
    if (!data.metric || typeof data.value !== 'number') {
      return NextResponse.json(
        { error: 'Invalid vitals data' },
        { status: 400 }
      );
    }
    
    // Store data (in production, save to database)
    vitalsStore.push(data);
    
    // Keep store size manageable
    if (vitalsStore.length > MAX_STORE_SIZE) {
      vitalsStore.shift();
    }
    
    // Log critical issues
    if (data.rating === 'poor') {
      console.warn(`Poor Web Vital detected: ${data.metric} = ${data.value} on ${data.url}`);
    }
    
    // You could also:
    // - Send to external monitoring service (Sentry, DataDog, etc.)
    // - Store in database
    // - Send alerts for poor performance
    // - Track trends over time
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing vitals data:', error);
    return NextResponse.json(
      { error: 'Failed to process vitals data' },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Return aggregated vitals data
  const summary = {
    total: vitalsStore.length,
    metrics: {} as Record<string, any>,
  };
  
  // Aggregate by metric
  vitalsStore.forEach(data => {
    if (!summary.metrics[data.metric]) {
      summary.metrics[data.metric] = {
        count: 0,
        sum: 0,
        good: 0,
        needsImprovement: 0,
        poor: 0,
        values: [] as number[],
      };
    }
    
    const metric = summary.metrics[data.metric];
    metric.count++;
    metric.sum += data.value;
    metric.values.push(data.value);
    
    if (data.rating === 'good') metric.good++;
    else if (data.rating === 'needs-improvement') metric.needsImprovement++;
    else if (data.rating === 'poor') metric.poor++;
  });
  
  // Calculate statistics
  Object.keys(summary.metrics).forEach(metricName => {
    const metric = summary.metrics[metricName];
    const values = metric.values.sort((a, b) => a - b);
    
    metric.average = metric.sum / metric.count;
    metric.median = values[Math.floor(values.length / 2)];
    metric.p75 = values[Math.floor(values.length * 0.75)];
    metric.p95 = values[Math.floor(values.length * 0.95)];
    
    // Clean up raw values from response
    delete metric.values;
  });
  
  return NextResponse.json(summary);
}