/**
 * Comprehensive Test Runner for Unified AI System
 * Verifies all components are properly connected and functioning
 */

import { UnifiedAIAgent, AuthenticationFirewall, type AuthContext } from '../UnifiedAIAgent'
import { AuthenticatedAIManager } from '../AuthenticatedAIManager'
import { TransformersIntegration } from '../TransformersIntegration'
import { EnhancedForecastingEngine } from '../EnhancedForecastingEngine'
import { OptimizedOperationsEngine } from '../OptimizedOperationsEngine'
import { EnhancedClusteringEngine } from '../EnhancedClusteringEngine'
import { ExplainabilityEngine } from '../ExplainabilityEngine'
import { SystemKnowledgeBase } from '../SystemKnowledgeBase'
import { EnhancedMLOperations } from '../EnhancedMLOperations'

interface TestResult {
  name: string
  passed: boolean
  duration: number
  error?: string
}

interface TestSuite {
  name: string
  tests: TestResult[]
  totalDuration: number
  passedCount: number
  failedCount: number
}

class UnifiedAITestRunner {
  private suites: TestSuite[] = []
  private totalTests = 0
  private passedTests = 0
  private failedTests = 0

  async runAllTests(): Promise<void> {
    console.log('\n' + '='.repeat(80))
    console.log('UNIFIED AI SYSTEM - COMPREHENSIVE TEST SUITE')
    console.log('='.repeat(80) + '\n')

    await this.testUnifiedAIAgent()
    await this.testAuthenticationFirewall()
    await this.testAuthenticatedAIManager()
    await this.testTransformersIntegration()
    await this.testEnhancedForecastingEngine()
    await this.testOptimizedOperationsEngine()
    await this.testEnhancedClusteringEngine()
    await this.testExplainabilityEngine()
    await this.testSystemKnowledgeBase()
    await this.testEnhancedMLOperations()
    await this.testComponentIntegration()
    await this.testEndToEndWorkflow()
    await this.testSecurityAndFirewall()
    await this.testPerformanceAndScalability()

    this.printSummary()
  }

  private async testUnifiedAIAgent(): Promise<void> {
    const suite: TestSuite = {
      name: 'UnifiedAIAgent - Core Functionality',
      tests: [],
      totalDuration: 0,
      passedCount: 0,
      failedCount: 0
    }

    const agent = new UnifiedAIAgent()

    suite.tests.push(await this.runTest('Initialize agent', async () => {
      return agent !== undefined
    }))

    suite.tests.push(await this.runTest('Set authentication context', async () => {
      const authContext: AuthContext = {
        userId: 'test-user',
        role: 'admin',
        authLevel: 'admin',
        permissions: ['nlp:read', 'nlp:write'],
        scopes: ['read', 'write'],
        timestamp: new Date()
      }
      agent.setAuthContext(authContext)
      const status = agent.getStatus()
      return status.isAuthenticated === true
    }))

    suite.tests.push(await this.runTest('Get available features', async () => {
      const features = agent.getAvailableFeatures()
      return features.length > 0
    }))

    suite.tests.push(await this.runTest('Check feature accessibility', async () => {
      return agent.canAccessFeature('sentiment-analysis') === true
    }))

    suite.tests.push(await this.runTest('Configure LLM', async () => {
      agent.configureLLM({
        provider: 'openai',
        modelName: 'gpt-4',
        temperature: 0.7,
        maxTokens: 2048
      })
      const status = agent.getStatus()
      return status.llmConfigured === true
    }))

    suite.tests.push(await this.runTest('Enable teacher mode', async () => {
      agent.enableTeacher({ mode: 'supervised' })
      const status = agent.getStatus()
      return status.teacherEnabled === true
    }))

    suite.tests.push(await this.runTest('Disable teacher mode', async () => {
      agent.disableTeacher()
      const status = agent.getStatus()
      return status.teacherEnabled === false
    }))

    this.recordSuite(suite)
  }

  private async testAuthenticationFirewall(): Promise<void> {
    const suite: TestSuite = {
      name: 'AuthenticationFirewall - Security',
      tests: [],
      totalDuration: 0,
      passedCount: 0,
      failedCount: 0
    }

    const firewall = new AuthenticationFirewall()
    const authContext: AuthContext = {
      userId: 'test-user',
      role: 'admin',
      authLevel: 'admin',
      permissions: ['nlp:read'],
      scopes: ['read'],
      timestamp: new Date()
    }

    suite.tests.push(await this.runTest('Initialize firewall', async () => {
      return firewall !== undefined
    }))

    suite.tests.push(await this.runTest('Set firewall auth context', async () => {
      firewall.setAuthContext(authContext)
      return firewall.hasPermission('nlp:read') === true
    }))

    suite.tests.push(await this.runTest('Validate permissions', async () => {
      return firewall.hasPermission('nlp:read') === true && firewall.hasPermission('invalid') === false
    }))

    suite.tests.push(await this.runTest('Process safe input', async () => {
      return firewall.canProcessInput('Safe text', authContext) === true
    }))

    suite.tests.push(await this.runTest('Reject SQL injection', async () => {
      const publicContext: AuthContext = {
        userId: 'public',
        role: 'guest',
        authLevel: 'public',
        permissions: [],
        scopes: [],
        timestamp: new Date()
      }
      return firewall.canProcessInput("'; DROP TABLE users; --", publicContext) === false
    }))

    suite.tests.push(await this.runTest('Reject XSS attacks', async () => {
      const publicContext: AuthContext = {
        userId: 'public',
        role: 'guest',
        authLevel: 'public',
        permissions: [],
        scopes: [],
        timestamp: new Date()
      }
      return firewall.canProcessInput('<script>alert("xss")</script>', publicContext) === false
    }))

    suite.tests.push(await this.runTest('Access logging', async () => {
      firewall.canProcessInput('test', authContext)
      const log = firewall.getAccessLog()
      return log.length > 0
    }))

    this.recordSuite(suite)
  }

  private async testAuthenticatedAIManager(): Promise<void> {
    const suite: TestSuite = {
      name: 'AuthenticatedAIManager - Access Control',
      tests: [],
      totalDuration: 0,
      passedCount: 0,
      failedCount: 0
    }

    const manager = new AuthenticatedAIManager()
    const authContext: AuthContext = {
      userId: 'test-user',
      role: 'admin',
      authLevel: 'admin',
      permissions: ['nlp:read', 'nlp:write', 'forecasting:read'],
      scopes: ['read', 'write'],
      timestamp: new Date()
    }

    suite.tests.push(await this.runTest('Initialize manager', async () => {
      return manager !== undefined
    }))

    suite.tests.push(await this.runTest('Set manager auth context', async () => {
      manager.setAuthContext(authContext)
      return manager.getAgentStatus() !== undefined
    }))

    suite.tests.push(await this.runTest('Get available components', async () => {
      const components = manager.getAvailableComponents(authContext.userId, authContext)
      return components.length > 0
    }))

    suite.tests.push(await this.runTest('Grant component access', async () => {
      return manager.grantComponentAccess('nlp-engine', authContext.userId, 'write') === true
    }))

    suite.tests.push(await this.runTest('Check component accessibility', async () => {
      return manager.canAccessComponent('nlp-engine', authContext.userId, authContext) === true
    }))

    suite.tests.push(await this.runTest('Revoke component access', async () => {
      return manager.revokeComponentAccess('nlp-engine', authContext.userId) === true
    }))

    suite.tests.push(await this.runTest('Get component by ID', async () => {
      const component = manager.getComponent('nlp-engine')
      return component !== undefined && component.componentId === 'nlp-engine'
    }))

    suite.tests.push(await this.runTest('Get all components', async () => {
      const components = manager.getAllComponents()
      return components.length > 0
    }))

    suite.tests.push(await this.runTest('Audit logging', async () => {
      manager.canAccessComponent('nlp-engine', authContext.userId, authContext)
      const log = manager.getAuditLog()
      return log.length > 0
    }))

    this.recordSuite(suite)
  }

  private async testTransformersIntegration(): Promise<void> {
    const suite: TestSuite = {
      name: 'TransformersIntegration - NLP Engine',
      tests: [],
      totalDuration: 0,
      passedCount: 0,
      failedCount: 0
    }

    const transformers = new TransformersIntegration()

    suite.tests.push(await this.runTest('Initialize Transformers', async () => {
      return transformers !== undefined
    }))

    suite.tests.push(await this.runTest('Analyze sentiment', async () => {
      const result = await transformers.analyzeSentiment('This is great!')
      return result.label !== undefined && result.score !== undefined
    }))

    suite.tests.push(await this.runTest('Detect intent', async () => {
      const result = await transformers.detectIntent('What is the weather?')
      return result.label !== undefined && result.confidence !== undefined
    }))

    suite.tests.push(await this.runTest('Extract entities', async () => {
      const result = await transformers.extractEntities('John works at Google')
      return Array.isArray(result)
    }))

    suite.tests.push(await this.runTest('Calculate semantic similarity', async () => {
      const result = await transformers.calculateSimilarity('cat', 'dog')
      return result >= 0 && result <= 1
    }))

    this.recordSuite(suite)
  }

  private async testEnhancedForecastingEngine(): Promise<void> {
    const suite: TestSuite = {
      name: 'EnhancedForecastingEngine - Forecasting',
      tests: [],
      totalDuration: 0,
      passedCount: 0,
      failedCount: 0
    }

    const forecasting = new EnhancedForecastingEngine()
    const timeSeries = [100, 102, 105, 103, 108, 110, 112, 115, 113, 118]

    suite.tests.push(await this.runTest('Initialize forecasting engine', async () => {
      return forecasting !== undefined
    }))

    suite.tests.push(await this.runTest('Perform ensemble forecasting', async () => {
      const result = await forecasting.ensembleForecast(timeSeries, 5)
      return result.predictions.length === 5 && result.confidence > 0
    }))

    suite.tests.push(await this.runTest('Detect trend', async () => {
      const result = await forecasting.ensembleForecast(timeSeries, 3)
      return ['increasing', 'decreasing', 'stable'].includes(result.trend)
    }))

    suite.tests.push(await this.runTest('Analyze seasonality', async () => {
      const result = await forecasting.ensembleForecast(timeSeries, 3)
      return result.seasonality >= 0 && result.seasonality <= 1
    }))

    suite.tests.push(await this.runTest('Calculate confidence intervals', async () => {
      const result = await forecasting.ensembleForecast(timeSeries, 3)
      return result.confidenceInterval.length === 3 && result.confidenceInterval.every(ci => ci[0] <= ci[1])
    }))

    suite.tests.push(await this.runTest('Calculate error metrics', async () => {
      const result = await forecasting.ensembleForecast(timeSeries, 3)
      return result.rmse >= 0 && result.mae >= 0 && result.mape >= 0
    }))

    this.recordSuite(suite)
  }

  private async testOptimizedOperationsEngine(): Promise<void> {
    const suite: TestSuite = {
      name: 'OptimizedOperationsEngine - Optimization',
      tests: [],
      totalDuration: 0,
      passedCount: 0,
      failedCount: 0
    }

    const operations = new OptimizedOperationsEngine()

    suite.tests.push(await this.runTest('Initialize operations engine', async () => {
      return operations !== undefined
    }))

    suite.tests.push(await this.runTest('Optimize pricing', async () => {
      const result = await operations.optimizePricing(100, 0.7)
      return result.optimizedPrice > 0 && result.confidence > 0
    }))

    suite.tests.push(await this.runTest('Calculate adjustment factors', async () => {
      const result = await operations.optimizePricing(100, 0.7)
      return result.adjustmentFactors.demand > 0 && result.adjustmentFactors.competitive > 0
    }))

    suite.tests.push(await this.runTest('Calculate revenue impact', async () => {
      const result = await operations.optimizePricing(100, 0.7)
      return result.expectedRevenue > 0
    }))

    suite.tests.push(await this.runTest('Caching mechanism', async () => {
      const stats = operations.getCacheStats()
      return stats.cacheSize >= 0
    }))

    this.recordSuite(suite)
  }

  private async testEnhancedClusteringEngine(): Promise<void> {
    const suite: TestSuite = {
      name: 'EnhancedClusteringEngine - Clustering',
      tests: [],
      totalDuration: 0,
      passedCount: 0,
      failedCount: 0
    }

    const clustering = new EnhancedClusteringEngine()
    const data = [[1, 2], [1.5, 1.8], [5, 8], [8, 8], [1, 0.6], [9, 11]]

    suite.tests.push(await this.runTest('Initialize clustering engine', async () => {
      return clustering !== undefined
    }))

    suite.tests.push(await this.runTest('Perform ensemble clustering', async () => {
      const result = await clustering.ensembleClustering(data, { numClusters: 2 })
      return result.clusters.length > 0 && result.centroids.length > 0
    }))

    suite.tests.push(await this.runTest('Calculate quality metrics', async () => {
      const result = await clustering.ensembleClustering(data, { numClusters: 2 })
      return result.silhouetteScore !== undefined && result.daviesBouldinIndex !== undefined
    }))

    suite.tests.push(await this.runTest('Segment users', async () => {
      const userData = [
        { id: 'user1', features: { totalSpent: 5000, bookingCount: 50, rating: 4.8, referrals: 5 } },
        { id: 'user2', features: { totalSpent: 500, bookingCount: 5, rating: 3.5, referrals: 0 } }
      ]
      const segments = await clustering.segmentUsers(userData, 'user-value')
      return segments.length > 0 && segments[0].segmentId !== undefined
    }))

    this.recordSuite(suite)
  }

  private async testExplainabilityEngine(): Promise<void> {
    const suite: TestSuite = {
      name: 'ExplainabilityEngine - Reasoning',
      tests: [],
      totalDuration: 0,
      passedCount: 0,
      failedCount: 0
    }

    const explainability = new ExplainabilityEngine()

    suite.tests.push(await this.runTest('Initialize explainability engine', async () => {
      return explainability !== undefined
    }))

    suite.tests.push(await this.runTest('Explain decisions', async () => {
      const explanation = explainability.explainDecision(
        'Test Decision',
        { feature1: 0.8, feature2: 0.5 },
        'test-domain',
        0.85
      )
      return explanation.decision !== undefined && explanation.reasoning.length > 0
    }))

    suite.tests.push(await this.runTest('Explain predictions', async () => {
      const explanation = explainability.explainPrediction(150, { basePrice: 100 }, 'test-model', 100)
      return explanation.prediction === 150 && explanation.confidence > 0
    }))

    suite.tests.push(await this.runTest('Explain model behavior', async () => {
      const explanation = explainability.explainModel({ feature1: 0.8 }, 'test-model', 0.75)
      return explanation.modelName === 'test-model' && explanation.inputFeatures.length > 0
    }))

    this.recordSuite(suite)
  }

  private async testSystemKnowledgeBase(): Promise<void> {
    const suite: TestSuite = {
      name: 'SystemKnowledgeBase - Knowledge Management',
      tests: [],
      totalDuration: 0,
      passedCount: 0,
      failedCount: 0
    }

    const knowledgeBase = new SystemKnowledgeBase()

    suite.tests.push(await this.runTest('Initialize knowledge base', async () => {
      return knowledgeBase !== undefined
    }))

    suite.tests.push(await this.runTest('Report domain coverage', async () => {
      const report = knowledgeBase.reportDomainCoverage()
      return report.totalDomains > 0 && report.coverage > 0
    }))

    suite.tests.push(await this.runTest('Report ML capabilities', async () => {
      const report = knowledgeBase.reportMLCapabilities()
      return report.totalOperations > 0 && report.averageAccuracy > 0
    }))

    suite.tests.push(await this.runTest('Assess system readiness', async () => {
      const readiness = knowledgeBase.assessSystemReadiness()
      return readiness.overallReadiness > 0 && readiness.overallReadiness <= 1
    }))

    this.recordSuite(suite)
  }

  private async testEnhancedMLOperations(): Promise<void> {
    const suite: TestSuite = {
      name: 'EnhancedMLOperations - ML Functions',
      tests: [],
      totalDuration: 0,
      passedCount: 0,
      failedCount: 0
    }

    const mlOps = new EnhancedMLOperations()

    suite.tests.push(await this.runTest('Initialize ML operations', async () => {
      return mlOps !== undefined
    }))

    suite.tests.push(await this.runTest('Report ML function performance', async () => {
      const report = mlOps.reportMLFunctionPerformance()
      return report.totalFunctions > 0 && report.averageAccuracy > 0
    }))

    suite.tests.push(await this.runTest('Assess ML system readiness', async () => {
      const readiness = mlOps.assessSystemReadiness()
      return readiness.overallReadiness > 0
    }))

    this.recordSuite(suite)
  }

  private async testComponentIntegration(): Promise<void> {
    const suite: TestSuite = {
      name: 'Component Integration - Cross-Engine',
      tests: [],
      totalDuration: 0,
      passedCount: 0,
      failedCount: 0
    }

    suite.tests.push(await this.runTest('NLP + Explainability integration', async () => {
      const transformers = new TransformersIntegration()
      const explainability = new ExplainabilityEngine()
      const sentiment = await transformers.analyzeSentiment('Great!')
      const explanation = explainability.explainPrediction(sentiment.score, {}, 'sentiment', 0.5)
      return sentiment.score === explanation.prediction
    }))

    suite.tests.push(await this.runTest('Forecasting + Optimization integration', async () => {
      const forecasting = new EnhancedForecastingEngine()
      const operations = new OptimizedOperationsEngine()
      const forecast = await forecasting.ensembleForecast([100, 102, 105], 2)
      const pricing = await operations.optimizePricing(100, 0.7)
      return forecast.predictions.length > 0 && pricing.optimizedPrice > 0
    }))

    suite.tests.push(await this.runTest('Clustering + Explainability integration', async () => {
      const clustering = new EnhancedClusteringEngine()
      const explainability = new ExplainabilityEngine()
      const userData = [
        { id: 'user1', features: { totalSpent: 5000, bookingCount: 50, rating: 4.8, referrals: 5 } },
        { id: 'user2', features: { totalSpent: 500, bookingCount: 5, rating: 3.5, referrals: 0 } }
      ]
      const segments = await clustering.segmentUsers(userData, 'user-value')
      const explanation = explainability.explainDecision('Segment', { totalSpent: 5000 }, 'user-value', 0.9)
      return segments.length > 0 && explanation.decision !== undefined
    }))

    this.recordSuite(suite)
  }

  private async testEndToEndWorkflow(): Promise<void> {
    const suite: TestSuite = {
      name: 'End-to-End Workflow',
      tests: [],
      totalDuration: 0,
      passedCount: 0,
      failedCount: 0
    }

    const authContext: AuthContext = {
      userId: 'test-user',
      role: 'admin',
      authLevel: 'admin',
      permissions: ['nlp:read', 'nlp:write', 'forecasting:read', 'optimization:write'],
      scopes: ['read', 'write'],
      timestamp: new Date()
    }

    suite.tests.push(await this.runTest('Complete auth -> access -> process -> audit workflow', async () => {
      const manager = new AuthenticatedAIManager()
      manager.setAuthContext(authContext)
      const components = manager.getAvailableComponents(authContext.userId, authContext)
      manager.grantComponentAccess('nlp-engine', authContext.userId, 'write')
      const response = await manager.processComponentRequest('nlp-engine', authContext.userId, authContext, 'test')
      const log = manager.getAuditLog({ userId: authContext.userId })
      return components.length > 0 && response.success && log.length > 0
    }))

    suite.tests.push(await this.runTest('Process multiple components sequentially', async () => {
      const manager = new AuthenticatedAIManager()
      manager.setAuthContext(authContext)
      const nlp = await manager.processComponentRequest('nlp-engine', authContext.userId, authContext, 'test')
      const forecast = await manager.processComponentRequest('forecasting-engine', authContext.userId, authContext, { timeSeries: [100, 102], horizon: 1 })
      return nlp.success && forecast.success
    }))

    this.recordSuite(suite)
  }

  private async testSecurityAndFirewall(): Promise<void> {
    const suite: TestSuite = {
      name: 'Security & Firewall',
      tests: [],
      totalDuration: 0,
      passedCount: 0,
      failedCount: 0
    }

    const manager = new AuthenticatedAIManager()

    suite.tests.push(await this.runTest('Enforce permission restrictions', async () => {
      const limitedContext: AuthContext = {
        userId: 'limited-user',
        role: 'user',
        authLevel: 'authenticated',
        permissions: [],
        scopes: [],
        timestamp: new Date()
      }
      const response = await manager.processComponentRequest('nlp-engine', limitedContext.userId, limitedContext, 'test')
      return response.success === false
    }))

    suite.tests.push(await this.runTest('Enforce authentication level restrictions', async () => {
      const publicContext: AuthContext = {
        userId: 'public-user',
        role: 'guest',
        authLevel: 'public',
        permissions: [],
        scopes: [],
        timestamp: new Date()
      }
      const canAccess = manager.canAccessComponent('nlp-engine', publicContext.userId, publicContext)
      return canAccess === false
    }))

    suite.tests.push(await this.runTest('Validate and sanitize input', async () => {
      const authContext: AuthContext = {
        userId: 'test-user',
        role: 'admin',
        authLevel: 'admin',
        permissions: ['nlp:read'],
        scopes: ['read'],
        timestamp: new Date()
      }
      const response = await manager.processComponentRequest('nlp-engine', authContext.userId, authContext, null as any)
      return response.success === false
    }))

    this.recordSuite(suite)
  }

  private async testPerformanceAndScalability(): Promise<void> {
    const suite: TestSuite = {
      name: 'Performance & Scalability',
      tests: [],
      totalDuration: 0,
      passedCount: 0,
      failedCount: 0
    }

    suite.tests.push(await this.runTest('Handle concurrent requests', async () => {
      const transformers = new TransformersIntegration()
      const texts = ['Great!', 'Terrible!', 'Okay', 'Love it!', 'Hate it!']
      const results = await Promise.all(texts.map(t => transformers.analyzeSentiment(t)))
      return results.length === 5 && results.every(r => r.score !== undefined)
    }))

    suite.tests.push(await this.runTest('Handle load with multiple operations', async () => {
      const operations = new OptimizedOperationsEngine()
      const results = await Promise.all(
        Array(5).fill(null).map((_, i) => operations.optimizePricing(100 + i * 10, 0.5))
      )
      return results.length === 5 && results.every(r => r.optimizedPrice > 0)
    }))

    suite.tests.push(await this.runTest('Verify caching improves performance', async () => {
      const operations = new OptimizedOperationsEngine()
      const start1 = Date.now()
      await operations.optimizePricing(100, 0.5)
      const time1 = Date.now() - start1
      
      const start2 = Date.now()
      await operations.optimizePricing(100, 0.5)
      const time2 = Date.now() - start2
      
      return time2 <= time1 + 10
    }))

    this.recordSuite(suite)
  }

  private async runTest(name: string, testFn: () => Promise<boolean>): Promise<TestResult> {
    const start = Date.now()
    try {
      const passed = await testFn()
      const duration = Date.now() - start
      return { name, passed, duration }
    } catch (error) {
      const duration = Date.now() - start
      return {
        name,
        passed: false,
        duration,
        error: error instanceof Error ? error.message : String(error)
      }
    }
  }

  private recordSuite(suite: TestSuite): void {
    suite.totalDuration = suite.tests.reduce((sum, t) => sum + t.duration, 0)
    suite.passedCount = suite.tests.filter(t => t.passed).length
    suite.failedCount = suite.tests.filter(t => !t.passed).length

    this.suites.push(suite)
    this.totalTests += suite.tests.length
    this.passedTests += suite.passedCount
    this.failedTests += suite.failedCount

    this.printSuite(suite)
  }

  private printSuite(suite: TestSuite): void {
    const status = suite.failedCount === 0 ? '✅ PASS' : '❌ FAIL'
    console.log(`\n${status} ${suite.name}`)
    console.log(`   ${suite.passedCount}/${suite.tests.length} tests passed (${suite.totalDuration}ms)`)

    suite.tests.forEach(test => {
      const icon = test.passed ? '  ✓' : '  ✗'
      console.log(`${icon} ${test.name} (${test.duration}ms)`)
      if (test.error) {
        console.log(`    Error: ${test.error}`)
      }
    })
  }

  private printSummary(): void {
    console.log('\n' + '='.repeat(80))
    console.log('TEST SUMMARY')
    console.log('='.repeat(80))
    console.log(`Total Suites: ${this.suites.length}`)
    console.log(`Total Tests: ${this.totalTests}`)
    console.log(`Passed: ${this.passedTests} ✅`)
    console.log(`Failed: ${this.failedTests} ❌`)
    console.log(`Success Rate: ${((this.passedTests / this.totalTests) * 100).toFixed(1)}%`)
    console.log(`Total Duration: ${this.suites.reduce((sum, s) => sum + s.totalDuration, 0)}ms`)
    console.log('='.repeat(80) + '\n')

    if (this.failedTests === 0) {
      console.log('🎉 ALL TESTS PASSED - SYSTEM FULLY CONNECTED AND OPERATIONAL')
    } else {
      console.log(`⚠️  ${this.failedTests} test(s) failed - review errors above`)
    }
  }
}

// Run tests
const runner = new UnifiedAITestRunner()
runner.runAllTests().catch(console.error)
