/**
 * Auto-generated Airtable schema types
 * Generated from latest_schema.json
 * Last updated: 2025-11-09
 */

// Table IDs
export const TABLE_IDS = {
  FILES: 'tbluYB0mHO6CQWrwL',
  INVOICES: 'tblokyH2U1PBhhCE9',
  POINVOICEHEADERS: 'tblgEJz0WQtZusPAT',
  POINVOICEDETAILS: 'tblajSDlRV6SsUtw8',
} as const;

// Table names
export const TABLE_NAMES = {
  FILES: 'Files',
  INVOICES: 'Invoices',
  POINVOICEHEADERS: 'POInvoiceHeaders',
  POINVOICEDETAILS: 'POInvoiceDetails',
} as const;

// Status constants for Invoice documents
export const INVOICE_STATUS = {
  PENDING: 'Pending',
  MATCHED: 'Matched',
  QUEUED: 'Queued',
  EXPORTED: 'Exported',
  ERROR: 'Error',
} as const;

// Status constants for File documents
export const FILE_STATUS = {
  QUEUED: 'Queued',
  PROCESSING: 'Processing',
  PROCESSED: 'Processed',
  ATTENTION: 'Attention',
} as const;

// Status constants for POInvoiceHeaders Export-Status
export const PO_HEADER_EXPORT_STATUS = {
  PENDING: 'Pending',
  MATCHED: 'Matched',
  QUEUED: 'Queued',
  EXPORTED: 'Exported',
  ERROR: 'Error',
  EMPTY: '',
} as const;

// Field IDs and Field Names
export const FIELD_IDS = {
  FILES: {
    FILEID: 'fld4aUSAm9rH0gPYt',
    FILEURL: 'fldKhjRV5N8e1r2Oc',
    FILEHASH: 'fldAkFbKnjYLzQJqS',
    FILENAME: 'fld7E1dvgRISwW0Pt',
    UPLOADED_DATE: 'fldX1faf1UWuRF2p3',
    STATUS: 'fldV1n0WIjvaQVFjz',
    PARSED_AT: 'fldbB5yMnHs6fITao',
    ATTACHMENTS: 'fldsDbtBW8gSpq9VD',
    RAW_TEXT: 'fldGeuHck13u4BmDY',
    ERROR_CODE: 'fldRocwOoLwBolAMv',
    ERROR_DESCRIPTION: 'fldVm4uH7SYWLVKeg',
    ERROR_LINK: 'fldwB1xjV6HlVPCdL',
    CREATED_AT: 'fldUFewWxBBP9D5bv',
    MODIFIED_AT: 'fldnSfYc4IRnK3pHQ',
    INVOICES: 'flduJO35gW8Lo6Mh9',
  },
  INVOICES: {
    RECORDID: 'fldvQzw4GlIefZTPy',
    INVOICE_NUMBER: 'fldI9lZSSR7ucHPHC',
    VENDID: 'fldhRQMEeBh3yLzRj',
    VENDOR_NAME: 'fldJGXLYs7xaXP7xR',
    AMOUNT: 'fldO8fN0NWv8dqDKC',
    DATE: 'fldEx6RyGqFl0WivA',
    FREIGHT_CHARGE: 'fldYXCLntMTfENKJa',
    MISC_CHARGE: 'fldX0qPQMAgKaRFX3',
    SURCHARGE: 'fldIgWe2IFDOqnYO1',
    POS: 'fldmoLZSY47DRFnAr',
    DOCUMENT_RAW_TEXT: 'fldB5FcRvWID00Tdn',
    FILES: 'fldDzY5Ch6fCP0XHp',
    CREATED_AT: 'fldOh6DdIq2JAhGHO',
    MODIFIED_AT: 'fldSAyzOAxppKn8rh',
    MATCH_PAYLOAD_JSON: 'fld7nZtX7h9ykBAS2',
    ERROR_CODE: 'fldwsvCcR8BsNYQVx',
    STATUS: 'fld8ZH6sheroClLwL',
    DISCOUNT_AMOUNT: 'fld0zHEhMerfgxZx1',
    DISCOUNT_DATE: 'fldyN4Sf6FTZoH9YI',
    BALANCE: 'fldgF26E6kAcOYIEf', // Formula field
    BALANCE_EXPLANATION: 'fldXH56bhzI3ieEsU',
    FILE_RAW_TEXT: 'fldbhuxrnxJ1Fun9u', // Lookup field
    MISSING_FIELDS: 'fldRkn64EhJZkKKQg', // Formula field
    ATTACHMENTS: 'fldBSFvaBJYkkbaRe', // Lookup field
    POINVOICEHEADERS: 'fldGeieJZPW2XwQEJ',
    HEADERS_SUM: 'fldI5H4YHsu4VPPjg', // Rollup field
    LINE_ITEMS: 'fldHPkRk05SqNzF2W',
    ERROR_DESCRIPTION: 'fldnH8Tqrvk52I7e9',
  },
  POINVOICEHEADERS: {
    RECORDID: 'fldhszvX1XbN0cGah',
    INVOICE: 'fldWTaHrIJXSx5hrr',
    INVOICE_RECORD_ID: 'fldsuXjbykjLkRbC2', // Lookup field
    DETAILS: 'fldyMJiQO4L0Ev0cT',
    COMPANY_CODE: 'fldFKFB68UVpa9ANK',
    VENDID: 'fld7tAlKGvv0LG8EI',
    AP_INVOICE_NUMBER: 'fld6MSB6CS7j3sCiS', // Lookup field
    REMIT_NAME: 'fldg1lTgqcRh7KX0Y', // Lookup field
    INVOICE_DATE: 'fld27xiiYfeMD3XB5', // Lookup field
    TERMSID: 'fld6zPKOrAgFUMA1q',
    DUE_DATE: 'fldNHyjXi1MkrFvS7', // Formula field
    DISCOUNT_DATE: 'fldSBhnyVm2fESlds', // Lookup field
    TOTAL_INVOICE_AMOUNT: 'flda0ukWjWxzyJ2Hr', // Lookup field
    FREIGHT_CHARGE: 'fld5UETBDzu4e0uk6', // Lookup field
    MISCELLANEOUS_CHARGE: 'fldEDwJxYhaye4VmJ', // Lookup field
    DISCOUNT_AMOUNT: 'fldUcQK1FqpUZxxGJ', // Lookup field
    SURCHARGE: 'fldSY9GdNlijlsYdQ', // Lookup field
    TAXID00: 'fldrfChafGoYKQ2aJ',
    TAXID01: 'fldxnhDiN7gAcEjS4',
    TAXID02: 'fldaTI1fhJnCe3T22',
    TAXID03: 'fldLImdkt3VKPM9kD',
    TAXTOT00: 'fldJPOml9TR5KY0XV',
    TAXTOT01: 'flde9AkgkL7aMmHmC',
    TAXTOT02: 'fldgbCFoc9oeCUvfo',
    TAXTOT03: 'fldAszQzhL5op3gDZ',
    TXBLTOT00: 'fldmkyVeMdke8yfzm',
    TXBLTOT01: 'fldAFeEPbIgFXZvbO',
    TXBLTOT02: 'fldkq1ZeymtKZS8di',
    TXBLTOT03: 'fldqioYsgvrTwWJAx',
    APACCT: 'fldyi7UcDACICVIcq',
    APSUB: 'fldrdeHuh1NVCeKSv',
    FREIGHT_ACCOUNT: 'fld336ezRpzzEkyGh',
    FREIGHT_SUBACCOUNT: 'fldVB7LIxLqOeMmvd',
    MISC_CHARGE_ACCOUNT: 'fldCGiCgdrg5GL5pY',
    MISC_CHARGE_SUBACCOUNT: 'fldeFFh9n47APVWUr',
    TAX00ACCT: 'fldc49yqGYfycjJm7',
    TAX01ACCT: 'fldPFOUYttpBw2HVp',
    TAX02ACCT: 'fldrtSPsGYh0EfR8O',
    TAX03ACCT: 'fldXQ3vJa8HyitF03',
    TAX00SUB: 'fldR03OR5REc0uPmA',
    TAX01SUB: 'fldaU2IBNcOm07Vu6',
    TAX02SUB: 'fld14PdXAJF2iUNEV',
    TAX03SUB: 'fldn1f5oPJYIMqChb',
    PO_NUMBER_SEQ_TYPE: 'fldgqMRGrJM3BUUfQ', // Rollup field
    PO_NUMBER: 'fld4uJuo5MBMnsZgw', // Rollup field
    PO_VENDOR: 'fld0qGIscEzVUgiZm',
    CURYID: 'flduhd4WL9ksJK3cW',
    CURYMULTDIV: 'fldqZxGWc5TR5Tomh',
    CURYRATE: 'fldtu6II85lju5kvT',
    CURYRATETYPE: 'fldLq5lUAm5C0HSa8',
    UPDATE_BATCH_NUMBER: 'fld4QUJecGm4skJhh',
    DATE_STAMP: 'fldZxGyjFcQaPvxiO', // Created time
    TIME_STAMP: 'fldXVDFDDk3sud6B9', // Formula field
    USER_ID: 'fldSelF39N2dmQ3EA',
    UPDATE_YN: 'fldfprb6BWN7yHaiU',
    UPDATE_AUDIT_NUMBER: 'fldZlmKvQaAmYGzcd',
    INVOICE_BALANCE: 'fldHGoxrb3gYiN2Z7', // Lookup field
    BALANCE_EXCEPTION_YN: 'fldE38iRhlU7uIvma', // Formula field
    TYPE: 'fld9hrf3hvO78stDY',
    JOB_PROJECT_NUMBER: 'fldg88jTL4hxHCgUG',
    DOCUMENT_ATTACHMENT: 'fldy6aT5yhZVbcs87',
    FUTURE_A: 'fldUDB4VInuh7JPOI',
    FUTURE_B: 'fldXSWA3dr1rLL5s4',
    EXPORT_STATUS: 'fldb5mLqnscBfBzjM',
    EXPORT_ERROR_CODE: 'fld08whvyI1HaV5Dx',
    DETAILS_SUM: 'fldId0eVt84ZYF9fx', // Rollup field
  },
  POINVOICEDETAILS: {
    RECORDID: 'fldsFnV2r5H0Pljoz',
    HEADER: 'fldrzIQxcaQWlAgwh',
    HEADER_RECORD_ID: 'fldFEMHbiZkR41Dzz', // Lookup field
    COMPANY_CODE: 'flduZQavGskCdu35d', // Lookup field
    VENDID: 'fldwYCDK6mImfRGKQ', // Lookup field
    AP_INVOICE_NUMBER: 'fldbItKufSN7jJcoe', // Lookup field
    LINE_NUMBER: 'fldTKJp6ebeYQ4ti8',
    ITEM_NO: 'fldHh1UwP2TYOq5sF',
    ITEM_DESCRIPTION: 'fldwQ6IQzEw9mRONP',
    STEP: 'fldi9cVjcUubszKd1',
    INVOICE_PRICE: 'fldUHbpqV38hAceMw',
    INVOICE_PRICING_QTY: 'fldS0PBUjsKt4j4Fo',
    QUANTITY_INVOICED: 'fldcBn6GL9jFFGxbW',
    LINE_AMOUNT: 'fldypCHLMTKdhCtJh',
    PO_NUMBER_SEQ_TYPE: 'fld6bzXTyqa3HUgsl',
    PO_NUMBER: 'fldb9eHuvv0NL2uAS',
    PO_RELEASE_NUMBER: 'fld0iqeOix7I3E1fh',
    PO_LINE_NUMBER: 'fld44aIaJT2bd0Pve',
    VENDOR_SHIP_NUMBER: 'fldAjiR63OdQEI0VS',
    DATE_RECEIVED: 'fld8dUDZw2Ewki8M4',
    QUANTITY_RECEIVED: 'fldm9Pj9tmNEbTjLL',
    QUANTITY_ACCEPTED: 'fldyHlGfIbwu9Tqxh',
    PURCHASE_PRICE: 'fldAdxuO3XMEExrAw',
    PRICING_QUANTITY: 'fld8NIB8NIeQc782l',
    ALREADY_INVOICED_QTY: 'fldLRcAiUUmFZspRv',
    TAXID00: 'fldtGfOf1jFI9aDbE', // Lookup field
    TAXID01: 'fldYfRbCVad371ks3', // Lookup field
    TAXID02: 'fldzDmgba9EzmBrSo', // Lookup field
    TAXID03: 'fldRLMSigCKD5teaB', // Lookup field
    TAXAMT00: 'fldKjlpEzZoNjn3ix',
    TAXAMT01: 'fldTIM1VFMakCgyH2',
    TAXAMT02: 'fld7hseBSyCKVH3qC',
    TAXAMT03: 'fldtBDqltau80MMr0',
    TXBLAMT00: 'fld3EOBBG1Di5KCeB',
    TXBLAMT01: 'fld7oN8j9FprFxOHn',
    TXBLAMT02: 'fldYWkUBK56G895DP',
    TXBLAMT03: 'fldeT4ChgqreD0CfD',
    EXPACCT: 'fldMbMltkhFFWKJUU',
    EXPSUB: 'fldKerXoxiWOGVLfF',
    PPV_VOUCHERED_ACCT: 'fld8QL2nm1N6KYkhA',
    PPV_VOUCHERED_SUBACCT: 'fld7YTh4AeqWXKvuR',
    PPV_UNIT_COST: 'fldeYDhZU0jIqvGWr', // Formula field
    STANDARD_COST: 'fldt9ttdXAuwVZj5U',
    SURCHARGE_TYPE: 'fldSkOOPdSeMXpqUN',
    SURCHARGE_RATE: 'fldhDd6A2cK7gSKrN',
    SURCHARGE: 'fldrfM3P3WpqPYWsp',
    GL_EXCEPTION_YN: 'fld1TXi1SH6tWh81n',
    INVOICED_IN_FULL_YN: 'fldkMgmQzxYtjWStZ', // Formula field
    UPDATE_LEVEL_IND: 'fldTIIZxPPflYDBzH',
    PO_UOM: 'fld5BxvxdRs5zIV2s',
    JOB_PROJECT_NUMBER: 'fldkSs9wHlRvdmQBR',
    BOX_NBR: 'fldGpiLavevepWgsf',
    NOTES: 'fldL1yHZm1K41hf5I',
    FUTURE_A: 'fldtLtHzF4eA2Hld6',
    FUTURE_B: 'fldVUsmxKS3WERXwN',
    POINVOICEHEADERS: 'fldeJpf4G5Cj0LnaR',
    LINE_PRICING: 'fldPv8Y6IhHnpH6A3', // Formula field
  },
} as const;

// Field Names (kebab-case as they appear in Airtable)
export const FIELD_NAMES = {
  FILES: {
    FILEID: 'FileID',
    FILEURL: 'FileURL',
    FILEHASH: 'FileHash',
    FILENAME: 'FileName',
    UPLOADED_DATE: 'UploadedDate',
    STATUS: 'Status',
    PARSED_AT: 'ParsedAt',
    ATTACHMENTS: 'Attachments',
    RAW_TEXT: 'Raw-Text',
    ERROR_CODE: 'Error-Code',
    ERROR_DESCRIPTION: 'Error-Description',
    ERROR_LINK: 'Error-Link',
    CREATED_AT: 'Created-At',
    MODIFIED_AT: 'Modified-At',
    INVOICES: 'Invoices',
  },
  INVOICES: {
    RECORDID: 'RecordID',
    INVOICE_NUMBER: 'Invoice-Number',
    VENDID: 'VendId',
    VENDOR_NAME: 'Vendor-Name',
    AMOUNT: 'Amount',
    DATE: 'Date',
    FREIGHT_CHARGE: 'Freight-Charge',
    MISC_CHARGE: 'Misc-Charge',
    SURCHARGE: 'Surcharge',
    POS: 'POs',
    DOCUMENT_RAW_TEXT: 'Document-Raw-Text',
    FILES: 'Files',
    CREATED_AT: 'Created-At',
    MODIFIED_AT: 'Modified-At',
    MATCH_PAYLOAD_JSON: 'MatchPayloadJSON',
    ERROR_CODE: 'ErrorCode',
    STATUS: 'Status',
    DISCOUNT_AMOUNT: 'Discount-Amount',
    DISCOUNT_DATE: 'Discount-Date',
    BALANCE: 'Balance',
    BALANCE_EXPLANATION: 'Balance-Explanation',
    FILE_RAW_TEXT: 'File-Raw-Text',
    MISSING_FIELDS: 'Missing-Fields',
    ATTACHMENTS: 'Attachments',
    POINVOICEHEADERS: 'POInvoiceHeaders',
    HEADERS_SUM: 'Headers-Sum',
    LINE_ITEMS: 'Line Items',
    ERROR_DESCRIPTION: 'Error Description',
  },
  POINVOICEHEADERS: {
    RECORDID: 'RecordID',
    INVOICE: 'Invoice',
    INVOICE_RECORD_ID: 'InvoiceRecordID',
    DETAILS: 'Details',
    COMPANY_CODE: 'Company-Code',
    VENDID: 'VendId',
    AP_INVOICE_NUMBER: 'AP-Invoice-Number',
    REMIT_NAME: 'Remit-Name',
    INVOICE_DATE: 'Invoice-Date',
    TERMSID: 'TermsId',
    DUE_DATE: 'Due-Date',
    DISCOUNT_DATE: 'Discount-Date',
    TOTAL_INVOICE_AMOUNT: 'Total-Invoice-Amount',
    FREIGHT_CHARGE: 'Freight-Charge',
    MISCELLANEOUS_CHARGE: 'Miscellaneous-Charge',
    DISCOUNT_AMOUNT: 'Discount-Amount',
    SURCHARGE: 'Surcharge',
    TAXID00: 'TaxID00',
    TAXID01: 'TaxID01',
    TAXID02: 'TaxID02',
    TAXID03: 'TaxID03',
    TAXTOT00: 'TaxTot00',
    TAXTOT01: 'TaxTot01',
    TAXTOT02: 'TaxTot02',
    TAXTOT03: 'TaxTot03',
    TXBLTOT00: 'txblTot00',
    TXBLTOT01: 'txblTot01',
    TXBLTOT02: 'txblTot02',
    TXBLTOT03: 'txblTot03',
    APACCT: 'APAcct',
    APSUB: 'APSub',
    FREIGHT_ACCOUNT: 'Freight-Account',
    FREIGHT_SUBACCOUNT: 'Freight-Subaccount',
    MISC_CHARGE_ACCOUNT: 'Misc-Charge-Account',
    MISC_CHARGE_SUBACCOUNT: 'Misc-Charge-Subaccount',
    TAX00ACCT: 'Tax00Acct',
    TAX01ACCT: 'Tax01Acct',
    TAX02ACCT: 'Tax02Acct',
    TAX03ACCT: 'Tax03Acct',
    TAX00SUB: 'Tax00Sub',
    TAX01SUB: 'Tax01Sub',
    TAX02SUB: 'Tax02Sub',
    TAX03SUB: 'Tax03Sub',
    PO_NUMBER_SEQ_TYPE: 'PO-Number-Seq-Type',
    PO_NUMBER: 'PO-Number',
    PO_VENDOR: 'PO-Vendor',
    CURYID: 'CuryId',
    CURYMULTDIV: 'CuryMultDiv',
    CURYRATE: 'CuryRate',
    CURYRATETYPE: 'CuryRateType',
    UPDATE_BATCH_NUMBER: 'Update-Batch-Number',
    DATE_STAMP: 'Date-Stamp',
    TIME_STAMP: 'Time-Stamp',
    USER_ID: 'User-Id',
    UPDATE_YN: 'Update-YN',
    UPDATE_AUDIT_NUMBER: 'Update-Audit-Number',
    INVOICE_BALANCE: 'Invoice-Balance',
    BALANCE_EXCEPTION_YN: 'Balance-Exception-YN',
    TYPE: 'Type',
    JOB_PROJECT_NUMBER: 'Job-Project-Number',
    DOCUMENT_ATTACHMENT: 'DocumentAttachment',
    FUTURE_A: 'FutureA',
    FUTURE_B: 'FutureB',
    EXPORT_STATUS: 'Export-Status',
    EXPORT_ERROR_CODE: 'Export-Error-Code',
    DETAILS_SUM: 'Details-Sum',
  },
  POINVOICEDETAILS: {
    RECORDID: 'RecordID',
    HEADER: 'Header',
    HEADER_RECORD_ID: 'HeaderRecordID',
    COMPANY_CODE: 'Company-Code',
    VENDID: 'VendId',
    AP_INVOICE_NUMBER: 'AP-Invoice-Number',
    LINE_NUMBER: 'Line-Number',
    ITEM_NO: 'Item-No',
    ITEM_DESCRIPTION: 'Item-Description',
    STEP: 'Step',
    INVOICE_PRICE: 'Invoice-Price',
    INVOICE_PRICING_QTY: 'Invoice-Pricing-Qty',
    QUANTITY_INVOICED: 'Quantity-Invoiced',
    LINE_AMOUNT: 'Line-Amount',
    PO_NUMBER_SEQ_TYPE: 'PO-Number-Seq-Type',
    PO_NUMBER: 'PO-Number',
    PO_RELEASE_NUMBER: 'PO-Release-Number',
    PO_LINE_NUMBER: 'PO-Line-Number',
    VENDOR_SHIP_NUMBER: 'Vendor-Ship-Number',
    DATE_RECEIVED: 'Date-Received',
    QUANTITY_RECEIVED: 'Quantity-Received',
    QUANTITY_ACCEPTED: 'Quantity-Accepted',
    PURCHASE_PRICE: 'Purchase-Price',
    PRICING_QUANTITY: 'Pricing-Quantity',
    ALREADY_INVOICED_QTY: 'Already-Invoiced-Qty',
    TAXID00: 'TaxID00',
    TAXID01: 'TaxID01',
    TAXID02: 'TaxID02',
    TAXID03: 'TaxID03',
    TAXAMT00: 'TaxAmt00',
    TAXAMT01: 'TaxAmt01',
    TAXAMT02: 'TaxAmt02',
    TAXAMT03: 'TaxAmt03',
    TXBLAMT00: 'txblAmt00',
    TXBLAMT01: 'txblAmt01',
    TXBLAMT02: 'txblAmt02',
    TXBLAMT03: 'txblAmt03',
    EXPACCT: 'ExpAcct',
    EXPSUB: 'ExpSub',
    PPV_VOUCHERED_ACCT: 'PPV-Vouchered-Acct',
    PPV_VOUCHERED_SUBACCT: 'PPV-Vouchered-SubAcct',
    PPV_UNIT_COST: 'PPV-Unit-Cost',
    STANDARD_COST: 'Standard-Cost',
    SURCHARGE_TYPE: 'SurchargeType',
    SURCHARGE_RATE: 'SurchargeRate',
    SURCHARGE: 'Surcharge',
    GL_EXCEPTION_YN: 'GL-Exception-YN',
    INVOICED_IN_FULL_YN: 'Invoiced-In-Full-YN',
    UPDATE_LEVEL_IND: 'Update-Level-Ind',
    PO_UOM: 'PO-UOM',
    JOB_PROJECT_NUMBER: 'Job-Project-Number',
    BOX_NBR: 'BoxNbr',
    NOTES: 'Notes',
    FUTURE_A: 'FutureA',
    FUTURE_B: 'FutureB',
    POINVOICEHEADERS: 'POInvoiceHeaders',
    LINE_PRICING: 'Line-Pricing',
  },
} as const;

// Airtable attachment type
export interface AirtableAttachment {
  id: string;
  url: string;
  filename: string;
  size?: number;
  type?: string;
  thumbnails?: {
    small?: { url: string; width: number; height: number };
    large?: { url: string; width: number; height: number };
    full?: { url: string; width: number; height: number };
  };
}

// Type definitions for records
export interface FilesRecord {
  id: string;
  createdTime: string;
  fields: {
    FileID?: number;
    FileURL?: string;
    FileHash?: string;
    FileName?: string;
    UploadedDate?: string;
    Status?: string;
    ParsedAt?: string;
    Attachments?: AirtableAttachment[];
    'Raw-Text'?: string;
    'Error-Code'?: string;
    'Error-Description'?: string;
    'Error-Link'?: string;
    'Created-At'?: string;
    'Modified-At'?: string;
    Invoices?: string[];
  };
}

export interface InvoicesRecord {
  id: string;
  createdTime: string;
  fields: {
    RecordID?: number;
    'Invoice-Number'?: string;
    VendId?: string;
    'Vendor-Name'?: string;
    Amount?: number;
    Date?: string;
    'Freight-Charge'?: number;
    'Misc-Charge'?: number;
    Surcharge?: number;
    POs?: string;
    'Document-Raw-Text'?: string;
    Files?: string[];
    'Created-At'?: string;
    'Modified-At'?: string;
    MatchPayloadJSON?: string;
    ErrorCode?: string;
    Status?: string;
    'Discount-Amount'?: number;
    'Discount-Date'?: string;
    Balance?: number; // Formula field - read-only
    'Balance-Explanation'?: string;
    'File-Raw-Text'?: string[]; // Lookup field
    'Missing-Fields'?: string; // Formula field - read-only
    Attachments?: AirtableAttachment[]; // Lookup field
    POInvoiceHeaders?: string[];
    'Headers-Sum'?: number; // Rollup field - read-only
    'Line Items'?: string; // JSON string containing flexible line items data
    'Error Description'?: string;
  };
}

export interface POInvoiceHeadersRecord {
  id: string;
  createdTime: string;
  fields: {
    RecordID?: number;
    Invoice?: string[]; // Link to Invoice (single)
    InvoiceRecordID?: number[]; // Lookup field
    Details?: string[];
    'Company-Code'?: string;
    VendId?: string;
    'AP-Invoice-Number'?: string[]; // Lookup field
    'Remit-Name'?: string[]; // Lookup field
    'Invoice-Date'?: string[]; // Lookup field
    TermsId?: string;
    'Due-Date'?: string; // Formula field - read-only
    'Discount-Date'?: string[]; // Lookup field
    'Total-Invoice-Amount'?: number[]; // Lookup field
    'Freight-Charge'?: number[]; // Lookup field
    'Miscellaneous-Charge'?: number[]; // Lookup field
    'Discount-Amount'?: number[]; // Lookup field
    Surcharge?: number[]; // Lookup field
    TaxID00?: string;
    TaxID01?: string;
    TaxID02?: string;
    TaxID03?: string;
    TaxTot00?: number;
    TaxTot01?: number;
    TaxTot02?: number;
    TaxTot03?: number;
    txblTot00?: number;
    txblTot01?: number;
    txblTot02?: number;
    txblTot03?: number;
    APAcct?: string;
    APSub?: string;
    'Freight-Account'?: string;
    'Freight-Subaccount'?: string;
    'Misc-Charge-Account'?: string;
    'Misc-Charge-Subaccount'?: string;
    Tax00Acct?: string;
    Tax01Acct?: string;
    Tax02Acct?: string;
    Tax03Acct?: string;
    Tax00Sub?: string;
    Tax01Sub?: string;
    Tax02Sub?: string;
    Tax03Sub?: string;
    'PO-Number-Seq-Type'?: string; // Rollup field - read-only
    'PO-Number'?: string; // Rollup field - read-only
    'PO-Vendor'?: string;
    CuryId?: string;
    CuryMultDiv?: string;
    CuryRate?: number;
    CuryRateType?: string;
    'Update-Batch-Number'?: string;
    'Date-Stamp'?: string; // Created time
    'Time-Stamp'?: string; // Formula field - read-only
    'User-Id'?: string;
    'Update-YN'?: boolean;
    'Update-Audit-Number'?: string;
    'Invoice-Balance'?: number[]; // Lookup field
    'Balance-Exception-YN'?: number; // Formula field - read-only
    Type?: string;
    'Job-Project-Number'?: string;
    DocumentAttachment?: string;
    FutureA?: string;
    FutureB?: string;
    'Export-Status'?: string;
    'Export-Error-Code'?: string;
    'Details-Sum'?: number; // Rollup field - read-only
  };
}

export interface POInvoiceDetailsRecord {
  id: string;
  createdTime: string;
  fields: {
    RecordID?: number;
    Header?: string;
    HeaderRecordID?: number[]; // Lookup field
    'Company-Code'?: string[]; // Lookup field
    VendId?: string[]; // Lookup field
    'AP-Invoice-Number'?: string[]; // Lookup field
    'Line-Number'?: number;
    'Item-No'?: string;
    'Item-Description'?: string;
    Step?: string;
    'Invoice-Price'?: number;
    'Invoice-Pricing-Qty'?: number;
    'Quantity-Invoiced'?: number;
    'Line-Amount'?: number;
    'PO-Number-Seq-Type'?: string;
    'PO-Number'?: string;
    'PO-Release-Number'?: string;
    'PO-Line-Number'?: string;
    'Vendor-Ship-Number'?: string;
    'Date-Received'?: string;
    'Quantity-Received'?: number;
    'Quantity-Accepted'?: number;
    'Purchase-Price'?: number;
    'Pricing-Quantity'?: number;
    'Already-Invoiced-Qty'?: number;
    TaxID00?: string[]; // Lookup field
    TaxID01?: string[]; // Lookup field
    TaxID02?: string[]; // Lookup field
    TaxID03?: string[]; // Lookup field
    TaxAmt00?: number;
    TaxAmt01?: number;
    TaxAmt02?: number;
    TaxAmt03?: number;
    txblAmt00?: number;
    txblAmt01?: number;
    txblAmt02?: number;
    txblAmt03?: number;
    ExpAcct?: string;
    ExpSub?: string;
    'PPV-Vouchered-Acct'?: string;
    'PPV-Vouchered-SubAcct'?: string;
    'PPV-Unit-Cost'?: number; // Formula field - read-only
    'Standard-Cost'?: number;
    SurchargeType?: string;
    SurchargeRate?: number;
    Surcharge?: number;
    'GL-Exception-YN'?: string;
    'Invoiced-In-Full-YN'?: number; // Formula field - read-only
    'Update-Level-Ind'?: string;
    'PO-UOM'?: string;
    'Job-Project-Number'?: string;
    BoxNbr?: string;
    Notes?: string;
    FutureA?: string;
    FutureB?: string;
    POInvoiceHeaders?: string[];
    'Line-Pricing'?: number; // Formula field - read-only
  };
}
