/**
 * TypeScript types for PO Matching API
 */

import { POInvoiceHeadersRecord, POInvoiceDetailsRecord } from '../airtable/schema-types';

// ============================================================================
// API Request/Response Types
// ============================================================================

export interface POMatchingRequest {
  invoiceId: string;
}

export interface POMatchingResponse {
  success: boolean;
  headers: {
    ids: string[];
    count: number;
  };
  details: {
    ids: string[];
    count: number;
  };
  error?: string;
}

// ============================================================================
// OpenAI Structured Output Schema Types
// ============================================================================

// Match object linking invoice line to PO receipt
export interface GPTMatchObject {
  match_object: number;       // Index into matchingReceipts array
  invoice_price: number;      // Unit price from invoice
  invoice_quantity: number;   // Quantity from invoice
  invoice_amount: number;     // Line total from invoice
}

// Single POInvoiceHeader data from GPT
export interface GPTPOInvoiceHeader {
  // Core fields
  'Company-Code'?: string;
  VendId?: string;
  TermsId?: string;
  TermsDaysInt?: number;      // Payment terms in days (parsed from TermsId)
  
  // Accounting fields
  APAcct?: string;
  APSub?: string;
  'Freight-Account'?: string;
  'Freight-Subaccount'?: string;
  'Misc-Charge-Account'?: string;
  'Misc-Charge-Subaccount'?: string;
  
  // PO fields
  'PO-Number-Seq-Type'?: string;
  'PO-Number'?: string;
  'PO-Vendor'?: string;
  
  // Currency fields
  CuryId?: string;
  CuryMultDiv?: 'multiple' | 'divide'; // Optional, not populated by matcher
  CuryRate?: number;
  CuryRateType?: string;
  
  // Other fields
  'User-Id'?: string;
  'Job-Project-Number'?: string;
  
  // Details array - array of arrays containing match objects
  // Each inner array represents one invoice line with its matched receipt(s)
  details: GPTMatchObject[][];
}

// Complete GPT response structure
export interface GPTMatchingResponse {
  // Headers with nested details (match objects)
  headers: GPTPOInvoiceHeader[];
  
  // Error description - empty if all matched, otherwise explains unmatched lines
  error: string;
}

// ============================================================================
// JSON Schema for OpenAI Structured Outputs
// ============================================================================

export const POMatchingJSONSchema = {
  type: "object",
  properties: {
    headers: {
      type: "array",
      description: "Purchase order invoice headers, each containing match objects linking invoice lines to PO receipts.",
      items: {
        type: "object",
        required: ["details", "Company-Code", "VendId", "TermsId", "TermsDaysInt", "APAcct", "APSub", "Freight-Account", "Freight-Subaccount", "Misc-Charge-Account", "Misc-Charge-Subaccount", "PO-Number-Seq-Type", "PO-Number", "PO-Vendor", "CuryId", "CuryRate", "CuryRateType", "User-Id", "Job-Project-Number"],
        additionalProperties: false,
        properties: {
          "Company-Code": { type: "string", description: "Company identifier" },
          "VendId": { type: "string", description: "Vendor ID" },
          "TermsId": { type: "string", description: "Payment terms ID (e.g., 'NET30', '30')" },
          "TermsDaysInt": { type: "integer", description: "Payment terms in days as integer (parse from TermsId)" },
          "APAcct": { type: "string", description: "Accounts Payable account" },
          "APSub": { type: "string", description: "Accounts Payable subaccount" },
          "Freight-Account": { type: "string" },
          "Freight-Subaccount": { type: "string" },
          "Misc-Charge-Account": { type: "string" },
          "Misc-Charge-Subaccount": { type: "string" },
          "PO-Number-Seq-Type": { type: "string" },
          "PO-Number": { type: "string" },
          "PO-Vendor": { type: "string" },
          "CuryId": { type: "string" },
          "CuryRate": { type: "number" },
          "CuryRateType": { type: "string" },
          "User-Id": { type: "string" },
          "Job-Project-Number": { type: "string" },
          details: {
            type: "array",
            description: "Array of arrays. Each inner array represents one invoice line and contains match objects linking to PO receipts.",
            items: {
              type: "array",
              description: "One invoice line's match(es). Typically contains one match object per invoice line.",
              items: {
                type: "object",
                additionalProperties: false,
                required: ["match_object", "invoice_price", "invoice_quantity", "invoice_amount"],
                properties: {
                  "match_object": {
                    type: "integer",
                    description: "Index into the matchingReceipts array from MatchPayloadJSON"
                  },
                  "invoice_price": {
                    type: "number",
                    description: "Unit price from invoice line item"
                  },
                  "invoice_quantity": {
                    type: "number",
                    description: "Quantity from invoice line item"
                  },
                  "invoice_amount": {
                    type: "number",
                    description: "Extended line total from invoice line item"
                  }
                }
              }
            }
          }
        }
      }
    },
    error: {
      type: "string",
      description: "Empty string if all invoice lines matched successfully. Otherwise, concisely explain each unmatched invoice line."
    }
  },
  required: ["headers", "error"],
  additionalProperties: false
} as const;

// ============================================================================
// Internal Processing Types
// ============================================================================

export interface ProcessedInvoiceData {
  // Filtered invoice fields (non-null only)
  invoiceFields: Record<string, any>;
  
  // Parsed MatchPayloadJSON
  matchPayload: any;
  
  // Invoice record ID
  invoiceId: string;
}

export interface CreatedRecordsSummary {
  headerIds: string[];
  detailIds: string[];
  headerCount: number;
  detailCount: number;
}

