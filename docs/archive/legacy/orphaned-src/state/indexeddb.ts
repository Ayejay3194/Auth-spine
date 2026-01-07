/**
 * IndexedDB Implementation
 * 
 * Offline storage with proper schema, indexing, and performance optimization.
 */

import { User, Task, Event } from '../core/data-models';

// Cache Entry Interface
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  version: number;
}

// IndexedDB Schema Interface
interface IndexedDBSchema {
  version: 1;
  stores: {
    cache: {
      key: string;
      data: any;
      timestamp: number;
      ttl: number;
      version: number;
    };
    
    users: {
      id: string;
      email: string;
      name: string;
      avatar?: string;
      roles: string[];
      permissions: string[];
      status: string;
      createdAt: string;
      updatedAt: string;
      version: number;
    };
    
    tasks: {
      id: string;
      title: string;
      description?: string;
      status: string;
      priority: string;
      assignedTo: string;
      createdBy: string;
      dueDate?: string;
      completedAt?: string;
      createdAt: string;
      updatedAt: string;
      version: number;
    };
    
    events: {
      id: string;
      type: string;
      title: string;
      description?: string;
      startTime: string;
      endTime: string;
      timezone: string;
      location?: string;
      attendees: string[];
      organizerId: string;
      calendarId: string;
      status: string;
      createdAt: string;
      updatedAt: string;
      version: number;
    };
  };
}

// IndexedDB Manager Class
export class IndexedDBManager {
  private db: IDBDatabase | null = null;
  private readonly dbName = 'AuthSpineDB';
  private readonly version = 1;
  
  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      
      request.onerror = () => {
        console.error('IndexedDB open error:', request.error);
        reject(request.error);
      };
      
      request.onsuccess = () => {
        this.db = request.result;
        console.log('IndexedDB initialized successfully');
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create cache store
        if (!db.objectStoreNames.contains('cache')) {
          const cacheStore = db.createObjectStore('cache', { keyPath: 'key' });
          cacheStore.createIndex('timestamp', 'timestamp');
          cacheStore.createIndex('ttl', 'ttl');
          cacheStore.createIndex('version', 'version');
        }
        
        // Create users store
        if (!db.objectStoreNames.contains('users')) {
          const userStore = db.createObjectStore('users', { keyPath: 'id' });
          userStore.createIndex('email', 'email', { unique: true });
          userStore.createIndex('status', 'status');
          userStore.createIndex('roles', 'roles', { multiEntry: true });
          userStore.createIndex('updatedAt', 'updatedAt');
        }
        
        // Create tasks store
        if (!db.objectStoreNames.contains('tasks')) {
          const taskStore = db.createObjectStore('tasks', { keyPath: 'id' });
          taskStore.createIndex('assignedTo', 'assignedTo');
          taskStore.createIndex('status', 'status');
          taskStore.createIndex('priority', 'priority');
          taskStore.createIndex('createdBy', 'createdBy');
          taskStore.createIndex('dueDate', 'dueDate');
          taskStore.createIndex('updatedAt', 'updatedAt');
        }
        
        // Create events store
        if (!db.objectStoreNames.contains('events')) {
          const eventStore = db.createObjectStore('events', { keyPath: 'id' });
          eventStore.createIndex('startTime', 'startTime');
          eventStore.createIndex('endTime', 'endTime');
          eventStore.createIndex('organizerId', 'organizerId');
          eventStore.createIndex('status', 'status');
          eventStore.createIndex('type', 'type');
          eventStore.createIndex('attendees', 'attendees', { multiEntry: true });
          eventStore.createIndex('calendarId', 'calendarId');
          eventStore.createIndex('updatedAt', 'updatedAt');
        }
      };
    });
  }
  
  async close(): Promise<void> {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
  
  // Generic store method
  async store<T>(storeName: string, data: T): Promise<void> {
    if (!this.db) throw new Error('IndexedDB not initialized');
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);
      
      request.onerror = () => {
        console.error(`IndexedDB store error for ${storeName}:`, request.error);
        reject(request.error);
      };
      
      request.onsuccess = () => {
        console.log(`Data stored in ${storeName}:`, data);
        resolve();
      };
    });
  }
  
  // Generic get method
  async get<T>(storeName: string, key: string): Promise<T | null> {
    if (!this.db) throw new Error('IndexedDB not initialized');
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);
      
      request.onerror = () => {
        console.error(`IndexedDB get error for ${storeName}:`, request.error);
        reject(request.error);
      };
      
      request.onsuccess = () => {
        const result = request.result;
        console.log(`Data retrieved from ${storeName}:`, result);
        resolve(result || null);
      };
    });
  }
  
  // Generic get all method
  async getAll<T>(storeName: string, index?: string, value?: any): Promise<T[]> {
    if (!this.db) throw new Error('IndexedDB not initialized');
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      
      let request: IDBRequest;
      if (index && value !== undefined) {
        const indexStore = store.index(index);
        request = indexStore.getAll(value);
      } else {
        request = store.getAll();
      }
      
      request.onerror = () => {
        console.error(`IndexedDB getAll error for ${storeName}:`, request.error);
        reject(request.error);
      };
      
      request.onsuccess = () => {
        const result = request.result || [];
        console.log(`All data retrieved from ${storeName}:`, result);
        resolve(result);
      };
    });
  }
  
  // Generic delete method
  async delete(storeName: string, key: string): Promise<void> {
    if (!this.db) throw new Error('IndexedDB not initialized');
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);
      
      request.onerror = () => {
        console.error(`IndexedDB delete error for ${storeName}:`, request.error);
        reject(request.error);
      };
      
      request.onsuccess = () => {
        console.log(`Data deleted from ${storeName}:`, key);
        resolve();
      };
    });
  }
  
  // Generic clear method
  async clear(storeName: string): Promise<void> {
    if (!this.db) throw new Error('IndexedDB not initialized');
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();
      
      request.onerror = () => {
        console.error(`IndexedDB clear error for ${storeName}:`, request.error);
        reject(request.error);
      };
      
      request.onsuccess = () => {
        console.log(`Store ${storeName} cleared`);
        resolve();
      };
    });
  }
  
  // Cache-specific methods
  async setCache<T>(key: string, data: T, ttl: number = 3600): Promise<void> {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl * 1000,
      version: 1
    };
    
    await this.store('cache', { key, ...entry });
  }
  
  async getCache<T>(key: string): Promise<T | null> {
    const entry = await this.get<CacheEntry<T>>('cache', key);
    
    if (!entry) return null;
    
    // Check if expired
    if (Date.now() > entry.timestamp + entry.ttl) {
      await this.delete('cache', key);
      return null;
    }
    
    return entry.data;
  }
  
  async deleteCache(key: string): Promise<void> {
    await this.delete('cache', key);
  }
  
  async clearCache(): Promise<void> {
    await this.clear('cache');
  }
  
  async getExpiredCacheKeys(): Promise<string[]> {
    const allEntries = await this.getAll<CacheEntry<any>>('cache');
    const now = Date.now();
    
    return allEntries
      .filter(entry => now > entry.timestamp + entry.ttl)
      .map(entry => entry.key);
  }
  
  async cleanExpiredCache(): Promise<void> {
    const expiredKeys = await this.getExpiredCacheKeys();
    
    for (const key of expiredKeys) {
      await this.deleteCache(key);
    }
    
    console.log(`Cleaned ${expiredKeys.length} expired cache entries`);
  }
  
  // User-specific methods
  async storeUser(user: User): Promise<void> {
    await this.store('users', user);
  }
  
  async getUser(userId: string): Promise<User | null> {
    return await this.get<User>('users', userId);
  }
  
  async getUserByEmail(email: string): Promise<User | null> {
    const users = await this.getAll<User>('users', 'email', email);
    return users.length > 0 ? users[0] : null;
  }
  
  async getAllUsers(): Promise<User[]> {
    return await this.getAll<User>('users');
  }
  
  async getUsersByStatus(status: string): Promise<User[]> {
    return await this.getAll<User>('users', 'status', status);
  }
  
  async getUsersByRole(role: string): Promise<User[]> {
    return await this.getAll<User>('users', 'roles', role);
  }
  
  async deleteUser(userId: string): Promise<void> {
    await this.delete('users', userId);
  }
  
  // Task-specific methods
  async storeTask(task: Task): Promise<void> {
    await this.store('tasks', task);
  }
  
  async getTask(taskId: string): Promise<Task | null> {
    return await this.get<Task>('tasks', taskId);
  }
  
  async getAllTasks(): Promise<Task[]> {
    return await this.getAll<Task>('tasks');
  }
  
  async getTasksByAssignee(assigneeId: string): Promise<Task[]> {
    return await this.getAll<Task>('tasks', 'assignedTo', assigneeId);
  }
  
  async getTasksByStatus(status: string): Promise<Task[]> {
    return await this.getAll<Task>('tasks', 'status', status);
  }
  
  async getTasksByPriority(priority: string): Promise<Task[]> {
    return await this.getAll<Task>('tasks', 'priority', priority);
  }
  
  async getTasksByCreator(creatorId: string): Promise<Task[]> {
    return await this.getAll<Task>('tasks', 'createdBy', creatorId);
  }
  
  async deleteTask(taskId: string): Promise<void> {
    await this.delete('tasks', taskId);
  }
  
  // Event-specific methods
  async storeEvent(event: Event): Promise<void> {
    await this.store('events', event);
  }
  
  async getEvent(eventId: string): Promise<Event | null> {
    return await this.get<Event>('events', eventId);
  }
  
  async getAllEvents(): Promise<Event[]> {
    return await this.getAll<Event>('events');
  }
  
  async getEventsByDateRange(startDate: Date, endDate: Date): Promise<Event[]> {
    const allEvents = await this.getAll<Event>('events');
    return allEvents.filter(event => {
      const eventStart = new Date(event.startTime);
      const eventEnd = new Date(event.endTime);
      return eventStart >= startDate && eventEnd <= endDate;
    });
  }
  
  async getEventsByOrganizer(organizerId: string): Promise<Event[]> {
    return await this.getAll<Event>('events', 'organizerId', organizerId);
  }
  
  async getEventsByAttendee(attendeeId: string): Promise<Event[]> {
    return await this.getAll<Event>('events', 'attendees', attendeeId);
  }
  
  async getEventsByStatus(status: string): Promise<Event[]> {
    return await this.getAll<Event>('events', 'status', status);
  }
  
  async getEventsByType(type: string): Promise<Event[]> {
    return await this.getAll<Event>('events', 'type', type);
  }
  
  async deleteEvent(eventId: string): Promise<void> {
    await this.delete('events', eventId);
  }
  
  // Utility methods
  async getStorageUsage(): Promise<{ [storeName: string]: number }> {
    if (!this.db) throw new Error('IndexedDB not initialized');
    
    const usage: { [storeName: string]: number } = {};
    
    for (const storeName of Array.from(this.db.objectStoreNames)) {
      const count = await new Promise<number>((resolve, reject) => {
        const transaction = this.db!.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.count();
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
      });
      
      usage[storeName] = count;
    }
    
    return usage;
  }
  
  async exportData(): Promise<any> {
    const [users, tasks, events] = await Promise.all([
      this.getAllUsers(),
      this.getAllTasks(),
      this.getAllEvents()
    ]);
    
    return {
      users,
      tasks,
      events,
      exportedAt: new Date().toISOString()
    };
  }
  
  async importData(data: any): Promise<void> {
    const { users, tasks, events } = data;
    
    // Clear existing data
    await Promise.all([
      this.clear('users'),
      this.clear('tasks'),
      this.clear('events')
    ]);
    
    // Import new data
    if (users && Array.isArray(users)) {
      for (const user of users) {
        await this.storeUser(user);
      }
    }
    
    if (tasks && Array.isArray(tasks)) {
      for (const task of tasks) {
        await this.storeTask(task);
      }
    }
    
    if (events && Array.isArray(events)) {
      for (const event of events) {
        await this.storeEvent(event);
      }
    }
    
    console.log('Data imported successfully');
  }
  
  async repairCorruptedData(): Promise<{ repaired: number; errors: string[] }> {
    const errors: string[] = [];
    let repaired = 0;
    
    try {
      // Repair users with invalid emails
      const users = await this.getAllUsers();
      for (const user of users) {
        if (!user.email.includes('@')) {
          await this.deleteUser(user.id);
          repaired++;
        }
      }
      
      // Repair tasks with invalid assignees
      const tasks = await this.getAllTasks();
      for (const task of tasks) {
        const assignee = await this.getUser(task.assignedTo);
        if (!assignee) {
          await this.deleteTask(task.id);
          repaired++;
        }
      }
      
      // Repair events with invalid attendees
      const events = await this.getAllEvents();
      for (const event of events) {
        const validAttendees = [];
        for (const attendeeId of event.attendees) {
          const attendee = await this.getUser(attendeeId);
          if (attendee) {
            validAttendees.push(attendeeId);
          }
        }
        
        if (validAttendees.length !== event.attendees.length) {
          const updatedEvent = { ...event, attendees: validAttendees };
          await this.storeEvent(updatedEvent);
          repaired++;
        }
      }
      
    } catch (error) {
      errors.push(`Repair error: ${error}`);
    }
    
    return { repaired, errors };
  }
}

// Global instance
export const indexedDB = new IndexedDBManager();

// Initialize IndexedDB when module loads
if (typeof window !== 'undefined') {
  indexedDB.init().catch(error => {
    console.error('Failed to initialize IndexedDB:', error);
  });
}

// Clean expired cache on page load
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    indexedDB.cleanExpiredCache().catch(error => {
      console.error('Failed to clean expired cache:', error);
    });
  });
}
