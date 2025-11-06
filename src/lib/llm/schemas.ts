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
          door_number: { 
            type: ["string", "null"],
            description: "Door or location number if present"
          },
          invoice_number: { 
            type: ["string", "null"],
            description: "Invoice or document reference number"
          },
          document_type: {
            type: "string",
            enum: ["invoice", "store_receiver", "delivery_ticket"],
            description: "Type of document"
          },
          document_name: { 
            type: ["string", "null"],
            description: "Five-word summary of the document"
          },
          team: { 
            type: ["string", "null"],
            description: "Store number or team identifier"
          },
          freight_charge: {
            type: ["number", "null"],
            description: "Freight charge amount as a number, e.g. 45.50"
          },
          surcharge: {
            type: ["number", "null"],
            description: "Surcharge amount as a number, e.g. 12.25"
          },
          po_numbers: {
            type: "array",
            items: {
              type: "string"
            },
            description: "Array of purchase order numbers found on the invoice (e.g., ['PO-12345', 'PO-67890'])"
          },
          line_items: {
            type: "array",
            items: {
              type: "object",
              properties: {
                line_number: { 
                  type: ["string", "null"],
                  description: "Line item number or sequence"
                },
                item_no: { 
                  type: ["string", "null"],
                  description: "Item SKU or product number"
                },
                item_description: { 
                  type: ["string", "null"],
                  description: "Description of the item"
                },
                quantity_invoiced: { 
                  type: ["number", "null"],
                  description: "Quantity invoiced"
                },
                invoice_price: { 
                  type: ["number", "null"],
                  description: "Unit price"
                },
                line_amount: { 
                  type: ["number", "null"],
                  description: "Total line amount (quantity * price)"
                },
                po_number: { 
                  type: ["string", "null"],
                  description: "Purchase order number if present"
                },
                expacct: { 
                  type: ["string", "null"],
                  description: "Expense account or GL account"
                }
              },
              required: [
                "line_number",
                "item_no",
                "item_description",
                "quantity_invoiced",
                "invoice_price",
                "line_amount",
                "po_number",
                "expacct"
              ],
              additionalProperties: false
            },
            description: "Array of line items for invoices"
          }
        },
        required: [
          "amount",
          "invoice_date", 
          "vendor_name",
          "door_number",
          "invoice_number",
          "document_type",
          "document_name",
          "team",
          "freight_charge",
          "surcharge",
          "po_numbers",
          "line_items"
        ],
        additionalProperties: false
      }
    }
  },
  required: ["documents"],
  additionalProperties: false
} as const;

/**
 * TypeScript type for line items
 */
export type ParsedLineItem = {
  line_number: string | null;
  item_no: string | null;
  item_description: string | null;
  quantity_invoiced: number | null;
  invoice_price: number | null;
  line_amount: number | null;
  po_number: string | null;
  expacct: string | null;
};

/**
 * TypeScript type matching the schema
 */
export type ParsedDocument = {
  amount: string | null;
  invoice_date: string | null;
  vendor_name: string | null;
  door_number: string | null;
  invoice_number: string | null;
  document_type: "invoice" | "store_receiver" | "delivery_ticket";
  document_name: string | null;
  team: string | null;
  freight_charge: number | null;
  surcharge: number | null;
  po_numbers: string[];
  line_items: ParsedLineItem[];
};

export type DocumentArrayResponse = {
  documents: ParsedDocument[];
};

