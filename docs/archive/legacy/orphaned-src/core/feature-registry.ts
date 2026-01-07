/**
 * Feature Registry - The Nervous System
 * 
 * This is the canonical feature coherence layer implementation.
 * All features must register here before they can exist.
 */

export interface DataSource {
  type: string;
  source: 'server' | 'client' | 'cache' | 'external';
  required: boolean;
}

export interface Artifact {
  type: string;
  destination: 'server' | 'client' | 'cache' | 'external';
  format: string;
}

export type StateType = 
  | 'global.auth'
  | 'global.user'
  | 'cache.sessions'
  | 'cache.tasks'
  | 'cache.calendar'
  | 'server.users'
  | 'server.events'
  | 'server.tasks'
  | 'local.ui';

export type EventType = 
  | 'created'
  | 'updated'
  | 'deleted'
  | 'synced'
  | 'failed'
  | 'user_action'
  | 'system_action';

export interface FailureMode {
  type: string;
  recovery: 'automatic' | 'manual' | 'impossible';
  userAction: string;
}

export type SystemOwner = 
  | 'auth_system'
  | 'task_system'
  | 'calendar_system'
  | 'ui_system'
  | 'cache_system';

export interface FeatureFlag {
  name: string;
  enabled: boolean;
  rolloutPercentage: number;
  safeDisable: boolean;
}

export interface FeatureContract {
  name: string;
  primaryUserJob: string; // One sentence
  inputSources: DataSource[];
  outputArtifacts: Artifact[];
  statesTouched: StateType[];
  eventsEmitted: string[];
  eventsListensFor: string[];
  failureModes: FailureMode[];
  owner: SystemOwner;
  version: string;
  dependencies: string[];
  killSwitch: FeatureFlag;
}

export interface EventPayload {
  type: string;
  data: Record<string, unknown>;
  source: string;
  timestamp: Date;
  feature: string;
}

export type Listener = (payload: EventPayload) => void;

export interface FeatureContext {
  userId?: string;
  sessionId?: string;
  userAgent?: string;
  environment: 'development' | 'staging' | 'production';
}

export interface FlagCondition {
  type: 'user_role' | 'environment' | 'percentage' | 'custom';
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than';
  value: string | number;
}

export interface FeatureImpact {
  dataChanges: string[];
  eventChanges: string[];
  behaviorChanges: string[];
}

export interface ExistenceResult {
  dataModelChanges: boolean;
  eventChanges: boolean;
  behaviorChanges: boolean;
  recommendation: 'SHIP' | 'DELETE_OR_DELAY' | 'UI_FLUFF_CONSIDER_REMOVAL' | 'ISOLATED_FEATURE_CONSIDER_INTEGRATION';
}

export interface FeatureScorecard {
  connectivity: number;
  reusability: number;
  eventfulness: number;
  purposefulness: number;
  clarity: number;
  safety: number;
  testability: number;
  documentation: number;
}

export type FeatureLifecycle = 
  | 'inactive'
  | 'loading'
  | 'active'
  | 'degraded'
  | 'failed'
  | 'disabled';

/**
 * Event Bus - Feature Communication Layer
 */
export class FeatureEventBus {
  private listeners = new Map<string, Set<Listener>>();
  
  emit(event: string, payload: Omit<EventPayload, 'timestamp'>): void {
    const fullPayload: EventPayload = {
      ...payload,
      timestamp: new Date()
    };
    
    const handlers = this.listeners.get(event) || new Set();
    handlers.forEach(handler => {
      try {
        handler(fullPayload);
      } catch (error) {
        console.error(`Event handler failed for ${event}:`, error);
      }
    });
  }
  
  on(event: string, handler: Listener): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler);
    
    // Return unsubscribe function
    return () => this.listeners.get(event)?.delete(handler);
  }
  
  once(event: string, handler: Listener): void {
    const unsubscribe = this.on(event, (payload) => {
      handler(payload);
      unsubscribe();
    });
  }
  
  clear(): void {
    this.listeners.clear();
  }
  
  getListenerCount(event: string): number {
    return this.listeners.get(event)?.size || 0;
  }
}

/**
 * Feature Lifecycle Manager
 */
export class FeatureLifecycleManager {
  private states = new Map<string, FeatureLifecycle>();
  
  transition(feature: string, newState: FeatureLifecycle): void {
    const current = this.states.get(feature) || "inactive";
    
    if (!this.isValidTransition(current, newState)) {
      throw new Error(`Invalid state transition: ${current} -> ${newState} for feature ${feature}`);
    }
    
    this.states.set(feature, newState);
    this.emitStateChange(feature, current, newState);
  }
  
  getState(feature: string): FeatureLifecycle {
    return this.states.get(feature) || "inactive";
  }
  
  getAllStates(): Map<string, FeatureLifecycle> {
    return new Map(this.states);
  }
  
  private isValidTransition(from: FeatureLifecycle, to: FeatureLifecycle): boolean {
    const validTransitions: Record<FeatureLifecycle, FeatureLifecycle[]> = {
      inactive: ["loading", "disabled"],
      loading: ["active", "failed"],
      active: ["degraded", "failed", "disabled"],
      degraded: ["active", "failed", "disabled"],
      failed: ["loading", "disabled"],
      disabled: ["loading", "inactive"]
    };
    
    return validTransitions[from]?.includes(to) || false;
  }
  
  private emitStateChange(feature: string, from: FeatureLifecycle, to: FeatureLifecycle): void {
    // Emit state change event for other features to react to
    eventBus.emit("feature.state_changed", {
      type: "system_action",
      data: { feature, from, to },
      source: "lifecycle_manager",
      feature: "system"
    });
  }
}

/**
 * Feature Kill Switch
 */
export class FeatureKillSwitch {
  private flags = new Map<string, FeatureFlag>();
  
  registerFlag(feature: string, flag: FeatureFlag): void {
    this.flags.set(feature, flag);
  }
  
  isFeatureEnabled(feature: string, context: FeatureContext): boolean {
    const flag = this.flags.get(feature);
    if (!flag) return true; // Default to enabled
    
    if (!flag.enabled) return false;
    
    // Check rollout percentage
    if (Math.random() * 100 > flag.rolloutPercentage) {
      return false;
    }
    
    // Check conditions (simplified for now)
    // In a full implementation, this would evaluate all conditions
    return true;
  }
  
  disableFeature(feature: string): void {
    const flag = this.flags.get(feature);
    if (flag && flag.safeDisable) {
      flag.enabled = false;
      this.emitFeatureDisabled(feature);
    } else {
      throw new Error(`Cannot safely disable feature: ${feature}`);
    }
  }
  
  enableFeature(feature: string): void {
    const flag = this.flags.get(feature);
    if (flag) {
      flag.enabled = true;
      this.emitFeatureEnabled(feature);
    }
  }
  
  private emitFeatureDisabled(feature: string): void {
    eventBus.emit("feature.disabled", {
      type: "system_action",
      data: { feature },
      source: "kill_switch",
      feature: "system"
    });
  }
  
  private emitFeatureEnabled(feature: string): void {
    eventBus.emit("feature.enabled", {
      type: "system_action",
      data: { feature },
      source: "kill_switch",
      feature: "system"
    });
  }
}

/**
 * Feature Dependency Graph
 */
export class FeatureDependencyGraph {
  private nodes = new Map<string, FeatureContract>();
  private edges = new Map<string, Set<string>>();
  
  addNode(feature: FeatureContract): void {
    this.nodes.set(feature.name, feature);
    
    // Add dependency edges
    feature.dependencies.forEach(dep => {
      if (!this.edges.has(dep)) {
        this.edges.set(dep, new Set());
      }
      this.edges.get(dep)!.add(feature.name);
    });
  }
  
  removeNode(feature: string): void {
    this.nodes.delete(feature);
    
    // Remove all edges to/from this feature
    this.edges.forEach((targets, source) => {
      targets.delete(feature);
    });
    this.edges.delete(feature);
  }
  
  getDependencies(feature: string): string[] {
    const node = this.nodes.get(feature);
    return node?.dependencies || [];
  }
  
  getDependents(feature: string): string[] {
    return Array.from(this.edges.get(feature) || new Set());
  }
  
  hasCycles(): boolean {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    
    const hasCycle = (feature: string): boolean => {
      if (recursionStack.has(feature)) return true;
      if (visited.has(feature)) return false;
      
      visited.add(feature);
      recursionStack.add(feature);
      
      const deps = this.getDependencies(feature);
      for (const dep of deps) {
        if (hasCycle(dep)) return true;
      }
      
      recursionStack.delete(feature);
      return false;
    };
    
    for (const feature of this.nodes.keys()) {
      if (hasCycle(feature)) return true;
    }
    
    return false;
  }
  
  getTopologicalOrder(): string[] {
    const visited = new Set<string>();
    const result: string[] = [];
    
    const visit = (feature: string): void => {
      if (visited.has(feature)) return;
      
      const deps = this.getDependencies(feature);
      deps.forEach(visit);
      
      visited.add(feature);
      result.push(feature);
    };
    
    for (const feature of this.nodes.keys()) {
      visit(feature);
    }
    
    return result;
  }
}

/**
 * Feature Registry - The Main Interface
 */
export class FeatureRegistry {
  private features = new Map<string, FeatureContract>();
  private graph = new FeatureDependencyGraph();
  private lifecycle = new FeatureLifecycleManager();
  private killSwitch = new FeatureKillSwitch();
  
  register(feature: FeatureContract): void {
    // Validate contract
    this.validateContract(feature);
    
    // Check dependencies
    this.validateDependencies(feature);
    
    // Update dependency graph
    this.graph.addNode(feature);
    
    // Register kill switch
    this.killSwitch.registerFlag(feature.name, feature.killSwitch);
    
    // Register feature
    this.features.set(feature.name, feature);
    
    // Set initial state
    this.lifecycle.transition(feature.name, "inactive");
    
    console.log(`✅ Feature registered: ${feature.name}`);
  }
  
  getFeature(name: string): FeatureContract | undefined {
    return this.features.get(name);
  }
  
  getAllFeatures(): FeatureContract[] {
    return Array.from(this.features.values());
  }
  
  getDependencyGraph(): FeatureDependencyGraph {
    return this.graph;
  }
  
  getLifecycle(): FeatureLifecycleManager {
    return this.lifecycle;
  }
  
  getKillSwitch(): FeatureKillSwitch {
    return this.killSwitch;
  }
  
  activateFeature(name: string, context: FeatureContext): void {
    const feature = this.features.get(name);
    if (!feature) {
      throw new Error(`Feature not found: ${name}`);
    }
    
    if (!this.killSwitch.isFeatureEnabled(name, context)) {
      throw new Error(`Feature is disabled: ${name}`);
    }
    
    this.lifecycle.transition(name, "loading");
    
    // In a real implementation, this would initialize the feature
    // For now, we'll just transition to active
    this.lifecycle.transition(name, "active");
    
    console.log(`🚀 Feature activated: ${name}`);
  }
  
  deactivateFeature(name: string): void {
    const feature = this.features.get(name);
    if (!feature) {
      throw new Error(`Feature not found: ${name}`);
    }
    
    this.lifecycle.transition(name, "inactive");
    console.log(`⏸️ Feature deactivated: ${name}`);
  }
  
  private validateContract(feature: FeatureContract): void {
    if (!feature.primaryUserJob || feature.primaryUserJob.length > 100) {
      throw new Error(`Invalid primary user job for ${feature.name}: must be <= 100 chars`);
    }
    
    if (!feature.eventsEmitted.length && !feature.eventsListensFor.length) {
      throw new Error(`Feature ${feature.name} has no event connections`);
    }
    
    if (!feature.dependencies.every(dep => this.features.has(dep) || this.isSystemDependency(dep))) {
      throw new Error(`Feature ${feature.name} has missing dependencies`);
    }
  }
  
  private validateDependencies(feature: FeatureContract): void {
    // Check for circular dependencies
    this.graph.addNode(feature); // Temporarily add to check cycles
    if (this.graph.hasCycles()) {
      this.graph.removeNode(feature.name);
      throw new Error(`Feature ${feature.name} would create circular dependencies`);
    }
    this.graph.removeNode(feature.name); // Remove, will be added properly in register
  }
  
  private isSystemDependency(dep: string): boolean {
    return ['auth_system', 'cache_system', 'ui_system'].includes(dep);
  }
}

// Global instances
export const eventBus = new FeatureEventBus();
export const featureRegistry = new FeatureRegistry();

// Core primitive validation
export const corePrimitives = [
  'User', 'Task', 'Event', 'TimeRange', 'Status', 
  'Permission', 'Source', 'Confidence'
] as const;

export function isCorePrimitive(type: string): boolean {
  return corePrimitives.includes(type as any);
}

export function usesPrimitivesCorrectly(feature: FeatureContract): boolean {
  // Check if feature uses only core primitives
  const allTypes = [
    ...feature.inputSources.map(s => s.type),
    ...feature.outputArtifacts.map(a => a.type)
  ];
  
  return allTypes.every(type => isCorePrimitive(type));
}
