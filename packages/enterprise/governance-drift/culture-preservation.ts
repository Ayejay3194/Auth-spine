/**
 * Culture Preservation for Governance & Drift Control Layer
 * 
 * Monitors and preserves organizational culture indicators including
 * collaboration, innovation, quality, trust, and learning.
 */

import { CultureIndicator } from './types.js';

export class CulturePreservation {
  private indicators: Map<string, CultureIndicator> = new Map();

  /**
   * Initialize culture preservation
   */
  async initialize(): Promise<void> {
    this.setupDefaultIndicators();
    this.startMonitoring();
  }

  /**
   * Get all culture indicators
   */
  getIndicators(): CultureIndicator[] {
    return Array.from(this.indicators.values());
  }

  /**
   * Assess overall culture health
   */
  assessHealth(): {
    overall: 'healthy' | 'neutral' | 'concerning';
    score: number;
    byCategory: Record<string, CultureIndicator>;
    recommendations: string[];
  } {
    const indicators = this.getIndicators();
    const byCategory: Record<string, CultureIndicator> = {};
    
    let totalScore = 0;
    indicators.forEach(indicator => {
      byCategory[indicator.category] = indicator;
      const normalizedScore = indicator.currentValue / indicator.targetValue;
      totalScore += normalizedScore;
    });

    const overallScore = totalScore / indicators.length;
    
    let overall: 'healthy' | 'neutral' | 'concerning';
    if (overallScore > 0.8) {
      overall = 'healthy';
    } else if (overallScore > 0.6) {
      overall = 'neutral';
    } else {
      overall = 'concerning';
    }

    const recommendations = this.generateRecommendations(indicators);

    return {
      overall,
      score: overallScore,
      byCategory,
      recommendations
    };
  }

  private setupDefaultIndicators(): void {
    const defaultIndicators: Omit<CultureIndicator, 'id' | 'lastAssessed' | 'actions'>[] = [
      {
        name: 'Cross-Team Collaboration',
        description: 'Frequency and quality of cross-team collaboration',
        category: 'collaboration',
        currentValue: 0.8,
        targetValue: 0.85,
        measurement: 'survey_score',
        status: 'neutral',
        trend: 'stable'
      },
      {
        name: 'Innovation Rate',
        description: 'Number of innovative ideas implemented per quarter',
        category: 'innovation',
        currentValue: 0.7,
        targetValue: 0.8,
        measurement: 'ideas_per_quarter',
        status: 'neutral',
        trend: 'improving'
      },
      {
        name: 'Quality Focus',
        description: 'Team emphasis on quality over speed',
        category: 'quality',
        currentValue: 0.9,
        targetValue: 0.85,
        measurement: 'survey_score',
        status: 'positive',
        trend: 'stable'
      },
      {
        name: 'Trust Level',
        description: 'Level of trust within teams and leadership',
        category: 'trust',
        currentValue: 0.75,
        targetValue: 0.8,
        measurement: 'trust_index',
        status: 'neutral',
        trend: 'declining'
      },
      {
        name: 'Learning Culture',
        description: 'Emphasis on continuous learning and development',
        category: 'learning',
        currentValue: 0.85,
        targetValue: 0.8,
        measurement: 'learning_hours',
        status: 'positive',
        trend: 'improving'
      }
    ];

    defaultIndicators.forEach((indicator, index) => {
      const cultureIndicator: CultureIndicator = {
        ...indicator,
        id: `indicator_${index + 1}`,
        lastAssessed: new Date(),
        actions: this.generateActions(indicator.category, indicator.status)
      };

      this.indicators.set(cultureIndicator.id, cultureIndicator);
    });
  }

  private startMonitoring(): void {
    // Start periodic monitoring
    setInterval(() => {
      this.assessIndicators();
    }, 7 * 24 * 60 * 60 * 1000); // Assess weekly
  }

  private assessIndicators(): void {
    // Simulate indicator assessment
    // In a real implementation, this would collect actual culture data
    
    this.indicators.forEach(indicator => {
      // Add some realistic variation
      const variation = (Math.random() - 0.5) * 0.1;
      indicator.currentValue = Math.max(0, Math.min(1, indicator.currentValue + variation));
      
      // Update status based on current value
      const ratio = indicator.currentValue / indicator.targetValue;
      if (ratio > 1.1) {
        indicator.status = 'positive';
      } else if (ratio > 0.9) {
        indicator.status = 'neutral';
      } else {
        indicator.status = 'negative';
      }

      // Update trend
      const trendVariation = Math.random();
      if (trendVariation > 0.7) {
        indicator.trend = 'improving';
      } else if (trendVariation > 0.3) {
        indicator.trend = 'stable';
      } else {
        indicator.trend = 'declining';
      }

      indicator.lastAssessed = new Date();
      indicator.actions = this.generateActions(indicator.category, indicator.status);
    });
  }

  private generateActions(category: CultureIndicator['category'], status: CultureIndicator['status']): string[] {
    const actionMap: Record<string, Record<CultureIndicator['status'], string[]>> = {
      collaboration: {
        positive: ['Maintain current collaboration practices', 'Share success stories'],
        neutral: ['Increase cross-team project opportunities', 'Improve communication tools'],
        negative: ['Address team silos', 'Facilitate team-building activities', 'Review collaboration metrics']
      },
      innovation: {
        positive: ['Continue innovation programs', 'Reward innovative thinking'],
        neutral: ['Create innovation incentives', 'Provide experimentation time'],
        negative: ['Remove innovation barriers', 'Leadership to champion innovation', 'Review idea submission process']
      },
      quality: {
        positive: ['Maintain quality standards', 'Recognize quality achievements'],
        neutral: ['Reinforce quality practices', 'Provide quality training'],
        negative: ['Address quality shortcuts', 'Review quality processes', 'Leadership quality commitment']
      },
      trust: {
        positive: ['Maintain transparency', 'Continue trust-building activities'],
        neutral: ['Improve communication frequency', 'Address trust concerns proactively'],
        negative: 'Leadership to address trust issues immediately, Implement trust-building initiatives, Review decision-making transparency'.split(', ')
      },
      learning: {
        positive: ['Expand learning programs', 'Share learning successes'],
        neutral: ['Increase learning opportunities', 'Provide learning resources'],
        negative: ['Assess learning barriers', 'Invest in training programs', 'Create learning culture']
      }
    };

    return actionMap[category]?.[status] || ['Review current practices', 'Gather team feedback'];
  }

  private generateRecommendations(indicators: CultureIndicator[]): string[] {
    const recommendations: string[] = [];
    const negativeIndicators = indicators.filter(i => i.status === 'negative');
    const decliningIndicators = indicators.filter(i => i.trend === 'declining');

    if (negativeIndicators.length > 0) {
      recommendations.push(`Address ${negativeIndicators.length} negative culture indicators immediately`);
    }

    if (decliningIndicators.length > 0) {
      recommendations.push(`Investigate ${decliningIndicators.length} declining culture trends`);
    }

    const categories = [...new Set(indicators.map(i => i.category))];
    categories.forEach(category => {
      const categoryIndicators = indicators.filter(i => i.category === category);
      const avgStatus = categoryIndicators.reduce((sum, i) => sum + (i.status === 'positive' ? 1 : i.status === 'neutral' ? 0.5 : 0), 0) / categoryIndicators.length;
      
      if (avgStatus < 0.5) {
        recommendations.push(`Focus on improving ${category} culture`);
      }
    });

    if (recommendations.length === 0) {
      recommendations.push('Culture indicators are positive - maintain current practices');
    }

    return recommendations;
  }
}

// Export singleton instance
export const culturePreservation = new CulturePreservation();
