/**
 * Cleanup Service
 * Handles cleanup of orphaned resources and data consistency
 * 
 * ⚠️ WARNING: Blob deletion does NOT work from the browser due to CORS!
 * 
 * These cleanup functions will identify orphaned blobs but CANNOT delete them
 * from the frontend. You have two options:
 * 
 * 1. Implement these functions in Azure Functions (server-side)
 * 2. Use the Vercel dashboard to manually delete orphaned blobs
 * 
 * These functions are designed to be called from server-side code,
 * not from the browser.
 */

import { deleteFromBlob, listBlobs } from '@/lib/vercel-blob';
import { listRecords, deleteRecords } from './airtable-service';

/**
 * Find and clean up orphaned blobs (blobs not referenced in Airtable)
 * 
 * USE WITH CAUTION: This will delete files from Vercel Blob!
 * 
 * @param dryRun - If true, only report what would be deleted without actually deleting
 * @returns List of orphaned blob URLs (deleted or would be deleted)
 */
export async function cleanupOrphanedBlobs(dryRun: boolean = true): Promise<string[]> {
  console.log(dryRun ? '🔍 Dry run: Finding orphaned blobs...' : '🗑️  Cleaning up orphaned blobs...');
  
  try {
    // Step 1: Get all blobs from Vercel
    const blobsList = await listBlobs({ prefix: 'uploads/', limit: 1000 });
    const blobUrls = new Set(blobsList.blobs.map(b => b.url));
    console.log(`📊 Found ${blobUrls.size} blobs in Vercel storage`);
    
    // Step 2: Get all file records from Airtable
    const airtableFiles = await listRecords('Files', {
      fields: ['FileURL', 'Attachments'],
      maxRecords: 10000,
    });
    
    // Extract all URLs referenced in Airtable
    const referencedUrls = new Set<string>();
    for (const record of airtableFiles.records) {
      const fileUrl = record.fields['FileURL'] as string;
      if (fileUrl) referencedUrls.add(fileUrl);
      
      const attachments = record.fields['Attachments'] as Array<{ url: string }>;
      if (attachments) {
        attachments.forEach(att => referencedUrls.add(att.url));
      }
    }
    console.log(`📊 Found ${referencedUrls.size} unique URLs referenced in Airtable`);
    
    // Step 3: Find orphaned blobs (in Vercel but not in Airtable)
    const orphanedUrls: string[] = [];
    for (const blobUrl of blobUrls) {
      if (!referencedUrls.has(blobUrl)) {
        orphanedUrls.push(blobUrl);
      }
    }
    
    console.log(`🔍 Found ${orphanedUrls.length} orphaned blobs`);
    
    if (orphanedUrls.length === 0) {
      console.log('✅ No orphaned blobs found');
      return [];
    }
    
    // Step 4: Delete orphaned blobs (if not dry run)
    if (!dryRun) {
      console.log('🗑️  Deleting orphaned blobs...');
      for (const url of orphanedUrls) {
        try {
          await deleteFromBlob(url);
          console.log(`  ✅ Deleted: ${url}`);
        } catch (error) {
          console.error(`  ❌ Failed to delete: ${url}`, error);
        }
      }
      console.log(`✅ Cleanup complete: ${orphanedUrls.length} blobs deleted`);
    } else {
      console.log('🔍 Dry run complete. Would delete:');
      orphanedUrls.forEach(url => console.log(`  - ${url}`));
    }
    
    return orphanedUrls;
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    throw error;
  }
}

/**
 * Find and clean up dangling Airtable records (records with missing blobs)
 * 
 * @param dryRun - If true, only report what would be deleted without actually deleting
 * @returns List of record IDs (deleted or would be deleted)
 */
export async function cleanupDanglingRecords(dryRun: boolean = true): Promise<string[]> {
  console.log(dryRun ? '🔍 Dry run: Finding dangling records...' : '🗑️  Cleaning up dangling records...');
  
  try {
    // Get all file records from Airtable
    const airtableFiles = await listRecords('Files', {
      fields: ['FileURL', 'Attachments', 'FileName'],
      maxRecords: 10000,
    });
    
    // Get all blobs from Vercel
    const blobsList = await listBlobs({ prefix: 'uploads/', limit: 1000 });
    const blobUrls = new Set(blobsList.blobs.map(b => b.url));
    
    // Find records with missing blobs
    const danglingRecordIds: string[] = [];
    for (const record of airtableFiles.records) {
      const fileUrl = record.fields['FileURL'] as string;
      const attachments = record.fields['Attachments'] as Array<{ url: string }>;
      
      // Check if this record has ANY valid blob reference
      let hasValidBlob = false;
      if (fileUrl && blobUrls.has(fileUrl)) {
        hasValidBlob = true;
      }
      if (attachments && attachments.some(att => blobUrls.has(att.url))) {
        hasValidBlob = true;
      }
      
      // If no valid blob reference, mark as dangling
      if (!hasValidBlob && (fileUrl || attachments)) {
        danglingRecordIds.push(record.id);
        console.log(`  ⚠️  Dangling record: ${record.id} (${record.fields['FileName']})`);
      }
    }
    
    console.log(`🔍 Found ${danglingRecordIds.length} dangling records`);
    
    if (danglingRecordIds.length === 0) {
      console.log('✅ No dangling records found');
      return [];
    }
    
    // Delete dangling records (if not dry run)
    if (!dryRun) {
      console.log('🗑️  Deleting dangling records...');
      try {
        await deleteRecords('Files', { ids: danglingRecordIds });
        console.log(`✅ Cleanup complete: ${danglingRecordIds.length} records deleted`);
      } catch (error) {
        console.error('❌ Failed to delete records:', error);
        throw error;
      }
    } else {
      console.log(`🔍 Dry run complete. Would delete ${danglingRecordIds.length} records`);
    }
    
    return danglingRecordIds;
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    throw error;
  }
}

/**
 * Run full cleanup (both orphaned blobs and dangling records)
 * 
 * @param dryRun - If true, only report what would be deleted
 * @returns Summary of cleanup operations
 */
export async function runFullCleanup(dryRun: boolean = true) {
  console.log('🧹 Starting full cleanup...\n');
  
  const orphanedBlobs = await cleanupOrphanedBlobs(dryRun);
  console.log('');
  
  const danglingRecords = await cleanupDanglingRecords(dryRun);
  console.log('');
  
  const summary = {
    orphanedBlobsCount: orphanedBlobs.length,
    danglingRecordsCount: danglingRecords.length,
    orphanedBlobs,
    danglingRecords,
  };
  
  console.log('📊 Cleanup Summary:');
  console.log(`  - Orphaned blobs: ${summary.orphanedBlobsCount}`);
  console.log(`  - Dangling records: ${summary.danglingRecordsCount}`);
  
  if (dryRun) {
    console.log('\n💡 To perform actual cleanup, run with dryRun=false');
  }
  
  return summary;
}

