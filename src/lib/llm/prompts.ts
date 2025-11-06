/**
 * LLM prompts for document parsing
 * Designed for deterministic outputs with structured JSON
 */

import type { ParsedDocument } from './schemas';

/**
 * Main prompt for parsing OCR text into structured documents
 */
export function createParsePrompt(rawText: string): string {
  return `You are an expert at parsing OCR text from back-of-house restaurant documents.

Your task: Analyze the OCR text and extract all documents present. Return a JSON object with a "documents" array.

Rules:
1. Identify each separate document in the text (invoice, store receiver, or delivery ticket)
2. Extract relevant fields for each document
3. If you cannot determine a field value, use null
4. document_type MUST be one of: "invoice", "store_receiver", "delivery_ticket"
5. document_name should be a 5-word summary (e.g., "Sysco Invoice for Store 123")
6. team is the store number or location code - look for patterns like:
   - "Crest Foods #9" → team should be "9"
   - "Store 5" → team should be "5"  
   - "Location 12" → team should be "12"
   - Extract just the number, not the full text
7. invoice_date must be in YYYY-MM-DD format if present
8. amount should be a string with the numeric value (e.g., "1234.56")
9. freight_charge should be a numeric value for freight/shipping charges (e.g., 45.50). Look for terms like "Freight", "Freight Charge", "Shipping", "Delivery Charge", etc.
10. surcharge should be a numeric value for surcharges or additional fees (e.g., 12.25). Look for terms like "Surcharge", "Fuel Surcharge", "Service Charge", "Handling Fee", etc.
11. po_numbers should be an array of all purchase order numbers found on the invoice. Look for terms like "PO", "P.O.", "Purchase Order", "PO Number", etc. Extract all unique PO numbers from the invoice header, footer, or line items. If no PO numbers are found, use an empty array [].
12. Do not invent information - only extract what is clearly present

Line Items Extraction (for invoices):
13. Extract ALL line items from the invoice into the line_items array
14. Each line item should include:
    - line_number: Line number or sequence (e.g., "1", "2", "3")
    - item_no: Item SKU or product number (e.g., "12345", "ABC-123")
    - item_description: Description of the item/product
    - quantity_invoiced: Quantity ordered/invoiced (numeric)
    - invoice_price: Unit price per item (numeric)
    - line_amount: Total amount for the line (quantity * price, numeric)
    - po_number: Purchase order number if present on the line
    - expacct: GL account or expense account code if present
15. For non-invoice documents (store_receiver, delivery_ticket), line_items should be an empty array []
16. Line amounts should be numeric values, not strings (e.g., 123.45, not "123.45")

Document type identification:
- "invoice": Standard vendor invoice with amount due
- "store_receiver": Store receiving document (goods receipt)
- "delivery_ticket": Delivery or takeout ticket

Special attention for team/store extraction:
- Look for store names, numbers, locations in headers, addresses, or customer info
- Common patterns: "Store #X", "Location X", "Crest Foods #X", "Store X"
- Extract only the numeric part for the team field

OCR Text:
${rawText}

Output the JSON object with a "documents" array now.`;
}

/**
 * Prompt for extracting text belonging to a single document from multi-document OCR
 */
export function createExtractDocTextPrompt(rawText: string, doc: ParsedDocument): string {
  return `You are extracting the OCR text that belongs to ONE specific document from a larger text block.

The target document has these identifying fields:
- Type: ${doc.document_type}
- Invoice Number: ${doc.invoice_number || 'unknown'}
- Vendor: ${doc.vendor_name || 'unknown'}
- Date: ${doc.invoice_date || 'unknown'}
- Amount: ${doc.amount || 'unknown'}

Task: Extract ONLY the text that belongs to this specific document. Include:
- Header information
- Line items
- Totals
- Any relevant footer text

Return ONLY the plain text. No JSON. No commentary. No additional formatting.

Full OCR Text:
${rawText}

Extracted text for the target document:`;
}

