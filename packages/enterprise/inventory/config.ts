/**
 * Inventory Configuration - Default configurations for inventory system
 */

import { InventorySettings, TrackingMethod } from './types';

export const DEFAULT_INVENTORY_SETTINGS: InventorySettings = {
  defaultLocationId: 'main',
  lowStockAlerts: true,
  reorderAutomation: true,
  barcodeEnabled: true,
  multiLocationEnabled: false,
  trackingMethod: TrackingMethod.FIFO,
  currency: 'USD',
  taxRate: 0.08
};

export const DEFAULT_TRACKING_METHODS = {
  FIFO: 'First In, First Out',
  LIFO: 'Last In, First Out',
  AVERAGE_COST: 'Average Cost',
  SPECIFIC_COST: 'Specific Cost'
} as const;

export const DEFAULT_CURRENCY_SETTINGS = {
  USD: { symbol: '$', precision: 2 },
  EUR: { symbol: '€', precision: 2 },
  GBP: { symbol: '£', precision: 2 },
  JPY: { symbol: '¥', precision: 0 }
} as const;
