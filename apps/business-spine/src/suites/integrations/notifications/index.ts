// Notifications Suite - Notification Systems
// Exports notification-related functionality

// Notification Components
export { default as NotificationCenter } from './components/NotificationCenter';
export { default as NotificationSettings } from './components/NotificationSettings';
export { default as NotificationTemplate } from './components/NotificationTemplate';

// Notification Hooks
export { default as useNotifications } from './hooks/useNotifications';
export { default as useNotificationSettings } from './hooks/useNotificationSettings';

// Notification Services
export { default as notificationService } from './services/notificationService';

// Notification Types
export interface NotificationChannel {
  id: string;
  type: 'email' | 'sms' | 'push' | 'webhook' | 'slack';
  name: string;
  configuration: Record<string, any>;
  isActive: boolean;
  templates: NotificationTemplate[];
}

export interface NotificationTemplate {
  id: string;
  channelId: string;
  name: string;
  subject?: string;
  body: string;
  variables: string[];
}

export interface NotificationMessage {
  id: string;
  channelId: string;
  recipient: string;
  subject?: string;
  body: string;
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  sentAt?: Date;
  deliveredAt?: Date;
}

// Notification Constants
export const NOTIFICATION_CHANNELS = {
  EMAIL: 'email',
  SMS: 'sms',
  PUSH: 'push',
  WEBHOOK: 'webhook',
  SLACK: 'slack'
} as const;

export const NOTIFICATION_STATUS = {
  PENDING: 'pending',
  SENT: 'sent',
  DELIVERED: 'delivered',
  FAILED: 'failed'
} as const;
