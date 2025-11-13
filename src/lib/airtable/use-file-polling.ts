/**
 * Hook to poll for recently updated files
 * Checks every 8 seconds for files with status changes in the past 10 seconds
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { AirtableFile } from './files-hooks';

interface UseFilePollingOptions {
  /**
   * Polling interval in milliseconds
   * @default 8000 (8 seconds)
   */
  interval?: number;
  
  /**
   * Time window to check for updates in milliseconds
   * @default 10000 (10 seconds)
   */
  updateWindow?: number;
  
  /**
   * Whether to enable polling
   * @default true
   */
  enabled?: boolean;
  
  /**
   * Callback when updated files are detected
   */
  onUpdatesDetected?: (updatedFiles: AirtableFile[]) => void;
}

interface UseFilePollingResult {
  /** Recently updated file IDs */
  updatedFileIds: Set<string>;
  
  /** Clear the updated files set */
  clearUpdates: () => void;
  
  /** Whether polling is active */
  isPolling: boolean;
  
  /** Last poll time */
  lastPollTime: Date | null;
  
  /** Poll error if any */
  error: string | null;
}

const BASE_ID = typeof window !== 'undefined' 
  ? (window as any).NEXT_PUBLIC_AIRTABLE_BASE_ID || process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID
  : process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID;

/**
 * Transform Airtable record to AirtableFile (same as in files-hooks.ts)
 */
function transformAirtableRecord(record: any): AirtableFile {
    const relatedInvoices = record.fields['InvoiceHeaderID'] || record.fields['Invoices'] || [];
    const relatedEmails = record.fields['Emails'] || []; 
    const isLinked = relatedInvoices.length > 0;
    const errorCode = record.fields['Error-Code'] || '';
    const isDuplicate = errorCode === 'DUPLICATE_FILE';
    
    return {
        id: record.id,
        name: record.fields['FileName'] || record.fields['Name'] || '',
        uploadDate: record.fields['UploadedDate'] ? new Date(record.fields['UploadedDate']) : undefined,
        source: record.fields['Source'] || 'Upload',
        status: record.fields['Status'] || 'Queued',
        pages: record.fields['Pages'] || undefined,
        isDuplicate: isDuplicate,
        duplicateOf: [],
        relatedInvoices,
        activity: record.fields['Activity'] || [],
        relatedEmails,
        attachments: record.fields['Attachments'] || [],
        fileHash: record.fields['FileHash'] || record.fields['File Hash'] || undefined,
        errorCode: errorCode,
        errorDescription: record.fields['Error-Description'] || undefined,
        errorLink: record.fields['Error-Link'] || undefined,
        isLinked,
        createdAt: record.createdTime ? new Date(record.createdTime) : undefined,
        updatedAt: record.fields['Modified-At'] ? new Date(record.fields['Modified-At']) : undefined,
    };
}

export function useFilePolling(options: UseFilePollingOptions = {}): UseFilePollingResult {
  const {
    interval = 8000, // 8 seconds
    updateWindow = 10000, // 10 seconds
    enabled = true,
    onUpdatesDetected,
  } = options;

  const [updatedFileIds, setUpdatedFileIds] = useState<Set<string>>(new Set());
  const [isPolling, setIsPolling] = useState(false);
  const [lastPollTime, setLastPollTime] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const onUpdatesDetectedRef = useRef(onUpdatesDetected);

  // Keep callback ref updated
  useEffect(() => {
    onUpdatesDetectedRef.current = onUpdatesDetected;
  }, [onUpdatesDetected]);

  const clearUpdates = useCallback(() => {
    setUpdatedFileIds(new Set());
  }, []);

  const pollForUpdates = useCallback(async () => {
    if (!enabled) return;

    setIsPolling(true);
    setError(null);

    try {
      // Calculate timestamp for the update window
      const checkTime = new Date(Date.now() - updateWindow);
      const isoString = checkTime.toISOString();
      
      // Airtable formula to check if Status-Modified-Time is within the window
      const formula = `IS_AFTER({Status-Modified-Time}, "${isoString}")`;
      
      const queryParams = new URLSearchParams({
        baseId: BASE_ID || '',
        filterByFormula: formula,
        maxRecords: '50',
        'sort[0][field]': 'Status-Modified-Time',
        'sort[0][direction]': 'desc',
      });

      const response = await fetch(`/api/airtable/Files?${queryParams}`);

      if (!response.ok) {
        throw new Error(`Failed to poll files: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.records && data.records.length > 0) {
        // Transform Airtable records to AirtableFile entities
        const transformedFiles = data.records.map((record: any) => 
          transformAirtableRecord(record)
        );
        
        const newUpdatedIds = new Set<string>(transformedFiles.map((file: AirtableFile) => file.id));
        
        // Only trigger callback if we have new updates
        if (newUpdatedIds.size > 0) {
          setUpdatedFileIds(prev => {
            const combined = new Set([...prev, ...newUpdatedIds]);
            return combined;
          });

          // Trigger callback with transformed file data
          if (onUpdatesDetectedRef.current) {
            onUpdatesDetectedRef.current(transformedFiles);
          }
        }
      }

      setLastPollTime(new Date());
    } catch (err) {
      console.error('File polling error:', err);
      setError(err instanceof Error ? err.message : 'Failed to poll for updates');
    } finally {
      setIsPolling(false);
    }
  }, [enabled, updateWindow]);

  // Set up polling interval
  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Initial poll
    pollForUpdates();

    // Set up interval
    intervalRef.current = setInterval(pollForUpdates, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, interval, pollForUpdates]);

  return {
    updatedFileIds,
    clearUpdates,
    isPolling,
    lastPollTime,
    error,
  };
}

