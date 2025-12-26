/**
 * Client Workflow Configuration
 * Defines processing workflows for different clients
 * 
 * IMPORTANT: This module now separates two concepts:
 * 1. Invoice Status - Determines progress %, widget state, and button visibility
 * 2. Processing Status - Determines label text only (what's happening right now)
 */

import { PROCESSING_STATUS } from '@/lib/airtable/schema-types';

// =============================================================================
// TYPES
// =============================================================================

export type ClientId = 'LTC' | 'CREST';

/**
 * Invoice status progress state
 * Used for progress bar and completion state
 */
export interface InvoiceProgressState {
  /** Invoice status from Airtable */
  status: string;
  /** Progress percentage (0-100) */
  progress: number;
  /** Whether this is a final/completion state */
  isFinal?: boolean;
  /** Whether this is a success state (shows success UI) */
  isSuccess?: boolean;
}

/**
 * Processing status label
 * Used for status text only
 */
export interface ProcessingStatusLabel {
  status: string;
  label: string;
}

export interface WorkflowEndState {
  /** Whether to show the Export button */
  showExportButton: boolean;
  /** Whether to show the "Go to Invoice" button */
  showGoToInvoiceButton: boolean;
  /** Label for the primary action button */
  primaryActionLabel: string;
}

export interface ClientWorkflow {
  /** Client identifier */
  clientId: ClientId;
  /** Display name for the client */
  displayName: string;
  /** Invoice status to progress mapping (for progress bar) */
  invoiceProgressStates: InvoiceProgressState[];
  /** Processing status to label mapping (for status text) */
  processingLabels: ProcessingStatusLabel[];
  /** Configuration for the positive end state */
  endState: WorkflowEndState;
  /** The invoice status that marks completion (100%) */
  completionStatus: string;
}

// =============================================================================
// PROCESSING STATUS LABELS (Same for all clients - just labels)
// =============================================================================

const PROCESSING_LABELS: ProcessingStatusLabel[] = [
  { status: PROCESSING_STATUS.UPL, label: 'Uploading...' },
  { status: PROCESSING_STATUS.DETINV, label: 'Reading document...' },
  { status: PROCESSING_STATUS.PARSE, label: 'Extracting data...' },
  { status: PROCESSING_STATUS.RELINV, label: 'Reading document...' },
  { status: PROCESSING_STATUS.MATCHING, label: 'Checking with AIM Vision...' },
  { status: PROCESSING_STATUS.MATCHED, label: 'Match complete' },
  { status: PROCESSING_STATUS.ERROR, label: 'Error' },
];

// =============================================================================
// CLIENT WORKFLOWS
// =============================================================================

/**
 * LTC Workflow
 * Full matching workflow: Pending -> Parsed -> Matching -> Matched
 * Export button shown on success (Matched status)
 */
const LTC_WORKFLOW: ClientWorkflow = {
  clientId: 'LTC',
  displayName: 'LTC',
  // Progress based on INVOICE STATUS
  invoiceProgressStates: [
    { status: 'Pending', progress: 30, isFinal: false, isSuccess: false },
    { status: 'Parsed', progress: 50, isFinal: false, isSuccess: false },
    { status: 'Matching', progress: 80, isFinal: false, isSuccess: false },
    { status: 'Matched', progress: 100, isFinal: true, isSuccess: true },
    { status: 'Queued', progress: 100, isFinal: true, isSuccess: true },
    { status: 'Exported', progress: 100, isFinal: true, isSuccess: true },
    { status: 'Error', progress: 100, isFinal: true, isSuccess: false },
  ],
  processingLabels: PROCESSING_LABELS,
  endState: {
    showExportButton: true,
    showGoToInvoiceButton: false,
    primaryActionLabel: 'Export',
  },
  completionStatus: 'Matched',
};

/**
 * CREST Workflow
 * Simplified workflow: Pending -> Parsed (complete)
 * "Go to Invoice" button shown on success (Parsed status)
 */
const CREST_WORKFLOW: ClientWorkflow = {
  clientId: 'CREST',
  displayName: 'CREST',
  // Progress based on INVOICE STATUS
  invoiceProgressStates: [
    { status: 'Pending', progress: 50, isFinal: false, isSuccess: false },
    { status: 'Parsed', progress: 100, isFinal: true, isSuccess: true },
    // CREST doesn't use these, but map for fallback
    { status: 'Matching', progress: 100, isFinal: true, isSuccess: true },
    { status: 'Matched', progress: 100, isFinal: true, isSuccess: true },
    { status: 'Queued', progress: 100, isFinal: true, isSuccess: true },
    { status: 'Exported', progress: 100, isFinal: true, isSuccess: true },
    { status: 'Error', progress: 100, isFinal: true, isSuccess: false },
  ],
  processingLabels: PROCESSING_LABELS,
  endState: {
    showExportButton: false,
    showGoToInvoiceButton: true,
    primaryActionLabel: 'Go to Invoice',
  },
  completionStatus: 'Parsed',
};

// =============================================================================
// WORKFLOW MAP
// =============================================================================

export const CLIENT_WORKFLOWS: Map<ClientId, ClientWorkflow> = new Map([
  ['LTC', LTC_WORKFLOW],
  ['CREST', CREST_WORKFLOW],
]);

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get workflow configuration for a client
 * Defaults to LTC if client not found
 */
export function getClientWorkflow(clientId?: string | null): ClientWorkflow {
  if (!clientId) return LTC_WORKFLOW;
  
  const workflow = CLIENT_WORKFLOWS.get(clientId as ClientId);
  return workflow || LTC_WORKFLOW;
}

/**
 * Get progress percentage based on INVOICE STATUS (not processing status)
 * This is the main progress calculation function
 * 
 * @param clientId - Client identifier
 * @param invoiceStatus - Invoice status from Airtable (Pending, Parsed, Matching, Matched, etc.)
 * @param hasInvoice - Whether an invoice record exists yet
 */
export function getInvoiceProgress(
  clientId?: string | null, 
  invoiceStatus?: string | null,
  hasInvoice: boolean = true
): number {
  // No invoice yet = early stage
  if (!hasInvoice || !invoiceStatus) {
    return 20; // Default early progress
  }
  
  const workflow = getClientWorkflow(clientId);
  const state = workflow.invoiceProgressStates.find(s => s.status === invoiceStatus);
  return state?.progress ?? 50; // Default fallback
}

/**
 * Check if an invoice status is a final (complete) state for a client
 * 
 * @param clientId - Client identifier
 * @param invoiceStatus - Invoice status from Airtable
 */
export function isInvoiceStatusFinal(clientId?: string | null, invoiceStatus?: string | null): boolean {
  if (!invoiceStatus) return false;
  
  const workflow = getClientWorkflow(clientId);
  const state = workflow.invoiceProgressStates.find(s => s.status === invoiceStatus);
  return state?.isFinal === true;
}

/**
 * Check if an invoice status is a success state for a client
 * 
 * @param clientId - Client identifier  
 * @param invoiceStatus - Invoice status from Airtable
 */
export function isInvoiceStatusSuccess(clientId?: string | null, invoiceStatus?: string | null): boolean {
  if (!invoiceStatus) return false;
  
  const workflow = getClientWorkflow(clientId);
  const state = workflow.invoiceProgressStates.find(s => s.status === invoiceStatus);
  return state?.isSuccess === true;
}

/**
 * Get status text label based on PROCESSING STATUS
 * This is just for the label/text display
 * 
 * @param clientId - Client identifier
 * @param processingStatus - Processing status (UPL, DETINV, PARSE, etc.)
 */
export function getProcessingStatusLabel(clientId?: string | null, processingStatus?: string): string {
  const workflow = getClientWorkflow(clientId);
  
  if (!processingStatus) return 'Processing...';
  
  const label = workflow.processingLabels.find(l => l.status === processingStatus);
  return label?.label ?? 'Processing...';
}

/**
 * Get the end state configuration for a client
 */
export function getClientEndState(clientId?: string | null): WorkflowEndState {
  const workflow = getClientWorkflow(clientId);
  return workflow.endState;
}

/**
 * Check if we should show the export button for this client
 */
export function shouldShowExportButton(clientId?: string | null): boolean {
  return getClientEndState(clientId).showExportButton;
}

/**
 * Check if we should show the "Go to Invoice" button for this client
 */
export function shouldShowGoToInvoiceButton(clientId?: string | null): boolean {
  return getClientEndState(clientId).showGoToInvoiceButton;
}

/**
 * Get the list of invoice statuses that count as "success" for a client
 * For CREST: Parsed, Matched, Queued, Exported
 * For LTC: Matched, Queued, Exported
 */
export function getSuccessInvoiceStatuses(clientId?: string | null): string[] {
  const workflow = getClientWorkflow(clientId);
  return workflow.invoiceProgressStates
    .filter(s => s.isSuccess)
    .map(s => s.status);
}

/**
 * Get the list of invoice statuses that count as "final" (done processing) for a client
 * For CREST: Parsed, Matched, Exported, Error
 * For LTC: Matched, Exported, Error
 */
export function getFinalInvoiceStatuses(clientId?: string | null): string[] {
  const workflow = getClientWorkflow(clientId);
  return workflow.invoiceProgressStates
    .filter(s => s.isFinal)
    .map(s => s.status);
}

// =============================================================================
// DEPRECATED FUNCTIONS (kept for backward compatibility during migration)
// These will be removed after migration is complete
// =============================================================================

/**
 * @deprecated Use getInvoiceProgress instead
 * Get progress percentage for a processing status based on client workflow
 */
export function getClientProcessingProgress(clientId?: string | null, processingStatus?: string): number {
  // Map processing status to approximate invoice status for backward compatibility
  const invoiceStatusMap: Record<string, string> = {
    'UPL': 'Pending',
    'DETINV': 'Pending',
    'PARSE': 'Parsed',
    'RELINV': 'Parsed',
    'MATCHING': 'Matching',
    'MATCHED': 'Matched',
    'ERROR': 'Error',
  };
  
  const invoiceStatus = processingStatus ? invoiceStatusMap[processingStatus] : undefined;
  return getInvoiceProgress(clientId, invoiceStatus, !!invoiceStatus);
}

/**
 * @deprecated Use getProcessingStatusLabel instead
 * Get status text for a processing status based on client workflow
 */
export function getClientProcessingStatusText(clientId?: string | null, processingStatus?: string): string {
  return getProcessingStatusLabel(clientId, processingStatus);
}

/**
 * @deprecated Use isInvoiceStatusFinal instead
 * Check if a processing status is the final/complete state for a client
 */
export function isClientWorkflowComplete(clientId?: string | null, processingStatus?: string): boolean {
  // Map processing status to invoice status for backward compatibility
  const invoiceStatusMap: Record<string, string> = {
    'MATCHED': 'Matched',
    'PARSE': clientId === 'CREST' ? 'Parsed' : 'Parsed',
    'ERROR': 'Error',
  };
  
  const invoiceStatus = processingStatus ? invoiceStatusMap[processingStatus] : undefined;
  return isInvoiceStatusFinal(clientId, invoiceStatus);
}
