'use client';

import React, { useState, useEffect } from 'react';
import { AdvancedAssistantChat } from '../../components/AdvancedAssistantChat';
import { AdvancedAssistantUI, type AdvancedUIConfig } from '../../packages/enterprise/platform/ui/AdvancedAssistantUI';

export default function AdvancedUIDemo() {
  const [sessionId, setSessionId] = useState(`demo_${Date.now()}`);
  const [userId] = useState('demo-user');
  const [config, setConfig] = useState<Partial<AdvancedUIConfig>>({
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
  });

  const [analytics, setAnalytics] = useState<any>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'analytics' | 'settings'>('chat');

  // Sample analytics data
  useEffect(() => {
    const mockAnalytics = {
      totalConversations: 1,
      totalMessages: 0,
      averageResponseTime: 245,
      nluStats: {
        totalProcessed: 0,
        snipsUsage: 0,
        enhancedUsage: 0,
        combinedUsage: 0,
        averageConfidence: 0,
      },
      securityStats: {
        totalViolations: 0,
        blockedIPs: 0,
        averageRiskScore: 0.2,
      },
    };
    setAnalytics(mockAnalytics);
  }, []);

  const handleMessageSent = (message: any) => {
    console.log('Message sent:', message);
    // Update analytics
    if (analytics) {
      setAnalytics({
        ...analytics,
        totalMessages: analytics.totalMessages + 1,
      });
    }
  };

  const handleMessageReceived = (message: any) => {
    console.log('Message received:', message);
    // Update analytics
    if (analytics) {
      setAnalytics({
        ...analytics,
        nluStats: {
          ...analytics.nluStats,
          totalProcessed: analytics.nluStats.totalProcessed + 1,
          averageConfidence: (analytics.nluStats.averageConfidence * analytics.nluStats.totalProcessed + (message.metadata.confidence || 0)) / (analytics.nluStats.totalProcessed + 1),
        },
      });
    }
  };

  const handleSecurityViolation = (violation: any) => {
    console.log('Security violation:', violation);
    // Update analytics
    if (analytics) {
      setAnalytics({
        ...analytics,
        securityStats: {
          ...analytics.securityStats,
          totalViolations: analytics.securityStats.totalViolations + 1,
        },
      });
    }
  };

  const updateConfig = (updates: Partial<AdvancedUIConfig>) => {
    setConfig({ ...config, ...updates });
  };

  const resetConversation = () => {
    const newSessionId = `demo_${Date.now()}`;
    setSessionId(newSessionId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Advanced AI Assistant UI Demo
              </h1>
              <p className="text-sm text-gray-600">
                Assistant-UI + CopilotKit + Auth-Spine Integration
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>System Online</span>
              </div>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {showSettings ? 'Hide Settings' : 'Show Settings'}
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
              onClick={() => setActiveTab('chat')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'chat'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              💬 Chat Interface
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'analytics'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📊 Analytics
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'settings'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              ⚙️ Settings
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'chat' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Chat Interface */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Hybrid AI Assistant
                  </h2>
                  <button
                    onClick={resetConversation}
                    className="text-sm px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                  >
                    🔄 Reset Chat
                  </button>
                </div>
                <AdvancedAssistantChat
                  sessionId={sessionId}
                  userId={userId}
                  config={config}
                  onMessageSent={handleMessageSent}
                  onMessageReceived={handleMessageReceived}
                  onSecurityViolation={handleSecurityViolation}
                />
              </div>
            </div>

            {/* Side Panel */}
            <div className="space-y-6">
              {/* Features */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  🚀 Advanced Features
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Hybrid NLU</span>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      Active
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Security Firewall</span>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      Enabled
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Voice Input</span>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      Ready
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">File Upload</span>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      Ready
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Smart Suggestions</span>
                    <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                      Active
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Export Chat</span>
                    <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                      Available
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  📈 Quick Stats
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Messages</span>
                    <span className="font-semibold">{analytics?.totalMessages || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">NLU Processed</span>
                    <span className="font-semibold">{analytics?.nluStats.totalProcessed || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Avg Confidence</span>
                    <span className="font-semibold">
                      {Math.round((analytics?.nluStats.averageConfidence || 0) * 100)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Response Time</span>
                    <span className="font-semibold">{analytics?.averageResponseTime}ms</span>
                  </div>
                </div>
              </div>

              {/* Integration Info */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  🔗 Integrations
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-green-600">✅</span>
                    <span className="text-sm">Assistant-UI Components</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-green-600">✅</span>
                    <span className="text-sm">CopilotKit Framework</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-green-600">✅</span>
                    <span className="text-sm">Snips NLU Engine</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-green-600">✅</span>
                    <span className="text-sm">Enhanced NLU Service</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-green-600">✅</span>
                    <span className="text-sm">Security Firewall</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-green-600">✅</span>
                    <span className="text-sm">Analytics Service</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* NLU Analytics */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                🧠 NLU Performance
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Total Processed</span>
                    <span className="font-semibold">{analytics?.nluStats.totalProcessed || 0}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${Math.min((analytics?.nluStats.totalProcessed || 0) * 10, 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {analytics?.nluStats.snipsUsage || 0}
                    </div>
                    <div className="text-xs text-gray-600">Snips Usage</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {analytics?.nluStats.enhancedUsage || 0}
                    </div>
                    <div className="text-xs text-gray-600">Enhanced Usage</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {analytics?.nluStats.combinedUsage || 0}
                    </div>
                    <div className="text-xs text-gray-600">Combined Usage</div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Average Confidence</span>
                    <span className="font-semibold">
                      {Math.round((analytics?.nluStats.averageConfidence || 0) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${(analytics?.nluStats.averageConfidence || 0) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Analytics */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                🔒 Security Analytics
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {analytics?.securityStats.totalViolations || 0}
                    </div>
                    <div className="text-xs text-gray-600">Total Violations</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">
                      {analytics?.securityStats.blockedIPs || 0}
                    </div>
                    <div className="text-xs text-gray-600">Blocked IPs</div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Average Risk Score</span>
                    <span className="font-semibold">
                      {Math.round((analytics?.securityStats.averageRiskScore || 0) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        (analytics?.securityStats.averageRiskScore || 0) < 0.3 
                          ? 'bg-green-600' 
                          : (analytics?.securityStats.averageRiskScore || 0) < 0.7 
                          ? 'bg-yellow-600' 
                          : 'bg-red-600'
                      }`}
                      style={{ width: `${(analytics?.securityStats.averageRiskScore || 0) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="text-sm text-blue-800">
                    <strong>Security Status:</strong> All systems operational with advanced threat protection active.
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Analytics */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                ⚡ Performance Metrics
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="text-sm text-gray-600">Average Response Time</span>
                  <span className="font-semibold">{analytics?.averageResponseTime}ms</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="text-sm text-gray-600">Total Conversations</span>
                  <span className="font-semibold">{analytics?.totalConversations}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="text-sm text-gray-600">Total Messages</span>
                  <span className="font-semibold">{analytics?.totalMessages}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                  <span className="text-sm text-green-800">System Health</span>
                  <span className="font-semibold text-green-600">Excellent</span>
                </div>
              </div>
            </div>

            {/* Usage Analytics */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                📊 Usage Analytics
              </h3>
              <div className="space-y-4">
                <div className="text-center p-6 bg-blue-50 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {analytics?.totalMessages || 0}
                  </div>
                  <div className="text-sm text-gray-600">Total Messages Processed</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-purple-50 rounded">
                    <div className="text-lg font-bold text-purple-600">
                      {Math.round(((analytics?.totalMessages || 0) / Math.max(analytics?.totalConversations || 1, 1)) * 10) / 10}
                    </div>
                    <div className="text-xs text-gray-600">Avg Messages/Session</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded">
                    <div className="text-lg font-bold text-green-600">100%</div>
                    <div className="text-xs text-gray-600">Uptime</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* UI Settings */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                🎨 UI Settings
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Theme
                  </label>
                  <select
                    value={config.theme}
                    onChange={(e) => updateConfig({ theme: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="auto">Auto</option>
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Layout
                  </label>
                  <select
                    value={config.layout}
                    onChange={(e) => updateConfig({ layout: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="sidebar">Sidebar</option>
                    <option value="fullscreen">Fullscreen</option>
                    <option value="embedded">Embedded</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assistant Personality
                  </label>
                  <select
                    value={config.assistant?.personality}
                    onChange={(e) => updateConfig({ 
                      assistant: { ...config.assistant, personality: e.target.value as any }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="professional">Professional</option>
                    <option value="friendly">Friendly</option>
                    <option value="casual">Casual</option>
                    <option value="formal">Formal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Response Delay (ms)
                  </label>
                  <input
                    type="number"
                    value={config.assistant?.responseDelay}
                    onChange={(e) => updateConfig({ 
                      assistant: { ...config.assistant, responseDelay: parseInt(e.target.value) }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    max="2000"
                    step="100"
                  />
                </div>
              </div>
            </div>

            {/* Feature Toggles */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                ⚡ Feature Toggles
              </h3>
              <div className="space-y-3">
                {Object.entries(config.features || {}).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}
                    </label>
                    <button
                      onClick={() => updateConfig({
                        features: { ...config.features, [key]: !value }
                      })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        value ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          value ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Display Settings */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                👁️ Display Settings
              </h3>
              <div className="space-y-3">
                {Object.entries(config.ui || {}).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}
                    </label>
                    <button
                      onClick={() => updateConfig({
                        ui: { ...config.ui, [key]: !value }
                      })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        value ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          value ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* System Settings */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                ⚙️ System Settings
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">
                    Hybrid NLU
                  </label>
                  <button
                    onClick={() => updateConfig({
                      assistant: { ...config.assistant, enableHybridNLU: !config.assistant?.enableHybridNLU }
                    })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      config.assistant?.enableHybridNLU ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        config.assistant?.enableHybridNLU ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">
                    Security Firewall
                  </label>
                  <button
                    onClick={() => updateConfig({
                      assistant: { ...config.assistant, enableSecurity: !config.assistant?.enableSecurity }
                    })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      config.assistant?.enableSecurity ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        config.assistant?.enableSecurity ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">
                    Analytics
                  </label>
                  <button
                    onClick={() => updateConfig({
                      assistant: { ...config.assistant, enableAnalytics: !config.assistant?.enableAnalytics }
                    })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      config.assistant?.enableAnalytics ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        config.assistant?.enableAnalytics ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="pt-4 border-t">
                  <button
                    onClick={resetConversation}
                    className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                  >
                    🔄 Reset All Settings
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
