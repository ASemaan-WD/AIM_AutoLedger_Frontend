/**
 * SubFile Service
 * Handles PDF subfile upload to Vercel and Airtable record creation
 */

import { uploadToBlob, uploadMultipleToBlob } from '@/lib/vercel-blob';
import { createRecords } from '@/services/airtable-service';

export interface SubFileUploadResult {
  url: string;
  filename: string;
  size: number;
  pathname: string;
}

export interface SubFileRecord {
  fileUrl: string;
  fileName: string;
  parentFileRecordId: string;
  uploadedDate: string;
}

/**
 * Upload a single PDF subfile to Vercel Blob Storage
 * 
 * @param pdfFile - PDF file to upload
 * @param pathPrefix - Optional path prefix (default: 'subfiles/')
 * @returns Upload result with URL and metadata
 */
export async function uploadSubFile(
  pdfFile: File,
  pathPrefix: string = 'subfiles/'
): Promise<SubFileUploadResult> {
  console.log(`📤 Uploading subfile: ${pdfFile.name}`);
  
  const result = await uploadToBlob(pdfFile, `${pathPrefix}${pdfFile.name}`);
  
  console.log(`✅ SubFile uploaded: ${result.url}`);
  
  return {
    url: result.url,
    filename: pdfFile.name,
    size: pdfFile.size,
    pathname: result.pathname,
  };
}

/**
 * Upload multiple PDF subfiles to Vercel Blob Storage (batch)
 * 
 * @param pdfFiles - Array of PDF files to upload
 * @param pathPrefix - Optional path prefix (default: 'subfiles/')
 * @returns Array of upload results
 */
const BATCH_SIZE = 10; // Airtable limit for attachments per request

export async function uploadSubFiles(
  pdfFiles: File[],
  pathPrefix: string = 'subfiles/'
): Promise<SubFileUploadResult[]> {
  console.log(`📤 Batch uploading ${pdfFiles.length} subfiles in batches of ${BATCH_SIZE}...`);
  
  const allResults: SubFileUploadResult[] = [];
  
  // Split files into batches of 10
  for (let i = 0; i < pdfFiles.length; i += BATCH_SIZE) {
    const batch = pdfFiles.slice(i, i + BATCH_SIZE);
    const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(pdfFiles.length / BATCH_SIZE);
    
    console.log(`📦 Uploading batch ${batchNumber}/${totalBatches} (${batch.length} files)...`);
    
    try {
      // Use the batch upload function from vercel-blob
      const results = await uploadMultipleToBlob(batch, pathPrefix);
      
      const uploadResults: SubFileUploadResult[] = results.map((result, index) => ({
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
        `Failed to upload subfiles (batch ${batchNumber}): ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
  
  console.log(`✅ All batches complete: ${allResults.length} subfiles uploaded`);
  
  return allResults;
}

/**
 * Create a single SubFile record in Airtable
 * 
 * @param fileUrl - URL of the uploaded PDF subfile
 * @param fileName - Original file name
 * @param parentFileRecordId - Airtable record ID of the parent File
 * @param order - Order/position of this page in the original PDF (1-based)
 * @returns Airtable record ID of the created SubFile record
 */
export async function createSubFileRecord(
  fileUrl: string,
  fileName: string,
  parentFileRecordId: string,
  order: number
): Promise<string> {
  console.log(`📝 Creating SubFile record for: ${fileName} (order: ${order})`);
  
  const uploadedDate = new Date().toISOString().split('T')[0];
  
  try {
    const response = await createRecords('SubFiles', {
      fields: {
        'FileURL': fileUrl,
        'UploadedDate': uploadedDate,
        'ParentFileID': [parentFileRecordId], // Link to parent File record
        'Order': order,
      },
    });
    
    const recordId = response.records[0]?.id;
    if (!recordId) {
      throw new Error('Failed to create SubFile record - no record ID returned');
    }
    
    console.log(`✅ Created SubFile record: ${recordId}`);
    return recordId;
  } catch (error) {
    console.error('❌ Failed to create SubFile record:', error);
    throw new Error(
      `Failed to create SubFile record: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Create multiple SubFile records in Airtable (batch)
 * 
 * @param subfiles - Array of subfile data (url, fileName, order)
 * @param parentFileRecordId - Airtable record ID of the parent File
 * @returns Array of Airtable record IDs
 */
export async function createSubFileRecords(
  subfiles: Array<{ url: string; fileName: string; order: number }>,
  parentFileRecordId: string
): Promise<string[]> {
  console.log(`📝 Batch creating ${subfiles.length} SubFile records...`);
  
  const uploadedDate = new Date().toISOString().split('T')[0];
  const allRecordIds: string[] = [];
  
  // Split subfiles into batches of 10
  for (let i = 0; i < subfiles.length; i += BATCH_SIZE) {
    const batch = subfiles.slice(i, i + BATCH_SIZE);
    const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(subfiles.length / BATCH_SIZE);
    
    console.log(`📦 Creating records batch ${batchNumber}/${totalBatches} (${batch.length} records)...`);
    
    try {
      // Prepare batch records
      const records = batch.map((subfile) => ({
        fields: {
          'FileURL': subfile.url,
          'UploadedDate': uploadedDate,
          'ParentFileID': [parentFileRecordId], // Link to parent File record
          'Order': subfile.order,
        },
      }));
      
      // Create records in this batch
      const response = await createRecords('SubFiles', {
        records,
      });
      
      const recordIds = response.records.map((record) => record.id);
      allRecordIds.push(...recordIds);
      
      console.log(`✅ Batch ${batchNumber}/${totalBatches} complete`);
    } catch (error) {
      console.error(`❌ Batch ${batchNumber} record creation failed:`, error);
      throw new Error(
        `Failed to create SubFile records (batch ${batchNumber}): ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
  
  if (allRecordIds.length !== subfiles.length) {
    console.warn(
      `⚠️ Expected ${subfiles.length} records, but got ${allRecordIds.length}`
    );
  }
  
  console.log(`✅ All batches complete: ${allRecordIds.length} SubFile records created`);
  return allRecordIds;
}

/**
 * Upload PDF subfiles to Vercel and create corresponding Airtable records (all-in-one)
 * 
 * @param pdfFiles - Array of PDF files (single-page PDFs from splitting, in order)
 * @param parentFileRecordId - Airtable record ID of the parent File
 * @param pathPrefix - Optional path prefix for Vercel uploads
 * @returns Object containing upload results and Airtable record IDs
 */
export async function uploadAndCreateSubFileRecords(
  pdfFiles: File[],
  parentFileRecordId: string,
  pathPrefix: string = 'subfiles/'
): Promise<{
  uploadResults: SubFileUploadResult[];
  recordIds: string[];
}> {
  console.log(
    `🚀 Starting upload and record creation for ${pdfFiles.length} subfiles...`
  );
  
  // Step 1: Batch upload PDF subfiles to Vercel
  const uploadResults = await uploadSubFiles(pdfFiles, pathPrefix);
  
  // Step 2: Batch create SubFile records in Airtable with order preserved
  // Order is 1-based (first page = 1, second page = 2, etc.)
  const subfileData = uploadResults.map((result, index) => ({
    url: result.url,
    fileName: result.filename,
    order: index + 1, // 1-based order matching page number in PDF
  }));
  
  const recordIds = await createSubFileRecords(subfileData, parentFileRecordId);
  
  console.log(`✅ Complete: ${uploadResults.length} subfiles uploaded and linked`);
  
  return {
    uploadResults,
    recordIds,
  };
}

