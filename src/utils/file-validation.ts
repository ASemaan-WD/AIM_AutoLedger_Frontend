/**
 * File validation utilities
 */

import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker (same as pdf-converter.ts)
if (typeof pdfjsLib !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
}

// Maximum allowed pages for PDF files
export const MAX_PDF_PAGES = 30;

export interface FileValidationResult {
  isValid: boolean;
  errorCode?: 'UNSUPPORTED_FORMAT' | 'FILE_TOO_LARGE' | 'PDF_CORRUPTED' | 'TOO_MANY_PAGES';
  errorMessage?: string;
  pageCount?: number;
}

// Supported file types and their MIME types
const SUPPORTED_FORMATS = {
  'application/pdf': { extension: 'pdf', maxSize: 50 * 1024 * 1024 }, // 50 MB
  'image/jpeg': { extension: 'jpg', maxSize: 20 * 1024 * 1024 }, // 20 MB
  'image/jpg': { extension: 'jpg', maxSize: 20 * 1024 * 1024 }, // 20 MB
  'image/png': { extension: 'png', maxSize: 20 * 1024 * 1024 }, // 20 MB
  'image/gif': { extension: 'gif', maxSize: 20 * 1024 * 1024 }, // 20 MB
  'image/tiff': { extension: 'tiff', maxSize: 50 * 1024 * 1024 }, // 50 MB
  'image/tif': { extension: 'tif', maxSize: 50 * 1024 * 1024 }, // 50 MB
  'application/octet-stream': { extension: 'bin', maxSize: 50 * 1024 * 1024 } // 50 MB (generic)
};

// Default max size for any file
const DEFAULT_MAX_SIZE = 50 * 1024 * 1024; // 50 MB

/**
 * Validate file format
 */
export function validateFileFormat(file: File): FileValidationResult {
  const fileType = file.type || 'application/octet-stream';
  const fileName = file.name.toLowerCase();
  
  // Check if file type is supported
  if (!(fileType in SUPPORTED_FORMATS)) {
    // Try to infer from file extension
    const extension = fileName.split('.').pop();
    const isSupported = Object.values(SUPPORTED_FORMATS).some(
      format => format.extension === extension
    );
    
    if (!isSupported) {
      return {
        isValid: false,
        errorCode: 'UNSUPPORTED_FORMAT',
        errorMessage: `File format not supported. Supported formats: PDF, JPG, PNG, GIF, TIFF. Received: ${fileType}`
      };
    }
  }
  
  return { isValid: true };
}

/**
 * Validate file size
 */
export function validateFileSize(file: File): FileValidationResult {
  const fileType = file.type || 'application/octet-stream';
  const maxSize = SUPPORTED_FORMATS[fileType as keyof typeof SUPPORTED_FORMATS]?.maxSize || DEFAULT_MAX_SIZE;
  
  if (file.size > maxSize) {
    const maxSizeMB = Math.round(maxSize / (1024 * 1024));
    const fileSizeMB = Math.round(file.size / (1024 * 1024));
    
    return {
      isValid: false,
      errorCode: 'FILE_TOO_LARGE',
      errorMessage: `File size (${fileSizeMB} MB) exceeds maximum allowed size of ${maxSizeMB} MB`
    };
  }
  
  return { isValid: true };
}

/**
 * Check if PDF file is corrupted (basic validation)
 */
export async function validatePDFIntegrity(file: File): Promise<FileValidationResult> {
  if (file.type !== 'application/pdf') {
    return { isValid: true }; // Only validate PDFs
  }
  
  try {
    // Read first few bytes to check PDF header
    const buffer = await file.slice(0, 8).arrayBuffer();
    const bytes = new Uint8Array(buffer);
    
    // PDF files should start with "%PDF-" (0x25 0x50 0x44 0x46 0x2D)
    const pdfHeader = [0x25, 0x50, 0x44, 0x46, 0x2D];
    const hasValidHeader = pdfHeader.every((byte, index) => bytes[index] === byte);
    
    if (!hasValidHeader) {
      return {
        isValid: false,
        errorCode: 'PDF_CORRUPTED',
        errorMessage: 'PDF file appears to be corrupted or invalid (missing PDF header)'
      };
    }
    
    // Check if file has minimum size (a valid PDF should be at least a few hundred bytes)
    if (file.size < 100) {
      return {
        isValid: false,
        errorCode: 'PDF_CORRUPTED',
        errorMessage: 'PDF file is too small to be valid'
      };
    }
    
    // Read last few bytes to check for EOF marker
    const endBuffer = await file.slice(-8).arrayBuffer();
    const endBytes = new Uint8Array(endBuffer);
    const endString = new TextDecoder().decode(endBytes);
    
    // PDF files should end with "%%EOF"
    if (!endString.includes('%%EOF')) {
      return {
        isValid: false,
        errorCode: 'PDF_CORRUPTED',
        errorMessage: 'PDF file appears to be incomplete or corrupted (missing EOF marker)'
      };
    }
    
    return { isValid: true };
  } catch (error) {
    console.error('Error validating PDF:', error);
    return {
      isValid: false,
      errorCode: 'PDF_CORRUPTED',
      errorMessage: 'Unable to validate PDF file integrity'
    };
  }
}

/**
 * Get the page count of a PDF file
 * Uses PDF.js to load the document and count pages
 * 
 * @param file - PDF file to check
 * @returns Promise<number> - Number of pages, or 1 for non-PDF files
 */
export async function getPDFPageCount(file: File): Promise<number> {
  // For images, always return 1 page
  if (file.type.startsWith('image/')) {
    return 1;
  }

  // Only process PDFs
  if (file.type !== 'application/pdf') {
    return 1;
  }

  try {
    // Read file as ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    
    // Load PDF document
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    
    const pageCount = pdf.numPages;
    console.log(`📄 PDF page count: ${pageCount} pages`);
    
    return pageCount;
  } catch (error) {
    console.error('Error counting PDF pages:', error);
    // If we can't count pages, assume it's valid to avoid blocking uploads
    // The actual conversion will catch any real PDF issues
    return 1;
  }
}

/**
 * Validate that a file doesn't exceed the maximum page count
 * 
 * @param file - File to validate
 * @param maxPages - Maximum allowed pages (default: 30)
 * @returns FileValidationResult with pageCount included
 */
export async function validatePageCount(
  file: File, 
  maxPages: number = MAX_PDF_PAGES
): Promise<FileValidationResult> {
  const pageCount = await getPDFPageCount(file);
  
  if (pageCount > maxPages) {
    return {
      isValid: false,
      errorCode: 'TOO_MANY_PAGES',
      errorMessage: `File has ${pageCount} pages, which exceeds the maximum allowed of ${maxPages} pages`,
      pageCount
    };
  }
  
  return { 
    isValid: true,
    pageCount
  };
}

/**
 * Comprehensive file validation (without page count check)
 */
export async function validateFile(file: File): Promise<FileValidationResult> {
  // Check format
  const formatResult = validateFileFormat(file);
  if (!formatResult.isValid) {
    return formatResult;
  }
  
  // Check size
  const sizeResult = validateFileSize(file);
  if (!sizeResult.isValid) {
    return sizeResult;
  }
  
  // Check PDF integrity if it's a PDF
  if (file.type === 'application/pdf') {
    const pdfResult = await validatePDFIntegrity(file);
    if (!pdfResult.isValid) {
      return pdfResult;
    }
  }
  
  return { isValid: true };
}

/**
 * Comprehensive file validation including page count check
 * Use this before uploading files to ensure they meet all requirements
 */
export async function validateFileWithPageCount(file: File): Promise<FileValidationResult> {
  // First run standard validations
  const basicResult = await validateFile(file);
  if (!basicResult.isValid) {
    return basicResult;
  }
  
  // Then check page count for PDFs
  const pageCountResult = await validatePageCount(file);
  if (!pageCountResult.isValid) {
    return pageCountResult;
  }
  
  return { 
    isValid: true,
    pageCount: pageCountResult.pageCount
  };
}






