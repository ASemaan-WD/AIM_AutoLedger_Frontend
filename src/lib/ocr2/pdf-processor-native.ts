/**
 * Native PDF Processing for OCR2
 * Uses OpenAI's native PDF support instead of converting to images
 * Reference: https://platform.openai.com/docs/guides/pdf-files
 */

import { PDFProcessingError } from './types';
import { createLogger } from './logger';

const logger = createLogger('PDFProcessorNative');

/**
 * Download PDF from URL and return as Buffer
 */
export async function downloadPDF(url: string): Promise<Buffer> {
  try {
    logger.info('Downloading PDF from URL', { url: url.substring(0, 50) + '...' });

    let pdfBuffer: Buffer;

    if (url.startsWith('data:')) {
      // Handle data URIs
      const [header, data] = url.split(',', 2);
      if (!header.includes('application/pdf') && !header.includes('base64')) {
        throw new PDFProcessingError('Invalid PDF data URI format');
      }
      pdfBuffer = Buffer.from(data, 'base64');
      logger.info('PDF loaded from data URI', { size: pdfBuffer.length });
    } else {
      // Regular URL - download
      const response = await fetch(url, { 
        method: 'GET',
        headers: {
          'User-Agent': 'OCR2-PDF-Processor/2.0',
        },
        signal: AbortSignal.timeout(60000), // 60 second timeout for large files
      });

      if (!response.ok) {
        throw new PDFProcessingError(`Failed to download PDF: ${response.status} ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      pdfBuffer = Buffer.from(arrayBuffer);
      logger.info('PDF downloaded from URL', { size: pdfBuffer.length });
    }

    // Validate PDF header
    if (!pdfBuffer.subarray(0, 4).toString().startsWith('%PDF')) {
      throw new PDFProcessingError('Downloaded file is not a valid PDF');
    }

    // Check file size (OpenAI limit is 32MB)
    const sizeMB = pdfBuffer.length / (1024 * 1024);
    if (sizeMB > 32) {
      throw new PDFProcessingError(`PDF file is too large (${sizeMB.toFixed(2)}MB). Maximum size is 32MB.`);
    }

    logger.info('PDF validated', { 
      size: `${sizeMB.toFixed(2)}MB`,
      header: pdfBuffer.subarray(0, 8).toString()
    });

    return pdfBuffer;

  } catch (error) {
    if (error instanceof PDFProcessingError) {
      throw error;
    }
    
    throw new PDFProcessingError(
      `PDF download failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      { originalError: error, url }
    );
  }
}

/**
 * Get PDF page count (optional, for logging/validation)
 */
export async function getPDFPageCount(pdfBuffer: Buffer): Promise<number> {
  try {
    const pdfParse = await import('pdf-parse');
    const data = await pdfParse.default(pdfBuffer);
    return data.numpages;
  } catch (error) {
    // Silently fail - page count is optional and pdf-parse sometimes has internal errors
    // (e.g., trying to access test files that don't exist)
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // Only log if it's not the known pdf-parse test file issue
    if (!errorMessage.includes('test/data') && !errorMessage.includes('ENOENT')) {
      logger.debug('Could not get PDF page count', { error: errorMessage });
    }
    
    return 0; // Unknown
  }
}

/**
 * Validate PDF can be processed
 * - Check file size
 * - Check page count (if available)
 * - Check it's a valid PDF
 */
export async function validatePDF(pdfBuffer: Buffer): Promise<{
  isValid: boolean;
  pageCount?: number;
  sizeInMB: number;
  errors: string[];
}> {
  const errors: string[] = [];
  const sizeInMB = pdfBuffer.length / (1024 * 1024);

  // Check file size
  if (sizeInMB > 32) {
    errors.push(`File too large: ${sizeInMB.toFixed(2)}MB (max 32MB)`);
  }

  // Check valid PDF
  if (!pdfBuffer.subarray(0, 4).toString().startsWith('%PDF')) {
    errors.push('Not a valid PDF file');
    return { isValid: false, sizeInMB, errors };
  }

  // Try to get page count
  let pageCount: number | undefined;
  try {
    pageCount = await getPDFPageCount(pdfBuffer);
    
    // OpenAI supports up to 100 pages
    if (pageCount > 100) {
      errors.push(`Too many pages: ${pageCount} (max 100)`);
    }
  } catch (error) {
    // Page count is optional
    logger.debug('Could not determine page count', { error });
  }

  return {
    isValid: errors.length === 0,
    pageCount,
    sizeInMB,
    errors
  };
}

