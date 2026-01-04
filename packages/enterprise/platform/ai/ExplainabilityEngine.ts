export interface DecisionExplanation {
  decision: string;
  confidence: number;
  reasoning: string[];
  factors: Array<{
    name: string;
    weight: number;
    contribution: number;
    direction: 'positive' | 'negative' | 'neutral';
  }>;
  alternatives: Array<{
    option: string;
    score: number;
    reason: string;
  }>;
  riskFactors: string[];
  recommendations: string[];
  timestamp: Date;
}

export interface ModelExplanation {
  modelName: string;
  inputFeatures: Array<{
    name: string;
    value: any;
    importance: number;
  }>;
  outputExplanation: string;
  featureContributions: Record<string, number>;
  localApproximation: string;
  globalInterpretation: string;
  uncertainty: number;
}

export interface PredictionExplanation {
  prediction: any;
  confidence: number;
  baselineComparison: {
    baseline: any;
    difference: number;
    percentChange: number;
  };
  contributingFactors: Array<{
    factor: string;
    impact: number;
    direction: 'increase' | 'decrease';
  }>;
  similarCases: Array<{
    caseId: string;
    similarity: number;
    outcome: any;
  }>;
  uncertaintyRange: [number, number];
}

export class ExplainabilityEngine {
  private explanationCache: Map<string, DecisionExplanation> = new Map();
  private featureImportance: Map<string, number> = new Map();
  private decisionRules: Map<string, any[]> = new Map();

  constructor() {
    this.initializeFeatureImportance();
    this.initializeDecisionRules();
  }

  private initializeFeatureImportance(): void {
    // Initialize feature importance scores
    const importances = {
      'user-value': { totalSpent: 0.35, bookingCount: 0.30, rating: 0.20, referrals: 0.15 },
      'churn-risk': { daysSinceBooking: 0.35, bookingTrend: 0.35, supportTickets: 0.20, sentiment: 0.10 },
      'pricing': { demand: 0.40, competition: 0.30, seasonality: 0.20, elasticity: 0.10 },
      'scheduling': { availability: 0.40, priority: 0.30, constraints: 0.20, preferences: 0.10 }
    };

    for (const [domain, features] of Object.entries(importances)) {
      for (const [feature, importance] of Object.entries(features)) {
        this.featureImportance.set(`${domain}_${feature}`, importance as number);
      }
    }
  }

  private initializeDecisionRules(): void {
    // Initialize decision rules for different domains
    this.decisionRules.set('booking-recommendation', [
      { condition: 'availability > 0', action: 'recommend', weight: 1.0 },
      { condition: 'price <= budget', action: 'recommend', weight: 0.9 },
      { condition: 'rating >= 4.0', action: 'boost', weight: 0.8 },
      { condition: 'recent-reviews > 5', action: 'boost', weight: 0.7 }
    ]);

    this.decisionRules.set('pricing-adjustment', [
      { condition: 'demand > high', action: 'increase', weight: 0.9, amount: 1.2 },
      { condition: 'demand < low', action: 'decrease', weight: 0.8, amount: 0.85 },
      { condition: 'competition > 3', action: 'adjust', weight: 0.7, amount: 0.95 },
      { condition: 'seasonality > peak', action: 'increase', weight: 0.6, amount: 1.15 }
    ]);

    this.decisionRules.set('user-segmentation', [
      { condition: 'ltv > 5000', segment: 'premium', weight: 1.0 },
      { condition: 'ltv > 1000', segment: 'standard', weight: 0.95 },
      { condition: 'ltv > 300', segment: 'emerging', weight: 0.90 },
      { condition: 'churnRisk > 0.7', segment: 'at-risk', weight: 0.85 }
    ]);
  }

  /**
   * Explain a decision with detailed reasoning
   */
  explainDecision(
    decision: string,
    inputs: Record<string, any>,
    domain: string,
    confidence: number = 0.85
  ): DecisionExplanation {
    const cacheKey = `decision_${decision}_${JSON.stringify(inputs).substring(0, 50)}`;
    const cached = this.explanationCache.get(cacheKey);
    if (cached) return cached;

    // Get applicable rules
    const rules = this.decisionRules.get(domain) || [];

    // Calculate factor contributions
    const factors = this.calculateFactorContributions(inputs, domain);

    // Generate reasoning
    const reasoning = this.generateReasoning(decision, factors, rules);

    // Identify alternatives
    const alternatives = this.generateAlternatives(decision, inputs, domain);

    // Identify risk factors
    const riskFactors = this.identifyRiskFactors(inputs, domain);

    // Generate recommendations
    const recommendations = this.generateRecommendations(decision, factors, riskFactors);

    const explanation: DecisionExplanation = {
      decision,
      confidence,
      reasoning,
      factors,
      alternatives,
      riskFactors,
      recommendations,
      timestamp: new Date()
    };

    this.explanationCache.set(cacheKey, explanation);
    return explanation;
  }

  /**
   * Explain model predictions using LIME-like approach
   */
  explainPrediction(
    prediction: any,
    inputs: Record<string, any>,
    modelName: string,
    baseline: any = null
  ): PredictionExplanation {
    // Calculate feature contributions
    const contributingFactors = this.calculateFeatureContributions(inputs, modelName);

    // Find similar cases
    const similarCases = this.findSimilarCases(inputs, prediction);

    // Calculate baseline comparison
    const baselineComparison = baseline
      ? {
          baseline,
          difference: this.calculateDifference(prediction, baseline),
          percentChange: ((prediction - baseline) / Math.abs(baseline)) * 100
        }
      : { baseline: 0, difference: 0, percentChange: 0 };

    // Calculate uncertainty
    const uncertainty = this.calculateUncertainty(inputs, prediction);

    return {
      prediction,
      confidence: 1 - uncertainty,
      baselineComparison,
      contributingFactors,
      similarCases,
      uncertaintyRange: [prediction * (1 - uncertainty), prediction * (1 + uncertainty)]
    };
  }

  /**
   * Explain model behavior using SHAP-like values
   */
  explainModel(
    inputs: Record<string, any>,
    modelName: string,
    output: any
  ): ModelExplanation {
    // Calculate SHAP-like feature contributions
    const featureContributions = this.calculateSHAPValues(inputs, modelName);

    // Generate local approximation
    const localApproximation = this.generateLocalApproximation(inputs, featureContributions);

    // Generate global interpretation
    const globalInterpretation = this.generateGlobalInterpretation(modelName, featureContributions);

    // Calculate uncertainty
    const uncertainty = this.calculateModelUncertainty(inputs, modelName);

    // Extract input features with importance
    const inputFeatures = Object.entries(inputs).map(([name, value]) => ({
      name,
      value,
      importance: this.featureImportance.get(`${modelName}_${name}`) || 0.1
    }));

    return {
      modelName,
      inputFeatures,
      outputExplanation: this.generateOutputExplanation(output, featureContributions),
      featureContributions,
      localApproximation,
      globalInterpretation,
      uncertainty
    };
  }

  /**
   * Calculate factor contributions
   */
  private calculateFactorContributions(
    inputs: Record<string, any>,
    domain: string
  ): DecisionExplanation['factors'] {
    const factors: DecisionExplanation['factors'] = [];

    for (const [key, value] of Object.entries(inputs)) {
      const importance = this.featureImportance.get(`${domain}_${key}`) || 0.1;
      const contribution = this.calculateContribution(value, domain, key);
      const direction = contribution > 0 ? 'positive' : contribution < 0 ? 'negative' : 'neutral';

      factors.push({
        name: key,
        weight: importance,
        contribution: Math.abs(contribution),
        direction
      });
    }

    return factors.sort((a, b) => b.weight - a.weight);
  }

  /**
   * Calculate contribution of a feature
   */
  private calculateContribution(value: any, domain: string, feature: string): number {
    const numValue = typeof value === 'number' ? value : 0;

    // Domain-specific contribution calculations
    switch (domain) {
      case 'user-value':
        if (feature === 'totalSpent') return numValue > 1000 ? 0.8 : numValue > 300 ? 0.4 : -0.2;
        if (feature === 'bookingCount') return numValue > 20 ? 0.7 : numValue > 5 ? 0.3 : -0.1;
        if (feature === 'rating') return numValue > 4.0 ? 0.6 : numValue > 3.0 ? 0.2 : -0.3;
        break;

      case 'churn-risk':
        if (feature === 'daysSinceBooking') return numValue > 180 ? 0.8 : numValue > 90 ? 0.4 : -0.2;
        if (feature === 'bookingTrend') return numValue < -0.2 ? 0.7 : numValue < 0 ? 0.3 : -0.2;
        break;

      case 'pricing':
        if (feature === 'demand') return numValue > 0.7 ? 0.8 : numValue > 0.4 ? 0.3 : -0.3;
        if (feature === 'competition') return numValue > 3 ? -0.6 : numValue > 1 ? -0.2 : 0.1;
        break;
    }

    return 0;
  }

  /**
   * Generate reasoning explanation
   */
  private generateReasoning(
    decision: string,
    factors: DecisionExplanation['factors'],
    rules: any[]
  ): string[] {
    const reasoning: string[] = [];

    // Add top factors
    const topFactors = factors.slice(0, 3);
    for (const factor of topFactors) {
      const direction = factor.direction === 'positive' ? 'supports' : 'opposes';
      reasoning.push(
        `${factor.name} (${(factor.weight * 100).toFixed(0)}% weight) ${direction} this decision`
      );
    }

    // Add rule-based reasoning
    for (const rule of rules) {
      reasoning.push(`Rule: ${rule.condition} → ${rule.action}`);
    }

    return reasoning;
  }

  /**
   * Generate alternative options
   */
  private generateAlternatives(
    decision: string,
    inputs: Record<string, any>,
    domain: string
  ): PredictionExplanation['similarCases'] {
    const alternatives: PredictionExplanation['similarCases'] = [];

    // Generate 2-3 alternatives based on domain
    if (domain === 'booking-recommendation') {
      alternatives.push({
        caseId: 'alt_1',
        similarity: 0.85,
        outcome: 'Premium Service'
      });
      alternatives.push({
        caseId: 'alt_2',
        similarity: 0.72,
        outcome: 'Standard Service'
      });
    } else if (domain === 'pricing') {
      alternatives.push({
        caseId: 'alt_1',
        similarity: 0.88,
        outcome: 'Higher Price'
      });
      alternatives.push({
        caseId: 'alt_2',
        similarity: 0.76,
        outcome: 'Lower Price'
      });
    }

    return alternatives;
  }

  /**
   * Identify risk factors
   */
  private identifyRiskFactors(inputs: Record<string, any>, domain: string): string[] {
    const risks: string[] = [];

    if (domain === 'churn-risk') {
      if ((inputs.daysSinceBooking || 0) > 180) risks.push('Long period without booking');
      if ((inputs.supportTickets || 0) > 5) risks.push('High support ticket volume');
      if ((inputs.bookingTrend || 0) < -0.3) risks.push('Declining booking trend');
    }

    if (domain === 'pricing') {
      if ((inputs.competition || 0) > 5) risks.push('High competitive pressure');
      if ((inputs.elasticity || 0) > 1.5) risks.push('High price sensitivity');
    }

    return risks;
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(
    decision: string,
    factors: DecisionExplanation['factors'],
    riskFactors: string[]
  ): string[] {
    const recommendations: string[] = [];

    // Recommend based on top factors
    const topFactor = factors[0];
    if (topFactor.direction === 'positive') {
      recommendations.push(`Proceed with ${decision} - primary factor is favorable`);
    } else {
      recommendations.push(`Reconsider ${decision} - primary factor is unfavorable`);
    }

    // Recommend risk mitigation
    if (riskFactors.length > 0) {
      recommendations.push(`Address risk factors: ${riskFactors.join(', ')}`);
    }

    // Add general recommendation
    recommendations.push('Monitor outcomes and adjust strategy if needed');

    return recommendations;
  }

  /**
   * Calculate feature contributions (SHAP-like)
   */
  private calculateSHAPValues(inputs: Record<string, any>, modelName: string): Record<string, number> {
    const contributions: Record<string, number> = {};

    for (const [feature, value] of Object.entries(inputs)) {
      const importance = this.featureImportance.get(`${modelName}_${feature}`) || 0.1;
      const numValue = typeof value === 'number' ? value : 0;
      contributions[feature] = importance * (numValue / 100); // Simplified calculation
    }

    return contributions;
  }

  /**
   * Calculate feature contributions for prediction
   */
  private calculateFeatureContributions(
    inputs: Record<string, any>,
    modelName: string
  ): PredictionExplanation['contributingFactors'] {
    const factors: PredictionExplanation['contributingFactors'] = [];

    for (const [feature, value] of Object.entries(inputs)) {
      const numValue = typeof value === 'number' ? value : 0;
      const impact = Math.abs(numValue) * (this.featureImportance.get(`${modelName}_${feature}`) || 0.1);
      const direction = numValue > 0 ? 'increase' : 'decrease';

      factors.push({
        factor: feature,
        impact,
        direction
      });
    }

    return factors.sort((a, b) => b.impact - a.impact);
  }

  /**
   * Find similar cases
   */
  private findSimilarCases(
    inputs: Record<string, any>,
    prediction: any
  ): PredictionExplanation['similarCases'] {
    // Simplified: return mock similar cases
    return [
      { caseId: 'case_001', similarity: 0.92, outcome: prediction * 0.98 },
      { caseId: 'case_002', similarity: 0.87, outcome: prediction * 1.02 },
      { caseId: 'case_003', similarity: 0.81, outcome: prediction * 0.95 }
    ];
  }

  /**
   * Calculate difference
   */
  private calculateDifference(value: any, baseline: any): number {
    return (value as number) - (baseline as number);
  }

  /**
   * Calculate uncertainty
   */
  private calculateUncertainty(inputs: Record<string, any>, prediction: any): number {
    // Uncertainty increases with missing data and extreme values
    const missingCount = Object.values(inputs).filter(v => v === null || v === undefined).length;
    const totalCount = Object.keys(inputs).length;
    const missingRatio = totalCount > 0 ? missingCount / totalCount : 0;

    return Math.min(0.3, missingRatio * 0.5 + 0.1);
  }

  /**
   * Calculate model uncertainty
   */
  private calculateModelUncertainty(inputs: Record<string, any>, modelName: string): number {
    // Base uncertainty + uncertainty from input variance
    let variance = 0;
    for (const value of Object.values(inputs)) {
      if (typeof value === 'number') {
        variance += Math.abs(value) * 0.01;
      }
    }

    return Math.min(0.4, 0.1 + variance / 100);
  }

  /**
   * Generate local approximation
   */
  private generateLocalApproximation(
    inputs: Record<string, any>,
    contributions: Record<string, number>
  ): string {
    const topContributors = Object.entries(contributions)
      .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
      .slice(0, 3)
      .map(([feature, contribution]) => `${feature}: ${(contribution * 100).toFixed(1)}%`)
      .join(', ');

    return `Local model approximation based on: ${topContributors}`;
  }

  /**
   * Generate global interpretation
   */
  private generateGlobalInterpretation(
    modelName: string,
    contributions: Record<string, number>
  ): string {
    const avgContribution = Object.values(contributions).reduce((a, b) => a + Math.abs(b), 0) / Object.keys(contributions).length;

    return `${modelName} model primarily relies on feature interactions with average contribution of ${(avgContribution * 100).toFixed(1)}%`;
  }

  /**
   * Generate output explanation
   */
  private generateOutputExplanation(output: any, contributions: Record<string, number>): string {
    const topFeature = Object.entries(contributions).sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))[0];

    return `Output of ${output} is primarily driven by ${topFeature[0]} with ${(Math.abs(topFeature[1]) * 100).toFixed(1)}% contribution`;
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.explanationCache.clear();
  }

  /**
   * Get feature importance
   */
  getFeatureImportance(domain: string): Record<string, number> {
    const importance: Record<string, number> = {};

    for (const [key, value] of this.featureImportance.entries()) {
      if (key.startsWith(domain)) {
        const feature = key.replace(`${domain}_`, '');
        importance[feature] = value;
      }
    }

    return importance;
  }
}

export default ExplainabilityEngine;
