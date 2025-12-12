/**
 * Image Service
 * Handles image upload to Vercel and Airtable record creation
 */

import { uploadToBlob, uploadMultipleToBlob } from '@/lib/vercel-blob';
import { createRecords } from '@/services/airtable-service';
import type { PutBlobResult } from '@vercel/blob';

export interface ImageUploadResult {
  url: string;
  filename: string;
  size: number;
  pathname: string;
}

export interface ImageRecord {
  imageUrl: string;
  fileName: string;
  fileRecordId: string;
  uploadedDate: string;
}

/**
 * Upload a single image to Vercel Blob Storage
 * 
 * @param image - Image file to upload
 * @param pathPrefix - Optional path prefix (default: 'images/')
 * @returns Upload result with URL and metadata
 */
export async function uploadImage(
  image: File,
  pathPrefix: string = 'images/'
): Promise<ImageUploadResult> {
  console.log(`📤 Uploading image: ${image.name}`);
  
  const result = await uploadToBlob(image, `${pathPrefix}${image.name}`);
  
  console.log(`✅ Image uploaded: ${result.url}`);
  
  return {
    url: result.url,
    filename: image.name,
    size: image.size,
    pathname: result.pathname,
  };
}

/**
 * Upload multiple images to Vercel Blob Storage (batch)
 * 
 * @param images - Array of image files to upload
 * @param pathPrefix - Optional path prefix (default: 'images/')
 * @returns Array of upload results
 */
const BATCH_SIZE = 10; // Airtable limit for attachments per request

export async function uploadImages(
  images: File[],
  pathPrefix: string = 'images/'
): Promise<ImageUploadResult[]> {
  console.log(`📤 Batch uploading ${images.length} images in batches of ${BATCH_SIZE}...`);
  
  const allResults: ImageUploadResult[] = [];
  
  // Split images into batches of 10
  for (let i = 0; i < images.length; i += BATCH_SIZE) {
    const batch = images.slice(i, i + BATCH_SIZE);
    const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(images.length / BATCH_SIZE);
    
    console.log(`📦 Uploading batch ${batchNumber}/${totalBatches} (${batch.length} images)...`);
    
    try {
      // Use the batch upload function from vercel-blob
      const results = await uploadMultipleToBlob(batch, pathPrefix);
      
      const uploadResults: ImageUploadResult[] = results.map((result, index) => ({
        url: result.url,
        filename: batch[index].name,
        size: batch[index].size,
        pathname: result.pathname,
      }));
      
      allResults.push(...uploadResults);
      console.log(`✅ Batch ${batchNumber}/${totalBatches} complete`);
    } catch (error) {
      console.error(`❌ Batch ${batchNumber} upload failed:`, error);
      throw new Error(
        `Failed to upload images (batch ${batchNumber}): ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
  
  console.log(`✅ All batches complete: ${allResults.length} images uploaded`);
  
  return allResults;
}

/**
 * Create a single Image record in Airtable
 * 
 * @param imageUrl - URL of the uploaded image
 * @param fileName - Original file name
 * @param fileRecordId - Airtable record ID of the parent File
 * @returns Airtable record ID of the created Image record
 */
export async function createImageRecord(
  imageUrl: string,
  fileName: string,
  fileRecordId: string
): Promise<string> {
  console.log(`📝 Creating Image record for: ${fileName}`);
  
  const uploadedDate = new Date().toISOString().split('T')[0];
  
  try {
    const response = await createRecords('Images', {
      fields: {
        'ImageURL': imageUrl,
        'UploadedDate': uploadedDate,
        'FileID': [fileRecordId], // Link to parent File record
      },
    });
    
    const recordId = response.records[0]?.id;
    if (!recordId) {
      throw new Error('Failed to create Image record - no record ID returned');
    }
    
    console.log(`✅ Created Image record: ${recordId}`);
    return recordId;
  } catch (error) {
    console.error('❌ Failed to create Image record:', error);
    throw new Error(
      `Failed to create Image record: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Create multiple Image records in Airtable (batch)
 * 
 * @param images - Array of image data (url, fileName)
 * @param fileRecordId - Airtable record ID of the parent File
 * @returns Array of Airtable record IDs
 */
export async function createImageRecords(
  images: Array<{ url: string; fileName: string }>,
  fileRecordId: string
): Promise<string[]> {
  console.log(`📝 Batch creating ${images.length} Image records...`);
  
  const uploadedDate = new Date().toISOString().split('T')[0];
  const allRecordIds: string[] = [];
  
  // Split images into batches of 10
  for (let i = 0; i < images.length; i += BATCH_SIZE) {
    const batch = images.slice(i, i + BATCH_SIZE);
    const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(images.length / BATCH_SIZE);
    
    console.log(`📦 Creating records batch ${batchNumber}/${totalBatches} (${batch.length} records)...`);
    
    try {
      // Prepare batch records
      const records = batch.map((image) => ({
        fields: {
          'ImageURL': image.url,
          'UploadedDate': uploadedDate,
          'FileID': [fileRecordId], // Link to parent File record
        },
      }));
      
      // Create records in this batch
      const response = await createRecords('Images', {
        records,
      });
      
      const recordIds = response.records.map((record) => record.id);
      allRecordIds.push(...recordIds);
      
      console.log(`✅ Batch ${batchNumber}/${totalBatches} complete`);
    } catch (error) {
      console.error(`❌ Batch ${batchNumber} record creation failed:`, error);
      throw new Error(
        `Failed to create Image records (batch ${batchNumber}): ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
  
  if (allRecordIds.length !== images.length) {
    console.warn(
      `⚠️ Expected ${images.length} records, but got ${allRecordIds.length}`
    );
  }
  
  console.log(`✅ All batches complete: ${allRecordIds.length} Image records created`);
  return allRecordIds;
}

/**
 * Upload images to Vercel and create corresponding Airtable records (all-in-one)
 * 
 * @param images - Array of image files
 * @param fileRecordId - Airtable record ID of the parent File
 * @param pathPrefix - Optional path prefix for Vercel uploads
 * @returns Object containing upload results and Airtable record IDs
 */
export async function uploadAndCreateImageRecords(
  images: File[],
  fileRecordId: string,
  pathPrefix: string = 'images/'
): Promise<{
  uploadResults: ImageUploadResult[];
  recordIds: string[];
}> {
  console.log(
    `🚀 Starting upload and record creation for ${images.length} images...`
  );
  
  // Step 1: Batch upload images to Vercel
  const uploadResults = await uploadImages(images, pathPrefix);
  
  // Step 2: Batch create Image records in Airtable
  const imageData = uploadResults.map((result) => ({
    url: result.url,
    fileName: result.filename,
  }));
  
  const recordIds = await createImageRecords(imageData, fileRecordId);
  
  console.log(`✅ Complete: ${uploadResults.length} images uploaded and linked`);
  
  return {
    uploadResults,
    recordIds,
  };
}

