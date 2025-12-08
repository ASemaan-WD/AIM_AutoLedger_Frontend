import type { UploadStatus, DetailedIssue } from '@/components/application/upload-status/upload-status-card';

export interface InvoiceWarningType {
  Type: string;
  [key: string]: any;
}

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  status: UploadStatus;
  failed?: boolean;
  type?: string;
  isDuplicate?: boolean;
  duplicateInfo?: Record<string, unknown>;
  errorCode?: string;
  errorDescription?: string;
  errorLink?: string;
  airtableRecordId?: string;
  fileId?: number;
  processingStatus?: string;
  mainStatus?: string;
  pageCount?: number;
  createdAt?: Date;
  invoices?: Array<{
    vendor: string;
    date: string;
    daysAgo: number;
    amount: string;
    description: string;
    invoiceNumber?: string;
    recordId?: string;
    status?: string;
    errorCode?: string;
    errorDescription?: string;
    warnings?: InvoiceWarningType[];
    balance?: number;
  }>;
  // UI Display Fields
  issues?: string[];
  detailedIssues?: DetailedIssue[];
  varianceInfo?: { amount: string; direction: 'over' | 'under' };
  analysisSummary?: string;
}

export interface StateGroupConfig {
  id: string;
  label: string;
  description: string;
  priority: number;
  statuses: UploadStatus[];
  badgeColor: 'gray-blue' | 'brand' | 'success' | 'warning' | 'error';
}

