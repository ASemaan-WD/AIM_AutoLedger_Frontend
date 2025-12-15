/**
 * Auto-generated Airtable schema types
 * Generated from airtable-schema.json
 * 
 * Generated: 2025-12-15T18:58:41.561Z
 * Base ID: appuCyekfNZBULRYT
 * 
 * DO NOT EDIT MANUALLY
 * Run 'node scripts/generate-schema-types.js' to regenerate
 */

// ============================================================================
// FIELD IDS - Use these when accessing fields by ID
// ============================================================================

export const FIELD_IDS = {
  FILES: {
    FILEID: 'fld4aUSAm9rH0gPYt',
    FILEURL: 'fldxdxWbvC9KDHee7',
    FILEHASH: 'fldAkFbKnjYLzQJqS',
    FILENAME: 'fld7E1dvgRISwW0Pt',
    PAGES: 'fldQy3FJyx6mqMKOi',
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
    INVOICERECORDIDS: 'fldbjQKrmz7YHR5Am',
    STATUS_MODIFIED_TIME: 'fldacexiDeUtwmKCV',
    PROCESSING_STATUS: 'fldH93Ldd3EQoldMO',
    JOBS: 'fldKrD2WCqE1fP6UR',
    ORGANIZATIONID: 'fldKExnglFOvmEjKS',
    SUBFILEIDS: 'fldC5s2vHB7VMCh9d',
    SUBFILERECORDIDS: 'fld9KnJ3DD05IwTpQ',
    CLEARED: 'fldRQC0opkdUvzvJO',
    CLEARED_AT: 'fldWcVsJnWczAvfOD',
    SUBFILES: 'fldAWcwkNKmTKbrA9',
  },
  SUBFILES: {
    SUBFILEID: 'fld09sjAT3eh33k5p',
    FILEURL: 'fldtc5nb2wWkGuJl3',
    UPLOADEDDATE: 'fldT0NBfyOJ4UsxwZ',
    CREATED_AT: 'fldQEMXW4vopcqAir',
    MODIFIED_AT: 'fldjRNpcBCEXNQUOM',
    PARENTFILEID: 'fldDwVrAdRwetbI5T',
    PARENTFILERECORDID: 'fldLKIaXNHoX9LmgX',
  },
  INVOICES: {
    RECORDID: 'fldvQzw4GlIefZTPy',
    INVOICE_NUMBER: 'fldI9lZSSR7ucHPHC',
    VENDID: 'fldhRQMEeBh3yLzRj',
    VENDOR_NAME: 'fldJGXLYs7xaXP7xR',
    AMOUNT: 'fldO8fN0NWv8dqDKC',
    DATE: 'fldEx6RyGqFl0WivA',
    DISCOUNT_AMOUNT: 'fldQUPUpHtXmZ4UPB',
    DISCOUNT_DATE: 'fldz5ZPOnLmehqS3h',
    FREIGHT_CHARGE: 'fldYXCLntMTfENKJa',
    MISC_CHARGE: 'fldX0qPQMAgKaRFX3',
    SURCHARGE: 'fldIgWe2IFDOqnYO1',
    POS: 'fldmoLZSY47DRFnAr',
    DOCUMENT_RAW_TEXT: 'fldB5FcRvWID00Tdn',
    FILES: 'fldDzY5Ch6fCP0XHp',
    FILERECORDID: 'fldFZHrRdMIBlJt4p',
    CREATED_AT: 'fldOh6DdIq2JAhGHO',
    MODIFIED_AT: 'fldSAyzOAxppKn8rh',
    MATCHPAYLOADJSON: 'fld7nZtX7h9ykBAS2',
    ERRORCODE: 'fldwsvCcR8BsNYQVx',
    STATUS: 'fld8ZH6sheroClLwL',
    BALANCE: 'fldgF26E6kAcOYIEf',
    BALANCE_EXPLANATION: 'fldXH56bhzI3ieEsU',
    FILE_RAW_TEXT: 'fldbhuxrnxJ1Fun9u',
    MISSING_FIELDS: 'fldRkn64EhJZkKKQg',
    ATTACHMENTS: 'fldBSFvaBJYkkbaRe',
    POINVOICEHEADER: 'fldGeieJZPW2XwQEJ',
    POINVOICEHEADERRECORDID: 'fldsNZFfzvHhCavg7',
    HEADERS_SUM: 'fldI5H4YHsu4VPPjg',
    LINE_ITEMS: 'fldHPkRk05SqNzF2W',
    ERROR_DESCRIPTION: 'fldnH8Tqrvk52I7e9',
    STATUS_MODIFIED_TIME: 'fldGcJS6M2X2TPHbS',
    SUMMARY: 'fldhZQz3sZGhJHYts',
    NAME_CANDIDATES: 'fldUqMvWCDZq1HAAu',
    WARNINGS: 'flduKtm4zmcsDYR74',
    ITEMS: 'fldVuCDJcehGTk6B8',
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
    TAXID00: 'fldrfChafGoYKQ2aJ',
    APACCT: 'fldyi7UcDACICVIcq',
    APSUB: 'fldrdeHuh1NVCeKSv',
    FREIGHT_ACCOUNT: 'fld336ezRpzzEkyGh',
    FREIGHT_SUBACCOUNT: 'fldVB7LIxLqOeMmvd',
    MISC_CHARGE_ACCOUNT: 'fldCGiCgdrg5GL5pY',
    MISC_CHARGE_SUBACCOUNT: 'fldeFFh9n47APVWUr',
    TAX01SUB: 'fldaU2IBNcOm07Vu6',
    PO_NUMBER_SEQ_TYPE: 'fldgqMRGrJM3BUUfQ',
    PO_NUMBER: 'fld4uJuo5MBMnsZgw',
    PO_VENDOR: 'fld0qGIscEzVUgiZm',
    CURYID: 'flduhd4WL9ksJK3cW',
    CURYMULTDIV: 'fldqZxGWc5TR5Tomh',
    CURYRATE: 'fldtu6II85lju5kvT',
    CURYRATETYPE: 'fldLq5lUAm5C0HSa8',
    UPDATE_BATCH_NUMBER: 'fld4QUJecGm4skJhh',
    CREATED_AT: 'fldZxGyjFcQaPvxiO',
    MODIFIED_AT: 'fldubcFtpviXe1zsf',
    USER_ID: 'fldSelF39N2dmQ3EA',
    UPDATE_YN: 'fldfprb6BWN7yHaiU',
    UPDATE_AUDIT_NUMBER: 'fldZlmKvQaAmYGzcd',
    GL_EXCEPTION_YN: 'fld8VOSGAHVwsnNdp',
    INVOICE_BALANCE: 'fldHGoxrb3gYiN2Z7',
    BALANCE_EXCEPTION_YN: 'fldE38iRhlU7uIvma',
    JOB_PROJECT_NUMBER: 'fldg88jTL4hxHCgUG',
    DOCUMENTATTACHMENT: 'fldy6aT5yhZVbcs87',
    STATUS: 'fldb5mLqnscBfBzjM',
    EXPORT_ERROR_CODE: 'fld08whvyI1HaV5Dx',
    DETAILS_SUM: 'fldId0eVt84ZYF9fx',
    STATUS_MODIFIED_TIME: 'fldBeuPc41kQmBKWY',
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
    TAX02SUB: 'fld14PdXAJF2iUNEV',
    TAX03SUB: 'fldn1f5oPJYIMqChb',
    TYPE: 'fld9hrf3hvO78stDY',
    FUTUREA: 'fldUDB4VInuh7JPOI',
    FUTUREB: 'fldXSWA3dr1rLL5s4',
  },
  POINVOICEDETAILS: {
    RECORDID: 'fldsFnV2r5H0Pljoz',
    POINVOICEHEADER: 'fldeJpf4G5Cj0LnaR',
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
    CREATED_AT: 'fldea5xycWCUvW5uQ',
    MODIFIED_AT: 'fldJfQd3EbuRbdRaS',
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
  JOBS: {
    RECORDID: 'fldWxFHCUspjwRSVH',
    KIND: 'fldHTTbQg0THduYRz',
    RELATEDID: 'fldqB13XyHV8adQGo',
    RELATEDRECORDID: 'fldo5DUZ1ZqH81cMK',
    STATUS: 'fldrLsufhRoczexhW',
    ATTEMPTS: 'fldnuypciXqhTcjxF',
    ERROR: 'fld82YekEL3sWscLX',
    CREATEDAT: 'fldCdqR9MQUATvFVz',
    MODIFIEDAT: 'fldAto9sfQBrJcaBl',
    ORGANIZATIONID: 'fldihxZc6aRlVhvUN',
  },
  LOGS: {
    RECORDID: 'fldZZtCAIZSYrPlI6',
    SOURCE: 'fldETJ6DsaXKtawiE',
    DATE: 'fldGC5sJu48eGBdlN',
    OPERATION: 'fld71kOEuXNAXwHYM',
    ERROR_MESSAGE: 'fldx3MCaYFEKqYWzZ',
    STACK_TRACE: 'fldj7QfD7scWYmXDc',
    CREATED_AT: 'fldFwNVSdwuxvjoDN',
  },
} as const;

// ============================================================================
// TABLE IDS - Airtable table IDs
// ============================================================================

export const TABLE_IDS = {
  FILES: 'tbluYB0mHO6CQWrwL',
  SUBFILES: 'tblqX9rmeITcTJWDH',
  INVOICES: 'tblokyH2U1PBhhCE9',
  POINVOICEHEADERS: 'tblgEJz0WQtZusPAT',
  POINVOICEDETAILS: 'tblajSDlRV6SsUtw8',
  JOBS: 'tbl5ultFQKxpbqSk2',
  LOGS: 'tblydVugKkN2lSEre',
} as const;

// ============================================================================
// TABLE NAMES - Human-readable table names
// ============================================================================

export const TABLE_NAMES = {
  FILES: 'Files',
  SUBFILES: 'SubFiles',
  INVOICES: 'Invoices',
  POINVOICEHEADERS: 'POInvoiceHeaders',
  POINVOICEDETAILS: 'POInvoiceDetails',
  JOBS: 'Jobs',
  LOGS: 'Logs',
} as const;

// ============================================================================
// FIELD NAMES - Human-readable field names
// ============================================================================

export const FIELD_NAMES = {
  FILES: {
    FILEID: 'FileID',
    FILEURL: 'FileURL',
    FILEHASH: 'FileHash',
    FILENAME: 'FileName',
    PAGES: 'Pages',
    UPLOADEDDATE: 'UploadedDate',
    STATUS: 'Status',
    PARSEDAT: 'ParsedAt',
    ATTACHMENTS: 'Attachments',
    RAW_TEXT: 'Raw-Text',
    ERROR_CODE: 'Error-Code',
    ERROR_DESCRIPTION: 'Error-Description',
    ERROR_LINK: 'Error-Link',
    CREATED_AT: 'Created-At',
    MODIFIED_AT: 'Modified-At',
    INVOICES: 'Invoices',
    INVOICERECORDIDS: 'InvoiceRecordIDs',
    STATUS_MODIFIED_TIME: 'Status-Modified-Time',
    PROCESSING_STATUS: 'Processing-Status',
    JOBS: 'Jobs',
    ORGANIZATIONID: 'OrganizationId',
    SUBFILEIDS: 'SubFileIDs',
    SUBFILERECORDIDS: 'SubFileRecordIDs',
    CLEARED: 'Cleared',
    CLEARED_AT: 'Cleared-At',
    SUBFILES: 'SubFiles',
  },
  SUBFILES: {
    SUBFILEID: 'SubFileID',
    FILEURL: 'FileURL',
    UPLOADEDDATE: 'UploadedDate',
    CREATED_AT: 'Created-At',
    MODIFIED_AT: 'Modified-At',
    PARENTFILEID: 'ParentFileID',
    PARENTFILERECORDID: 'ParentFileRecordID',
  },
  INVOICES: {
    RECORDID: 'RecordID',
    INVOICE_NUMBER: 'Invoice-Number',
    VENDID: 'VendId',
    VENDOR_NAME: 'Vendor-Name',
    AMOUNT: 'Amount',
    DATE: 'Date',
    DISCOUNT_AMOUNT: 'Discount-Amount',
    DISCOUNT_DATE: 'Discount-Date',
    FREIGHT_CHARGE: 'Freight-Charge',
    MISC_CHARGE: 'Misc-Charge',
    SURCHARGE: 'Surcharge',
    POS: 'POs',
    DOCUMENT_RAW_TEXT: 'Document-Raw-Text',
    FILES: 'Files',
    FILERECORDID: 'FileRecordID',
    CREATED_AT: 'Created-At',
    MODIFIED_AT: 'Modified-At',
    MATCHPAYLOADJSON: 'MatchPayloadJSON',
    ERRORCODE: 'ErrorCode',
    STATUS: 'Status',
    BALANCE: 'Balance',
    BALANCE_EXPLANATION: 'Balance-Explanation',
    FILE_RAW_TEXT: 'File-Raw-Text',
    MISSING_FIELDS: 'Missing-Fields',
    ATTACHMENTS: 'Attachments',
    POINVOICEHEADER: 'POInvoiceHeader',
    POINVOICEHEADERRECORDID: 'POInvoiceHeaderRecordID',
    HEADERS_SUM: 'Headers-Sum',
    LINE_ITEMS: 'Line Items',
    ERROR_DESCRIPTION: 'Error-Description',
    STATUS_MODIFIED_TIME: 'Status-Modified-Time',
    SUMMARY: 'Summary',
    NAME_CANDIDATES: 'Name-Candidates',
    WARNINGS: 'Warnings',
    ITEMS: 'Items',
  },
  POINVOICEHEADERS: {
    RECORDID: 'RecordID',
    INVOICE: 'Invoice',
    INVOICERECORDID: 'InvoiceRecordID',
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
    APACCT: 'APAcct',
    APSUB: 'APSub',
    FREIGHT_ACCOUNT: 'Freight-Account',
    FREIGHT_SUBACCOUNT: 'Freight-Subaccount',
    MISC_CHARGE_ACCOUNT: 'Misc-Charge-Account',
    MISC_CHARGE_SUBACCOUNT: 'Misc-Charge-Subaccount',
    TAX01SUB: 'Tax01Sub',
    PO_NUMBER_SEQ_TYPE: 'PO-Number-Seq-Type',
    PO_NUMBER: 'PO-Number',
    PO_VENDOR: 'PO-Vendor',
    CURYID: 'CuryId',
    CURYMULTDIV: 'CuryMultDiv',
    CURYRATE: 'CuryRate',
    CURYRATETYPE: 'CuryRateType',
    UPDATE_BATCH_NUMBER: 'Update-Batch-Number',
    CREATED_AT: 'Created-At',
    MODIFIED_AT: 'Modified-At',
    USER_ID: 'User-Id',
    UPDATE_YN: 'Update-YN',
    UPDATE_AUDIT_NUMBER: 'Update-Audit-Number',
    GL_EXCEPTION_YN: 'GL-Exception-YN',
    INVOICE_BALANCE: 'Invoice-Balance',
    BALANCE_EXCEPTION_YN: 'Balance-Exception-YN',
    JOB_PROJECT_NUMBER: 'Job-Project-Number',
    DOCUMENTATTACHMENT: 'DocumentAttachment',
    STATUS: 'Status',
    EXPORT_ERROR_CODE: 'Export-Error-Code',
    DETAILS_SUM: 'Details-Sum',
    STATUS_MODIFIED_TIME: 'Status-Modified-Time',
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
    TAX00ACCT: 'Tax00Acct',
    TAX01ACCT: 'Tax01Acct',
    TAX02ACCT: 'Tax02Acct',
    TAX03ACCT: 'Tax03Acct',
    TAX00SUB: 'Tax00Sub',
    TAX02SUB: 'Tax02Sub',
    TAX03SUB: 'Tax03Sub',
    TYPE: 'Type',
    FUTUREA: 'FutureA',
    FUTUREB: 'FutureB',
  },
  POINVOICEDETAILS: {
    RECORDID: 'RecordID',
    POINVOICEHEADER: 'POInvoiceHeader',
    HEADERRECORDID: 'HeaderRecordID',
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
    EXPACCT: 'ExpAcct',
    EXPSUB: 'ExpSub',
    PPV_VOUCHERED_ACCT: 'PPV-Vouchered-Acct',
    PPV_VOUCHERED_SUBACCT: 'PPV-Vouchered-SubAcct',
    PPV_UNIT_COST: 'PPV-Unit-Cost',
    STANDARD_COST: 'Standard-Cost',
    SURCHARGETYPE: 'SurchargeType',
    SURCHARGERATE: 'SurchargeRate',
    SURCHARGE: 'Surcharge',
    GL_EXCEPTION_YN: 'GL-Exception-YN',
    INVOICED_IN_FULL_YN: 'Invoiced-In-Full-YN',
    UPDATE_LEVEL_IND: 'Update-Level-Ind',
    PO_UOM: 'PO-UOM',
    JOB_PROJECT_NUMBER: 'Job-Project-Number',
    BOXNBR: 'BoxNbr',
    FUTUREA: 'FutureA',
    FUTUREB: 'FutureB',
    LINE_PRICING: 'Line-Pricing',
    CREATED_AT: 'Created-At',
    MODIFIED_AT: 'Modified-At',
    HEADER: 'Header',
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
  },
  JOBS: {
    RECORDID: 'RecordID',
    KIND: 'Kind',
    RELATEDID: 'RelatedId',
    RELATEDRECORDID: 'RelatedRecordID',
    STATUS: 'Status',
    ATTEMPTS: 'Attempts',
    ERROR: 'Error',
    CREATEDAT: 'CreatedAt',
    MODIFIEDAT: 'ModifiedAt',
    ORGANIZATIONID: 'OrganizationId',
  },
  LOGS: {
    RECORDID: 'RecordID',
    SOURCE: 'Source',
    DATE: 'Date',
    OPERATION: 'Operation',
    ERROR_MESSAGE: 'Error-Message',
    STACK_TRACE: 'Stack-Trace',
    CREATED_AT: 'Created-At',
  },
} as const;

// ============================================================================
// STATUS CONSTANTS
// ============================================================================

// Invoice Status Constants
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
  QUEUED: 'Queued',
  PROCESSING: 'Processing',
  PROCESSED: 'Processed',
  ERROR: 'Error',
  ATTENTION: 'Attention',
} as const;

// File Processing Status Constants (substatus - shows current operation)
export const PROCESSING_STATUS = {
  UPL: 'UPL',           // Uploaded to Vercel
  DETINV: 'DETINV',     // Detecting invoices (OCR)
  PARSE: 'PARSE',       // Parsing invoice data
  RELINV: 'RELINV',     // Relating/finding invoices
  MATCHING: 'MATCHING', // Matching with PO headers
  MATCHED: 'MATCHED',   // Matching complete
  ERROR: 'ERROR',       // Error occurred
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
  'Attention': 'error',
  'Exported': 'gray',
  'Exporting': 'warning',
} as const;

// ============================================================================
// TABLE INTERFACES - TypeScript interfaces for each table
// ============================================================================

export interface FilesRecord {
  id: string;
  createdTime: string;
  fields: {
    FileID?: number;
    FileURL?: string;
    FileHash?: string;
    FileName?: string;
    Pages?: number;
    UploadedDate?: string;
    Status?: 'Queued' | 'Processing' | 'Processed' | 'Attention';
    ParsedAt?: string;
    Attachments?: Array<{ url: string; filename: string; type?: string; size?: number; thumbnails?: any }>;
    'Raw-Text'?: string;
    'Error-Code'?: string;
    'Error-Description'?: string;
    'Error-Link'?: string;
    'Created-At'?: string;
    'Modified-At'?: string;
    Invoices?: string[];
    InvoiceRecordIDs?: any;
    'Status-Modified-Time'?: string;
    'Processing-Status'?: 'UPL' | 'DETINV' | 'PARSE' | 'RELINV' | 'MATCHING' | 'MATCHED' | 'ERROR';
    Jobs?: string;
    OrganizationId?: string;
    SubFileIDs?: string[];
    SubFileRecordIDs?: any;
    Cleared?: boolean;
    'Cleared-At'?: string;
    SubFiles?: string;
  };
}

export interface SubFilesRecord {
  id: string;
  createdTime: string;
  fields: {
    SubFileID?: number;
    FileURL?: string;
    UploadedDate?: string;
    'Created-At'?: string;
    'Modified-At'?: string;
    ParentFileID?: string[];
    ParentFileRecordID?: any;
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
    'Discount-Amount'?: any;
    'Discount-Date'?: any;
    'Freight-Charge'?: number;
    'Misc-Charge'?: number;
    Surcharge?: number;
    POs?: string;
    'Document-Raw-Text'?: string;
    Files?: string[];
    FileRecordID?: any;
    'Created-At'?: string;
    'Modified-At'?: string;
    MatchPayloadJSON?: string;
    ErrorCode?: string;
    Status?: 'Pending' | 'Matching' | 'Matched' | 'Queued' | 'Exported' | 'Error';
    Balance?: any;
    'Balance-Explanation'?: string;
    'File-Raw-Text'?: any;
    'Missing-Fields'?: any;
    Attachments?: any;
    POInvoiceHeader?: string[];
    POInvoiceHeaderRecordID?: any;
    'Headers-Sum'?: any;
    'Line Items'?: string;
    'Error-Description'?: string;
    'Status-Modified-Time'?: string;
    Summary?: string;
    'Name-Candidates'?: string;
    Warnings?: string;
    Items?: string;
  };
}

export interface POInvoiceHeadersRecord {
  id: string;
  createdTime: string;
  fields: {
    RecordID?: number;
    Invoice?: string[];
    InvoiceRecordID?: any;
    Details?: string[];
    'Company-Code'?: string;
    VendId?: string;
    'AP-Invoice-Number'?: any;
    'Remit-Name'?: any;
    'Invoice-Date'?: any;
    TermsId?: string;
    'Due-Date'?: string;
    'Discount-Date'?: string;
    'Total-Invoice-Amount'?: any;
    'Freight-Charge'?: any;
    'Miscellaneous-Charge'?: any;
    'Discount-Amount'?: number;
    Surcharge?: any;
    TaxID00?: string;
    APAcct?: string;
    APSub?: string;
    'Freight-Account'?: string;
    'Freight-Subaccount'?: string;
    'Misc-Charge-Account'?: string;
    'Misc-Charge-Subaccount'?: string;
    Tax01Sub?: string;
    'PO-Number-Seq-Type'?: string;
    'PO-Number'?: string;
    'PO-Vendor'?: string;
    CuryId?: string;
    CuryMultDiv?: number;
    CuryRate?: number;
    CuryRateType?: string;
    'Update-Batch-Number'?: string;
    'Created-At'?: string;
    'Modified-At'?: string;
    'User-Id'?: string;
    'Update-YN'?: boolean;
    'Update-Audit-Number'?: string;
    'GL-Exception-YN'?: boolean;
    'Invoice-Balance'?: any;
    'Balance-Exception-YN'?: any;
    'Job-Project-Number'?: string;
    DocumentAttachment?: any;
    Status?: 'Pending' | 'Matched' | 'Queued' | 'Exported' | 'Error' | '';
    'Export-Error-Code'?: string;
    'Details-Sum'?: any;
    'Status-Modified-Time'?: string;
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
    Tax00Acct?: string;
    Tax01Acct?: string;
    Tax02Acct?: string;
    Tax03Acct?: string;
    Tax00Sub?: string;
    Tax02Sub?: string;
    Tax03Sub?: string;
    Type?: string;
    FutureA?: string;
    FutureB?: string;
  };
}

export interface POInvoiceDetailsRecord {
  id: string;
  createdTime: string;
  fields: {
    RecordID?: number;
    POInvoiceHeader?: string[];
    HeaderRecordID?: any;
    'Company-Code'?: any;
    VendId?: any;
    'AP-Invoice-Number'?: any;
    'Line-Number'?: string;
    'Item-No'?: string;
    'Item-Description'?: string;
    Step?: string;
    'Invoice-Price'?: number;
    'Invoice-Pricing-Qty'?: number;
    'Quantity-Invoiced'?: number;
    'Line-Amount'?: number;
    'PO-Number-Seq-Type'?: any;
    'PO-Number'?: any;
    'PO-Release-Number'?: string;
    'PO-Line-Number'?: string;
    'Vendor-Ship-Number'?: string;
    'Date-Received'?: string;
    'Quantity-Received'?: number;
    'Quantity-Accepted'?: number;
    'Purchase-Price'?: number;
    'Pricing-Quantity'?: number;
    'Already-Invoiced-Qty'?: number;
    ExpAcct?: string;
    ExpSub?: string;
    'PPV-Vouchered-Acct'?: string;
    'PPV-Vouchered-SubAcct'?: string;
    'PPV-Unit-Cost'?: any;
    'Standard-Cost'?: number;
    SurchargeType?: 'Dollar' | 'Percent';
    SurchargeRate?: number;
    Surcharge?: number;
    'GL-Exception-YN'?: string;
    'Invoiced-In-Full-YN'?: string;
    'Update-Level-Ind'?: string;
    'PO-UOM'?: string;
    'Job-Project-Number'?: any;
    BoxNbr?: string;
    FutureA?: string;
    FutureB?: string;
    'Line-Pricing'?: any;
    'Created-At'?: string;
    'Modified-At'?: string;
    Header?: string;
    TaxID00?: any;
    TaxID01?: any;
    TaxID02?: any;
    TaxID03?: any;
    TaxAmt00?: number;
    TaxAmt01?: number;
    TaxAmt02?: number;
    TaxAmt03?: number;
    txblAmt00?: number;
    txblAmt01?: number;
    txblAmt02?: number;
    txblAmt03?: number;
  };
}

export interface JobsRecord {
  id: string;
  createdTime: string;
  fields: {
    RecordID?: number;
    Kind?: 'ocr' | 'parse' | 'match';
    RelatedId?: string;
    RelatedRecordID?: number;
    Status?: 'Pending' | 'Processing' | 'Completed' | 'Failed';
    Attempts?: number;
    Error?: string;
    CreatedAt?: string;
    ModifiedAt?: string;
    OrganizationId?: string;
  };
}

export interface LogsRecord {
  id: string;
  createdTime: string;
  fields: {
    RecordID?: number;
    Source?: 'backend' | 'bridge';
    Date?: string;
    Operation?: string;
    'Error-Message'?: string;
    'Stack-Trace'?: string;
    'Created-At'?: string;
  };
}

