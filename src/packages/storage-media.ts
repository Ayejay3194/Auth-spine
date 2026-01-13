/**
 * Storage and Media for Supabase SaaS Features Pack
 * 
 * Provides multi-tenant storage, CDN integration, and
 * media transformation capabilities.
 */

import { StorageConfiguration, StoragePolicy } from './types.js';

export class StorageMediaManager {
  private supabaseClient: any;
  private config: StorageConfiguration;
  private initialized = false;

  /**
   * Initialize storage and media
   */
  async initialize(supabaseClient: any, config: any): Promise<void> {
    this.supabaseClient = supabaseClient;
    this.config = {
      multiTenant: config.enableMultiTenant || true,
      cdn: {
        enabled: config.enableCDN || true,
        provider: 'cloudflare',
        distribution: undefined
      },
      transformations: {
        enabled: config.enableTransformations || true,
        formats: ['webp', 'avif', 'jpg', 'png'],
        sizes: [
          { width: 100, height: 100 },
          { width: 200, height: 200 },
          { width: 400, height: 400 },
          { width: 800, height: 800 }
        ]
      },
      buckets: []
    };
    
    await this.setupBuckets();
    await this.setupCDN();
    this.initialized = true;
  }

  /**
   * Upload file to tenant storage
   */
  async uploadFile(tenantId: string, file: File, options: {
    path?: string;
    bucket?: string;
    transform?: {
      width?: number;
      height?: number;
      format?: string;
      quality?: number;
    };
  } = {}): Promise<{
    path: string;
    url: string;
    size: number;
    mimeType: string;
  }> {
    if (!this.config.multiTenant) {
      throw new Error('Multi-tenant storage not enabled');
    }

    const bucket = options.bucket || 'tenant-files';
    const path = options.path || `${tenantId}/${Date.now()}_${file.name}`;
    
    try {
      // Transform file if requested
      let uploadFile = file;
      if (options.transform) {
        uploadFile = await this.transformFile(file, options.transform);
      }

      // Upload to tenant bucket
      const { data, error } = await this.supabaseClient.storage
        .from(bucket)
        .upload(path, uploadFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = await this.supabaseClient.storage
        .from(bucket)
        .getPublicUrl(path);

      return {
        path: data.path,
        url: this.applyCDN(publicUrl),
        size: file.size,
        mimeType: file.type
      };
    } catch (error) {
      console.error('Failed to upload file:', error);
      throw error;
    }
  }

  /**
   * Get file URL
   */
  async getFileUrl(tenantId: string, path: string, options: {
    bucket?: string;
    signed?: boolean;
    expiresIn?: number;
    transform?: {
      width?: number;
      height?: number;
      format?: string;
      quality?: number;
    };
  } = {}): Promise<string> {
    const bucket = options.bucket || 'tenant-files';
    
    try {
      let url: string;
      
      if (options.signed) {
        const expiresIn = options.expiresIn || 3600;
        const { data, error } = await this.supabaseClient.storage
          .from(bucket)
          .createSignedUrl(path, expiresIn);
        
        if (error) throw error;
        url = data.signedUrl;
      } else {
        const { data: { publicUrl } } = await this.supabaseClient.storage
          .from(bucket)
          .getPublicUrl(path);
        url = publicUrl;
      }

      // Apply transformations if requested
      if (options.transform) {
        url = this.applyTransformation(url, options.transform);
      }

      return this.applyCDN(url);
    } catch (error) {
      console.error('Failed to get file URL:', error);
      throw error;
    }
  }

  /**
   * Delete file
   */
  async deleteFile(tenantId: string, path: string, options: {
    bucket?: string;
  } = {}): Promise<void> {
    const bucket = options.bucket || 'tenant-files';
    
    try {
      const { error } = await this.supabaseClient.storage
        .from(bucket)
        .remove([path]);

      if (error) throw error;
    } catch (error) {
      console.error('Failed to delete file:', error);
      throw error;
    }
  }

  /**
   * List files
   */
  async listFiles(tenantId: string, options: {
    bucket?: string;
    folder?: string;
    limit?: number;
    offset?: number;
    search?: string;
  } = {}): Promise<{
    files: Array<{
      name: string;
      path: string;
      size: number;
      mimeType: string;
      createdAt: Date;
      url: string;
    }>;
    total: number;
  }> {
    const bucket = options.bucket || 'tenant-files';
    const folder = options.folder || tenantId;
    
    try {
      // List files from storage
      const { data, error } = await this.supabaseClient.storage
        .from(bucket)
        .list(folder, {
          limit: options.limit || 100,
          offset: options.offset || 0,
          search: options.search
        });

      if (error) throw error;

      const files = await Promise.all((data || []).map(async (file: any) => {
        const url = await this.getFileUrl(tenantId, file.name, { bucket });
        return {
          name: file.name,
          path: file.id,
          size: file.metadata?.size || 0,
          mimeType: file.metadata?.mimetype || 'application/octet-stream',
          createdAt: new Date(file.created_at),
          url
        };
      }));

      return {
        files,
        total: files.length
      };
    } catch (error) {
      console.error('Failed to list files:', error);
      throw error;
    }
  }

  /**
   * Create storage bucket
   */
  async createBucket(bucketData: {
    name: string;
    public?: boolean;
    tenantIsolated?: boolean;
    fileSizeLimit?: number;
    allowedMimeTypes?: string[];
  }): Promise<void> {
    try {
      const { error } = await this.supabaseClient.storage.createBucket(bucketData.name, {
        public: bucketData.public || false,
        fileSizeLimit: bucketData.fileSizeLimit || 52428800, // 50MB default
        allowedMimeTypes: bucketData.allowedMimeTypes
      });

      if (error) throw error;

      // Add to configuration
      this.config.buckets.push({
        name: bucketData.name,
        public: bucketData.public || false,
        tenantIsolated: bucketData.tenantIsolated || true,
        policies: []
      });
    } catch (error) {
      console.error('Failed to create bucket:', error);
      throw error;
    }
  }

  /**
   * Apply transformations
   */
  async applyTransformations(tenantId: string, path: string, transformations: Array<{
    width?: number;
    height?: number;
    format?: string;
    quality?: number;
  }>): Promise<string[]> {
    const urls: string[] = [];
    
    for (const transform of transformations) {
      const url = await this.getFileUrl(tenantId, path, { transform });
      urls.push(url);
    }
    
    return urls;
  }

  /**
   * Get storage usage
   */
  async getStorageUsage(tenantId?: string): Promise<{
    totalSize: number;
    fileCount: number;
    bucketUsage: Array<{
      bucket: string;
      size: number;
      files: number;
    }>;
  }> {
    try {
      // Get usage from database or storage API
      const bucketUsage = await Promise.all(
        this.config.buckets.map(async (bucket) => {
          return {
            bucket: bucket.name,
            size: Math.floor(Math.random() * 1000000000), // Mock data
            files: Math.floor(Math.random() * 1000) // Mock data
          };
        })
      );

      const totalSize = bucketUsage.reduce((sum, bucket) => sum + bucket.size, 0);
      const fileCount = bucketUsage.reduce((sum, bucket) => sum + bucket.files, 0);

      return {
        totalSize,
        fileCount,
        bucketUsage
      };
    } catch (error) {
      console.error('Failed to get storage usage:', error);
      return {
        totalSize: 0,
        fileCount: 0,
        bucketUsage: []
      };
    }
  }

  /**
   * Get health status
   */
  async getHealthStatus(): Promise<boolean> {
    return this.initialized;
  }

  /**
   * Generate SQL scripts
   */
  generateSQL(): string {
    return `
-- Supabase SaaS Features - Storage and Media
-- Generated on ${new Date().toISOString()}

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('tenant-files', 'tenant-files', false, 52428800, ARRAY['image/*', 'application/pdf', 'text/*']),
  ('public-assets', 'public-assets', true, 10485760, ARRAY['image/*', 'text/css', 'application/javascript']),
  ('temp-uploads', 'temp-uploads', false, 104857600, ARRAY['*'])
ON CONFLICT (id) DO NOTHING;

-- Storage policies for tenant isolation
CREATE POLICY "Tenants can upload to their own folder" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'tenant-files' AND 
  (storage.foldername(name))[1] = current_setting('app.current_tenant_id', true)
);

CREATE POLICY "Tenants can read their own files" ON storage.objects
FOR SELECT USING (
  bucket_id = 'tenant-files' AND 
  (storage.foldername(name))[1] = current_setting('app.current_tenant_id', true)
);

CREATE POLICY "Tenants can update their own files" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'tenant-files' AND 
  (storage.foldername(name))[1] = current_setting('app.current_tenant_id', true)
);

CREATE POLICY "Tenants can delete their own files" ON storage.objects
FOR DELETE USING (
  bucket_id = 'tenant-files' AND 
  (storage.foldername(name))[1] = current_setting('app.current_tenant_id', true)
);

-- Public assets policies
CREATE POLICY "Public assets are publicly readable" ON storage.objects
FOR SELECT USING (
  bucket_id = 'public-assets'
);

CREATE POLICY "Authenticated users can upload public assets" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'public-assets' AND 
  auth.role() = 'authenticated'
);

-- Temporary uploads policies
CREATE POLICY "Users can upload to temp folder" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'temp-uploads' AND 
  auth.role() = 'authenticated'
);

CREATE POLICY "Users can read their own temp files" ON storage.objects
FOR SELECT USING (
  bucket_id = 'temp-uploads' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their own temp files" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'temp-uploads' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own temp files" ON storage.objects
FOR DELETE USING (
  bucket_id = 'temp-uploads' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Service role has full access
CREATE POLICY "Service role has full storage access" ON storage.objects
FOR ALL USING (auth.role() = 'service_role');

-- Storage metadata table
CREATE TABLE IF NOT EXISTS storage_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  bucket_id TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, file_path, bucket_id)
);

-- Indexes for storage metadata
CREATE INDEX IF NOT EXISTS idx_storage_metadata_tenant_id ON storage_metadata(tenant_id);
CREATE INDEX IF NOT EXISTS idx_storage_metadata_bucket_id ON storage_metadata(bucket_id);
CREATE INDEX IF NOT EXISTS idx_storage_metadata_file_path ON storage_metadata(file_path);
CREATE INDEX IF NOT EXISTS idx_storage_metadata_tags ON storage_metadata USING GIN(tags);

-- Row Level Security for storage metadata
ALTER TABLE storage_metadata ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenants can view their own storage metadata" ON storage_metadata
FOR SELECT USING (tenant_id = current_setting('app.current_tenant_id', true)::UUID);

CREATE POLICY "Tenants can insert their own storage metadata" ON storage_metadata
FOR INSERT WITH CHECK (tenant_id = current_setting('app.current_tenant_id', true)::UUID);

CREATE POLICY "Tenants can update their own storage metadata" ON storage_metadata
FOR UPDATE USING (tenant_id = current_setting('app.current_tenant_id', true)::UUID);

CREATE POLICY "Tenants can delete their own storage metadata" ON storage_metadata
FOR DELETE USING (tenant_id = current_setting('app.current_tenant_id', true)::UUID);

CREATE POLICY "Service role has full access to storage metadata" ON storage_metadata
FOR ALL USING (auth.role() = 'service_role');

-- Storage transformation functions
CREATE OR REPLACE FUNCTION get_transformed_url(
  bucket_id TEXT,
  file_path TEXT,
  transformations JSONB DEFAULT '{}'
)
RETURNS TEXT AS $$
DECLARE
  base_url TEXT;
  transform_params TEXT;
BEGIN
  -- Get base URL
  SELECT public_url INTO base_url
  FROM storage.objects
  WHERE bucket_id = get_transformed_url.bucket_id AND name = get_transformed_url.file_path;
  
  -- Build transformation parameters
  transform_params := '';
  
  IF transformations ? 'width' THEN
    transform_params := transform_params || '&width=' || (transformations->>'width');
  END IF;
  
  IF transformations ? 'height' THEN
    transform_params := transform_params || '&height=' || (transformations->>'height');
  END IF;
  
  IF transformations ? 'format' THEN
    transform_params := transform_params || '&format=' || (transformations->>'format');
  END IF;
  
  IF transformations ? 'quality' THEN
    transform_params := transform_params || '&quality=' || (transformations->>'quality');
  END IF;
  
  -- Return transformed URL
  IF transform_params != '' THEN
    RETURN base_url || '?transform=' || substring(transform_params, 2);
  ELSE
    RETURN base_url;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Storage cleanup function
CREATE OR REPLACE FUNCTION cleanup_temp_storage()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Delete temp files older than 24 hours
  DELETE FROM storage.objects
  WHERE bucket_id = 'temp-uploads'
    AND created_at < NOW() - INTERVAL '24 hours';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  -- Clean up metadata
  DELETE FROM storage_metadata
  WHERE bucket_id = 'temp-uploads'
    AND created_at < NOW() - INTERVAL '24 hours';
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Schedule cleanup job
SELECT cron.schedule('storage-cleanup', '0 */6 * * *', 'SELECT cleanup_temp_storage();');

-- Storage usage tracking function
CREATE OR REPLACE FUNCTION track_storage_usage(
  tenant_id UUID,
  file_path TEXT,
  bucket_id TEXT,
  file_size BIGINT
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO storage_usage_logs (tenant_id, file_path, bucket_id, file_size, created_at)
  VALUES (tenant_id, file_path, bucket_id, file_size, NOW())
  ON CONFLICT (tenant_id, file_path, bucket_id) 
  DO UPDATE SET 
    file_size = EXCLUDED.file_size,
    created_at = EXCLUDED.created_at;
END;
$$ LANGUAGE plpgsql;

-- Storage usage logs table
CREATE TABLE IF NOT EXISTS storage_usage_logs (
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  bucket_id TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (tenant_id, file_path, bucket_id)
);

-- Index for usage logs
CREATE INDEX IF NOT EXISTS idx_storage_usage_logs_tenant_id ON storage_usage_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_storage_usage_logs_created_at ON storage_usage_logs(created_at);

-- Grant permissions
GRANT SELECT ON storage_metadata TO authenticated;
GRANT INSERT ON storage_metadata TO authenticated;
GRANT UPDATE ON storage_metadata TO authenticated;
GRANT DELETE ON storage_metadata TO authenticated;

GRANT SELECT ON storage_usage_logs TO authenticated;
GRANT INSERT ON storage_usage_logs TO authenticated;

GRANT ALL ON storage_metadata TO service_role;
GRANT ALL ON storage_usage_logs TO service_role;

GRANT EXECUTE ON FUNCTION get_transformed_url(TEXT, TEXT, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION track_storage_usage(UUID, TEXT, TEXT, BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_temp_storage() TO service_role;
`;
  }

  private async setupBuckets(): Promise<void> {
    const defaultBuckets = [
      { name: 'tenant-files', public: false, tenantIsolated: true },
      { name: 'public-assets', public: true, tenantIsolated: false },
      { name: 'temp-uploads', public: false, tenantIsolated: false }
    ];

    for (const bucket of defaultBuckets) {
      try {
        await this.createBucket(bucket);
      } catch (error) {
        console.log(`Bucket ${bucket.name} might already exist`);
      }
    }
  }

  private async setupCDN(): Promise<void> {
    if (!this.config.cdn.enabled) {
      return;
    }

    // Setup CDN configuration based on provider
    switch (this.config.cdn.provider) {
      case 'cloudflare':
        await this.setupCloudflareCDN();
        break;
      case 'cloudfront':
        await this.setupCloudFrontCDN();
        break;
      case 'fastly':
        await this.setupFastlyCDN();
        break;
    }
  }

  private async setupCloudflareCDN(): Promise<void> {
    console.log('Setting up Cloudflare CDN');
  }

  private async setupCloudFrontCDN(): Promise<void> {
    console.log('Setting up CloudFront CDN');
  }

  private async setupFastlyCDN(): Promise<void> {
    console.log('Setting up Fastly CDN');
  }

  private async transformFile(file: File, options: {
    width?: number;
    height?: number;
    format?: string;
    quality?: number;
  }): Promise<File> {
    // In a real implementation, this would use image processing
    // For now, return the original file
    return file;
  }

  private applyCDN(url: string): string {
    if (!this.config.cdn.enabled || !this.config.cdn.distribution) {
      return url;
    }

    // Apply CDN domain transformation
    return url.replace(
      /https?:\/\/[^\/]+/,
      `https://${this.config.cdn.distribution}.cdn.net`
    );
  }

  private applyTransformation(url: string, options: {
    width?: number;
    height?: number;
    format?: string;
    quality?: number;
  }): string {
    const params = new URLSearchParams();
    
    if (options.width) params.append('width', options.width.toString());
    if (options.height) params.append('height', options.height.toString());
    if (options.format) params.append('format', options.format);
    if (options.quality) params.append('quality', options.quality.toString());
    
    const paramString = params.toString();
    return paramString ? `${url}?${paramString}` : url;
  }
}

// Export singleton instance
export const storageMedia = new StorageMediaManager();
