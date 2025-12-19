// Storage Suite - Storage Solutions
// Exports storage-related functionality

// Storage Components
export { default as StorageManager } from './components/StorageManager';
export { default as FileUploader } from './components/FileUploader';
export { default as FileBrowser } from './components/FileBrowser';

// Storage Hooks
export { default as useStorage } from './hooks/useStorage';
export { default as useFileUpload } from './hooks/useFileUpload';

// Storage Services
export { default as storageService } from './services/storageService';

// Storage Types
export interface StorageProvider {
  id: string;
  name: string;
  type: 's3' | 'azure' | 'gcs' | 'local' | 'custom';
  configuration: Record<string, any>;
  buckets: StorageBucket[];
}

export interface StorageBucket {
  id: string;
  providerId: string;
  name: string;
  region: string;
  isPublic: boolean;
  size: number;
  objectCount: number;
  createdAt: Date;
}

export interface StorageFile {
  id: string;
  bucketId: string;
  name: string;
  key: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: Date;
}

// Storage Constants
export const STORAGE_PROVIDERS = {
  S3: 's3',
  AZURE: 'azure',
  GCS: 'gcs',
  LOCAL: 'local',
  CUSTOM: 'custom'
} as const;
