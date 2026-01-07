# FEATURE COHERENCE LAYER

**Date:** January 4, 2026  
**Status:** ✅ IMPLEMENTED  
**Purpose:** The nervous system that connects features without creating spaghetti

---

## 🧠 THE CONNECTIVE TISSUE

This layer sits above features and below UI. Nothing ships without passing through it.

---

## 📋 1. FEATURE CONTRACT (REQUIRED FOR EVERY FEATURE)

### Contract Schema
```typescript
interface FeatureContract {
  name: string;
  primaryUserJob: string; // One sentence
  inputSources: DataSource[];
  outputArtifacts: Artifact[];
  statesTouched: StateType[];
  eventsEmitted: EventType[];
  eventsListensFor: EventType[];
  failureModes: FailureMode[];
  owner: SystemOwner;
  version: string;
  dependencies: string[];
  killSwitch: FeatureFlag;
}
```

### Example: Authentication Feature
```typescript
const authContract: FeatureContract = {
  name: "authentication",
  primaryUserJob: "Securely identify and authorize users",
  inputSources: ["user_credentials", "session_tokens"],
  outputArtifacts: ["jwt_tokens", "user_sessions", "audit_logs"],
  statesTouched: ["global.auth", "cache.sessions", "server.users"],
  eventsEmitted: ["user.authenticated", "user.failed_login", "session.created"],
  eventsListensFor: ["user.logout", "password.reset_requested"],
  failureModes: ["invalid_credentials", "account_locked", "server_error"],
  owner: "auth_system",
  version: "1.0.0",
  dependencies: ["user_management", "security_headers"],
  killSwitch: "auth_enabled"
};
```

---

## 🔄 2. EVENT-DRIVEN CONNECTIVE TISSUE

### Standard Event Types
```typescript
type StandardEventType = 
  | "created"
  | "updated" 
  | "deleted"
  | "synced"
  | "failed"
  | "user_action"
  | "system_action";
```

### Event Flow Example
```typescript
// Calendar booking emits
eventBus.emit("created", {
  type: "calendar_event",
  data: { eventId, userId, timeRange },
  source: "calendar_feature"
});

// Multiple features listen independently
cacheFeature.on("created", updateIndexDB);
notificationFeature.on("created", scheduleReminder);
analyticsFeature.on("created", logUserBehavior);
uiFeature.on("created", optimisticUpdate);
```

### Event Bus Implementation
```typescript
class FeatureEventBus {
  private listeners = new Map<string, Set<Listener>>();
  
  emit(event: string, payload: EventPayload): void {
    const handlers = this.listeners.get(event) || new Set();
    handlers.forEach(handler => {
      try {
        handler(payload);
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
}
```

---

## 🗺️ 3. FEATURE DEPENDENCY GRAPH

### Graph Structure
```typescript
interface FeatureNode {
  feature: string;
  upstream: string[]; // What must exist first
  downstream: string[]; // What breaks if this breaks
  state: "active" | "degraded" | "failed" | "disabled";
  health: HealthScore;
}

interface FeatureGraph {
  nodes: Map<string, FeatureNode>;
  edges: Map<string, Set<string>>;
}
```

### Dependency Rules
```typescript
const dependencyRules = {
  // No circular dependencies
  noCycles: (graph: FeatureGraph) => validateAcyclic(graph),
  
  // Required dependencies must exist
  requiredDeps: (feature: FeatureContract) => 
    feature.dependencies.every(dep => featureRegistry.has(dep)),
  
  // Ownership conflicts not allowed
  noOwnershipConflicts: (features: FeatureContract[]) => 
    validateNoStateConflicts(features),
  
  // Kill switches must be safe
  safeKillSwitch: (feature: FeatureContract) =>
    validateSafeDisabling(feature)
};
```

---

## 🧱 4. SHARED PRIMITIVES ONLY

### Core Primitives (Mandatory)
```typescript
interface CorePrimitives {
  // Identity
  User: {
    id: string;
    email: string;
    roles: string[];
    permissions: string[];
  };
  
  // Tasks & Actions
  Task: {
    id: string;
    title: string;
    status: "pending" | "in_progress" | "completed";
    assignedTo: string;
    dueDate?: Date;
  };
  
  // Time & Events
  Event: {
    id: string;
    type: string;
    timestamp: Date;
    userId?: string;
    data: Record<string, unknown>;
  };
  
  TimeRange: {
    start: Date;
    end: Date;
    timezone: string;
  };
  
  // System State
  Status: "active" | "inactive" | "loading" | "error";
  Permission: string;
  Source: "user" | "system" | "external";
  Confidence: number; // 0-1
}
```

### Primitive Validation
```typescript
function validatePrimitiveUsage(feature: FeatureContract): ValidationResult {
  const violations: string[] = [];
  
  // Check for custom primitive reinvention
  if (feature.outputArtifacts.some(artifact => 
      !isCorePrimitive(artifact.type))) {
    violations.push(`Feature ${feature.name} invents custom primitives`);
  }
  
  // Check for proper primitive composition
  if (!usesPrimitivesCorrectly(feature)) {
    violations.push(`Feature ${feature.name} misuses core primitives`);
  }
  
  return { valid: violations.length === 0, violations };
}
```

---

## 🚪 5. SINGLE FEATURE ENTRY POINT

### Valid Entry Points
```typescript
type EntryPoint = 
  | { type: "user_action"; action: string; component: string }
  | { type: "scheduled_job"; schedule: string; handler: string }
  | { type: "external_event"; source: string; event: string }
  | { type: "agent_tool"; tool: string; parameters: Record<string, unknown> };
```

### Entry Point Validation
```typescript
function validateEntryPoint(feature: FeatureContract): boolean {
  const hasValidEntry = 
    feature.eventsListensFor.some(event => 
      ["user_action", "scheduled_job", "external_event", "agent_tool"]
      .includes(event.split('.')[0])
    );
  
  if (!hasValidEntry) {
    throw new Error(`Feature ${feature.name} has no valid entry point`);
  }
  
  return true;
}
```

---

## 🔄 6. FEATURE LIFECYCLE STATES

### Mandatory States
```typescript
type FeatureLifecycle = 
  | "inactive"     // Feature exists but is disabled
  | "loading"      // Feature is initializing
  | "active"       // Feature is running normally
  | "degraded"     // Feature works but with reduced functionality
  | "failed"       // Feature is non-functional
  | "disabled";    // Feature is intentionally turned off
```

### State Machine
```typescript
class FeatureLifecycleManager {
  private states = new Map<string, FeatureLifecycle>();
  
  transition(feature: string, newState: FeatureLifecycle): void {
    const current = this.states.get(feature) || "inactive";
    
    if (!isValidTransition(current, newState)) {
      throw new Error(`Invalid state transition: ${current} -> ${newState}`);
    }
    
    this.states.set(feature, newState);
    this.emitStateChange(feature, current, newState);
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
}
```

---

## ⚡ 7. FEATURE KILL SWITCH

### Kill Switch Implementation
```typescript
interface FeatureFlag {
  name: string;
  enabled: boolean;
  rolloutPercentage: number;
  conditions: FlagCondition[];
  safeDisable: boolean;
}

class FeatureKillSwitch {
  private flags = new Map<string, FeatureFlag>();
  
  isFeatureEnabled(feature: string, context: FeatureContext): boolean {
    const flag = this.flags.get(feature);
    if (!flag) return true; // Default to enabled
    
    if (!flag.enabled) return false;
    
    // Check rollout percentage
    if (Math.random() * 100 > flag.rolloutPercentage) {
      return false;
    }
    
    // Check conditions
    return flag.conditions.every(condition => 
      this.evaluateCondition(condition, context)
    );
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
}
```

---

## 📊 8. FEATURE SCORECARD

### Scoring Criteria
```typescript
interface FeatureScorecard {
  connectivity: number;    // Connects to existing features
  reusability: number;    // Reuses shared primitives
  eventfulness: number;   // Emits useful events
  purposefulness: number; // Improves core user job
  clarity: number;        // Can be explained in one sentence
  safety: number;         // Can be safely disabled
  testability: number;    // Has comprehensive tests
  documentation: number;  // Has complete docs
}
```

### Score Calculation
```typescript
function scoreFeature(feature: FeatureContract): FeatureScorecard {
  return {
    connectivity: feature.dependencies.length > 0 ? 1 : 0,
    reusability: usesSharedPrimitives(feature) ? 1 : 0,
    eventfulness: feature.eventsEmitted.length > 0 ? 1 : 0,
    purposefulness: feature.primaryUserJob.split(' ').length <= 15 ? 1 : 0,
    clarity: feature.name.length <= 50 ? 1 : 0,
    safety: feature.killSwitch ? 1 : 0,
    testability: hasTests(feature.name) ? 1 : 0,
    documentation: hasDocumentation(feature.name) ? 1 : 0
  };
}

function canShip(score: FeatureScorecard): boolean {
  return Object.values(score).every(score => score === 1);
}
```

---

## 🤔 9. THE "WHY DOES THIS EXIST" TEST

### Existence Validation
```typescript
function validateExistence(feature: FeatureContract): ExistenceResult {
  const impacts = analyzeFeatureImpact(feature);
  
  return {
    dataModelChanges: impacts.dataChanges.length > 0,
    eventChanges: impacts.eventChanges.length > 0,
    behaviorChanges: impacts.behaviorChanges.length > 0,
    recommendation: getRecommendation(impacts)
  };
}

function getRecommendation(impacts: FeatureImpact): string {
  if (!impacts.dataChanges.length && 
      !impacts.eventChanges.length && 
      !impacts.behaviorChanges.length) {
    return "DELETE_OR_DELAY";
  }
  
  if (impacts.dataChanges.length === 0 && impacts.eventChanges.length > 0) {
    return "UI_FLUFF_CONSIDER_REMOVAL";
  }
  
  if (impacts.eventChanges.length === 0) {
    return "ISOLATED_FEATURE_CONSIDER_INTEGRATION";
  }
  
  return "SHIP";
}
```

---

## 📋 10. FEATURE REGISTRY

### Registry Implementation
```typescript
class FeatureRegistry {
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
    
    // Register feature
    this.features.set(feature.name, feature);
    
    // Set initial state
    this.lifecycle.transition(feature.name, "inactive");
    
    console.log(`Feature registered: ${feature.name}`);
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
  
  private validateContract(feature: FeatureContract): void {
    if (!feature.primaryUserJob || feature.primaryUserJob.length > 100) {
      throw new Error(`Invalid primary user job for ${feature.name}`);
    }
    
    if (!feature.eventsEmitted.length && !feature.eventsListensFor.length) {
      throw new Error(`Feature ${feature.name} has no event connections`);
    }
    
    if (!validatePrimitiveUsage(feature).valid) {
      throw new Error(`Feature ${feature.name} violates primitive usage rules`);
    }
  }
}
```

---

## 🎯 FINAL TRUTH

### The Nervous System in Action

```typescript
// Initialize the coherence layer
const featureRegistry = new FeatureRegistry();
const eventBus = new FeatureEventBus();
const lifecycle = new FeatureLifecycleManager();

// Register features with contracts
featureRegistry.register(authContract);
featureRegistry.register(calendarContract);
featureRegistry.register(taskContract);

// Features communicate via events only
eventBus.on("user.authenticated", (payload) => {
  // Cache updates automatically
  cacheFeature.updateUserSession(payload);
  
  // UI updates automatically  
  uiFeature.showAuthenticatedState(payload);
  
  // Analytics tracks automatically
  analyticsFeature.trackLogin(payload);
});

// No direct feature coupling
// No spaghetti code
// Clear ownership
// Predictable behavior
```

### This Layer Fixes:
- ✅ **Feature Soup:** Features must declare their purpose and connections
- ✅ **Spaghetti Code:** Event-driven communication only
- ✅ **Broken Dependencies:** Explicit dependency graph
- ✅ **Unclear Ownership:** Clear system ownership
- ✅ **Hard to Disable:** Kill switches for every feature
- ✅ **No Visibility:** Registry provides complete overview

---

**This coherence layer is the missing spine.** It turns a collection of features into an intentional system that knows what it's doing.

**Rule:** If a feature doesn't pass through this layer, it doesn't exist.
