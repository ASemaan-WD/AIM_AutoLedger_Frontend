/**
 * Invoice Service
 * Frontend service for invoice-related API operations
 * 
 * NOTE: Most invoice operations are now handled automatically by the backend
 * after triggering OCR with triggerOCR()
 */

// ============================================================================
// DEPRECATED FUNCTIONS - Backend now handles these automatically
// ============================================================================

export interface POMatchingRequest {
  invoiceId: string;
}

export interface POMatchingResponse {
  success: boolean;
  headers?: {
    ids: string[];
    count: number;
  };
  details?: {
    ids: string[];
    count: number;
  };
  error?: string;
}

/**
 * @deprecated - Backend now handles PO matching automatically after OCR
 * This is kept for potential manual retry functionality (TODO)
 * Endpoint: POST /api/match-invoice
 */
export async function matchInvoice(invoiceId: string): Promise<POMatchingResponse> {
  console.warn('matchInvoice is deprecated - backend handles matching automatically');
  console.log('TODO: Determine if this should be kept for manual retry functionality');
  throw new Error('This function is deprecated and should not be used');
}

export interface ParserRequest {
  recordID: string;
  rawText: string;
}

export interface ParserResponse {
  success: boolean;
  fileRecordId?: string;
  invoiceRecordId?: string;
  parsedData?: Record<string, unknown>;
  error?: string;
  details?: string;
}

/**
 * @deprecated - Backend now handles parsing automatically after OCR
 * Old parser endpoint - no longer used in new flow
 * Endpoint: POST /api/parser3
 */
export async function parseInvoice(recordID: string, rawText: string): Promise<ParserResponse> {
  console.warn('parseInvoice is deprecated - backend handles parsing automatically');
  throw new Error('This function is deprecated and should not be used');
}

