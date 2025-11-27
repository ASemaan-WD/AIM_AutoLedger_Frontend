/**
 * Specialized hooks for invoice data management with Airtable
 */

'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { createAirtableClient } from './client';
import { transformAirtableToInvoiceEntity, transformInvoiceToAirtableEntity } from './transforms';
import { TABLE_NAMES } from './schema-types';
import type { Invoice } from '@/types/documents';
import type { AirtableRecord } from './types';

const BASE_ID = import.meta.env.VITE_AIRTABLE_BASE_ID;

interface UseInvoicesOptions {
  filter?: string;
  sort?: Array<{ field: string; direction: 'asc' | 'desc' }>;
  autoFetch?: boolean;
}

interface UseInvoicesResult {
  invoices: Invoice[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  refresh: () => Promise<void>;
  fetchMore: () => Promise<void>;
  updateInvoice: (invoiceId: string, updates: Partial<Invoice>) => Promise<void>;
  createInvoice: (invoice: Partial<Invoice>) => Promise<Invoice>;
  updateInvoicesInPlace: (updatedInvoices: Invoice[]) => void;
}

/**
 * Hook for managing invoices from the Invoices table (primary entity)
 * Updated to fetch from Invoices table instead of POInvoiceHeaders
 */
export function useInvoices(options: UseInvoicesOptions = {}): UseInvoicesResult {
  const { filter, sort, autoFetch = true } = options;
  
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  // Memoize the fetch function to prevent infinite loops
  const fetchInvoices = useCallback(async () => {
    if (loading) return; // Prevent concurrent requests
    
    setLoading(true);
    setError(null);

    try {
      const client = createAirtableClient(BASE_ID);
      
      const listParams: any = {
        pageSize: 50
      };

      if (filter) {
        listParams.filterByFormula = filter;
      }

      if (sort) {
        listParams.sort = sort;
      } else {
        // Default sort by created date descending
        listParams.sort = [{ field: 'Created-At', direction: 'desc' as const }];
      }

      // Fetch invoices from Invoices table (primary entity)
      const invoicesData = await client.listRecords('Invoices', listParams);

      // Transform the data using Invoice entity transform
      const transformedInvoices = invoicesData.records.map((invoiceRecord: AirtableRecord) => {
        return transformAirtableToInvoiceEntity(invoiceRecord);
      });

      setInvoices(transformedInvoices);
      setHasMore(!!invoicesData.offset);

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch invoices';
      setError(message);
      console.error('Error fetching invoices:', err);
    } finally {
      setLoading(false);
    }
  }, [filter, sort, loading]);

  // Auto-fetch only once when component mounts or key dependencies change
  useEffect(() => {
    if (autoFetch) {
      fetchInvoices();
    }
  }, [autoFetch]); // Only depend on autoFetch, not the function itself

  /**
   * Manual refresh function
   */
  const refresh = useCallback(async () => {
    await fetchInvoices();
  }, [fetchInvoices]);

  /**
   * Fetch more invoices (pagination) - placeholder for now
   */
  const fetchMore = useCallback(async () => {
    // TODO: Implement pagination with offset
    console.log('Fetch more not implemented yet');
  }, []);

  /**
   * Update an invoice in Invoices table
   */
  const updateInvoice = useCallback(async (invoiceId: string, updates: Partial<Invoice>) => {
    try {
      const client = createAirtableClient(BASE_ID);
      const airtableFields = transformInvoiceToAirtableEntity(updates);
      
      await client.updateRecords('Invoices', {
        records: [{ id: invoiceId, fields: airtableFields }]
      });

      // Optimistically update local state
      setInvoices(prevInvoices => 
        prevInvoices.map(invoice => 
          invoice.id === invoiceId 
            ? { ...invoice, ...updates }
            : invoice
        )
      );

    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update invoice');
    }
  }, []);

  /**
   * Create a new invoice in Invoices table
   */
  const createInvoice = useCallback(async (invoice: Partial<Invoice>): Promise<Invoice> => {
    try {
      const client = createAirtableClient(BASE_ID);
      const airtableFields = transformInvoiceToAirtableEntity(invoice);
      
      const data = await client.createRecords('Invoices', {
        records: [{ fields: airtableFields }]
      });

      const createdInvoice = transformAirtableToInvoiceEntity(data.records[0]);
      
      // Add to local state
      setInvoices(prevInvoices => [createdInvoice, ...prevInvoices]);
      
      return createdInvoice;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to create invoice');
    }
  }, []);

  /**
   * Update invoices in place without re-fetching (for real-time updates)
   */
  const updateInvoicesInPlace = useCallback((updatedInvoices: Invoice[]) => {
    setInvoices(prevInvoices => {
      const updatedMap = new Map(updatedInvoices.map(inv => [inv.id, inv]));
      
      // Update existing invoices or add new ones
      const updated = prevInvoices.map(invoice => 
        updatedMap.has(invoice.id) ? updatedMap.get(invoice.id)! : invoice
      );
      
      // Add any new invoices that weren't in the list
      const existingIds = new Set(prevInvoices.map(inv => inv.id));
      const newInvoices = updatedInvoices.filter(inv => !existingIds.has(inv.id));
      
      return [...newInvoices, ...updated];
    });
  }, []);

  return {
    invoices,
    loading,
    error,
    hasMore,
    refresh,
    fetchMore,
    updateInvoice,
    createInvoice,
    updateInvoicesInPlace
  };
}

/**
 * Hook for getting invoices by status
 */
export function useInvoicesByStatus(status: string) {
  const filterFormula = `{Status} = "${status}"`;
  return useInvoices({
    filter: filterFormula
  });
}

/**
 * Hook for getting pending invoices
 */
export function usePendingInvoices() {
  return useInvoicesByStatus('pending');
}

/**
 * Hook for getting invoices that need coding (missing fields)
 */
export function useInvoicesNeedingCoding() {
  const filterFormula = `OR({Project} = BLANK(), {Task} = BLANK(), {Cost Center} = BLANK(), {GL Account} = BLANK())`;
  return useInvoices({
    filter: filterFormula
  });
}

/**
 * Hook for invoice counts by status
 * Updated to fetch from Invoices table
 */
export function useInvoiceCounts() {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCounts = useCallback(async () => {
    if (loading) return; // Prevent concurrent requests
    
    setLoading(true);
    setError(null);

    try {
      const client = createAirtableClient(BASE_ID);
      const data = await client.listRecords('Invoices', { fields: ['Status', 'Vendor-Name', 'Invoice-Number', 'Amount'] });
      
      const statusCounts: Record<string, number> = {};

      // Count by status (Invoices table status values)
      data.records.forEach((record: AirtableRecord) => {
        const status = record.fields.Status || 'Pending';
        // Normalize to lowercase for counting
        const normalizedStatus = (status as string).toLowerCase();
        statusCounts[normalizedStatus] = (statusCounts[normalizedStatus] || 0) + 1;
      });

      // Calculate derived counts
      const total = data.records.length;
      const needsCoding = data.records.filter((record: AirtableRecord) => {
        const fields = record.fields;
        // Check if key fields are missing (Invoices table fields)
        return !fields['Vendor-Name'] || !fields['Invoice-Number'] || !fields['Amount'];
      }).length;

      setCounts({
        total,
        pending: statusCounts.pending || 0,
        open: statusCounts.matched || 0, // Map matched to open for backward compatibility
        reviewed: statusCounts.queued || 0, // Map queued to reviewed
        approved: statusCounts.queued || 0, // Map queued to approved for backward compatibility
        rejected: statusCounts.error || 0, // Map error to rejected
        exported: statusCounts.exported || 0,
        needsCoding
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch invoice counts');
    } finally {
      setLoading(false);
    }
  }, [loading]);

  useEffect(() => {
    fetchCounts();
  }, []); // Only fetch once on mount

  return {
    counts,
    loading,
    error,
    refresh: fetchCounts
  };
}