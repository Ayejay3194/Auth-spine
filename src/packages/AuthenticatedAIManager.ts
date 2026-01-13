import { UnifiedAIAgent, AuthContext, AIFeature, AuthenticationLevel } from './UnifiedAIAgent.js';

export interface AIComponentConfig {
  componentId: string;
  name: string;
  authLevel: AuthenticationLevel;
  requiredPermissions: string[];
  features: string[];
  enabled: boolean;
}

export interface ComponentAccessControl {
  componentId: string;
  userId: string;
  accessLevel: 'none' | 'read' | 'write' | 'admin';
  grantedAt: Date;
  expiresAt?: Date;
  restrictions?: Record<string, any>;
}

export interface AIComponentFirewall {
  componentId: string;
  incomingFilters: Array<(data: any) => boolean>;
  outgoingFilters: Array<(data: any) => boolean>;
  dataEncryption: boolean;
  auditLogging: boolean;
}

/**
 * Manages authenticated access to AI components with firewall isolation
 */
export class AuthenticatedAIManager {
  private agent: UnifiedAIAgent;
  private components: Map<string, AIComponentConfig> = new Map();
  private accessControls: Map<string, ComponentAccessControl[]> = new Map();
  private firewalls: Map<string, AIComponentFirewall> = new Map();
  private auditLog: Array<{
    timestamp: Date;
    userId: string;
    componentId: string;
    action: string;
    allowed: boolean;
    metadata?: any;
  }> = [];

  constructor() {
    this.agent = new UnifiedAIAgent();
    this.initializeComponents();
  }

  /**
   * Initialize AI components with authentication requirements
   */
  private initializeComponents(): void {
    const components: AIComponentConfig[] = [
      {
        componentId: 'nlp-engine',
        name: 'NLP Engine',
        authLevel: 'authenticated',
        requiredPermissions: ['nlp:read'],
        features: ['sentiment-analysis', 'intent-detection', 'entity-extraction', 'text-summarization'],
        enabled: true
      },
      {
        componentId: 'forecasting-engine',
        name: 'Forecasting Engine',
        authLevel: 'authenticated',
        requiredPermissions: ['forecasting:read'],
        features: ['ensemble-forecasting', 'trend-detection'],
        enabled: true
      },
      {
        componentId: 'optimization-engine',
        name: 'Optimization Engine',
        authLevel: 'authenticated',
        requiredPermissions: ['optimization:write'],
        features: ['schedule-optimization', 'pricing-optimization'],
        enabled: true
      },
      {
        componentId: 'clustering-engine',
        name: 'Clustering Engine',
        authLevel: 'admin',
        requiredPermissions: ['clustering:read', 'users:read'],
        features: ['user-segmentation', 'semantic-clustering'],
        enabled: true
      },
      {
        componentId: 'reasoning-engine',
        name: 'Reasoning Engine',
        authLevel: 'authenticated',
        requiredPermissions: ['reasoning:read'],
        features: ['decision-explanation', 'risk-assessment'],
        enabled: true
      },
      {
        componentId: 'llm-integration',
        name: 'LLM Integration',
        authLevel: 'authenticated',
        requiredPermissions: ['nlp:write'],
        features: ['text-generation'],
        enabled: true
      }
    ];

    for (const component of components) {
      this.components.set(component.componentId, component);
      this.initializeComponentFirewall(component.componentId);
    }
  }

  /**
   * Initialize firewall for a component
   */
  private initializeComponentFirewall(componentId: string): void {
    const firewall: AIComponentFirewall = {
      componentId,
      incomingFilters: [
        (data) => this.validateDataType(data),
        (data) => this.checkDataSize(data),
        (data) => this.sanitizeInput(data)
      ],
      outgoingFilters: [
        (data) => this.maskSensitiveData(data),
        (data) => this.validateOutput(data)
      ],
      dataEncryption: true,
      auditLogging: true
    };

    this.firewalls.set(componentId, firewall);
  }

  /**
   * Set authentication context for the agent
   */
  setAuthContext(context: AuthContext): void {
    this.agent.setAuthContext(context);
  }

  /**
   * Check if user can access a component
   */
  canAccessComponent(componentId: string, userId: string, authContext: AuthContext): boolean {
    const component = this.components.get(componentId);
    if (!component || !component.enabled) return false;

    // Check auth level
    const authLevelHierarchy: Record<AuthenticationLevel, number> = {
      'public': 0,
      'authenticated': 1,
      'admin': 2,
      'system': 3
    };

    const userLevel = authLevelHierarchy[authContext.authLevel] || 0;
    const requiredLevel = authLevelHierarchy[component.authLevel] || 0;

    if (userLevel < requiredLevel) {
      this.logAccess(userId, componentId, 'access_check', false, 'Insufficient auth level');
      return false;
    }

    // Check permissions
    const hasAllPermissions = component.requiredPermissions.every(perm =>
      authContext.permissions.includes(perm)
    );

    if (!hasAllPermissions) {
      this.logAccess(userId, componentId, 'access_check', false, 'Missing permissions');
      return false;
    }

    // Check access control list
    const accessControl = this.getAccessControl(componentId, userId);
    if (!accessControl) {
      this.logAccess(userId, componentId, 'access_check', false, 'No access control entry');
      return false;
    }

    // Check expiration
    if (accessControl.expiresAt && new Date() > accessControl.expiresAt) {
      this.logAccess(userId, componentId, 'access_check', false, 'Access expired');
      return false;
    }

    this.logAccess(userId, componentId, 'access_check', true);
    return true;
  }

  /**
   * Process data through component with firewall
   */
  async processComponentRequest(
    componentId: string,
    userId: string,
    authContext: AuthContext,
    data: any
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    // Check access
    if (!this.canAccessComponent(componentId, userId, authContext)) {
      this.logAccess(userId, componentId, 'process_request', false, 'Access denied');
      return {
        success: false,
        error: 'Access denied to component'
      };
    }

    const firewall = this.firewalls.get(componentId);
    if (!firewall) {
      return {
        success: false,
        error: 'Component firewall not found'
      };
    }

    try {
      // Apply incoming filters
      let filteredData = data;
      for (const filter of firewall.incomingFilters) {
        if (!filter(filteredData)) {
          this.logAccess(userId, componentId, 'process_request', false, 'Incoming filter rejected');
          return {
            success: false,
            error: 'Data validation failed'
          };
        }
      }

      // Set auth context
      this.agent.setAuthContext(authContext);

      // Process based on component type
      let result: any;
      switch (componentId) {
        case 'nlp-engine':
          result = await this.agent.processInput(filteredData, { useNLP: true });
          break;
        case 'forecasting-engine':
          result = await this.agent.processInput(filteredData, { useNLP: false });
          break;
        case 'llm-integration':
          result = await this.agent.processInput(filteredData, { useLLM: true });
          break;
        default:
          result = await this.agent.processInput(filteredData);
      }

      // Apply outgoing filters
      let outputData = result;
      for (const filter of firewall.outgoingFilters) {
        if (!filter(outputData)) {
          this.logAccess(userId, componentId, 'process_request', false, 'Outgoing filter rejected');
          return {
            success: false,
            error: 'Output validation failed'
          };
        }
      }

      this.logAccess(userId, componentId, 'process_request', true);

      return {
        success: true,
        data: outputData
      };
    } catch (error) {
      this.logAccess(userId, componentId, 'process_request', false, error instanceof Error ? error.message : 'Unknown error');
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Processing failed'
      };
    }
  }

  /**
   * Grant access to a component
   */
  grantComponentAccess(
    componentId: string,
    userId: string,
    accessLevel: 'read' | 'write' | 'admin' = 'read',
    expiresAt?: Date
  ): boolean {
    const component = this.components.get(componentId);
    if (!component) return false;

    const accessControl: ComponentAccessControl = {
      componentId,
      userId,
      accessLevel,
      grantedAt: new Date(),
      expiresAt
    };

    if (!this.accessControls.has(componentId)) {
      this.accessControls.set(componentId, []);
    }

    const controls = this.accessControls.get(componentId)!;
    const existingIndex = controls.findIndex(c => c.userId === userId);

    if (existingIndex >= 0) {
      controls[existingIndex] = accessControl;
    } else {
      controls.push(accessControl);
    }

    this.logAccess(userId, componentId, 'grant_access', true, `Access level: ${accessLevel}`);
    return true;
  }

  /**
   * Revoke access to a component
   */
  revokeComponentAccess(componentId: string, userId: string): boolean {
    const controls = this.accessControls.get(componentId);
    if (!controls) return false;

    const index = controls.findIndex(c => c.userId === userId);
    if (index >= 0) {
      controls.splice(index, 1);
      this.logAccess(userId, componentId, 'revoke_access', true);
      return true;
    }

    return false;
  }

  /**
   * Get access control for user
   */
  private getAccessControl(componentId: string, userId: string): ComponentAccessControl | null {
    const controls = this.accessControls.get(componentId);
    if (!controls) return null;

    return controls.find(c => c.userId === userId) || null;
  }

  /**
   * Get available components for user
   */
  getAvailableComponents(userId: string, authContext: AuthContext): AIComponentConfig[] {
    return Array.from(this.components.values()).filter(component =>
      this.canAccessComponent(component.componentId, userId, authContext)
    );
  }

  /**
   * Configure LLM for the agent
   */
  configureLLM(config: any): void {
    this.agent.configureLLM(config);
  }

  /**
   * Enable teacher mode
   */
  enableTeacher(config?: any): void {
    this.agent.enableTeacher(config);
  }

  /**
   * Disable teacher mode
   */
  disableTeacher(): void {
    this.agent.disableTeacher();
  }

  /**
   * Get agent status
   */
  getAgentStatus(): any {
    return this.agent.getStatus();
  }

  /**
   * Validate data type
   */
  private validateDataType(data: any): boolean {
    return data !== null && data !== undefined;
  }

  /**
   * Check data size
   */
  private checkDataSize(data: any): boolean {
    const size = JSON.stringify(data).length;
    return size < 10 * 1024 * 1024; // 10MB limit
  }

  /**
   * Sanitize input
   */
  private sanitizeInput(data: any): boolean {
    if (typeof data === 'string') {
      // Remove potentially dangerous characters
      return !/<script|javascript:|onerror=/i.test(data);
    }
    return true;
  }

  /**
   * Mask sensitive data
   */
  private maskSensitiveData(data: any): any {
    if (typeof data !== 'object') return data;

    const sensitiveFields = ['password', 'apiKey', 'secret', 'token', 'ssn', 'creditCard'];
    const masked = JSON.parse(JSON.stringify(data));

    const maskObject = (obj: any) => {
      for (const key in obj) {
        if (sensitiveFields.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
          obj[key] = '***MASKED***';
        } else if (typeof obj[key] === 'object') {
          maskObject(obj[key]);
        }
      }
    };

    maskObject(masked);
    return masked;
  }

  /**
   * Validate output
   */
  private validateOutput(data: any): boolean {
    return data !== null && data !== undefined;
  }

  /**
   * Log access attempt
   */
  private logAccess(
    userId: string,
    componentId: string,
    action: string,
    allowed: boolean,
    metadata?: string
  ): void {
    this.auditLog.push({
      timestamp: new Date(),
      userId,
      componentId,
      action,
      allowed,
      metadata
    });

    // Keep only last 10000 entries
    if (this.auditLog.length > 10000) {
      this.auditLog = this.auditLog.slice(-10000);
    }
  }

  /**
   * Get audit log
   */
  getAuditLog(filters?: { userId?: string; componentId?: string; action?: string }): typeof this.auditLog {
    let log = [...this.auditLog];

    if (filters?.userId) {
      log = log.filter(entry => entry.userId === filters.userId);
    }
    if (filters?.componentId) {
      log = log.filter(entry => entry.componentId === filters.componentId);
    }
    if (filters?.action) {
      log = log.filter(entry => entry.action === filters.action);
    }

    return log;
  }

  /**
   * Get component by ID
   */
  getComponent(componentId: string): AIComponentConfig | undefined {
    return this.components.get(componentId);
  }

  /**
   * Get all components
   */
  getAllComponents(): AIComponentConfig[] {
    return Array.from(this.components.values());
  }
}

export default AuthenticatedAIManager;
