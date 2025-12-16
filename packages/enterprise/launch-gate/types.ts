/**
 * Launch Gate Types - Type definitions for launch gate system
 */

export interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'blocked';
  category: string;
  assignee?: string;
  evidence?: string;
  notes?: string;
  completedAt?: Date;
}

export interface ValidationResult {
  itemId: string;
  valid: boolean;
  message: string;
  timestamp: Date;
}

export interface LaunchGateStatus {
  canLaunch: boolean;
  blockedItems: ChecklistItem[];
  warnings: string[];
  score: number;
  lastUpdated: Date;
}
