"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { aiConfig, aiFeatures } from '@/lib/config/ai-config';

export function AIDebugPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [testResults, setTestResults] = useState<any>({});

  const testAIConnection = async () => {
    console.log('🧪 [AI Debug] Testing AI connection...');
    
    try {
      const response = await fetch('/api/ai/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Test connection',
          history: []
        })
      });

      const result = {
        status: response.status,
        ok: response.ok,
        data: response.ok ? await response.json() : await response.text()
      };

      setTestResults(prev => ({ ...prev, support: result }));
      console.log('🧪 [AI Debug] Support API test result:', result);
    } catch (error) {
      const result = { error: error.message };
      setTestResults(prev => ({ ...prev, support: result }));
      console.error('🧪 [AI Debug] Support API test failed:', error);
    }
  };

  const testSearchSuggestions = async () => {
    console.log('🧪 [AI Debug] Testing search suggestions...');
    
    try {
      const response = await fetch('/api/ai/search-suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: 'oyster mushroom' })
      });

      const result = {
        status: response.status,
        ok: response.ok,
        data: response.ok ? await response.json() : await response.text()
      };

      setTestResults(prev => ({ ...prev, search: result }));
      console.log('🧪 [AI Debug] Search API test result:', result);
    } catch (error) {
      const result = { error: error.message };
      setTestResults(prev => ({ ...prev, search: result }));
      console.error('🧪 [AI Debug] Search API test failed:', error);
    }
  };

  const runAllTests = () => {
    setTestResults({});
    testAIConnection();
    testSearchSuggestions();
  };

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <>
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 left-4 z-50 bg-purple-600 hover:bg-purple-700"
        size="sm"
      >
        🤖 AI Debug
      </Button>

      {isOpen && (
        <Card className="fixed bottom-16 left-4 z-50 w-80 max-h-96 overflow-auto bg-white dark:bg-gray-900 shadow-xl border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center justify-between">
              AI System Debug
              <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                ✕
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            {/* Configuration Status */}
            <div>
              <h4 className="font-medium mb-2">Configuration</h4>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Enabled:</span>
                  <Badge variant={aiConfig.enabled ? "default" : "destructive"}>
                    {aiConfig.enabled ? "Yes" : "No"}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Provider:</span>
                  <Badge variant="outline">{aiConfig.provider}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Model:</span>
                  <Badge variant="outline">{aiConfig.model}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Has API Key:</span>
                  <Badge variant={aiConfig.apiKey ? "default" : "destructive"}>
                    {aiConfig.apiKey ? "Yes" : "No"}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Feature Status */}
            <div>
              <h4 className="font-medium mb-2">Features</h4>
              <div className="grid grid-cols-2 gap-1">
                {Object.entries(aiFeatures).map(([feature, enabled]) => (
                  <div key={feature} className="flex items-center gap-1">
                    <Badge 
                      variant={enabled ? "default" : "secondary"} 
                      className="text-xs px-1 py-0"
                    >
                      {feature.split(/(?=[A-Z])/).join(' ')}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Test Actions */}
            <div>
              <h4 className="font-medium mb-2">Tests</h4>
              <div className="space-y-2">
                <Button onClick={runAllTests} size="sm" className="w-full">
                  Run All Tests
                </Button>
                
                {/* Test Results */}
                {Object.keys(testResults).length > 0 && (
                  <div className="space-y-1">
                    {testResults.support && (
                      <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded text-xs">
                        <div className="font-medium">Support API:</div>
                        <Badge variant={testResults.support.ok ? "default" : "destructive"}>
                          {testResults.support.status}
                        </Badge>
                      </div>
                    )}
                    {testResults.search && (
                      <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded text-xs">
                        <div className="font-medium">Search API:</div>
                        <Badge variant={testResults.search.ok ? "default" : "destructive"}>
                          {testResults.search.status}
                        </Badge>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Environment Variables */}
            <div>
              <h4 className="font-medium mb-2">Environment</h4>
              <div className="space-y-1 text-xs">
                <div>Provider: {process.env.NEXT_PUBLIC_AI_PROVIDER || 'Not Set'}</div>
                <div>Model: {process.env.NEXT_PUBLIC_AI_MODEL || 'Not Set'}</div>
                <div>Tracking: {process.env.NEXT_PUBLIC_USER_TRACKING || 'false'}</div>
                <div>Homepage AI: {process.env.NEXT_PUBLIC_AI_HOMEPAGE_PERSONALIZATION || 'false'}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}