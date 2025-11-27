/**
 * React hooks for Airtable integration
 * Client-side utilities that call Airtable directly
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { createAirtableClient } from './client';
import type {
  AirtableRecord,
  AirtableListParams,
  AirtableCreateRecord,
  AirtableUpdateRecord,
} from './types';

interface UseAirtableOptions {
  baseId?: string;
  initialParams?: AirtableListParams;
  autoFetch?: boolean;
}

interface UseAirtableResult {
  records: AirtableRecord[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  offset?: string;
  
  // Actions
  fetch: (params?: AirtableListParams) => Promise<void>;
  fetchMore: () => Promise<void>;
  create: (record: AirtableCreateRecord | AirtableCreateRecord[]) => Promise<AirtableRecord[]>;
  update: (records: AirtableUpdateRecord[]) => Promise<AirtableRecord[]>;
  delete: (ids: string[]) => Promise<void>;
  refresh: () => Promise<void>;
}

/**
 * Hook for managing Airtable records with CRUD operations
 */
export function useAirtable(
  table: string,
  options: UseAirtableOptions = {}
): UseAirtableResult {
  const { baseId, initialParams = {}, autoFetch = true } = options;
  
  const [records, setRecords] = useState<AirtableRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState<string | undefined>();
  const [hasMore, setHasMore] = useState(false);
  const [lastParams, setLastParams] = useState<AirtableListParams>(initialParams);

  // Create Airtable client instance
  const client = createAirtableClient(baseId);

  /**
   * Fetch records with pagination
   */
  const fetch = useCallback(async (params: AirtableListParams = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await client.listRecords(table, params);
      
      if (params.offset) {
        // Appending to existing records (pagination)
        setRecords(prev => [...prev, ...data.records]);
      } else {
        // Fresh fetch
        setRecords(data.records);
      }
      
      setOffset(data.offset);
      setHasMore(!!data.offset);
      setLastParams(params);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch records');
    } finally {
      setLoading(false);
    }
  }, [client, table]);

  /**
   * Fetch more records (pagination)
   */
  const fetchMore = useCallback(async () => {
    if (!hasMore || loading || !offset) return;
    
    await fetch({ ...lastParams, offset });
  }, [fetch, hasMore, loading, offset, lastParams]);

  /**
   * Create new record(s)
   */
  const create = useCallback(async (
    record: AirtableCreateRecord | AirtableCreateRecord[]
  ): Promise<AirtableRecord[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const params = Array.isArray(record) 
        ? { records: record }
        : { records: [record] };
      
      const data = await client.createRecords(table, params);
      
      // Add new records to the beginning of the list
      setRecords(prev => [...data.records, ...prev]);
      
      return data.records;
      
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create record';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, [client, table]);

  /**
   * Update existing record(s)
   */
  const update = useCallback(async (
    updates: AirtableUpdateRecord[]
  ): Promise<AirtableRecord[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await client.updateRecords(table, { records: updates });
      
      // Update records in place
      setRecords(prev => 
        prev.map(record => {
          const updated = data.records.find((r: AirtableRecord) => r.id === record.id);
          return updated || record;
        })
      );
      
      return data.records;
      
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update records';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, [client, table]);

  /**
   * Delete record(s)
   */
  const deleteRecords = useCallback(async (ids: string[]): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      await client.deleteRecords(table, { records: ids });
      
      // Remove deleted records from the list
      setRecords(prev => prev.filter(record => !ids.includes(record.id)));
      
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete records';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, [client, table]);

  /**
   * Refresh current view
   */
  const refresh = useCallback(async () => {
    await fetch(lastParams);
  }, [fetch, lastParams]);

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch) {
      fetch(initialParams);
    }
  }, [autoFetch, fetch, initialParams]);

  return {
    records,
    loading,
    error,
    hasMore,
    offset,
    fetch,
    fetchMore,
    create,
    update,
    delete: deleteRecords,
    refresh,
  };
}

/**
 * Hook for simple record fetching with automatic pagination
 */
export function useAirtableRecords(
  table: string,
  params: AirtableListParams = {},
  options: { baseId?: string; autoFetch?: boolean } = {}
) {
  const { records, loading, error, fetchMore, hasMore } = useAirtable(table, {
    ...options,
    initialParams: params,
  });

  return {
    records,
    loading,
    error,
    hasMore,
    loadMore: fetchMore,
  };
}

/**
 * Hook for managing a single record
 */
export function useAirtableRecord(
  table: string,
  recordId: string,
  options: { baseId?: string; autoFetch?: boolean } = {}
) {
  const [record, setRecord] = useState<AirtableRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { baseId, autoFetch = true } = options;

  const client = createAirtableClient(baseId);

  const fetchRecord = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await client.getRecord(table, recordId);
      setRecord(data);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch record');
    } finally {
      setLoading(false);
    }
  }, [client, table, recordId]);

  useEffect(() => {
    if (autoFetch && recordId) {
      fetchRecord();
    }
  }, [autoFetch, recordId, fetchRecord]);

  return {
    record,
    loading,
    error,
    refresh: fetchRecord,
  };
}
