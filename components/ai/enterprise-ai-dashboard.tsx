"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  Brain, 
  Activity, 
  TrendingUp, 
  Eye, 
  MousePointer, 
  ShoppingCart, 
  Heart,
  Search,
  Zap,
  Network,
  Target,
  Users,
  DollarSign,
  BarChart3,
  Clock,
  Gauge,
  AlertCircle,
  CheckCircle,
  Sparkles,
  Bot,
  Cpu,
  Database
} from 'lucide-react';
import { useAIPredictionStore } from '@/stores/ai-prediction-store';
import { shopifyDataContext } from '@/lib/services/shopify-data-context';
import { cn } from '@/lib/utils';

export function EnterpriseAIDashboard() {
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Connect to Enterprise AI Store
  const { 
    interactions, 
    predictions, 
    sessionMetrics, 
    userSegmentation,
    behaviorPattern,
    recommendations,
    sentimentAnalysis,
    demandForecasts,
    aiCapabilities,
    aiProcessingStatus,
    analyzeUserBehavior,
    generateRecommendations,
    analyzeSentiment,
    updateUserSegmentation,
    getAIInsights,
    getRecommendations,
    getUserSegment,
    getBehaviorPattern,
    calculatePredictions
  } = useAIPredictionStore();
  
  // Enhanced product lookup
  const [productLookup, setProductLookup] = useState<Map<string, any>>(new Map());
  
  // Build product lookup table
  useEffect(() => {
    try {
      const allProducts = shopifyDataContext.getAllProducts();
      const lookup = new Map();
      allProducts.forEach(product => {
        lookup.set(product.id, {
          id: product.id,
          title: product.title,
          handle: product.handle,
          price: product.priceRange?.minVariantPrice?.amount || 0
        });
      });
      setProductLookup(lookup);
    } catch (error) {
      console.warn('🧠 [AI Dashboard] Error building product lookup:', error);
    }
  }, []);

  // Get AI insights
  const aiInsights = getAIInsights();
  
  // Convert predictions to UI format with real product names
  const uiPredictions = Array.from(predictions.values())
    .filter(pred => pred && pred.productId)
    .map(pred => {
      const productInfo = productLookup.get(pred.productId);
      return {
        productId: pred.productId,
        productName: productInfo?.title || `Product ${pred.productId.slice(-8)}`,
        productHandle: productInfo?.handle || '',
        action: pred.score > 80 ? 'purchase' : pred.score > 60 ? 'cart' : pred.score > 30 ? 'wishlist' : 'view',
        confidence: pred.score,
        score: pred.score,
        reasoning: pred.reasoning
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  // Get AI recommendations with product names
  const aiRecommendations = getRecommendations(5).map(rec => ({
    ...rec,
    productName: productLookup.get(rec.productId)?.title || `Product ${rec.productId.slice(-8)}`
  }));

  // Calculate metrics
  const metrics = {
    totalEvents: interactions.length,
    conversionEvents: sessionMetrics.conversionEvents,
    sessionDuration: Date.now() - sessionMetrics.startTime,
    aiCapabilitiesActive: Object.values(aiCapabilities).filter(Boolean).length,
    totalAIInsights: aiInsights.totalInsights,
    overallAIHealth: aiInsights.overallAIHealth
  };

  const conversionProbability = Math.round(
    (sessionMetrics.conversionEvents / Math.max(interactions.length, 1)) * 100
  );

  // Trigger AI analysis on sufficient interactions
  useEffect(() => {
    if (interactions.length >= 5 && interactions.length % 5 === 0) {
      // Trigger comprehensive AI analysis
      if (aiCapabilities.behaviorAnalysis && aiProcessingStatus.behaviorAnalysis === 'idle') {
        analyzeUserBehavior();
      }
      
      if (aiCapabilities.userSegmentation && interactions.length >= 10 && aiProcessingStatus.segmentation === 'idle') {
        updateUserSegmentation();
      }
      
      if (aiCapabilities.collaborativeFiltering && aiProcessingStatus.recommendations === 'idle') {
        generateRecommendations('dashboard', interactions[interactions.length - 1]?.productId);
      }
    }
  }, [interactions.length, aiCapabilities, aiProcessingStatus]);

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'excellent': return 'text-green-500';
      case 'good': return 'text-blue-500';
      case 'fair': return 'text-yellow-500';
      default: return 'text-red-500';
    }
  };

  const getProcessingIcon = (status: string) => {
    switch (status) {
      case 'processing': return <div className="animate-spin w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full" />;
      case 'completed': return <CheckCircle className="w-3 h-3 text-green-500" />;
      case 'failed': return <AlertCircle className="w-3 h-3 text-red-500" />;
      default: return <div className="w-3 h-3 bg-gray-300 rounded-full" />;
    }
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsMinimized(false)}
          className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 relative"
        >
          <Brain className="w-6 h-6" />
          {metrics.totalAIInsights > 0 && (
            <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
              {metrics.totalAIInsights}
            </div>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-[520px] h-[700px] bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col overflow-hidden">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Brain className="w-5 h-5" />
            <Sparkles className="absolute -top-1 -right-1 w-3 h-3 text-yellow-300" />
          </div>
          <div className="flex flex-col">
            <h3 className="font-semibold text-sm">Enterprise AI Brain</h3>
            <div className="flex items-center gap-1 text-xs opacity-80">
              <Bot className="w-3 h-3" />
              <span>{metrics.aiCapabilitiesActive}/6 AI Systems</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge 
            variant="secondary" 
            className={cn(
              "text-xs border-0",
              getHealthColor(metrics.overallAIHealth),
              "bg-white/20"
            )}
          >
            {behaviorPattern?.patternType || 'Analyzing...'}
          </Badge>
          <div className="flex items-center gap-1 text-xs">
            <Gauge className="w-4 h-4" />
            <span>{Math.round(aiInsights.behaviorConfidence * 100)}%</span>
          </div>
          <button
            onClick={() => setIsMinimized(true)}
            className="text-white/80 hover:text-white transition-colors"
          >
            <span className="text-xl">−</span>
          </button>
        </div>
      </div>

      {/* Enhanced Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-5 p-1 bg-gray-50">
          <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
          <TabsTrigger value="ai-insights" className="text-xs">AI Insights</TabsTrigger>
          <TabsTrigger value="predictions" className="text-xs">Predictions</TabsTrigger>
          <TabsTrigger value="behavior" className="text-xs">Behavior</TabsTrigger>
          <TabsTrigger value="performance" className="text-xs">Performance</TabsTrigger>
        </TabsList>

        {/* Overview Tab - Enterprise Metrics */}
        <TabsContent value="overview" className="flex-1 p-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Card className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">AI Insights</p>
                  <p className="text-xl font-bold text-purple-600">{metrics.totalAIInsights}</p>
                </div>
                <Brain className="w-5 h-5 text-purple-500" />
              </div>
            </Card>
            
            <Card className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">AI Health</p>
                  <p className={cn("text-xl font-bold", getHealthColor(metrics.overallAIHealth))}>
                    {metrics.overallAIHealth.toUpperCase()}
                  </p>
                </div>
                <Cpu className={cn("w-5 h-5", getHealthColor(metrics.overallAIHealth))} />
              </div>
            </Card>
            
            <Card className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">Predictions</p>
                  <p className="text-xl font-bold text-blue-600">{uiPredictions.length}</p>
                </div>
                <Target className="w-5 h-5 text-blue-500" />
              </div>
            </Card>
            
            <Card className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">Recommendations</p>
                  <p className="text-xl font-bold text-green-600">{aiRecommendations.length}</p>
                </div>
                <Sparkles className="w-5 h-5 text-green-500" />
              </div>
            </Card>
          </div>

          {/* AI System Status */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Database className="w-4 h-4" />
                AI Systems Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2">
                  {getProcessingIcon(aiProcessingStatus.behaviorAnalysis)}
                  <span>Behavior Analysis</span>
                </div>
                <div className="flex items-center gap-2">
                  {getProcessingIcon(aiProcessingStatus.recommendations)}
                  <span>Recommendations</span>
                </div>
                <div className="flex items-center gap-2">
                  {getProcessingIcon(aiProcessingStatus.sentiment)}
                  <span>Sentiment Analysis</span>
                </div>
                <div className="flex items-center gap-2">
                  {getProcessingIcon(aiProcessingStatus.segmentation)}
                  <span>User Segmentation</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* User Segmentation */}
          {userSegmentation && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  User Profile
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{userSegmentation.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {Math.round(userSegmentation.confidence * 100)}% confident
                    </Badge>
                  </div>
                  <div className="text-xs text-gray-600">
                    {userSegmentation.characteristics.slice(0, 2).join(' • ')}
                  </div>
                  <div className="text-xs text-blue-600 font-medium">
                    Strategy: {userSegmentation.marketingStrategy.messaging}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* AI Insights Tab */}
        <TabsContent value="ai-insights" className="flex-1 p-4 space-y-4">
          {/* Behavior Pattern */}
          {behaviorPattern && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Brain className="w-4 h-4" />
                  AI Behavior Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{behaviorPattern.patternType.replace('_', ' ').toUpperCase()}</span>
                    <Badge variant="secondary" className="text-xs">
                      {Math.round(behaviorPattern.confidence * 100)}% confidence
                    </Badge>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-gray-600">AI Insights:</p>
                    {behaviorPattern.indicators.map((indicator, idx) => (
                      <div key={idx} className="text-xs text-gray-700 flex items-start gap-1">
                        <span className="text-blue-500">•</span>
                        <span>{indicator}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-500">Time to Convert:</span>
                      <span className="font-medium ml-1">{behaviorPattern.timeToConversion}min</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Expected AOV:</span>
                      <span className="font-medium ml-1">${behaviorPattern.averageOrderValue}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* AI Recommendations */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                AI Recommendations
                <Badge variant="outline" className="text-xs">
                  LIVE
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-32">
                <div className="space-y-2">
                  {aiRecommendations.length > 0 ? aiRecommendations.map((rec, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs">
                      <div className="flex-1">
                        <div className="font-medium truncate">{rec.productName}</div>
                        <div className="text-gray-600 text-xs">{rec.reason}</div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Badge variant={rec.type === 'hybrid' ? 'default' : 'secondary'} className="text-xs">
                          {rec.type}
                        </Badge>
                        <span className="font-bold text-green-600">{Math.round(rec.score * 100)}%</span>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center text-gray-500 text-xs py-4">
                      <Bot className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      AI is analyzing your behavior...
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Sentiment Analysis */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Heart className="w-4 h-4" />
                Real-time Sentiment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Array.from(sentimentAnalysis.values()).slice(0, 3).map((sentiment, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs">
                    <div className="flex-1">
                      <div className="font-medium truncate">
                        {productLookup.get(sentiment.productId)?.title || `Product ${sentiment.productId.slice(-8)}`}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={cn(
                          "px-2 py-1 rounded text-xs font-medium",
                          sentiment.sentiment === 'positive' ? 'bg-green-100 text-green-700' :
                          sentiment.sentiment === 'negative' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        )}>
                          {sentiment.sentiment}
                        </span>
                        <span className="text-gray-600">
                          {Math.round(sentiment.confidence * 100)}% confidence
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                
                {sentimentAnalysis.size === 0 && (
                  <div className="text-center text-gray-500 text-xs py-2">
                    No sentiment data yet
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Predictions Tab */}
        <TabsContent value="predictions" className="flex-1 p-4">
          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <Target className="w-4 h-4" />
                Live AI Predictions
              </CardTitle>
              <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                REAL-TIME
              </Badge>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-2">
                  {uiPredictions.length > 0 ? uiPredictions.map((pred, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex-1">
                        <div className="font-medium text-sm truncate">
                          {pred.productName}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          Predicted Action: <span className="font-medium text-blue-600">{pred.action}</span>
                        </div>
                        {pred.reasoning && pred.reasoning.length > 0 && (
                          <div className="text-xs text-gray-500 mt-1 truncate">
                            {pred.reasoning[0]}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-purple-600">
                          {Math.round(pred.confidence)}%
                        </div>
                        <div className="text-xs text-gray-500">
                          Confidence
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center text-gray-500 py-8">
                      <Target className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p className="text-sm font-medium">Generating AI Predictions</p>
                      <p className="text-xs">Interact with products to see predictions</p>
                      <Button
                        onClick={() => calculatePredictions()}
                        size="sm"
                        variant="outline"
                        className="mt-3 text-xs"
                      >
                        <Zap className="w-3 h-3 mr-1" />
                        Generate Predictions
                      </Button>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Behavior Tab */}
        <TabsContent value="behavior" className="flex-1 p-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Behavioral Events ({interactions.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-2">
                  {interactions.slice(-20).reverse().map((interaction, idx) => {
                    const productInfo = productLookup.get(interaction.productId);
                    const timeAgo = Math.round((Date.now() - interaction.timestamp) / 1000);
                    
                    return (
                      <div key={idx} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded text-xs">
                        <div className={cn("w-2 h-2 rounded-full", {
                          'bg-green-500': interaction.type.includes('cart') || interaction.type.includes('purchase'),
                          'bg-blue-500': interaction.type.includes('view') || interaction.type.includes('page_visit'),
                          'bg-pink-500': interaction.type.includes('wishlist'),
                          'bg-yellow-500': interaction.type.includes('hover'),
                          'bg-red-500': interaction.type.includes('bounce'),
                          'bg-gray-400': !interaction.type.includes('cart') && !interaction.type.includes('view') && !interaction.type.includes('wishlist') && !interaction.type.includes('hover') && !interaction.type.includes('bounce')
                        })} />
                        <div className="flex-1">
                          <div className="font-medium truncate">
                            {productInfo?.title || `Product ${interaction.productId.slice(-8)}`}
                          </div>
                          <div className="text-gray-600">
                            {interaction.type.replace('_', ' ')} • {timeAgo}s ago
                          </div>
                        </div>
                        {interaction.duration && (
                          <div className="text-gray-500 text-xs">
                            {Math.round(interaction.duration / 1000)}s
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="flex-1 p-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Card className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">Session Events</p>
                  <p className="text-lg font-bold">{metrics.totalEvents}</p>
                </div>
                <Activity className="w-4 h-4 text-blue-500" />
              </div>
            </Card>
            
            <Card className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">Conversion Events</p>
                  <p className="text-lg font-bold text-green-600">{metrics.conversionEvents}</p>
                </div>
                <TrendingUp className="w-4 h-4 text-green-500" />
              </div>
            </Card>
            
            <Card className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">Session Time</p>
                  <p className="text-lg font-bold">{formatDuration(metrics.sessionDuration)}</p>
                </div>
                <Clock className="w-4 h-4 text-yellow-500" />
              </div>
            </Card>
            
            <Card className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">Conversion Rate</p>
                  <p className="text-lg font-bold text-purple-600">{conversionProbability}%</p>
                </div>
                <Gauge className="w-4 h-4 text-purple-500" />
              </div>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">AI Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">Behavior Analysis Confidence</span>
                <span className="text-sm font-medium">{Math.round(aiInsights.behaviorConfidence * 100)}%</span>
              </div>
              <Progress value={aiInsights.behaviorConfidence * 100} className="h-2" />
              
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">Segmentation Accuracy</span>
                <span className="text-sm font-medium">{Math.round(aiInsights.segmentationAccuracy * 100)}%</span>
              </div>
              <Progress value={aiInsights.segmentationAccuracy * 100} className="h-2" />
              
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">Recommendation Strength</span>
                <span className="text-sm font-medium">{Math.round(aiInsights.recommendationStrength * 100)}%</span>
              </div>
              <Progress value={aiInsights.recommendationStrength * 100} className="h-2" />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}