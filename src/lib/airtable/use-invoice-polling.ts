/**
 * Hook to poll for recently updated invoices
 * Checks every 8 seconds for invoices with status changes in the past 10 seconds
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createAirtableClient } from './client';
import { getClientId } from '@/services/auth-service';
import { transformAirtableToInvoiceEntity } from './transforms';
import type { Invoice } from '@/types/documents';
import type { AirtableRecord } from './types';

interface UseInvoicePollingOptions {
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
   * Callback when updated invoices are detected
   */
  onUpdatesDetected?: (updatedInvoices: Invoice[]) => void;
}

interface UseInvoicePollingResult {
  /** Recently updated invoice IDs */
  updatedInvoiceIds: Set<string>;
  
  /** Clear the updated invoices set */
  clearUpdates: () => void;
  
  /** Whether polling is active */
  isPolling: boolean;
  
  /** Last poll time */
  lastPollTime: Date | null;
  
  /** Poll error if any */
  error: string | null;
}

const BASE_ID = import.meta.env.VITE_AIRTABLE_BASE_ID;

export function useInvoicePolling(options: UseInvoicePollingOptions = {}): UseInvoicePollingResult {
  const {
    interval = 8000, // 8 seconds
    updateWindow = 10000, // 10 seconds
    enabled = true,
    onUpdatesDetected,
  } = options;

  const [updatedInvoiceIds, setUpdatedInvoiceIds] = useState<Set<string>>(new Set());
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
    setUpdatedInvoiceIds(new Set());
  }, []);

  const pollForUpdates = useCallback(async () => {
    if (!enabled) return;

    setIsPolling(true);
    setError(null);

    try {
      const client = createAirtableClient(BASE_ID);
      const clientId = getClientId();
      
      // Calculate timestamp for the update window
      const checkTime = new Date(Date.now() - updateWindow);
      const isoString = checkTime.toISOString();
      
      // Airtable formula to check if Status-Modified-Time is within the window AND matches client ID
      const timeFilter = `IS_AFTER({Status-Modified-Time}, "${isoString}")`;
      const formula = clientId 
        ? `AND(${timeFilter}, {ClientId} = "${clientId}")`
        : timeFilter;

      const data = await client.listRecords('Invoices', {
        filterByFormula: formula,
        maxRecords: 50,
        sort: [{ field: 'Status-Modified-Time', direction: 'desc' }]
      });
      
      if (data.records && data.records.length > 0) {
        // Transform Airtable records to Invoice entities
        const transformedInvoices = data.records.map((record: AirtableRecord) => 
          transformAirtableToInvoiceEntity(record)
        );
        
        const newUpdatedIds = new Set<string>(transformedInvoices.map((inv: Invoice) => inv.id));
        
        // Only trigger callback if we have new updates
        if (newUpdatedIds.size > 0) {
          setUpdatedInvoiceIds(prev => {
            const combined = new Set([...prev, ...newUpdatedIds]);
            return combined;
          });

          // Trigger callback with transformed invoice data
          if (onUpdatesDetectedRef.current) {
            onUpdatesDetectedRef.current(transformedInvoices);
          }
        }
      }

      setLastPollTime(new Date());
    } catch (err) {
      console.error('Invoice polling error:', err);
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
    updatedInvoiceIds,
    clearUpdates,
    isPolling,
    lastPollTime,
    error,
  };
}

