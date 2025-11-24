# GPT Output Schema for PO Matching

**Schema Name:** `POMatchingResponse`  
**Schema Type:** JSON Schema (OpenAI Structured Outputs)  
**Mode:** Strict (additionalProperties: false)

## Root Object Structure

```json
{
  "headerCount": number,
  "detailCount": number,
  "headers": POInvoiceHeader[],
  "details": POInvoiceDetail[]
}
```

### Required Fields
- `headerCount` (number) - Number of POInvoiceHeader records to create
- `detailCount` (number) - Number of POInvoiceDetail records to create
- `headers` (array) - Array of POInvoiceHeader objects
- `details` (array) - Array of POInvoiceDetail objects

---

## POInvoiceHeader Schema

Each header object represents a single POInvoiceHeader record to be created in Airtable.

### All Fields (All Optional)

#### Core Identification Fields
- `Company-Code` (string) - Company identifier
- `VendId` (string) - Vendor ID
- `TermsId` (string) - Payment terms (e.g., "30" for Net 30, "NET30")
- `PO-Vendor` (string) - Vendor name on PO

#### Tax Fields
- `TaxID00` (string) - Tax ID 00
- `TaxID01` (string) - Tax ID 01
- `TaxID02` (string) - Tax ID 02
- `TaxID03` (string) - Tax ID 03
- `TaxTot00` (number) - Tax Total 00
- `TaxTot01` (number) - Tax Total 01
- `TaxTot02` (number) - Tax Total 02
- `TaxTot03` (number) - Tax Total 03
- `txblTot00` (number) - Taxable Total 00
- `txblTot01` (number) - Taxable Total 01
- `txblTot02` (number) - Taxable Total 02
- `txblTot03` (number) - Taxable Total 03

#### Accounting Fields - AP Accounts
- `APAcct` (string) - Accounts Payable Account
- `APSub` (string) - Accounts Payable Subaccount

#### Accounting Fields - Freight
- `Freight-Account` (string) - Freight Account
- `Freight-Subaccount` (string) - Freight Subaccount

#### Accounting Fields - Miscellaneous Charges
- `Misc-Charge-Account` (string) - Miscellaneous Charge Account
- `Misc-Charge-Subaccount` (string) - Miscellaneous Charge Subaccount

#### Accounting Fields - Tax Accounts
- `Tax00Acct` (string) - Tax 00 Account
- `Tax01Acct` (string) - Tax 01 Account
- `Tax02Acct` (string) - Tax 02 Account
- `Tax03Acct` (string) - Tax 03 Account
- `Tax00Sub` (string) - Tax 00 Subaccount
- `Tax01Sub` (string) - Tax 01 Subaccount
- `Tax02Sub` (string) - Tax 02 Subaccount
- `Tax03Sub` (string) - Tax 03 Subaccount

#### Currency Fields
- `CuryId` (string) - Currency ID (e.g., "USD")
- `CuryMultDiv` (string, enum) - Currency Multiply/Divide
  - Allowed values: `"multiple"` | `"divide"`
- `CuryRate` (number) - Currency Rate
- `CuryRateType` (string) - Currency Rate Type (e.g., "AVE")

#### Transaction Type
- `Type` (string, enum) - Transaction type
  - Allowed values: `"ST"` | `"VO"` | `"AD"` | `""`

#### Other Fields
- `Job-Project-Number` (string) - Job/Project Number
- `User-Id` (string) - User identifier
- `Update-YN` (boolean) - Update flag (true/false)

### Fields NOT Included (System-Calculated or Lookups)
The following fields are **NOT** populated by GPT as they are calculated by Airtable or looked up from related records:
- `Due-Date` (formula: calculated from Invoice-Date + TermsId)
- `Balance-Exception-YN` (formula)
- `AP-Invoice-Number` (lookup from Invoice)
- `Remit-Name` (lookup from Invoice)
- `Invoice-Date` (lookup from Invoice)
- `Discount-Date` (lookup from Invoice)
- `Total-Invoice-Amount` (lookup from Invoice)
- `Freight-Charge` (lookup from Invoice)
- `Miscellaneous-Charge` (lookup from Invoice)
- `Discount-Amount` (lookup from Invoice)
- `Surcharge` (lookup from Invoice)
- `PO-Number-Seq-Type` (rollup from Details)
- `PO-Number` (rollup from Details)
- `Invoice-Balance` (lookup from Invoice)
- `Details-Sum` (rollup from Details)
- `DocumentAttachment` (URL, not from invoice)
- `RecordID` (auto-generated)
- `Date-Stamp` (auto-generated)
- `Time-Stamp` (formula)

---

## POInvoiceDetail Schema

Each detail object represents a single POInvoiceDetail record (line item) to be created in Airtable.

### Required Fields
- `headerIndex` (number) - **REQUIRED** - Index of the parent header in the headers array (0-based)

### All Other Fields (All Optional)

#### Core Item Fields
- `Header` (string) - Optional text reference
- `Item-No` (string) - SKU or item number
- `Item-Description` (string) - Description of item
- `Step` (string) - Step identifier if applicable

#### Invoice Pricing Fields
- `Invoice-Price` (number) - Unit price on invoice
- `Invoice-Pricing-Qty` (number) - Pricing quantity
- `Quantity-Invoiced` (number) - Quantity being invoiced
- `Line-Amount` (number) - Total line amount

#### PO Fields
- `PO-Number-Seq-Type` (string) - PO sequence type (e.g., "R", "S")
- `PO-Number` (string) - Purchase order number
- `PO-Release-Number` (string) - PO release number if applicable
- `PO-Line-Number` (string) - Line number on PO
- `Vendor-Ship-Number` (string) - Vendor shipment number

#### Receiving Fields
- `Date-Received` (string) - Date goods received (ISO format: "YYYY-MM-DD")
- `Quantity-Received` (number) - Quantity received
- `Quantity-Accepted` (number) - Quantity accepted
- `Purchase-Price` (number) - Unit price on PO
- `Pricing-Quantity` (number) - Pricing quantity on PO
- `Already-Invoiced-Qty` (number) - Previously invoiced quantity

#### Accounting Fields
- `ExpAcct` (string) - GL expense account
- `ExpSub` (string) - GL expense subaccount

#### Tax Amount Fields
- `TaxAmt00` (number) - Tax Amount 00
- `TaxAmt01` (number) - Tax Amount 01
- `TaxAmt02` (number) - Tax Amount 02
- `TaxAmt03` (number) - Tax Amount 03
- `txblAmt00` (number) - Taxable Amount 00
- `txblAmt01` (number) - Taxable Amount 01
- `txblAmt02` (number) - Taxable Amount 02
- `txblAmt03` (number) - Taxable Amount 03

#### Cost Fields
- `Standard-Cost` (number) - Standard cost if known
- `SurchargeType` (string, enum) - Surcharge type
  - Allowed values: `"Dollar"` | `"Percent"`
- `SurchargeRate` (number) - Surcharge rate
- `Surcharge` (number) - Surcharge amount

#### Other Fields
- `GL-Exception-YN` (string) - GL exception flag
- `Update-Level-Ind` (string) - Update level indicator
- `PO-UOM` (string) - Unit of measure (e.g., "EA", "LB", "FT")
- `Job-Project-Number` (string) - Job/project number
- `BoxNbr` (string) - Box number
- `Notes` (string) - Any notes

### Fields NOT Included (System-Calculated or Lookups)
The following fields are **NOT** populated by GPT as they are calculated by Airtable or looked up from related records:
- `Line-Number` (auto-generated)
- `PPV-Unit-Cost` (formula: Invoice-Price - Purchase-Price)
- `Invoiced-In-Full-YN` (formula)
- `Line-Pricing` (formula: Purchase-Price * Pricing-Quantity)
- `Company-Code` (lookup from POInvoiceHeader)
- `VendId` (lookup from POInvoiceHeader)
- `AP-Invoice-Number` (lookup from POInvoiceHeader)
- `TaxID00` (lookup from POInvoiceHeader)
- `TaxID01` (lookup from POInvoiceHeader)
- `TaxID02` (lookup from POInvoiceHeader)
- `TaxID03` (lookup from POInvoiceHeader)
- `HeaderRecordID` (lookup from POInvoiceHeader)
- `PPV-Vouchered-Acct` (calculated)
- `PPV-Vouchered-SubAcct` (calculated)
- `RecordID` (auto-generated)

---

## Example Response

```json
{
  "headerCount": 2,
  "detailCount": 3,
  "headers": [
    {
      "Company-Code": "ACOM",
      "VendId": "ACME001",
      "TermsId": "NET30",
      "APAcct": "2000",
      "APSub": "000",
      "CuryId": "USD",
      "Type": "ST"
    },
    {
      "Company-Code": "ACOM",
      "VendId": "ACME001",
      "TermsId": "NET30",
      "APAcct": "2000",
      "APSub": "000",
      "CuryId": "USD",
      "Type": "ST"
    }
  ],
  "details": [
    {
      "headerIndex": 0,
      "Item-No": "WIDGET-100",
      "Item-Description": "Industrial Widget Type A",
      "Quantity-Invoiced": 50,
      "Invoice-Price": 25.00,
      "Line-Amount": 1250.00,
      "PO-Number": "PO-2025-001",
      "PO-Number-Seq-Type": "S",
      "PO-Line-Number": "001",
      "Quantity-Received": 50,
      "Quantity-Accepted": 50,
      "Purchase-Price": 25.00,
      "Pricing-Quantity": 1,
      "ExpAcct": "5000",
      "ExpSub": "100"
    },
    {
      "headerIndex": 0,
      "Item-No": "WIDGET-200",
      "Item-Description": "Industrial Widget Type B",
      "Quantity-Invoiced": 25,
      "Invoice-Price": 40.00,
      "Line-Amount": 1000.00,
      "PO-Number": "PO-2025-001",
      "PO-Number-Seq-Type": "S",
      "PO-Line-Number": "002",
      "Quantity-Received": 25,
      "Quantity-Accepted": 25,
      "Purchase-Price": 40.00,
      "Pricing-Quantity": 1,
      "ExpAcct": "5000",
      "ExpSub": "100"
    },
    {
      "headerIndex": 1,
      "Item-No": "BOLT-500",
      "Item-Description": "Stainless Steel Bolts 1/4\"",
      "Quantity-Invoiced": 500,
      "Invoice-Price": 0.50,
      "Line-Amount": 250.00,
      "PO-Number": "PO-2025-002",
      "PO-Number-Seq-Type": "S",
      "PO-Line-Number": "001",
      "Quantity-Received": 500,
      "Quantity-Accepted": 500,
      "Purchase-Price": 0.50,
      "Pricing-Quantity": 1,
      "ExpAcct": "5000",
      "ExpSub": "100"
    }
  ]
}
```

---

## Schema Validation Rules

1. **Strict Mode**: `additionalProperties: false` - Only the fields defined in the schema are allowed
2. **Required Fields**: Only `headerCount`, `detailCount`, `headers`, and `details` are required at the root level
3. **Header Index Validation**: Each detail's `headerIndex` must be a valid index (0-based) into the `headers` array
4. **Count Validation**: `headerCount` must equal `headers.length` and `detailCount` must equal `details.length`
5. **Field Omission**: Fields with no data should be omitted entirely (not included as `null` or empty strings)
6. **Enum Values**: Fields with enum constraints must use only the specified values

---

## Field Naming Convention

- All field names use **kebab-case** (e.g., `Company-Code`, `PO-Number`)
- Field names are **case-sensitive** and must match exactly as specified
- Hyphens are part of the field name (e.g., `PO-Number`, not `PONumber`)

---

## Notes

- GPT should only populate fields for which it has actual data
- If a field value is unknown or unavailable, the field should be **omitted** (not set to null or empty string)
- The `headerIndex` in details is 0-based, so the first header is index 0
- All numeric values should be actual numbers (not strings)
- Date values should be in ISO format: "YYYY-MM-DD"
- Boolean values should be actual booleans (true/false), not strings





















