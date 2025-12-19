/**
 * Power Balancing for Governance & Drift Control Layer
 * 
 * Monitors and balances power distribution across decisions,
 * resources, information, and influence to prevent concentration.
 */

import { PowerBalance } from './types.js';

export class PowerBalancing {
  private balances: Map<string, PowerBalance> = new Map();

  /**
   * Initialize power balancing
   */
  async initialize(): Promise<void> {
    this.setupDefaultBalances();
    this.startMonitoring();
  }

  /**
   * Get all power balances
   */
  getBalances(): PowerBalance[] {
    return Array.from(this.balances.values());
  }

  /**
   * Analyze power distribution
   */
  analyzeDistribution(): {
    overall: 'balanced' | 'skewed' | 'concentrated';
    risks: string[];
    recommendations: string[];
    byType: Record<string, PowerBalance>;
  } {
    const balances = this.getBalances();
    const byType: Record<string, PowerBalance> = {};
    
    let totalRisk = 0;
    const risks: string[] = [];
    
    balances.forEach(balance => {
      byType[balance.type] = balance;
      
      if (balance.health === 'concentrated') {
        totalRisk += 2;
        risks.push(`${balance.name} power is overly concentrated`);
      } else if (balance.health === 'skewed') {
        totalRisk += 1;
        risks.push(`${balance.name} power distribution is skewed`);
      }
    });

    let overall: 'balanced' | 'skewed' | 'concentrated';
    if (totalRisk >= 4) {
      overall = 'concentrated';
    } else if (totalRisk >= 2) {
      overall = 'skewed';
    } else {
      overall = 'balanced';
    }

    const recommendations = this.generateRecommendations(balances);

    return {
      overall,
      risks,
      recommendations,
      byType
    };
  }

  private setupDefaultBalances(): void {
    const defaultBalances: Omit<PowerBalance, 'id' | 'lastAnalyzed'>[] = [
      {
        name: 'Decision Making',
        description: 'Distribution of decision-making power across roles',
        type: 'decision',
        balance: 0.2, // Slightly skewed towards leadership
        participants: [
          { role: 'Leadership', influence: 0.6, count: 5 },
          { role: 'Engineering', influence: 0.25, count: 25 },
          { role: 'Product', influence: 0.15, count: 8 }
        ],
        health: 'skewed',
        recommendations: [
          'Increase engineering decision autonomy',
          'Implement cross-functional decision committees',
          'Review decision-making authority distribution'
        ]
      },
      {
        name: 'Resource Allocation',
        description: 'Control over budget and resource distribution',
        type: 'resource',
        balance: 0.3, // Moderately skewed
        participants: [
          { role: 'Finance', influence: 0.5, count: 3 },
          { role: 'Department Heads', influence: 0.35, count: 6 },
          { role: 'Team Leads', influence: 0.15, count: 15 }
        ],
        health: 'skewed',
        recommendations: [
          'Distribute budget authority more evenly',
          'Empower team-level resource decisions',
          'Create transparent resource allocation process'
        ]
      },
      {
        name: 'Information Flow',
        description: 'Access to and control of information',
        type: 'information',
        balance: 0.1, // Close to balanced
        participants: [
          { role: 'Leadership', influence: 0.4, count: 5 },
          { role: 'Engineering', influence: 0.35, count: 25 },
          { role: 'Product', influence: 0.25, count: 8 }
        ],
        health: 'balanced',
        recommendations: [
          'Maintain current information sharing practices',
          'Continue transparency initiatives'
        ]
      },
      {
        name: 'Influence and Impact',
        description: 'Ability to influence strategic direction',
        type: 'influence',
        balance: 0.4, // More skewed
        participants: [
          { role: 'Leadership', influence: 0.7, count: 5 },
          { role: 'Senior Engineers', influence: 0.2, count: 8 },
          { role: 'Product Managers', influence: 0.1, count: 8 }
        ],
        health: 'skewed',
        recommendations: [
          'Increase employee influence on strategy',
          'Create more inclusive strategic planning',
          'Empower technical leadership in direction'
        ]
      }
    ];

    defaultBalances.forEach((balance, index) => {
      const powerBalance: PowerBalance = {
        ...balance,
        id: `balance_${index + 1}`,
        lastAnalyzed: new Date()
      };

      this.balances.set(powerBalance.id, powerBalance);
    });
  }

  private startMonitoring(): void {
    // Start periodic monitoring
    setInterval(() => {
      this.analyzePowerBalance();
    }, 14 * 24 * 60 * 60 * 1000); // Analyze every 2 weeks
  }

  private analyzePowerBalance(): void {
    // Simulate power balance analysis
    // In a real implementation, this would analyze actual power dynamics
    
    this.balances.forEach(balance => {
      // Add some realistic variation
      const variation = (Math.random() - 0.5) * 0.1;
      balance.balance = Math.max(-1, Math.min(1, balance.balance + variation));
      
      // Update health based on balance
      const absBalance = Math.abs(balance.balance);
      if (absBalance > 0.5) {
        balance.health = 'concentrated';
      } else if (absBalance > 0.25) {
        balance.health = 'skewed';
      } else {
        balance.health = 'balanced';
      }

      // Update recommendations
      balance.recommendations = this.generateBalanceRecommendations(balance);
      
      balance.lastAnalyzed = new Date();
    });
  }

  private generateBalanceRecommendations(balance: PowerBalance): string[] {
    const recommendations: string[] = [];

    if (balance.health === 'concentrated') {
      recommendations.push('Immediate action required to redistribute power');
      recommendations.push('Implement checks and balances for dominant roles');
      
      // Find the dominant participant
      const dominant = balance.participants.reduce((max, p) => 
        p.influence > max.influence ? p : max
      );
      recommendations.push(`Reduce ${dominant.role} influence concentration`);
      
    } else if (balance.health === 'skewed') {
      recommendations.push('Monitor power distribution trends');
      recommendations.push('Consider gradual rebalancing measures');
      
      // Find underrepresented participants
      const underrepresented = balance.participants.filter(p => p.influence < 0.2);
      underrepresented.forEach(p => {
        recommendations.push(`Increase ${p.role} influence and voice`);
      });
      
    } else {
      recommendations.push('Maintain current power balance');
      recommendations.push('Continue monitoring for changes');
    }

    // Type-specific recommendations
    switch (balance.type) {
      case 'decision':
        recommendations.push('Ensure diverse perspectives in decisions');
        break;
      case 'resource':
        recommendations.push('Maintain transparent resource allocation');
        break;
      case 'information':
        recommendations.push('Preserve open information flow');
        break;
      case 'influence':
        recommendations.push('Enable bottom-up influence channels');
        break;
    }

    return recommendations;
  }

  private generateRecommendations(balances: PowerBalance[]): string[] {
    const recommendations: string[] = [];
    const concentrated = balances.filter(b => b.health === 'concentrated');
    const skewed = balances.filter(b => b.health === 'skewed');

    if (concentrated.length > 0) {
      recommendations.push(`Address ${concentrated.length} areas with concentrated power immediately`);
    }

    if (skewed.length > 0) {
      recommendations.push(`Monitor and gradually rebalance ${skewed.length} areas with skewed power`);
    }

    const types = [...new Set(balances.map(b => b.type))];
    types.forEach(type => {
      const typeBalances = balances.filter(b => b.type === type);
      const avgBalance = typeBalances.reduce((sum, b) => sum + Math.abs(b.balance), 0) / typeBalances.length;
      
      if (avgBalance > 0.3) {
        recommendations.push(`Focus on rebalancing ${type} power distribution`);
      }
    });

    if (recommendations.length === 0) {
      recommendations.push('Power distribution is well balanced - maintain current practices');
    }

    return recommendations;
  }
}

// Export singleton instance
export const powerBalancing = new PowerBalancing();
