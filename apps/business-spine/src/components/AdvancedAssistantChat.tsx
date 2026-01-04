'use client';

import React, { useState, useEffect, useRef } from 'react';
import DOMPurify from 'dompurify';
import { AdvancedAssistantUI, type ChatMessage, type ConversationState, type AdvancedUIConfig } from '../packages/enterprise/platform/ui/AdvancedAssistantUI';

interface AdvancedAssistantChatProps {
  sessionId?: string;
  userId?: string;
  config?: Partial<AdvancedUIConfig>;
  className?: string;
  onMessageSent?: (message: ChatMessage) => void;
  onMessageReceived?: (message: ChatMessage) => void;
  onSecurityViolation?: (violation: any) => void;
}

export const AdvancedAssistantChat: React.FC<AdvancedAssistantChatProps> = ({
  sessionId: initialSessionId,
  userId,
  config,
  className = '',
  onMessageSent,
  onMessageReceived,
  onSecurityViolation,
}) => {
  const [ui] = useState(() => new AdvancedAssistantUI(config));
  const [sessionId, setSessionId] = useState(initialSessionId || `session_${Date.now()}`);
  const [conversation, setConversation] = useState<ConversationState | null>(null);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('auto');
  const [layout, setLayout] = useState<'sidebar' | 'fullscreen' | 'embedded'>('sidebar');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize UI and event listeners
  useEffect(() => {
    // Set up event listeners
    ui.on('message_sent', (data) => {
      setConversation(data.conversation);
      onMessageSent?.(data.message);
    });

    ui.on('message_received', (data) => {
      setConversation(data.conversation);
      onMessageReceived?.(data.message);
      scrollToBottom();
    });

    ui.on('security_violation', (data) => {
      onSecurityViolation?.(data);
    });

    ui.on('error', (data) => {
      console.error('Chat error:', data.error);
    });

    // Load initial conversation
    const conv = ui.getConversation(sessionId);
    if (conv) {
      setConversation(conv);
    } else {
      // Create new conversation
      ui.sendMessage('', sessionId, userId);
      const newConv = ui.getConversation(sessionId);
      setConversation(newConv || null);
    }

    return () => {
      ui.cleanup();
    };
  }, [ui, sessionId, userId, onMessageSent, onMessageReceived, onSecurityViolation]);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Handle message sending
  const handleSendMessage = useCallback(async () => {
    if (!inputMessage.trim() || isTyping) return;

    const message = inputMessage.trim();
    setInputMessage('');
    setShowSuggestions(false);
    setIsTyping(true);

    try {
      await ui.sendMessage(message, sessionId, userId);
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsTyping(false);
    }
  }, [inputMessage, isTyping, sessionId, userId, ui]);

  // Handle voice input
  const handleVoiceInput = useCallback(async () => {
    if (isRecording) {
      setIsRecording(false);
      return;
    }

    try {
      setIsRecording(true);
      await ui.startVoiceInput(sessionId);
    } catch (error) {
      console.error('Voice input error:', error);
      setIsRecording(false);
    }
  }, [isRecording, sessionId, ui]);

  // Handle file upload
  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    try {
      await ui.uploadFiles(files, sessionId, userId);
    } catch (error) {
      console.error('File upload error:', error);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [sessionId, userId, ui]);

  // Handle input changes and suggestions
  const handleInputChange = useCallback(async (value: string) => {
    setInputMessage(value);
    
    if (value.length > 2 && ui.isFeatureEnabled('enableSuggestions')) {
      try {
        const newSuggestions = await ui.getSuggestions(value, sessionId);
        setSuggestions(newSuggestions);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Failed to get suggestions:', error);
      }
    } else {
      setShowSuggestions(false);
    }
  }, [sessionId, ui]);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    } else if (event.key === 'Escape') {
      setShowSuggestions(false);
    }
  }, [handleSendMessage]);

  // Theme management
  const handleThemeChange = useCallback((newTheme: 'light' | 'dark' | 'auto') => {
    setTheme(newTheme);
    ui.setTheme(newTheme);
  }, [ui]);

  // Layout management
  const handleLayoutChange = useCallback((newLayout: 'sidebar' | 'fullscreen' | 'embedded') => {
    setLayout(newLayout);
    ui.setLayout(newLayout);
  }, [ui]);

  // Export conversation
  const handleExport = useCallback(async (format: 'json' | 'txt' | 'csv') => {
    try {
      const exportData = await ui.exportConversation(sessionId, format);
      const blob = new Blob([exportData], { 
        type: format === 'json' ? 'application/json' : 'text/plain' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `conversation_${sessionId}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
  }, [sessionId, ui]);

  if (!conversation) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={`advanced-assistant-chat ${className} ${layout}`} data-theme={theme}>
      {/* Header */}
      <div className="chat-header">
        <div className="header-left">
          <h3 className="chat-title">Advanced AI Assistant</h3>
          <div className="status-indicators">
            <span className={`status-dot ${conversation.isConnected ? 'online' : 'offline'}`}></span>
            <span className="status-text">
              {conversation.isTyping ? 'Assistant is typing...' : 'Online'}
            </span>
            {ui.getConfig().ui.showSecurityStatus && (
              <span className={`security-status ${conversation.securityStatus}`}>
                {conversation.securityStatus === 'secure' && '🔒'}
                {conversation.securityStatus === 'warning' && '⚠️'}
                {conversation.securityStatus === 'blocked' && '🚫'}
              </span>
            )}
          </div>
        </div>
        <div className="header-right">
          <div className="controls">
            {/* Theme selector */}
            <select 
              value={theme} 
              onChange={(e) => handleThemeChange(e.target.value as any)}
              className="theme-selector"
            >
              <option value="auto">Auto</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>

            {/* Layout selector */}
            <select 
              value={layout} 
              onChange={(e) => handleLayoutChange(e.target.value as any)}
              className="layout-selector"
            >
              <option value="sidebar">Sidebar</option>
              <option value="fullscreen">Fullscreen</option>
              <option value="embedded">Embedded</option>
            </select>

            {/* Export button */}
            {ui.isFeatureEnabled('enableExport') && (
              <div className="export-dropdown">
                <button className="export-btn">📥 Export</button>
                <div className="export-menu">
                  <button onClick={() => handleExport('json')}>JSON</button>
                  <button onClick={() => handleExport('txt')}>Text</button>
                  <button onClick={() => handleExport('csv')}>CSV</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="chat-messages">
        {conversation.messages.map((message) => (
          <div key={message.id} className={`message ${message.role}`}>
            <div className="message-content">
              <div className="message-text">
                {ui.getConfig().features.enableMarkdown ? (
                  <div 
                    dangerouslySetInnerHTML={{ 
                      __html: DOMPurify.sanitize(message.content, {
                        ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'code', 'pre', 'ul', 'ol', 'li', 'blockquote', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
                        ALLOWED_ATTR: ['class'],
                        ALLOWED_DATA_ATTR: false
                      })
                    }} 
                  />
                ) : (
                  message.content
                )}
              </div>
              
              {/* Message metadata */}
              <div className="message-metadata">
                {ui.getConfig().ui.showTimestamps && (
                  <span className="timestamp">
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                )}
                
                {message.role === 'assistant' && ui.getConfig().ui.showConfidence && (
                  <span className="confidence">
                    {Math.round((message.metadata.confidence || 0) * 100)}%
                  </span>
                )}
                
                {message.role === 'assistant' && ui.getConfig().ui.showNLUSource && (
                  <span className={`nlu-source ${message.metadata.nluSource}`}>
                    {message.metadata.nluSource}
                  </span>
                )}

                {message.metadata.securityViolations && message.metadata.securityViolations.length > 0 && (
                  <span className="security-warning">
                    ⚠️ {message.metadata.securityViolations.length} violations
                  </span>
                )}

                {message.metadata.processingTime && (
                  <span className="processing-time">
                    {message.metadata.processingTime}ms
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="suggestions">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              className="suggestion-btn"
              onClick={() => {
                setInputMessage(suggestion);
                setShowSuggestions(false);
                inputRef.current?.focus();
              }}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="chat-input">
        <div className="input-container">
          <textarea
            ref={inputRef}
            value={inputMessage}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className="message-input"
            disabled={isTyping}
            rows={1}
          />

          {/* Input controls */}
          <div className="input-controls">
            {/* Voice input */}
            {ui.isFeatureEnabled('enableVoiceInput') && (
              <button
                className={`control-btn voice-btn ${isRecording ? 'recording' : ''}`}
                onClick={handleVoiceInput}
                disabled={isTyping}
                title="Voice input"
              >
                🎤
              </button>
            )}

            {/* File upload */}
            {ui.isFeatureEnabled('enableFileUpload') && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="file-input"
                  accept=".txt,.pdf,.jpg,.jpeg,.png"
                />
                <button
                  className="control-btn file-btn"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isTyping}
                  title="Upload files"
                >
                  📎
                </button>
              </>
            )}

            {/* Send button */}
            <button
              className="control-btn send-btn"
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isTyping}
              title="Send message"
            >
              {isTyping ? '⏳' : '📤'}
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .advanced-assistant-chat {
          display: flex;
          flex-direction: column;
          height: 100%;
          background: var(--background);
          border: 1px solid var(--border);
          border-radius: 12px;
          overflow: hidden;
        }

        .advanced-assistant-chat.sidebar {
          width: 400px;
          height: 600px;
        }

        .advanced-assistant-chat.fullscreen {
          width: 100%;
          height: 100vh;
        }

        .advanced-assistant-chat.embedded {
          width: 100%;
          height: 500px;
        }

        .chat-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          background: var(--surface);
          border-bottom: 1px solid var(--border);
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .chat-title {
          margin: 0;
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--foreground);
        }

        .status-indicators {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.875rem;
          color: var(--muted);
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .status-dot.online {
          background: #10b981;
        }

        .status-dot.offline {
          background: #ef4444;
        }

        .security-status {
          font-size: 1rem;
        }

        .controls {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .theme-selector,
        .layout-selector {
          padding: 4px 8px;
          border: 1px solid var(--border);
          border-radius: 4px;
          background: var(--background);
          color: var(--foreground);
          font-size: 0.875rem;
        }

        .export-dropdown {
          position: relative;
        }

        .export-btn {
          padding: 4px 8px;
          border: 1px solid var(--border);
          border-radius: 4px;
          background: var(--background);
          color: var(--foreground);
          font-size: 0.875rem;
          cursor: pointer;
        }

        .export-menu {
          position: absolute;
          top: 100%;
          right: 0;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 4px;
          display: none;
          flex-direction: column;
          z-index: 10;
        }

        .export-dropdown:hover .export-menu {
          display: flex;
        }

        .export-menu button {
          padding: 8px 12px;
          border: none;
          background: none;
          text-align: left;
          cursor: pointer;
          white-space: nowrap;
        }

        .export-menu button:hover {
          background: var(--accent);
        }

        .chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .message {
          display: flex;
          gap: 12px;
        }

        .message.user {
          flex-direction: row-reverse;
        }

        .message-content {
          max-width: 70%;
          padding: 12px 16px;
          border-radius: 12px;
          background: var(--surface);
        }

        .message.user .message-content {
          background: var(--accent);
          color: white;
        }

        .message-text {
          margin-bottom: 4px;
          line-height: 1.5;
        }

        .message-metadata {
          display: flex;
          gap: 8px;
          font-size: 0.75rem;
          opacity: 0.7;
          flex-wrap: wrap;
        }

        .timestamp,
        .confidence,
        .nlu-source,
        .security-warning,
        .processing-time {
          padding: 2px 6px;
          border-radius: 4px;
          background: rgba(0, 0, 0, 0.1);
        }

        .nlu-source.snips {
          background: #10b981;
          color: white;
        }

        .nlu-source.enhanced {
          background: #3b82f6;
          color: white;
        }

        .nlu-source.combined {
          background: #8b5cf6;
          color: white;
        }

        .security-warning {
          background: #f59e0b;
          color: white;
        }

        .suggestions {
          padding: 0 16px;
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .suggestion-btn {
          padding: 6px 12px;
          border: 1px solid var(--border);
          border-radius: 16px;
          background: var(--surface);
          color: var(--foreground);
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .suggestion-btn:hover {
          background: var(--accent);
          color: white;
        }

        .chat-input {
          padding: 16px;
          background: var(--surface);
          border-top: 1px solid var(--border);
        }

        .input-container {
          display: flex;
          gap: 8px;
          align-items: flex-end;
        }

        .message-input {
          flex: 1;
          padding: 12px;
          border: 1px solid var(--border);
          border-radius: 8px;
          background: var(--background);
          color: var(--foreground);
          resize: none;
          min-height: 44px;
          max-height: 120px;
          font-family: inherit;
        }

        .message-input:focus {
          outline: none;
          border-color: var(--accent);
        }

        .input-controls {
          display: flex;
          gap: 4px;
        }

        .control-btn {
          width: 44px;
          height: 44px;
          border: 1px solid var(--border);
          border-radius: 8px;
          background: var(--background);
          color: var(--foreground);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }

        .control-btn:hover:not(:disabled) {
          background: var(--accent);
          color: white;
        }

        .control-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .voice-btn.recording {
          background: #ef4444;
          color: white;
          animation: pulse 1s infinite;
        }

        .file-input {
          display: none;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        /* CSS Variables for theming */
        :root[data-theme="light"] {
          --background: #ffffff;
          --surface: #f8fafc;
          --foreground: #1f2937;
          --muted: #6b7280;
          --accent: #3b82f6;
          --border: #e5e7eb;
        }

        :root[data-theme="dark"] {
          --background: #1f2937;
          --surface: #374151;
          --foreground: #f9fafb;
          --muted: #9ca3af;
          --accent: #60a5fa;
          --border: #4b5563;
        }
      `}</style>
    </div>
  );
};

export default AdvancedAssistantChat;
