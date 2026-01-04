'use client';

import React, { useState } from 'react';
import { useAppContext } from '@/src/providers/AppContext';
import { usePageState } from '@/src/hooks/usePageState';
import { uiLogger } from '@/src/lib/ui-logger';
import SmoothCard from '@/suites/ui/components/SmoothCard';
import SmoothButton from '@/suites/ui/components/SmoothButton';
import SmoothInput from '@/suites/ui/components/SmoothInput';
import SmoothTextarea from '@/suites/ui/components/SmoothTextarea';
import SmoothBadge from '@/suites/ui/components/SmoothBadge';
import SmoothAlert, { SmoothAlertDescription } from '@/suites/ui/components/SmoothAlert';
import SmoothTabs, { SmoothTabsList, SmoothTabsTrigger, SmoothTabsContent } from '@/suites/ui/components/SmoothTabs';
import SmoothSeparator from '@/suites/ui/components/SmoothSeparator';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  intent?: string;
  confidence?: number;
  securityViolations?: any[];
}

interface AssistantStats {
  activeSessions: number;
  totalMessages: number;
  averageSessionLength: number;
  securityStats: {
    totalViolations: number;
    blockedIPs: number;
    activeContexts: number;
    averageRiskScore: number;
  };
  nluStats: {
    totalPatterns: number;
    totalTrainingExamples: number;
    vocabularySize: number;
    intentCount: number;
  };
}

export default function AssistantDemo() {
  const { user, addNotification } = useAppContext();
  const [sessionId] = useState<string>(`demo_${Date.now()}`);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [personality, setPersonality] = useState<string>('professional');
  const [securityTestInput, setSecurityTestInput] = useState<string>('');
  const [securityResults, setSecurityResults] = useState<any[]>([]);

  // Load stats using usePageState
  const { data: stats, loading: statsLoading, refetch: refetchStats } = usePageState(
    async () => {
      try {
        const response = await fetch('/api/platform/assistant/train?type=stats');
        const data = await response.json();
        if (data.success) {
          return data.data;
        }
        throw new Error(data.error);
      } catch (error) {
        uiLogger.error('Failed to load stats', error);
        // Return default stats on error
        return {
          activeSessions: 0,
          totalMessages: 0,
          averageSessionLength: 0,
          securityStats: {
            totalViolations: 0,
            blockedIPs: 0,
            activeContexts: 0,
            averageRiskScore: 0
          },
          nluStats: {
            totalPatterns: 0,
            totalTrainingExamples: 0,
            vocabularySize: 0,
            intentCount: 0
          }
        };
      }
    },
    [],
    {
      onError: (error) => {
        addNotification(`Failed to load assistant stats: ${error.message}`, 'error');
      }
    }
  );

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString()
    };

    setMessages((prev: Message[]) => [...prev, userMessage]);
    const currentInput = inputMessage;
    setInputMessage('');

    try {
      const response = await fetch('/api/platform/assistant/enhanced-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: currentInput,
          sessionId: sessionId,
          userId: user?.id || 'demo-user'
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        const assistantMessage: Message = {
          id: `msg_${Date.now()}`,
          role: 'assistant',
          content: data.data.message,
          timestamp: new Date().toISOString(),
          intent: data.data.intent?.intent,
          confidence: data.data.intent?.confidence,
          securityViolations: data.data.securityViolations
        };
        
        setMessages((prev: Message[]) => [...prev, assistantMessage]);
        addNotification('Message sent successfully', 'success');
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      uiLogger.error('Failed to send message', error);
      const errorMessage: Message = {
        id: `msg_${Date.now()}`,
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your message.',
        timestamp: new Date().toISOString()
      };
      setMessages((prev: Message[]) => [...prev, errorMessage]);
      addNotification('Failed to send message', 'error');
    } finally {
      refetchStats();
    }
  };

  const trainAssistant = async () => {
    try {
      const response = await fetch('/api/platform/assistant/train', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'train'
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        addNotification('Assistant trained successfully!', 'success');
        refetchStats();
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      uiLogger.error('Failed to train assistant', error);
      addNotification('Failed to train assistant', 'error');
    }
  };

  const testSecurity = async () => {
    if (!securityTestInput.trim()) return;

    try {
      const response = await fetch('/api/platform/assistant/train', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'test_security',
          testInputs: [securityTestInput]
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setSecurityResults(data.data.securityTests);
        addNotification('Security test completed', 'success');
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      uiLogger.error('Failed to test security', error);
      addNotification('Failed to test security', 'error');
    }
  };

  const clearConversation = () => {
    setMessages([]);
  };

  const testConversationFlow = async (flowIndex: number) => {
    try {
      const response = await fetch('/api/platform/assistant/train', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'test_conversation',
          flowIndex,
          messages: [
            "Hi, I'd like to book a haircut",
            "I'm free on Friday afternoon",
            "Around 3pm would be perfect",
            "Yes, that works for me!"
          ]
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        uiLogger.info('Conversation flow test results', { flowIndex, conversationData: data.data.conversation });
        addNotification('Conversation flow test completed! Check console for results.', 'success');
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      uiLogger.error('Failed to test conversation flow', error, { flowIndex });
      addNotification('Failed to test conversation flow', 'error');
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Enhanced AI Assistant Demo</h1>

    <SmoothTabs defaultValue="chat" className="w-full">
      <SmoothTabsList>
        <SmoothTabsTrigger value="chat">Chat Interface</SmoothTabsTrigger>
        <SmoothTabsTrigger value="training">Training & Stats</SmoothTabsTrigger>
        <SmoothTabsTrigger value="security">Security Testing</SmoothTabsTrigger>
        <SmoothTabsTrigger value="analytics">Analytics</SmoothTabsTrigger>
      </SmoothTabsList>

      <SmoothTabsContent value="chat" className="space-y-4">
        <SmoothCard>
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">AI Assistant Chat</h2>
            <div className="space-y-4">
              <div className="h-96 overflow-y-auto border rounded-lg p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    Start a conversation with the AI assistant...
                  </div>
                ) : (
                  messages.map((message: Message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.role === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.role === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        {message.intent && (
                          <div className="mt-2 space-x-2">
                            <SmoothBadge variant="secondary" className="text-xs">
                              {message.intent}
                            </SmoothBadge>
                            <SmoothBadge variant="outline" className="text-xs">
                              {Math.round((message.confidence || 0) * 100)}%
                            </SmoothBadge>
                          </div>
                        )}
                        {message.securityViolations && message.securityViolations.length > 0 && (
                          <SmoothAlert variant="destructive" className="mt-2">
                            <SmoothAlertDescription className="text-xs">
                              Security violations detected: {message.securityViolations.length}
                            </SmoothAlertDescription>
                          </SmoothAlert>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="flex space-x-2">
                <SmoothInput
                  value={inputMessage}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputMessage(e.target.value)}
                  placeholder="Type your message..."
                  onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && sendMessage()}
                  className="flex-1"
                />
                <SmoothButton onClick={sendMessage}>
                  Send
                </SmoothButton>
              </div>
            </div>
          </div>
        </SmoothCard>
      </SmoothTabsContent>

      <SmoothTabsContent value="training" className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SmoothCard>
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Training Control</h2>
              <div className="space-y-4">
                <SmoothButton onClick={trainAssistant} className="w-full">
                  Train Assistant
                </SmoothButton>
                <SmoothButton 
                  onClick={() => testConversationFlow(0)} 
                  variant="secondary"
                  className="w-full"
                >
                  Test Conversation Flow
                </SmoothButton>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Personality</label>
                  <select 
                    value={personality} 
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setPersonality(e.target.value)}
                    className="w-full p-2 border rounded"
                  >
                    <option value="professional">Professional</option>
                    <option value="friendly">Friendly</option>
                    <option value="casual">Casual</option>
                    <option value="formal">Formal</option>
                  </select>
                </div>
              </div>
            </div>
          </SmoothCard>
          <SmoothCard>
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Security Testing</h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Test Security Input</label>
                  <SmoothTextarea
                    value={securityTestInput}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setSecurityTestInput(e.target.value)}
                    placeholder="Enter potentially harmful input to test security..."
                    rows={3}
                  />
                </div>
                <SmoothButton onClick={testSecurity}>
                  Test Security
                </SmoothButton>
                
                {securityResults.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Security Test Results:</h4>
                    {securityResults.map((result: any, index: number) => (
                      <div key={index} className="border rounded p-3">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">Input: {result.input}</span>
                          <SmoothBadge variant={result.allowed ? 'default' : 'destructive'}>
                            {result.allowed ? 'Allowed' : 'Blocked'}
                          </SmoothBadge>
                        </div>
                        {result.violations.length > 0 && (
                          <div className="text-xs text-red-600">
                            Violations: {result.violations.map((v: any) => v.type).join(', ')}
                          </div>
                        )}
                        {result.response && (
                          <div className="text-sm mt-2 p-2 bg-muted rounded">
                            Response: {result.response}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
            </div>
          </SmoothCard>
        </div>
      </SmoothTabsContent>

      <SmoothTabsContent value="analytics" className="space-y-4">
        <SmoothCard>
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Analytics Dashboard</h2>
            <div className="text-center text-muted-foreground py-8">
              Analytics features coming soon...
            </div>
          </div>
        </SmoothCard>
      </SmoothTabsContent>
    </SmoothTabs>
    </div>
  );
}
