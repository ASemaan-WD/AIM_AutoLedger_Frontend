/**
 * Vercel Blob Storage Integration
 * Direct frontend access to Vercel Blob for file uploads and downloads
 */

import { put, del, list, type PutBlobResult, type ListBlobResult } from '@vercel/blob';

/**
 * Configuration for Vercel Blob
 * Note: Several options are not supported in browser uploads due to CORS restrictions
 * - addRandomSuffix: handled manually in pathname to avoid x-add-random-suffix header
 * - cacheControlMaxAge: only works server-side
 */
export interface VercelBlobConfig {
  token?: string;
  addRandomSuffix?: boolean; // Not used in browser uploads (handled manually)
  cacheControlMaxAge?: number; // Only works server-side
}

/**
 * Get Vercel Blob token from environment
 */
function getBlobToken(): string {
  const token = import.meta.env.VITE_VERCEL_BLOB_TOKEN;
  if (!token) {
    throw new Error(
      'VITE_VERCEL_BLOB_TOKEN is required for Vercel Blob operations. ' +
      'Set it in your .env file or use the backend upload service instead.'
    );
  }
  return token;
}

/**
 * Upload a file to Vercel Blob Storage
 * 
 * @param file - File to upload
 * @param pathname - Optional custom pathname for the file
 * @param config - Additional configuration options
 * @param signal - Optional AbortSignal to cancel the upload
 * @returns Upload result with URL and metadata
 * 
 * @example
 * ```typescript
 * const file = document.querySelector('input[type="file"]').files[0];
 * const result = await uploadToBlob(file, 'invoices/invoice-123.pdf');
 * console.log('File URL:', result.url);
 * ```
 */
export async function uploadToBlob(
  file: File,
  pathname?: string,
  config: VercelBlobConfig = {},
  signal?: AbortSignal
): Promise<PutBlobResult> {
  const token = config.token || getBlobToken();
  
  // Add timestamp and random suffix to pathname to ensure uniqueness
  // (since we can't use addRandomSuffix option due to CORS)
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const timestamp = Date.now();
  const finalPathname = pathname 
    ? `${pathname.replace(/\.[^/.]+$/, '')}-${timestamp}-${randomSuffix}${pathname.match(/\.[^/.]+$/)?.[0] || ''}`
    : `uploads/${timestamp}-${randomSuffix}-${file.name}`;
  
  try {
    // Check if already aborted
    if (signal?.aborted) {
      throw new DOMException('Upload cancelled', 'AbortError');
    }

    // Note: Several options are omitted to avoid CORS issues in browser uploads
    // The Vercel Blob API doesn't allow certain headers (x-add-random-suffix, x-cache-control-max-age)
    // in CORS requests from browsers
    const result = await put(finalPathname, file, {
      access: 'public',
      token,
      // addRandomSuffix: removed to avoid CORS issues (use timestamp in pathname instead)
      // cacheControlMaxAge: can only be set server-side
      abortSignal: signal, // Pass abort signal to allow cancellation
    });
    
    return result;
  } catch (error) {
    // Check if it's an abort error
    if (error instanceof Error && error.name === 'AbortError') {
      console.log('⚠️ Upload to Vercel Blob cancelled');
      throw error; // Re-throw to propagate cancellation
    }
    
    console.error('Error uploading to Vercel Blob:', error);
    throw new Error(`Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Delete a file from Vercel Blob Storage
 * 
 * ⚠️ WARNING: This function does NOT work from the browser due to CORS restrictions!
 * The Vercel Blob API only allows delete operations from server-side code.
 * 
 * Use this function only in:
 * - Azure Functions (server-side)
 * - Backend API routes
 * - Server-side scripts
 * 
 * For frontend, you'll need to call a backend endpoint that handles the deletion.
 * 
 * @param url - URL of the blob to delete
 * @param config - Configuration with token
 * 
 * @example
 * ```typescript
 * // ❌ This will fail with CORS error in browser:
 * await deleteFromBlob('https://xxx.public.blob.vercel-storage.com/file.pdf');
 * 
 * // ✅ Instead, call your backend:
 * await fetch('/api/blob/delete', {
 *   method: 'POST',
 *   body: JSON.stringify({ url: blobUrl })
 * });
 * ```
 */
export async function deleteFromBlob(
  url: string,
  config: VercelBlobConfig = {}
): Promise<void> {
  const token = config.token || getBlobToken();
  
  console.warn(
    '⚠️  WARNING: deleteFromBlob() does not work from the browser due to CORS.',
    '\n  This should only be called from server-side code (Azure Functions).',
    '\n  URL:', url
  );
  
  try {
    await del(url, { token });
  } catch (error) {
    // Check if it's a CORS error
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      throw new Error(
        'Delete operation blocked by CORS. ' +
        'Vercel Blob delete operations must be performed server-side. ' +
        'Please implement a backend endpoint to handle blob deletions.'
      );
    }
    
    console.error('Error deleting from Vercel Blob:', error);
    throw new Error(`Failed to delete file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * List files in Vercel Blob Storage
 * 
 * @param options - Listing options (prefix, limit, cursor)
 * @param config - Configuration with token
 * @returns List of blobs
 * 
 * @example
 * ```typescript
 * // List all files with 'invoices/' prefix
 * const result = await listBlobs({ prefix: 'invoices/', limit: 100 });
 * console.log('Files:', result.blobs);
 * ```
 */
export async function listBlobs(
  options: {
    prefix?: string;
    limit?: number;
    cursor?: string;
  } = {},
  config: VercelBlobConfig = {}
): Promise<ListBlobResult> {
  const token = config.token || getBlobToken();
  
  try {
    const result = await list({
      ...options,
      token,
    });
    
    return result;
  } catch (error) {
    console.error('Error listing Vercel Blobs:', error);
    throw new Error(`Failed to list files: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Upload multiple files to Vercel Blob Storage
 * 
 * @param files - Array of files to upload
 * @param pathPrefix - Optional prefix for all file paths
 * @param config - Configuration options
 * @returns Array of upload results
 * 
 * @example
 * ```typescript
 * const files = Array.from(document.querySelector('input[type="file"]').files);
 * const results = await uploadMultipleToBlob(files, 'batch-upload/');
 * console.log(`Uploaded ${results.length} files`);
 * ```
 */
export async function uploadMultipleToBlob(
  files: File[],
  pathPrefix: string = 'uploads/',
  config: VercelBlobConfig = {}
): Promise<PutBlobResult[]> {
  const uploadPromises = files.map(file => 
    uploadToBlob(file, `${pathPrefix}${file.name}`, config)
  );
  
  try {
    const results = await Promise.all(uploadPromises);
    return results;
  } catch (error) {
    console.error('Error uploading multiple files:', error);
    throw new Error(`Failed to upload files: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Check if Vercel Blob is configured
 * @returns true if token is available
 */
export function isVercelBlobConfigured(): boolean {
  return !!import.meta.env.VITE_VERCEL_BLOB_TOKEN;
}

/**
 * Get a signed URL for a blob (if using private access)
 * Note: For public blobs, you can use the URL directly
 * 
 * @param url - Blob URL
 * @param expiresIn - Expiration time in seconds (default: 3600 = 1 hour)
 * @returns Signed URL for temporary access
 */
export async function getSignedUrl(
  url: string,
  expiresIn: number = 3600
): Promise<string> {
  // For public blobs, return the URL as-is
  // For private blobs with signing, you'd need to implement the signing logic
  // or use a backend endpoint to generate signed URLs
  
  // This is a placeholder - Vercel Blob's @vercel/blob package
  // doesn't provide client-side signing for security reasons
  // You should implement this on your backend if needed
  console.warn('Signed URLs should be generated server-side for security');
  return url;
}

