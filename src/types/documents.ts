import type { AirtableAttachment } from '@/lib/airtable/types';

// Document Types
export type DocumentType = 'invoices' | 'files' | 'store-receivers' | 'delivery-tickets' | 'pos' | 'shipping' | 'bank';

// Document Status (from Airtable schema)
export type DocumentStatus = 'open' | 'reviewed' | 'queued' | 'exported' | 'pending' | 'approved' | 'rejected';

// Completeness is computed on the fly in UI; keeping type for legacy references if any
export type CompletenessStatus = 'complete' | 'incomplete' | 'missing_fields';

// Base Document Interface
export interface BaseDocument {
    id: string;
    recordId?: string; // Airtable record ID
    type: DocumentType;
    status: DocumentStatus;
    missingFields?: string[]; // Deprecated - kept for compatibility
    missingFieldsMessage?: string; // Server-side validation from Airtable
    createdAt: Date;
    updatedAt: Date;
    linkedIds: string[];
}

// Invoice Document
export interface Invoice extends BaseDocument {
    type: 'invoices';
    vendorName: string;
    vendorCode?: string;
    invoiceNumber: string;
    invoiceDate: Date;
    amount: number;
    freightCharge?: number;
    surcharge?: number;
    glAccount?: string;
    rawTextOcr?: string;
    rejectionCode?: string;
    rejectionReason?: string;
    attachments?: AirtableAttachment[];
    files?: string[];
    team?: string[];
    invoiceDetails?: string[]; // Linked POInvoiceDetails record IDs
    balance?: number; // Balance between invoice and PO
    balanceExplanation?: string; // Explanation for balance discrepancy
    errorCode?: string; // Error code for Error state
    errorMessage?: string; // Error message for Error state
    isMultilineCoding?: boolean; // Whether invoice uses multi-line coding
    lines?: InvoiceLine[]; // Line items for multi-line coding
}

// Invoice Line Item (for multi-line coding)
export interface InvoiceLine {
    id: string;
    lineNumber?: string;
    itemNo?: string;
    description: string;
    quantity?: number;
    unitPrice?: number;
    amount: number;
    glAccount?: string;
    poNumber?: string;
    poLineNumber?: string;
}

// Alias for backward compatibility
export type DocumentLine = InvoiceLine;

// Purchase Order Document
export interface PurchaseOrder extends BaseDocument {
    type: 'pos';
    supplier: {
        name: string;
        code: string;
    };
    poNumber: string;
    poDate: Date;
    totalAmount: number;
    linkedInvoices?: string[];
}

// Shipping/ASN Document
export interface Shipping extends BaseDocument {
    type: 'shipping';
    supplier: string;
    carrier?: string;
    asnNumber: string;
    shipDate: Date;
    totalQuantity: number;
    linkedPO?: string;
}

// Bank Statement Document
export interface BankStatement extends BaseDocument {
    type: 'bank';
    bank: string;
    accountNumber: string;
    periodStart: Date;
    periodEnd: Date;
    openingBalance: number;
    closingBalance: number;
    transactionCount: number;
    mappingProfile?: string;
}

// File Document
export interface FileDocument extends BaseDocument {
    type: 'files';
    title: string;
    fileType: string;
    source: 'email' | 'upload';
    receivedAt: Date;
    tags: FileTag[];
}

export type FileTag = 'duplicate' | 'corrupt' | 'unreadable' | 'password' | 'needs_split';

// Delivery Ticket Document
export interface DeliveryTicket extends BaseDocument {
    type: 'delivery-tickets';
    vendorName: string;
    vendorCode?: string;
    invoiceNumber: string;
    invoiceDate: Date;
    dueDate?: Date;
    amount: number;
    glAccount?: string;
    rawTextOcr?: string;
    rejectionCode?: string;
    rejectionReason?: string;
    attachments?: AirtableAttachment[];
    files?: string[];
    team?: string[];
}

// Store Receiver Document
export interface StoreReceiver extends BaseDocument {
    type: 'store-receivers';
    documentNumber: string;
    vendorName: string;
    vendorCode?: string;
    invoiceNumber: string;
    invoiceDate: Date;
    amount: number;
    glAccount?: string;
    documentRawText?: string;
    rawTextOcr?: string; // Alias for documentRawText
    rejectionCode?: string;
    rejectionReason?: string;
    attachments?: AirtableAttachment[];
    files?: string[];
    team?: string[];
}

// Union type for all documents
export type Document = Invoice | DeliveryTicket | StoreReceiver | PurchaseOrder | Shipping | BankStatement | FileDocument;

// Document Link
export interface DocumentLink {
    fromId: string;
    fromType: DocumentType;
    toId: string;
    toType: DocumentType;
    lineRefs?: number[];
    createdAt: Date;
}

// Sub-views for each document type
export interface DocumentSubView {
    id: string;
    label: string;
    count?: number;
    filter: (documents: Document[]) => Document[];
}

export const INVOICE_SUB_VIEWS: DocumentSubView[] = [
    {
        id: 'all',
        label: 'All',
        filter: () => true as any
    },
    {
        id: 'missing_fields',
        label: 'Missing Fields',
        filter: (docs: Document[]) => docs.filter(doc => doc.type === 'invoices' && (
            (doc as any).vendorName && (doc as any).invoiceNumber && (doc as any).amount
        ) === false)
    },
    {
        id: 'open',
        label: 'Open',
        filter: (docs: Document[]) => docs.filter(doc => doc.status === 'open')
    },
    {
        id: 'reviewed',
        label: 'Queued',
        filter: (docs: Document[]) => docs.filter(doc => doc.status === 'reviewed' || doc.status === 'queued')
    },
    {
        id: 'pending',
        label: 'Pending',
        filter: (docs: Document[]) => docs.filter(doc => doc.status === 'pending')
    },
    {
        id: 'staged',
        label: 'Staged',
        filter: (docs: Document[]) => docs.filter(doc => doc.status === 'approved')
    },
    {
        id: 'exported',
        label: 'Exported',
        filter: (docs: Document[]) => docs.filter(doc => doc.status === 'exported')
    }
];

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Type guard to check if a document is an Invoice
 */
export function isInvoice(doc: Document | Invoice | DeliveryTicket | StoreReceiver): doc is Invoice {
    return doc.type === 'invoices';
}

/**
 * Type guard to check if a document is a DeliveryTicket
 */
export function isDeliveryTicket(doc: Document | Invoice | DeliveryTicket | StoreReceiver): doc is DeliveryTicket {
    return doc.type === 'delivery-tickets';
}

/**
 * Type guard to check if a document is a StoreReceiver
 */
export function isStoreReceiver(doc: Document | Invoice | DeliveryTicket | StoreReceiver): doc is StoreReceiver {
    return doc.type === 'store-receivers';
}

/**
 * Type guard to check if a document has lines (multi-line coding)
 */
export function hasLines(doc: Invoice | DeliveryTicket | StoreReceiver): doc is Invoice {
    return isInvoice(doc) && (doc.isMultilineCoding === true || (doc.lines !== undefined && doc.lines.length > 0));
}

/**
 * Type guard to check if a document has balance fields
 */
export function hasBalance(doc: Invoice | DeliveryTicket | StoreReceiver): doc is Invoice {
    return isInvoice(doc) && doc.balance !== undefined;
}

/**
 * Type guard to check if a document has error fields
 */
export function hasErrorInfo(doc: Invoice | DeliveryTicket | StoreReceiver): doc is Invoice {
    return isInvoice(doc) && (doc.errorCode !== undefined || doc.errorMessage !== undefined);
}

/**
 * Type guard to check if a document has freight/surcharge
 */
export function hasCharges(doc: Invoice | DeliveryTicket | StoreReceiver): doc is Invoice {
    return isInvoice(doc) && (doc.freightCharge !== undefined || doc.surcharge !== undefined);
}

export const PO_SUB_VIEWS: DocumentSubView[] = [
    {
        id: 'all',
        label: 'All',
        filter: () => true as any
    },
    {
        id: 'missing_fields',
        label: 'Missing Fields',
        filter: (docs: Document[]) => docs.filter(doc => doc.missingFields && doc.missingFields.length > 0)
    },
    {
        id: 'unlinked',
        label: 'Unlinked',
        filter: (docs: Document[]) => docs.filter(doc => doc.linkedIds.length === 0)
    },
    {
        id: 'linked',
        label: 'Linked',
        filter: (docs: Document[]) => docs.filter(doc => doc.linkedIds.length > 0)
    }
];

export const SHIPPING_SUB_VIEWS: DocumentSubView[] = [
    {
        id: 'all',
        label: 'All',
        filter: () => true as any
    },
    {
        id: 'missing_fields',
        label: 'Missing Fields',
        filter: (docs: Document[]) => docs.filter(doc => doc.missingFields && doc.missingFields.length > 0)
    },
    {
        id: 'unlinked_po',
        label: 'Unlinked to PO',
        filter: (docs: Document[]) => docs.filter(doc => doc.linkedIds.length === 0)
    },
    {
        id: 'linked',
        label: 'Linked',
        filter: (docs: Document[]) => docs.filter(doc => doc.linkedIds.length > 0)
    }
];

export const BANK_SUB_VIEWS: DocumentSubView[] = [
    {
        id: 'all',
        label: 'All',
        filter: () => true as any
    },
    {
        id: 'missing_fields',
        label: 'Missing Fields',
        filter: (docs: Document[]) => docs.filter(doc => doc.missingFields && doc.missingFields.length > 0)
    },
    {
        id: 'unmapped',
        label: 'Unmapped',
        filter: (docs: Document[]) => docs.filter(doc => doc.type === 'bank' && !(doc as BankStatement).mappingProfile)
    },
    {
        id: 'mapped',
        label: 'Mapped',
        filter: (docs: Document[]) => docs.filter(doc => doc.type === 'bank' && (doc as BankStatement).mappingProfile)
    }
];

export const FILES_SUB_VIEWS: DocumentSubView[] = [
    {
        id: 'all',
        label: 'All',
        filter: () => true as any
    },
    {
        id: 'unlinked',
        label: 'Unlinked',
        filter: (docs: Document[]) => docs.filter(doc => doc.linkedIds.length === 0)
    },
    {
        id: 'linked',
        label: 'Linked',
        filter: (docs: Document[]) => docs.filter(doc => doc.linkedIds.length > 0)
    },
    {
        id: 'duplicate',
        label: 'Duplicate',
        filter: (docs: Document[]) => docs.filter(doc => 
            doc.type === 'files' && (doc as FileDocument).tags.includes('duplicate')
        )
    },
    {
        id: 'corrupt',
        label: 'Corrupt',
        filter: (docs: Document[]) => docs.filter(doc => 
            doc.type === 'files' && (doc as FileDocument).tags.includes('corrupt')
        )
    }
];

export const DELIVERY_TICKET_SUB_VIEWS: DocumentSubView[] = [
    {
        id: 'all',
        label: 'All',
        filter: () => true as any
    },
    {
        id: 'missing_fields',
        label: 'Missing Fields',
        filter: (docs: Document[]) => docs.filter(doc => doc.type === 'delivery-tickets' && (
            (doc as any).vendorName && (doc as any).invoiceNumber && (doc as any).amount
        ) === false)
    },
    {
        id: 'open',
        label: 'Open',
        filter: (docs: Document[]) => docs.filter(doc => doc.status === 'open')
    },
    {
        id: 'reviewed',
        label: 'Queued',
        filter: (docs: Document[]) => docs.filter(doc => doc.status === 'reviewed' || doc.status === 'queued')
    },
    {
        id: 'pending',
        label: 'Pending',
        filter: (docs: Document[]) => docs.filter(doc => doc.status === 'pending')
    },
    {
        id: 'approved',
        label: 'Approved',
        filter: (docs: Document[]) => docs.filter(doc => doc.status === 'approved')
    },
    {
        id: 'rejected',
        label: 'Rejected',
        filter: (docs: Document[]) => docs.filter(doc => doc.status === 'rejected')
    },
    {
        id: 'exported',
        label: 'Exported',
        filter: (docs: Document[]) => docs.filter(doc => doc.status === 'exported')
    }
];

