/**
 * Inventory System Type Definitions
 * 
 * Comprehensive type definitions for the enterprise inventory system
 * with strict typing for maximum type safety and functionality.
 */

export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  category: string;
  price: number;
  cost: number;
  currentStock: number;
  minStockLevel: number;
  maxStockLevel: number;
  reorderPoint: number;
  reorderQuantity: number;
  unit: string;
  barcode?: string;
  qrCode?: string;
  location?: string;
  supplierId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, any>;
}

export interface StockMovement {
  id: string;
  productId: string;
  type: StockMovementType;
  quantity: number;
  reference?: string;
  reason: string;
  userId: string;
  locationId?: string;
  createdAt: Date;
  metadata?: Record<string, any>;
}

export interface Location {
  id: string;
  name: string;
  address?: string;
  type: LocationType;
  isActive: boolean;
  isDefault: boolean;
  createdAt: Date;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone?: string;
  address?: string;
  leadTime: number; // days
  paymentTerms: string;
  isActive: boolean;
  products: string[]; // product IDs
  createdAt: Date;
  updatedAt: Date;
}

export interface PurchaseOrder {
  id: string;
  orderNumber: string;
  supplierId: string;
  status: PurchaseOrderStatus;
  items: PurchaseOrderItem[];
  totalAmount: number;
  expectedDeliveryDate?: Date;
  actualDeliveryDate?: Date;
  orderDate: Date;
  notes?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PurchaseOrderItem {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  expectedDeliveryDate?: Date;
  notes?: string;
}

export interface InventoryAlert {
  id: string;
  type: AlertType;
  productId: string;
  message: string;
  severity: AlertSeverity;
  isRead: boolean;
  createdAt: Date;
  resolvedAt?: Date;
}

export interface InventorySettings {
  defaultLocationId: string;
  lowStockAlerts: boolean;
  reorderAutomation: boolean;
  barcodeEnabled: boolean;
  multiLocationEnabled: boolean;
  trackingMethod: TrackingMethod;
  currency: string;
  taxRate: number;
}

export interface InventoryReport {
  id: string;
  type: ReportType;
  title: string;
  data: any;
  generatedAt: Date;
  generatedBy: string;
  parameters: Record<string, any>;
}

export interface StockCount {
  id: string;
  locationId?: string;
  status: StockCountStatus;
  items: StockCountItem[];
  countedBy: string;
  createdAt: Date;
  completedAt?: Date;
  notes?: string;
}

export interface StockCountItem {
  productId: string;
  expectedQuantity: number;
  actualQuantity: number;
  variance: number;
  notes?: string;
}

export enum StockMovementType {
  IN = 'in',
  OUT = 'out',
  ADJUSTMENT = 'adjustment',
  TRANSFER = 'transfer',
  RETURN = 'return',
  DAMAGE = 'damage',
  LOSS = 'loss'
}

export enum LocationType {
  WAREHOUSE = 'warehouse',
  STORE = 'store',
  OFFICE = 'office',
  VEHICLE = 'vehicle'
}

export enum PurchaseOrderStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  CONFIRMED = 'confirmed',
  PARTIAL_DELIVERY = 'partial_delivery',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled'
}

export enum AlertType {
  LOW_STOCK = 'low_stock',
  OUT_OF_STOCK = 'out_of_stock',
  OVERSTOCK = 'overstock',
  EXPIRING = 'expiring',
  REORDER_NEEDED = 'reorder_needed'
}

export enum AlertSeverity {
  INFO = 'info',
  WARNING = 'warning',
  CRITICAL = 'critical'
}

export enum TrackingMethod {
  FIFO = 'fifo',
  LIFO = 'lifo',
  AVERAGE_COST = 'average_cost',
  SPECIFIC_COST = 'specific_cost'
}

export enum ReportType {
  INVENTORY_VALUATION = 'inventory_valuation',
  LOW_STOCK_REPORT = 'low_stock_report',
  SALES_REPORT = 'sales_report',
  MOVEMENT_REPORT = 'movement_report',
  SUPPLIER_PERFORMANCE = 'supplier_performance',
  STOCK_COUNT_REPORT = 'stock_count_report'
}

export enum StockCountStatus {
  DRAFT = 'draft',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export interface InventoryAnalytics {
  totalProducts: number;
  totalValue: number;
  lowStockItems: number;
  outOfStockItems: number;
  overstockItems: number;
  topSellingProducts: Array<{
    productId: string;
    productName: string;
    quantity: number;
    revenue: number;
  }>;
  stockTurnover: number;
  deadStock: number;
  supplierPerformance: Array<{
    supplierId: string;
    supplierName: string;
    onTimeDelivery: number;
    qualityScore: number;
    totalOrders: number;
  }>;
  locationPerformance: Array<{
    locationId: string;
    locationName: string;
    totalValue: number;
    turnoverRate: number;
  }>;
}

export interface TransferRequest {
  id: string;
  fromLocationId: string;
  toLocationId: string;
  items: TransferItem[];
  status: TransferStatus;
  requestedBy: string;
  approvedBy?: string;
  requestedAt: Date;
  approvedAt?: Date;
  completedAt?: Date;
  notes?: string;
}

export interface TransferItem {
  productId: string;
  quantity: number;
  reason?: string;
}

export enum TransferStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  IN_TRANSIT = 'in_transit',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export interface Batch {
  id: string;
  productId: string;
  batchNumber: string;
  quantity: number;
  manufactureDate?: Date;
  expiryDate?: Date;
  supplierId?: string;
  locationId?: string;
  createdAt: Date;
}

export interface Kit {
  id: string;
  name: string;
  description: string;
  sku: string;
  components: KitComponent[];
  price: number;
  isActive: boolean;
  createdAt: Date;
}

export interface KitComponent {
  productId: string;
  quantity: number;
}
