/**
 * JSON schemas for LLM structured outputs
 * Used with OpenAI's structured output feature for reliable JSON parsing
 */

export const DocumentArraySchema = {
  type: "object",
  properties: {
    documents: {
      type: "array",
      items: {
        type: "object",
        properties: {
          amount: { 
            type: ["string", "null"],
            description: "Total dollar amount as string, e.g. '1234.56'"
          },
          invoice_date: { 
            type: ["string", "null"],
            description: "Date in YYYY-MM-DD format"
          },
          vendor_name: { 
            type: ["string", "null"],
            description: "Name of the vendor/supplier"
          },
          invoice_number: { 
            type: ["string", "null"],
            description: "Invoice or document reference number"
          },
          document_type: {
            type: "string",
            enum: ["invoice", "other"],
            description: "Type of document"
          },
          freight_charge: {
            type: ["number", "null"],
            description: "Freight charge amount as a number, e.g. 45.50"
          },
          surcharge: {
            type: ["number", "null"],
            description: "Surcharge amount as a number, e.g. 12.25"
          },
          misc_charge: {
            type: ["number", "null"],
            description: "Miscellaneous charge amount as a number, e.g. 32.10"
          },
          po_numbers: {
            type: "array",
            items: {
              type: "string"
            },
            description: "Array of purchase order numbers found on the invoice (e.g., ['PO-12345', 'PO-67890'])"
          }
        },
        required: [
          "amount",
          "invoice_date", 
          "vendor_name",
          "invoice_number",
          "document_type",
          "freight_charge",
          "surcharge",
          "misc_charge",
          "po_numbers"
        ],
        additionalProperties: false
      }
    }
  },
  required: ["documents"],
  additionalProperties: false
} as const;

/**
 * TypeScript type matching the schema
 */
export type ParsedDocument = {
  amount: string | null;
  invoice_date: string | null;
  vendor_name: string | null;
  invoice_number: string | null;
  document_type: "invoice" | "other";
  freight_charge: number | null;
  surcharge: number | null;
  misc_charge: number | null;
  po_numbers: string[];
};

export type DocumentArrayResponse = {
  documents: ParsedDocument[];
};

