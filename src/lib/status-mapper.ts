/**
 * Status Mapping Utility
 * Maps Airtable Status + Processing-Status to UI UploadStatus
 */

import { FILE_STATUS, PROCESSING_STATUS } from './airtable/schema-types';
import type { UploadStatus } from '@/components/application/upload-status/upload-status-card';

/**
 * Map Airtable File statuses to UI status
 * 
 * @param status - Main status from Airtable Files.Status field
 * @param processingStatus - Sub-status from Airtable Files.Processing-Status field
 * @returns UI status for UploadStatusCard
 * 
 * Mapping Rules:
 * - Queued + UPL → "queued"
 * - Processing + DETINV → "processing" (OCR)
 * - Processing + PARSE → "processing" (Parsing)
 * - Processing + RELINV → "processing" (Finding invoices)
 * - Processing + MATCHING → "connecting" (Matching POs)
 * - Processing + MATCHED → "success"
 * - Processed → "success"
 * - Error → "error"
 */
export function mapFileStatusToUI(
  status: string,
  processingStatus?: string
): UploadStatus {
  // Handle error state
  if (status === FILE_STATUS.ERROR || processingStatus === PROCESSING_STATUS.ERROR) {
    return 'error';
  }

  // Handle queued state
  if (status === FILE_STATUS.QUEUED) {
    if (processingStatus === PROCESSING_STATUS.UPL) {
      return 'queued';
    }
    // Default queued state
    return 'queued';
  }

  // Handle processing states
  if (status === FILE_STATUS.PROCESSING) {
    switch (processingStatus) {
      case PROCESSING_STATUS.DETINV:
        return 'processing'; // OCR in progress
      case PROCESSING_STATUS.PARSE:
        return 'processing'; // Parsing invoice data
      case PROCESSING_STATUS.RELINV:
        return 'processing'; // Finding related invoices
      case PROCESSING_STATUS.MATCHING:
        return 'connecting'; // Matching with PO headers
      case PROCESSING_STATUS.MATCHED:
        return 'success'; // Matching complete
      default:
        return 'processing'; // Default processing state
    }
  }

  // Handle processed state
  if (status === FILE_STATUS.PROCESSED) {
    return 'success';
  }

  // Default fallback
  console.warn(`Unknown status combination: ${status} / ${processingStatus}`);
  return 'processing';
}

/**
 * Get user-friendly text for processing status
 * Used to display what operation is currently happening
 */
export function getProcessingStatusText(processingStatus?: string): string {
  switch (processingStatus) {
    case PROCESSING_STATUS.UPL:
      return 'Uploaded, waiting to start...';
    case PROCESSING_STATUS.DETINV:
      return 'Detecting invoices (OCR)...';
    case PROCESSING_STATUS.PARSE:
      return 'Parsing invoice data...';
    case PROCESSING_STATUS.RELINV:
      return 'Finding related invoices...';
    case PROCESSING_STATUS.MATCHING:
      return 'Matching with PO headers...';
    case PROCESSING_STATUS.MATCHED:
      return 'Matching complete';
    case PROCESSING_STATUS.ERROR:
      return 'Error occurred';
    default:
      return 'Processing...';
  }
}

/**
 * Get progress percentage based on processing status
 * Used for progress bars
 */
export function getProcessingProgress(processingStatus?: string): number {
  switch (processingStatus) {
    case PROCESSING_STATUS.UPL:
      return 10; // Just uploaded
    case PROCESSING_STATUS.DETINV:
      return 30; // OCR in progress
    case PROCESSING_STATUS.PARSE:
      return 50; // Parsing
    case PROCESSING_STATUS.RELINV:
      return 70; // Relating invoices
    case PROCESSING_STATUS.MATCHING:
      return 90; // Matching
    case PROCESSING_STATUS.MATCHED:
      return 100; // Complete
    default:
      return 50; // Default mid-progress
  }
}

