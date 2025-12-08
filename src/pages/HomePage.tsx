import { useState, useEffect, useRef } from 'react';
import { FileUpload } from '@/components/application/file-upload/file-upload-base';
import { UploadStatusCard } from '@/components/application/upload-status/upload-status-card';
import type { UploadStatus } from '@/components/application/upload-status/upload-status-card';
import { convertPDFToImages } from '@/lib/pdf-converter';
import { triggerOCRByFile } from '@/services/ocr-service';
import { uploadAndCreateImageRecords } from '@/services/image-service';
import { createAirtableClient } from '@/lib/airtable/client';
import { mapFileStatusToUI, getProcessingProgress } from '@/lib/status-mapper';
import { FILE_STATUS } from '@/lib/airtable/schema-types';
import type { AirtableRecord } from '@/lib/airtable/types';

interface InvoiceWarning {
  Type: string;
  [key: string]: any;
}

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  status: UploadStatus;
  failed?: boolean;
  type?: string;
  isDuplicate?: boolean;
  duplicateInfo?: Record<string, unknown>;
  errorCode?: string;
  errorDescription?: string;
  errorLink?: string;
  airtableRecordId?: string;
  fileId?: number;
  processingStatus?: string;
  mainStatus?: string; // Airtable Status field
  pageCount?: number;
  invoices?: Array<{
    vendor: string;
    date: string;
    daysAgo: number;
    amount: string;
    description: string;
    invoiceNumber?: string;
    recordId?: string;
    status?: string;
    errorCode?: string;
    errorDescription?: string;
    warnings?: InvoiceWarning[];
    balance?: number;
  }>;
  issues?: string[];
}

// Format invoice warning to display message
const formatInvoiceWarning = (warning: InvoiceWarning): string | null => {
  // Type: 'balance' is now handled directly from the invoice record 'Balance' field
  
  if (warning.Type === 'line_amount') {
    if (warning.Items && Array.isArray(warning.Items)) {
      const items = warning.Items as { 
        LineNo: string; 
        DocQty: number; 
        RecQty: number; 
        DocPrice: number; 
        RecPrice: number; 
      }[];
      if (items.length === 0) return null;
      
      // Format as a single string since the UI handles lists of strings
      // We'll format it to look good in the UI
      const details = items.map(item => {
        const qtyMismatch = item.DocQty != null;
        const priceMismatch = item.DocPrice !=null;

        if (qtyMismatch && priceMismatch) {
          return `- Line ${item.LineNo} – quantity and unit price mismatch (Invoice: ${item.DocQty} @ $${item.DocPrice}, PO: ${item.RecQty} @ $${item.RecPrice}).`;
        } else if (qtyMismatch) {
          return `- Line ${item.LineNo} – quantity mismatch (Invoice: ${item.DocQty}, PO: ${item.RecQty}).`;
        } else if (priceMismatch) {
          return `- Line ${item.LineNo} – unit price mismatch (Invoice: $${item.DocPrice}, PO: $${item.RecPrice}).`;
        }
        return `- Line ${item.LineNo} – mismatch detected.`;
      }).join('\n');
      
      return `Line item mismatch(es) detected:\n${details}`;
    }
  }
  if (warning.Type === 'missing_receipts') {
    if (warning.ItemLineNumbers) {
      return `Line(s) ${warning.ItemLineNumbers} – item(s) not on PO.`;
    }
  }

  if (warning.Type === 'ai_matching') {
    if (warning.Message) {
      return warning.Message;
    }
  }
  return null;
};

// Parse error code to extract message outside brackets
const parseErrorCode = (code: string): string => {
  if (!code) return '';
  const match = code.match(/^\[.*?\]\s*(.*)$/);
  return match ? match[1] : code;
};

// Parse error description to get the first sentence
const parseErrorDescription = (description: string): string => {
  if (!description) return '';
  const dotIndex = description.indexOf('.');
  return dotIndex !== -1 ? description.substring(0, dotIndex + 1) : description;
};

// Helper to parse invoice record
const parseInvoiceRecord = (invoiceRecord: AirtableRecord) => {
  if (!invoiceRecord || !invoiceRecord.fields) return null;
  
  const vendorName = invoiceRecord.fields['Vendor-Name'] as string;
  const amount = invoiceRecord.fields['Amount'] as number;
  const date = invoiceRecord.fields['Date'] as string;
  const summary = invoiceRecord.fields['Summary'] as string;
  const invoiceNumber = invoiceRecord.fields['Invoice-Number'] as string;
  const status = invoiceRecord.fields['Status'] as string;
  const errorCode = invoiceRecord.fields['ErrorCode'] as string;
  const errorDescription = invoiceRecord.fields['Error-Description'] as string;
  const warningsRaw = invoiceRecord.fields['Warnings'];
  const balance = invoiceRecord.fields['Balance'] as number;

  // Parse warnings
  let warnings: InvoiceWarning[] = [];
  if (warningsRaw) {
    try {
      if (typeof warningsRaw === 'string') {
        warnings = JSON.parse(warningsRaw);
      } else if (Array.isArray(warningsRaw)) {
        warnings = warningsRaw as InvoiceWarning[];
      }
    } catch (e) {
      console.warn('Failed to parse warnings for invoice', invoiceRecord.id, e);
    }
  }

  // Format the data for the UI
  const invoiceDate = date ? new Date(date) : new Date();
  const daysAgo = Math.floor((Date.now() - invoiceDate.getTime()) / (1000 * 60 * 60 * 24));
  
  return {
    vendor: vendorName || 'Unknown Vendor',
    date: invoiceDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    daysAgo,
    amount: amount ? `$${amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}` : '$0.00',
    description: summary || 'Invoice details',
    invoiceNumber: invoiceNumber || undefined,
    recordId: invoiceRecord.id, // Include recordId for status updates
    status,
    errorCode,
    errorDescription,
    warnings,
    balance,
  };
};

// Helper function to get time-based greeting
function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) {
    return 'Good morning';
  } else if (hour < 18) {
    return 'Good afternoon';
  } else {
    return 'Good evening';
  }
}

export default function HomePage() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [greeting, setGreeting] = useState<string>('Hello');
  
  // Track AbortControllers for each upload to allow cancellation
  const abortControllersRef = useRef<Map<string, AbortController>>(new Map());
  
  // Track polling intervals for each file
  const pollingIntervalsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Set greeting only on client side
  useEffect(() => {
    setGreeting(getGreeting());
  }, []);

  const stopPolling = (fileId: string) => {
    const interval = pollingIntervalsRef.current.get(fileId);
    if (interval) {
      clearInterval(interval);
      pollingIntervalsRef.current.delete(fileId);
      console.log(`🛑 Polling stopped for file: ${fileId}`);
    }
  };

  /**
   * Fetch existing files on load
   */
  const fetchExistingFiles = async () => {
    const baseId = import.meta.env.VITE_AIRTABLE_BASE_ID;
    if (!baseId) {
      console.error('VITE_AIRTABLE_BASE_ID not configured');
      return;
    }

    try {
      const client = createAirtableClient(baseId);
      
      // 1. Fetch all files
      console.log('📥 Fetching existing files...');
      const filesRecords = await client.getAllRecords('Files', {
        sort: [{ field: 'Created-At', direction: 'desc' }],
        filterByFormula: 'NOT({Cleared})'
      });
      console.log(`✅ Fetched ${filesRecords.length} files`);

      // 2. Fetch all invoices (if files exist)
      let invoiceRecords: AirtableRecord[] = [];
      if (filesRecords.length > 0) {
        console.log('📥 Fetching associated invoices...');
        invoiceRecords = await client.getAllRecords('Invoices');
        console.log(`✅ Fetched ${invoiceRecords.length} invoices`);
      }

      // 3. Create Invoice Map
      const invoiceMap = new Map<string, AirtableRecord>();
      invoiceRecords.forEach(inv => invoiceMap.set(inv.id, inv));

      // 4. Map to UploadedFile
      const mappedFiles: UploadedFile[] = filesRecords.map(fileRecord => {
        const fileId = fileRecord.id;
        const fileName = fileRecord.fields['FileName'] as string || 'Untitled';
        const fileSize = 0; // Not available in Airtable unless parsed from Attachments
        const fileStatus = fileRecord.fields['Status'] as string;
        const processingStatus = fileRecord.fields['Processing-Status'] as string;
        const errorCode = fileRecord.fields['Error-Code'] as string;
        const errorDescription = fileRecord.fields['Error-Description'] as string;
        const invoiceIds = (fileRecord.fields['Invoices'] as string[]) || [];
        
        // Find associated invoices
        const fileInvoices = invoiceIds
            .map(id => invoiceMap.get(id))
            .filter((inv): inv is AirtableRecord => !!inv)
            .map(parseInvoiceRecord)
            .filter((inv): inv is NonNullable<ReturnType<typeof parseInvoiceRecord>> => !!inv);
            
        // Determine UI status
        let uiStatus = mapFileStatusToUI(fileStatus, processingStatus);
        let collectedIssues: string[] | undefined;
        
        // Logic from startFilePolling to refine status based on invoices
        if (fileInvoices.length > 0) {
             const errorInvoice = fileInvoices.find(inv => inv.status === 'Error');
             
             if (errorInvoice) {
                uiStatus = 'error';
             } else {
                 // Check for warnings (success-with-caveats)
                 const warningInvoices = fileInvoices.filter(inv => 
                   inv.status === 'Matched' && 
                   ((inv.warnings && inv.warnings.length > 0) || (inv.balance !== undefined && inv.balance !== 0))
                 );
                 
                 if (warningInvoices.length > 0) {
                   uiStatus = 'success-with-caveats';
                   collectedIssues = warningInvoices.flatMap(inv => {
                     const issues = [];
                     
                     // Check balance
                     if (inv.balance !== undefined && inv.balance !== 0) {
                       const absBalance = Math.abs(inv.balance);
                       if (inv.balance > 0) {
                         issues.push(`Invoice subtotal is $${absBalance} more than PO total.`);
                       } else {
                         issues.push(`Invoice subtotal is $${absBalance} less than PO total.`);
                       }
                     }
                     
                     // Check other warnings
                     if (inv.warnings && inv.warnings.length > 0) {
                       issues.push(...inv.warnings
                         .filter(w => w.Type !== 'balance')
                         .map(formatInvoiceWarning)
                         .filter((w): w is string => w !== null)
                       );
                     }
                     return issues;
                   });
                 }

                 // Check export status: if all invoices are 'Exported', status is 'exported'
                 const allExported = fileInvoices.every(inv => inv.status === 'Exported');
                 if (allExported) {
                     uiStatus = 'exported';
                 }
             }
        }
        
        return {
            id: fileId,
            name: fileName,
            size: fileSize,
            status: uiStatus,
            type: 'application/pdf', // Default assumption
            airtableRecordId: fileRecord.id,
            processingStatus,
            mainStatus: fileStatus,
            errorCode,
            errorDescription,
            invoices: fileInvoices,
            issues: collectedIssues,
        };
      });

      setFiles(mappedFiles);

      // 5. Start polling for active files
      mappedFiles.forEach(file => {
         // Files that are not in a final state should be polled
         // Final states: 'exported', 'success' (if no actions needed?), 'error' (if fatal)
         // Note: 'success' and 'success-with-caveats' might need polling if status changes externally, 
         // but usually polling stops when MATCHED.
         // However, the user might re-export or something changes.
         // Usually we poll while processing.
         
         const isProcessing = file.status === 'uploading' || file.status === 'queued' || file.status === 'processing' || file.status === 'connecting';
         
         // Also poll if Airtable status is Processing even if UI thinks it's something else (unlikely given mapping)
         // Or if it's Queued in Airtable.
         
         if (isProcessing && file.airtableRecordId) {
             startFilePolling(file.id, file.airtableRecordId);
         }
      });

    } catch (error) {
      console.error("Failed to fetch existing files", error);
    }
  };

  useEffect(() => {
      fetchExistingFiles();
  }, []);

  /**
   * Process PDF conversion, image upload, and OCR in the background
   * This runs after the file upload is complete and doesn't block the UI
   * 
   * New Flow:
   * 1. Convert PDF to images
   * 2. Upload images to Vercel Blob
   * 3. Create Image records in Airtable (linked to File)
   * 4. Trigger OCR with fileId only
   */
  const processFileInBackground = async (
    uploadId: string,
    fileId: number,
    fileUrl: string,
    file: File,
    airtableRecordId: string
  ): Promise<void> => {
    try {
      // Step 5: Convert PDF to images
      console.log('🖼️  [Background] Converting PDF to images...');
      const images = await convertPDFToImages(fileUrl, file);
      console.log(`✅ [Background] PDF converted to ${images.length} images`);

      // Update file with page count immediately so UI shows "Attempting to extract text from X pages..."
      setFiles(prev => prev.map(f => 
        f.id === uploadId ? { ...f, pageCount: images.length } : f
      ));

      // Step 6: Upload images to Vercel and create Image records in Airtable
      console.log(`📤 [Background] Uploading ${images.length} images to Vercel and creating Airtable records...`);
      const { uploadResults, recordIds } = await uploadAndCreateImageRecords(
        images,
        airtableRecordId,
        'images/'
      );
      console.log(`✅ [Background] ${uploadResults.length} images uploaded and ${recordIds.length} records created`);

      // Step 7: Trigger OCR with fileId only (backend will fetch images from Airtable)
      console.log(`🚀 [Background] Triggering OCR for file ID ${fileId}...`);
      const ocrResponse = await triggerOCRByFile(fileId);
      console.log('✅ [Background] OCR triggered, job ID:', ocrResponse.id);
    } catch (error) {
      console.error('❌ [Background] PDF conversion, image upload, or OCR failed:', error);
      
      stopPolling(uploadId);

      setFiles(prev => prev.map(f => 
        f.id === uploadId ? { 
          ...f, 
          status: 'error',
          errorCode: 'PROCESSING_ERROR',
          errorDescription: error instanceof Error ? error.message : 'Processing failed'
        } : f
      ));
    }
  };

  /**
   * Fetch all invoice information from Airtable
   */
  const fetchAllInvoices = async (baseId: string, invoiceRecordIds: string[]) => {
    if (!invoiceRecordIds || invoiceRecordIds.length === 0) return null;

    try {
      const client = createAirtableClient(baseId);
      const invoices = [];

      // Fetch all invoices
      for (const invoiceRecordId of invoiceRecordIds) {
        try {
          const invoiceRecord = await client.getRecord('Invoices', invoiceRecordId);
          const parsed = parseInvoiceRecord(invoiceRecord);
          if (parsed) {
            invoices.push(parsed);
          }
        } catch (error) {
          console.error(`❌ [Polling] Error fetching invoice ${invoiceRecordId}:`, error);
        }
      }

      return invoices.length > 0 ? invoices : null;
    } catch (error) {
      console.error('❌ [Polling] Error fetching invoices:', error);
    }
    
    return null;
  };

  /**
   * Start polling a file's Processing-Status to update progress
   */
  const startFilePolling = (uploadFileId: string, airtableRecordId: string) => {
    const baseId = import.meta.env.VITE_AIRTABLE_BASE_ID;
    if (!baseId) {
      console.error('VITE_AIRTABLE_BASE_ID not configured');
      return;
    }

    // Check if we already have a poller for this file
    if (pollingIntervalsRef.current.has(uploadFileId)) {
        return;
    }

    const pollFile = async () => {
      try {
        const client = createAirtableClient(baseId);
        const response = await client.getRecord('Files', airtableRecordId);
        
        if (response && response.fields) {
          let processingStatus = response.fields['Processing-Status'] as string;
          let mainStatus = response.fields['Status'] as string;
          let errorCode = response.fields['Error-Code'] as string;
          let errorDescription = response.fields['Error-Description'] as string;
          const progress = getProcessingProgress(processingStatus);
          const invoiceRecordIds = response.fields['Invoices'] as string[];

          console.log(`📊 [Polling] File ${airtableRecordId}: ${mainStatus}/${processingStatus} (${progress}%)`);

          // Map the Airtable status to UI status
          let uiStatus = mapFileStatusToUI(mainStatus, processingStatus);
          let collectedIssues: string[] | undefined;

          // Fetch invoice info if invoices are linked (don't wait for MATCHING status)
          let invoices = null;
          if (invoiceRecordIds && invoiceRecordIds.length > 0) {
            // console.log(`📄 [Polling] Found ${invoiceRecordIds.length} invoice(s), fetching details...`);
            invoices = await fetchAllInvoices(baseId, invoiceRecordIds);

            // Check for invoice errors and override status if needed
            if (invoices) {
              const errorInvoice = invoices.find(inv => inv.status === 'Error');
              if (errorInvoice) {
                console.log(`❌ [Polling] Invoice ${errorInvoice.recordId} has error: ${errorInvoice.errorCode}`);
                
                processingStatus = 'ERROR';
                mainStatus = 'Error';
                errorCode = parseErrorCode(errorInvoice.errorCode || '');
                errorDescription = parseErrorDescription(errorInvoice.errorDescription || '');
                uiStatus = 'error';
              } else {
                // Check for warnings (success-with-caveats)
                // Definition: status is Matched AND (has Warnings property that is NOT null and non-empty OR balance is not 0)
                const warningInvoices = invoices.filter(inv => 
                  inv.status === 'Matched' && 
                  ((inv.warnings && inv.warnings.length > 0) || (inv.balance !== undefined && inv.balance !== 0))
                );
                
                if (warningInvoices.length > 0) {
                  // console.log(`⚠️ [Polling] Found ${warningInvoices.length} invoice(s) with warnings`);
                  uiStatus = 'success-with-caveats';
                  collectedIssues = warningInvoices.flatMap(inv => {
                    const issues = [];
                    
                    // Check balance first
                    if (inv.balance !== undefined && inv.balance !== 0) {
                      const absBalance = Math.abs(inv.balance);
                      
                      if (inv.balance > 0) {
                        issues.push(`Invoice subtotal is $${absBalance} more than PO total.`);
                      } else {
                        issues.push(`Invoice subtotal is $${absBalance} less than PO total.`);
                      }
                    }
                    
                    // Check other warnings
                    if (inv.warnings && inv.warnings.length > 0) {
                      issues.push(...inv.warnings
                        .filter(w => w.Type !== 'balance') // Ignore balance type warnings from the array
                        .map(formatInvoiceWarning)
                        .filter((w): w is string => w !== null)
                      );
                    }
                    
                    return issues;
                  });
                }

                // Check export status
                const allExported = invoices.every(inv => inv.status === 'Exported');
                if (allExported && invoices.length > 0) {
                    uiStatus = 'exported';
                }
              }
            }
          }

          // Update the file's status, progress, processingStatus, and invoices
          setFiles((prev) =>
            prev.map((f) =>
              f.id === uploadFileId
                ?                   { 
                    ...f, 
                    status: uiStatus, 
                    processingStatus, 
                    mainStatus,
                    errorCode,
                    errorDescription,
                    ...(invoices && { invoices }), // Only update if fetched
                    ...(invoices ? { issues: collectedIssues || [] } : {})
                  }
                : f
            )
          );

          // Stop polling if complete or error
          // Added check for exported
          if (progress >= 100 || mainStatus === 'Error' || mainStatus === 'Processed' || uiStatus === 'exported') {
            // If it's processed but we want to catch export updates if initiated, we might keep polling?
            // But usually polling stops at processed/matched. Export is a separate action or status update.
            // If status is exported, we definitely stop.
            stopPolling(uploadFileId);
          }
        }
      } catch (error) {
        console.error('❌ [Polling] Error polling file:', error);
        
        stopPolling(uploadFileId);

        // Update UI to show error
        setFiles((prev) =>
          prev.map((f) =>
            f.id === uploadFileId
              ? {
                  ...f,
                  status: 'error',
                  errorCode: 'POLLING_ERROR',
                  errorDescription: error instanceof Error ? error.message : 'Connection lost',
                }
              : f
          )
        );
      }
    };

    // Poll immediately, then every 5 seconds
    pollFile();
    const interval = setInterval(pollFile, 5000);
    pollingIntervalsRef.current.set(uploadFileId, interval);
  };

  // Cleanup polling intervals on unmount
  useEffect(() => {
    return () => {
      pollingIntervalsRef.current.forEach((interval) => clearInterval(interval));
      pollingIntervalsRef.current.clear();
    };
  }, []);

  const uploadFiles = async (uploadedFiles: FileList) => {
    const newFiles: UploadedFile[] = Array.from(uploadedFiles).map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      status: 'uploading' as UploadStatus,
      type: file.type,
    }));

    setFiles((prev) => [...prev, ...newFiles]);

    // Upload each file using the new service
    for (const uploadFile of newFiles) {
      try {
        // Get the actual File object
        const actualFile = Array.from(uploadedFiles).find((f) => f.name === uploadFile.name);
        if (!actualFile) continue;

        // Create an AbortController for this upload
        const abortController = new AbortController();
        abortControllersRef.current.set(uploadFile.id, abortController);

        // Keep uploading status during upload
        setFiles((prev) =>
          prev.map((f) => (f.id === uploadFile.id ? { ...f, status: 'uploading' as UploadStatus } : f))
        );

        // Import and call the new upload service with abort signal
        const { uploadFile: uploadFileService } = await import('@/services/upload-service');
        const result = await uploadFileService(actualFile, abortController.signal);

        // Clean up the abort controller after successful upload
        abortControllersRef.current.delete(uploadFile.id);

        if (result.success) {
          // Upload successful - file is now in Vercel and Airtable
          // Set initial status to 'queued' (UPL status) and start polling
          setFiles((prev) =>
            prev.map((f) =>
              f.id === uploadFile.id
                ? {
                    ...f,
                    status: 'queued' as UploadStatus,
                    airtableRecordId: result.airtableRecordId,
                    fileId: result.fileId,
                    processingStatus: 'UPL',
                    mainStatus: FILE_STATUS.QUEUED,
                  }
                : f
            )
          );
          console.log('✅ File uploaded successfully:', {
            filename: result.filename,
            fileId: result.fileId,
            url: result.url,
          });

          // Start polling to track Processing-Status and update progress
          if (result.airtableRecordId) {
            startFilePolling(uploadFile.id, result.airtableRecordId);
          }

          // Start background processing (PDF conversion + image upload + OCR)
          if (result.fileId && result.url && result.airtableRecordId) {
            console.log('🔄 Starting PDF conversion, image upload, and OCR in background...');
            processFileInBackground(uploadFile.id, result.fileId, result.url, actualFile, result.airtableRecordId);
          }
        } else if (result.errorCode === 'DUPLICATE_FILE') {
          // Handle duplicate file gracefully - show UI feedback instead of error
          setFiles((prev) =>
            prev.map((f) =>
              f.id === uploadFile.id
                ? {
                    ...f,
                    status: 'duplicate' as UploadStatus,
                    isDuplicate: true,
                    errorCode: result.errorCode,
                    errorDescription: result.errorMessage,
                    errorLink: result.duplicateRecordId 
                      ? `/files?id=${result.duplicateRecordId}` 
                      : undefined,
                  }
                : f
            )
          );
          console.log('⚠️ Duplicate file detected:', uploadFile.name, '- Original file ID:', result.duplicateRecordId);
        } else {
          // Upload failed for other reasons
          throw new Error(result.error || 'Upload failed');
        }
      } catch (error) {
        // Clean up the abort controller on error
        abortControllersRef.current.delete(uploadFile.id);
        
        // Check if the error was due to abort (user cancelled)
        if (error instanceof Error && error.name === 'AbortError') {
          console.log('⚠️ Upload cancelled:', uploadFile.name);
          // Don't show error state for user-initiated cancellation
          return;
        }
        
        console.error('❌ Upload error:', error);
        setFiles((prev) =>
          prev.map((f) => 
            f.id === uploadFile.id 
              ? { 
                  ...f, 
                  failed: true, 
                  status: 'error' as UploadStatus,
                  errorCode: 'UPLOAD_ERROR',
                  errorDescription: error instanceof Error ? error.message : 'Upload failed'
                } 
              : f
          )
        );
      }
    }
  };

  const handleDelete = async (fileId: string) => {
    // Abort the upload if it's in progress
    const abortController = abortControllersRef.current.get(fileId);
    if (abortController) {
      abortController.abort();
      abortControllersRef.current.delete(fileId);
      console.log('🛑 Upload cancelled for file:', fileId);
    }
    
    stopPolling(fileId);
    
    // Find the file to get its airtableRecordId and mark as cleared
    const file = files.find(f => f.id === fileId);
    if (file?.airtableRecordId) {
      try {
        const baseId = import.meta.env.VITE_AIRTABLE_BASE_ID;
        if (baseId) {
          const client = createAirtableClient(baseId);
          await client.updateRecords('Files', {
            records: [{ id: file.airtableRecordId, fields: { 'Cleared': true } }]
          });
          console.log(`✅ Cleared file ${fileId} (record ${file.airtableRecordId})`);
        }
      } catch (error) {
        console.error("Failed to clear file in Airtable:", error);
      }
    }
    
    // Remove file from UI
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const handleRetry = (fileId: string) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === fileId ? { ...f, failed: false, status: 'uploading' as UploadStatus } : f))
    );
    // Note: In a real implementation, you would restart the actual upload here
  };

  const handleCancel = (fileId: string) => {
    handleDelete(fileId);
  };

  const handleRemove = (fileId: string) => {
    handleDelete(fileId);
  };

  const handleGetHelp = (fileId: string) => {
    console.log('Getting help for file:', fileId);
    // Handle get help logic
  };

  const handleViewFile = (fileId: string) => {
    console.log('Viewing file:', fileId);
    // Handle view file logic
  };

  return (
    <div className="h-full overflow-auto bg-primary">
      <div className="container mx-auto max-w-4xl p-6">
        {/* Greeting Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-secondary mb-2">{greeting}, Sherry</h1>
          <p className="text-tertiary">
            Upload your documents to get started with automated invoice processing.
          </p>
        </div>

        {/* Upload Area */}
        <FileUpload.Root>
          <FileUpload.DropZone
            hint="All document types accepted - PDF, DOC, XLS, images, and more up to 50MB"
            maxSize={50 * 1024 * 1024} // 50MB
            allowsMultiple={false}
            onDropFiles={uploadFiles}
            onDropUnacceptedFiles={(rejectedFiles) => {
              console.log('Rejected files:', rejectedFiles);
              // Handle rejected files (show error message, etc.)
            }}
            onSizeLimitExceed={(oversizedFiles) => {
              console.log('Oversized files:', oversizedFiles);
              // Handle oversized files (show error message, etc.)
            }}
          />

          {files.length > 0 && (
            <div className="mt-6 space-y-4">
              <h2 className="text-lg font-medium text-secondary">Upload Progress</h2>

              {files.map((file) => (
                <UploadStatusCard
                  key={file.id}
                  filename={file.name}
                  status={file.status}
                  processingStatus={file.processingStatus as 'UPL' | 'DETINV' | 'PARSE' | 'RELINV' | 'MATCHING' | 'MATCHED' | 'ERROR' | undefined}
                  fileSize={file.size}
                  pageCount={file.pageCount}
                  invoices={file.invoices}
                  issues={file.issues}
                  errorCode={file.errorCode}
                  errorMessage={file.errorDescription}
                  onCancel={() => handleCancel(file.id)}
                  onRemove={() => handleRemove(file.id)}
                  onGetHelp={() => handleGetHelp(file.id)}
                  onViewFile={() => handleViewFile(file.id)}
                />
              ))}
            </div>
          )}
        </FileUpload.Root>
      </div>
    </div>
  );
}
