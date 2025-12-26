/**
 * Status Mapping Utility
 * Single source of truth for all status text, mapping, and progress
 * 
 * IMPORTANT CONCEPTS:
 * - Invoice Status: Determines progress %, widget state, and button visibility
 * - Processing Status: Determines label text only (what's currently happening)
 * 
 * Now supports client-specific workflows via client-workflows.ts
 */

import { FILE_STATUS, PROCESSING_STATUS } from './airtable/schema-types';
import type { UploadStatus } from '@/components/application/upload-status/upload-status-card';
import { 
  getInvoiceProgress,
  getProcessingStatusLabel,
  isInvoiceStatusSuccess,
  isInvoiceStatusFinal,
  getClientEndState
} from '@/config/client-workflows';

// =============================================================================
// STATUS TEXT - Single source of truth for all user-facing status messages
// =============================================================================

export const STATUS_TEXT = {
  // Processing status messages (shown during file processing)
  // NOTE: For client-specific text, use getProcessingStatusText() instead
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
    successCrest: '✓ Ready for review', // CREST-specific success message
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
 * Uses Invoice Status for final state determination
 * 
 * @param status - File status from Airtable (Queued, Processing, Processed, Attention)
 * @param processingStatus - Processing substatus (UPL, DETINV, PARSE, etc.) - for text labels
 * @param invoiceStatus - Invoice status (Pending, Parsed, Matching, Matched, etc.) - for progress/completion
 * @param clientId - Client identifier for workflow-specific behavior
 */
export function mapFileStatusToUI(
  status: string,
  processingStatus?: string,
  invoiceStatus?: string | null,
  clientId?: string | null
): UploadStatus {
  // Handle error state (via processing status or attention status)
  if (status === FILE_STATUS.ATTENTION || processingStatus === PROCESSING_STATUS.ERROR) {
    return 'error';
  }

  // Handle queued state
  if (status === FILE_STATUS.QUEUED) {
    return 'queued';
  }

  // Handle processing states - Use invoice status to determine completion
  if (status === FILE_STATUS.PROCESSING) {
    // If we have an invoice status, use it to determine success
    if (invoiceStatus) {
      if (isInvoiceStatusSuccess(clientId, invoiceStatus)) {
        return 'success';
      }
      if (invoiceStatus === 'Matching') {
        return 'connecting';
      }
    }
    
    // Fallback to processing status for UI state
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
 * Uses Processing Status for label text
 */
export function getProcessingStatusText(processingStatus?: string, clientId?: string | null): string {
  return getProcessingStatusLabel(clientId, processingStatus);
}

/**
 * Get result message for final states
 * Now supports client-specific messages
 */
export function getResultStatusText(
  status: 'success' | 'exported' | 'processingError' | 'duplicate' | 'noMatch' | 'error',
  clientId?: string | null
): string {
  // For CREST clients, show different success message
  if (status === 'success' && clientId === 'CREST') {
    return STATUS_TEXT.result.successCrest;
  }
  return STATUS_TEXT.result[status];
}

// =============================================================================
// PROGRESS
// =============================================================================

/**
 * Get progress percentage based on Invoice Status
 * This is the primary progress calculation function
 * 
 * @param invoiceStatus - Invoice status from Airtable (Pending, Parsed, Matching, Matched, etc.)
 * @param clientId - Client identifier for workflow-specific progress
 * @param hasInvoice - Whether an invoice record exists
 */
export function getProgressByInvoiceStatus(
  invoiceStatus?: string | null, 
  clientId?: string | null,
  hasInvoice: boolean = true
): number {
  return getInvoiceProgress(clientId, invoiceStatus, hasInvoice);
}

/**
 * @deprecated Use getProgressByInvoiceStatus instead
 * Get progress percentage based on processing status
 * This is kept for backward compatibility but will use invoice status mapping internally
 */
export function getProcessingProgress(processingStatus?: string, clientId?: string | null): number {
  // Map processing status to approximate invoice status for backward compatibility
  const invoiceStatusMap: Record<string, string> = {
    'UPL': 'Pending',
    'DETINV': 'Pending',
    'PARSE': 'Parsed',
    'RELINV': 'Parsed',
    'MATCHING': 'Matching',
    'MATCHED': 'Matched',
    'ERROR': 'Error',
  };
  
  const invoiceStatus = processingStatus ? invoiceStatusMap[processingStatus] : undefined;
  return getInvoiceProgress(clientId, invoiceStatus, !!processingStatus);
}

// =============================================================================
// CLIENT-SPECIFIC HELPERS (Re-exported for convenience)
// =============================================================================

export { 
  getClientEndState, 
  shouldShowExportButton, 
  shouldShowGoToInvoiceButton,
  isInvoiceStatusSuccess,
  isInvoiceStatusFinal,
  getInvoiceProgress
} from '@/config/client-workflows';

// Deprecated - kept for backward compatibility
export { isClientWorkflowComplete } from '@/config/client-workflows';
