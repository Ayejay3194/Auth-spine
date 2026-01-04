'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAppContext } from '@/src/providers/AppContext';
import { uiLogger } from '@/src/lib/ui-logger';
import { usePageState } from '@/src/hooks/usePageState';

interface CopilotMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    confidence?: number;
    nluSource?: string;
    processingTime?: number;
    intent?: string;
    entities?: Array<{ type: string; value: string; confidence: number }>;
    error?: string;
    actionName?: string;
    actionResult?: {
      success: boolean;
      data?: Record<string, unknown>;
      error?: string;
    };
    executionTime?: number;
  };
}

interface CopilotAction {
  name: string;
  description: string;
  parameters: Record<string, {
    type: 'string' | 'number' | 'boolean' | 'array' | 'object';
    description: string;
    required?: boolean;
    default?: unknown;
  }>;
}

interface CopilotContext {
  sessionId: string;
  page: string;
  component: string;
  data: Record<string, unknown>;
  metadata: Record<string, unknown>;
}

interface CopilotConfig {
  endpoint: string;
  properties: {
    name: string;
    instructions: string;
    description?: string;
  };
  features: {
    enableAutoComplete: boolean;
    enableSidePanel: boolean;
    enableInlineActions: boolean;
  };
  ui: {
    theme: 'light' | 'dark' | 'auto';
    position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
    size: 'small' | 'medium' | 'large';
  };
}

interface CopilotKitAssistantProps {
  sessionId?: string;
  userId?: string;
  config?: Partial<CopilotConfig>;
  className?: string;
  onMessageProcessed?: (message: CopilotMessage) => void;
  onActionExecuted?: (action: string, result: {
  success: boolean;
  data?: Record<string, unknown>;
  error?: string;
}) => void;
  onContextUpdate?: (context: CopilotContext) => void;
}

export const CopilotKitAssistant: React.FC<CopilotKitAssistantProps> = ({
  sessionId: initialSessionId = `copilot_${Date.now()}`,
  userId,
  config,
  className = '',
  onMessageProcessed,
  onActionExecuted,
  onContextUpdate,
}: CopilotKitAssistantProps) => {
  const { user, addNotification } = useAppContext();
  const [sessionId, setSessionId] = useState(initialSessionId || `copilot_${Date.now()}`);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<CopilotMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [contextualActions, setContextualActions] = useState<CopilotAction[]>([]);
  const [showSidePanel, setShowSidePanel] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('auto');
  const [position, setPosition] = useState<'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'>('bottom-right');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Load contextual actions using usePageState
  const { data: actionsData, refetch: refetchActions } = usePageState(
    async () => {
      try {
        const response = await fetch('/api/platform/assistant/actions');
        if (!response.ok) throw new Error('Failed to load actions');
        const data = await response.json();
        return data.actions || [];
      } catch (error) {
        uiLogger.error('Failed to load actions', error, { sessionId });
        return [];
      }
    },
    [isOpen],
    {
      onError: (error) => {
        addNotification(`Failed to load actions: ${error.message}`, 'error');
      }
    }
  );

  useEffect(() => {
    if (actionsData) {
      setContextualActions(actionsData);
    }
  }, [actionsData]);

  // Default configuration
  const defaultConfig: CopilotConfig = {
    endpoint: '/api/platform/assistant/hybrid-chat',
    properties: {
      name: 'Auth-Spine Copilot',
      instructions: 'You are a helpful AI assistant integrated with the Auth-Spine platform.',
      description: 'Advanced AI assistant with contextual actions and side panel support'
    },
    features: {
      enableAutoComplete: true,
      enableSidePanel: true,
      enableInlineActions: true,
    },
    ui: {
      theme: 'auto',
      position: 'bottom-right',
      size: 'medium',
    },
  };

  const finalConfig = { ...defaultConfig, ...config };

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Initialize session when component opens
  useEffect(() => {
    if (isOpen && !sessionId) {
      setSessionId(`copilot_${Date.now()}`);
    }
  }, [isOpen, sessionId]);

  // Handle message sending
  const handleSendMessage = useCallback(async () => {
    if (!inputMessage.trim() || isTyping) return;

    const message = inputMessage.trim();
    setInputMessage('');
    setIsTyping(true);

    // Add user message
    const userMessage: CopilotMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: message,
      timestamp: new Date()
    };
    setMessages((prev: CopilotMessage[]) => [...prev, userMessage]);

    try {
      const startTime = Date.now();
      const response = await fetch(finalConfig.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          sessionId,
          userId: userId || user?.id || 'anonymous',
          context: {
            page: window.location.pathname,
            timestamp: new Date().toISOString()
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const processingTime = Date.now() - startTime;
      
      if (!data.success) {
        throw new Error(data.error || 'API request failed');
      }

      const assistantMessage: CopilotMessage = {
        id: `assistant_${Date.now()}`,
        role: 'assistant',
        content: data.data.message,
        timestamp: new Date(),
        metadata: {
          confidence: data.data.confidence,
          nluSource: data.data.nluSource || 'hybrid',
          processingTime,
          intent: data.data.intent,
          entities: data.data.entities
        }
      };

      setMessages((prev: CopilotMessage[]) => [...prev, assistantMessage]);
      onMessageProcessed?.(assistantMessage);
      scrollToBottom();

      // Update contextual actions based on response
      if (data.data.suggestedActions) {
        setContextualActions(data.data.suggestedActions);
      }

    } catch (error) {
      uiLogger.error('Failed to process message', error, { sessionId, messageLength: message.length });
      
      const errorMessage: CopilotMessage = {
        id: `error_${Date.now()}`,
        role: 'assistant',
        content: 'I apologize, but I encountered an error processing your request. Please try again.',
        timestamp: new Date(),
        metadata: {
          error: error instanceof Error ? error.message : String(error)
        }
      };
      
      setMessages((prev: CopilotMessage[]) => [...prev, errorMessage]);
      
      // Show notification for better UX
      addNotification('AI assistant temporarily unavailable', 'warning');
    } finally {
      setIsTyping(false);
    }
  }, [inputMessage, isTyping, onMessageProcessed, sessionId, userId, user, finalConfig.endpoint, addNotification]);

  // Handle auto-complete
  const handleInputChange = useCallback(async (value: string) => {
    setInputMessage(value);
    
    if (value.length > 2) {
      try {
        const response = await fetch('/api/platform/assistant/autocomplete', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: value,
            sessionId,
            context: {
              page: window.location.pathname
            }
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data.suggestions) {
            setSuggestions(data.data.suggestions);
          }
        }
      } catch (error) {
        // Fallback to simple suggestions if API fails
        const fallbackSuggestions = [
          value + ' appointment',
          value + ' booking',
          value + ' pricing',
          value + ' availability'
        ];
        setSuggestions(fallbackSuggestions);
      }
    } else {
      setSuggestions([]);
    }
  }, [sessionId]);

  // Handle action execution
  const handleExecuteAction = useCallback(async (action: CopilotAction) => {
    try {
      const response = await fetch('/api/platform/assistant/execute-action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: action.name,
          parameters: action.parameters,
          sessionId,
          userId: userId || user?.id || 'anonymous'
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to execute action: ${response.statusText}`);
      }

      const data = await response.json();
      
      const actionMessage: CopilotMessage = {
        id: `action_${Date.now()}`,
        role: 'assistant',
        content: data.data.message || `✅ ${action.description} completed successfully.`,
        timestamp: new Date(),
        metadata: {
          actionName: action.name,
          actionResult: data.data.result,
          executionTime: data.data.executionTime
        }
      };
      
      setMessages((prev: CopilotMessage[]) => [...prev, actionMessage]);
      onActionExecuted?.(action.name, data.data.result);
      scrollToBottom();

      // Show success notification
      addNotification(action.description, 'success');
      
    } catch (error) {
      uiLogger.error('Failed to execute action', error, { actionName, sessionId });
      
      const errorMessage: CopilotMessage = {
        id: `action_error_${Date.now()}`,
        role: 'assistant',
        content: `❌ Failed to execute ${action.description}. Please try again.`,
        timestamp: new Date(),
        metadata: {
          actionName: action.name,
          error: error instanceof Error ? error.message : String(error)
        }
      };
      
      setMessages((prev: CopilotMessage[]) => [...prev, errorMessage]);
      
      // Show error notification
      addNotification('Failed to execute action', 'error');
    }
  }, [sessionId, userId, user, onActionExecuted, addNotification]);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    } else if (event.key === 'Escape') {
      setIsOpen(false);
    }
  }, [handleSendMessage]);

  // Theme management
  const handleThemeChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    const newTheme = event.target.value as 'light' | 'dark' | 'auto';
    setTheme(newTheme);
  }, []);

  // Position management
  const handlePositionChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    const newPosition = event.target.value as 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
    setPosition(newPosition);
  }, []);

  // Get position classes
  const getPositionClasses = () => {
    const baseClasses = 'fixed z-50';
    const positionClasses: Record<string, string> = {
      'bottom-right': 'bottom-4 right-4',
      'bottom-left': 'bottom-4 left-4',
      'top-right': 'top-4 right-4',
      'top-left': 'top-4 left-4'
    };
    return `${baseClasses} ${positionClasses[position]}`;
  };

  if (!isOpen) {
    return (
      <div className={getPositionClasses()}>
        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-all duration-200 hover:scale-105"
          title="Open AI Assistant"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className={`copilot-kit-assistant ${className} ${theme}`} data-theme={theme}>
      {/* Main Chat Window */}
      <div className={`fixed z-50 ${getPositionClasses().replace('fixed z-50', '')} w-96 h-[600px] bg-white rounded-lg shadow-2xl flex flex-col`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gray-50 rounded-t-lg">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <h3 className="font-semibold text-gray-900">AI Assistant</h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowSidePanel(!showSidePanel)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded"
              title="Side Panel"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded"
              title="Close"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Messages */}
          <div className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message: CopilotMessage) => (
                <div key={message.id} className={`message ${message.role}`}>
                  <div className={`max-w-[80%] p-3 rounded-lg ${
                    message.role === 'user' 
                      ? 'bg-blue-600 text-white ml-auto' 
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    <div className="text-sm">{message.content}</div>
                    
                    {/* Message metadata */}
                    {message.metadata && (
                      <div className="mt-2 text-xs opacity-70 space-x-2">
                        {message.metadata.confidence && (
                          <span>Confidence: {Math.round(message.metadata.confidence * 100)}%</span>
                        )}
                        {message.metadata.nluSource && (
                          <span className="px-2 py-1 bg-blue-500 text-white rounded text-xs">
                            {message.metadata.nluSource}
                          </span>
                        )}
                        {message.metadata.processingTime && (
                          <span>{message.metadata.processingTime}ms</span>
                        )}
                      </div>
                    )}

                    {/* Action buttons */}
                    {message.role === 'assistant' && contextualActions.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {contextualActions.slice(0, 2).map((action: CopilotAction, index: number) => (
                          <button
                            key={index}
                            onClick={() => handleExecuteAction(action)}
                            className="w-full text-left p-2 bg-white bg-opacity-20 rounded text-sm hover:bg-opacity-30 transition-colors"
                          >
                            🎯 {action.description}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="message assistant">
                  <div className="bg-gray-100 text-gray-900 p-3 rounded-lg max-w-[80%]">
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-sm text-gray-600">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggestions */}
            {suggestions.length > 0 && (
              <div className="p-4 border-t bg-gray-50">
                <div className="text-xs text-gray-600 mb-2">Suggestions:</div>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((suggestion: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => {
                        setInputMessage(suggestion);
                        setSuggestions([]);
                        inputRef.current?.focus();
                      }}
                      className="px-3 py-1 bg-white border border-gray-300 rounded-full text-sm hover:bg-gray-50 transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-4 border-t">
              <div className="flex space-x-2">
                <textarea
                  ref={inputRef}
                  value={inputMessage}
                  onChange={(e) => handleInputChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message..."
                  className="flex-1 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  disabled={isTyping}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isTyping}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isTyping ? '...' : 'Send'}
                </button>
              </div>
            </div>
          </div>

          {/* Side Panel */}
          {showSidePanel && (
            <div className="w-80 border-l bg-gray-50 p-4 overflow-y-auto">
              <div className="mb-4">
                <h4 className="font-semibold text-gray-900 mb-2">Contextual Actions</h4>
                <div className="space-y-2">
                  {contextualActions.map((action: CopilotAction, index: number) => (
                    <button
                      key={index}
                      onClick={() => handleExecuteAction(action)}
                      className="w-full text-left p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="font-medium text-sm">{action.name}</div>
                      <div className="text-xs text-gray-600">{action.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Settings */}
              <div className="mb-4">
                <h5 className="font-medium text-gray-900 mb-2">Settings</h5>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Theme</label>
                    <select
                      value={theme}
                      onChange={(e) => handleThemeChange(e.target.value as any)}
                      className="w-full p-2 border border-gray-300 rounded text-sm"
                    >
                      <option value="auto">Auto</option>
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                    <select
                      value={position}
                      onChange={(e) => handlePositionChange(e.target.value as any)}
                      className="w-full p-2 border border-gray-300 rounded text-sm"
                    >
                      <option value="bottom-right">Bottom Right</option>
                      <option value="bottom-left">Bottom Left</option>
                      <option value="top-right">Top Right</option>
                      <option value="top-left">Top Left</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Analytics */}
              <div>
                <h5 className="font-medium text-gray-900 mb-2">Analytics</h5>
                <div className="text-sm text-gray-600">
                  <div>Messages: {messages.length}</div>
                  <div>Actions Available: {contextualActions.length}</div>
                  <div>Session: {sessionId}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .copilot-kit-assistant[data-theme="dark"] {
          --background: #1f2937;
          --surface: #374151;
          --foreground: #f9fafb;
          --border: #4b5563;
        }

        .copilot-kit-assistant[data-theme="dark"] .bg-white {
          background-color: var(--background);
        }

        .copilot-kit-assistant[data-theme="dark"] .bg-gray-50 {
          background-color: var(--surface);
        }

        .copilot-kit-assistant[data-theme="dark"] .text-gray-900 {
          color: var(--foreground);
        }

        .copilot-kit-assistant[data-theme="dark"] .text-gray-600 {
          color: #9ca3af;
        }

        .copilot-kit-assistant[data-theme="dark"] .border-gray-300 {
          border-color: var(--border);
        }

        .copilot-kit-assistant[data-theme="dark"] .border-gray-200 {
          border-color: var(--border);
        }

        .copilot-kit-assistant[data-theme="dark"] .bg-gray-100 {
          background-color: var(--surface);
        }

        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
      `}</style>
    </div>
  );
};

export default CopilotKitAssistant;
