/**
 * OCR Service
 * Frontend service for OCR processing operations
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

/**
 * Response from TriggerOCRByFile endpoint
 */
export interface TriggerOCRResponse {
  id: number;
  kind: string;
  relatedId: number;
  status: string;
  createdAt: string;
  organizationId: string;
}

/**
 * Trigger OCR processing with file ID only
 * Endpoint: POST /api/ocr/trigger-by-file
 * 
 * Creates a new background OCR job for a specific file record and immediately 
 * triggers the worker to process it.
 * 
 * @param fileRecordId - The unique identifier of the uploaded file to perform OCR on (string or number)
 * @returns OCR job information with status code 201 Created
 */
export async function triggerOCRByFile(fileRecordId: number): Promise<TriggerOCRResponse> {
  console.log(`🚀 Triggering OCR for file record ID: ${fileRecordId}`);
  
  try{

    const response = await fetch(`${API_BASE_URL}/ocr/trigger-by-file`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ "fileRecordId": fileRecordId.toString() }),
    });
  
    // Check for 201 Created status as per API documentation
    if (response.status !== 201) {
      const errorText = await response.text().catch(() => 'Unknown error');
      throw new Error(`OCR trigger failed: ${response.status} - ${errorText}`);
    }
    
    const result = await response.json();
    console.log(`✅ OCR triggered successfully, job ID: ${result.id}, status: ${result.status}`);
    return result;
  } catch (error) {
    console.error('❌ OCR trigger failed:', error);
    throw new Error(`OCR trigger failed: ${error}`);
  }
}

// ============================================================================
// DEPRECATED FUNCTIONS - Kept for backward compatibility, marked for removal
// ============================================================================

export interface OCRRequest {
  recordId: string;
}

export interface OCRResponse {
  success: boolean;
  recordId?: string;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
  textLength?: number;
  ocrTimeMs?: number;
  message?: string;
  error?: string;
  details?: unknown;
}

/**
 * @deprecated - Use triggerOCRWithFiles instead
 * Old OCR endpoint - no longer used in new flow
 */
export async function processOCR(recordId: string): Promise<OCRResponse> {
  console.warn('processOCR is deprecated - use triggerOCRWithFiles instead');
  throw new Error('This function is deprecated and should not be used');
}

export interface PostOCRRequest {
  file_record_id: string;
}

export interface PostOCRResponse {
  success: boolean;
  error?: string;
  stack?: string;
}

/**
 * @deprecated - Backend now handles post-OCR processing automatically
 * Old post-OCR endpoint - no longer used in new flow
 */
export async function processPostOCR(fileRecordId: string): Promise<PostOCRResponse> {
  console.warn('processPostOCR is deprecated - backend handles this automatically');
  throw new Error('This function is deprecated and should not be used');
}

