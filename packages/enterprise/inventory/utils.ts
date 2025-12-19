/**
 * Inventory Utils - Utility functions for inventory management
 */

import { Product, StockMovement, InventorySettings } from './types';

export class InventoryUtils {
  /**
   * Calculate reorder point
   */
  static calculateReorderPoint(dailyUsage: number, leadTime: number, safetyStock: number): number {
    return (dailyUsage * leadTime) + safetyStock;
  }

  /**
   * Calculate stock value
   */
  static calculateStockValue(quantity: number, cost: number): number {
    return quantity * cost;
  }

  /**
   * Generate SKU
   */
  static generateSKU(category: string, name: string): string {
    const categoryCode = category.substring(0, 3).toUpperCase();
    const nameCode = name.replace(/[^a-zA-Z0-9]/g, '').substring(0, 6).toUpperCase();
    const randomCode = Math.random().toString(36).substr(2, 4).toUpperCase();
    return `${categoryCode}-${nameCode}-${randomCode}`;
  }

  /**
   * Validate product data
   */
  static validateProduct(product: Partial<Product>): string[] {
    const errors: string[] = [];

    if (!product.name || product.name.trim().length === 0) {
      errors.push('Product name is required');
    }

    if (!product.sku || product.sku.trim().length === 0) {
      errors.push('Product SKU is required');
    }

    if (product.price !== undefined && product.price < 0) {
      errors.push('Price cannot be negative');
    }

    if (product.cost !== undefined && product.cost < 0) {
      errors.push('Cost cannot be negative');
    }

    if (product.currentStock !== undefined && product.currentStock < 0) {
      errors.push('Current stock cannot be negative');
    }

    return errors;
  }

  /**
   * Check if product is low stock
   */
  static isLowStock(product: Product): boolean {
    return product.currentStock <= product.minStockLevel;
  }

  /**
   * Check if product is out of stock
   */
  static isOutOfStock(product: Product): boolean {
    return product.currentStock === 0;
  }

  /**
   * Check if product is overstock
   */
  static isOverstock(product: Product): boolean {
    return product.currentStock >= product.maxStockLevel;
  }
}
