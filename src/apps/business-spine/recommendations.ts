/**
 * RULE-BASED RECOMMENDATIONS ENGINE
 * 
 * This provides business recommendations based on rules and patterns.
 * LLM can enhance these, but the core logic is deterministic.
 * 
 * These are SUGGESTIONS only - never automatic actions.
 */

export interface Recommendation {
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'high' | 'medium' | 'low';
  timeline: string;
  steps: string[];
  metrics: string[];
  confidence: number;
  category: 'scheduling' | 'pricing' | 'customer' | 'marketing' | 'operations';
}

export function generateRecommendations(context: any): Recommendation[] {
  const recommendations: Recommendation[] = [];
  
  // Analyze business metrics
  const metrics = context.metrics || {};
  const recentActivity = context.recentActivity || [];
  const businessType = context.businessType || 'service_business';
  
  // Scheduling recommendations
  if (metrics.noShowRate && metrics.noShowRate > 0.15) {
    recommendations.push({
      title: 'Reduce No-Show Rate',
      description: 'Your no-show rate is high. Implement reminder strategies to reduce missed appointments.',
      impact: 'high',
      effort: 'medium',
      timeline: '2-4 weeks',
      steps: [
        'Set up automated SMS reminders 24 hours before',
        'Implement confirmation calls for high-value appointments',
        'Add deposit requirement for new clients'
      ],
      metrics: ['no_show_rate', 'confirmation_rate', 'revenue_loss_prevented'],
      confidence: 0.9,
      category: 'scheduling'
    });
  }
  
  // Pricing recommendations
  if (metrics.averageBookingValue && metrics.averageBookingValue < 50) {
    recommendations.push({
      title: 'Optimize Pricing Strategy',
      description: 'Consider premium services or tiered pricing to increase average booking value.',
      impact: 'medium',
      effort: 'low',
      timeline: '1-2 weeks',
      steps: [
        'Analyze competitor pricing',
        'Create service packages',
        'Test premium add-on services'
      ],
      metrics: ['average_booking_value', 'revenue_per_client', 'conversion_rate'],
      confidence: 0.7,
      category: 'pricing'
    });
  }
  
  // Customer retention recommendations
  if (metrics.customerRetentionRate && metrics.customerRetentionRate < 0.8) {
    recommendations.push({
      title: 'Improve Customer Retention',
      description: 'Focus on keeping existing clients who are more valuable than acquiring new ones.',
      impact: 'high',
      effort: 'medium',
      timeline: '4-6 weeks',
      steps: [
        'Implement loyalty program',
        'Schedule regular follow-ups',
        'Create personalized re-engagement campaigns'
      ],
      metrics: ['retention_rate', 'repeat_booking_rate', 'customer_lifetime_value'],
      confidence: 0.8,
      category: 'customer'
    });
  }
  
  // Marketing recommendations
  if (metrics.newClientAcquisition && metrics.newClientAcquisition < 5) {
    recommendations.push({
      title: 'Boost Client Acquisition',
      description: 'Increase marketing efforts to attract new clients to your business.',
      impact: 'medium',
      effort: 'high',
      timeline: '6-8 weeks',
      steps: [
        'Optimize website for local search',
        'Launch referral program',
        'Run targeted social media campaigns'
      ],
      metrics: ['new_clients_per_month', 'cost_per_acquisition', 'conversion_rate'],
      confidence: 0.6,
      category: 'marketing'
    });
  }
  
  // Operations recommendations
  if (recentActivity.includes('booking_conflicts') || recentActivity.includes('overbooking')) {
    recommendations.push({
      title: 'Fix Scheduling Conflicts',
      description: 'Address booking conflicts to improve customer satisfaction and reduce stress.',
      impact: 'high',
      effort: 'medium',
      timeline: '1-2 weeks',
      steps: [
        'Review calendar synchronization',
        'Implement double-booking prevention',
        'Add buffer time between appointments'
      ],
      metrics: ['conflict_rate', 'customer_complaints', 'staff_stress_level'],
      confidence: 0.9,
      category: 'operations'
    });
  }
  
  // Seasonal recommendations
  const currentMonth = new Date().getMonth();
  if (currentMonth >= 10 || currentMonth <= 2) { // Winter months
    recommendations.push({
      title: 'Prepare for Seasonal Slowdown',
      description: 'Plan for winter slowdown with special promotions and maintenance.',
      impact: 'medium',
      effort: 'low',
      timeline: '2-3 weeks',
      steps: [
        'Create winter promotion packages',
        'Schedule equipment maintenance',
        'Plan staff training during slower period'
      ],
      metrics: ['winter_bookings', 'promotion_redemption', 'staff_utilization'],
      confidence: 0.7,
      category: 'marketing'
    });
  }
  
  // Technology recommendations
  if (!context.features?.includes('automated_reminders')) {
    recommendations.push({
      title: 'Implement Automated Reminders',
      description: 'Reduce no-shows and improve efficiency with automated appointment reminders.',
      impact: 'high',
      effort: 'low',
      timeline: '1 week',
      steps: [
        'Configure SMS provider',
        'Set up reminder templates',
        'Test with small client group'
      ],
      metrics: ['no_show_rate', 'staff_time_saved', 'customer_satisfaction'],
      confidence: 0.9,
      category: 'operations'
    });
  }
  
  // Payment recommendations
  if (!context.features?.includes('online_payments')) {
    recommendations.push({
      title: 'Add Online Payments',
      description: 'Enable online payments to improve cash flow and customer convenience.',
      impact: 'medium',
      effort: 'medium',
      timeline: '2-3 weeks',
      steps: [
        'Set up payment processor',
        'Integrate with booking system',
        'Communicate new payment options'
      ],
      metrics: ['payment_processing_time', 'upfront_payments', 'cancellation_rate'],
      confidence: 0.8,
      category: 'operations'
    });
  }
  
  // Sort by impact and confidence
  return recommendations
    .sort((a, b) => {
      const impactScore = { high: 3, medium: 2, low: 1 };
      const aScore = impactScore[a.impact] * a.confidence;
      const bScore = impactScore[b.impact] * b.confidence;
      return bScore - aScore;
    })
    .slice(0, 5); // Top 5 recommendations
}

export function generateQuickInsights(context: any): string[] {
  const insights: string[] = [];
  const metrics = context.metrics || {};
  
  // Quick insights based on metrics
  if (metrics.bookingsCount > 100) {
    insights.push('High booking volume indicates strong demand');
  }
  
  if (metrics.noShowRate < 0.05) {
    insights.push('Excellent no-show rate - clients are reliable');
  } else if (metrics.noShowRate > 0.2) {
    insights.push('High no-show rate requires immediate attention');
  }
  
  if (metrics.revenue && metrics.revenue > 10000) {
    insights.push('Strong revenue performance');
  }
  
  if (metrics.customerRetentionRate > 0.9) {
    insights.push('Outstanding customer retention');
  }
  
  if (context.recentActivity?.includes('system_upgrade')) {
    insights.push('Recent system improvements should boost efficiency');
  }
  
  return insights.slice(0, 3); // Top 3 insights
}

export function generateActionableTips(context: any): string[] {
  const tips: string[] = [];
  const businessType = context.businessType || 'service_business';
  
  // General business tips
  tips.push('Review your pricing quarterly to ensure competitiveness');
  tips.push('Schedule regular client feedback sessions');
  tips.push('Maintain a waitlist for popular time slots');
  
  // Business-type specific tips
  if (businessType === 'salon') {
    tips.push('Track product usage to optimize inventory');
    tips.push('Consider seasonal service promotions');
  } else if (businessType === 'consulting') {
    tips.push('Create standardized service packages');
    tips.push('Develop follow-up protocols for each service type');
  } else if (businessType === 'healthcare') {
    tips.push('Maintain detailed patient communication logs');
    tips.push('Implement recall systems for follow-up care');
  }
  
  // Operational tips
  tips.push('Set aside time each week for business development');
  tips.push('Document all processes for consistency');
  tips.push('Cross-train staff for flexibility');
  
  return tips.slice(0, 6); // Top 6 tips
}
