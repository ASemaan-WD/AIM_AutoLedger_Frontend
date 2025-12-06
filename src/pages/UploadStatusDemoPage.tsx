import { UploadStatusCard } from '@/components/application/upload-status/upload-status-card';
import {
  uploadStatusFixtures,
  stateDescriptions,
} from '@/components/application/upload-status/fixtures';

/**
 * Upload Status Component Library
 *
 * This page serves as the central component library for all upload status card states.
 * Update the fixtures.ts file to see changes reflected here and in all implementations.
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
          <p className="text-md text-tertiary">
            Visual demonstrations of all upload and processing states. Update fixtures.ts to modify these
            examples.
          </p>
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
            />
          </div>

          {/* Connecting/Analyzing State */}
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

