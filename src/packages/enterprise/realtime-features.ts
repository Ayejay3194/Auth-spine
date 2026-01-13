/**
 * Realtime Features for Supabase SaaS Features Pack
 * 
 * Provides realtime presence, broadcast, and collaboration
 * features for multi-tenant SaaS applications.
 */

import { RealtimeFeature, PresenceState, PresenceUser, CollaborationSession, CollaborationOperation } from './types.js';

export class RealtimeFeaturesManager {
  private supabaseClient: any;
  private config: any;
  private realtimeClient: any;
  private presenceChannels: Map<string, any> = new Map();
  private collaborationSessions: Map<string, CollaborationSession> = new Map();
  private presenceState: Map<string, PresenceState> = new Map();
  private initialized = false;

  /**
   * Initialize realtime features
   */
  async initialize(supabaseClient: any, config: any): Promise<void> {
    this.supabaseClient = supabaseClient;
    this.config = config;
    this.realtimeClient = supabaseClient.realtime;
    await this.loadFeatures();
    this.initialized = true;
  }

  /**
   * Get presence state
   */
  async getPresenceState(channel?: string): Promise<PresenceState> {
    if (!this.config.enablePresence) {
      throw new Error('Presence not enabled');
    }

    if (channel) {
      return this.presenceState.get(channel) || {
        users: new Map(),
        channels: new Map(),
        metadata: new Map()
      };
    }

    // Return aggregated presence state
    const aggregated: PresenceState = {
      users: new Map(),
      channels: new Map(),
      metadata: new Map()
    };

    for (const [channelName, state] of this.presenceState.entries()) {
      for (const [userId, user] of state.users.entries()) {
        aggregated.users.set(userId, user);
      }
      aggregated.channels.set(channelName, state.channels.get(channelName) || new Set());
    }

    return aggregated;
  }

  /**
   * Join presence channel
   */
  async joinPresence(channel: string, metadata: any = {}): Promise<{
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
      
      // Initialize presence state for channel
      if (!this.presenceState.has(channel)) {
        this.presenceState.set(channel, {
          users: new Map(),
          channels: new Map(),
          metadata: new Map()
        });
      }

      // Store channel reference
      this.presenceChannels.set(channel, channelRef);

      // Get current users
      const users = await this.getPresenceUsers(channel);

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
   * Update presence metadata
   */
  async updatePresence(channel: string, metadata: any): Promise<void> {
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
   * Start collaboration session
   */
  async startCollaboration(sessionData: {
    tenantId: string;
    type: 'document' | 'whiteboard' | 'code' | 'design';
    participants: string[];
    initialState?: any;
  }): Promise<CollaborationSession> {
    if (!this.config.enableCollaboration) {
      throw new Error('Collaboration not enabled');
    }

    const sessionId = this.generateSessionId();
    
    const session: CollaborationSession = {
      id: sessionId,
      tenantId: sessionData.tenantId,
      type: sessionData.type,
      participants: sessionData.participants,
      state: sessionData.initialState || {},
      operations: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    try {
      // Create collaboration channel
      const channel = `collaboration:${sessionId}`;
      const channelRef = this.realtimeClient.channel(channel);
      await channelRef.subscribe();

      // Set up collaboration event handlers
      this.setupCollaborationHandlers(sessionId, channelRef);

      // Store session
      this.collaborationSessions.set(sessionId, session);

      // Notify participants
      await this.notifyCollaborationStart(session);

      return session;
    } catch (error) {
      console.error('Failed to start collaboration session:', error);
      throw error;
    }
  }

  /**
   * Join collaboration session
   */
  async joinCollaboration(sessionId: string, userId: string): Promise<{
    session: CollaborationSession;
    channel: string;
  }> {
    const session = this.collaborationSessions.get(sessionId);
    if (!session) {
      throw new Error('Collaboration session not found');
    }

    if (!session.participants.includes(userId)) {
      session.participants.push(userId);
      session.updatedAt = new Date();
    }

    const channel = `collaboration:${sessionId}`;
    
    return {
      session,
      channel
    };
  }

  /**
   * Send collaboration operation
   */
  async sendCollaborationOperation(sessionId: string, operation: {
    userId: string;
    type: 'insert' | 'delete' | 'update' | 'move' | 'format';
    path: string;
    data: any;
  }): Promise<void> {
    const session = this.collaborationSessions.get(sessionId);
    if (!session) {
      throw new Error('Collaboration session not found');
    }

    const collabOp: CollaborationOperation = {
      id: this.generateOperationId(),
      userId: operation.userId,
      type: operation.type,
      path: operation.path,
      data: operation.data,
      timestamp: new Date()
    };

    // Add to session operations
    session.operations.push(collabOp);
    session.updatedAt = new Date();

    // Broadcast to collaboration channel
    const channel = `collaboration:${sessionId}`;
    const channelRef = this.presenceChannels.get(channel);
    
    if (channelRef) {
      await channelRef.send({
        type: 'broadcast',
        event: 'operation',
        payload: collabOp
      });
    }
  }

  /**
   * End collaboration session
   */
  async endCollaboration(sessionId: string): Promise<void> {
    const session = this.collaborationSessions.get(sessionId);
    if (!session) {
      throw new Error('Collaboration session not found');
    }

    try {
      // Notify participants
      await this.notifyCollaborationEnd(session);

      // Clean up channel
      const channel = `collaboration:${sessionId}`;
      const channelRef = this.presenceChannels.get(channel);
      if (channelRef) {
        await channelRef.unsubscribe();
        this.presenceChannels.delete(channel);
      }

      // Remove session
      this.collaborationSessions.delete(sessionId);
    } catch (error) {
      console.error('Failed to end collaboration session:', error);
      throw error;
    }
  }

  /**
   * Broadcast message
   */
  async broadcast(channel: string, event: string, payload: any): Promise<void> {
    if (!this.config.enableBroadcast) {
      throw new Error('Broadcast not enabled');
    }

    try {
      let channelRef = this.presenceChannels.get(channel);
      
      if (!channelRef) {
        // Create broadcast channel if it doesn't exist
        channelRef = this.realtimeClient.channel(channel);
        await channelRef.subscribe();
        this.presenceChannels.set(channel, channelRef);
      }

      await channelRef.send({
        type: 'broadcast',
        event,
        payload
      });
    } catch (error) {
      console.error('Failed to broadcast:', error);
      throw error;
    }
  }

  /**
   * Get collaboration session
   */
  async getCollaborationSession(sessionId: string): Promise<CollaborationSession | null> {
    return this.collaborationSessions.get(sessionId) || null;
  }

  /**
   * Get active collaboration sessions
   */
  async getActiveCollaborationSessions(tenantId?: string): Promise<CollaborationSession[]> {
    const sessions = Array.from(this.collaborationSessions.values());
    
    if (tenantId) {
      return sessions.filter(session => session.tenantId === tenantId);
    }
    
    return sessions;
  }

  /**
   * Get health status
   */
  async getHealthStatus(): Promise<boolean> {
    return this.initialized && this.realtimeClient?.isConnected();
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    this.initialized = false;
    
    // Unsubscribe from all channels
    for (const [channel, channelRef] of this.presenceChannels.entries()) {
      await channelRef.unsubscribe();
    }
    
    this.presenceChannels.clear();
    this.presenceState.clear();
    this.collaborationSessions.clear();
  }

  private async loadFeatures(): Promise<void> {
    // Load default features
    console.log('Loading realtime features');
  }

  private async getPresenceUsers(channel: string): Promise<PresenceUser[]> {
    try {
      const channelRef = this.presenceChannels.get(channel);
      if (!channelRef) {
        return [];
      }

      const presence = await channelRef.presence.state();
      
      return Object.entries(presence).map(([id, data]: [string, any]) => ({
        id,
        tenantId: data.tenant_id || 'default',
        onlineAt: new Date(data.online_at),
        lastSeen: new Date(data.last_seen),
        metadata: data.metadata || {},
        status: data.status || 'online'
      }));
    } catch (error) {
      console.error('Failed to get presence users:', error);
      return [];
    }
  }

  private setupCollaborationHandlers(sessionId: string, channelRef: any): void {
    // Handle collaboration events
    channelRef.on('broadcast', { event: 'operation' }, (payload: any) => {
      const session = this.collaborationSessions.get(sessionId);
      if (session) {
        session.operations.push(payload);
        session.updatedAt = new Date();
      }
    });

    channelRef.on('broadcast', { event: 'cursor' }, (payload: any) => {
      // Handle cursor movements
      console.log('Cursor movement:', payload);
    });

    channelRef.on('broadcast', { event: 'selection' }, (payload: any) => {
      // Handle text selection
      console.log('Text selection:', payload);
    });
  }

  private async notifyCollaborationStart(session: CollaborationSession): Promise<void> {
    const channel = `collaboration:${session.id}`;
    await this.broadcast(channel, 'session_started', {
      sessionId: session.id,
      type: session.type,
      participants: session.participants,
      state: session.state
    });
  }

  private async notifyCollaborationEnd(session: CollaborationSession): Promise<void> {
    const channel = `collaboration:${session.id}`;
    await this.broadcast(channel, 'session_ended', {
      sessionId: session.id,
      finalState: session.state,
      operations: session.operations
    });
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  private generateOperationId(): string {
    return `op_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
}

// Export singleton instance
export const realtimeFeatures = new RealtimeFeaturesManager();
