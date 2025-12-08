import { useState, useEffect, useRef, useCallback } from 'react';
import { createAirtableClient } from '@/lib/airtable/client';
import { mapFileStatusToUI, getProcessingProgress } from '@/lib/status-mapper';
import { FILE_STATUS } from '@/lib/airtable/schema-types';
import { convertPDFToImages } from '@/lib/pdf-converter';
import { triggerOCRByFile } from '@/services/ocr-service';
import { uploadAndCreateImageRecords } from '@/services/image-service';
import { 
  parseInvoiceRecord, 
  parseErrorCode, 
  parseErrorDescription, 
  transformWarningToDetailedIssues, 
  generateAnalysisSummary, 
  deriveVarianceInfo,
  formatInvoiceWarning
} from '@/lib/invoice-helpers';
import type { UploadedFile, InvoiceWarningType } from '@/types/upload-file';
import type { UploadStatus, DetailedIssue } from '@/components/application/upload-status/upload-status-card';

export function useFilesPolling() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  
  // Track AbortControllers for each upload to allow cancellation
  const abortControllersRef = useRef<Map<string, AbortController>>(new Map());
  
  // Track polling intervals for each file
  const pollingIntervalsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const stopPolling = useCallback((fileId: string) => {
    const interval = pollingIntervalsRef.current.get(fileId);
    if (interval) {
      clearInterval(interval);
      pollingIntervalsRef.current.delete(fileId);
      console.log(`🛑 Polling stopped for file: ${fileId}`);
    }
  }, []);

  // Cleanup polling intervals on unmount
  useEffect(() => {
    return () => {
      pollingIntervalsRef.current.forEach((interval) => clearInterval(interval));
      pollingIntervalsRef.current.clear();
    };
  }, []);

  /**
   * Fetch all invoice information from Airtable
   */
  const fetchAllInvoices = useCallback(async (baseId: string, invoiceRecordIds: string[]) => {
    if (!invoiceRecordIds || invoiceRecordIds.length === 0) return null;
    try {
      const client = createAirtableClient(baseId);
      const invoices = [];
      for (const invoiceRecordId of invoiceRecordIds) {
        try {
          const invoiceRecord = await client.getRecord('Invoices', invoiceRecordId);
          const parsed = parseInvoiceRecord(invoiceRecord);
          if (parsed) invoices.push(parsed);
        } catch (error) {
          console.error(`❌ [Polling] Error fetching invoice ${invoiceRecordId}:`, error);
        }
      }
      return invoices.length > 0 ? invoices : null;
    } catch (error) {
      console.error('❌ [Polling] Error fetching invoices:', error);
    }
    return null;
  }, []);

  /**
   * Start polling a file's Processing-Status to update progress
   */
  const startFilePolling = useCallback((uploadFileId: string, airtableRecordId: string) => {
    const baseId = import.meta.env.VITE_AIRTABLE_BASE_ID;
    if (!baseId) {
      console.error('VITE_AIRTABLE_BASE_ID not configured');
      return;
    }

    if (pollingIntervalsRef.current.has(uploadFileId)) return;

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

          let uiStatus = mapFileStatusToUI(mainStatus, processingStatus);
          
          let collectedIssues: string[] = [];
          let detailedIssues: DetailedIssue[] = [];
          let varianceInfo: { amount: string; direction: 'over' | 'under' } | undefined;
          let analysisSummary = '';

          // Fetch invoice info if invoices are linked
          let invoices = null;
          if (invoiceRecordIds && invoiceRecordIds.length > 0) {
            invoices = await fetchAllInvoices(baseId, invoiceRecordIds);

            if (invoices) {
              const errorInvoice = invoices.find(inv => inv.status === 'Error');
              if (errorInvoice) {
                processingStatus = 'ERROR';
                mainStatus = 'Error';
                errorCode = parseErrorCode(errorInvoice.errorCode || '');
                errorDescription = parseErrorDescription(errorInvoice.errorDescription || '');
                uiStatus = 'error';
              } else {
                const warningInvoices = invoices.filter(inv => 
                  inv.status === 'Matched' && 
                  ((inv.warnings && inv.warnings.length > 0) || (inv.balance !== undefined && inv.balance !== 0))
                );
                
                if (warningInvoices.length > 0) {
                  uiStatus = 'success-with-caveats';
                  
                  // Re-calculate detailed issues and summary
                  warningInvoices.forEach(inv => {
                     if (inv.warnings && inv.warnings.length > 0) {
                        inv.warnings.forEach(w => {
                          const wIssues = transformWarningToDetailedIssues(w);
                          detailedIssues.push(...wIssues);
                        });
                     }
                     if (!varianceInfo && inv.balance) {
                        varianceInfo = deriveVarianceInfo(inv.balance);
                     }
                  });
                  
                  collectedIssues = detailedIssues.map(i => `${i.description} ${i.impact || ''}`);
                  if (warningInvoices[0]) {
                     analysisSummary = generateAnalysisSummary(detailedIssues, warningInvoices[0].vendor);
                  }
                }

                const allExported = invoices.every(inv => inv.status === 'Exported');
                if (allExported && invoices.length > 0) {
                    uiStatus = 'exported';
                }
              }
            }
          }

          setFiles((prev) =>
            prev.map((f) =>
              f.id === uploadFileId
                ? { 
                    ...f, 
                    status: uiStatus, 
                    processingStatus, 
                    mainStatus,
                    errorCode,
                    errorDescription,
                    ...(invoices && { invoices }),
                    ...(invoices ? { 
                        issues: collectedIssues,
                        detailedIssues: detailedIssues.length > 0 ? detailedIssues : undefined,
                        varianceInfo,
                        analysisSummary
                    } : {})
                  }
                : f
            )
          );

          if (progress >= 100 || mainStatus === 'Error' || mainStatus === 'Processed' || uiStatus === 'exported') {
            stopPolling(uploadFileId);
          }
        }
      } catch (error) {
        console.error('❌ [Polling] Error polling file:', error);
        stopPolling(uploadFileId);
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

    pollFile();
    const interval = setInterval(pollFile, 5000);
    pollingIntervalsRef.current.set(uploadFileId, interval);
  }, [fetchAllInvoices, stopPolling]);

  /**
   * Process PDF conversion, image upload, and OCR in the background
   */
  const processFileInBackground = useCallback(async (
    uploadId: string,
    fileId: number,
    fileUrl: string,
    file: File,
    airtableRecordId: string
  ): Promise<void> => {
    try {
      console.log('🖼️  [Background] Converting PDF to images...');
      const images = await convertPDFToImages(fileUrl, file);
      console.log(`✅ [Background] PDF converted to ${images.length} images`);

      setFiles(prev => prev.map(f => 
        f.id === uploadId ? { ...f, pageCount: images.length } : f
      ));

      console.log(`📤 [Background] Uploading ${images.length} images to Vercel and creating Airtable records...`);
      const { uploadResults, recordIds } = await uploadAndCreateImageRecords(
        images,
        airtableRecordId,
        'images/'
      );
      console.log(`✅ [Background] ${uploadResults.length} images uploaded and ${recordIds.length} records created`);

      console.log(`🚀 [Background] Triggering OCR for file ID ${fileId}...`);
      const ocrResponse = await triggerOCRByFile(fileId);
      console.log('✅ [Background] OCR triggered, job ID:', ocrResponse.id);
    } catch (error) {
      console.error('❌ [Background] processing failed:', error);
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
  }, [stopPolling]);

  /**
   * Fetch existing files on load
   */
  const fetchExistingFiles = useCallback(async () => {
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
      let invoiceRecords: any[] = [];
      if (filesRecords.length > 0) {
        console.log('📥 Fetching associated invoices...');
        invoiceRecords = await client.getAllRecords('Invoices');
        console.log(`✅ Fetched ${invoiceRecords.length} invoices`);
      }

      // 3. Create Invoice Map
      const invoiceMap = new Map<string, any>();
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
        const createdAtStr = fileRecord.fields['Created-At'] as string;
        const createdAt = createdAtStr ? new Date(createdAtStr) : new Date();
        const invoiceIds = (fileRecord.fields['Invoices'] as string[]) || [];
        
        // Find associated invoices
        const fileInvoices = invoiceIds
            .map(id => invoiceMap.get(id))
            .filter((inv): inv is any => !!inv)
            .map(parseInvoiceRecord)
            .filter((inv): inv is NonNullable<ReturnType<typeof parseInvoiceRecord>> => !!inv);
            
        // Determine UI status
        let uiStatus = mapFileStatusToUI(fileStatus, processingStatus);
        
        let collectedIssues: string[] = [];
        let detailedIssues: DetailedIssue[] = [];
        let varianceInfo: { amount: string; direction: 'over' | 'under' } | undefined;
        let analysisSummary = '';

        // Logic to refine status based on invoices
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
                   
                   // Generate detailed issues
                   warningInvoices.forEach(inv => {
                     // Add detailed issues from warnings
                     if (inv.warnings && inv.warnings.length > 0) {
                        inv.warnings.forEach(w => {
                          const wIssues = transformWarningToDetailedIssues(w);
                          detailedIssues.push(...wIssues);
                        });
                     }
                     // If balance issue exists but no detailed warning generated it (e.g. flat adjustment), add generic
                     if (inv.balance !== undefined && inv.balance !== 0 && detailedIssues.length === 0) {
                        // Fallback if no specific warnings but balance exists
                     }

                     // Update variance info from the first invoice with balance
                     if (!varianceInfo && inv.balance) {
                        varianceInfo = deriveVarianceInfo(inv.balance);
                     }
                   });

                   // Generate simple string issues for fallback/legacy props
                   collectedIssues = detailedIssues.map(i => `${i.description} ${i.impact ? `(${i.impact})` : ''}`);
                   
                   // Generate summary
                   if (warningInvoices[0]) {
                     analysisSummary = generateAnalysisSummary(detailedIssues, warningInvoices[0].vendor);
                   }
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
            type: 'application/pdf',
            airtableRecordId: fileRecord.id,
            processingStatus,
            mainStatus: fileStatus,
            errorCode,
            errorDescription,
            createdAt,
            invoices: fileInvoices,
            issues: collectedIssues,
            detailedIssues: detailedIssues.length > 0 ? detailedIssues : undefined,
            varianceInfo,
            analysisSummary
        };
      });

      setFiles(mappedFiles);

      // 5. Start polling for active files
      mappedFiles.forEach(file => {
         const isProcessing = file.status === 'uploading' || file.status === 'queued' || file.status === 'processing' || file.status === 'connecting';
         
         if (isProcessing && file.airtableRecordId) {
             startFilePolling(file.id, file.airtableRecordId);
         }
      });

    } catch (error) {
      console.error("Failed to fetch existing files", error);
    }
  }, [startFilePolling]);

  const uploadFiles = async (uploadedFiles: FileList) => {
    const newFiles: UploadedFile[] = Array.from(uploadedFiles).map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      status: 'uploading' as UploadStatus,
      type: file.type,
      createdAt: new Date(),
    }));

    setFiles((prev) => [...prev, ...newFiles]);

    for (const uploadFile of newFiles) {
      try {
        const actualFile = Array.from(uploadedFiles).find((f) => f.name === uploadFile.name);
        if (!actualFile) continue;

        const abortController = new AbortController();
        abortControllersRef.current.set(uploadFile.id, abortController);

        setFiles((prev) =>
          prev.map((f) => (f.id === uploadFile.id ? { ...f, status: 'uploading' as UploadStatus } : f))
        );

        const { uploadFile: uploadFileService } = await import('@/services/upload-service');
        const result = await uploadFileService(actualFile, abortController.signal);

        abortControllersRef.current.delete(uploadFile.id);

        if (result.success) {
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
          
          if (result.airtableRecordId) {
            startFilePolling(uploadFile.id, result.airtableRecordId);
          }

          if (result.fileId && result.url && result.airtableRecordId) {
            processFileInBackground(uploadFile.id, result.fileId, result.url, actualFile, result.airtableRecordId);
          }
        } else if (result.errorCode === 'DUPLICATE_FILE') {
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
        } else {
          throw new Error(result.error || 'Upload failed');
        }
      } catch (error) {
        abortControllersRef.current.delete(uploadFile.id);
        if (error instanceof Error && error.name === 'AbortError') return;
        
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

  const deleteFile = async (fileId: string) => {
    const abortController = abortControllersRef.current.get(fileId);
    if (abortController) {
      abortController.abort();
      abortControllersRef.current.delete(fileId);
    }
    
    stopPolling(fileId);
    
    const file = files.find(f => f.id === fileId);
    if (file?.airtableRecordId) {
      try {
        const baseId = import.meta.env.VITE_AIRTABLE_BASE_ID;
        if (baseId) {
          const client = createAirtableClient(baseId);
          await client.updateRecords('Files', {
            records: [{ id: file.airtableRecordId, fields: { 'Cleared': true } }]
          });
        }
      } catch (error) {
        console.error("Failed to clear file in Airtable:", error);
      }
    }
    
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  return {
    files,
    uploadFiles,
    deleteFile,
    fetchExistingFiles
  };
}

