import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CompactInvoiceList } from '@/components/documents/compact-invoice-list';
import { PDFViewer } from '@/components/documents/pdf-viewer';
import { DocumentDetailsPanel } from '@/components/documents/document-details-panel';
import { useInvoices } from '@/lib/airtable';
import { useInvoicePolling } from '@/lib/airtable/use-invoice-polling';
import {
  hasBlockingIssues,
  sortInvoicesByPriority,
  validateInvoice,
  getMissingFieldsMessage,
} from '@/utils/invoice-validation';
import type { Invoice } from '@/types/documents';

function InvoicesPageContent() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>('');
  const [subView, setSubView] = useState('all');
  const [activeTab, setActiveTab] = useState('extracted');

  // Use Airtable hook for invoices
  const { invoices, loading, error, updateInvoice, updateInvoicesInPlace } = useInvoices({
    autoFetch: true,
  });

  // Poll for invoice updates every 8 seconds
  const handleUpdatesDetected = useCallback(
    (updatedInvoices: Invoice[]) => {
      console.log(`🔄 Detected ${updatedInvoices.length} invoice(s) with recent status changes`);

      // Update invoices in place without re-fetching (no flicker)
      updateInvoicesInPlace(updatedInvoices);

      // Log the updated invoice IDs for debugging
      updatedInvoices.forEach((inv) => {
        console.log(`  - Invoice ${inv.id}: Status updated`);
      });
    },
    [updateInvoicesInPlace]
  );

  const { updatedInvoiceIds, isPolling, lastPollTime } = useInvoicePolling({
    interval: 8000, // Poll every 8 seconds
    updateWindow: 10000, // Check for updates in past 10 seconds
    enabled: true,
    onUpdatesDetected: handleUpdatesDetected,
  });

  // Sync URL with selectedInvoiceId
  useEffect(() => {
    const urlInvoiceId = searchParams.get('id');
    if (urlInvoiceId && urlInvoiceId !== selectedInvoiceId) {
      setSelectedInvoiceId(urlInvoiceId);
    }
  }, [searchParams, selectedInvoiceId]);

  // Update URL when selectedInvoiceId changes
  const updateSelectedInvoiceId = (invoiceId: string) => {
    setSelectedInvoiceId(invoiceId);

    if (invoiceId) {
      setSearchParams({ id: invoiceId });
    } else {
      setSearchParams({});
    }
  };

  const selectedInvoice = invoices.find((inv) => inv.id === selectedInvoiceId);

  // Get the filtered and sorted invoices that match what the UI shows
  const filteredInvoices = sortInvoicesByPriority(
    invoices.filter((invoice) => {
      // Apply sub-view filter
      switch (subView) {
        case 'missing_fields':
          return hasBlockingIssues(invoice);
        case 'open':
          return invoice.status === 'open';
        case 'pending':
          return invoice.status === 'pending';
        case 'approved':
          return invoice.status === 'approved';
        case 'rejected':
          return invoice.status === 'rejected';
        case 'exported':
          return invoice.status === 'exported';
        default:
          return true;
      }
    })
  ) as Invoice[]; // Cast since we know these are all invoices

  // Set initial selection when invoices load - use filtered invoices
  useEffect(() => {
    if (filteredInvoices.length > 0 && !selectedInvoiceId) {
      updateSelectedInvoiceId(filteredInvoices[0].id);
    }
  }, [filteredInvoices.length > 0 && !selectedInvoiceId]);

  const handleInvoiceUpdate = async (updatedInvoice: Invoice) => {
    try {
      await updateInvoice(updatedInvoice.id, updatedInvoice);
    } catch (err) {
      console.error('Failed to update invoice:', err);
    }
  };

  // Status change handlers
  const handleSendForApproval = async (invoice: Invoice) => {
    try {
      // Validate required fields before marking as queued
      const validation = validateInvoice(invoice);
      if (!validation.canMarkAsReviewed) {
        const missingFieldsMessage = getMissingFieldsMessage(invoice);
        alert(`Cannot mark as queued. ${missingFieldsMessage}`);
        return;
      }

      // Optimistic update: immediately show Exporting status in UI
      updateInvoicesInPlace([
        {
          ...invoice,
          status: 'queued',
        },
      ]);

      // Actual API call to update status in Airtable
      await updateInvoice(invoice.id, { status: 'queued' });

      // The polling mechanism will confirm the update from Airtable
      // and show the visual indicator for recently updated invoices
    } catch (err) {
      console.error('Failed to mark as queued:', err);

      // Revert optimistic update on error by reverting to original status
      updateInvoicesInPlace([invoice]);

      // Show error to user
      alert('Failed to export invoice. Please try again.');
    }
  };

  const handleApprove = async (invoice: Invoice) => {
    try {
      await updateInvoice(invoice.id, { status: 'approved' });
    } catch (err) {
      console.error('Failed to approve invoice:', err);
    }
  };

  const handleReject = async (invoice: Invoice) => {
    try {
      await updateInvoice(invoice.id, { status: 'rejected' });
    } catch (err) {
      console.error('Failed to reject invoice:', err);
    }
  };

  const handleResendForApproval = async (invoice: Invoice) => {
    try {
      await updateInvoice(invoice.id, { status: 'pending' });
    } catch (err) {
      console.error('Failed to re-mark as queued:', err);
    }
  };

  const handleReopen = async (invoice: Invoice) => {
    try {
      await updateInvoice(invoice.id, { status: 'open' });
    } catch (err) {
      console.error('Failed to reopen invoice:', err);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading invoices...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load invoices: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Show empty state
  if (invoices.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No invoices found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full overflow-hidden min-h-0">
      {/* Left Column - Compact Invoice List */}
      <div className="flex-shrink-0 h-full">
        <CompactInvoiceList
          invoices={invoices}
          filteredInvoices={filteredInvoices}
          selectedInvoiceId={selectedInvoiceId}
          onSelectionChange={updateSelectedInvoiceId}
          subView={subView}
          onSubViewChange={setSubView}
          updatedInvoiceIds={updatedInvoiceIds}
        />
      </div>

      {/* Center Column - PDF Viewer */}
      <div className="flex-1 min-w-0 overflow-hidden h-full">
        <PDFViewer document={selectedInvoice} />
      </div>

      {/* Right Column - Document Details */}
      <div className="flex-shrink-0 h-full">
        <DocumentDetailsPanel
          document={selectedInvoice}
          onSave={handleInvoiceUpdate}
          onSendForApproval={handleSendForApproval}
          onApprove={handleApprove}
          onReject={handleReject}
          onResendForApproval={handleResendForApproval}
          onReopen={handleReopen}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          isRecentlyUpdated={updatedInvoiceIds.has(selectedInvoiceId)}
        />
      </div>
    </div>
  );
}

export default function InvoicesPage() {
  return <InvoicesPageContent />;
}

