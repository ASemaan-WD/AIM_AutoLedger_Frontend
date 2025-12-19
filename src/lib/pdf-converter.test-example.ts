/**
 * Example usage of PDF converter
 * 
 * This is an example file showing how to use the PDF converter.
 * You can delete this file or use it as a reference.
 */

import { convertPDFToImages, isPDFConverterAvailable } from './pdf-converter';
import { getToken } from '@/services/auth-service';

/**
 * Example: Convert a PDF from a URL
 */
async function exampleConvertFromUrl() {
  const pdfUrl = 'https://example.com/document.pdf';
  
  try {
    const images = await convertPDFToImages(pdfUrl);
    console.log(`✅ Converted ${images.length} pages`);
    
    images.forEach((image, index) => {
      console.log(`   Page ${index + 1}: ${image.name} (${(image.size / 1024).toFixed(2)} KB)`);
    });
    
    return images;
  } catch (error) {
    console.error('❌ Conversion failed:', error);
    throw error;
  }
}

/**
 * Example: Convert a PDF with custom options
 */
async function exampleConvertWithOptions() {
  const pdfUrl = 'https://example.com/document.pdf';
  
  const images = await convertPDFToImages(pdfUrl, undefined, {
    scale: 1.5,      // Lower scale = smaller images
    format: 'jpeg',  // Use JPEG instead of PNG
    quality: 0.8,    // JPEG quality (0-1)
  });
  
  console.log(`✅ Converted to JPEG: ${images.length} images`);
  return images;
}

/**
 * Example: Convert from a File object
 */
async function exampleConvertFromFile(file: File) {
  // Create a blob URL from the file
  const blobUrl = URL.createObjectURL(file);
  
  try {
    const images = await convertPDFToImages(blobUrl, file);
    console.log(`✅ Converted ${file.name}: ${images.length} pages`);
    
    // Clean up the blob URL
    URL.revokeObjectURL(blobUrl);
    
    return images;
  } catch (error) {
    // Clean up on error too
    URL.revokeObjectURL(blobUrl);
    throw error;
  }
}

/**
 * Example: Check if PDF.js is available
 */
function exampleCheckAvailability() {
  if (isPDFConverterAvailable()) {
    console.log('✅ PDF converter is available');
  } else {
    console.log('❌ PDF converter is not available');
  }
}

/**
 * Example: Integration with file upload
 */
async function exampleFileUploadIntegration(file: File) {
  console.log('📤 Uploading and converting file...');
  
  // 1. Upload to storage (e.g., Vercel Blob)
  const uploadedUrl = 'https://blob.vercel-storage.com/file.pdf'; // Example
  
  // 2. Convert to images
  const images = await convertPDFToImages(uploadedUrl, file);
  
  // 3. Upload images to OCR service
  const formData = new FormData();
  formData.append('fileId', '12345');
  images.forEach((image, index) => {
    formData.append(`file${index + 1}`, image);
  });
  
  // Get stored auth token for bearer authentication
  const token = getToken();
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch('/api/ocr/trigger-with-files', {
    method: 'POST',
    headers,
    body: formData,
  });
  
  console.log('✅ Images sent to OCR service');
  return response.json();
}

// Export examples
export {
  exampleConvertFromUrl,
  exampleConvertWithOptions,
  exampleConvertFromFile,
  exampleCheckAvailability,
  exampleFileUploadIntegration,
};

