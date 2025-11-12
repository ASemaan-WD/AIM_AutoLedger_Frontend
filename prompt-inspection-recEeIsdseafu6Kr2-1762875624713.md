# GPT Prompt and Schema Inspection

**Generated:** 2025-11-11T15:40:24.712Z
**Invoice ID:** recEeIsdseafu6Kr2
**Model:** gpt-5

---

## Invoice Data

```json
{
  "RecordID": 2,
  "Invoice-Number": "INV-ACME-001",
  "VendId": "ACME001",
  "Vendor-Name": "ACME SUPPLIES INC",
  "Amount": 425,
  "Date": "2025-11-20",
  "Freight-Charge": 0,
  "Surcharge": 0,
  "POs": "PO-ACME-001",
  "Document-Raw-Text": "ACME SUPPLIES INC\nAccounts Payable Department\n123 INDUSTRIAL WAY • CHICAGO, IL 60610 • TAX ID: TAX-ACME-001\n\nINVOICE #: INV-ACME-001\nDATE: 11/20/2025\nTERMS: NET30\nCURRENCY: USD\nREMIT TO: ACME SUPPLIES INC - ACCOUNTS PAYABLE\n\nBILL TO:\nLM COMPANY\nAccounts Payable\n1234 Main Street\nLos Angeles, CA 90021\n\nPO NUMBER: PO-ACME-001\nSHIP VIA: UPS Ground\nSHIP DATE: 11/15/2025\nRECEIPT #: ACME-SHIP-001\n\n------------------------------------------------------------\nLINE | ITEM NO.       | DESCRIPTION         | QTY | UNIT | PRICE | AMOUNT\n------------------------------------------------------------\n0001 | ITEM-ACME-100  | STEEL BOLTS 1/4-20  | 500 | EA   | 0.85  | 425.00\n------------------------------------------------------------\nFREIGHT:      0.00\nMISC CHARGE:  0.00\nSUBTOTAL:    425.00\nTOTAL DUE:   $425.00\n\nPLEASE PAY WITHIN 30 DAYS OF INVOICE DATE\n",
  "Created-At": "2025-11-08T00:22:20.000Z",
  "Modified-At": "2025-11-11T15:38:06.000Z",
  "Status": "Pending",
  "POInvoiceHeaders": [
    "recxVPbeDO55uHoq0",
    "recCWHr90vR9doQHd"
  ],
  "Balance": -425,
  "Headers-Sum": 850
}
```

**Invoice Data Summary:**
- Total fields: 16
- Fields with values: 16

---

## Match Payload (PO Candidates)

```json
{
  "success": true,
  "processedAt": "2025-11-10 20:43:16",
  "vendor": {
    "companyCode": "LM",
    "vendorId": "ACME001",
    "vendorName": "ACME SUPPLIES INC",
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
    "remitName": "ACME SUPPLIES INC - ACCOUNTS PAYABLE",
    "termsId": "NET30",
    "taxID3": "TAX-ACME-001",
    "curyID": "USD",
    "curyRateType": "AVE",
    "vendAPAcct": "2000",
    "vendAPSub": "000",
    "vendExpAcct": "5000",
    "vendExpSub": "100"
  },
  "matchingReceipts": [
    {
      "poNumberSeqType": "R",
      "poNumber": "PO-ACME-004",
      "poReleaseNumber": "0000",
      "poLineNumber": "0001",
      "vendorShipNumber": "ACME-SHIP-004",
      "dateReceived": "2025-11-22",
      "itemNo": "ITEM-ACME-500",
      "itemDescription": "Rivets Aluminum 3/16",
      "quantityReceived": 5000,
      "quantityAccepted": 5000,
      "vendorId": "ACME001",
      "vendorName": "ACME SUPPLIES INC",
      "jobProjectNumber": "PROJ-2025-002",
      "step": "FABRICATION",
      "purchasePrice": 0.08,
      "pricingQuantity": 1,
      "expAcct": "5000",
      "expSub": "100",
      "uom": "EA",
      "curyMutlDiv": 1,
      "standardCost": 0.075
    },
    {
      "poNumberSeqType": "R",
      "poNumber": "PO-ACME-003",
      "poReleaseNumber": "0000",
      "poLineNumber": "0001",
      "vendorShipNumber": "ACME-SHIP-003",
      "dateReceived": "2025-11-20",
      "itemNo": "ITEM-ACME-400",
      "itemDescription": "Machine Screws #10",
      "quantityReceived": 750,
      "quantityAccepted": 750,
      "vendorId": "ACME001",
      "vendorName": "ACME SUPPLIES INC",
      "jobProjectNumber": "",
      "step": "",
      "purchasePrice": 0.45,
      "pricingQuantity": 1,
      "expAcct": "5000",
      "expSub": "100",
      "uom": "EA",
      "curyMutlDiv": 1,
      "standardCost": 0.42
    },
    {
      "poNumberSeqType": "R",
      "poNumber": "PO-ACME-002",
      "poReleaseNumber": "0000",
      "poLineNumber": "0001",
      "vendorShipNumber": "ACME-SHIP-002",
      "dateReceived": "2025-11-18",
      "itemNo": "ITEM-ACME-200",
      "itemDescription": "Hex Nuts 1/4-20",
      "quantityReceived": 1000,
      "quantityAccepted": 1000,
      "vendorId": "ACME001",
      "vendorName": "ACME SUPPLIES INC",
      "jobProjectNumber": "PROJ-2025-001",
      "step": "ASSEMBLY",
      "purchasePrice": 0.25,
      "pricingQuantity": 1,
      "expAcct": "5000",
      "expSub": "100",
      "uom": "EA",
      "curyMutlDiv": 1,
      "standardCost": 0.22
    },
    {
      "poNumberSeqType": "R",
      "poNumber": "PO-ACME-002",
      "poReleaseNumber": "0000",
      "poLineNumber": "0002",
      "vendorShipNumber": "ACME-SHIP-002",
      "dateReceived": "2025-11-18",
      "itemNo": "ITEM-ACME-300",
      "itemDescription": "Flat Washers 1/4",
      "quantityReceived": 1000,
      "quantityAccepted": 950,
      "vendorId": "ACME001",
      "vendorName": "ACME SUPPLIES INC",
      "jobProjectNumber": "PROJ-2025-001",
      "step": "ASSEMBLY",
      "purchasePrice": 0.15,
      "pricingQuantity": 1,
      "expAcct": "5000",
      "expSub": "100",
      "uom": "EA",
      "curyMutlDiv": 1,
      "standardCost": 0.14
    },
    {
      "poNumberSeqType": "R",
      "poNumber": "PO-ACME-001",
      "poReleaseNumber": "0000",
      "poLineNumber": "0001",
      "vendorShipNumber": "ACME-SHIP-001",
      "dateReceived": "2025-11-15",
      "itemNo": "ITEM-ACME-100",
      "itemDescription": "Steel Bolts 1/4-20",
      "quantityReceived": 500,
      "quantityAccepted": 500,
      "vendorId": "ACME001",
      "vendorName": "ACME SUPPLIES INC",
      "jobProjectNumber": "",
      "step": "",
      "purchasePrice": 0.85,
      "pricingQuantity": 1,
      "expAcct": "5000",
      "expSub": "100",
      "uom": "EA",
      "curyMutlDiv": 1,
      "standardCost": 0.8
    }
  ],
  "totalMatches": 5,
  "airTableRecordID": "recEeIsdseafu6Kr2"
}
```

**Match Payload Summary:**
- Has data: Yes
- Keys: success, processedAt, vendor, matchingReceipts, totalMatches, airTableRecordID

---

## System Message

```
You are an expert at matching invoices to purchase orders and generating structured ERP import data.
```

---

## User Prompt (Sent to GPT)

```
Analyze the invoice data and PO match candidates to generate structured POInvoiceHeader and POInvoiceDetail records. Respond with only the JSON object, no other text.

## INVOICE DATA
{
  "RecordID": 2,
  "Invoice-Number": "INV-ACME-001",
  "VendId": "ACME001",
  "Vendor-Name": "ACME SUPPLIES INC",
  "Amount": 425,
  "Date": "2025-11-20",
  "Freight-Charge": 0,
  "Surcharge": 0,
  "POs": "PO-ACME-001",
  "Document-Raw-Text": "ACME SUPPLIES INC\nAccounts Payable Department\n123 INDUSTRIAL WAY • CHICAGO, IL 60610 • TAX ID: TAX-ACME-001\n\nINVOICE #: INV-ACME-001\nDATE: 11/20/2025\nTERMS: NET30\nCURRENCY: USD\nREMIT TO: ACME SUPPLIES INC - ACCOUNTS PAYABLE\n\nBILL TO:\nLM COMPANY\nAccounts Payable\n1234 Main Street\nLos Angeles, CA 90021\n\nPO NUMBER: PO-ACME-001\nSHIP VIA: UPS Ground\nSHIP DATE: 11/15/2025\nRECEIPT #: ACME-SHIP-001\n\n------------------------------------------------------------\nLINE | ITEM NO.       | DESCRIPTION         | QTY | UNIT | PRICE | AMOUNT\n------------------------------------------------------------\n0001 | ITEM-ACME-100  | STEEL BOLTS 1/4-20  | 500 | EA   | 0.85  | 425.00\n------------------------------------------------------------\nFREIGHT:      0.00\nMISC CHARGE:  0.00\nSUBTOTAL:    425.00\nTOTAL DUE:   $425.00\n\nPLEASE PAY WITHIN 30 DAYS OF INVOICE DATE\n",
  "Created-At": "2025-11-08T00:22:20.000Z",
  "Modified-At": "2025-11-11T15:38:06.000Z",
  "Status": "Pending",
  "POInvoiceHeaders": [
    "recxVPbeDO55uHoq0",
    "recCWHr90vR9doQHd"
  ],
  "Balance": -425,
  "Headers-Sum": 850
}

## PO MATCH CANDIDATES
{
  "success": true,
  "processedAt": "2025-11-10 20:43:16",
  "vendor": {
    "companyCode": "LM",
    "vendorId": "ACME001",
    "vendorName": "ACME SUPPLIES INC",
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
    "remitName": "ACME SUPPLIES INC - ACCOUNTS PAYABLE",
    "termsId": "NET30",
    "taxID3": "TAX-ACME-001",
    "curyID": "USD",
    "curyRateType": "AVE",
    "vendAPAcct": "2000",
    "vendAPSub": "000",
    "vendExpAcct": "5000",
    "vendExpSub": "100"
  },
  "matchingReceipts": [
    {
      "poNumberSeqType": "R",
      "poNumber": "PO-ACME-004",
      "poReleaseNumber": "0000",
      "poLineNumber": "0001",
      "vendorShipNumber": "ACME-SHIP-004",
      "dateReceived": "2025-11-22",
      "itemNo": "ITEM-ACME-500",
      "itemDescription": "Rivets Aluminum 3/16",
      "quantityReceived": 5000,
      "quantityAccepted": 5000,
      "vendorId": "ACME001",
      "vendorName": "ACME SUPPLIES INC",
      "jobProjectNumber": "PROJ-2025-002",
      "step": "FABRICATION",
      "purchasePrice": 0.08,
      "pricingQuantity": 1,
      "expAcct": "5000",
      "expSub": "100",
      "uom": "EA",
      "curyMutlDiv": 1,
      "standardCost": 0.075
    },
    {
      "poNumberSeqType": "R",
      "poNumber": "PO-ACME-003",
      "poReleaseNumber": "0000",
      "poLineNumber": "0001",
      "vendorShipNumber": "ACME-SHIP-003",
      "dateReceived": "2025-11-20",
      "itemNo": "ITEM-ACME-400",
      "itemDescription": "Machine Screws #10",
      "quantityReceived": 750,
      "quantityAccepted": 750,
      "vendorId": "ACME001",
      "vendorName": "ACME SUPPLIES INC",
      "jobProjectNumber": "",
      "step": "",
      "purchasePrice": 0.45,
      "pricingQuantity": 1,
      "expAcct": "5000",
      "expSub": "100",
      "uom": "EA",
      "curyMutlDiv": 1,
      "standardCost": 0.42
    },
    {
      "poNumberSeqType": "R",
      "poNumber": "PO-ACME-002",
      "poReleaseNumber": "0000",
      "poLineNumber": "0001",
      "vendorShipNumber": "ACME-SHIP-002",
      "dateReceived": "2025-11-18",
      "itemNo": "ITEM-ACME-200",
      "itemDescription": "Hex Nuts 1/4-20",
      "quantityReceived": 1000,
      "quantityAccepted": 1000,
      "vendorId": "ACME001",
      "vendorName": "ACME SUPPLIES INC",
      "jobProjectNumber": "PROJ-2025-001",
      "step": "ASSEMBLY",
      "purchasePrice": 0.25,
      "pricingQuantity": 1,
      "expAcct": "5000",
      "expSub": "100",
      "uom": "EA",
      "curyMutlDiv": 1,
      "standardCost": 0.22
    },
    {
      "poNumberSeqType": "R",
      "poNumber": "PO-ACME-002",
      "poReleaseNumber": "0000",
      "poLineNumber": "0002",
      "vendorShipNumber": "ACME-SHIP-002",
      "dateReceived": "2025-11-18",
      "itemNo": "ITEM-ACME-300",
      "itemDescription": "Flat Washers 1/4",
      "quantityReceived": 1000,
      "quantityAccepted": 950,
      "vendorId": "ACME001",
      "vendorName": "ACME SUPPLIES INC",
      "jobProjectNumber": "PROJ-2025-001",
      "step": "ASSEMBLY",
      "purchasePrice": 0.15,
      "pricingQuantity": 1,
      "expAcct": "5000",
      "expSub": "100",
      "uom": "EA",
      "curyMutlDiv": 1,
      "standardCost": 0.14
    },
    {
      "poNumberSeqType": "R",
      "poNumber": "PO-ACME-001",
      "poReleaseNumber": "0000",
      "poLineNumber": "0001",
      "vendorShipNumber": "ACME-SHIP-001",
      "dateReceived": "2025-11-15",
      "itemNo": "ITEM-ACME-100",
      "itemDescription": "Steel Bolts 1/4-20",
      "quantityReceived": 500,
      "quantityAccepted": 500,
      "vendorId": "ACME001",
      "vendorName": "ACME SUPPLIES INC",
      "jobProjectNumber": "",
      "step": "",
      "purchasePrice": 0.85,
      "pricingQuantity": 1,
      "expAcct": "5000",
      "expSub": "100",
      "uom": "EA",
      "curyMutlDiv": 1,
      "standardCost": 0.8
    }
  ],
  "totalMatches": 5,
  "airTableRecordID": "recEeIsdseafu6Kr2"
}

## INSTRUCTIONS

**Extract Invoice Line Items:**
- Create flexible objects for each invoice line item
- All data MUST come from the invoice (not from PO)
- Include: description, quantity, unit price, extended amount, and everything else you can find about line items.

**Create Headers:**
- Create one header for each unique PO number that matches invoice line items
- Group invoice line items by their matched PO number - items matching the same PO share a header
- If an invoice line item has no PO match, ignore it
- IMPORTANT: Each invoice line item must have exactly one detail record in exactly one header
- Populate: all fields you can find about the PO, specified in the resposne schema.
- Use data from vendor info in match payload

**Create Details (nested in each header):**
- Create exactly one detail record for each invoice line item
- Match invoice line items to PO receipts by item number (Item-No) try for exact match, but fuzzy is fine too. you can use the description, and other fields to ensure its a match.
- Populate pricing fields (Invoice-Price, Quantity-Invoiced, Line-Amount) from invoice line item
- Populate PO fields (Purchase-Price, Quantity-Received, PO-Line-Number) from matching PO receipt
- If no PO match found for a line item, dont enter it
- Populate: all fields you can find about the PO, specified in the resposne schema.

**Key Rules:**
- Every invoice line item must result in exactly one detail record
- Details are grouped into headers by matching PO number
- If two line items match different POs, create separate headers
- If two line items match the same PO, put both details in one header
- Only populate fields you have data for (leave blank)
- Do not invent data (all data should either come from invoice or POs directly)
- Match line items to correct PO receipts

```

**Prompt Statistics:**
- Length: 7541 characters
- Lines: 33

---

## JSON Schema (Structured Outputs)

```json
{
  "type": "object",
  "properties": {
    "Invoice Line Items": {
      "type": "array",
      "description": "Array of invoice line items. These line items serve as the source for pricing and quantity data in POInvoiceDetails.",
      "items": {
        "type": "object",
        "additionalProperties": false,
        "required": [
          "line",
          "description",
          "item",
          "itemNo",
          "quantity",
          "qty",
          "unit_price",
          "price",
          "amount",
          "total",
          "uom",
          "account",
          "subaccount"
        ],
        "properties": {
          "line": {
            "type": "number",
            "description": "Line number"
          },
          "description": {
            "type": "string",
            "description": "Item description"
          },
          "item": {
            "type": "string",
            "description": "Item identifier or SKU"
          },
          "itemNo": {
            "type": "string",
            "description": "Item number"
          },
          "quantity": {
            "type": "number",
            "description": "Quantity"
          },
          "qty": {
            "type": "number",
            "description": "Quantity (abbreviated)"
          },
          "unit_price": {
            "type": "number",
            "description": "Unit price"
          },
          "price": {
            "type": "number",
            "description": "Price"
          },
          "amount": {
            "type": "number",
            "description": "Extended amount"
          },
          "total": {
            "type": "number",
            "description": "Line total"
          },
          "uom": {
            "type": "string",
            "description": "Unit of measure"
          },
          "account": {
            "type": "string",
            "description": "Account code"
          },
          "subaccount": {
            "type": "string",
            "description": "Subaccount code"
          }
        }
      }
    },
    "headers": {
      "type": "array",
      "description": "Purchase order invoice headers, each containing corresponding details (POInvoiceDetails).",
      "items": {
        "type": "object",
        "required": [
          "details",
          "Company-Code",
          "VendId",
          "TermsId",
          "APAcct",
          "APSub",
          "Freight-Account",
          "Freight-Subaccount",
          "Misc-Charge-Account",
          "Misc-Charge-Subaccount",
          "PO-Number-Seq-Type",
          "PO-Number",
          "PO-Vendor",
          "CuryId",
          "CuryMultDiv",
          "CuryRate",
          "CuryRateType",
          "User-Id",
          "Job-Project-Number"
        ],
        "additionalProperties": false,
        "properties": {
          "Company-Code": {
            "type": "string",
            "description": "Company identifier"
          },
          "VendId": {
            "type": "string",
            "description": "Vendor ID"
          },
          "TermsId": {
            "type": "string",
            "description": "Payment terms"
          },
          "APAcct": {
            "type": "string",
            "description": "Accounts Payable account"
          },
          "APSub": {
            "type": "string",
            "description": "Accounts Payable subaccount"
          },
          "Freight-Account": {
            "type": "string"
          },
          "Freight-Subaccount": {
            "type": "string"
          },
          "Misc-Charge-Account": {
            "type": "string"
          },
          "Misc-Charge-Subaccount": {
            "type": "string"
          },
          "PO-Number-Seq-Type": {
            "type": "string"
          },
          "PO-Number": {
            "type": "string"
          },
          "PO-Vendor": {
            "type": "string"
          },
          "CuryId": {
            "type": "string"
          },
          "CuryMultDiv": {
            "type": "string",
            "enum": [
              "multiple",
              "divide"
            ]
          },
          "CuryRate": {
            "type": "number"
          },
          "CuryRateType": {
            "type": "string"
          },
          "User-Id": {
            "type": "string"
          },
          "Job-Project-Number": {
            "type": "string"
          },
          "details": {
            "type": "array",
            "description": "POInvoiceDetail records linked to this header",
            "items": {
              "type": "object",
              "additionalProperties": false,
              "required": [
                "Line-Number",
                "Item-No",
                "Item-Description",
                "Step",
                "Invoice-Price",
                "Invoice-Pricing-Qty",
                "Quantity-Invoiced",
                "Line-Amount",
                "PO-Release-Number",
                "PO-Line-Number",
                "Vendor-Ship-Number",
                "Date-Received",
                "Quantity-Received",
                "Quantity-Accepted",
                "Purchase-Price",
                "Pricing-Quantity",
                "ExpAcct",
                "ExpSub",
                "PPV-Vouchered-Acct",
                "PPV-Vouchered-SubAcct",
                "PPV-Unit-Cost",
                "Standard-Cost",
                "Surcharge",
                "PO-UOM",
                "Job-Project-Number"
              ],
              "properties": {
                "Line-Number": {
                  "type": "integer",
                  "description": "Autonumber identifying line sequence"
                },
                "Item-No": {
                  "type": "string"
                },
                "Item-Description": {
                  "type": "string"
                },
                "Step": {
                  "type": "string"
                },
                "Invoice-Price": {
                  "type": "number",
                  "description": "Unit price from corresponding invoice line item"
                },
                "Invoice-Pricing-Qty": {
                  "type": "number",
                  "description": "Quantity price break from invoice line item"
                },
                "Quantity-Invoiced": {
                  "type": "number",
                  "description": "Invoiced quantity from corresponding invoice line item"
                },
                "Line-Amount": {
                  "type": "number",
                  "description": "Extended line total from invoice line item"
                },
                "PO-Release-Number": {
                  "type": "string"
                },
                "PO-Line-Number": {
                  "type": "string"
                },
                "Vendor-Ship-Number": {
                  "type": "string"
                },
                "Date-Received": {
                  "type": "string",
                  "format": "date"
                },
                "Quantity-Received": {
                  "type": "number"
                },
                "Quantity-Accepted": {
                  "type": "number"
                },
                "Purchase-Price": {
                  "type": "number"
                },
                "Pricing-Quantity": {
                  "type": "number"
                },
                "ExpAcct": {
                  "type": "string"
                },
                "ExpSub": {
                  "type": "string"
                },
                "PPV-Vouchered-Acct": {
                  "type": "string"
                },
                "PPV-Vouchered-SubAcct": {
                  "type": "string"
                },
                "PPV-Unit-Cost": {
                  "type": "number",
                  "description": "Calculated formula field for purchase price variance per unit"
                },
                "Standard-Cost": {
                  "type": "number"
                },
                "Surcharge": {
                  "type": "number"
                },
                "PO-UOM": {
                  "type": "string"
                },
                "Job-Project-Number": {
                  "type": "string"
                }
              }
            }
          }
        }
      }
    }
  },
  "required": [
    "Invoice Line Items",
    "headers"
  ],
  "additionalProperties": false
}
```

**Schema Notes:**
- Schema Name: `POMatchingResponse` (set in API call)
- Strict Mode: `true` (set in API call)
- Required Root Fields: `Invoice Line Items, headers`

### Job-Project-Number Field Analysis

**In Headers Schema:**
- Field Name: `Job-Project-Number`
- Type: `string`
- Required: `Yes ⚠️ (MUST BE PROVIDED)`
- Description: `None`

**In Details Schema:**
- Field Name: `Job-Project-Number`
- Type: `string`
- Required: `Yes ⚠️ (MUST BE PROVIDED)`
- Description: `None`

---

## Analysis

### Prompt Instructions Related to Job-Project-Number

Searching the prompt for mentions of "job", "project", or related terms:

✅ Found mentions of job/project in prompt

### Data Availability

**In Invoice Data:**
❌ No job/project related fields found in invoice data

**In Match Payload:**
✅ Found job/project related data in match payload

---

## Full API Request (What OpenAI Receives)

```json
{
  "model": "gpt-5",
  "messages": [
    {
      "role": "system",
      "content": "You are an expert at matching invoices to purchase orders and generating structured ERP import data."
    },
    {
      "role": "user",
      "content": "Analyze the invoice data and PO match candidates to generate structured POInvoiceHeader and POInvoiceDetail records. Respond with only the JSON object, no other text.\n\n## INVOICE DATA\n{\n  \"RecordID\": 2,\n  \"Invoice-Number\": \"INV-ACME-001\",\n  \"VendId\": \"ACME001\",\n  \"Vendor-Name\": \"ACME SUPPLIES INC\",\n  \"Amount\": 425,\n  \"Date\": \"2025-11-20\",\n  \"Freight-Charge\": 0,\n  \"Surcharge\": 0,\n  \"POs\": \"PO-ACME-001\",\n  \"Document-Raw-Text\": \"ACME SUPPLIES INC\\nAccounts Payable Department\\n123 INDUSTRIAL WAY • CHICAGO, IL 60610 • TAX ID: TAX-ACME-001\\n\\nINVOICE #: INV-ACME-001\\nDATE: 11/20/2025\\nTERMS: NET30\\nCURRENCY: USD\\nREMIT TO: ACME SUPPLIES INC - ACCOUNTS PAYABLE\\n\\nBILL TO:\\nLM COMPANY\\nAccounts Payable\\n1234 Main Street\\nLos Angeles, CA 90021\\n\\nPO NUMBER: PO-ACME-001\\nSHIP VIA: UPS Ground\\nSHIP DATE: 11/15/2025\\nRECEIPT #: ACME-SHIP-001\\n\\n------------------------------------------------------------\\nLINE | ITEM NO.       | DESCRIPTION         | QTY | UNIT | PRICE | AMOUNT\\n------------------------------------------------------------\\n0001 | ITEM-ACME-100  | STEEL BOLTS 1/4-20  | 500 | EA   | 0.85  | 425.00\\n------------------------------------------------------------\\nFREIGHT:      0.00\\nMISC CHARGE:  0.00\\nSUBTOTAL:    425.00\\nTOTAL DUE:   $425.00\\n\\nPLEASE PAY WITHIN 30 DAYS OF INVOICE DATE\\n\",\n  \"Created-At\": \"2025-11-08T00:22:20.000Z\",\n  \"Modified-At\": \"2025-11-11T15:38:06.000Z\",\n  \"Status\": \"Pending\",\n  \"POInvoiceHeaders\": [\n    \"recxVPbeDO55uHoq0\",\n    \"recCWHr90vR9doQHd\"\n  ],\n  \"Balance\": -425,\n  \"Headers-Sum\": 850\n}\n\n## PO MATCH CANDIDATES\n{\n  \"success\": true,\n  \"processedAt\": \"2025-11-10 20:43:16\",\n  \"vendor\": {\n    \"companyCode\": \"LM\",\n    \"vendorId\": \"ACME001\",\n    \"vendorName\": \"ACME SUPPLIES INC\",\n    \"apapAcct\": \"35\",\n    \"apapSub\": \"000-2100-00\",\n    \"apExpAcct\": \"18\",\n    \"apExpSub\": \"000-1300-01\",\n    \"freightAccount\": \"6000\",\n    \"freightSubAccount\": \"000\",\n    \"miscChargeAccount\": \"6100\",\n    \"miscChargeSubAccount\": \"000\",\n    \"ppvVoucheredAcct\": \"1192\",\n    \"ppvVoucheredSubAcct\": \"000\",\n    \"remitName\": \"ACME SUPPLIES INC - ACCOUNTS PAYABLE\",\n    \"termsId\": \"NET30\",\n    \"taxID3\": \"TAX-ACME-001\",\n    \"curyID\": \"USD\",\n    \"curyRateType\": \"AVE\",\n    \"vendAPAcct\": \"2000\",\n    \"vendAPSub\": \"000\",\n    \"vendExpAcct\": \"5000\",\n    \"vendExpSub\": \"100\"\n  },\n  \"matchingReceipts\": [\n    {\n      \"poNumberSeqType\": \"R\",\n      \"poNumber\": \"PO-ACME-004\",\n      \"poReleaseNumber\": \"0000\",\n      \"poLineNumber\": \"0001\",\n      \"vendorShipNumber\": \"ACME-SHIP-004\",\n      \"dateReceived\": \"2025-11-22\",\n      \"itemNo\": \"ITEM-ACME-500\",\n      \"itemDescription\": \"Rivets Aluminum 3/16\",\n      \"quantityReceived\": 5000,\n      \"quantityAccepted\": 5000,\n      \"vendorId\": \"ACME001\",\n      \"vendorName\": \"ACME SUPPLIES INC\",\n      \"jobProjectNumber\": \"PROJ-2025-002\",\n      \"step\": \"FABRICATION\",\n      \"purchasePrice\": 0.08,\n      \"pricingQuantity\": 1,\n      \"expAcct\": \"5000\",\n      \"expSub\": \"100\",\n      \"uom\": \"EA\",\n      \"curyMutlDiv\": 1,\n      \"standardCost\": 0.075\n    },\n    {\n      \"poNumberSeqType\": \"R\",\n      \"poNumber\": \"PO-ACME-003\",\n      \"poReleaseNumber\": \"0000\",\n      \"poLineNumber\": \"0001\",\n      \"vendorShipNumber\": \"ACME-SHIP-003\",\n      \"dateReceived\": \"2025-11-20\",\n      \"itemNo\": \"ITEM-ACME-400\",\n      \"itemDescription\": \"Machine Screws #10\",\n      \"quantityReceived\": 750,\n      \"quantityAccepted\": 750,\n      \"vendorId\": \"ACME001\",\n      \"vendorName\": \"ACME SUPPLIES INC\",\n      \"jobProjectNumber\": \"\",\n      \"step\": \"\",\n      \"purchasePrice\": 0.45,\n      \"pricingQuantity\": 1,\n      \"expAcct\": \"5000\",\n      \"expSub\": \"100\",\n      \"uom\": \"EA\",\n      \"curyMutlDiv\": 1,\n      \"standardCost\": 0.42\n    },\n    {\n      \"poNumberSeqType\": \"R\",\n      \"poNumber\": \"PO-ACME-002\",\n      \"poReleaseNumber\": \"0000\",\n      \"poLineNumber\": \"0001\",\n      \"vendorShipNumber\": \"ACME-SHIP-002\",\n      \"dateReceived\": \"2025-11-18\",\n      \"itemNo\": \"ITEM-ACME-200\",\n      \"itemDescription\": \"Hex Nuts 1/4-20\",\n      \"quantityReceived\": 1000,\n      \"quantityAccepted\": 1000,\n      \"vendorId\": \"ACME001\",\n      \"vendorName\": \"ACME SUPPLIES INC\",\n      \"jobProjectNumber\": \"PROJ-2025-001\",\n      \"step\": \"ASSEMBLY\",\n      \"purchasePrice\": 0.25,\n      \"pricingQuantity\": 1,\n      \"expAcct\": \"5000\",\n      \"expSub\": \"100\",\n      \"uom\": \"EA\",\n      \"curyMutlDiv\": 1,\n      \"standardCost\": 0.22\n    },\n    {\n      \"poNumberSeqType\": \"R\",\n      \"poNumber\": \"PO-ACME-002\",\n      \"poReleaseNumber\": \"0000\",\n      \"poLineNumber\": \"0002\",\n      \"vendorShipNumber\": \"ACME-SHIP-002\",\n      \"dateReceived\": \"2025-11-18\",\n      \"itemNo\": \"ITEM-ACME-300\",\n      \"itemDescription\": \"Flat Washers 1/4\",\n      \"quantityReceived\": 1000,\n      \"quantityAccepted\": 950,\n      \"vendorId\": \"ACME001\",\n      \"vendorName\": \"ACME SUPPLIES INC\",\n      \"jobProjectNumber\": \"PROJ-2025-001\",\n      \"step\": \"ASSEMBLY\",\n      \"purchasePrice\": 0.15,\n      \"pricingQuantity\": 1,\n      \"expAcct\": \"5000\",\n      \"expSub\": \"100\",\n      \"uom\": \"EA\",\n      \"curyMutlDiv\": 1,\n      \"standardCost\": 0.14\n    },\n    {\n      \"poNumberSeqType\": \"R\",\n      \"poNumber\": \"PO-ACME-001\",\n      \"poReleaseNumber\": \"0000\",\n      \"poLineNumber\": \"0001\",\n      \"vendorShipNumber\": \"ACME-SHIP-001\",\n      \"dateReceived\": \"2025-11-15\",\n      \"itemNo\": \"ITEM-ACME-100\",\n      \"itemDescription\": \"Steel Bolts 1/4-20\",\n      \"quantityReceived\": 500,\n      \"quantityAccepted\": 500,\n      \"vendorId\": \"ACME001\",\n      \"vendorName\": \"ACME SUPPLIES INC\",\n      \"jobProjectNumber\": \"\",\n      \"step\": \"\",\n      \"purchasePrice\": 0.85,\n      \"pricingQuantity\": 1,\n      \"expAcct\": \"5000\",\n      \"expSub\": \"100\",\n      \"uom\": \"EA\",\n      \"curyMutlDiv\": 1,\n      \"standardCost\": 0.8\n    }\n  ],\n  \"totalMatches\": 5,\n  \"airTableRecordID\": \"recEeIsdseafu6Kr2\"\n}\n\n## INSTRUCTIONS\n\n**Extract Invoice Line Items:**\n- Create flexible objects for each invoice line item\n- All data MUST come from the invoice (not from PO)\n- Include: description, quantity, unit price, extended amount, and everything else you can find about line items.\n\n**Create Headers:**\n- Create one header for each unique PO number that matches invoice line items\n- Group invoice line items by their matched PO number - items matching the same PO share a header\n- If an invoice line item has no PO match, ignore it\n- IMPORTANT: Each invoice line item must have exactly one detail record in exactly one header\n- Populate: all fields you can find about the PO, specified in the resposne schema.\n- Use data from vendor info in match payload\n\n**Create Details (nested in each header):**\n- Create exactly one detail record for each invoice line item\n- Match invoice line items to PO receipts by item number (Item-No) try for exact match, but fuzzy is fine too. you can use the description, and other fields to ensure its a match.\n- Populate pricing fields (Invoice-Price, Quantity-Invoiced, Line-Amount) from invoice line item\n- Populate PO fields (Purchase-Price, Quantity-Received, PO-Line-Number) from matching PO receipt\n- If no PO match found for a line item, dont enter it\n- Populate: all fields you can find about the PO, specified in the resposne schema.\n\n**Key Rules:**\n- Every invoice line item must result in exactly one detail record\n- Details are grouped into headers by matching PO number\n- If two line items match different POs, create separate headers\n- If two line items match the same PO, put both details in one header\n- Only populate fields you have data for (leave blank)\n- Do not invent data (all data should either come from invoice or POs directly)\n- Match line items to correct PO receipts\n"
    }
  ],
  "response_format": {
    "type": "json_schema",
      "json_schema": {
        "name": "POMatchingResponse",
        "schema": {
  "type": "object",
  "properties": {
    "Invoice Line Items": {
      "type": "array",
      "description": "Array of invoice line items. These line items serve as the source for pricing and quantity data in POInvoiceDetails.",
      "items": {
        "type": "object",
        "additionalProperties": false,
        "required": [
          "line",
          "description",
          "item",
          "itemNo",
          "quantity",
          "qty",
          "unit_price",
          "price",
          "amount",
          "total",
          "uom",
          "account",
          "subaccount"
        ],
        "properties": {
          "line": {
            "type": "number",
            "description": "Line number"
          },
          "description": {
            "type": "string",
            "description": "Item description"
          },
          "item": {
            "type": "string",
            "description": "Item identifier or SKU"
          },
          "itemNo": {
            "type": "string",
            "description": "Item number"
          },
          "quantity": {
            "type": "number",
            "description": "Quantity"
          },
          "qty": {
            "type": "number",
            "description": "Quantity (abbreviated)"
          },
          "unit_price": {
            "type": "number",
            "description": "Unit price"
          },
          "price": {
            "type": "number",
            "description": "Price"
          },
          "amount": {
            "type": "number",
            "description": "Extended amount"
          },
          "total": {
            "type": "number",
            "description": "Line total"
          },
          "uom": {
            "type": "string",
            "description": "Unit of measure"
          },
          "account": {
            "type": "string",
            "description": "Account code"
          },
          "subaccount": {
            "type": "string",
            "description": "Subaccount code"
          }
        }
      }
    },
    "headers": {
      "type": "array",
      "description": "Purchase order invoice headers, each containing corresponding details (POInvoiceDetails).",
      "items": {
        "type": "object",
        "required": [
          "details",
          "Company-Code",
          "VendId",
          "TermsId",
          "APAcct",
          "APSub",
          "Freight-Account",
          "Freight-Subaccount",
          "Misc-Charge-Account",
          "Misc-Charge-Subaccount",
          "PO-Number-Seq-Type",
          "PO-Number",
          "PO-Vendor",
          "CuryId",
          "CuryMultDiv",
          "CuryRate",
          "CuryRateType",
          "User-Id",
          "Job-Project-Number"
        ],
        "additionalProperties": false,
        "properties": {
          "Company-Code": {
            "type": "string",
            "description": "Company identifier"
          },
          "VendId": {
            "type": "string",
            "description": "Vendor ID"
          },
          "TermsId": {
            "type": "string",
            "description": "Payment terms"
          },
          "APAcct": {
            "type": "string",
            "description": "Accounts Payable account"
          },
          "APSub": {
            "type": "string",
            "description": "Accounts Payable subaccount"
          },
          "Freight-Account": {
            "type": "string"
          },
          "Freight-Subaccount": {
            "type": "string"
          },
          "Misc-Charge-Account": {
            "type": "string"
          },
          "Misc-Charge-Subaccount": {
            "type": "string"
          },
          "PO-Number-Seq-Type": {
            "type": "string"
          },
          "PO-Number": {
            "type": "string"
          },
          "PO-Vendor": {
            "type": "string"
          },
          "CuryId": {
            "type": "string"
          },
          "CuryMultDiv": {
            "type": "string",
            "enum": [
              "multiple",
              "divide"
            ]
          },
          "CuryRate": {
            "type": "number"
          },
          "CuryRateType": {
            "type": "string"
          },
          "User-Id": {
            "type": "string"
          },
          "Job-Project-Number": {
            "type": "string"
          },
          "details": {
            "type": "array",
            "description": "POInvoiceDetail records linked to this header",
            "items": {
              "type": "object",
              "additionalProperties": false,
              "required": [
                "Line-Number",
                "Item-No",
                "Item-Description",
                "Step",
                "Invoice-Price",
                "Invoice-Pricing-Qty",
                "Quantity-Invoiced",
                "Line-Amount",
                "PO-Release-Number",
                "PO-Line-Number",
                "Vendor-Ship-Number",
                "Date-Received",
                "Quantity-Received",
                "Quantity-Accepted",
                "Purchase-Price",
                "Pricing-Quantity",
                "ExpAcct",
                "ExpSub",
                "PPV-Vouchered-Acct",
                "PPV-Vouchered-SubAcct",
                "PPV-Unit-Cost",
                "Standard-Cost",
                "Surcharge",
                "PO-UOM",
                "Job-Project-Number"
              ],
              "properties": {
                "Line-Number": {
                  "type": "integer",
                  "description": "Autonumber identifying line sequence"
                },
                "Item-No": {
                  "type": "string"
                },
                "Item-Description": {
                  "type": "string"
                },
                "Step": {
                  "type": "string"
                },
                "Invoice-Price": {
                  "type": "number",
                  "description": "Unit price from corresponding invoice line item"
                },
                "Invoice-Pricing-Qty": {
                  "type": "number",
                  "description": "Quantity price break from invoice line item"
                },
                "Quantity-Invoiced": {
                  "type": "number",
                  "description": "Invoiced quantity from corresponding invoice line item"
                },
                "Line-Amount": {
                  "type": "number",
                  "description": "Extended line total from invoice line item"
                },
                "PO-Release-Number": {
                  "type": "string"
                },
                "PO-Line-Number": {
                  "type": "string"
                },
                "Vendor-Ship-Number": {
                  "type": "string"
                },
                "Date-Received": {
                  "type": "string",
                  "format": "date"
                },
                "Quantity-Received": {
                  "type": "number"
                },
                "Quantity-Accepted": {
                  "type": "number"
                },
                "Purchase-Price": {
                  "type": "number"
                },
                "Pricing-Quantity": {
                  "type": "number"
                },
                "ExpAcct": {
                  "type": "string"
                },
                "ExpSub": {
                  "type": "string"
                },
                "PPV-Vouchered-Acct": {
                  "type": "string"
                },
                "PPV-Vouchered-SubAcct": {
                  "type": "string"
                },
                "PPV-Unit-Cost": {
                  "type": "number",
                  "description": "Calculated formula field for purchase price variance per unit"
                },
                "Standard-Cost": {
                  "type": "number"
                },
                "Surcharge": {
                  "type": "number"
                },
                "PO-UOM": {
                  "type": "string"
                },
                "Job-Project-Number": {
                  "type": "string"
                }
              }
            }
          }
        }
      }
    }
  },
  "required": [
    "Invoice Line Items",
    "headers"
  ],
  "additionalProperties": false
},
        "strict": true
      }
  }
}
```

---

## Recommendations

1. **Check if Job-Project-Number is in the invoice data** - If it's not present, GPT cannot extract it
2. **Check if Job-Project-Number is in the match payload** - PO receipts may contain this field
3. **Review prompt instructions** - The prompt should explicitly mention extracting Job-Project-Number if it's available
4. **Check schema requirements** - If Job-Project-Number is optional, GPT may omit it if not found

