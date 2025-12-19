/**
 * Enterprise Inventory Package
 * 
 * Comprehensive inventory management system with:
 * - Product catalog management
 * - Stock tracking and alerts
 * - Purchase order management
 * - Supplier management
 * - Inventory reporting and analytics
 * - Barcode/QR code support
 * - Multi-location inventory
 * 
 * @version 2.0.0
 * @author Auth-spine Enterprise Team
 */

export { InventoryService, StockManager } from './service';
export { ProductManager } from './products';
export { SupplierManager } from './suppliers';
export { PurchaseOrderManager } from './purchase-orders';
export { InventoryReporter } from './reporter';

// Re-export types and utilities
export * from './types';
export * from './config';
export * from './utils';

// Default exports for easy usage
export { DEFAULT_INVENTORY_SETTINGS } from './config';
export { updateStock, checkLowStock } from './helpers';
