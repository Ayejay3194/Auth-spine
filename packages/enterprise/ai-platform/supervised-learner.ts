/**
 * Supervised Learning Mode for AI Platform
 * 
 * Learns from user feedback to improve AI responses:
 * - Analyzes feedback patterns
 * - Identifies what works and what doesn't
 * - Generates improvement suggestions
 * - Provides human-in-the-loop approval workflow
 * - A/B tests improvements
 * 
 * Integrates with FeedbackCollector and existing bandit learning.
 */

import type { FeedbackEntry } from './feedback-collector.js';

export type LearningMode = 'supervised' | 'autonomous' | 'disabled';

export interface LearningInsight {
  id: string;
  timestamp: Date;
  type: 'pattern' | 'improvement' | 'warning' | 'success';
  
  // What was learned
  insight: string;
  confidence: number;  // 0-1
  
  // Supporting data
  feedbackCount: number;
  successRate: number;
  
  // Context
  model?: string;
  responseMode?: string;
  category?: string;
  
  // Evidence
  examples?: Array<{
    requestId: string;
    feedback: string;
    outcome: 'positive' | 'negative';
  }>;
}

export interface ImprovementSuggestion {
  id: string;
  timestamp: Date;
  
  // What to improve
  area: 'prompt' | 'model' | 'parameters' | 'workflow';
  suggestion: string;
  rationale: string;
  
  // Confidence
  confidence: number;  // 0-1
  expectedImprovement: number;  // % improvement estimate
  
  // Supporting data
  basedOnFeedback: number;
  
  // Approval workflow
  status: 'pending' | 'approved' | 'rejected' | 'testing' | 'deployed';
  approvedBy?: string;
  approvedAt?: Date;
  
  // A/B testing
  testResults?: {
    controlSuccessRate: number;
    variantSuccessRate: number;
    improvement: number;
    sampleSize: number;
  };
}

interface LearningConfig {
  mode: LearningMode;
  
  // Thresholds
  minFeedbackForInsight: number;
  minConfidenceForSuggestion: number;
  
  // Approval workflow
  requireApproval: boolean;
  autoApproveThreshold?: number;  // Auto-approve if confidence > threshold
  
  // A/B testing
  enableABTesting: boolean;
  testDuration: number;  // seconds
  testSampleSize: number;
}

/**
 * Supervised Learning System
 * Learns from feedback and generates actionable improvements
 */
export class SupervisedLearner {
  private config: LearningConfig;
  private insights: LearningInsight[] = [];
  private suggestions: ImprovementSuggestion[] = [];

  constructor(config?: Partial<LearningConfig>) {
    this.config = {
      mode: 'supervised',
      minFeedbackForInsight: 10,
      minConfidenceForSuggestion: 0.7,
      requireApproval: true,
      autoApproveThreshold: 0.95,
      enableABTesting: true,
      testDuration: 7 * 24 * 60 * 60,  // 7 days
      testSampleSize: 100,
      ...config
    };
  }

  /**
   * Analyze feedback and generate insights
   */
  async analyzeF feedback(feedback: FeedbackEntry[]): Promise<LearningInsight[]> {
    if (this.config.mode === 'disabled') return [];

    const insights: LearningInsight[] = [];

    // 1. Analyze by model
    const byModel = this.groupBy(feedback, 'model');
    for (const [model, entries] of Object.entries(byModel)) {
      const insight = this.analyzeModelPerformance(model, entries);
      if (insight) insights.push(insight);
    }

    // 2. Analyze by response mode
    const byMode = this.groupBy(feedback, 'responseMode');
    for (const [mode, entries] of Object.entries(byMode)) {
      const insight = this.analyzeModePerformance(mode, entries);
      if (insight) insights.push(insight);
    }

    // 3. Analyze common improvement suggestions
    const textFeedback = feedback.filter(f => f.improvementSuggestion);
    if (textFeedback.length >= this.config.minFeedbackForInsight) {
      const insight = this.analyzeImprovementPatterns(textFeedback);
      if (insight) insights.push(insight);
    }

    // 4. Analyze category ratings
    const ratingFeedback = feedback.filter(f => f.categories);
    if (ratingFeedback.length >= this.config.minFeedbackForInsight) {
      const insight = this.analyzeCategoryRatings(ratingFeedback);
      if (insight) insights.push(insight);
    }

    this.insights.push(...insights);
    return insights;
  }

  /**
   * Generate improvement suggestions based on insights
   */
  async generateSuggestions(): Promise<ImprovementSuggestion[]> {
    if (this.config.mode === 'disabled') return [];

    const suggestions: ImprovementSuggestion[] = [];

    // Analyze recent insights
    const recentInsights = this.insights.filter(
      i => i.timestamp.getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000  // Last 7 days
    );

    for (const insight of recentInsights) {
      if (insight.confidence < this.config.minConfidenceForSuggestion) continue;

      const suggestion = this.createSuggestion(insight);
      if (suggestion) {
        suggestions.push(suggestion);
      }
    }

    this.suggestions.push(...suggestions);
    return suggestions;
  }

  /**
   * Approve a suggestion for testing or deployment
   */
  async approveSuggestion(
    suggestionId: string,
    approvedBy: string,
    skipTesting = false
  ): Promise<void> {
    const suggestion = this.suggestions.find(s => s.id === suggestionId);
    if (!suggestion) {
      throw new Error(`Suggestion ${suggestionId} not found`);
    }

    suggestion.approvedBy = approvedBy;
    suggestion.approvedAt = new Date();
    
    if (skipTesting || !this.config.enableABTesting) {
      suggestion.status = 'deployed';
    } else {
      suggestion.status = 'testing';
    }
  }

  /**
   * Reject a suggestion
   */
  async rejectSuggestion(suggestionId: string, reason?: string): Promise<void> {
    const suggestion = this.suggestions.find(s => s.id === suggestionId);
    if (!suggestion) {
      throw new Error(`Suggestion ${suggestionId} not found`);
    }

    suggestion.status = 'rejected';
  }

  /**
   * Get pending suggestions requiring approval
   */
  getPendingSuggestions(): ImprovementSuggestion[] {
    return this.suggestions.filter(s => s.status === 'pending');
  }

  /**
   * Get approved suggestions ready for deployment
   */
  getApprovedSuggestions(): ImprovementSuggestion[] {
    return this.suggestions.filter(s => s.status === 'approved' || s.status === 'deployed');
  }

  /**
   * Get insights summary
   */
  getInsightsSummary(days = 7): {
    totalInsights: number;
    byType: Record<string, number>;
    avgConfidence: number;
    topInsights: LearningInsight[];
  } {
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    const recent = this.insights.filter(i => i.timestamp.getTime() > cutoff);

    const byType: Record<string, number> = {};
    let confidenceSum = 0;

    for (const insight of recent) {
      byType[insight.type] = (byType[insight.type] || 0) + 1;
      confidenceSum += insight.confidence;
    }

    const topInsights = [...recent]
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 10);

    return {
      totalInsights: recent.length,
      byType,
      avgConfidence: recent.length > 0 ? confidenceSum / recent.length : 0,
      topInsights
    };
  }

  /**
   * Analyze model performance
   */
  private analyzeModelPerformance(
    model: string,
    feedback: FeedbackEntry[]
  ): LearningInsight | null {
    if (feedback.length < this.config.minFeedbackForInsight) return null;

    const helpful = feedback.filter(f => f.wasHelpful).length;
    const successRate = helpful / feedback.length;
    
    const avgRating = feedback
      .filter(f => f.rating)
      .reduce((sum, f) => sum + (f.rating || 0), 0) / feedback.length;

    let type: LearningInsight['type'];
    let insight: string;
    let confidence: number;

    if (successRate >= 0.8) {
      type = 'success';
      insight = `Model ${model} is performing well with ${(successRate * 100).toFixed(1)}% helpful rate`;
      confidence = successRate;
    } else if (successRate < 0.5) {
      type = 'warning';
      insight = `Model ${model} has low performance with only ${(successRate * 100).toFixed(1)}% helpful rate`;
      confidence = 1 - successRate;
    } else {
      type = 'pattern';
      insight = `Model ${model} shows mixed performance with ${(successRate * 100).toFixed(1)}% helpful rate`;
      confidence = 0.6;
    }

    return {
      id: this.generateId(),
      timestamp: new Date(),
      type,
      insight,
      confidence,
      feedbackCount: feedback.length,
      successRate,
      model
    };
  }

  /**
   * Analyze response mode performance
   */
  private analyzeModePerformance(
    mode: string,
    feedback: FeedbackEntry[]
  ): LearningInsight | null {
    if (feedback.length < this.config.minFeedbackForInsight) return null;

    const helpful = feedback.filter(f => f.wasHelpful).length;
    const successRate = helpful / feedback.length;

    return {
      id: this.generateId(),
      timestamp: new Date(),
      type: successRate >= 0.7 ? 'success' : 'warning',
      insight: `Response mode '${mode}' has ${(successRate * 100).toFixed(1)}% helpful rate`,
      confidence: Math.abs(successRate - 0.5) * 2,  // 0-1 scale
      feedbackCount: feedback.length,
      successRate,
      responseMode: mode
    };
  }

  /**
   * Analyze improvement suggestion patterns
   */
  private analyzeImprovementPatterns(feedback: FeedbackEntry[]): LearningInsight | null {
    const suggestions = feedback
      .map(f => f.improvementSuggestion)
      .filter(Boolean) as string[];

    // Find common themes (simple keyword matching)
    const keywords = ['faster', 'clearer', 'detailed', 'concise', 'accurate', 'relevant'];
    const counts: Record<string, number> = {};

    for (const suggestion of suggestions) {
      const lower = suggestion.toLowerCase();
      for (const keyword of keywords) {
        if (lower.includes(keyword)) {
          counts[keyword] = (counts[keyword] || 0) + 1;
        }
      }
    }

    const topKeyword = Object.entries(counts)
      .sort(([, a], [, b]) => b - a)[0];

    if (!topKeyword) return null;

    const [keyword, count] = topKeyword;
    const percentage = (count / suggestions.length * 100).toFixed(1);

    return {
      id: this.generateId(),
      timestamp: new Date(),
      type: 'improvement',
      insight: `${percentage}% of improvement suggestions mention making responses more ${keyword}`,
      confidence: Math.min(count / suggestions.length, 1),
      feedbackCount: feedback.length,
      successRate: 0,
      category: keyword
    };
  }

  /**
   * Analyze category ratings
   */
  private analyzeCategoryRatings(feedback: FeedbackEntry[]): LearningInsight | null {
    const categories = ['accuracy', 'helpfulness', 'tone', 'relevance', 'completeness'];
    const avgRatings: Record<string, number> = {};

    for (const category of categories) {
      const ratings = feedback
        .map(f => f.categories?.[category as keyof typeof f.categories])
        .filter(r => r !== undefined) as number[];
      
      if (ratings.length > 0) {
        avgRatings[category] = ratings.reduce((a, b) => a + b, 0) / ratings.length;
      }
    }

    // Find lowest rated category
    const lowest = Object.entries(avgRatings)
      .sort(([, a], [, b]) => a - b)[0];

    if (!lowest || lowest[1] >= 4) return null;

    const [category, rating] = lowest;

    return {
      id: this.generateId(),
      timestamp: new Date(),
      type: 'warning',
      insight: `Category '${category}' has lowest average rating of ${rating.toFixed(1)}/5`,
      confidence: (5 - rating) / 5,
      feedbackCount: feedback.length,
      successRate: rating / 5,
      category
    };
  }

  /**
   * Create suggestion from insight
   */
  private createSuggestion(insight: LearningInsight): ImprovementSuggestion | null {
    let area: ImprovementSuggestion['area'];
    let suggestion: string;
    let rationale: string;

    if (insight.type === 'warning' && insight.model) {
      area = 'model';
      suggestion = `Consider switching from ${insight.model} to a better-performing model`;
      rationale = insight.insight;
    } else if (insight.type === 'warning' && insight.category === 'accuracy') {
      area = 'prompt';
      suggestion = 'Refine system prompts to emphasize accuracy and fact-checking';
      rationale = insight.insight;
    } else if (insight.type === 'improvement' && insight.category === 'faster') {
      area = 'model';
      suggestion = 'Use instant mode for simple queries to improve response time';
      rationale = insight.insight;
    } else if (insight.type === 'improvement' && insight.category === 'detailed') {
      area = 'parameters';
      suggestion = 'Increase max_tokens parameter for more detailed responses';
      rationale = insight.insight;
    } else {
      return null;  // Can't generate suggestion from this insight
    }

    const status: ImprovementSuggestion['status'] = 
      this.config.requireApproval && insight.confidence < (this.config.autoApproveThreshold || 1)
        ? 'pending'
        : 'approved';

    return {
      id: this.generateId(),
      timestamp: new Date(),
      area,
      suggestion,
      rationale,
      confidence: insight.confidence,
      expectedImprovement: insight.confidence * 20,  // Estimate % improvement
      basedOnFeedback: insight.feedbackCount,
      status
    };
  }

  /**
   * Group feedback by field
   */
  private groupBy(
    feedback: FeedbackEntry[],
    field: keyof FeedbackEntry
  ): Record<string, FeedbackEntry[]> {
    const groups: Record<string, FeedbackEntry[]> = {};

    for (const entry of feedback) {
      const value = String(entry[field] || 'unknown');
      if (!groups[value]) groups[value] = [];
      groups[value]!.push(entry);
    }

    return groups;
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `learn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export { SupervisedLearner };
