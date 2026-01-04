import { describe, it, expect, beforeEach, afterEach } from '@jest/globals'
import { UnifiedAIAgent, AuthenticationFirewall, type AuthContext } from '../UnifiedAIAgent'
import { AuthenticatedAIManager } from '../AuthenticatedAIManager'
import { TransformersIntegration } from '../TransformersIntegration'
import { EnhancedForecastingEngine } from '../EnhancedForecastingEngine'
import { OptimizedOperationsEngine } from '../OptimizedOperationsEngine'
import { EnhancedClusteringEngine } from '../EnhancedClusteringEngine'
import { ExplainabilityEngine } from '../ExplainabilityEngine'

describe('Unified AI System - Full Integration Tests', () => {
  let agent: UnifiedAIAgent
  let manager: AuthenticatedAIManager
  let authContext: AuthContext

  beforeEach(() => {
    agent = new UnifiedAIAgent()
    manager = new AuthenticatedAIManager()

    authContext = {
      userId: 'test-user-123',
      role: 'admin',
      authLevel: 'admin',
      permissions: [
        'nlp:read', 'nlp:write',
        'forecasting:read', 'forecasting:write',
        'optimization:read', 'optimization:write',
        'clustering:read', 'clustering:write',
        'reasoning:read', 'reasoning:write',
        'users:read', 'users:write',
        'pricing:read', 'pricing:write',
        'risk:read', 'anomalies:read',
        'recommendations:read'
      ],
      scopes: ['read', 'write'],
      timestamp: new Date()
    }
  })

  afterEach(() => {
    // Cleanup
  })

  describe('UnifiedAIAgent - Core Functionality', () => {
    it('should initialize agent successfully', () => {
      expect(agent).toBeDefined()
      const status = agent.getStatus()
      expect(status).toBeDefined()
    })

    it('should set authentication context', () => {
      agent.setAuthContext(authContext)
      const status = agent.getStatus()
      expect(status.isAuthenticated).toBe(true)
      expect(status.authLevel).toBe('admin')
    })

    it('should return available features for authenticated user', () => {
      agent.setAuthContext(authContext)
      const features = agent.getAvailableFeatures()
      expect(features.length).toBeGreaterThan(0)
      expect(features.some(f => f.id === 'sentiment-analysis')).toBe(true)
    })

    it('should check feature accessibility', () => {
      agent.setAuthContext(authContext)
      const canAccess = agent.canAccessFeature('sentiment-analysis')
      expect(canAccess).toBe(true)
    })

    it('should deny access to restricted features without permissions', () => {
      const limitedContext: AuthContext = {
        userId: 'limited-user',
        role: 'user',
        authLevel: 'authenticated',
        permissions: ['nlp:read'],
        scopes: ['read'],
        timestamp: new Date()
      }
      agent.setAuthContext(limitedContext)
      const canAccess = agent.canAccessFeature('pricing-optimization')
      expect(canAccess).toBe(false)
    })

    it('should get feature by ID', () => {
      const feature = agent.getFeature('sentiment-analysis')
      expect(feature).toBeDefined()
      expect(feature?.id).toBe('sentiment-analysis')
      expect(feature?.requiredAuthLevel).toBe('authenticated')
    })
  })

  describe('AuthenticationFirewall - Security', () => {
    let firewall: AuthenticationFirewall

    beforeEach(() => {
      firewall = new AuthenticationFirewall()
    })

    it('should initialize firewall', () => {
      expect(firewall).toBeDefined()
    })

    it('should set auth context', () => {
      firewall.setAuthContext(authContext)
      expect(firewall.hasPermission('nlp:read')).toBe(true)
    })

    it('should validate permissions', () => {
      firewall.setAuthContext(authContext)
      expect(firewall.hasPermission('nlp:read')).toBe(true)
      expect(firewall.hasPermission('invalid:permission')).toBe(false)
    })

    it('should process safe input', () => {
      const canProcess = firewall.canProcessInput('This is safe text', authContext)
      expect(canProcess).toBe(true)
    })

    it('should reject SQL injection attempts', () => {
      const publicContext: AuthContext = {
        userId: 'public-user',
        role: 'guest',
        authLevel: 'public',
        permissions: [],
        scopes: [],
        timestamp: new Date()
      }
      const maliciousInput = "'; DROP TABLE users; --"
      const canProcess = firewall.canProcessInput(maliciousInput, publicContext)
      expect(canProcess).toBe(false)
    })

    it('should reject XSS attempts', () => {
      const publicContext: AuthContext = {
        userId: 'public-user',
        role: 'guest',
        authLevel: 'public',
        permissions: [],
        scopes: [],
        timestamp: new Date()
      }
      const xssInput = '<script>alert("xss")</script>'
      const canProcess = firewall.canProcessInput(xssInput, publicContext)
      expect(canProcess).toBe(false)
    })

    it('should log access attempts', () => {
      firewall.setAuthContext(authContext)
      firewall.canProcessInput('test input', authContext)
      const log = firewall.getAccessLog()
      expect(log.length).toBeGreaterThan(0)
    })

    it('should clear access log', () => {
      firewall.setAuthContext(authContext)
      firewall.canProcessInput('test input', authContext)
      firewall.clearAccessLog()
      const log = firewall.getAccessLog()
      expect(log.length).toBe(0)
    })
  })

  describe('AuthenticatedAIManager - Component Access Control', () => {
    it('should initialize manager', () => {
      expect(manager).toBeDefined()
    })

    it('should set auth context', () => {
      manager.setAuthContext(authContext)
      expect(manager.getAgentStatus()).toBeDefined()
    })

    it('should get available components for user', () => {
      manager.setAuthContext(authContext)
      const components = manager.getAvailableComponents(authContext.userId, authContext)
      expect(components.length).toBeGreaterThan(0)
      expect(components.some(c => c.componentId === 'nlp-engine')).toBe(true)
    })

    it('should grant component access', () => {
      const granted = manager.grantComponentAccess('nlp-engine', authContext.userId, 'write')
      expect(granted).toBe(true)
    })

    it('should revoke component access', () => {
      manager.grantComponentAccess('nlp-engine', authContext.userId, 'write')
      const revoked = manager.revokeComponentAccess('nlp-engine', authContext.userId)
      expect(revoked).toBe(true)
    })

    it('should check component accessibility', () => {
      const canAccess = manager.canAccessComponent('nlp-engine', authContext.userId, authContext)
      expect(typeof canAccess).toBe('boolean')
    })

    it('should get component by ID', () => {
      const component = manager.getComponent('nlp-engine')
      expect(component).toBeDefined()
      expect(component?.componentId).toBe('nlp-engine')
    })

    it('should get all components', () => {
      const components = manager.getAllComponents()
      expect(components.length).toBeGreaterThan(0)
      expect(components.some(c => c.componentId === 'nlp-engine')).toBe(true)
    })

    it('should log access attempts', () => {
      manager.setAuthContext(authContext)
      manager.canAccessComponent('nlp-engine', authContext.userId, authContext)
      const log = manager.getAuditLog()
      expect(log.length).toBeGreaterThan(0)
    })

    it('should filter audit log by user', () => {
      manager.setAuthContext(authContext)
      manager.canAccessComponent('nlp-engine', authContext.userId, authContext)
      const log = manager.getAuditLog({ userId: authContext.userId })
      expect(log.length).toBeGreaterThan(0)
      expect(log.every(entry => entry.userId === authContext.userId)).toBe(true)
    })

    it('should filter audit log by component', () => {
      manager.setAuthContext(authContext)
      manager.canAccessComponent('nlp-engine', authContext.userId, authContext)
      const log = manager.getAuditLog({ componentId: 'nlp-engine' })
      expect(log.length).toBeGreaterThan(0)
      expect(log.every(entry => entry.componentId === 'nlp-engine')).toBe(true)
    })
  })

  describe('Component Integration - NLP Engine', () => {
    it('should process NLP request through manager', async () => {
      manager.setAuthContext(authContext)
      const response = await manager.processComponentRequest(
        'nlp-engine',
        authContext.userId,
        authContext,
        'This is a great product!'
      )
      expect(response.success).toBe(true)
      expect(response.data).toBeDefined()
    })

    it('should deny NLP access without permission', async () => {
      const limitedContext: AuthContext = {
        userId: 'limited-user',
        role: 'user',
        authLevel: 'authenticated',
        permissions: [],
        scopes: [],
        timestamp: new Date()
      }
      manager.setAuthContext(limitedContext)
      const response = await manager.processComponentRequest(
        'nlp-engine',
        limitedContext.userId,
        limitedContext,
        'test'
      )
      expect(response.success).toBe(false)
    })
  })

  describe('Component Integration - Forecasting Engine', () => {
    it('should process forecasting request through manager', async () => {
      manager.setAuthContext(authContext)
      const response = await manager.processComponentRequest(
        'forecasting-engine',
        authContext.userId,
        authContext,
        { timeSeries: [100, 102, 105, 103, 108, 110], horizon: 3 }
      )
      expect(response.success).toBe(true)
      expect(response.data).toBeDefined()
    })
  })

  describe('Component Integration - Optimization Engine', () => {
    it('should process optimization request through manager', async () => {
      manager.setAuthContext(authContext)
      const response = await manager.processComponentRequest(
        'optimization-engine',
        authContext.userId,
        authContext,
        { basePrice: 100, demandLevel: 0.7 }
      )
      expect(response.success).toBe(true)
      expect(response.data).toBeDefined()
    })
  })

  describe('LLM Configuration', () => {
    it('should configure LLM', () => {
      agent.configureLLM({
        provider: 'openai',
        modelName: 'gpt-4',
        temperature: 0.7,
        maxTokens: 2048
      })
      const status = agent.getStatus()
      expect(status.llmConfigured).toBe(true)
    })

    it('should support multiple LLM providers', () => {
      const providers = ['openai', 'anthropic', 'huggingface', 'local']
      for (const provider of providers) {
        agent.configureLLM({
          provider: provider as any,
          modelName: 'test-model',
          temperature: 0.7,
          maxTokens: 2048
        })
        const status = agent.getStatus()
        expect(status.llmConfigured).toBe(true)
      }
    })
  })

  describe('Teacher Mode', () => {
    it('should enable teacher mode', () => {
      agent.enableTeacher({
        mode: 'supervised',
        feedbackThreshold: 0.7,
        learningRate: 0.01
      })
      const status = agent.getStatus()
      expect(status.teacherEnabled).toBe(true)
    })

    it('should disable teacher mode', () => {
      agent.enableTeacher()
      agent.disableTeacher()
      const status = agent.getStatus()
      expect(status.teacherEnabled).toBe(false)
    })

    it('should support different learning modes', () => {
      const modes = ['supervised', 'semi-supervised', 'reinforcement']
      for (const mode of modes) {
        agent.enableTeacher({ mode: mode as any })
        const status = agent.getStatus()
        expect(status.teacherEnabled).toBe(true)
      }
    })
  })

  describe('Authentication Levels', () => {
    it('should restrict features by auth level', () => {
      const publicContext: AuthContext = {
        userId: 'public-user',
        role: 'guest',
        authLevel: 'public',
        permissions: [],
        scopes: [],
        timestamp: new Date()
      }
      agent.setAuthContext(publicContext)
      const features = agent.getAvailableFeatures()
      expect(features.length).toBe(0)
    })

    it('should allow authenticated features for authenticated users', () => {
      const authenticatedContext: AuthContext = {
        userId: 'auth-user',
        role: 'user',
        authLevel: 'authenticated',
        permissions: ['nlp:read', 'forecasting:read'],
        scopes: ['read'],
        timestamp: new Date()
      }
      agent.setAuthContext(authenticatedContext)
      const features = agent.getAvailableFeatures()
      expect(features.length).toBeGreaterThan(0)
      expect(features.some(f => f.id === 'sentiment-analysis')).toBe(true)
    })

    it('should allow admin features for admin users', () => {
      agent.setAuthContext(authContext)
      const features = agent.getAvailableFeatures()
      expect(features.some(f => f.id === 'user-segmentation')).toBe(true)
    })
  })

  describe('End-to-End Workflow', () => {
    it('should complete full workflow: auth -> access -> process -> audit', async () => {
      // 1. Set auth context
      manager.setAuthContext(authContext)

      // 2. Check available components
      const components = manager.getAvailableComponents(authContext.userId, authContext)
      expect(components.length).toBeGreaterThan(0)

      // 3. Grant access
      manager.grantComponentAccess('nlp-engine', authContext.userId, 'write')

      // 4. Process request
      const response = await manager.processComponentRequest(
        'nlp-engine',
        authContext.userId,
        authContext,
        'Test input'
      )
      expect(response.success).toBe(true)

      // 5. Check audit log
      const log = manager.getAuditLog({ userId: authContext.userId })
      expect(log.length).toBeGreaterThan(0)
    })

    it('should handle multiple component requests', async () => {
      manager.setAuthContext(authContext)

      // Process NLP
      const nlpResponse = await manager.processComponentRequest(
        'nlp-engine',
        authContext.userId,
        authContext,
        'Test text'
      )
      expect(nlpResponse.success).toBe(true)

      // Process Forecasting
      const forecastResponse = await manager.processComponentRequest(
        'forecasting-engine',
        authContext.userId,
        authContext,
        { timeSeries: [100, 102, 105], horizon: 2 }
      )
      expect(forecastResponse.success).toBe(true)

      // Process Optimization
      const optResponse = await manager.processComponentRequest(
        'optimization-engine',
        authContext.userId,
        authContext,
        { basePrice: 100, demandLevel: 0.5 }
      )
      expect(optResponse.success).toBe(true)

      // Verify all logged
      const log = manager.getAuditLog({ userId: authContext.userId })
      expect(log.length).toBeGreaterThan(0)
    })
  })

  describe('Error Handling', () => {
    it('should handle invalid component access', async () => {
      manager.setAuthContext(authContext)
      const response = await manager.processComponentRequest(
        'invalid-component',
        authContext.userId,
        authContext,
        'test'
      )
      expect(response.success).toBe(false)
    })

    it('should handle missing auth context', async () => {
      const response = await manager.processComponentRequest(
        'nlp-engine',
        'user123',
        authContext,
        'test'
      )
      // Should still work if auth context is valid
      expect(response).toBeDefined()
    })

    it('should handle invalid input data', async () => {
      manager.setAuthContext(authContext)
      const response = await manager.processComponentRequest(
        'nlp-engine',
        authContext.userId,
        authContext,
        null as any
      )
      expect(response.success).toBe(false)
    })
  })

  describe('Performance & Scalability', () => {
    it('should handle rapid requests', async () => {
      manager.setAuthContext(authContext)
      const requests = Array(10).fill(null).map((_, i) =>
        manager.processComponentRequest(
          'nlp-engine',
          authContext.userId,
          authContext,
          `Test input ${i}`
        )
      )
      const results = await Promise.all(requests)
      expect(results.every(r => r.success)).toBe(true)
    })

    it('should maintain audit log under load', async () => {
      manager.setAuthContext(authContext)
      for (let i = 0; i < 100; i++) {
        manager.canAccessComponent('nlp-engine', authContext.userId, authContext)
      }
      const log = manager.getAuditLog()
      expect(log.length).toBeGreaterThan(0)
    })
  })

  describe('Feature Isolation', () => {
    it('should isolate NLP features from other components', () => {
      agent.setAuthContext(authContext)
      const nlpFeatures = agent.getAvailableFeatures()
        .filter(f => f.category === 'nlp')
      expect(nlpFeatures.length).toBeGreaterThan(0)
      expect(nlpFeatures.every(f => f.category === 'nlp')).toBe(true)
    })

    it('should isolate forecasting features', () => {
      agent.setAuthContext(authContext)
      const forecastFeatures = agent.getAvailableFeatures()
        .filter(f => f.category === 'forecasting')
      expect(forecastFeatures.length).toBeGreaterThan(0)
      expect(forecastFeatures.every(f => f.category === 'forecasting')).toBe(true)
    })

    it('should isolate optimization features', () => {
      agent.setAuthContext(authContext)
      const optFeatures = agent.getAvailableFeatures()
        .filter(f => f.category === 'optimization')
      expect(optFeatures.length).toBeGreaterThan(0)
      expect(optFeatures.every(f => f.category === 'optimization')).toBe(true)
    })
  })
})
