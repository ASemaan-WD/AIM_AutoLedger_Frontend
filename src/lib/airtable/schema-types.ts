/**
 * Auto-generated Airtable schema types
 * Generated from latest_schema.json
 * DO NOT EDIT MANUALLY - Run 'node scripts/generate-schema-types.js' to regenerate
 */

// Auto-generated field IDs from Airtable schema

export const FIELD_IDS = {
  FILES: {
    FILEID: 'fld4aUSAm9rH0gPYt',
    FILEHASH: 'fldAkFbKnjYLzQJqS',
    FILENAME: 'fld7E1dvgRISwW0Pt',
    UPLOADEDDATE: 'fldX1faf1UWuRF2p3',
    STATUS: 'fldV1n0WIjvaQVFjz',
    PARSEDAT: 'fldbB5yMnHs6fITao',
    ATTACHMENTS: 'fldsDbtBW8gSpq9VD',
    RAW_TEXT: 'fldGeuHck13u4BmDY',
    ERROR_CODE: 'fldRocwOoLwBolAMv',
    ERROR_DESCRIPTION: 'fldVm4uH7SYWLVKeg',
    ERROR_LINK: 'fldwB1xjV6HlVPCdL',
    CREATED_AT: 'fldUFewWxBBP9D5bv',
    MODIFIED_AT: 'fldnSfYc4IRnK3pHQ',
    INVOICES: 'flduJO35gW8Lo6Mh9',
    STATUS_MODIFIED_TIME: 'fldacexiDeUtwmKCV',
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
    MATCHPAYLOADJSON: 'fld7nZtX7h9ykBAS2',
    ERRORCODE: 'fldwsvCcR8BsNYQVx',
    STATUS: 'fld8ZH6sheroClLwL',
    DISCOUNT_AMOUNT: 'fld0zHEhMerfgxZx1',
    DISCOUNT_DATE: 'fldyN4Sf6FTZoH9YI',
    BALANCE: 'fldgF26E6kAcOYIEf',
    BALANCE_EXPLANATION: 'fldXH56bhzI3ieEsU',
    FILE_RAW_TEXT: 'fldbhuxrnxJ1Fun9u',
    MISSING_FIELDS: 'fldRkn64EhJZkKKQg',
    ATTACHMENTS: 'fldBSFvaBJYkkbaRe',
    POINVOICEHEADERS: 'fldGeieJZPW2XwQEJ',
    HEADERS_SUM: 'fldI5H4YHsu4VPPjg',
    LINE_ITEMS: 'fldHPkRk05SqNzF2W',
    ERROR_DESCRIPTION: 'fldnH8Tqrvk52I7e9',
    STATUS_MODIFIED_TIME: 'fldGcJS6M2X2TPHbS',
  },
  POINVOICEHEADERS: {
    RECORDID: 'fldhszvX1XbN0cGah',
    INVOICE: 'fldWTaHrIJXSx5hrr',
    INVOICERECORDID: 'fldsuXjbykjLkRbC2',
    DETAILS: 'fldyMJiQO4L0Ev0cT',
    COMPANY_CODE: 'fldFKFB68UVpa9ANK',
    VENDID: 'fld7tAlKGvv0LG8EI',
    AP_INVOICE_NUMBER: 'fld6MSB6CS7j3sCiS',
    REMIT_NAME: 'fldg1lTgqcRh7KX0Y',
    INVOICE_DATE: 'fld27xiiYfeMD3XB5',
    TERMSID: 'fld6zPKOrAgFUMA1q',
    DUE_DATE: 'fldNHyjXi1MkrFvS7',
    DISCOUNT_DATE: 'fldSBhnyVm2fESlds',
    TOTAL_INVOICE_AMOUNT: 'flda0ukWjWxzyJ2Hr',
    FREIGHT_CHARGE: 'fld5UETBDzu4e0uk6',
    MISCELLANEOUS_CHARGE: 'fldEDwJxYhaye4VmJ',
    DISCOUNT_AMOUNT: 'fldUcQK1FqpUZxxGJ',
    SURCHARGE: 'fldSY9GdNlijlsYdQ',
    APACCT: 'fldyi7UcDACICVIcq',
    APSUB: 'fldrdeHuh1NVCeKSv',
    FREIGHT_ACCOUNT: 'fld336ezRpzzEkyGh',
    FREIGHT_SUBACCOUNT: 'fldVB7LIxLqOeMmvd',
    MISC_CHARGE_ACCOUNT: 'fldCGiCgdrg5GL5pY',
    MISC_CHARGE_SUBACCOUNT: 'fldeFFh9n47APVWUr',
    PO_NUMBER_SEQ_TYPE: 'fldgqMRGrJM3BUUfQ',
    PO_NUMBER: 'fld4uJuo5MBMnsZgw',
    PO_VENDOR: 'fld0qGIscEzVUgiZm',
    CURYID: 'flduhd4WL9ksJK3cW',
    CURYMULTDIV: 'fldqZxGWc5TR5Tomh',
    CURYRATE: 'fldtu6II85lju5kvT',
    CURYRATETYPE: 'fldLq5lUAm5C0HSa8',
    UPDATE_BATCH_NUMBER: 'fld4QUJecGm4skJhh',
    DATE_STAMP: 'fldZxGyjFcQaPvxiO',
    TIME_STAMP: 'fldXVDFDDk3sud6B9',
    USER_ID: 'fldSelF39N2dmQ3EA',
    INVOICE_BALANCE: 'fldHGoxrb3gYiN2Z7',
    BALANCE_EXCEPTION_YN: 'fldE38iRhlU7uIvma',
    JOB_PROJECT_NUMBER: 'fldg88jTL4hxHCgUG',
    DOCUMENTATTACHMENT: 'fldy6aT5yhZVbcs87',
    EXPORT_STATUS: 'fldb5mLqnscBfBzjM',
    EXPORT_ERROR_CODE: 'fld08whvyI1HaV5Dx',
    DETAILS_SUM: 'fldId0eVt84ZYF9fx',
    TERMSDAYSINT: 'fldGmplqb3IKIwnBW',
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
    TAX00ACCT: 'fldc49yqGYfycjJm7',
    TAX01ACCT: 'fldPFOUYttpBw2HVp',
    TAX02ACCT: 'fldrtSPsGYh0EfR8O',
    TAX03ACCT: 'fldXQ3vJa8HyitF03',
    TAX00SUB: 'fldR03OR5REc0uPmA',
    TAX01SUB: 'fldaU2IBNcOm07Vu6',
    TAX02SUB: 'fld14PdXAJF2iUNEV',
    TAX03SUB: 'fldn1f5oPJYIMqChb',
    UPDATE_YN: 'fldfprb6BWN7yHaiU',
    UPDATE_AUDIT_NUMBER: 'fldZlmKvQaAmYGzcd',
    GL_EXCEPTION_YN: 'fld8VOSGAHVwsnNdp',
    TYPE: 'fld9hrf3hvO78stDY',
    FUTUREA: 'fldUDB4VInuh7JPOI',
    FUTUREB: 'fldXSWA3dr1rLL5s4',
  },
  POINVOICEDETAILS: {
    RECORDID: 'fldsFnV2r5H0Pljoz',
    POINVOICEHEADERS: 'fldeJpf4G5Cj0LnaR',
    HEADERRECORDID: 'fldFEMHbiZkR41Dzz',
    COMPANY_CODE: 'flduZQavGskCdu35d',
    VENDID: 'fldwYCDK6mImfRGKQ',
    AP_INVOICE_NUMBER: 'fldbItKufSN7jJcoe',
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
    EXPACCT: 'fldMbMltkhFFWKJUU',
    EXPSUB: 'fldKerXoxiWOGVLfF',
    PPV_VOUCHERED_ACCT: 'fld8QL2nm1N6KYkhA',
    PPV_VOUCHERED_SUBACCT: 'fld7YTh4AeqWXKvuR',
    PPV_UNIT_COST: 'fldeYDhZU0jIqvGWr',
    STANDARD_COST: 'fldt9ttdXAuwVZj5U',
    SURCHARGETYPE: 'fldSkOOPdSeMXpqUN',
    SURCHARGERATE: 'fldhDd6A2cK7gSKrN',
    SURCHARGE: 'fldrfM3P3WpqPYWsp',
    GL_EXCEPTION_YN: 'fld1TXi1SH6tWh81n',
    INVOICED_IN_FULL_YN: 'fldkMgmQzxYtjWStZ',
    UPDATE_LEVEL_IND: 'fldTIIZxPPflYDBzH',
    PO_UOM: 'fld5BxvxdRs5zIV2s',
    JOB_PROJECT_NUMBER: 'fldkSs9wHlRvdmQBR',
    BOXNBR: 'fldGpiLavevepWgsf',
    FUTUREA: 'fldtLtHzF4eA2Hld6',
    FUTUREB: 'fldVUsmxKS3WERXwN',
    LINE_PRICING: 'fldPv8Y6IhHnpH6A3',
    HEADER: 'fldrzIQxcaQWlAgwh',
    TAXID00: 'fldtGfOf1jFI9aDbE',
    TAXID01: 'fldYfRbCVad371ks3',
    TAXID02: 'fldzDmgba9EzmBrSo',
    TAXID03: 'fldRLMSigCKD5teaB',
    TAXAMT00: 'fldKjlpEzZoNjn3ix',
    TAXAMT01: 'fldTIM1VFMakCgyH2',
    TAXAMT02: 'fld7hseBSyCKVH3qC',
    TAXAMT03: 'fldtBDqltau80MMr0',
    TXBLAMT00: 'fld3EOBBG1Di5KCeB',
    TXBLAMT01: 'fld7oN8j9FprFxOHn',
    TXBLAMT02: 'fldYWkUBK56G895DP',
    TXBLAMT03: 'fldeT4ChgqreD0CfD',
  },
} as const;

// Table names
export const TABLE_NAMES = {
  FILES: 'Files',
  INVOICES: 'Invoices',
  POINVOICEHEADERS: 'POInvoiceHeaders',
  POINVOICEDETAILS: 'POInvoiceDetails',
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

export interface FilesFields {
  fileID: number;
  fileHash?: string;
  fileName?: string;
  uploadedDate?: string;
  status?: string;
  parsedAt?: string;
  attachments?: AirtableAttachment[];
  rawText?: string;
  errorCode?: string;
  errorDescription?: string;
  errorLink?: string;
  createdAt: string;
  modifiedAt?: string;
  invoices?: string[];
  statusModifiedTime?: string;
}

export interface InvoicesFields {
  recordID: number;
  invoiceNumber?: string;
  vendId?: string;
  vendorName?: string;
  amount?: number;
  date?: string;
  freightCharge?: number;
  miscCharge?: number;
  surcharge?: number;
  pOs?: string;
  documentRawText?: string;
  files?: string[];
  createdAt: string;
  modifiedAt?: string;
  matchPayloadJSON?: string;
  errorCode?: string;
  status?: string;
  discountAmount?: number;
  discountDate?: string;
  balance?: any;
  balanceExplanation?: string;
  fileRawText?: any;
  missingFields?: any;
  attachments?: any;
  pOInvoiceHeaders?: string[];
  headersSum?: any;
  lineItems?: string;
  errorDescription?: string;
  statusModifiedTime?: string;
}

export interface POInvoiceHeadersFields {
  recordID: number;
  invoice?: string[];
  invoiceRecordID?: any;
  details?: string[];
  companyCode?: string;
  vendId?: string;
  aPInvoiceNumber?: any;
  remitName?: any;
  invoiceDate?: any;
  termsId?: string;
  dueDate?: any;
  discountDate?: any;
  totalInvoiceAmount?: any;
  freightCharge?: any;
  miscellaneousCharge?: any;
  discountAmount?: any;
  surcharge?: any;
  aPAcct?: string;
  aPSub?: string;
  freightAccount?: string;
  freightSubaccount?: string;
  miscChargeAccount?: string;
  miscChargeSubaccount?: string;
  pONumberSeqType?: string;
  pONumber?: string;
  pOVendor?: string;
  curyId?: string;
  curyMultDiv?: string;
  curyRate?: number;
  curyRateType?: string;
  updateBatchNumber?: string;
  dateStamp: string;
  timeStamp?: any;
  userId?: string;
  invoiceBalance?: any;
  balanceExceptionYN?: any;
  jobProjectNumber?: string;
  documentAttachment?: any;
  exportStatus?: string;
  exportErrorCode?: string;
  detailsSum?: any;
  termsDaysInt?: number;
  taxID00?: string;
  taxID01?: string;
  taxID02?: string;
  taxID03?: string;
  taxTot00?: number;
  taxTot01?: number;
  taxTot02?: number;
  taxTot03?: number;
  txblTot00?: number;
  txblTot01?: number;
  txblTot02?: number;
  txblTot03?: number;
  tax00Acct?: string;
  tax01Acct?: string;
  tax02Acct?: string;
  tax03Acct?: string;
  tax00Sub?: string;
  tax01Sub?: string;
  tax02Sub?: string;
  tax03Sub?: string;
  updateYN?: boolean;
  updateAuditNumber?: string;
  gLExceptionYN?: boolean;
  type?: string;
  futureA?: string;
  futureB?: string;
}

export interface POInvoiceDetailsFields {
  recordID: number;
  pOInvoiceHeaders?: string[];
  headerRecordID?: any;
  companyCode?: any;
  vendId?: any;
  aPInvoiceNumber?: any;
  lineNumber?: string;
  itemNo?: string;
  itemDescription?: string;
  step?: string;
  invoicePrice?: number;
  invoicePricingQty?: number;
  quantityInvoiced?: number;
  lineAmount?: number;
  pONumberSeqType?: any;
  pONumber?: any;
  pOReleaseNumber?: string;
  pOLineNumber?: string;
  vendorShipNumber?: string;
  dateReceived?: string;
  quantityReceived?: number;
  quantityAccepted?: number;
  purchasePrice?: number;
  pricingQuantity?: number;
  alreadyInvoicedQty?: number;
  expAcct?: string;
  expSub?: string;
  pPVVoucheredAcct?: string;
  pPVVoucheredSubAcct?: string;
  pPVUnitCost?: any;
  standardCost?: number;
  surchargeType?: string;
  surchargeRate?: number;
  surcharge?: number;
  gLExceptionYN?: string;
  invoicedInFullYN?: string;
  updateLevelInd?: string;
  pOUOM?: string;
  jobProjectNumber?: any;
  boxNbr?: string;
  futureA?: string;
  futureB?: string;
  linePricing?: any;
  header?: string;
  taxID00?: any;
  taxID01?: any;
  taxID02?: any;
  taxID03?: any;
  taxAmt00?: number;
  taxAmt01?: number;
  taxAmt02?: number;
  taxAmt03?: number;
  txblAmt00?: number;
  txblAmt01?: number;
  txblAmt02?: number;
  txblAmt03?: number;
}

export interface FilesRecord {
  fileID: number;
  fileHash?: string;
  fileName?: string;
  uploadedDate?: string;
  status?: string;
  parsedAt?: string;
  attachments?: AirtableAttachment[];
  rawText?: string;
  errorCode?: string;
  errorDescription?: string;
  errorLink?: string;
  createdAt: string;
  modifiedAt?: string;
  invoices?: string[];
  statusModifiedTime?: string;
}

export interface InvoicesRecord {
  recordID: number;
  invoiceNumber?: string;
  vendId?: string;
  vendorName?: string;
  amount?: number;
  date?: string;
  freightCharge?: number;
  miscCharge?: number;
  surcharge?: number;
  pOs?: string;
  documentRawText?: string;
  files?: string[];
  createdAt: string;
  modifiedAt?: string;
  matchPayloadJSON?: string;
  errorCode?: string;
  status?: string;
  discountAmount?: number;
  discountDate?: string;
  balance?: any;
  balanceExplanation?: string;
  fileRawText?: any;
  missingFields?: any;
  attachments?: any;
  pOInvoiceHeaders?: string[];
  headersSum?: any;
  lineItems?: string;
  errorDescription?: string;
  statusModifiedTime?: string;
}

export interface POInvoiceHeadersRecord {
  recordID: number;
  invoice?: string[];
  invoiceRecordID?: any;
  details?: string[];
  companyCode?: string;
  vendId?: string;
  aPInvoiceNumber?: any;
  remitName?: any;
  invoiceDate?: any;
  termsId?: string;
  dueDate?: any;
  discountDate?: any;
  totalInvoiceAmount?: any;
  freightCharge?: any;
  miscellaneousCharge?: any;
  discountAmount?: any;
  surcharge?: any;
  aPAcct?: string;
  aPSub?: string;
  freightAccount?: string;
  freightSubaccount?: string;
  miscChargeAccount?: string;
  miscChargeSubaccount?: string;
  pONumberSeqType?: string;
  pONumber?: string;
  pOVendor?: string;
  curyId?: string;
  curyMultDiv?: string;
  curyRate?: number;
  curyRateType?: string;
  updateBatchNumber?: string;
  dateStamp: string;
  timeStamp?: any;
  userId?: string;
  invoiceBalance?: any;
  balanceExceptionYN?: any;
  jobProjectNumber?: string;
  documentAttachment?: any;
  exportStatus?: string;
  exportErrorCode?: string;
  detailsSum?: any;
  termsDaysInt?: number;
  taxID00?: string;
  taxID01?: string;
  taxID02?: string;
  taxID03?: string;
  taxTot00?: number;
  taxTot01?: number;
  taxTot02?: number;
  taxTot03?: number;
  txblTot00?: number;
  txblTot01?: number;
  txblTot02?: number;
  txblTot03?: number;
  tax00Acct?: string;
  tax01Acct?: string;
  tax02Acct?: string;
  tax03Acct?: string;
  tax00Sub?: string;
  tax01Sub?: string;
  tax02Sub?: string;
  tax03Sub?: string;
  updateYN?: boolean;
  updateAuditNumber?: string;
  gLExceptionYN?: boolean;
  type?: string;
  futureA?: string;
  futureB?: string;
}

export interface POInvoiceDetailsRecord {
  recordID: number;
  pOInvoiceHeaders?: string[];
  headerRecordID?: any;
  companyCode?: any;
  vendId?: any;
  aPInvoiceNumber?: any;
  lineNumber?: string;
  itemNo?: string;
  itemDescription?: string;
  step?: string;
  invoicePrice?: number;
  invoicePricingQty?: number;
  quantityInvoiced?: number;
  lineAmount?: number;
  pONumberSeqType?: any;
  pONumber?: any;
  pOReleaseNumber?: string;
  pOLineNumber?: string;
  vendorShipNumber?: string;
  dateReceived?: string;
  quantityReceived?: number;
  quantityAccepted?: number;
  purchasePrice?: number;
  pricingQuantity?: number;
  alreadyInvoicedQty?: number;
  expAcct?: string;
  expSub?: string;
  pPVVoucheredAcct?: string;
  pPVVoucheredSubAcct?: string;
  pPVUnitCost?: any;
  standardCost?: number;
  surchargeType?: string;
  surchargeRate?: number;
  surcharge?: number;
  gLExceptionYN?: string;
  invoicedInFullYN?: string;
  updateLevelInd?: string;
  pOUOM?: string;
  jobProjectNumber?: any;
  boxNbr?: string;
  futureA?: string;
  futureB?: string;
  linePricing?: any;
  header?: string;
  taxID00?: any;
  taxID01?: any;
  taxID02?: any;
  taxID03?: any;
  taxAmt00?: number;
  taxAmt01?: number;
  taxAmt02?: number;
  taxAmt03?: number;
  txblAmt00?: number;
  txblAmt01?: number;
  txblAmt02?: number;
  txblAmt03?: number;
}

// =============================================================================
// MANUALLY ADDED CONSTANTS (preserved after schema regeneration)
// =============================================================================

// Invoice Status Constants (Airtable values)
export const INVOICE_STATUS = {
  PENDING: 'Pending',
  OPEN: 'Matched',
  REVIEWED: 'Reviewed',
  QUEUED: 'Queued',
  APPROVED: 'Approved',
  EXPORTED: 'Exported',
  REJECTED: 'Error',
} as const;

// File Status Constants
export const FILE_STATUS = {
  UPLOADED: 'Uploaded',
  PROCESSING: 'Processing',
  PROCESSED: 'Processed',
  ERROR: 'Error',
} as const;

// User-facing display text for invoice statuses
export type UXStatus = 
  | 'Processing'
  | 'Processed'
  | 'Attention'
  | 'Exported'
  | 'Exporting';

// Maps Airtable status values to user-friendly display text
export const UX_STATUS_MAP = {
  'Pending': 'Processing',
  'Matched': 'Processed',
  'Error': 'Attention',
  'Exported': 'Exported',
  'Queued': 'Exporting',
} as const;

// Maps internal DocumentStatus values to Airtable status values
export const INTERNAL_TO_AIRTABLE_STATUS: Record<string, keyof typeof UX_STATUS_MAP> = {
  'pending': 'Pending',
  'open': 'Matched',
  'queued': 'Queued',
  'reviewed': 'Queued',
  'approved': 'Queued',
  'exported': 'Exported',
  'rejected': 'Error',
};

// Maps user-facing display text to badge colors
export const UX_STATUS_COLORS = {
  'Processing': 'blue',
  'Processed': 'success',
  'Exported': 'brand',
  'Attention': 'error',
  'Exporting': 'warning',
} as const;
