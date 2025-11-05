/**
 * OpenAI Vision API Client with Native PDF Support
 * Uses OpenAI's native PDF processing instead of converting to images
 * Reference: https://platform.openai.com/docs/guides/pdf-files
 */

import OpenAI from 'openai';
import { VisionAPIError, OCRResult, PDFProcessingError } from './types';
import { getOCR2Settings } from './config';
import { createLogger, measurePerformance } from './logger';

const logger = createLogger('VisionClientNative');
const settings = getOCR2Settings();

/**
 * OpenAI client instance
 */
let openaiClient: OpenAI | null = null;

/**
 * Get or create OpenAI client
 */
function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: settings.openai.apiKey,
      baseURL: settings.openai.baseUrl,
      timeout: settings.openai.timeoutSeconds * 1000,
    });
    
    logger.info('OpenAI client initialized', {
      model: settings.openai.model,
      baseUrl: settings.openai.baseUrl || 'default',
      timeout: `${settings.openai.timeoutSeconds}s`
    });
  }
  
  return openaiClient;
}

/**
 * Extract text from PDF using OpenAI's native PDF support
 * This replaces the entire PDF-to-images pipeline with a single API call
 * Uses the Files API for proper PDF handling
 */
export async function extractTextFromPDF(pdfBuffer: Buffer): Promise<OCRResult> {
  const operation = async (): Promise<OCRResult> => {
    let fileId: string | null = null;
    
    try {
      const client = getOpenAIClient();
      const sizeMB = pdfBuffer.length / (1024 * 1024);
      
      logger.info('Uploading PDF to OpenAI Files API', {
        size: `${sizeMB.toFixed(2)}MB`,
        model: settings.openai.model
      });

      // Step 1: Upload the PDF file to OpenAI
      // Convert Buffer to Uint8Array for File constructor compatibility
      const pdfArray = new Uint8Array(pdfBuffer);
      const file = await client.files.create({
        file: new File([pdfArray], 'document.pdf', { type: 'application/pdf' }),
        purpose: 'assistants'
      });
      
      fileId = file.id;
      logger.info('PDF uploaded successfully', { fileId });

      // Step 2: Use the Chat Completions API with the file
      logger.info('Processing PDF with OpenAI Vision API');
      
      const apiCallStart = Date.now();
      
      // Build request options - handle different model requirements
      const requestOptions: any = {
        model: settings.openai.model,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Extract ALL text from this PDF document. Preserve the original formatting, spacing, and layout as much as possible. 

Instructions:
- Include all visible text from every page
- Preserve tables, lists, headers, and footers
- Maintain paragraph breaks and section divisions
- Include page numbers if visible
- If a page break is detected, indicate it with "--- PAGE BREAK ---"
- Do not add any commentary or explanations
- Return only the extracted text

Return the complete text extraction.`
              },
              {
                type: 'file',
                file: {
                  file_id: fileId
                }
              },
            ],
          },
        ],
      };

      // Temperature: Only set for models that support custom values
      // gpt-5 only supports default temperature (1), so we omit it for gpt-5
      if (!settings.openai.model.includes('gpt-5')) {
        requestOptions.temperature = 0.1; // Low temperature for consistent extraction
      }
      // For gpt-5, we omit temperature (defaults to 1)

      // Token limits: Use max_completion_tokens for gpt-4o and newer models, max_tokens for older ones
      if (settings.openai.model.includes('gpt-4o') || settings.openai.model.includes('gpt-5')) {
        requestOptions.max_completion_tokens = 16000;
      } else {
        requestOptions.max_tokens = 16000;
      }

      logger.info('Sending request to OpenAI API', {
        model: settings.openai.model,
        fileId,
        timeout: `${settings.openai.timeoutSeconds}s`
      });

      const response = await client.chat.completions.create(requestOptions);

      const apiCallDuration = Date.now() - apiCallStart;
      logger.info('OpenAI API call completed', {
        duration: `${apiCallDuration}ms`,
        durationSeconds: (apiCallDuration / 1000).toFixed(1)
      });

      const extractedText = response.choices[0]?.message?.content?.trim() || '';
      
      if (!extractedText || extractedText.length < 10) {
        throw new VisionAPIError('OpenAI returned empty or minimal text from PDF');
      }
      
      const result: OCRResult = {
        text: extractedText,
        confidence: 1.0, // Vision API doesn't provide confidence scores
        processingTime: 0, // Will be set by measurePerformance
        tokensUsed: {
          input: response.usage?.prompt_tokens || 0,
          output: response.usage?.completion_tokens || 0,
          total: response.usage?.total_tokens || 0,
        },
      };

      logger.info('OpenAI Vision API response received', {
        textLength: extractedText.length,
        tokensUsed: result.tokensUsed.total,
        inputTokens: result.tokensUsed.input,
        outputTokens: result.tokensUsed.output,
      });

      // Step 3: Clean up - delete the file
      try {
        await client.files.delete(fileId);
        logger.info('Cleaned up uploaded file', { fileId });
      } catch (cleanupError) {
        logger.warn('Failed to delete uploaded file', { 
          fileId, 
          error: cleanupError instanceof Error ? cleanupError.message : String(cleanupError) 
        });
        // Don't fail the entire operation if cleanup fails
      }

      return result;

    } catch (error) {
      logger.error('OpenAI Vision API call failed', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        errorType: error instanceof Error ? error.constructor.name : typeof error
      });

      // Clean up file on error if it was uploaded
      if (fileId) {
        try {
          await getOpenAIClient().files.delete(fileId);
          logger.info('Cleaned up uploaded file after error', { fileId });
        } catch (cleanupError) {
          logger.warn('Failed to delete file after error', { 
            fileId,
            cleanupError: cleanupError instanceof Error ? cleanupError.message : String(cleanupError)
          });
        }
      }

      if (error instanceof Error) {
        // Parse OpenAI API errors
        if (error.message.includes('rate_limit_exceeded')) {
          throw new VisionAPIError('Rate limit exceeded. Please try again later.', { 
            originalError: error,
            retryAfter: 60 
          });
        }
        
        if (error.message.includes('invalid_request_error')) {
          throw new VisionAPIError('Invalid request to Vision API. The PDF may be corrupted or too large.', { 
            originalError: error 
          });
        }
        
        if (error.message.includes('timeout') || error.message.includes('ETIMEDOUT') || error.message.includes('ECONNABORTED')) {
          throw new VisionAPIError('Vision API request timed out. This may be due to Vercel function timeout limits. Try a smaller file or contact support.', { 
            originalError: error 
          });
        }

        if (error.message.includes('context_length_exceeded')) {
          throw new VisionAPIError('PDF is too large (exceeds token limit). Try reducing the number of pages.', { 
            originalError: error 
          });
        }

        // Check for network errors
        if (error.message.includes('ECONNRESET') || error.message.includes('ENOTFOUND') || error.message.includes('EAI_AGAIN')) {
          throw new VisionAPIError('Network error while calling OpenAI API. Please check your internet connection and try again.', { 
            originalError: error 
          });
        }

        // Check for aborted requests (usually due to Vercel timeout)
        if (error.message.includes('aborted') || error.message.includes('cancelled')) {
          throw new VisionAPIError('Request was aborted. This usually means the Vercel function timed out. The platform may have execution time limits.', { 
            originalError: error 
          });
        }
      }

      throw new VisionAPIError(
        `OpenAI Vision API call failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        { originalError: error }
      );
    }
  };

  try {
    const { result, duration } = await measurePerformance(
      operation,
      'OpenAI native PDF processing',
      'VisionClientNative'
    );

    result.processingTime = duration;
    return result;

  } catch (error) {
    // Re-throw as-is if already a VisionAPIError
    if (error instanceof VisionAPIError) {
      throw error;
    }

    throw new VisionAPIError(
      `PDF processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      { originalError: error }
    );
  }
}

/**
 * Extract text from PDF with retry logic
 */
export async function extractTextFromPDFWithRetry(pdfBuffer: Buffer): Promise<OCRResult> {
  let attempt = 0;
  const maxAttempts = settings.openai.maxRetries + 1;
  let lastError: Error | null = null;

  while (attempt < maxAttempts) {
    try {
      attempt++;
      logger.info(`Processing PDF (attempt ${attempt}/${maxAttempts})`);
      
      const result = await extractTextFromPDF(pdfBuffer);
      
      logger.info('PDF processing succeeded', {
        attempt,
        textLength: result.text.length,
        tokensUsed: result.tokensUsed.total
      });
      
      return result;

    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt < maxAttempts) {
        const backoffDelay = settings.openai.retryBackoffSeconds * Math.pow(2, attempt - 1) * 1000;
        
        logger.warn(`PDF processing failed, retrying`, {
          attempt,
          maxAttempts,
          retryDelay: `${backoffDelay}ms`,
          error: error instanceof Error ? error.message : String(error)
        });
        
        await new Promise(resolve => setTimeout(resolve, backoffDelay));
      } else {
        logger.error(`PDF processing failed after all retries`, {
          attempts: maxAttempts,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }
  }

  // If we get here, all retries failed
  throw new VisionAPIError(
    `PDF processing failed after ${maxAttempts} attempts: ${lastError?.message || 'Unknown error'}`,
    { originalError: lastError, attempts: maxAttempts }
  );
}

/**
 * Test OpenAI Vision API connection with PDF support
 */
export async function testPDFSupport(): Promise<boolean> {
  let fileId: string | null = null;
  
  try {
    logger.info('Testing OpenAI PDF support');
    const client = getOpenAIClient();
    
    // Create a minimal test PDF (this is a valid 1-page PDF with "Test" text)
    const testPdfBase64 = 'JVBERi0xLjQKJcOkw7zDtsOfCjIgMCBvYmoKPDwvTGVuZ3RoIDMgMCBSL0ZpbHRlci9GbGF0ZURlY29kZT4+CnN0cmVhbQp4nDPQM1Qo5ypUMABCQyMDAAuvAkQKZW5kc3RyZWFtCmVuZG9iagozIDAgb2JqCjIzCmVuZG9iago1IDAgb2JqCjw8L0xlbmd0aCA2IDAgUi9GaWx0ZXIvRmxhdGVEZWNvZGUvTGVuZ3RoMSA0NzY+PgpzdHJlYW0KeJxTVVBQUFAw0jM01LOsBABGlgK2CmVuZHN0cmVhbQplbmRvYmoKNiAwIG9iago0MAplbmRvYmoKNyAwIG9iago8PC9UeXBlL0ZvbnREZXNjcmlwdG9yL0ZvbnROYW1lL0JBQUFBQStIZWx2ZXRpY2EvRm9udEJCb3hbMCAwIDAgMF0vRmxhZ3MgNC9Bc2NlbnQgNzE5L0NhcEhlaWdodCA3MTkvRGVzY2VudCAtMTk1L0l0YWxpY0FuZ2xlIDAvU3RlbVYgODAvTWF4V2lkdGggMTU2My9Gb250RmlsZTIgNSAwIFI+PgplbmRvYmoKOCAwIG9iago8PC9UeXBlL0ZvbnQvRm9udERlc2NyaXB0b3IgNyAwIFIvQmFzZUZvbnQvQkFBQUFBK0hlbHZldGljYS9TdWJ0eXBlL0NJREZvbnRUeXBlMi9DSURUb0dJRE1hcC9JZGVudGl0eS9DSURTeXN0ZW1JbmZvPDwvUmVnaXN0cnkoQWRvYmUpL09yZGVyaW5nKElkZW50aXR5KS9TdXBwbGVtZW50IDA+Pi9XWzMvWzI1MF1dPj4KZW5kb2JqCjkgMCBvYmoKPDwvVHlwZS9Gb250L1N1YnR5cGUvVHlwZTAvQmFzZUZvbnQvQkFBQUFBK0hlbHZldGljYS9Ub1VuaWNvZGUgMiAwIFIvRGVzY2VuZGFudEZvbnRzWzggMCBSXT4+CmVuZG9iagoxMCAwIG9iago8PC9UeXBlL1BhZ2VzL0NvdW50IDEvS2lkc1sxMSAwIFJdPj4KZW5kb2JqCjExIDAgb2JqCjw8L1R5cGUvUGFnZS9QYXJlbnQgMTAgMCBSL01lZGlhQm94WzAgMCA2MTIgNzkyXS9Db250ZW50cyA5IDAgUj4+CmVuZG9iagoxIDAgb2JqCjw8L1R5cGUvQ2F0YWxvZy9QYWdlcyAxMCAwIFI+PgplbmRvYmoKeHJlZgowIDEyCjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMTA4NCAwMDAwMCBuIAowMDAwMDAwMDE1IDAwMDAwIG4gCjAwMDAwMDAxMzQgMDAwMDAgbiAKMDAwMDAwMDAwMCAwMDAwMCBmIAowMDAwMDAwMTUzIDAwMDAwIG4gCjAwMDAwMDAyODEgMDAwMDAgbiAKMDAwMDAwMDMwMCAwMDAwMCBuIAowMDAwMDAwNTE1IDAwMDAwIG4gCjAwMDAwMDA3MjAgMDAwMDAgbiAKMDAwMDAwMDg0NiAwMDAwMCBuIAowMDAwMDAwOTAzIDAwMDAwIG4gCnRyYWlsZXIKPDwvU2l6ZSAxMi9Sb290IDEgMCBSL0lEIFs8ZGViODQ3ZDJmZGM4YjE0Nzk0MzI2NDVjOTNmY2FhOGE+PGRlYjg0N2QyZmRjOGIxNDc5NDMyNjQ1YzkzZmNhYThhPl0+PgpzdGFydHhyZWYKMTAwNAolJUVPRgo=';
    const testPdfBuffer = Buffer.from(testPdfBase64, 'base64');
    
    // Upload test PDF
    // Convert Buffer to Uint8Array for File constructor compatibility
    const testPdfArray = new Uint8Array(testPdfBuffer);
    const file = await client.files.create({
      file: new File([testPdfArray], 'test.pdf', { type: 'application/pdf' }),
      purpose: 'assistants'
    });
    
    fileId = file.id;
    logger.info('Test PDF uploaded', { fileId });
    
    // Build request with correct parameter based on model
    const requestOptions: any = {
      model: settings.openai.model,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Extract any text from this PDF.'
            },
            {
              type: 'file',
              file: {
                file_id: fileId
              }
            },
          ],
        },
      ],
    };

    // Use max_completion_tokens for gpt-4o and newer
    if (settings.openai.model.includes('gpt-4o') || settings.openai.model.includes('gpt-5')) {
      requestOptions.max_completion_tokens = 100;
    } else {
      requestOptions.max_tokens = 100;
    }
    
    // Try to process it
    const response = await client.chat.completions.create(requestOptions);
    
    const hasResponse = (response.choices[0]?.message?.content?.length || 0) > 0;
    
    // Clean up
    await client.files.delete(fileId);
    
    logger.info('PDF support test completed', {
      success: hasResponse,
      model: settings.openai.model,
      tokensUsed: response.usage?.total_tokens || 0,
      textLength: response.choices[0]?.message?.content?.length || 0
    });

    return hasResponse;

  } catch (error) {
    // Clean up on error
    if (fileId) {
      try {
        await getOpenAIClient().files.delete(fileId);
      } catch (cleanupError) {
        logger.warn('Failed to delete test file', { fileId });
      }
    }
    
    logger.error('PDF support test failed', {
      error: error instanceof Error ? error.message : String(error)
    });
    return false;
  }
}

/**
 * Get API usage statistics
 */
export function getAPIUsageStats() {
  return {
    model: settings.openai.model,
    timeout: settings.openai.timeoutSeconds,
    retries: settings.openai.maxRetries,
    nativePDFSupport: true,
    maxFileSize: '32MB',
    maxPages: 100,
  };
}


