/**
 * Status Mapping Utility
 * Single source of truth for all status text, mapping, and progress
 */

import { FILE_STATUS, PROCESSING_STATUS } from './airtable/schema-types';
import type { UploadStatus } from '@/components/application/upload-status/upload-status-card';

// =============================================================================
// STATUS TEXT - Single source of truth for all user-facing status messages
// =============================================================================

export const STATUS_TEXT = {
  // Processing status messages (shown during file processing)
  processing: {
    UPL: 'Uploading...',
    DETINV: 'Reading document...',
    PARSE: 'Extracting data...',
    RELINV: 'Reading document...',
    MATCHING: 'Checking with AIM Vision...',
    MATCHED: 'Match complete',
    ERROR: 'Error',
    default: 'Processing...',
  },
  
  // Final state messages (shown when processing completes)
  result: {
    success: '✓ Ready to export',
    exported: '✓ Exported to AIM',
    processingError: 'Unable to process file',
    duplicate: 'Already uploaded',
    noMatch: 'No matching PO found',
    error: 'Processing failed',
  },
} as const;

// =============================================================================
// STATUS MAPPING
// =============================================================================

/**
 * Map Airtable File statuses to UI status
 * 
 * Mapping Rules:
 * - Queued + UPL → "queued"
 * - Processing + DETINV/PARSE/RELINV → "processing"
 * - Processing + MATCHING → "connecting"
 * - Processing + MATCHED → "success"
 * - Processed → "success"
 * - Attention/ERROR → "error"
 */
export function mapFileStatusToUI(
  status: string,
  processingStatus?: string
): UploadStatus {
  // Handle error state (via processing status or attention status)
  if (status === FILE_STATUS.ATTENTION || processingStatus === PROCESSING_STATUS.ERROR) {
    return 'error';
  }

  // Handle queued state
  if (status === FILE_STATUS.QUEUED) {
    return 'queued';
  }

  // Handle processing states
  if (status === FILE_STATUS.PROCESSING) {
    switch (processingStatus) {
      case PROCESSING_STATUS.DETINV:
      case PROCESSING_STATUS.PARSE:
      case PROCESSING_STATUS.RELINV:
        return 'processing';
      case PROCESSING_STATUS.MATCHING:
        return 'connecting';
      case PROCESSING_STATUS.MATCHED:
        return 'success';
      default:
        return 'processing';
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

// =============================================================================
// STATUS TEXT HELPERS
// =============================================================================

/**
 * Get user-friendly text for processing status
 */
export function getProcessingStatusText(processingStatus?: string): string {
  if (!processingStatus) return STATUS_TEXT.processing.default;
  
  const key = processingStatus as keyof typeof STATUS_TEXT.processing;
  return STATUS_TEXT.processing[key] ?? STATUS_TEXT.processing.default;
}

/**
 * Get result message for final states
 */
export function getResultStatusText(
  status: 'success' | 'exported' | 'processingError' | 'duplicate' | 'noMatch' | 'error'
): string {
  return STATUS_TEXT.result[status];
}

// =============================================================================
// PROGRESS
// =============================================================================

/**
 * Get progress percentage based on processing status
 */
export function getProcessingProgress(processingStatus?: string): number {
  switch (processingStatus) {
    case PROCESSING_STATUS.UPL:
      return 10;
    case PROCESSING_STATUS.DETINV:
      return 30;
    case PROCESSING_STATUS.PARSE:
      return 50;
    case PROCESSING_STATUS.RELINV:
      return 70;
    case PROCESSING_STATUS.MATCHING:
      return 90;
    case PROCESSING_STATUS.MATCHED:
      return 100;
    default:
      return 50;
  }
}

