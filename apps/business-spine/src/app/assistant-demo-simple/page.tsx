import React, { useState, useEffect } from 'react';

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

export default function AssistantDemoSimple() {
  const [sessionId, setSessionId] = useState<string>(`demo_${Date.now()}`);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [stats, setStats] = useState<AssistantStats | null>(null);
  const [securityTestInput, setSecurityTestInput] = useState<string>('');
  const [securityResults, setSecurityResults] = useState<any[]>([]);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await fetch('/api/platform/assistant/train?type=stats');
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString()
    };

    setMessages((prev: Message[]) => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/platform/assistant/enhanced-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage,
          sessionId: sessionId,
          userId: 'demo-user'
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        const assistantMessage: Message = {
          id: `msg_${Date.now()}`,
          role: 'assistant',
          content: data.data.message,
          timestamp: new Date().toISOString(),
          intent: data.data.intent.intent,
          confidence: data.data.intent.confidence,
          securityViolations: data.data.securityViolations
        };
        
        setMessages((prev: Message[]) => [...prev, assistantMessage]);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMessage: Message = {
        id: `msg_${Date.now()}`,
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your message.',
        timestamp: new Date().toISOString()
      };
      setMessages((prev: Message[]) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      loadStats();
    }
  };

  const trainAssistant = async () => {
    setIsLoading(true);
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
        alert('Assistant trained successfully!');
        loadStats();
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Failed to train assistant:', error);
      alert('Failed to train assistant');
    } finally {
      setIsLoading(false);
    }
  };

  const testSecurity = async () => {
    if (!securityTestInput.trim()) return;

    setIsLoading(true);
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
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Failed to test security:', error);
      alert('Failed to test security');
    } finally {
      setIsLoading(false);
    }
  };

  const clearConversation = () => {
    setMessages([]);
    setSessionId(`demo_${Date.now()}`);
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>Enhanced AI Assistant Demo</h1>
        <p style={{ color: '#666' }}>
          Test the AI assistant with NLU, security firewall, and natural language comprehension
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        {/* Chat Interface */}
        <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2>AI Assistant Chat</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '0.875rem', color: '#666' }}>Session: {sessionId}</span>
              <button 
                onClick={clearConversation}
                style={{ padding: '5px 10px', fontSize: '0.875rem', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer' }}
              >
                Clear
              </button>
            </div>
          </div>

          <div style={{ height: '400px', overflowY: 'auto', border: '1px solid #eee', borderRadius: '4px', padding: '15px', marginBottom: '15px', backgroundColor: '#f9f9f9' }}>
            {messages.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#666', padding: '40px' }}>
                Start a conversation with the AI assistant...
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  style={{
                    display: 'flex',
                    justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
                    marginBottom: '15px'
                  }}
                >
                  <div
                    style={{
                      maxWidth: '70%',
                      padding: '10px 15px',
                      borderRadius: '12px',
                      backgroundColor: message.role === 'user' ? '#007bff' : '#e9ecef',
                      color: message.role === 'user' ? 'white' : 'black'
                    }}
                  >
                    <p style={{ margin: '0 0 5px 0' }}>{message.content}</p>
                    {message.intent && (
                      <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                        <span style={{ 
                          fontSize: '0.75rem', 
                          padding: '2px 6px', 
                          backgroundColor: 'rgba(255,255,255,0.2)', 
                          borderRadius: '10px' 
                        }}>
                          {message.intent}
                        </span>
                        <span style={{ 
                          fontSize: '0.75rem', 
                          padding: '2px 6px', 
                          backgroundColor: 'rgba(255,255,255,0.2)', 
                          borderRadius: '10px' 
                        }}>
                          {Math.round((message.confidence || 0) * 100)}%
                        </span>
                      </div>
                    )}
                    {message.securityViolations && message.securityViolations.length > 0 && (
                      <div style={{ 
                        fontSize: '0.75rem', 
                        color: '#dc3545', 
                        marginTop: '5px',
                        padding: '4px 6px',
                        backgroundColor: 'rgba(220, 53, 69, 0.1)',
                        borderRadius: '4px'
                      }}>
                        Security violations detected: {message.securityViolations.length}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '15px' }}>
                <div style={{ 
                  padding: '10px 15px', 
                  borderRadius: '12px', 
                  backgroundColor: '#e9ecef',
                  maxWidth: '70%'
                }}>
                  <p style={{ margin: 0 }}>Thinking...</p>
                </div>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              value={inputMessage}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputMessage(e.target.value)}
              placeholder="Type your message..."
              onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && sendMessage()}
              disabled={isLoading}
              style={{ 
                flex: 1, 
                padding: '10px', 
                border: '1px solid #ddd', 
                borderRadius: '4px',
                fontSize: '1rem'
              }}
            />
            <button 
              onClick={sendMessage} 
              disabled={isLoading}
              style={{
                padding: '10px 20px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                fontSize: '1rem'
              }}
            >
              Send
            </button>
          </div>
        </div>

        {/* Controls and Stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Training Control */}
          <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '20px' }}>
            <h3 style={{ marginTop: 0, marginBottom: '15px' }}>Training Control</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button 
                onClick={trainAssistant} 
                disabled={isLoading}
                style={{
                  padding: '10px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  fontSize: '0.875rem'
                }}
              >
                {isLoading ? 'Training...' : 'Train Assistant'}
              </button>
            </div>
          </div>

          {/* Statistics */}
          <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '20px' }}>
            <h3 style={{ marginTop: 0, marginBottom: '15px' }}>Statistics</h3>
            {stats ? (
              <div style={{ fontSize: '0.875rem', lineHeight: '1.5' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <span>Active Sessions:</span>
                  <span>{stats.activeSessions}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <span>Total Messages:</span>
                  <span>{stats.totalMessages}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <span>Avg Session Length:</span>
                  <span>{stats.averageSessionLength.toFixed(1)}</span>
                </div>
                <hr style={{ margin: '10px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <span>Security Violations:</span>
                  <span>{stats.securityStats.totalViolations}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <span>Blocked IPs:</span>
                  <span>{stats.securityStats.blockedIPs}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <span>Avg Risk Score:</span>
                  <span>{stats.securityStats.averageRiskScore.toFixed(1)}</span>
                </div>
                <hr style={{ margin: '10px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <span>Training Examples:</span>
                  <span>{stats.nluStats.totalTrainingExamples}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <span>Vocabulary Size:</span>
                  <span>{stats.nluStats.vocabularySize}</span>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: '#666', padding: '20px 0' }}>
                Loading statistics...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Security Testing */}
      <div style={{ marginTop: '30px', border: '1px solid #ddd', borderRadius: '8px', padding: '20px' }}>
        <h3 style={{ marginTop: 0, marginBottom: '15px' }}>Security Testing</h3>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.875rem', fontWeight: 'bold' }}>
            Test Security Input
          </label>
          <textarea
            value={securityTestInput}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setSecurityTestInput(e.target.value)}
            placeholder="Enter potentially harmful input to test security..."
            rows={3}
            style={{ 
              width: '100%', 
              padding: '10px', 
              border: '1px solid #ddd', 
              borderRadius: '4px',
              fontSize: '0.875rem',
              resize: 'vertical'
            }}
          />
        </div>
        <button 
          onClick={testSecurity} 
          disabled={isLoading}
          style={{
            padding: '10px 20px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            fontSize: '0.875rem'
          }}
        >
          {isLoading ? 'Testing...' : 'Test Security'}
        </button>
        
        {securityResults.length > 0 && (
          <div style={{ marginTop: '20px' }}>
            <h4 style={{ marginBottom: '10px', fontSize: '0.875rem', fontWeight: 'bold' }}>
              Security Test Results:
            </h4>
            {securityResults.map((result: any, index: number) => (
              <div key={index} style={{ 
                border: '1px solid #ddd', 
                borderRadius: '4px', 
                padding: '10px', 
                marginBottom: '10px',
                backgroundColor: result.allowed ? '#f8f9fa' : '#f8d7da'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 'bold' }}>
                    Input: {result.input}
                  </span>
                  <span style={{ 
                    fontSize: '0.75rem', 
                    padding: '2px 6px', 
                    borderRadius: '10px',
                    backgroundColor: result.allowed ? '#28a745' : '#dc3545',
                    color: 'white'
                  }}>
                    {result.allowed ? 'Allowed' : 'Blocked'}
                  </span>
                </div>
                {result.violations.length > 0 && (
                  <div style={{ fontSize: '0.75rem', color: '#dc3545', marginBottom: '5px' }}>
                    Violations: {result.violations.map((v: any) => v.type).join(', ')}
                  </div>
                )}
                {result.response && (
                  <div style={{ fontSize: '0.875rem', marginTop: '5px', padding: '5px', backgroundColor: '#e9ecef', borderRadius: '4px' }}>
                    Response: {result.response}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
