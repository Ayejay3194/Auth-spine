// Navigation Suite - Navigation components and routing logic

// Components
export { default as Sidebar } from '../components/navigation/Sidebar';
export { default as MobileNav } from '../components/navigation/MobileNav';
export { default as Notifications } from '../components/Notifications';

// Types
export interface NavigationItem {
  id: string;
  label: string;
  href: string;
  icon?: React.ReactNode;
  badge?: string;
  children?: NavigationItem[];
  requiredRole?: string[];
}

export interface NotificationItem {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  timestamp: Date;
}
