# GPT PO Matching Prompt

This document contains the complete prompt sent to GPT-5 for PO matching.

## System Message

```
You are an expert at matching invoices to purchase orders and generating structured ERP import data.
```

## User Prompt Template

```
Analyze the invoice data and PO match candidates to generate structured POInvoiceHeader and POInvoiceDetail records.

## INVOICE DATA
{JSON.stringify(invoiceData, null, 2)}

## PO MATCH CANDIDATES
{JSON.stringify(matchPayload, null, 2)}

## INSTRUCTIONS

**Extract Invoice Line Items:**
- Create flexible objects for each invoice line item
- All data MUST come from the invoice (not from PO)
- Include: description, quantity, unit price, extended amount, etc.

**Create Headers:**
- Create one header for each unique PO number that matches invoice line items
- Group invoice line items by their matched PO number - items matching the same PO share a header
- If an invoice line item has no PO match, create a separate header for it (use the PO number from the closest match or leave PO-Number empty)
- IMPORTANT: Each invoice line item must have exactly one detail record in exactly one header
- Populate: Company-Code, VendId, TermsId, APAcct, APSub, PO-Number, CuryId, etc.
- Use data from vendor info in match payload

**Create Details (nested in each header):**
- Create exactly one detail record for each invoice line item
- Match invoice line items to PO receipts by item number (Item-No)
- Populate pricing fields (Invoice-Price, Quantity-Invoiced, Line-Amount) from invoice line item
- Populate PO fields (Purchase-Price, Quantity-Received, PO-Line-Number) from matching PO receipt
- If no PO match found for a line item, still create the detail but leave PO-specific fields empty
- Include: Item-No, Item-Description, ExpAcct, ExpSub, PO-UOM, Date-Received, etc.

**Key Rules:**
- Every invoice line item must result in exactly one detail record
- Details are grouped into headers by matching PO number
- If two line items match different POs, create separate headers
- If two line items match the same PO, put both details in one header
- Only populate fields you have data for (omit if blank)
- Do not invent data
- Match line items to correct PO receipts by item number
- Use exact field names (case-sensitive, with hyphens)
```

## Example Prompt (with actual data)

```
Analyze the invoice data and PO match candidates to generate structured POInvoiceHeader and POInvoiceDetail records.

## INVOICE DATA
{
  "RecordID": 5,
  "Invoice-Number": "INV-GLOB-002",
  "VendId": "GLOB002",
  "Vendor-Name": "GLOBAL MANUFACTURING CORP",
  "Amount": 4078.75,
  "Date": "2025-11-26",
  "Freight-Charge": 25,
  "Surcharge": 10,
  "POs": "PO-GLOB-001; PO-GLOB-003",
  "Document-Raw-Text": "GLOBAL MANUFACTURING CORP\nINVOICE #: INV-GLOB-002\nDATE: 11/26/2025\nTERMS: 2/10NET30\nCURRENCY: USD\nREMIT TO: GLOBAL MFG - AP DEPARTMENT\n\nBILL TO:\nLM COMPANY\nAccounts Payable\nLos Angeles, CA 90021\n\n------------------------------------------------------------\nPO NUMBERS: PO-GLOB-001 / PO-GLOB-003\nSHIPMENT NOS.: GLOB-SHIP-001, GLOB-SHIP-003\n------------------------------------------------------------\nLINE | ITEM NO.       | DESCRIPTION          | QTY  | UOM | PRICE | AMOUNT\n------------------------------------------------------------\n0001 | ITEM-GLOB-100  | STEEL RODS 1/2 IN DIA | 200 | FT  | 12.50 | 2,500.00\n0002 | ITEM-GLOB-500  | COPPER WIRE 12 AWG     | 475 | FT  | 3.25  | 1,543.75\n------------------------------------------------------------\nFREIGHT:      25.00\nMISC CHARGE:  10.00\nSUBTOTAL:   4,043.75\nTOTAL DUE:  $4,078.75\n\nCOMMENTS:\nMultiple POs consolidated per LM request.\nAccepted quantities only (no rejected material billed).\n",
  "Created-At": "2025-11-08T00:34:35.000Z",
  "Modified-At": "2025-11-10T20:22:51.000Z",
  "Status": "Pending",
  "POInvoiceHeaders": [
    "recr9MxXhrXnFrIGd",
    "rec4dBWeEhoxOwhg7"
  ],
  "Balance": 2535,
  "Headers-Sum": 1543.75
}

## PO MATCH CANDIDATES
{
  "success": true,
  "processedAt": "2025-11-10 19:59:40",
  "vendor": {
    "companyCode": "LM",
    "vendorId": "GLOB002",
    "vendorName": "GLOBAL MANUFACTURING CORP",
    "apapAcct": "35",
    "apapSub": "000-2100-00",
    "apExpAcct": "18",
    "apExpSub": "000-1300-01",
    "freightAccount": "6000",
    "freightSubAccount": "000",
    "miscChargeAccount": "6100",
    "miscChargeSubAccount": "000",
    "ppvVoucheredAcct": "1192",
    "ppvVoucheredSubAcct": "000",
    "remitName": "GLOBAL MFG - AP DEPARTMENT",
    "termsId": "2/10NET30",
    "taxID3": "TAX-GLOB-002",
    "curyID": "USD",
    "curyRateType": "BUY",
    "vendAPAcct": "2000",
    "vendAPSub": "000",
    "vendExpAcct": "5100",
    "vendExpSub": "200"
  },
  "matchingReceipts": [
    {
      "poNumberSeqType": "R",
      "poNumber": "PO-GLOB-003",
      "poReleaseNumber": "0000",
      "poLineNumber": "0001",
      "vendorShipNumber": "GLOB-SHIP-003",
      "dateReceived": "2025-11-21",
      "itemNo": "ITEM-GLOB-500",
      "itemDescription": "Copper Wire 12 AWG",
      "quantityReceived": 500,
      "quantityAccepted": 475,
      "vendorId": "GLOB002",
      "vendorName": "GLOBAL MANUFACTURING CORP",
      "jobProjectNumber": "",
      "step": "",
      "purchasePrice": 3.25,
      "pricingQuantity": 1,
      "expAcct": "5100",
      "expSub": "200",
      "uom": "FT",
      "curyMutlDiv": 1,
      "standardCost": 3.1
    },
    {
      "poNumberSeqType": "R",
      "poNumber": "PO-GLOB-002",
      "poReleaseNumber": "0000",
      "poLineNumber": "0001",
      "vendorShipNumber": "GLOB-SHIP-002",
      "dateReceived": "2025-11-19",
      "itemNo": "ITEM-GLOB-200",
      "itemDescription": "Aluminum Sheets 4x8",
      "quantityReceived": 50,
      "quantityAccepted": 50,
      "vendorId": "GLOB002",
      "vendorName": "GLOBAL MANUFACTURING CORP",
      "jobProjectNumber": "PROJ-2025-003",
      "step": "CUTTING",
      "purchasePrice": 85,
      "pricingQuantity": 1,
      "expAcct": "5100",
      "expSub": "200",
      "uom": "EA",
      "curyMutlDiv": 1,
      "standardCost": 82
    },
    {
      "poNumberSeqType": "R",
      "poNumber": "PO-GLOB-002",
      "poReleaseNumber": "0000",
      "poLineNumber": "0002",
      "vendorShipNumber": "GLOB-SHIP-002",
      "dateReceived": "2025-11-19",
      "itemNo": "ITEM-GLOB-300",
      "itemDescription": "Steel Plates 1/4 inch Thick",
      "quantityReceived": 25,
      "quantityAccepted": 25,
      "vendorId": "GLOB002",
      "vendorName": "GLOBAL MANUFACTURING CORP",
      "jobProjectNumber": "PROJ-2025-003",
      "step": "CUTTING",
      "purchasePrice": 125,
      "pricingQuantity": 1,
      "expAcct": "5100",
      "expSub": "200",
      "uom": "EA",
      "curyMutlDiv": 1,
      "standardCost": 120
    },
    {
      "poNumberSeqType": "R",
      "poNumber": "PO-GLOB-002",
      "poReleaseNumber": "0000",
      "poLineNumber": "0003",
      "vendorShipNumber": "GLOB-SHIP-002",
      "dateReceived": "2025-11-19",
      "itemNo": "ITEM-GLOB-400",
      "itemDescription": "Welding Wire ER70S-6",
      "quantityReceived": 100,
      "quantityAccepted": 100,
      "vendorId": "GLOB002",
      "vendorName": "GLOBAL MANUFACTURING CORP",
      "jobProjectNumber": "PROJ-2025-003",
      "step": "WELDING",
      "purchasePrice": 5.5,
      "pricingQuantity": 1,
      "expAcct": "5100",
      "expSub": "200",
      "uom": "LB",
      "curyMutlDiv": 1,
      "standardCost": 5.25
    }
  ],
  "totalMatches": 4,
  "airTableRecordID": "recK2y0WCFojG4n6O"
}

## INSTRUCTIONS

**Extract Invoice Line Items:**
- Create flexible objects for each invoice line item
- All data MUST come from the invoice (not from PO)
- Include: description, quantity, unit price, extended amount, etc.

**Create Headers:**
- Create one header for each unique PO number that matches invoice line items
- Group invoice line items by their matched PO number - items matching the same PO share a header
- If an invoice line item has no PO match, create a separate header for it (use the PO number from the closest match or leave PO-Number empty)
- IMPORTANT: Each invoice line item must have exactly one detail record in exactly one header
- Populate: Company-Code, VendId, TermsId, APAcct, APSub, PO-Number, CuryId, etc.
- Use data from vendor info in match payload

**Create Details (nested in each header):**
- Create exactly one detail record for each invoice line item
- Match invoice line items to PO receipts by item number (Item-No)
- Populate pricing fields (Invoice-Price, Quantity-Invoiced, Line-Amount) from invoice line item
- Populate PO fields (Purchase-Price, Quantity-Received, PO-Line-Number) from matching PO receipt
- If no PO match found for a line item, still create the detail but leave PO-specific fields empty
- Include: Item-No, Item-Description, ExpAcct, ExpSub, PO-UOM, Date-Received, etc.

**Key Rules:**
- Every invoice line item must result in exactly one detail record
- Details are grouped into headers by matching PO number
- If two line items match different POs, create separate headers
- If two line items match the same PO, put both details in one header
- Only populate fields you have data for (omit if blank)
- Do not invent data
- Match line items to correct PO receipts by item number
- Use exact field names (case-sensitive, with hyphens)
```

## API Configuration

- **Model:** `gpt-5`
- **Response Format:** Structured Outputs (JSON Schema)
- **Schema:** `POMatchingResponse` (strict mode)
- **Temperature:** Default (1) - GPT-5 only supports default temperature
- **System Message:** Expert at matching invoices to purchase orders and generating structured ERP import data

## Response Schema

The response must conform to the `POMatchingResponse` JSON schema defined in `src/lib/types/po-matching.ts`, which includes:

- `Invoice Line Items`: Flexible array of invoice line item objects
- `headers`: Array of POInvoiceHeader objects, each containing:
  - Header fields (Company-Code, VendId, TermsId, etc.)
  - `details`: Nested array of POInvoiceDetail objects

## Key Prompt Features

1. **Explicit Instructions:** Clear rules for creating headers and details
2. **One-to-One Mapping:** Each invoice line item → exactly one detail record
3. **PO Grouping:** Line items matching the same PO share a header
4. **Unmatched Items:** Unmatched line items get their own header
5. **Data Source Clarity:** Invoice data vs PO data clearly separated
6. **Field Naming:** Case-sensitive, hyphenated field names enforced

## Implementation

The prompt is generated by `createPOMatchingPrompt()` in `src/lib/po-matching/openai-matcher.ts` and sent via the OpenAI API with structured outputs enabled.



