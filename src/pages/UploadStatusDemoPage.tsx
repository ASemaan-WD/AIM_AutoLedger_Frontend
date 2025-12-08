import { UploadStatusCard } from '@/components/application/upload-status/upload-status-card';
import {
  uploadStatusFixtures,
  stateDescriptions,
  mockInvoiceAcme,
  mockInvoiceRBW,
  mockInvoiceGlobal,
} from '@/components/application/upload-status/fixtures';

/**
 * Upload Status Component Library
 *
 * This page serves as the central component library for all upload status card states.
 * 
 * MOCK DATA:
 * - Invoice 1 (Acme): Used for uploading, processing, connecting, success, exported
 * - Invoice 2 (RB&W): Used for success-with-caveats (has issues)
 * - Invoice 3 (Global): Used for error states (duplicate, no-match, error)
 * 
 * Update fixtures.ts to modify these examples.
 */
export default function UploadStatusDemoPage() {
  const handleAction = (action: string, state: string) => {
    console.log(`${action} clicked for ${state} state`);
  };

  return (
    <div className="h-full overflow-auto bg-primary">
      <div className="container mx-auto max-w-4xl p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-display-xs font-semibold text-primary mb-2">
            Upload Status Component Library
          </h1>
          <p className="text-md text-tertiary mb-6">
            Visual demonstrations of all upload and processing states. Update fixtures.ts to modify these examples.
          </p>
          
          {/* Mock Data Legend */}
          <div className="bg-secondary rounded-lg p-4 space-y-2">
            <h3 className="text-sm font-semibold text-primary">Mock Invoice Data</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="space-y-1">
                <span className="font-medium text-secondary">Invoice 1: {mockInvoiceAcme.vendor}</span>
                <p className="text-tertiary">{mockInvoiceAcme.amount} • Used for standard flow</p>
              </div>
              <div className="space-y-1">
                <span className="font-medium text-secondary">Invoice 2: {mockInvoiceRBW.vendor}</span>
                <p className="text-tertiary">{mockInvoiceRBW.amount} • Used for issues/caveats</p>
              </div>
              <div className="space-y-1">
                <span className="font-medium text-secondary">Invoice 3: {mockInvoiceGlobal.vendor}</span>
                <p className="text-tertiary">{mockInvoiceGlobal.amount} • Used for error states</p>
              </div>
            </div>
          </div>
        </div>

        {/* Demo Sections */}
        <div className="space-y-8">
          {/* Uploading State */}
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-primary mb-1">
                {stateDescriptions.uploading.title}
              </h2>
              <p className="text-sm text-tertiary">{stateDescriptions.uploading.description}</p>
            </div>
            <UploadStatusCard
              {...uploadStatusFixtures.uploading}
              onCancel={() => handleAction('Cancel', 'uploading')}
            />
          </div>

          {/* Processing State */}
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-primary mb-1">
                {stateDescriptions.processing.title}
              </h2>
              <p className="text-sm text-tertiary">{stateDescriptions.processing.description}</p>
            </div>
            <UploadStatusCard
              {...uploadStatusFixtures.processing}
              onCancel={() => handleAction('Cancel', 'processing')}
              onViewFile={() => handleAction('View File', 'processing')}
            />
          </div>

          {/* Connecting/Matching State */}
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-primary mb-1">
                {stateDescriptions.connecting.title}
              </h2>
              <p className="text-sm text-tertiary">{stateDescriptions.connecting.description}</p>
            </div>
            <UploadStatusCard
              {...uploadStatusFixtures.connecting}
              onCancel={() => handleAction('Cancel', 'connecting')}
              onViewFile={() => handleAction('View File', 'connecting')}
            />
          </div>

          {/* Success State */}
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-primary mb-1">
                {stateDescriptions.success.title}
              </h2>
              <p className="text-sm text-tertiary">{stateDescriptions.success.description}</p>
            </div>
            <UploadStatusCard
              {...uploadStatusFixtures.success}
              onCancel={() => handleAction('Cancel', 'success')}
              onExport={() => handleAction('Export', 'success')}
              onRemove={() => handleAction('Remove', 'success')}
              onViewFile={() => handleAction('View File', 'success')}
            />
          </div>

          {/* Success with Caveats State */}
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-primary mb-1">
                {stateDescriptions.successWithCaveats.title}
              </h2>
              <p className="text-sm text-tertiary">{stateDescriptions.successWithCaveats.description}</p>
            </div>
            <UploadStatusCard
              {...uploadStatusFixtures.successWithCaveats}
              onCancel={() => handleAction('Cancel', 'success-with-caveats')}
              onExport={() => handleAction('Export', 'success-with-caveats')}
              onRemove={() => handleAction('Remove', 'success-with-caveats')}
              onViewFile={() => handleAction('View File', 'success-with-caveats')}
              onReprocess={() => handleAction('Reprocess', 'success-with-caveats')}
              onContactVendor={() => handleAction('Contact Vendor', 'success-with-caveats')}
            />
          </div>

          {/* Exported State */}
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-primary mb-1">
                {stateDescriptions.exported.title}
              </h2>
              <p className="text-sm text-tertiary">{stateDescriptions.exported.description}</p>
            </div>
            <UploadStatusCard
              {...uploadStatusFixtures.exported}
              onViewFile={() => handleAction('View File', 'exported')}
            />
          </div>

          {/* Error State */}
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-primary mb-1">
                {stateDescriptions.error.title}
              </h2>
              <p className="text-sm text-tertiary">{stateDescriptions.error.description}</p>
            </div>
            <UploadStatusCard
              {...uploadStatusFixtures.error}
              onRemove={() => handleAction('Remove', 'error')}
              onGetHelp={() => handleAction('Get Help', 'error')}
              onViewFile={() => handleAction('View File', 'error')}
            />
          </div>

          {/* Processing Error State */}
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-primary mb-1">
                {stateDescriptions.processingError.title}
              </h2>
              <p className="text-sm text-tertiary">{stateDescriptions.processingError.description}</p>
            </div>
            <UploadStatusCard
              {...uploadStatusFixtures.processingError}
              onRemove={() => handleAction('Remove', 'processing-error')}
              onGetHelp={() => handleAction('Get Help', 'processing-error')}
              onViewFile={() => handleAction('View File', 'processing-error')}
            />
          </div>

          {/* Duplicate State */}
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-primary mb-1">
                {stateDescriptions.duplicate.title}
              </h2>
              <p className="text-sm text-tertiary">{stateDescriptions.duplicate.description}</p>
            </div>
            <UploadStatusCard
              {...uploadStatusFixtures.duplicate}
              onRemove={() => handleAction('Remove', 'duplicate')}
              onGetHelp={() => handleAction('Get Help', 'duplicate')}
              onViewFile={() => handleAction('View File', 'duplicate')}
            />
          </div>

          {/* No Match State */}
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-primary mb-1">
                {stateDescriptions.noMatch.title}
              </h2>
              <p className="text-sm text-tertiary">{stateDescriptions.noMatch.description}</p>
            </div>
            <UploadStatusCard
              {...uploadStatusFixtures.noMatch}
              onRemove={() => handleAction('Remove', 'no-match')}
              onGetHelp={() => handleAction('Get Help', 'no-match')}
              onViewFile={() => handleAction('View File', 'no-match')}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
