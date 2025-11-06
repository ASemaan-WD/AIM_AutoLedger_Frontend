import { useState, useCallback, useEffect } from 'react';
import { TABLE_NAMES, FIELD_IDS } from './schema-types';
import type { AirtableRecord } from './types';
import type { DocumentLine } from '@/types/documents';

interface UseInvoiceDetailsOptions {
  invoiceDetailsIds?: string[]; // Array of POInvoiceDetails record IDs from POInvoiceHeaders
  autoFetch?: boolean;
}

interface UseInvoiceDetailsResult {
  lines: DocumentLine[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

// Transform Airtable POInvoiceDetails record to DocumentLine
function transformInvoiceDetailToLine(record: AirtableRecord): DocumentLine {
  const fields = record.fields;
  
  console.log('[InvoiceDetails] Raw record fields:', fields);
  console.log('[InvoiceDetails] Field IDs being used:');
  console.log('  - ITEM_DESCRIPTION:', FIELD_IDS.INVOICEDETAILS.ITEM_DESCRIPTION);
  console.log('  - LINE_AMOUNT:', FIELD_IDS.INVOICEDETAILS.LINE_AMOUNT);
  console.log('  - LINE_NUMBER:', FIELD_IDS.INVOICEDETAILS.LINE_NUMBER);
  
  const description = fields[FIELD_IDS.INVOICEDETAILS.ITEM_DESCRIPTION] || fields['Item-Description'] || '';
  const lineAmount = fields[FIELD_IDS.INVOICEDETAILS.LINE_AMOUNT] || fields['Line-Amount'] || 0;
  const lineNumber = fields[FIELD_IDS.INVOICEDETAILS.LINE_NUMBER] || fields['Line-Number'] || '';
  
  console.log('[InvoiceDetails] Extracted values:');
  console.log('  - description:', description);
  console.log('  - lineAmount:', lineAmount);
  console.log('  - lineNumber:', lineNumber);
  
  return {
    id: record.id,
    lineNumber: lineNumber,
    description: description,
    amount: Number(lineAmount) || 0,
    glAccount: fields[FIELD_IDS.INVOICEDETAILS.EXPACCT] || '',
    itemNo: fields[FIELD_IDS.INVOICEDETAILS.ITEM_NO],
    quantity: fields[FIELD_IDS.INVOICEDETAILS.QUANTITY_INVOICED],
    unitPrice: fields[FIELD_IDS.INVOICEDETAILS.INVOICE_PRICE],
    poNumber: fields[FIELD_IDS.INVOICEDETAILS.PO_NUMBER],
    poLineNumber: fields[FIELD_IDS.INVOICEDETAILS.PO_LINE_NUMBER],
  };
}

/**
 * Hook to fetch invoice line items from POInvoiceDetails table
 * Uses the Invoice Details linked record IDs from the POInvoiceHeaders record
 */
export function useInvoiceDetails(options: UseInvoiceDetailsOptions = {}): UseInvoiceDetailsResult {
  const { invoiceDetailsIds, autoFetch = true } = options;
  
  const [lines, setLines] = useState<DocumentLine[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLines = useCallback(async () => {
    if (!invoiceDetailsIds || invoiceDetailsIds.length === 0) {
      setLines([]);
      return;
    }

    console.log('[InvoiceDetails] Fetching lines for IDs:', invoiceDetailsIds);
    setLoading(true);
    setError(null);

    try {
      // Fetch each line item record by ID
      const linePromises = invoiceDetailsIds.map(async (recordId) => {
        const url = `/api/airtable/${TABLE_NAMES.INVOICEDETAILS}/${recordId}`;
        console.log('[InvoiceDetails] Fetching record:', url);
        
        const response = await fetch(url);
        
        if (!response.ok) {
          console.error('[InvoiceDetails] Failed to fetch record:', recordId, response.status);
          return null;
        }
        
        const data = await response.json();
        return data;
      });

      const records = await Promise.all(linePromises);
      const validRecords = records.filter((r): r is AirtableRecord => r !== null);
      
      console.log('[InvoiceDetails] Received records:', validRecords.length);
      
      const transformedLines = validRecords.map(transformInvoiceDetailToLine);
      
      // Sort by line number
      transformedLines.sort((a, b) => {
        const aNum = parseInt(a.lineNumber) || 0;
        const bNum = parseInt(b.lineNumber) || 0;
        return aNum - bNum;
      });
      
      console.log('[InvoiceDetails] Transformed and sorted lines:', transformedLines);
      setLines(transformedLines);
    } catch (err) {
      console.error('[InvoiceDetails] Error fetching invoice details:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch invoice lines');
      setLines([]);
    } finally {
      setLoading(false);
    }
  }, [invoiceDetailsIds?.join(',')]); // Use join for dependency comparison

  // Auto-fetch on mount or when invoice details IDs change
  useEffect(() => {
    if (autoFetch && invoiceDetailsIds && invoiceDetailsIds.length > 0) {
      fetchLines();
    }
  }, [autoFetch, invoiceDetailsIds?.join(','), fetchLines]);

  return {
    lines,
    loading,
    error,
    refresh: fetchLines,
  };
}

