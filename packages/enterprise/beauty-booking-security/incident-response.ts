/**
 * Incident Response for Beauty Booking Security Pack
 * 
 * Provides comprehensive incident response with automated escalation,
 * notification channels, and response playbooks for beauty booking platforms.
 */

import { IncidentConfig, Incident, SeverityLevel, IncidentStatus } from './types.js';

export class IncidentResponseManager {
  private config: IncidentConfig;
  private incidents: Map<string, Incident> = new Map();
  private playbooks: Map<string, any> = new Map();
  private escalationRules: Map<string, any> = new Map();
  private initialized = false;

  /**
   * Initialize incident response
   */
  async initialize(config: IncidentConfig): Promise<void> {
    this.config = config;
    this.loadPlaybooks();
    this.loadEscalationRules();
    this.initialized = true;
  }

  /**
   * Create security incident
   */
  async createIncident(incident: {
    type: 'data_breach' | 'security_incident' | 'service_outage' | 'compliance_violation';
    severity: SeverityLevel;
    title: string;
    description: string;
    affectedDomains: ('public' | 'studio' | 'ops')[];
    affectedUsers?: number;
  }): Promise<Incident> {
    const securityIncident: Incident = {
      id: this.generateIncidentId(),
      type: incident.type,
      severity: incident.severity,
      status: 'open',
      title: incident.title,
      description: incident.description,
      affectedDomains: incident.affectedDomains,
      affectedUsers: incident.affectedUsers || 0,
      detectedAt: new Date(),
      actions: [],
      evidence: [],
      lessons: []
    };

    this.incidents.set(securityIncident.id, securityIncident);

    // Trigger automated response if enabled
    if (this.config.responsePlaybooks) {
      await this.triggerAutomatedResponse(securityIncident);
    }

    // Send notifications
    await this.sendNotifications(securityIncident);

    return securityIncident;
  }

  /**
   * Get active incidents
   */
  async getActiveIncidents(): Promise<Incident[]> {
    return Array.from(this.incidents.values())
      .filter(incident => incident.status !== 'resolved');
  }

  /**
   * Update incident
   */
  async updateIncident(incidentId: string, updates: {
    status?: IncidentStatus;
    assignedTo?: string;
    actions?: Array<{
      action: string;
      performedBy: string;
      performedAt: Date;
      description: string;
    }>;
    evidence?: string[];
    lessons?: string[];
  }): Promise<Incident> {
    const incident = this.incidents.get(incidentId);
    if (!incident) {
      throw new Error(`Incident not found: ${incidentId}`);
    }

    const updatedIncident = {
      ...incident,
      ...updates
    };

    if (updates.status === 'resolved') {
      updatedIncident.resolvedAt = new Date();
    }

    this.incidents.set(incidentId, updatedIncident);

    // Send status update notifications
    await this.sendStatusUpdate(updatedIncident);

    return updatedIncident;
  }

  /**
   * Get incident by ID
   */
  async getIncident(incidentId: string): Promise<Incident | null> {
    return this.incidents.get(incidentId) || null;
  }

  /**
   * Get incidents by severity
   */
  async getIncidentsBySeverity(severity: SeverityLevel): Promise<Incident[]> {
    return Array.from(this.incidents.values())
      .filter(incident => incident.severity === severity);
  }

  /**
   * Get incidents by domain
   */
  async getIncidentsByDomain(domain: 'public' | 'studio' | 'ops'): Promise<Incident[]> {
    return Array.from(this.incidents.values())
      .filter(incident => incident.affectedDomains.includes(domain));
  }

  /**
   * Get metrics
   */
  async getMetrics(): Promise<{
    totalIncidents: number;
    openIncidents: number;
    resolvedIncidents: number;
    meanTimeToResolve: number;
  }> {
    const incidents = Array.from(this.incidents.values());
    const openIncidents = incidents.filter(i => i.status === 'open').length;
    const resolvedIncidents = incidents.filter(i => i.status === 'resolved').length;

    // Calculate mean time to resolve
    const resolvedIncidentsWithTime = incidents.filter(i => 
      i.status === 'resolved' && i.resolvedAt
    );
    
    const meanTimeToResolve = resolvedIncidentsWithTime.length > 0
      ? resolvedIncidentsWithTime.reduce((sum, incident) => {
          return sum + (incident.resolvedAt!.getTime() - incident.detectedAt.getTime());
        }, 0) / resolvedIncidentsWithTime.length / (1000 * 60 * 60) // Convert to hours
      : 0;

    return {
      totalIncidents: incidents.length,
      openIncidents,
      resolvedIncidents,
      meanTimeToResolve
    };
  }

  /**
   * Get health status
   */
  async getHealthStatus(): Promise<boolean> {
    return this.initialized;
  }

  /**
   * Generate incident report
   */
  async generateIncidentReport(period?: {
    start: Date;
    end: Date;
  }): Promise<{
    summary: {
      totalIncidents: number;
      criticalIncidents: number;
      highIncidents: number;
      meanResolutionTime: number;
      openIncidents: number;
    };
    breakdown: {
      byType: Record<string, number>;
      bySeverity: Record<string, number>;
      byDomain: Record<string, number>;
    };
    trends: Array<{
      date: string;
      incidents: number;
      resolved: number;
    }>;
    recommendations: string[];
  }> {
    let incidents = Array.from(this.incidents.values());

    if (period) {
      incidents = incidents.filter(incident => 
        incident.detectedAt >= period.start && incident.detectedAt <= period.end
      );
    }

    const summary = {
      totalIncidents: incidents.length,
      criticalIncidents: incidents.filter(i => i.severity === 'critical').length,
      highIncidents: incidents.filter(i => i.severity === 'high').length,
      meanResolutionTime: await this.calculateMeanResolutionTime(incidents),
      openIncidents: incidents.filter(i => i.status === 'open').length
    };

    // Breakdown by type
    const byType: Record<string, number> = {};
    incidents.forEach(incident => {
      byType[incident.type] = (byType[incident.type] || 0) + 1;
    });

    // Breakdown by severity
    const bySeverity: Record<string, number> = {};
    incidents.forEach(incident => {
      bySeverity[incident.severity] = (bySeverity[incident.severity] || 0) + 1;
    });

    // Breakdown by domain
    const byDomain: Record<string, number> = {};
    incidents.forEach(incident => {
      incident.affectedDomains.forEach(domain => {
        byDomain[domain] = (byDomain[domain] || 0) + 1;
      });
    });

    // Generate trends (last 7 days)
    const trends = this.generateTrends(incidents);

    // Generate recommendations
    const recommendations = this.generateRecommendations(summary, incidents);

    return {
      summary,
      breakdown: {
        byType,
        bySeverity,
        byDomain
      },
      trends,
      recommendations
    };
  }

  /**
   * Get runbook for incident type
   */
  async getRunbook(incidentType: string): Promise<any> {
    return this.playbooks.get(incidentType) || null;
  }

  /**
   * Execute runbook step
   */
  async executeRunbookStep(incidentId: string, stepNumber: number, performedBy: string): Promise<{
    success: boolean;
    result?: any;
    error?: string;
  }> {
    const incident = this.incidents.get(incidentId);
    if (!incident) {
      return {
        success: false,
        error: 'Incident not found'
      };
    }

    const runbook = this.playbooks.get(incident.type);
    if (!runbook) {
      return {
        success: false,
        error: 'No runbook found for incident type'
      };
    }

    const step = runbook.steps.find(s => s.step === stepNumber);
    if (!step) {
      return {
        success: false,
        error: 'Step not found in runbook'
      };
    }

    try {
      const result = await this.executeStep(step, incident);
      
      // Record action
      const action = {
        action: step.action,
        performedBy,
        performedAt: new Date(),
        description: step.description
      };
      
      incident.actions.push(action);
      this.incidents.set(incidentId, incident);

      return {
        success: true,
        result
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async triggerAutomatedResponse(incident: Incident): Promise<void> {
    const runbook = this.playbooks.get(incident.type);
    if (!runbook) return;

    // Execute automated steps
    for (const step of runbook.steps) {
      if (step.automated) {
        try {
          await this.executeStep(step, incident);
          
          // Record automated action
          incident.actions.push({
            action: step.action,
            performedBy: 'system',
            performedAt: new Date(),
            description: step.description
          });
        } catch (error) {
          console.error(`Failed to execute automated step ${step.step}:`, error);
        }
      }
    }

    // Check for escalation
    if (this.config.autoEscalation) {
      await this.checkEscalation(incident);
    }
  }

  private async sendNotifications(incident: Incident): Promise<void> {
    const message = this.formatNotificationMessage(incident);

    for (const channel of this.config.notificationChannels) {
      switch (channel) {
        case 'email':
          await this.sendEmailNotification(message, incident);
          break;
        case 'slack':
          await this.sendSlackNotification(message, incident);
          break;
        case 'sms':
          await this.sendSMSNotification(message, incident);
          break;
      }
    }
  }

  private async sendStatusUpdate(incident: Incident): Promise<void> {
    const message = this.formatStatusUpdateMessage(incident);

    for (const channel of this.config.notificationChannels) {
      switch (channel) {
        case 'email':
          await this.sendEmailNotification(message, incident);
          break;
        case 'slack':
          await this.sendSlackNotification(message, incident);
          break;
      }
    }
  }

  private async checkEscalation(incident: Incident): Promise<void> {
    const rule = this.escalationRules.get(incident.type);
    if (!rule) return;

    // Check if escalation criteria are met
    if (incident.severity === 'critical' || 
        (incident.severity === 'high' && incident.affectedUsers > 100)) {
      await this.escalateIncident(incident, rule);
    }
  }

  private async escalateIncident(incident: Incident, rule: any): Promise<void> {
    // Update incident status
    incident.status = 'investigating';
    
    // Add escalation action
    incident.actions.push({
      action: 'escalated',
      performedBy: 'system',
      performedAt: new Date(),
      description: `Escalated to ${rule.escalateTo}`
    });

    // Send escalation notifications
    await this.sendEscalationNotification(incident, rule);
  }

  private async executeStep(step: any, incident: Incident): Promise<any> {
    // Simulate step execution
    switch (step.action) {
      case 'isolate_affected_systems':
        return { isolated: true, systems: incident.affectedDomains };
      case 'notify_stakeholders':
        return { notified: true, channels: this.config.notificationChannels };
      case 'collect_evidence':
        return { evidence: ['logs', 'screenshots', 'network_traffic'] };
      case 'assess_impact':
        return { impact: 'medium', affectedUsers: incident.affectedUsers };
      default:
        return { executed: true };
    }
  }

  private formatNotificationMessage(incident: Incident): string {
    return `[${incident.severity.toUpperCase()}] ${incident.title}\n\n` +
           `Type: ${incident.type}\n` +
           `Description: ${incident.description}\n` +
           `Affected Domains: ${incident.affectedDomains.join(', ')}\n` +
           `Affected Users: ${incident.affectedUsers}\n` +
           `Detected: ${incident.detectedAt.toISOString()}`;
  }

  private formatStatusUpdateMessage(incident: Incident): string {
    return `[UPDATE] ${incident.title}\n\n` +
           `Status: ${incident.status}\n` +
           `Severity: ${incident.severity}\n` +
           `Actions Taken: ${incident.actions.length}\n` +
           `Last Updated: ${new Date().toISOString()}`;
  }

  private async sendEmailNotification(message: string, incident: Incident): Promise<void> {
    console.log(`[EMAIL] Sending notification for incident ${incident.id}:`);
    console.log(message);
  }

  private async sendSlackNotification(message: string, incident: Incident): Promise<void> {
    console.log(`[SLACK] Sending notification for incident ${incident.id}:`);
    console.log(message);
  }

  private async sendSMSNotification(message: string, incident: Incident): Promise<void> {
    console.log(`[SMS] Sending notification for incident ${incident.id}:`);
    console.log(message);
  }

  private async sendEscalationNotification(incident: Incident, rule: any): Promise<void> {
    const message = `[ESCALATED] ${incident.title}\n\n` +
                   `Escalated to: ${rule.escalateTo}\n` +
                   `Reason: ${rule.escalationReason}\n` +
                   `Time: ${new Date().toISOString()}`;
    
    console.log(`[ESCALATION] ${message}`);
  }

  private calculateMeanResolutionTime(incidents: Incident[]): number {
    const resolvedIncidents = incidents.filter(i => 
      i.status === 'resolved' && i.resolvedAt
    );
    
    if (resolvedIncidents.length === 0) return 0;
    
    const totalTime = resolvedIncidents.reduce((sum, incident) => {
      return sum + (incident.resolvedAt!.getTime() - incident.detectedAt.getTime());
    }, 0);
    
    return totalTime / resolvedIncidents.length / (1000 * 60 * 60); // Convert to hours
  }

  private generateTrends(incidents: Incident[]): Array<{
    date: string;
    incidents: number;
    resolved: number;
  }> {
    const trends = [];
    const now = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
      const dateStr = date.toISOString().split('T')[0];
      
      const dayIncidents = incidents.filter(incident => 
        incident.detectedAt.toISOString().split('T')[0] === dateStr
      );
      
      const dayResolved = dayIncidents.filter(incident => 
        incident.status === 'resolved'
      );
      
      trends.push({
        date: dateStr,
        incidents: dayIncidents.length,
        resolved: dayResolved.length
      });
    }
    
    return trends;
  }

  private generateRecommendations(summary: any, incidents: Incident[]): string[] {
    const recommendations = [];
    
    if (summary.criticalIncidents > 0) {
      recommendations.push('Review critical incidents and implement preventive measures');
    }
    
    if (summary.meanResolutionTime > 24) {
      recommendations.push('Improve incident response time - current average is above 24 hours');
    }
    
    if (summary.openIncidents > 5) {
      recommendations.push('Address open incidents - current backlog is high');
    }
    
    const dataBreaches = incidents.filter(i => i.type === 'data_breach').length;
    if (dataBreaches > 2) {
      recommendations.push('Strengthen data protection controls - multiple data breaches detected');
    }
    
    return recommendations;
  }

  private loadPlaybooks(): void {
    // Data breach playbook
    this.playbooks.set('data_breach', {
      name: 'Data Breach Response',
      steps: [
        {
          step: 1,
          action: 'isolate_affected_systems',
          description: 'Isolate affected systems to prevent further data loss',
          automated: true,
          duration: 15,
          owner: 'security_team'
        },
        {
          step: 2,
          action: 'assess_impact',
          description: 'Assess the scope and impact of the breach',
          automated: false,
          duration: 60,
          owner: 'incident_commander'
        },
        {
          step: 3,
          action: 'notify_stakeholders',
          description: 'Notify required stakeholders and regulatory bodies',
          automated: true,
          duration: 30,
          owner: 'legal_team'
        },
        {
          step: 4,
          action: 'collect_evidence',
          description: 'Collect and preserve evidence for investigation',
          automated: false,
          duration: 120,
          owner: 'forensics_team'
        }
      ],
      rollback: [
        {
          step: 1,
          action: 'restore_systems',
          description: 'Restore systems from clean backups',
          expected: 'Systems operational and secure'
        }
      ],
      contacts: [
        { role: 'incident_commander', name: 'Security Lead', contact: 'security@beautybooking.com' },
        { role: 'legal_team', name: 'Legal Counsel', contact: 'legal@beautybooking.com' }
      ]
    });

    // Security incident playbook
    this.playbooks.set('security_incident', {
      name: 'Security Incident Response',
      steps: [
        {
          step: 1,
          action: 'contain_threat',
          description: 'Contain the threat and prevent further damage',
          automated: true,
          duration: 30,
          owner: 'security_team'
        },
        {
          step: 2,
          action: 'investigate_source',
          description: 'Investigate the source and method of attack',
          automated: false,
          duration: 90,
          owner: 'security_team'
        },
        {
          step: 3,
          action: 'remediate_vulnerabilities',
          description: 'Patch vulnerabilities and secure systems',
          automated: false,
          duration: 180,
          owner: 'engineering_team'
        }
      ],
      rollback: [
        {
          step: 1,
          action: 'rollback_changes',
          description: 'Rollback any changes that caused issues',
          expected: 'Systems restored to previous state'
        }
      ],
      contacts: [
        { role: 'security_team', name: 'Security Team', contact: 'security@beautybooking.com' },
        { role: 'engineering_team', name: 'Engineering Lead', contact: 'engineering@beautybooking.com' }
      ]
    });
  }

  private loadEscalationRules(): void {
    this.escalationRules.set('data_breach', {
      escalateTo: 'executive_team',
      escalationReason: 'Data breach affecting customer information',
      conditions: {
        severity: 'critical',
        affectedUsers: 10
      }
    });

    this.escalationRules.set('security_incident', {
      escalateTo: 'security_lead',
      escalationReason: 'Security incident requiring immediate attention',
      conditions: {
        severity: 'high',
        affectedDomains: ['public', 'studio']
      }
    });
  }

  private generateIncidentId(): string {
    return `incident_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
export const incidentResponse = new IncidentResponseManager();
