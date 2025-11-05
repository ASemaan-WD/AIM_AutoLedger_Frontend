/**
 * OCR2 Orchestrator - Native PDF Support
 * Simplified pipeline using OpenAI's native PDF processing
 * No more PDF-to-image conversion!
 */

import { 
  PDFProcessingResult, 
  PDFProcessingOptions,
  ProcessingSummary,
  PDFProcessingError 
} from './types';
import { downloadPDF, validatePDF } from './pdf-processor-native';
import { extractTextFromPDFWithRetry } from './vision-client-native';
import { createLogger, createTimer } from './logger';

const logger = createLogger('OrchestratorNative');

/**
 * Main function to process a PDF from URL and extract text
 * This is the new, simplified version using native PDF support
 */
export async function processPDFFromURL(
  url: string, 
  options?: PDFProcessingOptions
): Promise<PDFProcessingResult> {
  const timer = createTimer('PDF Processing', 'OrchestratorNative');
  
  try {
    logger.info('Starting native PDF processing', { 
      url: url.substring(0, 50) + '...',
      options 
    });

    // Step 1: Download PDF
    timer.checkpoint('Download started');
    const pdfBuffer = await downloadPDF(url);
    timer.checkpoint('Download completed');

    // Step 2: Validate PDF
    timer.checkpoint('Validation started');
    const validation = await validatePDF(pdfBuffer);
    
    if (!validation.isValid) {
      throw new PDFProcessingError(
        `PDF validation failed: ${validation.errors.join(', ')}`,
        { validation }
      );
    }
    
    logger.info('PDF validated successfully', {
      pageCount: validation.pageCount || 'unknown',
      sizeMB: validation.sizeInMB.toFixed(2)
    });
    timer.checkpoint('Validation completed');

    // Step 3: Extract text using OpenAI's native PDF support
    // This replaces the entire: PDF → Images → Chunks → OCR pipeline
    // with a single API call!
    timer.checkpoint('Text extraction started');
    const ocrResult = await extractTextFromPDFWithRetry(pdfBuffer);
    timer.checkpoint('Text extraction completed');

    const processingTime = timer.finish();

    // Build simplified summary
    const summary: ProcessingSummary = {
      totalTokensUsed: ocrResult.tokensUsed.total,
      totalProcessingTime: processingTime,
      averageChunksPerPage: 0, // Not applicable with native PDF
      successRate: 100, // If we got here, it worked
      errors: [],
    };

    const result: PDFProcessingResult = {
      totalPages: validation.pageCount || 1,
      processedPages: validation.pageCount || 1,
      extractedText: ocrResult.text,
      processingTime: summary.totalProcessingTime,
      pagesResults: [], // Not applicable with native PDF processing
      summary,
    };

    logger.info('PDF processing completed successfully', {
      totalPages: result.totalPages,
      textLength: result.extractedText.length,
      processingTime: `${summary.totalProcessingTime}ms`,
      tokensUsed: summary.totalTokensUsed,
      inputTokens: ocrResult.tokensUsed.input,
      outputTokens: ocrResult.tokensUsed.output,
    });

    return result;

  } catch (error) {
    const processingTime = timer.finish();
    
    logger.error('PDF processing failed', {
      url: url.substring(0, 50) + '...',
      processingTime: `${processingTime}ms`,
      error: error instanceof Error ? error.message : String(error)
    });

    if (error instanceof PDFProcessingError) {
      throw error;
    }

    throw new PDFProcessingError(
      `PDF processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      { originalError: error, url, processingTime }
    );
  }
}

/**
 * Process a PDF for raw text extraction only (simplified interface)
 */
export async function processPDFForRawText(
  url: string,
  options?: PDFProcessingOptions
): Promise<string> {
  logger.info('Processing PDF for raw text only', { 
    url: url.substring(0, 50) + '...' 
  });

  const result = await processPDFFromURL(url, options);
  
  logger.info('Raw text extraction completed', {
    textLength: result.extractedText.length,
    processingTime: `${result.processingTime}ms`,
    tokensUsed: result.summary.totalTokensUsed
  });

  return result.extractedText;
}

/**
 * Get processing statistics for monitoring
 */
export function getProcessingStats() {
  return {
    version: '2.0-native',
    maxFileSize: '32MB',
    maxPages: 100,
    supportedFormats: ['PDF'],
    features: [
      'Native PDF processing',
      'No image conversion',
      'Single API call per document',
      'Automatic retry logic',
      'Full document text extraction',
      'Preserves formatting and layout',
    ],
    benefits: [
      'Much faster processing',
      'Lower token usage',
      'No external dependencies (pdftoppm, pdf-poppler)',
      'Works on Vercel and serverless',
      'Better accuracy',
      'Simpler codebase',
    ]
  };
}

