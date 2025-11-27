/**
 * PDF to Images Converter using PDF.js
 * 
 * Converts PDF files to images (one image per page) using pdfjs-dist.
 * Works in the browser without any external dependencies besides pdfjs-dist.
 */

import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
// Use unpkg CDN which mirrors npm packages reliably
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

/**
 * Convert a PDF file to an array of image files (PNG format)
 * 
 * @param pdfUrl - URL of the PDF file (from Vercel Blob or any accessible URL)
 * @param pdfFile - Original PDF File object (optional, for metadata like filename)
 * @param options - Conversion options
 * @returns Promise<File[]> - Array of image files, one per page
 * 
 * @example
 * ```typescript
 * const images = await convertPDFToImages(blobUrl, pdfFile);
 * console.log(`Converted to ${images.length} images`);
 * ```
 */
export async function convertPDFToImages(
  pdfUrl: string,
  pdfFile?: File,
  options: {
    scale?: number;      // Scale factor for rendering (default: 2.0 for high quality)
    format?: 'png' | 'jpeg'; // Output format (default: 'png')
    quality?: number;    // JPEG quality 0-1 (default: 0.95, only for JPEG)
  } = {}
): Promise<File[]> {
  const { scale = 2.0, format = 'png', quality = 0.95 } = options;
  
  console.log('🔄 Converting PDF to images...');
  console.log(`   URL: ${pdfUrl}`);
  console.log(`   File: ${pdfFile?.name || 'N/A'}`);
  console.log(`   Scale: ${scale}x`);
  console.log(`   Format: ${format}`);
  
  try {
    // Load the PDF document
    const loadingTask = pdfjsLib.getDocument(pdfUrl);
    const pdf = await loadingTask.promise;
    const numPages = pdf.numPages;
    
    console.log(`✅ PDF loaded: ${numPages} pages`);
    
    const images: File[] = [];
    
    // Process each page
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      console.log(`   Processing page ${pageNum}/${numPages}...`);
      
      // Get the page
      const page = await pdf.getPage(pageNum);
      
      // Calculate viewport at the desired scale
      const viewport = page.getViewport({ scale });
      
      // Create a canvas element
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      if (!context) {
        throw new Error('Failed to get canvas 2D context');
      }
      
      // Set canvas dimensions
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      
      // Render the page to the canvas
      const renderContext = {
        canvasContext: context,
        viewport: viewport,
        canvas: canvas, // Required by pdfjs-dist types
      };
      
      await page.render(renderContext).promise;
      
      // Convert canvas to Blob
      const blob = await new Promise<Blob>((resolve, reject) => {
        if (format === 'jpeg') {
          canvas.toBlob(
            (blob) => {
              if (blob) resolve(blob);
              else reject(new Error('Failed to convert canvas to blob'));
            },
            'image/jpeg',
            quality
          );
        } else {
          canvas.toBlob(
            (blob) => {
              if (blob) resolve(blob);
              else reject(new Error('Failed to convert canvas to blob'));
            },
            'image/png'
          );
        }
      });
      
      // Create File object from Blob
      const originalName = pdfFile?.name?.replace(/\.pdf$/i, '') || 'document';
      const extension = format === 'jpeg' ? 'jpg' : 'png';
      const fileName = `${originalName}-page-${pageNum}.${extension}`;
      
      const imageFile = new File([blob], fileName, {
        type: format === 'jpeg' ? 'image/jpeg' : 'image/png',
      });
      
      images.push(imageFile);
      
      console.log(`   ✅ Page ${pageNum} converted (${(blob.size / 1024).toFixed(2)} KB)`);
    }
    
    console.log(`🎉 Conversion complete: ${images.length} images generated`);
    
    return images;
    
  } catch (error) {
    console.error('❌ PDF conversion failed:', error);
    throw new Error(
      `Failed to convert PDF to images: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Check if PDF.js is loaded and configured
 * @returns boolean - true if PDF.js is available
 */
export function isPDFConverterAvailable(): boolean {
  return typeof pdfjsLib !== 'undefined' && !!pdfjsLib.getDocument;
}

