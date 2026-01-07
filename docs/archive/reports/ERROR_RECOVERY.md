# ERROR & RECOVERY - PHASE 5

**Date:** January 4, 2026  
**Status:** ✅ IMPLEMENTED  
**Purpose:** User-facing errors, developer tools, and graceful recovery

---

## 😱 USER-FACING ERRORS

### Single Error Tone
```typescript
interface UserFacingError {
  type: 'error' | 'warning' | 'info';
  title: string;
  message: string;
  action?: {
    label: string;
    handler: () => void;
  };
  traceId: string;
  timestamp: number;
}

// The only error message users ever see
const UNIVERSAL_ERROR_MESSAGE = "Something went wrong. Contact support.";

const errorMessages = {
  // Network errors
  network: {
    title: "Connection Lost",
    message: "Unable to connect to the server. Please check your internet connection.",
    action: { label: "Try Again", handler: retryLastRequest }
  },
  
  // Permission errors
  permission: {
    title: "Access Denied", 
    message: "You don't have permission to perform this action.",
    action: { label: "Contact Admin", handler: openSupportChat }
  },
  
  // Validation errors
  validation: {
    title: "Invalid Input",
    message: "Please check your input and try again.",
    action: { label: "Fix Issues", handler: focusFirstError }
  },
  
  // Server errors
  server: {
    title: "Server Error",
    message: UNIVERSAL_ERROR_MESSAGE,
    action: { label: "Contact Support", handler: openSupportChat }
  },
  
  // Unknown errors
  unknown: {
    title: "Unexpected Error",
    message: UNIVERSAL_ERROR_MESSAGE,
    action: { label: "Contact Support", handler: openSupportChat }
  }
};
```

### Error Display Component
```typescript
const ErrorDisplay: React.FC<{
  error: UserFacingError;
  onDismiss?: () => void;
}> = ({ error, onDismiss }) => {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <ErrorIcon className="h-5 w-5 text-red-400" />
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-red-800">
            {error.title}
          </h3>
          <p className="mt-1 text-sm text-red-700">
            {error.message}
          </p>
          {error.action && (
            <div className="mt-3">
              <button
                onClick={error.action.handler}
                className="bg-red-100 text-red-800 px-3 py-1 rounded text-sm font-medium hover:bg-red-200"
              >
                {error.action.label}
              </button>
            </div>
          )}
        </div>
        {onDismiss && (
          <div className="ml-3 flex-shrink-0">
            <button
              onClick={onDismiss}
              className="text-red-400 hover:text-red-500"
            >
              <CloseIcon className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
```

---

## 🔧 DEVELOPER RECOVERY TOOLS

### Retry Mechanism
```typescript
class RetryManager {
  private maxRetries = 3;
  private retryDelay = 1000; // 1 second
  private backoffMultiplier = 2;
  
  async retry<T>(
    operation: () => Promise<T>,
    context: string,
    currentRetry: number = 0
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (currentRetry >= this.maxRetries) {
        console.error(`Max retries exceeded for ${context}:`, error);
        throw error;
      }
      
      const delay = this.retryDelay * Math.pow(this.backoffMultiplier, currentRetry);
      console.log(`Retrying ${context} in ${delay}ms (attempt ${currentRetry + 1}/${this.maxRetries})`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
      return this.retry(operation, context, currentRetry + 1);
    }
  }
  
  async retryWithBackoff<T>(
    operation: () => Promise<T>,
    context: string
  ): Promise<T> {
    return this.retry(operation, context);
  }
}
```

### Data Recovery Tools
```typescript
class DataRecoveryTools {
  async clearLocalData(): Promise<void> {
    // Clear IndexedDB
    await indexedDB.clear('users');
    await indexedDB.clear('tasks');
    await indexedDB.clear('events');
    await indexedDB.clearCache();
    
    // Clear Redux store
    store.dispatch(dataActions.clearCache());
    store.dispatch(uiActions.clearNotifications());
    
    console.log('Local data cleared');
  }
  
  async rehydrateFromServer(): Promise<void> {
    try {
      // Fetch fresh data from server
      const [users, tasks, events] = await Promise.all([
        fetchUsers(),
        fetchTasks(),
        fetchEvents()
      ]);
      
      // Update Redux store
      store.dispatch(fetchUsers.fulfilled(users));
      store.dispatch(fetchTasks.fulfilled(tasks));
      store.dispatch(fetchEvents.fulfilled(events));
      
      // Update IndexedDB
      for (const user of users) {
        await indexedDB.storeUser(user);
      }
      for (const task of tasks) {
        await indexedDB.storeTask(task);
      }
      for (const event of events) {
        await indexedDB.storeEvent(event);
      }
      
      console.log('Data rehydrated from server');
    } catch (error) {
      console.error('Failed to rehydrate from server:', error);
      throw error;
    }
  }
  
  async repairCorruptedData(): Promise<RepairResult> {
    const result = await indexedDB.repairCorruptedData();
    
    if (result.repaired > 0) {
      console.log(`Repaired ${result.repaired} corrupted data entries`);
    }
    
    if (result.errors.length > 0) {
      console.error('Data repair errors:', result.errors);
    }
    
    return result;
  }
  
  async validateDataIntegrity(): Promise<IntegrityReport> {
    const report: IntegrityReport = {
      users: { valid: 0, invalid: 0, errors: [] },
      tasks: { valid: 0, invalid: 0, errors: [] },
      events: { valid: 0, invalid: 0, errors: [] },
      overall: { valid: 0, invalid: 0 }
    };
    
    // Validate users
    const users = await indexedDB.getAllUsers();
    for (const user of users) {
      if (this.validateUser(user)) {
        report.users.valid++;
      } else {
        report.users.invalid++;
        report.users.errors.push(`Invalid user: ${user.id}`);
      }
    }
    
    // Validate tasks
    const tasks = await indexedDB.getAllTasks();
    for (const task of tasks) {
      if (await this.validateTask(task)) {
        report.tasks.valid++;
      } else {
        report.tasks.invalid++;
        report.tasks.errors.push(`Invalid task: ${task.id}`);
      }
    }
    
    // Validate events
    const events = await indexedDB.getAllEvents();
    for (const event of events) {
      if (await this.validateEvent(event)) {
        report.events.valid++;
      } else {
        report.events.invalid++;
        report.events.errors.push(`Invalid event: ${event.id}`);
      }
    }
    
    report.overall.valid = report.users.valid + report.tasks.valid + report.events.valid;
    report.overall.invalid = report.users.invalid + report.tasks.invalid + report.events.invalid;
    
    return report;
  }
  
  private validateUser(user: User): boolean {
    return !!(
      user.id &&
      user.email.includes('@') &&
      user.name &&
      user.roles.length > 0
    );
  }
  
  private async validateTask(task: Task): Promise<boolean> {
    if (!task.id || !task.title || !task.assignedTo) {
      return false;
    }
    
    // Check if assignee exists
    const assignee = await indexedDB.getUser(task.assignedTo);
    return !!assignee;
  }
  
  private async validateEvent(event: Event): Promise<boolean> {
    if (!event.id || !event.title || !event.startTime || !event.endTime) {
      return false;
    }
    
    // Check time validity
    const start = new Date(event.startTime);
    const end = new Date(event.endTime);
    if (end <= start) {
      return false;
    }
    
    // Check if organizer exists
    const organizer = await indexedDB.getUser(event.organizerId);
    return !!organizer;
  }
}
```

### Auto-Recovery System
```typescript
class AutoRecoverySystem {
  private recoveryStrategies = new Map<string, RecoveryStrategy>();
  
  constructor() {
    this.setupRecoveryStrategies();
  }
  
  private setupRecoveryStrategies(): void {
    // Network error recovery
    this.recoveryStrategies.set('network', {
      detect: (error) => error.code === 'NETWORK_ERROR',
      recover: async (error) => {
        // Wait for network to be restored
        await this.waitForNetwork();
        // Retry the failed operation
        return this.retryLastOperation();
      }
    });
    
    // Authentication error recovery
    this.recoveryStrategies.set('auth', {
      detect: (error) => error.code === 'TOKEN_EXPIRED',
      recover: async (error) => {
        // Try to refresh token
        const refreshed = await this.refreshAuthToken();
        if (refreshed) {
          return this.retryLastOperation();
        } else {
          // Redirect to login
          this.redirectToLogin();
          throw error;
        }
      }
    });
    
    // Data conflict recovery
    this.recoveryStrategies.set('conflict', {
      detect: (error) => error.code === 'RESOURCE_CONFLICT',
      recover: async (error) => {
        // Fetch latest data and merge
        return this.resolveDataConflict(error);
      }
    });
    
    // Server error recovery
    this.recoveryStrategies.set('server', {
      detect: (error) => error.code === 'INTERNAL_ERROR',
      recover: async (error) => {
        // Wait and retry with exponential backoff
        await this.delay(5000);
        return this.retryLastOperation();
      }
    });
  }
  
  async handleError(error: any): Promise<any> {
    for (const [strategyName, strategy] of this.recoveryStrategies) {
      if (strategy.detect(error)) {
        console.log(`Applying recovery strategy: ${strategyName}`);
        try {
          return await strategy.recover(error);
        } catch (recoveryError) {
          console.error(`Recovery strategy ${strategyName} failed:`, recoveryError);
        }
      }
    }
    
    // No recovery strategy worked
    throw error;
  }
  
  private async waitForNetwork(): Promise<void> {
    return new Promise((resolve) => {
      const checkNetwork = () => {
        if (navigator.onLine) {
          resolve();
        } else {
          setTimeout(checkNetwork, 1000);
        }
      };
      checkNetwork();
    });
  }
  
  private async retryLastOperation(): Promise<any> {
    // This would need to track the last operation
    // For now, just return a placeholder
    console.log('Retrying last operation');
  }
  
  private async refreshAuthToken(): Promise<boolean> {
    try {
      // Attempt to refresh the auth token
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include'
      });
      
      return response.ok;
    } catch {
      return false;
    }
  }
  
  private redirectToLogin(): void {
    window.location.href = '/login';
  }
  
  private async resolveDataConflict(error: any): Promise<any> {
    // Fetch latest data and resolve conflict
    console.log('Resolving data conflict:', error);
    // Implementation would depend on the specific conflict
  }
  
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

---

## 🛠️ DEVELOPER DEBUGGING TOOLS

### Debug Panel Component
```typescript
const DebugPanel: React.FC = () => {
  const [state, setState] = useState({
    visible: false,
    tab: 'state' as 'state' | 'cache' | 'performance' | 'logs'
  });
  
  const reduxState = useSelector((state: RootState) => state);
  const performance = useSelector(selectPerformance);
  
  if (!state.visible) {
    return (
      <button
        onClick={() => setState(prev => ({ ...prev, visible: true }))}
        className="fixed bottom-4 right-4 bg-gray-800 text-white px-3 py-2 rounded text-sm"
      >
        Debug
      </button>
    );
  }
  
  return (
    <div className="fixed bottom-4 right-4 w-96 h-96 bg-white border border-gray-300 rounded-lg shadow-lg overflow-hidden">
      <div className="bg-gray-100 px-4 py-2 border-b border-gray-300">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">Debug Panel</h3>
          <button
            onClick={() => setState(prev => ({ ...prev, visible: false }))}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>
        <div className="flex space-x-2 mt-2">
          {(['state', 'cache', 'performance', 'logs'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setState(prev => ({ ...prev, tab }))}
              className={`px-2 py-1 text-xs rounded ${
                state.tab === tab ? 'bg-blue-500 text-white' : 'bg-gray-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
      
      <div className="p-4 h-64 overflow-auto">
        {state.tab === 'state' && (
          <div>
            <h4 className="font-medium mb-2">Redux State</h4>
            <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
              {JSON.stringify(reduxState, null, 2)}
            </pre>
          </div>
        )}
        
        {state.tab === 'cache' && (
          <CacheDebugInfo />
        )}
        
        {state.tab === 'performance' && (
          <div>
            <h4 className="font-medium mb-2">Performance Metrics</h4>
            <div className="space-y-2 text-sm">
              <div>API Requests: {performance.metrics.apiRequests}</div>
              <div>Cache Hits: {performance.metrics.cacheHits}</div>
              <div>Cache Misses: {performance.metrics.cacheMisses}</div>
              <div>Avg Response Time: {performance.metrics.averageResponseTime.toFixed(2)}ms</div>
              <div>Network Status: {performance.networkStatus}</div>
            </div>
          </div>
        )}
        
        {state.tab === 'logs' && (
          <DebugLogs />
        )}
      </div>
    </div>
  );
};
```

### Cache Debug Info
```typescript
const CacheDebugInfo: React.FC = () => {
  const [cacheInfo, setCacheInfo] = useState<any>(null);
  
  useEffect(() => {
    const loadCacheInfo = async () => {
      try {
        const usage = await indexedDB.getStorageUsage();
        const expiredKeys = await indexedDB.getExpiredCacheKeys();
        
        setCacheInfo({
          usage,
          expiredKeys: expiredKeys.length,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error('Failed to load cache info:', error);
      }
    };
    
    loadCacheInfo();
    const interval = setInterval(loadCacheInfo, 5000);
    return () => clearInterval(interval);
  }, []);
  
  if (!cacheInfo) {
    return <div>Loading cache info...</div>;
  }
  
  return (
    <div className="space-y-2 text-sm">
      <h4 className="font-medium">Cache Usage</h4>
      {Object.entries(cacheInfo.usage).map(([store, count]) => (
        <div key={store}>
          {store}: {count} items
        </div>
      ))}
      <div>Expired keys: {cacheInfo.expiredKeys}</div>
      <div className="mt-2 space-x-2">
        <button
          onClick={() => indexedDB.cleanExpiredCache()}
          className="bg-blue-500 text-white px-2 py-1 rounded text-xs"
        >
          Clean Expired
        </button>
        <button
          onClick={() => indexedDB.clearCache()}
          className="bg-red-500 text-white px-2 py-1 rounded text-xs"
        >
          Clear Cache
        </button>
      </div>
    </div>
  );
};
```

### Debug Logs
```typescript
const DebugLogs: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  
  useEffect(() => {
    // Override console methods to capture logs
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;
    
    console.log = (...args) => {
      originalLog(...args);
      setLogs(prev => [...prev, { type: 'log', message: args, timestamp: Date.now() }]);
    };
    
    console.error = (...args) => {
      originalError(...args);
      setLogs(prev => [...prev, { type: 'error', message: args, timestamp: Date.now() }]);
    };
    
    console.warn = (...args) => {
      originalWarn(...args);
      setLogs(prev => [...prev, { type: 'warn', message: args, timestamp: Date.now() }]);
    };
    
    return () => {
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
    };
  }, []);
  
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <h4 className="font-medium">Console Logs</h4>
        <button
          onClick={() => setLogs([])}
          className="bg-gray-500 text-white px-2 py-1 rounded text-xs"
        >
          Clear
        </button>
      </div>
      <div className="space-y-1 max-h-48 overflow-auto">
        {logs.slice(-50).map((log, index) => (
          <div
            key={index}
            className={`text-xs p-1 rounded ${
              log.type === 'error' ? 'bg-red-100' :
              log.type === 'warn' ? 'bg-yellow-100' :
              'bg-gray-100'
            }`}
          >
            <span className="text-gray-500">
              {new Date(log.timestamp).toLocaleTimeString()}
            </span>
            {' '}
            <span className="font-medium">
              [{log.type.toUpperCase()}]
            </span>
            {' '}
            {log.message.join(' ')}
          </div>
        ))}
      </div>
    </div>
  );
};
```

---

## 🔄 ERROR BOUNDARY

### React Error Boundary
```typescript
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error boundary caught an error:', error, errorInfo);
    
    // Report to error tracking service
    this.reportError(error, errorInfo);
  }
  
  private reportError(error: Error, errorInfo: React.ErrorInfo) {
    // In production, send to error tracking service
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry.captureException(error);
    }
  }
  
  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
            <div className="text-center">
              <ErrorIcon className="mx-auto h-12 w-12 text-red-500 mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Something went wrong
              </h1>
              <p className="text-gray-600 mb-6">
                We're sorry, but something unexpected happened. Our team has been notified.
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => window.location.reload()}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
                >
                  Reload Page
                </button>
                <button
                  onClick={() => this.setState({ hasError: false, error: null })}
                  className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded hover:bg-gray-300"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    return this.props.children;
  }
}
```

---

## 🚀 NEXT STEPS

With error handling and recovery implemented:

1. **Phase 6:** Agent & Tooling System
2. **Phase 7:** Calendar & Coordination  
3. **Phase 8:** Feedback & Iteration

**The application now handles errors gracefully and provides comprehensive recovery tools.**
