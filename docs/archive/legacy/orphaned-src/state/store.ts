/**
 * Redux Store Implementation
 * 
 * Global state management with proper ownership, caching, and performance optimization.
 */

import { configureStore, createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { User, Task, Event } from '../core/data-models';

// Entity State Interface
interface EntityState<T> {
  ids: string[];
  entities: Record<string, T>;
  loading: boolean;
  error: string | null;
  lastUpdated: number | null;
}

// Cache State Interface
interface CacheState {
  version: number;
  lastSync: number | null;
  pendingWrites: string[];
  conflicts: string[];
}

// Search State Interface
interface SearchState {
  query: string;
  filters: Record<string, string[]>;
  results: {
    users: string[];
    tasks: string[];
    events: string[];
  };
}

// Filter State Interface
interface FilterState {
  users: {
    status: string[];
    roles: string[];
  };
  tasks: {
    status: string[];
    priority: string[];
    assignee: string[];
  };
  events: {
    status: string[];
    type: string[];
    dateRange: [string, string] | null;
  };
}

// Modal State Interface
interface ModalState {
  active: string | null;
  data: Record<string, any>;
  queue: string[];
}

// Notification Interface
interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: number;
  autoClose?: boolean;
  duration?: number;
}

// Performance Metrics Interface
interface PerformanceMetrics {
  apiRequests: number;
  cacheHits: number;
  cacheMisses: number;
  averageResponseTime: number;
  errorRate: number;
}

// Root State Interface
interface RootState {
  auth: {
    user: User | null;
    token: string | null;
    permissions: string[];
    status: 'authenticated' | 'unauthenticated' | 'loading';
    lastActivity: number;
  };
  
  data: {
    users: EntityState<User>;
    tasks: EntityState<Task>;
    events: EntityState<Event>;
    cache: CacheState;
  };
  
  ui: {
    theme: 'light' | 'dark';
    sidebar: 'open' | 'closed';
    notifications: Notification[];
    modals: ModalState;
    search: SearchState;
    filters: FilterState;
  };
  
  performance: {
    metrics: PerformanceMetrics;
    networkStatus: 'online' | 'offline' | 'slow';
    lastSync: number;
  };
}

// Async Thunks for API Calls
export const fetchUsers = createAsyncThunk(
  'data/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      // In a real app, this would be an API call
      // For now, return dummy data
      const response = await import('../ui/dummy-data').then(m => m.dummyUsers);
      return response;
    } catch (error) {
      return rejectWithValue('Failed to fetch users');
    }
  }
);

export const fetchTasks = createAsyncThunk(
  'data/fetchTasks',
  async (_, { rejectWithValue }) => {
    try {
      const response = await import('../ui/dummy-data').then(m => m.dummyTasks);
      return response;
    } catch (error) {
      return rejectWithValue('Failed to fetch tasks');
    }
  }
);

export const fetchEvents = createAsyncThunk(
  'data/fetchEvents',
  async (_, { rejectWithValue }) => {
    try {
      const response = await import('../ui/dummy-data').then(m => m.dummyEvents);
      return response;
    } catch (error) {
      return rejectWithValue('Failed to fetch events');
    }
  }
);

export const updateUser = createAsyncThunk(
  'data/updateUser',
  async (user: User, { rejectWithValue }) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      return user;
    } catch (error) {
      return rejectWithValue('Failed to update user');
    }
  }
);

export const updateTask = createAsyncThunk(
  'data/updateTask',
  async (task: Task, { rejectWithValue }) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      return task;
    } catch (error) {
      return rejectWithValue('Failed to update task');
    }
  }
);

export const updateEvent = createAsyncThunk(
  'data/updateEvent',
  async (event: Event, { rejectWithValue }) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      return event;
    } catch (error) {
      return rejectWithValue('Failed to update event');
    }
  }
);

// Auth Slice
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: null,
    permissions: [],
    status: 'unauthenticated' as const,
    lastActivity: 0
  },
  reducers: {
    loginStart: (state) => {
      state.status = 'loading';
    },
    loginSuccess: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.permissions = action.payload.permissions;
      state.status = 'authenticated';
      state.lastActivity = Date.now();
    },
    loginFailure: (state) => {
      state.user = null;
      state.token = null;
      state.permissions = [];
      state.status = 'unauthenticated';
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.permissions = [];
      state.status = 'unauthenticated';
    },
    updateLastActivity: (state) => {
      state.lastActivity = Date.now();
    }
  }
});

// Data Slice
const dataSlice = createSlice({
  name: 'data',
  initialState: {
    users: {
      ids: [],
      entities: {},
      loading: false,
      error: null,
      lastUpdated: null
    },
    tasks: {
      ids: [],
      entities: {},
      loading: false,
      error: null,
      lastUpdated: null
    },
    events: {
      ids: [],
      entities: {},
      loading: false,
      error: null,
      lastUpdated: null
    },
    cache: {
      version: 1,
      lastSync: null,
      pendingWrites: [],
      conflicts: []
    }
  },
  reducers: {
    invalidateCache: (state, action) => {
      const { entityType } = action.payload;
      state.cache.pendingWrites.push(entityType);
    },
    clearCache: (state) => {
      state.cache.version++;
      state.cache.lastSync = null;
      state.cache.pendingWrites = [];
      state.cache.conflicts = [];
    },
    addConflict: (state, action) => {
      const { entityId } = action.payload;
      if (!state.cache.conflicts.includes(entityId)) {
        state.cache.conflicts.push(entityId);
      }
    },
    resolveConflict: (state, action) => {
      const { entityId } = action.payload;
      state.cache.conflicts = state.cache.conflicts.filter(id => id !== entityId);
    }
  },
  extraReducers: (builder) => {
    // Users
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.users.loading = true;
        state.users.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.users.loading = false;
        state.users.ids = action.payload.map(user => user.id);
        state.users.entities = action.payload.reduce((acc, user) => {
          acc[user.id] = user;
          return acc;
        }, {} as Record<string, User>);
        state.users.lastUpdated = Date.now();
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.users.loading = false;
        state.users.error = action.payload as string;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.users.entities[action.payload.id] = action.payload;
        state.users.lastUpdated = Date.now();
      });

    // Tasks
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.tasks.loading = true;
        state.tasks.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.tasks.loading = false;
        state.tasks.ids = action.payload.map(task => task.id);
        state.tasks.entities = action.payload.reduce((acc, task) => {
          acc[task.id] = task;
          return acc;
        }, {} as Record<string, Task>);
        state.tasks.lastUpdated = Date.now();
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.tasks.loading = false;
        state.tasks.error = action.payload as string;
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        state.tasks.entities[action.payload.id] = action.payload;
        state.tasks.lastUpdated = Date.now();
      });

    // Events
    builder
      .addCase(fetchEvents.pending, (state) => {
        state.events.loading = true;
        state.events.error = null;
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.events.loading = false;
        state.events.ids = action.payload.map(event => event.id);
        state.events.entities = action.payload.reduce((acc, event) => {
          acc[event.id] = event;
          return acc;
        }, {} as Record<string, Event>);
        state.events.lastUpdated = Date.now();
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.events.loading = false;
        state.events.error = action.payload as string;
      })
      .addCase(updateEvent.fulfilled, (state, action) => {
        state.events.entities[action.payload.id] = action.payload;
        state.events.lastUpdated = Date.now();
      });
  }
});

// UI Slice
const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    theme: 'light' as const,
    sidebar: 'open' as const,
    notifications: [] as Notification[],
    modals: {
      active: null,
      data: {},
      queue: []
    },
    search: {
      query: '',
      filters: {},
      results: {
        users: [],
        tasks: [],
        events: []
      }
    },
    filters: {
      users: {
        status: [],
        roles: []
      },
      tasks: {
        status: [],
        priority: [],
        assignee: []
      },
      events: {
        status: [],
        type: [],
        dateRange: null
      }
    }
  },
  reducers: {
    setTheme: (state, action) => {
      state.theme = action.payload;
    },
    toggleSidebar: (state) => {
      state.sidebar = state.sidebar === 'open' ? 'closed' : 'open';
    },
    setSidebar: (state, action) => {
      state.sidebar = action.payload;
    },
    addNotification: (state, action) => {
      const notification: Notification = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        autoClose: true,
        duration: 5000,
        ...action.payload
      };
      state.notifications.push(notification);
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        notification => notification.id !== action.payload
      );
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
    openModal: (state, action) => {
      const { modalId, data } = action.payload;
      state.modals.active = modalId;
      state.modals.data = data || {};
    },
    closeModal: (state) => {
      state.modals.active = null;
      state.modals.data = {};
    },
    queueModal: (state, action) => {
      state.modals.queue.push(action.payload);
    },
    setSearchQuery: (state, action) => {
      state.search.query = action.payload;
    },
    setSearchFilters: (state, action) => {
      state.search.filters = action.payload;
    },
    setSearchResults: (state, action) => {
      state.search.results = action.payload;
    },
    setUserFilters: (state, action) => {
      state.filters.users = { ...state.filters.users, ...action.payload };
    },
    setTaskFilters: (state, action) => {
      state.filters.tasks = { ...state.filters.tasks, ...action.payload };
    },
    setEventFilters: (state, action) => {
      state.filters.events = { ...state.filters.events, ...action.payload };
    },
    clearAllFilters: (state) => {
      state.filters = {
        users: { status: [], roles: [] },
        tasks: { status: [], priority: [], assignee: [] },
        events: { status: [], type: [], dateRange: null }
      };
    }
  }
});

// Performance Slice
const performanceSlice = createSlice({
  name: 'performance',
  initialState: {
    metrics: {
      apiRequests: 0,
      cacheHits: 0,
      cacheMisses: 0,
      averageResponseTime: 0,
      errorRate: 0
    },
    networkStatus: 'online' as const,
    lastSync: 0
  },
  reducers: {
    recordApiRequest: (state) => {
      state.metrics.apiRequests++;
    },
    recordCacheHit: (state) => {
      state.metrics.cacheHits++;
    },
    recordCacheMiss: (state) => {
      state.metrics.cacheMisses++;
    },
    updateAverageResponseTime: (state, action) => {
      const newTime = action.payload;
      const currentAvg = state.metrics.averageResponseTime;
      const requestCount = state.metrics.apiRequests;
      state.metrics.averageResponseTime = (currentAvg * (requestCount - 1) + newTime) / requestCount;
    },
    setNetworkStatus: (state, action) => {
      state.networkStatus = action.payload;
    },
    updateLastSync: (state) => {
      state.lastSync = Date.now();
    },
    resetMetrics: (state) => {
      state.metrics = {
        apiRequests: 0,
        cacheHits: 0,
        cacheMisses: 0,
        averageResponseTime: 0,
        errorRate: 0
      };
    }
  }
});

// Export actions
export const authActions = authSlice.actions;
export const dataActions = dataSlice.actions;
export const uiActions = uiSlice.actions;
export const performanceActions = performanceSlice.actions;

// Selectors
export const selectAuth = (state: RootState) => state.auth;
export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectIsAuthenticated = (state: RootState) => state.auth.status === 'authenticated';

export const selectUsers = (state: RootState) => state.data.users;
export const selectTasks = (state: RootState) => state.data.tasks;
export const selectEvents = (state: RootState) => state.data.events;
export const selectCacheState = (state: RootState) => state.data.cache;

export const selectUI = (state: RootState) => state.ui;
export const selectTheme = (state: RootState) => state.ui.theme;
export const selectSidebar = (state: RootState) => state.ui.sidebar;
export const selectNotifications = (state: RootState) => state.ui.notifications;
export const selectModals = (state: RootState) => state.ui.modals;
export const selectSearch = (state: RootState) => state.ui.search;
export const selectFilters = (state: RootState) => state.ui.filters;

export const selectPerformance = (state: RootState) => state.performance;
export const selectNetworkStatus = (state: RootState) => state.performance.networkStatus;

// Memoized selectors for derived data
export const selectUserById = (state: RootState, userId: string) => state.data.users.entities[userId];
export const selectTaskById = (state: RootState, taskId: string) => state.data.tasks.entities[taskId];
export const selectEventById = (state: RootState, eventId: string) => state.data.events.entities[eventId];

export const selectUsersArray = (state: RootState) => state.data.users.ids.map(id => state.data.users.entities[id]);
export const selectTasksArray = (state: RootState) => state.data.tasks.ids.map(id => state.data.tasks.entities[id]);
export const selectEventsArray = (state: RootState) => state.data.events.ids.map(id => state.data.events.entities[id]);

export const selectMyTasks = (state: RootState) => {
  const user = selectCurrentUser(state);
  if (!user) return [];
  return selectTasksArray(state).filter(task => task.assignedTo === user.id);
};

export const selectUpcomingEvents = (state: RootState) => {
  const user = selectCurrentUser(state);
  if (!user) return [];
  const now = new Date();
  return selectEventsArray(state).filter(event => 
    new Date(event.startTime) > now && 
    event.attendees.includes(user.id)
  );
};

// Configure store
export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    data: dataSlice.reducer,
    ui: uiSlice.reducer,
    performance: performanceSlice.reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE']
      }
    })
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Performance monitoring middleware
export const performanceMiddleware = (store: any) => (next: any) => (action: any) => {
  const startTime = performance.now();
  
  // Record API request
  if (action.type.endsWith('/pending')) {
    store.dispatch(performanceActions.recordApiRequest());
  }
  
  const result = next(action);
  
  const endTime = performance.now();
  const duration = endTime - startTime;
  
  // Update average response time
  if (action.type.endsWith('/fulfilled')) {
    store.dispatch(performanceActions.updateAverageResponseTime(duration));
  }
  
  return result;
};

// Cache middleware
export const cacheMiddleware = (store: any) => (next: any) => (action: any) => {
  const result = next(action);
  
  // Handle cache invalidation
  if (action.type.endsWith('/fulfilled')) {
    const entityType = action.type.split('/')[1];
    store.dispatch(dataActions.invalidateCache({ entityType }));
  }
  
  return result;
};

// Network status monitoring
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    store.dispatch(performanceActions.setNetworkStatus('online'));
  });
  
  window.addEventListener('offline', () => {
    store.dispatch(performanceActions.setNetworkStatus('offline'));
  });
}

export default store;
