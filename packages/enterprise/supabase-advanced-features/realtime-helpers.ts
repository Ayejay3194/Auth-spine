/**
 * Realtime Helpers for Supabase Advanced Features Pack
 * 
 * Provides realtime presence, broadcast, and channel management
 * for Supabase Realtime functionality.
 */

import { RealtimeEnvironment, PresenceUser, BroadcastEvent } from './types.js';

export class RealtimeHelpersManager {
  private supabaseClient: any;
  private realtimeClient: any;
  private config: any;
  private presenceChannels: Map<string, any> = new Map();
  private broadcastChannels: Map<string, any> = new Map();
  private presenceState: Map<string, Map<string, PresenceUser>> = new Map();
  private initialized = false;

  /**
   * Initialize realtime helpers
   */
  async initialize(supabaseClient: any, config: any): Promise<void> {
    this.supabaseClient = supabaseClient;
    this.config = config;
    this.realtimeClient = supabaseClient.realtime;
    await this.loadChannels();
    this.initialized = true;
  }

  /**
   * Join presence channel
   */
  async joinPresence(channel: string, metadata: Record<string, any> = {}): Promise<{
    presenceRef: string;
    channel: string;
    users: PresenceUser[];
  }> {
    if (!this.config.enablePresence) {
      throw new Error('Presence not enabled');
    }

    try {
      const channelRef = this.realtimeClient.channel(channel);
      
      // Set up presence tracking
      const presenceRef = await channelRef.presence.subscribe();
      
      // Join with metadata
      await channelRef.presence.enter(metadata);
      
      // Get current users
      const users = await this.getPresenceUsers(channel);
      
      // Store channel reference
      this.presenceChannels.set(channel, channelRef);
      
      // Initialize presence state for channel
      if (!this.presenceState.has(channel)) {
        this.presenceState.set(channel, new Map());
      }

      return {
        presenceRef,
        channel,
        users
      };
    } catch (error) {
      console.error('Failed to join presence channel:', error);
      throw error;
    }
  }

  /**
   * Leave presence channel
   */
  async leavePresence(channel: string, presenceRef: string): Promise<void> {
    try {
      const channelRef = this.presenceChannels.get(channel);
      if (!channelRef) {
        throw new Error('Channel not found');
      }

      await channelRef.presence.leave();
      this.presenceChannels.delete(channel);
      this.presenceState.delete(channel);
    } catch (error) {
      console.error('Failed to leave presence channel:', error);
      throw error;
    }
  }

  /**
   * Get presence users in channel
   */
  async getPresenceUsers(channel: string): Promise<PresenceUser[]> {
    try {
      const channelRef = this.presenceChannels.get(channel);
      if (!channelRef) {
        return [];
      }

      const presence = await channelRef.presence.state();
      
      return Object.entries(presence).map(([id, data]: [string, any]) => ({
        id,
        presenceRef: data.presence_ref,
        onlineAt: new Date(data.online_at),
        lastSeen: new Date(data.last_seen),
        metadata: data.metadata || {}
      }));
    } catch (error) {
      console.error('Failed to get presence users:', error);
      return [];
    }
  }

  /**
   * Update presence metadata
   */
  async updatePresence(channel: string, metadata: Record<string, any>): Promise<void> {
    try {
      const channelRef = this.presenceChannels.get(channel);
      if (!channelRef) {
        throw new Error('Channel not found');
      }

      await channelRef.presence.update(metadata);
    } catch (error) {
      console.error('Failed to update presence:', error);
      throw error;
    }
  }

  /**
   * Track presence events
   */
  async trackPresenceEvents(channel: string, handlers: {
    onJoin?: (user: PresenceUser) => void;
    onLeave?: (user: PresenceUser) => void;
    onSync?: (users: PresenceUser[]) => void;
  }): Promise<void> {
    try {
      const channelRef = this.presenceChannels.get(channel);
      if (!channelRef) {
        throw new Error('Channel not found');
      }

      if (handlers.onJoin) {
        channelRef.presence.on('join', handlers.onJoin);
      }

      if (handlers.onLeave) {
        channelRef.presence.on('leave', handlers.onLeave);
      }

      if (handlers.onSync) {
        channelRef.presence.on('sync', handlers.onSync);
      }
    } catch (error) {
      console.error('Failed to track presence events:', error);
      throw error;
    }
  }

  /**
   * Broadcast to channel
   */
  async broadcast(channel: string, event: string, payload: any): Promise<void> {
    if (!this.config.enableBroadcast) {
      throw new Error('Broadcast not enabled');
    }

    try {
      const channelRef = this.broadcastChannels.get(channel);
      
      if (!channelRef) {
        // Create broadcast channel if it doesn't exist
        const newChannelRef = this.realtimeClient.channel(channel);
        await newChannelRef.subscribe();
        this.broadcastChannels.set(channel, newChannelRef);
      }

      const broadcastEvent: BroadcastEvent = {
        event,
        payload,
        timestamp: new Date(),
        source: 'client'
      };

      await this.broadcastChannels.get(channel).send({
        type: 'broadcast',
        event,
        payload: broadcastEvent
      });
    } catch (error) {
      console.error('Failed to broadcast:', error);
      throw error;
    }
  }

  /**
   * Listen to broadcast events
   */
  async listenBroadcast(channel: string, event: string, handler: (payload: any) => void): Promise<void> {
    try {
      let channelRef = this.broadcastChannels.get(channel);
      
      if (!channelRef) {
        // Create and subscribe to broadcast channel
        channelRef = this.realtimeClient.channel(channel);
        await channelRef.subscribe();
        this.broadcastChannels.set(channel, channelRef);
      }

      channelRef.on('broadcast', { event }, handler);
    } catch (error) {
      console.error('Failed to listen to broadcast:', error);
      throw error;
    }
  }

  /**
   * Create private channel
   */
  async createPrivateChannel(channel: string, options: {
    auth?: boolean;
    presence?: boolean;
    broadcast?: boolean;
  } = {}): Promise<string> {
    try {
      const channelRef = this.realtimeClient.channel(channel, {
        auth: options.auth !== false,
        presence: options.presence || false,
        broadcast: options.broadcast || false
      });

      await channelRef.subscribe();
      
      if (options.presence) {
        this.presenceChannels.set(channel, channelRef);
      }
      
      if (options.broadcast) {
        this.broadcastChannels.set(channel, channelRef);
      }

      return channel;
    } catch (error) {
      console.error('Failed to create private channel:', error);
      throw error;
    }
  }

  /**
   * Get channel statistics
   */
  async getChannelStats(channel: string): Promise<{
    presenceUsers: number;
    broadcastEvents: number;
    lastActivity: Date | null;
  }> {
    const presenceUsers = await this.getPresenceUsers(channel);
    
    // Mock broadcast events count and last activity
    // In real implementation, this would track actual metrics
    return {
      presenceUsers: presenceUsers.length,
      broadcastEvents: 0,
      lastActivity: null
    };
  }

  /**
   * Get health status
   */
  async getHealthStatus(): Promise<boolean> {
    return this.initialized && this.realtimeClient?.isConnected();
  }

  /**
   * Generate TypeScript helpers
   */
  generateTypeScriptHelpers(): string {
    return `
// Realtime Helpers TypeScript
import { RealtimeChannel, RealtimeClient } from '@supabase/realtime-js';

export interface PresenceUser {
  id: string;
  presenceRef: string;
  onlineAt: Date;
  lastSeen: Date;
  metadata: Record<string, any>;
}

export interface BroadcastEvent {
  event: string;
  payload: any;
  timestamp: Date;
  source: string;
}

export interface PresenceState {
  [userId: string]: PresenceUser;
}

export class PresenceManager {
  private channel: RealtimeChannel;
  private state: Map<string, PresenceUser> = new Map();
  private handlers: {
    onJoin?: (user: PresenceUser) => void;
    onLeave?: (user: PresenceUser) => void;
    onSync?: (users: PresenceUser[]) => void;
  } = {};

  constructor(channel: RealtimeChannel) {
    this.channel = channel;
    this.setupPresenceTracking();
  }

  private setupPresenceTracking(): void {
    this.channel.on('presence', { event: 'sync' }, () => {
      const presenceState = this.channel.presence.state();
      this.state.clear();
      
      Object.entries(presenceState).forEach(([id, data]: [string, any]) => {
        this.state.set(id, {
          id,
          presenceRef: data.presence_ref,
          onlineAt: new Date(data.online_at),
          lastSeen: new Date(data.last_seen),
          metadata: data.metadata || {}
        });
      });

      this.handlers.onSync?.(Array.from(this.state.values()));
    });

    this.channel.on('presence', { event: 'join' }, ({ key, newPresences }: any) => {
      const presence = newPresences[0];
      const user: PresenceUser = {
        id: key,
        presenceRef: presence.presence_ref,
        onlineAt: new Date(presence.online_at),
        lastSeen: new Date(presence.last_seen),
        metadata: presence.metadata || {}
      };
      
      this.state.set(key, user);
      this.handlers.onJoin?.(user);
    });

    this.channel.on('presence', { event: 'leave' }, ({ key, leftPresences }: any) => {
      const user = this.state.get(key);
      if (user) {
        this.handlers.onLeave?.(user);
        this.state.delete(key);
      }
    });
  }

  async join(metadata: Record<string, any> = {}): Promise<void> {
    await this.channel.presence.enter(metadata);
  }

  async leave(): Promise<void> {
    await this.channel.presence.leave();
  }

  async update(metadata: Record<string, any>): Promise<void> {
    await this.channel.presence.update(metadata);
  }

  getUsers(): PresenceUser[] {
    return Array.from(this.state.values());
  }

  getUser(id: string): PresenceUser | undefined {
    return this.state.get(id);
  }

  onJoin(handler: (user: PresenceUser) => void): void {
    this.handlers.onJoin = handler;
  }

  onLeave(handler: (user: PresenceUser) => void): void {
    this.handlers.onLeave = handler;
  }

  onSync(handler: (users: PresenceUser[]) => void): void {
    this.handlers.onSync = handler;
  }
}

export class BroadcastManager {
  private channel: RealtimeChannel;
  private handlers: Map<string, ((payload: any) => void)[]> = new Map();

  constructor(channel: RealtimeChannel) {
    this.channel = channel;
  }

  async send(event: string, payload: any): Promise<void> {
    const broadcastEvent: BroadcastEvent = {
      event,
      payload,
      timestamp: new Date(),
      source: 'client'
    };

    await this.channel.send({
      type: 'broadcast',
      event,
      payload: broadcastEvent
    });
  }

  listen(event: string, handler: (payload: any) => void): void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, []);
      this.channel.on('broadcast', { event }, ({ payload }: any) => {
        const handlers = this.handlers.get(event) || [];
        handlers.forEach(h => h(payload));
      });
    }
    
    this.handlers.get(event)!.push(handler);
  }

  unlisten(event: string, handler: (payload: any) => void): void {
    const handlers = this.handlers.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }
}

export class RealtimeManager {
  private client: RealtimeClient;
  private channels: Map<string, RealtimeChannel> = new Map();
  private presenceManagers: Map<string, PresenceManager> = new Map();
  private broadcastManagers: Map<string, BroadcastManager> = new Map();

  constructor(client: RealtimeClient) {
    this.client = client;
  }

  async createChannel(channelName: string, options: {
    auth?: boolean;
    presence?: boolean;
    broadcast?: boolean;
  } = {}): Promise<RealtimeChannel> {
    const channel = this.client.channel(channelName, {
      auth: options.auth !== false,
      presence: options.presence || false,
      broadcast: options.broadcast || false
    });

    await channel.subscribe();
    this.channels.set(channelName, channel);

    if (options.presence) {
      const presenceManager = new PresenceManager(channel);
      this.presenceManagers.set(channelName, presenceManager);
    }

    if (options.broadcast) {
      const broadcastManager = new BroadcastManager(channel);
      this.broadcastManagers.set(channelName, broadcastManager);
    }

    return channel;
  }

  getChannel(channelName: string): RealtimeChannel | undefined {
    return this.channels.get(channelName);
  }

  getPresenceManager(channelName: string): PresenceManager | undefined {
    return this.presenceManagers.get(channelName);
  }

  getBroadcastManager(channelName: string): BroadcastManager | undefined {
    return this.broadcastManagers.get(channelName);
  }

  async removeChannel(channelName: string): Promise<void> {
    const channel = this.channels.get(channelName);
    if (channel) {
      await channel.unsubscribe();
      this.channels.delete(channelName);
      this.presenceManagers.delete(channelName);
      this.broadcastManagers.delete(channelName);
    }
  }

  isConnected(): boolean {
    return this.client.isConnected();
  }

  getConnectionState(): string {
    return this.client.connectionState();
  }
}

// Usage example:
import { createClient } from '@supabase/supabase-js';

const supabase = createClient('your-url', 'your-anon-key');
const realtime = supabase.realtime;

const realtimeManager = new RealtimeManager(realtime);

// Create a channel with presence and broadcast
const channel = await realtimeManager.createChannel('lobby', {
  presence: true,
  broadcast: true
});

// Get presence manager
const presenceManager = realtimeManager.getPresenceManager('lobby')!;
await presenceManager.join({ username: 'john_doe' });

// Listen to presence events
presenceManager.onJoin((user) => {
  console.log('User joined:', user);
});

presenceManager.onLeave((user) => {
  console.log('User left:', user);
});

// Get broadcast manager
const broadcastManager = realtimeManager.getBroadcastManager('lobby')!;

// Send broadcast
await broadcastManager.send('chat_message', {
  user: 'john_doe',
  message: 'Hello, world!'
});

// Listen to broadcast events
broadcastManager.listen('chat_message', (payload) => {
  console.log('Chat message:', payload);
});
`;
  }

  private loadChannels(): void {
    // Load default channels
    const defaultChannels = [
      {
        name: 'global',
        maxUsers: 1000,
        timeout: 300000, // 5 minutes
        metadata: { type: 'global' }
      },
      {
        name: 'notifications',
        maxUsers: 500,
        timeout: 600000, // 10 minutes
        metadata: { type: 'notifications' }
      }
    ];

    defaultChannels.forEach(channel => {
      this.presenceChannels.set(channel.name, {
        ...channel,
        users: new Map()
      });
    });
  }
}

// Export singleton instance
export const realtimeHelpers = new RealtimeHelpersManager();
