'use client';

import React, { useState, useEffect } from 'react';
import { AdvancedAssistantChat } from '../../components/AdvancedAssistantChat';
import CopilotKitAssistant from '../../components/CopilotKitAssistant';

export default function UIIntegrationDemo() {
  const [activeDemo, setActiveDemo] = useState<'assistant-ui' | 'copilotkit' | 'comparison'>('assistant-ui');
  const [sessionId, setSessionId] = useState(`demo_${Date.now()}`);
  const [userId] = useState('demo-user');
  const [stats, setStats] = useState({
    assistantUI: {
      messages: 0,
      responseTime: 0,
      confidence: 0,
      securityViolations: 0
    },
    copilotKit: {
      messages: 0,
      actions: 0,
      responseTime: 0,
      contextualActions: 0
    }
  });

  const handleMessageSent = (source: 'assistant-ui' | 'copilotkit') => {
    setStats(prev => ({
      ...prev,
      [source]: {
        ...prev[source],
        messages: prev[source].messages + 1
      }
    }));
  };

  const handleMessageReceived = (source: 'assistant-ui' | 'copilotkit', metadata: any) => {
    setStats(prev => ({
      ...prev,
      [source]: {
        ...prev[source],
        responseTime: metadata.processingTime || prev[source].responseTime,
        confidence: metadata.confidence || prev[source].confidence,
        securityViolations: metadata.securityViolations?.length || prev[source].securityViolations
      }
    }));
  };

  const handleActionExecuted = (source: 'copilotkit', action: string, result: any) => {
    setStats(prev => ({
      ...prev,
      copilotKit: {
        ...prev.copilotKit,
        actions: prev.copilotKit.actions + 1
      }
    }));
  };

  const resetDemo = () => {
    setSessionId(`demo_${Date.now()}`);
    setStats({
      assistantUI: {
        messages: 0,
        responseTime: 0,
        confidence: 0,
        securityViolations: 0
      },
      copilotKit: {
        messages: 0,
        actions: 0,
        responseTime: 0,
        contextualActions: 0
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                UI Integration Demo
              </h1>
              <p className="text-sm text-gray-600">
                Assistant-UI + CopilotKit + Auth-Spine Platform Integration
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>All Systems Online</span>
              </div>
              <button
                onClick={resetDemo}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                🔄 Reset Demo
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveDemo('assistant-ui')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeDemo === 'assistant-ui'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              🎨 Assistant-UI Demo
            </button>
            <button
              onClick={() => setActiveDemo('copilotkit')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeDemo === 'copilotkit'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              🤖 CopilotKit Demo
            </button>
            <button
              onClick={() => setActiveDemo('comparison')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeDemo === 'comparison'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📊 Comparison
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeDemo === 'assistant-ui' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Assistant-UI Demo */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Assistant-UI Integration
                  </h2>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      Hybrid NLU Active
                    </span>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      Security Enabled
                    </span>
                  </div>
                </div>
                <AdvancedAssistantChat
                  sessionId={sessionId}
                  userId={userId}
                  config={{
                    theme: 'auto',
                    layout: 'sidebar',
                    features: {
                      enableVoiceInput: true,
                      enableFileUpload: true,
                      enableCodeHighlight: true,
                      enableMarkdown: true,
                      enableStreaming: true,
                      enableSuggestions: true,
                      enableFeedback: true,
                      enableExport: true,
                    },
                    assistant: {
                      enableHybridNLU: true,
                      enableSecurity: true,
                      enableAnalytics: true,
                      personality: 'professional',
                      responseDelay: 300,
                    },
                    ui: {
                      showTimestamps: true,
                      showConfidence: true,
                      showNLUSource: true,
                      showSecurityStatus: true,
                      enableAnimations: true,
                      compactMode: false,
                    },
                  }}
                  onMessageSent={(message) => handleMessageSent('assistant-ui')}
                  onMessageReceived={(message) => handleMessageReceived('assistant-ui', message.metadata)}
                  onSecurityViolation={(violation) => console.log('Security violation:', violation)}
                />
              </div>
            </div>

            {/* Stats Panel */}
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  📊 Assistant-UI Stats
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Messages</span>
                    <span className="font-semibold">{stats.assistantUI.messages}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Avg Response Time</span>
                    <span className="font-semibold">{stats.assistantUI.responseTime}ms</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Avg Confidence</span>
                    <span className="font-semibold">{Math.round(stats.assistantUI.confidence * 100)}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Security Violations</span>
                    <span className="font-semibold text-red-600">{stats.assistantUI.securityViolations}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  🚀 Features
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-green-600">✅</span>
                    <span className="text-sm">Hybrid NLU Processing</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-green-600">✅</span>
                    <span className="text-sm">Voice Input Support</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-green-600">✅</span>
                    <span className="text-sm">File Upload</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-green-600">✅</span>
                    <span className="text-sm">Smart Suggestions</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-green-600">✅</span>
                    <span className="text-sm">Export Chat</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-green-600">✅</span>
                    <span className="text-sm">Security Firewall</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeDemo === 'copilotkit' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* CopilotKit Demo */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    CopilotKit Integration
                  </h2>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                      Contextual Actions
                    </span>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      Side Panel Active
                    </span>
                  </div>
                </div>
                <div className="text-center py-8 text-gray-500">
                  <div className="mb-4">
                    <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <p className="mb-4">Click the chat bubble in the corner to open CopilotKit Assistant</p>
                  <p className="text-sm">Try contextual actions, side panel, and smart suggestions!</p>
                </div>
              </div>
            </div>

            {/* Stats Panel */}
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  📊 CopilotKit Stats
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Messages</span>
                    <span className="font-semibold">{stats.copilotKit.messages}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Actions Executed</span>
                    <span className="font-semibold">{stats.copilotKit.actions}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Avg Response Time</span>
                    <span className="font-semibold">{stats.copilotKit.responseTime}ms</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Contextual Actions</span>
                    <span className="font-semibold">{stats.copilotKit.contextualActions}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  🚀 Features
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-green-600">✅</span>
                    <span className="text-sm">Contextual Actions</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-green-600">✅</span>
                    <span className="text-sm">Side Panel</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-green-600">✅</span>
                    <span className="text-sm">Auto-complete</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-green-600">✅</span>
                    <span className="text-sm">Inline Actions</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-green-600">✅</span>
                    <span className="text-sm">Multi-modal Support</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-green-600">✅</span>
                    <span className="text-sm">Co-pilot Text</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeDemo === 'comparison' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Assistant-UI Comparison */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                🎨 Assistant-UI
              </h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Strengths</h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• Advanced chat components</li>
                    <li>• Rich message formatting</li>
                    <li>• Built-in voice input</li>
                    <li>• File upload support</li>
                    <li>• Streaming responses</li>
                    <li>• Export functionality</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Best For</h4>
                  <p className="text-sm text-gray-600">
                    Full-featured chat interfaces with comprehensive functionality
                  </p>
                </div>
                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Messages Processed</span>
                    <span className="font-bold text-blue-600">{stats.assistantUI.messages}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Avg Confidence</span>
                    <span className="font-bold text-green-600">{Math.round(stats.assistantUI.confidence * 100)}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* CopilotKit Comparison */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                🤖 CopilotKit
              </h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Strengths</h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• Contextual actions</li>
                    <li>• Side panel integration</li>
                    <li>• Auto-complete</li>
                    <li>• Inline actions</li>
                    <li>• Multi-modal support</li>
                    <li>• Floating chat widget</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Best For</h4>
                  <p className="text-sm text-gray-600">
                    Context-aware assistance with inline actions and side panels
                  </p>
                </div>
                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Messages Processed</span>
                    <span className="font-bold text-purple-600">{stats.copilotKit.messages}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Actions Executed</span>
                    <span className="font-bold text-green-600">{stats.copilotKit.actions}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Integration Comparison */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                🔗 Integration Comparison
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Shared Features</h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• Hybrid NLU integration</li>
                    <li>• Security firewall</li>
                    <li>• Real-time analytics</li>
                    <li>• TypeScript support</li>
                    <li>• Customizable themes</li>
                    <li>• Event handling</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Auth-Spine Integration</h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• Unified backend API</li>
                    <li>• Shared security context</li>
                    <li>• Common analytics</li>
                    <li>• Centralized configuration</li>
                    <li>• Hybrid NLU processing</li>
                    <li>• Enterprise features</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Performance Metrics</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Messages</span>
                      <span className="font-semibold">{stats.assistantUI.messages + stats.copilotKit.messages}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Actions</span>
                      <span className="font-semibold">{stats.copilotKit.actions}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Avg Response Time</span>
                      <span className="font-semibold">
                        {Math.round((stats.assistantUI.responseTime + stats.copilotKit.responseTime) / 2)}ms
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Security Score</span>
                      <span className="font-semibold text-green-600">A+</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CopilotKit Floating Assistant */}
      <CopilotKitAssistant
        sessionId={sessionId}
        userId={userId}
        config={{
          endpoint: '/api/platform/assistant/hybrid-chat',
          properties: {
            name: 'Auth-Spine Copilot',
            instructions: 'You are a helpful AI assistant integrated with the Auth-Spine platform. You can help users with booking appointments, getting pricing information, and providing contextual assistance.',
            description: 'Advanced AI assistant with contextual actions and side panel support'
          },
          features: {
            enableAutoComplete: true,
            enableCoPilotText: true,
            enableSidePanel: true,
            enableInlineActions: true,
            enableContextualActions: true,
            enableMultiModal: true,
          },
          ui: {
            theme: 'auto',
            position: 'bottom-right',
            size: 'medium',
            animations: true,
          },
          security: {
            enableInputValidation: true,
            enableOutputFiltering: true,
            enableRateLimiting: true,
            maxRequestsPerMinute: 60,
          },
        }}
        onMessageProcessed={(message) => {
          handleMessageSent('copilotkit');
          handleMessageReceived('copilotkit', message.metadata);
        }}
        onActionExecuted={(action, result) => handleActionExecuted('copilotkit', action, result)}
        onContextUpdate={(context) => console.log('Context updated:', context)}
      />
    </div>
  );
}
