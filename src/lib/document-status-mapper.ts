/**
 * Document Status Mapping Utility
 * Maps Airtable statuses to frontend DocumentStatus type
 * 
 * Mapping Rules (per user requirements):
 * - Queued → queued
 * - Pending → open (processing state)
 * - Reviewed → reviewed
 * - Approved → open (processing state)
 * - Matched → open (processing state)
 * - Exported → exported
 * - Attention → queued (needs attention state)
 * - Error → rejected
 */

import type { DocumentStatus } from '@/types/documents';

/**
 * Map Airtable status to frontend DocumentStatus
 * 
 * @param airtableStatus - Status from Airtable (Queued, Pending, Reviewed, etc.)
 * @returns Frontend DocumentStatus
 */
export function mapAirtableStatusToDocumentStatus(airtableStatus: string): DocumentStatus {
  const statusLower = airtableStatus.toLowerCase();

  switch (statusLower) {
    case 'queued':
      return 'queued';
    
    case 'pending':
    case 'approved':
    case 'matched':
      return 'open'; // These are all "processing" states
    
    case 'reviewed':
      return 'reviewed';
    
    case 'exported':
      return 'exported';
    
    case 'attention':
      return 'queued'; // Attention status shows as queued (needs action)
    
    case 'error':
      return 'rejected';
    
    default:
      console.warn(`Unknown Airtable status: ${airtableStatus}, defaulting to 'open'`);
      return 'open';
  }
}

/**
 * Reverse mapping: frontend DocumentStatus to Airtable status
 * Used when updating records
 * 
 * @param documentStatus - Frontend DocumentStatus
 * @returns Airtable status string
 */
export function mapDocumentStatusToAirtable(documentStatus: DocumentStatus): string {
  switch (documentStatus) {
    case 'queued':
      return 'Queued';
    case 'open':
      return 'Pending'; // Default processing state
    case 'reviewed':
      return 'Reviewed';
    case 'exported':
      return 'Exported';
    case 'approved':
      return 'Approved';
    case 'rejected':
      return 'Error';
    case 'pending':
      return 'Pending';
    default:
      console.warn(`Unknown DocumentStatus: ${documentStatus}, defaulting to 'Pending'`);
      return 'Pending';
  }
}

/**
 * Check if a status represents a "processing" state
 */
export function isProcessingStatus(status: DocumentStatus): boolean {
  return status === 'open' || status === 'pending' || status === 'reviewed' || status === 'approved';
}

/**
 * Check if a status represents a "final" state
 */
export function isFinalStatus(status: DocumentStatus): boolean {
  return status === 'exported' || status === 'rejected';
}

/**
 * Check if a status requires user attention
 */
export function requiresAttention(status: DocumentStatus): boolean {
  return status === 'queued' || status === 'rejected';
}

