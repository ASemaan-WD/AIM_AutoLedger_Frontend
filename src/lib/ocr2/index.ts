/**
 * OCR2 Library - Main Exports
 * TypeScript-based OCR processing for Next.js applications
 */

// Core configuration
export { getOCR2Settings, validateSettings } from './config';

// Type definitions
export type {
  OCR2Settings,
  ImageChunk,
  ProcessedImage,
  OCRResult,
  ChunkOCRResult,
  PDFProcessingOptions,
  PDFProcessingResult,
  PageProcessingResult,
  ProcessingSummary,
  InvoiceData,
  StructuredExtractionResult,
  ProcessFileRequest,
  ProcessFileResponse,
  AirtableFileRecord,
  AirtableUpdateData,
  Logger,
  LogEntry,
  OCRError,
  PDFProcessingError,
  VisionAPIError,
  AirtableUpdateError,
} from './types';

// PDF processing utilities (native only)
export {
  downloadPDF,
  getPDFPageCount,
  validatePDF,
} from './pdf-processor-native';

// Vision API client (native PDF support)
export {
  extractTextFromPDF,
  extractTextFromPDFWithRetry,
  testPDFSupport,
  getAPIUsageStats,
} from './vision-client-native';

// Main orchestrator (native PDF support)
export {
  processPDFFromURL,
  processPDFForRawText,
  getProcessingStats,
} from './orchestrator-native';

// Logging utilities
export {
  createLogger,
  logger,
  measurePerformance,
  createTimer,
  logMemoryUsage,
} from './logger';

/**
 * OCR2 Library Information
 */
export const OCR2_INFO = {
  name: 'OCR2',
  version: '2.0.0-native',
  description: 'Native PDF processing with OpenAI GPT-4o Vision',
  features: [
    'Native PDF processing (no image conversion)',
    'Single API call per document',
    'OpenAI GPT-4o Vision with PDF support',
    'Up to 100 pages per document',
    'Up to 32MB file size',
    'Automatic retry logic',
    'Airtable integration',
    'Comprehensive error handling',
    'Structured logging',
    'Performance monitoring',
    'Works on Vercel/serverless',
  ],
  improvements: [
    'Much faster processing',
    'Lower token usage',
    'No external dependencies (pdftoppm, pdf-poppler)',
    'Better accuracy',
    'Simpler codebase',
    'Serverless compatible',
  ],
  compatibility: {
    runtime: 'Node.js / Edge',
    framework: 'Next.js',
    typescript: true,
    serverComponents: true,
    apiRoutes: true,
    vercel: true,
    serverless: true,
  },
} as const;

/**
 * Quick start utility for common use cases
 */
export const quickStart = {
  /**
   * Process a PDF file and return extracted text (native PDF support)
   */
  async extractText(fileUrl: string): Promise<string> {
    const { processPDFForRawText } = await import('./orchestrator-native');
    return processPDFForRawText(fileUrl);
  },

  /**
   * Test if the OCR2 service is properly configured
   */
  async testConfiguration(): Promise<boolean> {
    try {
      const { getOCR2Settings, validateSettings } = await import('./config');
      const { testPDFSupport } = await import('./vision-client-native');
      
      const settings = getOCR2Settings();
      validateSettings(settings);
      
      return await testPDFSupport();
    } catch {
      return false;
    }
  },

  /**
   * Get service health information
   */
  async getHealth() {
    const { getOCR2Settings } = await import('./config');
    const { getProcessingStats } = await import('./orchestrator-native');
    const { getAPIUsageStats } = await import('./vision-client-native');
    
    try {
      const settings = getOCR2Settings();
      const processingStats = getProcessingStats();
      const apiStats = getAPIUsageStats();
      
      return {
        status: 'healthy',
        version: '2.0.0-native',
        configuration: {
          model: settings.openai.model,
          maxFileSize: '32MB',
          maxPages: 100,
          nativePDFSupport: true,
        },
        stats: {
          processing: processingStats,
          api: apiStats,
        },
      };
    } catch (error) {
      return {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },
};

export default {
  ...OCR2_INFO,
  quickStart,
};
