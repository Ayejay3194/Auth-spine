import { describe, it, expect, beforeEach } from '@jest/globals'
import { TransformersIntegration } from '../TransformersIntegration'
import { EnhancedForecastingEngine } from '../EnhancedForecastingEngine'
import { OptimizedOperationsEngine } from '../OptimizedOperationsEngine'
import { EnhancedClusteringEngine } from '../EnhancedClusteringEngine'
import { ExplainabilityEngine } from '../ExplainabilityEngine'
import { SystemKnowledgeBase } from '../SystemKnowledgeBase'
import { EnhancedMLOperations } from '../EnhancedMLOperations'

describe('AI Engines - Component Integration Tests', () => {
  describe('TransformersIntegration - NLP Engine', () => {
    let transformers: TransformersIntegration

    beforeEach(() => {
      transformers = new TransformersIntegration()
    })

    it('should initialize transformers integration', () => {
      expect(transformers).toBeDefined()
    })

    it('should analyze sentiment', async () => {
      const result = await transformers.analyzeSentiment('This is great!')
      expect(result).toBeDefined()
      expect(result.label).toBeDefined()
      expect(result.score).toBeDefined()
      expect(result.score).toBeGreaterThanOrEqual(0)
      expect(result.score).toBeLessThanOrEqual(1)
    })

    it('should detect intent', async () => {
      const result = await transformers.detectIntent('What is the weather?')
      expect(result).toBeDefined()
      expect(result.label).toBeDefined()
      expect(result.confidence).toBeDefined()
    })

    it('should extract entities', async () => {
      const result = await transformers.extractEntities('John works at Google in New York')
      expect(result).toBeDefined()
      expect(Array.isArray(result)).toBe(true)
    })

    it('should calculate semantic similarity', async () => {
      const result = await transformers.calculateSimilarity(
        'The cat is on the mat',
        'A feline is on the rug'
      )
      expect(result).toBeDefined()
      expect(result).toBeGreaterThanOrEqual(0)
      expect(result).toBeLessThanOrEqual(1)
    })

    it('should handle multiple NLP tasks sequentially', async () => {
      const text = 'I love this product!'
      
      const sentiment = await transformers.analyzeSentiment(text)
      const intent = await transformers.detectIntent(text)
      const entities = await transformers.extractEntities(text)

      expect(sentiment).toBeDefined()
      expect(intent).toBeDefined()
      expect(entities).toBeDefined()
    })
  })

  describe('EnhancedForecastingEngine - Forecasting', () => {
    let forecasting: EnhancedForecastingEngine

    beforeEach(() => {
      forecasting = new EnhancedForecastingEngine()
    })

    it('should initialize forecasting engine', () => {
      expect(forecasting).toBeDefined()
    })

    it('should perform ensemble forecasting', async () => {
      const timeSeries = [100, 102, 105, 103, 108, 110, 112, 115, 113, 118]
      const result = await forecasting.ensembleForecast(timeSeries, 5)

      expect(result).toBeDefined()
      expect(result.predictions).toBeDefined()
      expect(result.predictions.length).toBe(5)
      expect(result.confidence).toBeDefined()
      expect(result.trend).toBeDefined()
      expect(['increasing', 'decreasing', 'stable']).toContain(result.trend)
    })

    it('should calculate accuracy metrics', async () => {
      const timeSeries = [100, 102, 105, 103, 108, 110, 112, 115, 113, 118]
      const result = await forecasting.ensembleForecast(timeSeries, 3)

      expect(result.rmse).toBeDefined()
      expect(result.mae).toBeDefined()
      expect(result.mape).toBeDefined()
      expect(result.rmse).toBeGreaterThanOrEqual(0)
      expect(result.mae).toBeGreaterThanOrEqual(0)
    })

    it('should detect seasonality', async () => {
      const timeSeries = [100, 102, 105, 103, 108, 110, 112, 115, 113, 118]
      const result = await forecasting.ensembleForecast(timeSeries, 3)

      expect(result.seasonality).toBeDefined()
      expect(result.seasonality).toBeGreaterThanOrEqual(0)
      expect(result.seasonality).toBeLessThanOrEqual(1)
    })

    it('should provide confidence intervals', async () => {
      const timeSeries = [100, 102, 105, 103, 108, 110, 112, 115, 113, 118]
      const result = await forecasting.ensembleForecast(timeSeries, 3)

      expect(result.confidenceInterval).toBeDefined()
      expect(result.confidenceInterval.length).toBe(3)
      expect(result.confidenceInterval.every(ci => ci[0] <= ci[1])).toBe(true)
    })

    it('should cache forecasting results', async () => {
      const timeSeries = [100, 102, 105, 103, 108]
      
      const start1 = Date.now()
      const result1 = await forecasting.ensembleForecast(timeSeries, 3)
      const time1 = Date.now() - start1

      const start2 = Date.now()
      const result2 = await forecasting.ensembleForecast(timeSeries, 3)
      const time2 = Date.now() - start2

      // Cached result should be faster (or same)
      expect(time2).toBeLessThanOrEqual(time1 + 10) // Allow 10ms variance
    })
  })

  describe('OptimizedOperationsEngine - Optimization', () => {
    let operations: OptimizedOperationsEngine

    beforeEach(() => {
      operations = new OptimizedOperationsEngine()
    })

    it('should initialize operations engine', () => {
      expect(operations).toBeDefined()
    })

    it('should optimize pricing', async () => {
      const result = await operations.optimizePricing(100, 0.7)

      expect(result).toBeDefined()
      expect(result.basePrice).toBe(100)
      expect(result.optimizedPrice).toBeDefined()
      expect(result.adjustmentFactors).toBeDefined()
      expect(result.demandMultiplier).toBeDefined()
      expect(result.competitiveAdjustment).toBeDefined()
      expect(result.seasonalAdjustment).toBeDefined()
    })

    it('should calculate revenue impact', async () => {
      const result = await operations.optimizePricing(100, 0.7)

      expect(result.expectedRevenue).toBeDefined()
      expect(result.expectedRevenue).toBeGreaterThan(0)
    })

    it('should provide confidence for pricing', async () => {
      const result = await operations.optimizePricing(100, 0.7)

      expect(result.confidence).toBeDefined()
      expect(result.confidence).toBeGreaterThanOrEqual(0)
      expect(result.confidence).toBeLessThanOrEqual(1)
    })

    it('should optimize scheduling', async () => {
      const tasks = [
        { id: 'task1', duration: 60, priority: 1 },
        { id: 'task2', duration: 90, priority: 2 },
        { id: 'task3', duration: 45, priority: 1 }
      ]
      const resources = [
        {
          id: 'resource1',
          availability: [{ start: new Date(), end: new Date(Date.now() + 8 * 60 * 60 * 1000) }],
          capacity: 1
        }
      ]

      const result = await operations.optimizeScheduling(tasks, resources)

      expect(result).toBeDefined()
      expect(result.schedule).toBeDefined()
      expect(result.utilizationRate).toBeDefined()
      expect(result.optimizationScore).toBeDefined()
    })

    it('should cache optimization results', async () => {
      const start1 = Date.now()
      const result1 = await operations.optimizePricing(100, 0.5)
      const time1 = Date.now() - start1

      const start2 = Date.now()
      const result2 = await operations.optimizePricing(100, 0.5)
      const time2 = Date.now() - start2

      // Cached result should be faster
      expect(time2).toBeLessThanOrEqual(time1 + 10)
    })

    it('should provide cache statistics', () => {
      const stats = operations.getCacheStats()

      expect(stats).toBeDefined()
      expect(stats.hitRate).toBeDefined()
      expect(stats.missRate).toBeDefined()
      expect(stats.cacheSize).toBeDefined()
    })
  })

  describe('EnhancedClusteringEngine - Clustering', () => {
    let clustering: EnhancedClusteringEngine

    beforeEach(() => {
      clustering = new EnhancedClusteringEngine()
    })

    it('should initialize clustering engine', () => {
      expect(clustering).toBeDefined()
    })

    it('should perform ensemble clustering', async () => {
      const data = [
        [1, 2],
        [1.5, 1.8],
        [5, 8],
        [8, 8],
        [1, 0.6],
        [9, 11]
      ]

      const result = await clustering.ensembleClustering(data, { numClusters: 2 })

      expect(result).toBeDefined()
      expect(result.clusters).toBeDefined()
      expect(result.centroids).toBeDefined()
      expect(result.silhouetteScore).toBeDefined()
      expect(result.daviesBouldinIndex).toBeDefined()
      expect(result.quality).toBeDefined()
    })

    it('should segment users', async () => {
      const userData = [
        { id: 'user1', features: { totalSpent: 5000, bookingCount: 50, rating: 4.8, referrals: 5 } },
        { id: 'user2', features: { totalSpent: 500, bookingCount: 5, rating: 3.5, referrals: 0 } },
        { id: 'user3', features: { totalSpent: 2000, bookingCount: 20, rating: 4.2, referrals: 2 } },
        { id: 'user4', features: { totalSpent: 100, bookingCount: 1, rating: 2.0, referrals: 0 } },
        { id: 'user5', features: { totalSpent: 3000, bookingCount: 30, rating: 4.5, referrals: 3 } }
      ]

      const segments = await clustering.segmentUsers(userData, 'user-value')

      expect(segments).toBeDefined()
      expect(Array.isArray(segments)).toBe(true)
      expect(segments.length).toBeGreaterThan(0)
      expect(segments[0].segmentId).toBeDefined()
      expect(segments[0].name).toBeDefined()
      expect(segments[0].size).toBeGreaterThan(0)
    })

    it('should calculate clustering quality metrics', async () => {
      const data = [
        [1, 2],
        [1.5, 1.8],
        [5, 8],
        [8, 8]
      ]

      const result = await clustering.ensembleClustering(data, { numClusters: 2 })

      expect(result.quality).toBeGreaterThanOrEqual(0)
      expect(result.quality).toBeLessThanOrEqual(1)
    })
  })

  describe('ExplainabilityEngine - Reasoning', () => {
    let explainability: ExplainabilityEngine

    beforeEach(() => {
      explainability = new ExplainabilityEngine()
    })

    it('should initialize explainability engine', () => {
      expect(explainability).toBeDefined()
    })

    it('should explain decisions', () => {
      const explanation = explainability.explainDecision(
        'Recommend Premium Service',
        { userRating: 4.8, totalSpent: 5000, bookingCount: 50 },
        'user-value',
        0.85
      )

      expect(explanation).toBeDefined()
      expect(explanation.decision).toBe('Recommend Premium Service')
      expect(explanation.confidence).toBe(0.85)
      expect(explanation.reasoning).toBeDefined()
      expect(Array.isArray(explanation.reasoning)).toBe(true)
      expect(explanation.factors).toBeDefined()
      expect(explanation.alternatives).toBeDefined()
      expect(explanation.recommendations).toBeDefined()
    })

    it('should explain predictions', () => {
      const explanation = explainability.explainPrediction(
        150,
        { basePrice: 100, demandLevel: 0.7 },
        'pricing-model',
        100
      )

      expect(explanation).toBeDefined()
      expect(explanation.prediction).toBe(150)
      expect(explanation.confidence).toBeDefined()
      expect(explanation.baselineComparison).toBeDefined()
      expect(explanation.contributingFactors).toBeDefined()
      expect(explanation.similarCases).toBeDefined()
    })

    it('should explain model behavior', () => {
      const explanation = explainability.explainModel(
        { feature1: 0.8, feature2: 0.5 },
        'test-model',
        0.75
      )

      expect(explanation).toBeDefined()
      expect(explanation.modelName).toBe('test-model')
      expect(explanation.inputFeatures).toBeDefined()
      expect(explanation.featureContributions).toBeDefined()
      expect(explanation.localApproximation).toBeDefined()
      expect(explanation.globalInterpretation).toBeDefined()
    })

    it('should identify risk factors', () => {
      const explanation = explainability.explainDecision(
        'Test Decision',
        { daysSinceBooking: 200, supportTickets: 10 },
        'churn-risk',
        0.5
      )

      expect(explanation.riskFactors).toBeDefined()
      expect(Array.isArray(explanation.riskFactors)).toBe(true)
    })
  })

  describe('SystemKnowledgeBase - Knowledge Management', () => {
    let knowledgeBase: SystemKnowledgeBase

    beforeEach(() => {
      knowledgeBase = new SystemKnowledgeBase()
    })

    it('should initialize knowledge base', () => {
      expect(knowledgeBase).toBeDefined()
    })

    it('should report domain coverage', () => {
      const report = knowledgeBase.reportDomainCoverage()

      expect(report).toBeDefined()
      expect(report.totalDomains).toBeGreaterThan(0)
      expect(report.coveredDomains).toBeGreaterThan(0)
      expect(report.coverage).toBeGreaterThanOrEqual(0)
      expect(report.coverage).toBeLessThanOrEqual(1)
    })

    it('should report ML capabilities', () => {
      const report = knowledgeBase.reportMLCapabilities()

      expect(report).toBeDefined()
      expect(report.totalOperations).toBeGreaterThan(0)
      expect(report.averageAccuracy).toBeGreaterThan(0)
      expect(report.averageLatency).toBeGreaterThan(0)
    })

    it('should assess system readiness', () => {
      const readiness = knowledgeBase.assessSystemReadiness()

      expect(readiness).toBeDefined()
      expect(readiness.overallReadiness).toBeGreaterThanOrEqual(0)
      expect(readiness.overallReadiness).toBeLessThanOrEqual(1)
      expect(readiness.knowledgeCoverage).toBeDefined()
      expect(readiness.mlCapability).toBeDefined()
      expect(readiness.operationalCapacity).toBeDefined()
    })
  })

  describe('EnhancedMLOperations - ML Functions', () => {
    let mlOps: EnhancedMLOperations

    beforeEach(() => {
      mlOps = new EnhancedMLOperations()
    })

    it('should initialize ML operations', () => {
      expect(mlOps).toBeDefined()
    })

    it('should report ML function performance', () => {
      const report = mlOps.reportMLFunctionPerformance()

      expect(report).toBeDefined()
      expect(report.totalFunctions).toBeGreaterThan(0)
      expect(report.averageAccuracy).toBeGreaterThan(0)
      expect(report.averageLatency).toBeGreaterThan(0)
    })

    it('should assess system readiness', () => {
      const readiness = mlOps.assessSystemReadiness()

      expect(readiness).toBeDefined()
      expect(readiness.overallReadiness).toBeGreaterThanOrEqual(0)
      expect(readiness.overallReadiness).toBeLessThanOrEqual(1)
    })

    it('should generate capability report', () => {
      const report = mlOps.generateCapabilityReport()

      expect(report).toBeDefined()
      expect(report.capabilities).toBeDefined()
      expect(report.readiness).toBeDefined()
    })
  })

  describe('Cross-Engine Integration', () => {
    it('should integrate NLP with Explainability', async () => {
      const transformers = new TransformersIntegration()
      const explainability = new ExplainabilityEngine()

      const sentiment = await transformers.analyzeSentiment('Great product!')
      const explanation = explainability.explainPrediction(
        sentiment.score,
        { text: 'Great product!' },
        'sentiment-model'
      )

      expect(sentiment).toBeDefined()
      expect(explanation).toBeDefined()
      expect(explanation.prediction).toBe(sentiment.score)
    })

    it('should integrate Forecasting with Optimization', async () => {
      const forecasting = new EnhancedForecastingEngine()
      const operations = new OptimizedOperationsEngine()

      const forecast = await forecasting.ensembleForecast([100, 102, 105, 103, 108], 3)
      const pricing = await operations.optimizePricing(100, 0.7)

      expect(forecast).toBeDefined()
      expect(pricing).toBeDefined()
      expect(forecast.predictions).toBeDefined()
      expect(pricing.optimizedPrice).toBeDefined()
    })

    it('should integrate Clustering with Explainability', async () => {
      const clustering = new EnhancedClusteringEngine()
      const explainability = new ExplainabilityEngine()

      const userData = [
        { id: 'user1', features: { totalSpent: 5000, bookingCount: 50, rating: 4.8, referrals: 5 } },
        { id: 'user2', features: { totalSpent: 500, bookingCount: 5, rating: 3.5, referrals: 0 } }
      ]

      const segments = await clustering.segmentUsers(userData, 'user-value')
      const explanation = explainability.explainDecision(
        'Segment User',
        { totalSpent: 5000, bookingCount: 50 },
        'user-value',
        0.9
      )

      expect(segments).toBeDefined()
      expect(explanation).toBeDefined()
    })
  })

  describe('Performance & Stress Tests', () => {
    it('should handle concurrent NLP requests', async () => {
      const transformers = new TransformersIntegration()
      const texts = [
        'This is great!',
        'This is terrible!',
        'This is okay',
        'I love it!',
        'I hate it!'
      ]

      const results = await Promise.all(
        texts.map(text => transformers.analyzeSentiment(text))
      )

      expect(results.length).toBe(5)
      expect(results.every(r => r.label && r.score !== undefined)).toBe(true)
    })

    it('should handle concurrent forecasting requests', async () => {
      const forecasting = new EnhancedForecastingEngine()
      const timeSeries = [100, 102, 105, 103, 108, 110, 112, 115, 113, 118]

      const results = await Promise.all(
        Array(5).fill(null).map(() => forecasting.ensembleForecast(timeSeries, 3))
      )

      expect(results.length).toBe(5)
      expect(results.every(r => r.predictions && r.confidence)).toBe(true)
    })

    it('should handle concurrent optimization requests', async () => {
      const operations = new OptimizedOperationsEngine()

      const results = await Promise.all(
        Array(10).fill(null).map((_, i) =>
          operations.optimizePricing(100 + i * 10, 0.5 + i * 0.05)
        )
      )

      expect(results.length).toBe(10)
      expect(results.every(r => r.optimizedPrice)).toBe(true)
    })
  })
})
