/**
 * Storage Policies for Supabase Advanced Features Pack
 * 
 * Provides comprehensive storage policies, signed URL management,
 * and resumable upload functionality for Supabase Storage.
 */

import { StorageEnvironment, StorageUpload } from './types.js';

export class StoragePoliciesManager {
  private supabaseClient: any;
  private policies: Map<string, any> = new Map();
  private uploads: Map<string, StorageUpload> = new Map();
  private initialized = false;

  /**
   * Initialize storage policies
   */
  async initialize(supabaseClient: any, config: any): Promise<void> {
    this.supabaseClient = supabaseClient;
    await this.loadPolicies();
    await this.createBuckets();
    this.initialized = true;
  }

  /**
   * Create signed URL for file upload/download
   */
  async createSignedUrl(bucket: string, path: string, options: {
    expiresIn?: number;
    upsert?: boolean;
    transform?: {
      width?: number;
      height?: number;
      quality?: number;
      format?: string;
    };
  } = {}): Promise<{
    signedUrl: string;
    path: string;
    expiresIn: number;
  }> {
    const expiresIn = options.expiresIn || 3600; // Default 1 hour
    const upsert = options.upsert || false;

    try {
      let signedUrl: string;
      
      if (options.transform) {
        // Create transformed image URL
        const transformParams = new URLSearchParams();
        if (options.transform.width) transformParams.append('width', options.transform.width.toString());
        if (options.transform.height) transformParams.append('height', options.transform.height.toString());
        if (options.transform.quality) transformParams.append('quality', options.transform.quality.toString());
        if (options.transform.format) transformParams.append('format', options.transform.format);

        const { data } = await this.supabaseClient.storage
          .from(bucket)
          .getPublicUrl(`${path}?${transformParams.toString()}`);
        
        signedUrl = data.publicUrl;
      } else {
        // Create regular signed URL
        const { data, error } = await this.supabaseClient.storage
          .from(bucket)
          .createSignedUrl(path, expiresIn, { upsert });
        
        if (error) throw error;
        signedUrl = data.signedUrl;
      }

      return {
        signedUrl,
        path,
        expiresIn
      };
    } catch (error) {
      console.error('Failed to create signed URL:', error);
      throw error;
    }
  }

  /**
   * Start resumable upload
   */
  async startResumableUpload(bucket: string, path: string, file: File, options: {
    chunkSize?: number;
    metadata?: Record<string, any>;
  } = {}): Promise<{
    uploadId: string;
    chunkSize: number;
    totalChunks: number;
    uploadUrls: string[];
  }> {
    const chunkSize = options.chunkSize || 5 * 1024 * 1024; // 5MB default
    const totalChunks = Math.ceil(file.size / chunkSize);
    const uploadId = this.generateUploadId();

    const upload: StorageUpload = {
      id: uploadId,
      path,
      bucket,
      contentType: file.type,
      size: file.size,
      status: 'pending',
      chunks: [],
      metadata: options.metadata || {},
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Generate upload URLs for each chunk
    const uploadUrls: string[] = [];
    for (let i = 0; i < totalChunks; i++) {
      const chunkPath = `${path}.chunks/${i}`;
      const { data, error } = await this.supabaseClient.storage
        .from(bucket)
        .createSignedUrl(chunkPath, 3600, { upsert: true });
      
      if (error) throw error;
      uploadUrls.push(data.signedUrl);

      upload.chunks.push({
        number: i,
        size: Math.min(chunkSize, file.size - i * chunkSize),
        uploaded: false,
        url: data.signedUrl
      });
    }

    this.uploads.set(uploadId, upload);

    return {
      uploadId,
      chunkSize,
      totalChunks,
      uploadUrls
    };
  }

  /**
   * Upload chunk
   */
  async uploadChunk(uploadId: string, chunkNumber: number, chunk: Blob): Promise<void> {
    const upload = this.uploads.get(uploadId);
    if (!upload) {
      throw new Error('Upload not found');
    }

    const chunkInfo = upload.chunks.find(c => c.number === chunkNumber);
    if (!chunkInfo) {
      throw new Error('Chunk not found');
    }

    try {
      const response = await fetch(chunkInfo.url!, {
        method: 'PUT',
        body: chunk,
        headers: {
          'Content-Type': 'application/octet-stream'
        }
      });

      if (!response.ok) {
        throw new Error('Chunk upload failed');
      }

      chunkInfo.uploaded = true;
      upload.updatedAt = new Date();

      // Check if all chunks are uploaded
      if (upload.chunks.every(c => c.uploaded)) {
        await this.completeResumableUpload(uploadId);
      }
    } catch (error) {
      console.error('Failed to upload chunk:', error);
      throw error;
    }
  }

  /**
   * Complete resumable upload
   */
  async completeResumableUpload(uploadId: string): Promise<void> {
    const upload = this.uploads.get(uploadId);
    if (!upload) {
      throw new Error('Upload not found');
    }

    try {
      // Combine chunks into final file
      await this.combineChunks(upload);
      
      upload.status = 'completed';
      upload.updatedAt = new Date();

      // Clean up chunk files
      await this.cleanupChunks(upload);
    } catch (error) {
      upload.status = 'failed';
      throw error;
    }
  }

  /**
   * Create storage policy
   */
  async createPolicy(policy: {
    bucket: string;
    name: string;
    definition: string;
    operations: string[];
    roles: string[];
  }): Promise<void> {
    const sql = `
      CREATE POLICY "${policy.name}" ON storage.objects
      FOR ${policy.operations.join(', ')}
      TO ${policy.roles.join(', ')}
      USING (${policy.definition});
    `;

    try {
      await this.supabaseClient.rpc('exec_sql', { sql });
      console.log(`Storage policy created: ${policy.name}`);
    } catch (error) {
      console.error(`Failed to create storage policy ${policy.name}:`, error);
      throw error;
    }
  }

  /**
   * Get upload status
   */
  async getUploadStatus(uploadId: string): Promise<StorageUpload | null> {
    return this.uploads.get(uploadId) || null;
  }

  /**
   * Cancel upload
   */
  async cancelUpload(uploadId: string): Promise<void> {
    const upload = this.uploads.get(uploadId);
    if (!upload) {
      throw new Error('Upload not found');
    }

    upload.status = 'failed';
    await this.cleanupChunks(upload);
    this.uploads.delete(uploadId);
  }

  /**
   * Get storage statistics
   */
  async getStorageStats(): Promise<{
    totalSize: number;
    fileCount: number;
    bucketStats: Array<{
      bucket: string;
      size: number;
      fileCount: number;
    }>;
  }> {
    const sql = `
      SELECT 
        bucket_id,
        SUM(file_size) as total_size,
        COUNT(*) as file_count
      FROM storage.objects
      GROUP BY bucket_id;
    `;

    try {
      const { data, error } = await this.supabaseClient.rpc('exec_sql', { sql });
      if (error) throw error;

      const bucketStats = data || [];
      const totalSize = bucketStats.reduce((sum: number, stat: any) => sum + stat.total_size, 0);
      const fileCount = bucketStats.reduce((sum: number, stat: any) => sum + stat.file_count, 0);

      return {
        totalSize,
        fileCount,
        bucketStats: bucketStats.map((stat: any) => ({
          bucket: stat.bucket_id,
          size: stat.total_size,
          fileCount: stat.file_count
        }))
      };
    } catch (error) {
      console.error('Failed to get storage stats:', error);
      return {
        totalSize: 0,
        fileCount: 0,
        bucketStats: []
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
-- Supabase Advanced Features - Storage Policies
-- Generated on ${new Date().toISOString()}

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('documents', 'documents', false, 52428800, ARRAY['application/pdf', 'text/plain', 'application/msword']),
  ('media', 'media', false, 104857600, ARRAY['video/mp4', 'audio/mpeg', 'image/gif'])
ON CONFLICT (id) DO NOTHING;

-- Avatar storage policies
CREATE POLICY "Users can upload their own avatar" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'avatars' AND 
  auth.role() = 'authenticated' AND 
  (storage.foldername(name))[1] = auth.uid()
);

CREATE POLICY "Users can view their own avatar" ON storage.objects
FOR SELECT USING (
  bucket_id = 'avatars' AND 
  (storage.foldername(name))[1] = auth.uid()
);

CREATE POLICY "Users can update their own avatar" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'avatars' AND 
  (storage.foldername(name))[1] = auth.uid()
);

CREATE POLICY "Users can delete their own avatar" ON storage.objects
FOR DELETE USING (
  bucket_id = 'avatars' AND 
  (storage.foldername(name))[1] = auth.uid()
);

-- Public avatar access policy
CREATE POLICY "Public avatar access" ON storage.objects
FOR SELECT USING (
  bucket_id = 'avatars' AND 
  name LIKE '%/public/%'
);

-- Document storage policies
CREATE POLICY "Users can upload documents" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'documents' AND 
  auth.role() = 'authenticated' AND 
  (storage.foldername(name))[1] = auth.uid()
);

CREATE POLICY "Users can view their own documents" ON storage.objects
FOR SELECT USING (
  bucket_id = 'documents' AND 
  (storage.foldername(name))[1] = auth.uid()
);

CREATE POLICY "Users can update their own documents" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'documents' AND 
  (storage.foldername(name))[1] = auth.uid()
);

CREATE POLICY "Users can delete their own documents" ON storage.objects
FOR DELETE USING (
  bucket_id = 'documents' AND 
  (storage.foldername(name))[1] = auth.uid()
);

-- Media storage policies
CREATE POLICY "Users can upload media" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'media' AND 
  auth.role() = 'authenticated' AND 
  (storage.foldername(name))[1] = auth.uid()
);

CREATE POLICY "Users can view their own media" ON storage.objects
FOR SELECT USING (
  bucket_id = 'media' AND 
  (storage.foldername(name))[1] = auth.uid()
);

CREATE POLICY "Users can update their own media" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'media' AND 
  (storage.foldername(name))[1] = auth.uid()
);

CREATE POLICY "Users can delete their own media" ON storage.objects
FOR DELETE USING (
  bucket_id = 'media' AND 
  (storage.foldername(name))[1] = auth.uid()
);

-- Admin access policies
CREATE POLICY "Admins have full access to storage" ON storage.objects
FOR ALL USING (
  auth.role() = 'service_role'
);

-- Storage helper functions
CREATE OR REPLACE FUNCTION storage.foldername(path text)
RETURNS text[] AS $$
BEGIN
  RETURN string_to_array(path, '/');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION storage.filename(path text)
RETURNS text AS $$
BEGIN
  RETURN substring(path from '(\\\\/[^\\\\/]*$)');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION storage.file_extension(path text)
RETURNS text AS $$
BEGIN
  RETURN substring(path from '\\\\.([^.\\\\/]+)$');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION storage.is_image(path text)
RETURNS boolean AS $$
BEGIN
  RETURN storage.file_extension(path) IN ('jpg', 'jpeg', 'png', 'gif', 'webp', 'svg');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION storage.is_document(path text)
RETURNS boolean AS $$
BEGIN
  RETURN storage.file_extension(path) IN ('pdf', 'doc', 'docx', 'txt', 'rtf');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION storage.is_video(path text)
RETURNS boolean AS $$
BEGIN
  RETURN storage.file_extension(path) IN ('mp4', 'avi', 'mov', 'wmv', 'flv', 'webm');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION storage.is_audio(path text)
RETURNS boolean AS $$
BEGIN
  RETURN storage.file_extension(path) IN ('mp3', 'wav', 'ogg', 'flac', 'aac');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Storage quota functions
CREATE OR REPLACE FUNCTION storage.get_user_usage(user_id uuid)
RETURNS TABLE(
  bucket text,
  file_count bigint,
  total_size bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    bucket_id,
    COUNT(*) as file_count,
    SUM(file_size) as total_size
  FROM storage.objects
  WHERE (storage.foldername(name))[1] = user_id
  GROUP BY bucket_id
  ORDER BY total_size DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION storage.check_user_quota(user_id uuid, bucket text, additional_size bigint)
RETURNS boolean AS $$
DECLARE
  current_usage bigint;
  quota_limit bigint;
BEGIN
  -- Get current usage for the user
  SELECT COALESCE(SUM(file_size), 0) INTO current_usage
  FROM storage.objects
  WHERE (storage.foldername(name))[1] = user_id AND bucket_id = bucket;
  
  -- Get quota limit (default 100MB per user)
  SELECT COALESCE(metadata->>'quota_limit', '104857600')::bigint INTO quota_limit
  FROM auth.users
  WHERE id = user_id;
  
  RETURN (current_usage + additional_size) <= quota_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Storage cleanup functions
CREATE OR REPLACE FUNCTION storage.cleanup_orphaned_files()
RETURNS TABLE(
  deleted_files bigint,
  freed_space bigint
) AS $$
DECLARE
  deleted_count bigint;
  freed_space_bytes bigint;
BEGIN
  -- Delete files that don't have corresponding user records
  DELETE FROM storage.objects
  WHERE (storage.foldername(name))[1] NOT IN (
    SELECT id FROM auth.users WHERE id IS NOT NULL
  );
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  -- Calculate freed space (approximate)
  SELECT COALESCE(SUM(file_size), 0) INTO freed_space_bytes
  FROM storage.objects
  WHERE (storage.foldername(name))[1] NOT IN (
    SELECT id FROM auth.users WHERE id IS NOT NULL
  );
  
  RETURN QUERY SELECT deleted_count, freed_space_bytes;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION storage.cleanup_temp_files(older_than_hours integer DEFAULT 24)
RETURNS TABLE(
  deleted_files bigint,
  freed_space bigint
) AS $$
DECLARE
  deleted_count bigint;
  freed_space_bytes bigint;
BEGIN
  -- Delete temporary files older than specified hours
  DELETE FROM storage.objects
  WHERE name LIKE 'temp/%' 
    AND created_at < NOW() - INTERVAL '1 hour' * older_than_hours;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  -- Calculate freed space
  SELECT COALESCE(SUM(file_size), 0) INTO freed_space_bytes
  FROM storage.objects
  WHERE name LIKE 'temp/%' 
    AND created_at < NOW() - INTERVAL '1 hour' * older_than_hours;
  
  RETURN QUERY SELECT deleted_count, freed_space_bytes;
END;
$$ LANGUAGE plpgsql;

-- Storage analytics views
CREATE OR REPLACE VIEW storage_usage_overview AS
SELECT 
  bucket_id,
  COUNT(*) as file_count,
  SUM(file_size) as total_size,
  AVG(file_size) as avg_file_size,
  MAX(file_size) as max_file_size,
  MIN(created_at) as oldest_file,
  MAX(created_at) as newest_file
FROM storage.objects
GROUP BY bucket_id
ORDER BY total_size DESC;

CREATE OR REPLACE VIEW storage_user_usage AS
SELECT 
  (storage.foldername(name))[1] as user_id,
  bucket_id,
  COUNT(*) as file_count,
  SUM(file_size) as total_size,
  MIN(created_at) as first_upload,
  MAX(created_at) as last_upload
FROM storage.objects
WHERE (storage.foldername(name))[1] IS NOT NULL
GROUP BY user_id, bucket_id
ORDER BY total_size DESC;

CREATE OR REPLACE VIEW storage_file_types AS
SELECT 
  storage.file_extension(name) as file_extension,
  bucket_id,
  COUNT(*) as file_count,
  SUM(file_size) as total_size,
  AVG(file_size) as avg_file_size
FROM storage.objects
WHERE storage.file_extension(name) IS NOT NULL
GROUP BY storage.file_extension(name), bucket_id
ORDER BY file_count DESC;

-- Storage transformation functions
CREATE OR REPLACE FUNCTION storage.generate_thumbnail_url(
  bucket text,
  path text,
  width integer DEFAULT 200,
  height integer DEFAULT 200,
  quality integer DEFAULT 80
)
RETURNS text AS $$
BEGIN
  RETURN format('%s/render/image/%s/%s?width=%s&height=%s&quality=%s',
    current_setting('app.supabase_url', true),
    bucket,
    path,
    width,
    height,
    quality
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION storage.generate_video_preview_url(
  bucket text,
  path text,
  width integer DEFAULT 640,
  height integer DEFAULT 360
)
RETURNS text AS $$
BEGIN
  RETURN format('%s/render/video/%s/%s?width=%s&height=%s',
    current_setting('app.supabase_url', true),
    bucket,
    path,
    width,
    height
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Grant permissions
GRANT SELECT ON storage_usage_overview TO authenticated;
GRANT SELECT ON storage_user_usage TO authenticated;
GRANT SELECT ON storage_file_types TO authenticated;
GRANT EXECUTE ON FUNCTION storage.get_user_usage(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION storage.check_user_quota(uuid, text, bigint) TO authenticated;
GRANT EXECUTE ON FUNCTION storage.generate_thumbnail_url(text, text, integer, integer, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION storage.generate_video_preview_url(text, text, integer, integer) TO authenticated;

-- Grant admin permissions
GRANT ALL ON storage_usage_overview TO service_role;
GRANT ALL ON storage_user_usage TO service_role;
GRANT ALL ON storage_file_types TO service_role;
GRANT EXECUTE ON FUNCTION storage.cleanup_orphaned_files() TO service_role;
GRANT EXECUTE ON FUNCTION storage.cleanup_temp_files(integer) TO service_role;
`;
  }

  private async createBuckets(): Promise<void> {
    const buckets = [
      { id: 'avatars', name: 'avatars', public: true, fileSizeLimit: 5242880 },
      { id: 'documents', name: 'documents', public: false, fileSizeLimit: 52428800 },
      { id: 'media', name: 'media', public: false, fileSizeLimit: 104857600 }
    ];

    for (const bucket of buckets) {
      try {
        await this.supabaseClient.storage.createBucket(bucket.id, {
          public: bucket.public,
          fileSizeLimit: bucket.fileSizeLimit,
          allowedMimeTypes: this.getAllowedMimeTypes(bucket.id)
        });
      } catch (error) {
        // Bucket might already exist
        console.log(`Bucket ${bucket.id} might already exist`);
      }
    }
  }

  private getAllowedMimeTypes(bucketId: string): string[] {
    const mimeTypes = {
      avatars: ['image/jpeg', 'image/png', 'image/webp'],
      documents: ['application/pdf', 'text/plain', 'application/msword'],
      media: ['video/mp4', 'audio/mpeg', 'image/gif']
    };
    return mimeTypes[bucketId as keyof typeof mimeTypes] || [];
  }

  private async combineChunks(upload: StorageUpload): Promise<void> {
    // This would combine uploaded chunks into the final file
    // In a real implementation, this would use the storage provider's API
    console.log(`Combining chunks for upload: ${upload.id}`);
  }

  private async cleanupChunks(upload: StorageUpload): Promise<void> {
    // Clean up temporary chunk files
    for (const chunk of upload.chunks) {
      const chunkPath = `${upload.path}.chunks/${chunk.number}`;
      try {
        await this.supabaseClient.storage
          .from(upload.bucket)
          .remove([chunkPath]);
      } catch (error) {
        console.warn(`Failed to cleanup chunk ${chunk.number}:`, error);
      }
    }
  }

  private loadPolicies(): void {
    // Load default policies
    const defaultPolicies = [
      {
        bucket: 'avatars',
        name: 'Users can upload their own avatar',
        definition: "bucket_id = 'avatars' AND auth.role() = 'authenticated' AND (storage.foldername(name))[1] = auth.uid()",
        operations: ['INSERT'],
        roles: ['authenticated']
      },
      {
        bucket: 'documents',
        name: 'Users can upload documents',
        definition: "bucket_id = 'documents' AND auth.role() = 'authenticated' AND (storage.foldername(name))[1] = auth.uid()",
        operations: ['INSERT'],
        roles: ['authenticated']
      }
    ];

    defaultPolicies.forEach(policy => {
      this.policies.set(policy.name, policy);
    });
  }

  private generateUploadId(): string {
    return `upload_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
}

// Export singleton instance
export const storagePolicies = new StoragePoliciesManager();
