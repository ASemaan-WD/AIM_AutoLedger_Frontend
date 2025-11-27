/**
 * Airtable Service
 * Frontend service for direct Airtable API calls
 */

import { createAirtableClient } from '@/lib/airtable/client';
import type { AirtableListParams } from '@/lib/airtable/types';

export interface AirtableRecord {
  id: string;
  fields: Record<string, unknown>;
  createdTime?: string;
}

export interface AirtableListResponse {
  records: AirtableRecord[];
  offset?: string;
}

export interface AirtableCreateResponse {
  records: AirtableRecord[];
}

export interface AirtableUpdateResponse {
  records: AirtableRecord[];
}

export interface AirtableDeleteResponse {
  records: Array<{ id: string; deleted: boolean }>;
}

/**
 * List records from a table
 */
export async function listRecords(
  table: string,
  params?: {
    baseId?: string;
    view?: string;
    pageSize?: number;
    offset?: string;
    maxRecords?: number;
    filter?: string;
    fields?: string[];
    sort?: Array<{ field: string; direction: 'asc' | 'desc' }>;
  }
): Promise<AirtableListResponse> {
  const client = createAirtableClient(params?.baseId);
  
  const listParams: AirtableListParams = {};
  if (params?.view) listParams.view = params.view;
  if (params?.pageSize) listParams.pageSize = params.pageSize;
  if (params?.offset) listParams.offset = params.offset;
  if (params?.maxRecords) listParams.maxRecords = params.maxRecords;
  if (params?.filter) listParams.filterByFormula = params.filter;
  if (params?.fields) listParams.fields = params.fields;
  if (params?.sort) listParams.sort = params.sort;

  return client.listRecords(table, listParams);
}

/**
 * Get a single record by ID
 */
export async function getRecord(
  table: string,
  recordId: string,
  baseId?: string
): Promise<AirtableRecord> {
  const client = createAirtableClient(baseId);
  return client.getRecord(table, recordId);
}

/**
 * Create records in a table
 */
export async function createRecords(
  table: string,
  data: {
    records?: Array<{ fields: Record<string, unknown> }>;
    fields?: Record<string, unknown>;
    typecast?: boolean;
    baseId?: string;
  }
): Promise<AirtableCreateResponse> {
  const client = createAirtableClient(data.baseId);
  
  const createParams: any = {};
  if (data.records) {
    createParams.records = data.records;
  } else if (data.fields) {
    createParams.records = [{ fields: data.fields }];
  }
  if (data.typecast !== undefined) createParams.typecast = data.typecast;

  return client.createRecords(table, createParams);
}

/**
 * Update records in a table
 */
export async function updateRecords(
  table: string,
  data: {
    records: Array<{ id: string; fields: Record<string, unknown> }>;
    typecast?: boolean;
    baseId?: string;
  }
): Promise<AirtableUpdateResponse> {
  const client = createAirtableClient(data.baseId);
  
  const updateParams: any = {
    records: data.records,
  };
  if (data.typecast !== undefined) updateParams.typecast = data.typecast;

  return client.updateRecords(table, updateParams);
}

/**
 * Delete records from a table
 */
export async function deleteRecords(
  table: string,
  data: {
    ids: string[];
    baseId?: string;
  }
): Promise<AirtableDeleteResponse> {
  const client = createAirtableClient(data.baseId);
  
  return client.deleteRecords(table, { records: data.ids });
}

