import { useState, useEffect, useRef, useCallback } from 'react';
import { createAirtableClient } from '@/lib/airtable/client';
import { getClientId } from '@/services/auth-service';
import { mapFileStatusToUI, getProcessingProgress } from '@/lib/status-mapper';
import { FILE_STATUS } from '@/lib/airtable/schema-types';
import { convertPDFToImages } from '@/lib/pdf-converter';
import { triggerOCRByFile } from '@/services/ocr-service';
import { uploadAndCreateSubFileRecords } from '@/services/subfile-service';
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
  
  // Ref to track IDs of files that need polling (key: uploadFileId, value: airtableRecordId)
  const activePollIdsRef = useRef<Map<string, string>>(new Map());
  
  // Ref to track consecutive error counts for each file (key: uploadFileId, value: error count)
  const errorCountRef = useRef<Map<string, number>>(new Map());
  
  // Ref to track consecutive error counts for each invoice (key: invoiceRecordId, value: error count)
  const invoiceErrorCountRef = useRef<Map<string, number>>(new Map());
  
  // Set to track invoices that have reached error threshold and should stop being considered for polling
  const invoicesStoppedPollingRef = useRef<Set<string>>(new Set());
  
  // Number of consecutive error polls before stopping
  const ERROR_POLL_THRESHOLD = 6;
  
  // Ref for the single polling interval
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Guard to prevent concurrent poll executions
  const isPollInProgressRef = useRef(false);
  
  // Guard to prevent concurrent fetch executions
  const isFetchInProgressRef = useRef(false);

  // Stop polling for a specific file (removes from active set)
  const stopPolling = useCallback((fileId: string, invoiceIds?: string[]) => {
    activePollIdsRef.current.delete(fileId);
    errorCountRef.current.delete(fileId); // Clean up error count
    
    // Clean up invoice-level error tracking for this file's invoices
    if (invoiceIds) {
      invoiceIds.forEach(invId => {
        invoiceErrorCountRef.current.delete(invId);
        invoicesStoppedPollingRef.current.delete(invId);
      });
    }
    
    console.log(`🛑 Removed file from polling list: ${fileId}`);
    
    // If no files left, clear interval
    if (activePollIdsRef.current.size === 0 && pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
      console.log('🛑 All polling stopped');
    }
  }, []);

  // Cleanup polling interval on unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      activePollIdsRef.current.clear();
      errorCountRef.current.clear();
      invoiceErrorCountRef.current.clear();
      invoicesStoppedPollingRef.current.clear();
    };
  }, []);

  /**
   * Fetch invoices in batch using filterByFormula
   */
  const fetchBatchInvoices = useCallback(async (baseId: string, allInvoiceIds: string[]) => {
    if (!allInvoiceIds || allInvoiceIds.length === 0) return [];
    
    try {
      const client = createAirtableClient(baseId);
      
      // Airtable URLs can be long, but formula has limit. 
      // Chunking if too many invoices (safeguard, though less likely to hit URL limit with small batches)
      const uniqueIds = [...new Set(allInvoiceIds)];
      const formula = `OR(${uniqueIds.map(id => `RECORD_ID()='${id}'`).join(',')})`;
      
      const response = await client.listRecords('Invoices', {
        filterByFormula: formula,
        // We only need fields required for parsing, but getAllRecords handles pagination if needed.
        // listRecords usually returns max 100. If we have > 100 active invoices, might need pagination or chunking.
        // For simplicity assuming < 100 active processing invoices at once for now.
      });

      return response.records.map(parseInvoiceRecord).filter(inv => !!inv);
    } catch (error) {
      console.error('❌ [Polling] Error batch fetching invoices:', error);
      return [];
    }
  }, []);

  /**
   * The single polling function that updates all active files
   */
  const pollActiveFiles = useCallback(async () => {
    // Prevent concurrent poll executions
    if (isPollInProgressRef.current) {
      console.log('⏳ Poll already in progress, skipping...');
      return;
    }
    
    const activeMap = activePollIdsRef.current;
    if (activeMap.size === 0) return;

    const baseId = import.meta.env.VITE_AIRTABLE_BASE_ID;
    if (!baseId) return;

    isPollInProgressRef.current = true;
    
    try {
      const client = createAirtableClient(baseId);
      const airtableIds = Array.from(activeMap.values());
      
      // 1. Batch fetch all active files
      const fileFormula = `OR(${airtableIds.map(id => `RECORD_ID()='${id}'`).join(',')})`;
      const filesResponse = await client.listRecords('Files', {
        filterByFormula: fileFormula
      });

      if (!filesResponse.records || filesResponse.records.length === 0) return;

      // Collect all invoice IDs from all files to batch fetch them
      const allInvoiceIds: string[] = [];
      filesResponse.records.forEach(record => {
        const invIds = record.fields['Invoices'] as string[];
        if (invIds && invIds.length > 0) {
          allInvoiceIds.push(...invIds);
        }
      });

      // 2. Batch fetch all related invoices
      const allInvoices = await fetchBatchInvoices(baseId, allInvoiceIds);
      const invoiceMap = new Map(allInvoices.map(inv => [inv?.recordId, inv])); // Map by Airtable Record ID

      // 3. Update state for each file
      setFiles(prevFiles => {
        return prevFiles.map(f => {
          // Find corresponding Airtable record for this file
          const airtableRecord = filesResponse.records.find(r => r.id === f.airtableRecordId);
          
          // If not in the batch response (or not active), skip update
          if (!activeMap.has(f.id) || !airtableRecord) return f;

          const fields = airtableRecord.fields;
          let processingStatus = fields['Processing-Status'] as string;
          let mainStatus = fields['Status'] as string;
          let errorCode = fields['Error-Code'] as string;
          let errorDescription = fields['Error-Description'] as string;
          const invoiceRecordIds = fields['Invoices'] as string[];

          // Default UI status
          let uiStatus = mapFileStatusToUI(mainStatus, processingStatus);
          
          let collectedIssues: string[] = [];
          let detailedIssues: DetailedIssue[] = [];
          let varianceInfo: { amount: string; direction: 'over' | 'under' } | undefined;
          let analysisSummary = '';
          let fileInvoices: any[] = [];

          // Process linked invoices
          if (invoiceRecordIds && invoiceRecordIds.length > 0) {
            fileInvoices = invoiceRecordIds
              .map(id => invoiceMap.get(id))
              .filter(inv => !!inv);

            if (fileInvoices.length > 0) {
              const errorInvoice = fileInvoices.find(inv => inv.status === 'Error');
              if (errorInvoice) {
                processingStatus = 'ERROR';
                mainStatus = 'Error';
                errorCode = parseErrorCode(errorInvoice.errorCode || '');
                errorDescription = parseErrorDescription(errorInvoice.errorDescription || '');
                uiStatus = 'error';
              } else {
                const warningInvoices = fileInvoices.filter(inv => 
                  inv.status === 'Matched' && 
                  ((inv.warnings && inv.warnings.length > 0) || (inv.balance !== undefined && inv.balance !== 0))
                );
                
                if (warningInvoices.length > 0) {
                  uiStatus = 'success-with-caveats';
                  
                  warningInvoices.forEach(inv => {
                     if (inv.warnings && inv.warnings.length > 0) {
                        inv.warnings.forEach((w: InvoiceWarningType) => {
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

                const allExported = fileInvoices.every(inv => inv.status === 'Exported');
                if (allExported && fileInvoices.length > 0) {
                    uiStatus = 'exported';
                }
              }
            }
          }

          const progress = getProcessingProgress(processingStatus);

          // Check if we should stop polling this file
          if (progress >= 100 || mainStatus === 'Error' || mainStatus === 'Processed' || uiStatus === 'exported') {
            // We use a timeout to avoid updating the ref during render if possible, 
            // though here we are inside setState callback so it's tricky. 
            // Better to trigger a side effect or just check status in next poll cycle.
            // For now, we'll mark it to stop in the next cycle effect or just removing it from ref here is safe? 
            // React best practice: don't mutate ref in render/setState.
            // However, activePollIdsRef is not used for rendering.
            
            // To be safe, we won't mutate ref here inside setFiles. 
            // We will let the useEffect handle stopping if needed, or check status outside.
            // But actually, we need to stop polling eventually.
            // Let's rely on the effect below to clean up completed files from the ref.
          }

          return {
            ...f,
            status: uiStatus,
            processingStatus,
            mainStatus,
            errorCode,
            errorDescription,
            invoices: fileInvoices.length > 0 ? fileInvoices : f.invoices,
            issues: collectedIssues.length > 0 ? collectedIssues : f.issues,
            detailedIssues: detailedIssues.length > 0 ? detailedIssues : f.detailedIssues,
            varianceInfo: varianceInfo || f.varianceInfo,
            analysisSummary: analysisSummary || f.analysisSummary
          };
        });
      });

      // Cleanup finished files from polling list
      setFiles(currentFiles => {
        currentFiles.forEach(f => {
          if (activeMap.has(f.id)) {
            const invoices = f.invoices || [];
            const finalInvoiceStatuses = ['Matched', 'Exported'];
            
            // Track invoice-level errors and determine which invoices are still being polled
            let invoicesStillProcessing = 0;
            let invoicesInFinalState = 0;
            let invoicesWithErrorThresholdReached = 0;
            
            if (invoices.length > 0) {
              invoices.forEach(inv => {
                if (!inv.recordId) return;
                
                const isInvoiceError = inv.status === 'Error';
                const isInvoiceFinal = finalInvoiceStatuses.includes(inv.status);
                const hasReachedThreshold = invoicesStoppedPollingRef.current.has(inv.recordId);
                
                if (isInvoiceError) {
                  if (hasReachedThreshold) {
                    // Invoice already marked as stopped - don't increment counter
                    invoicesWithErrorThresholdReached++;
                  } else {
                    // Track consecutive error occurrences for this invoice
                    const currentCount = invoiceErrorCountRef.current.get(inv.recordId) || 0;
                    const newCount = currentCount + 1;
                    invoiceErrorCountRef.current.set(inv.recordId, newCount);
                    
                    console.log(`⚠️ Invoice ${inv.recordId} (file ${f.id}) has error (${newCount}/${ERROR_POLL_THRESHOLD} polls)`);
                    
                    if (newCount >= ERROR_POLL_THRESHOLD) {
                      // Mark this invoice as stopped polling due to persistent error
                      invoicesStoppedPollingRef.current.add(inv.recordId);
                      invoiceErrorCountRef.current.delete(inv.recordId);
                      invoicesWithErrorThresholdReached++;
                      console.log(`🛑 Invoice ${inv.recordId} error persisted for ${ERROR_POLL_THRESHOLD} polls. Stopping poll for this invoice.`);
                    }
                    // Invoice has error but hasn't reached threshold yet - continue polling
                  }
                } else if (isInvoiceFinal) {
                  // Invoice completed successfully
                  invoicesInFinalState++;
                  // Clear any previous error count if the invoice recovered
                  if (invoiceErrorCountRef.current.has(inv.recordId)) {
                    console.log(`✅ Invoice ${inv.recordId} recovered from error state`);
                    invoiceErrorCountRef.current.delete(inv.recordId);
                    invoicesStoppedPollingRef.current.delete(inv.recordId);
                  }
                } else {
                  // Invoice still processing
                  invoicesStillProcessing++;
                  // Clear any previous error count if the invoice recovered
                  if (invoiceErrorCountRef.current.has(inv.recordId)) {
                    console.log(`✅ Invoice ${inv.recordId} recovered from error state`);
                    invoiceErrorCountRef.current.delete(inv.recordId);
                    invoicesStoppedPollingRef.current.delete(inv.recordId);
                  }
                }
              });
              
              // Log progress for files with multiple invoices
              if (invoices.length > 1) {
                console.log(`📊 File ${f.id}: ${invoicesInFinalState} final, ${invoicesStillProcessing} processing, ${invoicesWithErrorThresholdReached} error-stopped out of ${invoices.length} invoices`);
              }
              
              // Determine if file polling should stop
              // Stop only when ALL invoices are either in final state OR have reached error threshold
              const allInvoicesHandled = (invoicesInFinalState + invoicesWithErrorThresholdReached) === invoices.length;
              
              if (allInvoicesHandled && invoices.length > 0) {
                // All invoices are done (either successfully or with persistent errors)
                activeMap.delete(f.id);
                errorCountRef.current.delete(f.id);
                // Clean up invoice tracking for this file
                invoices.forEach(inv => {
                  if (inv.recordId) {
                    invoiceErrorCountRef.current.delete(inv.recordId);
                    invoicesStoppedPollingRef.current.delete(inv.recordId);
                  }
                });
                console.log(`✅ File ${f.id} completed (${invoicesInFinalState} successful, ${invoicesWithErrorThresholdReached} with errors). Stopping poll.`);
              }
              // If there are still processing invoices or active errors not yet at threshold, continue polling
              
            } else {
              // No invoices yet - use file-level status
              const isFileError = f.mainStatus === 'Error' || f.status === 'error';
              const isFileComplete = getProcessingProgress(f.processingStatus) >= 100 || 
                                     f.mainStatus === 'Processed' || 
                                     f.status === 'exported';
              
              if (isFileError) {
                // Track consecutive error occurrences at file level
                const currentCount = errorCountRef.current.get(f.id) || 0;
                const newCount = currentCount + 1;
                errorCountRef.current.set(f.id, newCount);
                
                console.log(`⚠️ File ${f.id} has error (${newCount}/${ERROR_POLL_THRESHOLD} polls)`);
                
                if (newCount >= ERROR_POLL_THRESHOLD) {
                  activeMap.delete(f.id);
                  errorCountRef.current.delete(f.id);
                  console.log(`🛑 File ${f.id} error persisted for ${ERROR_POLL_THRESHOLD} polls. Stopping poll.`);
                }
              } else if (isFileComplete) {
                activeMap.delete(f.id);
                errorCountRef.current.delete(f.id);
                console.log(`✅ File ${f.id} completed successfully. Stopping poll.`);
              } else {
                // Not an error and not complete - reset error count if needed
                if (errorCountRef.current.has(f.id)) {
                  console.log(`✅ File ${f.id} recovered from error state`);
                  errorCountRef.current.delete(f.id);
                }
              }
            }
          }
        });
        
        // Stop interval if empty
        if (activeMap.size === 0 && pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
        
        return currentFiles;
      });

    } catch (error) {
      console.error('❌ [Polling] Error in batch poll:', error);
    } finally {
      isPollInProgressRef.current = false;
    }
  }, [fetchBatchInvoices]);

  /**
   * Start polling a file by adding it to the active list
   * ensuring the global interval is running
   */
  const startFilePolling = useCallback((uploadFileId: string, airtableRecordId: string) => {
    if (activePollIdsRef.current.has(uploadFileId)) return;

    activePollIdsRef.current.set(uploadFileId, airtableRecordId);
    console.log(`Start polling for ${uploadFileId}`);

    if (!pollingIntervalRef.current) {
      // Run immediately
      pollActiveFiles();
      // Then interval
      pollingIntervalRef.current = setInterval(pollActiveFiles, 5000);
      console.log('🚀 Global polling interval started');
    }
  }, [pollActiveFiles]);

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
      if (file.type.startsWith('image/')) {
        console.log('🖼️ [Background] File is an image, skipping PDF conversion...');
        
        // Update page count to 1
        setFiles(prev => prev.map(f => 
          f.id === uploadId ? { ...f, pageCount: 1 } : f
        ));

        console.log(`🚀 [Background] Triggering OCR for file ID ${fileId}...`);
        const ocrResponse = await triggerOCRByFile(fileId);
        console.log('✅ [Background] OCR triggered, job ID:', ocrResponse.id);
        
        return;
      }

      console.log('🖼️  [Background] Converting PDF to images...');
      const images = await convertPDFToImages(fileUrl, file);
      console.log(`✅ [Background] PDF converted to ${images.length} images`);

      // Update local state with actual page count
      setFiles(prev => prev.map(f => 
        f.id === uploadId ? { ...f, pageCount: images.length } : f
      ));

      console.log(`📤 [Background] Uploading ${images.length} subfiles to Vercel and creating Airtable records...`);
      const { uploadResults, recordIds } = await uploadAndCreateSubFileRecords(
        images,
        airtableRecordId,
        'subfiles/'
      );
      console.log(`✅ [Background] ${uploadResults.length} subfiles uploaded and ${recordIds.length} records created`);

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
    // Prevent concurrent fetch executions (e.g., from React StrictMode double-mount)
    if (isFetchInProgressRef.current) {
      console.log('⏳ Fetch already in progress, skipping...');
      return;
    }
    
    const baseId = import.meta.env.VITE_AIRTABLE_BASE_ID;
    if (!baseId) {
      console.error('VITE_AIRTABLE_BASE_ID not configured');
      return;
    }

    isFetchInProgressRef.current = true;
    
    try {
      const client = createAirtableClient(baseId);
      const clientId = getClientId();
      
      // Build filter formula with client ID filtering
      const notClearedFilter = 'NOT({Cleared})';
      const clientIdFilter = clientId ? `{ClientId} = "${clientId}"` : '';
      const filterFormula = clientIdFilter 
        ? `AND(${notClearedFilter}, ${clientIdFilter})`
        : notClearedFilter;
      
      // 1. Fetch all files for this client
      console.log('📥 Fetching existing files...');
      const filesRecords = await client.getAllRecords('Files', {
        sort: [{ field: 'Created-At', direction: 'desc' }],
        filterByFormula: filterFormula
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
        const pageCount = fileRecord.fields['Pages'] as number | undefined;
        
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
                        inv.warnings.forEach((w: InvoiceWarningType) => {
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
            analysisSummary,
            pageCount, // Include page count from Airtable
        };
      });

      setFiles(mappedFiles);

      // 5. Start polling for active files
      // Poll if file is in processing state OR if any invoice is not in a final state
      const finalInvoiceStatuses = ['Matched', 'Exported', 'Error'];
      
      mappedFiles.forEach(file => {
         const isFileProcessing = file.status === 'uploading' || file.status === 'queued' || file.status === 'processing' || file.status === 'connecting';
         
         // Check if any invoice is still processing (not in final state)
         const hasProcessingInvoices = file.invoices && file.invoices.length > 0 && 
           file.invoices.some(inv => !finalInvoiceStatuses.includes(inv.status));
         
         if ((isFileProcessing || hasProcessingInvoices) && file.airtableRecordId) {
             startFilePolling(file.id, file.airtableRecordId);
         }
      });

    } catch (error) {
      console.error("Failed to fetch existing files", error);
    } finally {
      isFetchInProgressRef.current = false;
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
                    pageCount: result.pageCount, // Store page count from upload
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
        } else if (result.errorCode === 'TOO_MANY_PAGES') {
          setFiles((prev) =>
            prev.map((f) =>
              f.id === uploadFile.id
                ? {
                    ...f,
                    status: 'error' as UploadStatus,
                    errorCode: result.errorCode,
                    errorDescription: result.errorMessage,
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
    
    const file = files.find(f => f.id === fileId);
    
    // Pass invoice IDs to clean up invoice-level tracking
    const invoiceIds = file?.invoices?.map(inv => inv.recordId).filter((id): id is string => !!id);
    stopPolling(fileId, invoiceIds);
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
