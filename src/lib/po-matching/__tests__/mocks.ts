/**
 * Mock data for PO matching tests
 */

import { GPTMatchingResponse } from '../types/po-matching';

/**
 * Mock invoice record from Airtable
 */
export const mockInvoiceRecord = {
  id: 'recMockInvoice123',
  createdTime: '2025-01-15T10:00:00.000Z',
  fields: {
    'RecordID': 1001,
    'Invoice-Number': 'INV-2025-001',
    'Vendor-Name': 'Acme Manufacturing Inc',
    'VendId': 'ACME001',
    'Amount': 2450.75,
    'Date': '2025-01-15',
    'Freight-Charge': 125.50,
    'Misc-Charge': 50.00,
    'Surcharge': 25.25,
    'POs': 'PO-2025-001, PO-2025-002',
    'Status': 'Pending',
    'Document-Raw-Text': 'INVOICE\n\nDate: January 15, 2025\nInvoice #: INV-2025-001\nVendor: Acme Manufacturing Inc\n...',
    'MatchPayloadJSON': JSON.stringify({
      matches: [
        {
          poNumber: 'PO-2025-001',
          poVendor: 'Acme Manufacturing Inc',
          vendId: 'ACME001',
          companyCode: 'ACOM',
          confidence: 0.95,
          lines: [
            {
              lineNumber: '001',
              itemNo: 'WIDGET-100',
              description: 'Industrial Widget Type A',
              quantityOrdered: 50,
              unitPrice: 25.00,
              quantityReceived: 50,
              quantityAccepted: 50,
              poLineNumber: '001',
            },
            {
              lineNumber: '002',
              itemNo: 'WIDGET-200',
              description: 'Industrial Widget Type B',
              quantityOrdered: 25,
              unitPrice: 40.00,
              quantityReceived: 25,
              quantityAccepted: 25,
              poLineNumber: '002',
            },
          ],
        },
        {
          poNumber: 'PO-2025-002',
          poVendor: 'Acme Manufacturing Inc',
          vendId: 'ACME001',
          companyCode: 'ACOM',
          confidence: 0.88,
          lines: [
            {
              lineNumber: '001',
              itemNo: 'BOLT-500',
              description: 'Stainless Steel Bolts 1/4"',
              quantityOrdered: 500,
              unitPrice: 0.50,
              quantityReceived: 500,
              quantityAccepted: 500,
              poLineNumber: '001',
            },
          ],
        },
      ],
    }),
  },
};

/**
 * Expected GPT response for mock invoice
 */
export const mockGPTResponse: GPTMatchingResponse = {
  headerCount: 2,
  detailCount: 3,
  headers: [
    {
      'Company-Code': 'ACOM',
      'VendId': 'ACME001',
      'TermsId': '30',
      'APAcct': '2000',
      'APSub': '000',
      'CuryId': 'USD',
      'Type': 'ST',
    },
    {
      'Company-Code': 'ACOM',
      'VendId': 'ACME001',
      'TermsId': '30',
      'APAcct': '2000',
      'APSub': '000',
      'CuryId': 'USD',
      'Type': 'ST',
    },
  ],
  details: [
    {
      headerIndex: 0,
      'Item-No': 'WIDGET-100',
      'Item-Description': 'Industrial Widget Type A',
      'Quantity-Invoiced': 50,
      'Invoice-Price': 25.00,
      'Line-Amount': 1250.00,
      'PO-Number': 'PO-2025-001',
      'PO-Number-Seq-Type': 'S',
      'PO-Line-Number': '001',
      'Quantity-Received': 50,
      'Quantity-Accepted': 50,
      'Purchase-Price': 25.00,
      'Pricing-Quantity': 1,
    },
    {
      headerIndex: 0,
      'Item-No': 'WIDGET-200',
      'Item-Description': 'Industrial Widget Type B',
      'Quantity-Invoiced': 25,
      'Invoice-Price': 40.00,
      'Line-Amount': 1000.00,
      'PO-Number': 'PO-2025-001',
      'PO-Number-Seq-Type': 'S',
      'PO-Line-Number': '002',
      'Quantity-Received': 25,
      'Quantity-Accepted': 25,
      'Purchase-Price': 40.00,
      'Pricing-Quantity': 1,
    },
    {
      headerIndex: 1,
      'Item-No': 'BOLT-500',
      'Item-Description': 'Stainless Steel Bolts 1/4"',
      'Quantity-Invoiced': 500,
      'Invoice-Price': 0.50,
      'Line-Amount': 250.00,
      'PO-Number': 'PO-2025-002',
      'PO-Number-Seq-Type': 'S',
      'PO-Line-Number': '001',
      'Quantity-Received': 500,
      'Quantity-Accepted': 500,
      'Purchase-Price': 0.50,
      'Pricing-Quantity': 1,
    },
  ],
};

/**
 * Mock Airtable create response
 */
export const mockAirtableCreateResponse = {
  headers: {
    records: [
      { id: 'recMockHeader001' },
      { id: 'recMockHeader002' },
    ],
  },
  details: {
    records: [
      { id: 'recMockDetail001' },
      { id: 'recMockDetail002' },
      { id: 'recMockDetail003' },
    ],
  },
};

/**
 * Mock invoice record with minimal data (edge case)
 */
export const mockMinimalInvoiceRecord = {
  id: 'recMockInvoiceMin',
  createdTime: '2025-01-15T10:00:00.000Z',
  fields: {
    'RecordID': 1002,
    'Invoice-Number': 'INV-2025-002',
    'Vendor-Name': 'Unknown Vendor',
    'Amount': 100.00,
    'Status': 'Pending',
    // No MatchPayloadJSON
  },
};

/**
 * Expected GPT response for minimal invoice (creates single header with no details)
 */
export const mockMinimalGPTResponse: GPTMatchingResponse = {
  headerCount: 1,
  detailCount: 0,
  headers: [
    {
      'Company-Code': 'ACOM',
      'Type': 'ST',
    },
  ],
  details: [],
};

/**
 * Mock invoice with invalid MatchPayloadJSON (edge case)
 */
export const mockInvalidJSONInvoiceRecord = {
  id: 'recMockInvoiceInvalid',
  createdTime: '2025-01-15T10:00:00.000Z',
  fields: {
    'RecordID': 1003,
    'Invoice-Number': 'INV-2025-003',
    'Vendor-Name': 'Test Vendor',
    'Amount': 200.00,
    'Status': 'Pending',
    'MatchPayloadJSON': 'invalid json {{{',
  },
};

/**
 * Create a mock fetch invoice function
 */
export function createMockFetchInvoice(invoice: any = mockInvoiceRecord) {
  return async (invoiceId: string) => {
    console.log(`[MOCK] Fetching invoice: ${invoiceId}`);
    return invoice;
  };
}

/**
 * Create a mock create records function
 */
export function createMockCreateRecords() {
  const createdRecords: { table: string; records: any[] }[] = [];
  
  return {
    createRecordsFn: async (tableName: string, records: any[]) => {
      console.log(`[MOCK] Creating ${records.length} records in ${tableName}`);
      createdRecords.push({ table: tableName, records });
      
      if (tableName === 'POInvoiceHeaders') {
        return mockAirtableCreateResponse.headers;
      } else if (tableName === 'POInvoiceDetails') {
        return mockAirtableCreateResponse.details;
      }
      
      return { records: [] };
    },
    getCreatedRecords: () => createdRecords,
  };
}

/**
 * Create a mock OpenAI response
 */
export function createMockGeneratePOMatches(response: GPTMatchingResponse = mockGPTResponse) {
  return async (invoiceData: Record<string, any>, matchPayload: any) => {
    console.log(`[MOCK] Generating PO matches`);
    console.log(`       Invoice data keys: ${Object.keys(invoiceData).length}`);
    console.log(`       Match payload: ${JSON.stringify(matchPayload).substring(0, 100)}...`);
    return response;
  };
}




