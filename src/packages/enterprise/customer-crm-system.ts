/**
 * Main Customer CRM System Class
 * 
 * Comprehensive customer relationship management system for enterprise
 * customer operations, sales, marketing, and support.
 */

import { CRMConfig, CRMMetrics, CustomerManagement, SalesAutomation, MarketingAutomation, SupportManagement } from './types.js';
import { customerManagement } from './customer-management.js';
import { salesAutomation } from './sales-automation.js';
import { marketingAutomation } from './marketing-automation.js';
import { supportManagement } from './support-management.js';

export class CustomerCRMSystem {
  private config: CRMConfig;
  private initialized = false;

  constructor(config: Partial<CRMConfig> = {}) {
    this.config = {
      customers: {
        enabled: true,
        profiles: true,
        segmentation: true,
        lifecycle: true,
        analytics: true,
        ...config.customers
      },
      sales: {
        enabled: true,
        pipeline: true,
        automation: true,
        forecasting: true,
        reporting: true,
        ...config.sales
      },
      marketing: {
        enabled: true,
        campaigns: true,
        automation: true,
        analytics: true,
        personalization: true,
        ...config.marketing
      },
      support: {
        enabled: true,
        tickets: true,
        knowledge: true,
        automation: true,
        analytics: true,
        ...config.support
      }
    };
  }

  /**
   * Initialize the customer CRM system
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Initialize all CRM components
      await customerManagement.initialize(this.config.customers);
      await salesAutomation.initialize(this.config.sales);
      await marketingAutomation.initialize(this.config.marketing);
      await supportManagement.initialize(this.config.support);

      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize customer CRM system:', error);
      throw error;
    }
  }

  /**
   * Setup customer management
   */
  async setupCustomerManagement(): Promise<void> {
    if (!this.config.customers.enabled) {
      throw new Error('Customer management not enabled');
    }

    try {
      await customerManagement.setupProfiles();
      await customerManagement.setupSegmentation();
      await customerManagement.setupLifecycle();
      await customerManagement.setupAnalytics();
    } catch (error) {
      console.error('Failed to setup customer management:', error);
      throw error;
    }
  }

  /**
   * Setup sales automation
   */
  async setupSalesAutomation(): Promise<void> {
    if (!this.config.sales.enabled) {
      throw new Error('Sales automation not enabled');
    }

    try {
      await salesAutomation.setupPipeline();
      await salesAutomation.setupAutomation();
      await salesAutomation.setupForecasting();
      await salesAutomation.setupReporting();
    } catch (error) {
      console.error('Failed to setup sales automation:', error);
      throw error;
    }
  }

  /**
   * Setup marketing automation
   */
  async setupMarketingAutomation(): Promise<void> {
    if (!this.config.marketing.enabled) {
      throw new Error('Marketing automation not enabled');
    }

    try {
      await marketingAutomation.setupCampaigns();
      await marketingAutomation.setupAutomation();
      await marketingAutomation.setupAnalytics();
      await marketingAutomation.setupPersonalization();
    } catch (error) {
      console.error('Failed to setup marketing automation:', error);
      throw error;
    }
  }

  /**
   * Setup support management
   */
  async setupSupportManagement(): Promise<void> {
    if (!this.config.support.enabled) {
      throw new Error('Support management not enabled');
    }

    try {
      await supportManagement.setupTickets();
      await supportManagement.setupKnowledge();
      await supportManagement.setupAutomation();
      await supportManagement.setupAnalytics();
    } catch (error) {
      console.error('Failed to setup support management:', error);
      throw error;
    }
  }

  /**
   * Get customer management data
   */
  async getCustomerManagement(): Promise<CustomerManagement> {
    try {
      return await customerManagement.getManagement();
    } catch (error) {
      console.error('Failed to get customer management:', error);
      throw error;
    }
  }

  /**
   * Get sales automation data
   */
  async getSalesAutomation(): Promise<SalesAutomation> {
    try {
      return await salesAutomation.getAutomation();
    } catch (error) {
      console.error('Failed to get sales automation:', error);
      throw error;
    }
  }

  /**
   * Get marketing automation data
   */
  async getMarketingAutomation(): Promise<MarketingAutomation> {
    try {
      return await marketingAutomation.getAutomation();
    } catch (error) {
      console.error('Failed to get marketing automation:', error);
      throw error;
    }
  }

  /**
   * Get support management data
   */
  async getSupportManagement(): Promise<SupportManagement> {
    try {
      return await supportManagement.getManagement();
    } catch (error) {
      console.error('Failed to get support management:', error);
      throw error;
    }
  }

  /**
   * Create customer profile
   */
  async createCustomerProfile(profile: any): Promise<any> {
    try {
      return await customerManagement.createProfile(profile);
    } catch (error) {
      console.error('Failed to create customer profile:', error);
      throw error;
    }
  }

  /**
   * Generate comprehensive CRM report
   */
  async generateCRMReport(period: string): Promise<{
    summary: any;
    customers: any;
    sales: any;
    marketing: any;
    support: any;
    insights: any[];
  }> {
    try {
      const metrics = await this.getMetrics();
      const customerManagement = await this.getCustomerManagement();
      const salesAutomation = await this.getSalesAutomation();
      const marketingAutomation = await this.getMarketingAutomation();
      const supportManagement = await this.getSupportManagement();

      return {
        summary: {
          totalCustomers: metrics.overall.totalCustomers,
          customerSatisfaction: metrics.overall.customerSatisfaction,
          revenuePerCustomer: metrics.overall.revenuePerCustomer,
          retentionRate: metrics.overall.retentionRate,
          period
        },
        customers: {
          totalCustomers: metrics.customers.totalCustomers,
          activeCustomers: metrics.customers.activeCustomers,
          newCustomers: metrics.customers.newCustomers,
          churnedCustomers: metrics.customers.churnedCustomers,
          customerLifetimeValue: metrics.customers.customerLifetimeValue,
          satisfactionScore: metrics.customers.satisfactionScore,
          segments: customerManagement.segments.length,
          profiles: customerManagement.profiles.length
        },
        sales: {
          totalRevenue: metrics.sales.totalRevenue,
          dealsWon: metrics.sales.dealsWon,
          dealsLost: metrics.sales.dealsLost,
          conversionRate: metrics.sales.conversionRate,
          averageDealSize: metrics.sales.averageDealSize,
          salesCycleLength: metrics.sales.salesCycleLength,
          pipelines: salesAutomation.pipeline.length,
          deals: salesAutomation.deals.length
        },
        marketing: {
          campaignsActive: metrics.marketing.campaignsActive,
          leadsGenerated: metrics.marketing.leadsGenerated,
          conversionRate: metrics.marketing.conversionRate,
          costPerLead: metrics.marketing.costPerLead,
          roi: metrics.marketing.roi,
          engagementRate: metrics.marketing.engagementRate,
          campaigns: marketingAutomation.campaigns.length,
          segments: marketingAutomation.segments.length
        },
        support: {
          ticketsOpen: metrics.support.ticketsOpen,
          ticketsClosed: metrics.support.ticketsClosed,
          responseTime: metrics.support.responseTime,
          resolutionTime: metrics.support.resolutionTime,
          customerSatisfaction: metrics.support.customerSatisfaction,
          firstContactResolution: metrics.support.firstContactResolution,
          tickets: supportManagement.tickets.length,
          articles: supportManagement.knowledge.articles.length
        },
        insights: [
          {
            type: 'customer',
            title: 'Customer Growth Trend',
            description: `Customer base growing at ${metrics.customers.newCustomers} new customers per month`,
            impact: 'positive',
            recommendation: 'Focus on retention strategies to maintain growth'
          },
          {
            type: 'sales',
            title: 'Sales Performance',
            description: `Sales conversion rate at ${metrics.sales.conversionRate}% with average deal size of $${metrics.sales.averageDealSize}`,
            impact: 'positive',
            recommendation: 'Optimize sales pipeline to improve conversion rates'
          }
        ]
      };
    } catch (error) {
      console.error('Failed to generate CRM report:', error);
      throw error;
    }
  }

  /**
   * Get CRM metrics
   */
  async getMetrics(): Promise<CRMMetrics> {
    try {
      const customerMetrics = await customerManagement.getMetrics();
      const salesMetrics = await salesAutomation.getMetrics();
      const marketingMetrics = await marketingAutomation.getMetrics();
      const supportMetrics = await supportManagement.getMetrics();

      return {
        customers: customerMetrics,
        sales: salesMetrics,
        marketing: marketingMetrics,
        support: supportMetrics,
        overall: {
          totalCustomers: customerMetrics.totalCustomers,
          customerSatisfaction: (customerMetrics.satisfactionScore + supportMetrics.customerSatisfaction) / 2,
          revenuePerCustomer: salesMetrics.totalRevenue / customerMetrics.activeCustomers,
          retentionRate: customerMetrics.retentionRate
        }
      };
    } catch (error) {
      console.error('Failed to get CRM metrics:', error);
      throw error;
    }
  }

  /**
   * Get configuration
   */
  getConfig(): CRMConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(updates: Partial<CRMConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  /**
   * Get health status
   */
  async getHealthStatus(): Promise<{
    overall: boolean;
    customers: boolean;
    sales: boolean;
    marketing: boolean;
    support: boolean;
  }> {
    try {
      const customers = this.config.customers.enabled ? await customerManagement.getHealthStatus() : true;
      const sales = this.config.sales.enabled ? await salesAutomation.getHealthStatus() : true;
      const marketing = this.config.marketing.enabled ? await marketingAutomation.getHealthStatus() : true;
      const support = this.config.support.enabled ? await supportManagement.getHealthStatus() : true;

      return {
        overall: this.initialized && customers && sales && marketing && support,
        customers,
        sales,
        marketing,
        support
      };
    } catch (error) {
      console.error('Failed to get health status:', error);
      return {
        overall: false,
        customers: false,
        sales: false,
        marketing: false,
        support: false
      };
    }
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    this.initialized = false;

    await customerManagement.cleanup();
    await salesAutomation.cleanup();
    await marketingAutomation.cleanup();
    await supportManagement.cleanup();
  }
}

// Export default instance
export const customerCRMSystem = new CustomerCRMSystem();
