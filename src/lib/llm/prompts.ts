/**
 * LLM prompts for document parsing
 * Designed for deterministic outputs with structured JSON
 */

import type { ParsedDocument } from './schemas';

/**
 * Main prompt for parsing OCR text into structured documents
 */
export function createParsePrompt(rawText: string): string {
  return `You are an expert at parsing OCR text from invoices.

Your task: Analyze the OCR text and extract all INVOICES present. Return a JSON object with a "documents" array.

IMPORTANT: 
- We ONLY process invoices. If a document is not an invoice (e.g., packing slip, receipt, other document), set document_type to "other" and we will skip it.
- For invoices, extract all the fields listed below.
- If the file contains multiple invoices, extract each one separately.

Rules for INVOICES:
1. Identify each separate invoice in the text
2. Extract all relevant invoice fields
3. If you cannot determine a field value, use null
4. document_type MUST be "invoice" for invoices, or "other" for non-invoices (which will be skipped)
5. invoice_date must be in YYYY-MM-DD format if present
6. amount should be a string with the numeric value representing the total invoice amount (e.g., "1234.56")
7. invoice_number should be the invoice number or document reference number
8. vendor_name should be the vendor or supplier name
9. freight_charge should be a numeric value for freight/shipping charges (e.g., 45.50). Look for terms like "Freight", "Freight Charge", "Shipping", "Delivery Charge", etc.
10. surcharge should be a numeric value for surcharges or additional fees (e.g., 12.25). Look for terms like "Surcharge", "Fuel Surcharge", "Service Charge", "Handling Fee", etc.
11. misc_charge should be a numeric value representing miscellaneous charges (e.g., 32.10). Look for terms like "Misc Charge", "Miscellaneous", "Other Charges", etc.
12. po_numbers should be an array of all purchase order numbers found on the invoice. Look for terms like "PO", "P.O.", "Purchase Order", "PO Number", etc. Extract all unique PO numbers from the invoice header, footer, or line items. If no PO numbers are found, use an empty array [].
13. Do not invent information - only extract what is clearly present in the text

OCR Text:
${rawText}

Output the JSON object with a "documents" array now.`;
}

/**
 * Prompt for extracting text belonging to a single invoice from multi-invoice OCR
 */
export function createExtractDocTextPrompt(rawText: string, doc: ParsedDocument): string {
  return `You are extracting the OCR text that belongs to ONE specific invoice from a larger text block.

The target invoice has these identifying fields:
- Invoice Number: ${doc.invoice_number || 'unknown'}
- Vendor: ${doc.vendor_name || 'unknown'}
- Date: ${doc.invoice_date || 'unknown'}
- Amount: ${doc.amount || 'unknown'}

Task: Extract ONLY the text that belongs to this specific invoice. Include all the text relevant to the invoce.
Return ONLY the plain text. No JSON. No commentary. No additional formatting.
Do not invent data, only extract what is clearly present in the text.

Full OCR Text:
${rawText}

Extracted text for the target invoice:`;
}

