import { useState, useEffect, useMemo } from 'react';
import { FileUpload } from '@/components/application/file-upload/file-upload-base';
import { UploadStatusCard, type UploadStatus, type UploadStatusCardProps } from '@/components/application/upload-status/upload-status-card';
import { Accordion } from '@/components/application/accordion/accordion';
import { Badge } from '@/components/base/badges/badges';
import { uploadStatusFixtures } from '@/components/application/upload-status/fixtures';

// =============================================================================
// TYPES
// =============================================================================

interface MockFile extends Omit<UploadStatusCardProps, 'onCancel' | 'onExport' | 'onRemove' | 'onGetHelp' | 'onViewFile' | 'onReprocess' | 'onContactVendor'> {
  id: string;
  createdAt: Date;
}

// =============================================================================
// STATE GROUP CONFIGURATION
// Defines the order and metadata for each state group
// Higher priority = appears higher on the page
// =============================================================================

interface StateGroupConfig {
  id: string;
  label: string;
  description: string;
  priority: number; // Higher = appears first
  statuses: UploadStatus[];
  badgeColor: 'gray-blue' | 'brand' | 'success' | 'warning' | 'error';
}

const stateGroups: StateGroupConfig[] = [
  {
    id: 'active',
    label: 'In Progress',
    description: 'Files currently being uploaded or processed',
    priority: 100,
    statuses: ['uploading', 'queued', 'processing', 'connecting'],
    badgeColor: 'gray-blue',
  },
  {
    id: 'needs-review',
    label: 'Needs Review',
    description: 'Matched with issues that need your attention',
    priority: 90,
    statuses: ['success-with-caveats'],
    badgeColor: 'warning',
  },
  {
    id: 'ready',
    label: 'Ready to Export',
    description: 'Successfully processed and ready for export',
    priority: 80,
    statuses: ['success'],
    badgeColor: 'brand',
  },
  {
    id: 'errors',
    label: 'Errors',
    description: 'Files that encountered problems',
    priority: 70,
    statuses: ['error', 'processing-error', 'duplicate', 'no-match'],
    badgeColor: 'error',
  },
  {
    id: 'completed',
    label: 'Exported',
    description: 'Successfully exported to AIM',
    priority: 60,
    statuses: ['exported'],
    badgeColor: 'success',
  },
];

// =============================================================================
// MOCK DATA GENERATOR
// Uses existing fixtures directly with timestamps for sorting
// =============================================================================

function generateMockFiles(): MockFile[] {
  const now = new Date();
  
  // Helper to create dates relative to now
  const minutesAgo = (mins: number) => new Date(now.getTime() - mins * 60 * 1000);
  const hoursAgo = (hours: number) => new Date(now.getTime() - hours * 60 * 60 * 1000);
  const daysAgo = (days: number) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

  // Map existing fixtures to MockFile format with timestamps
  // Order determines relative time (first = most recent)
  return [
    // Active/Processing (most recent)
    { id: 'uploading', createdAt: minutesAgo(1), ...uploadStatusFixtures.uploading, pageCount: 6 },
    { id: 'processing', createdAt: minutesAgo(5), ...uploadStatusFixtures.processing },
    { id: 'connecting', createdAt: minutesAgo(8), ...uploadStatusFixtures.connecting },
    
    // Needs Review
    { id: 'successWithCaveats', createdAt: minutesAgo(15), ...uploadStatusFixtures.successWithCaveats },
    
    // Ready to Export
    { id: 'success', createdAt: hoursAgo(1), ...uploadStatusFixtures.success },
    
    // Errors
    { id: 'processingError', createdAt: hoursAgo(3), ...uploadStatusFixtures.processingError },
    { id: 'duplicate', createdAt: hoursAgo(5), ...uploadStatusFixtures.duplicate },
    { id: 'noMatch', createdAt: hoursAgo(6), ...uploadStatusFixtures.noMatch },
    { id: 'error', createdAt: hoursAgo(8), ...uploadStatusFixtures.error },
    
    // Exported (oldest)
    { id: 'exported', createdAt: daysAgo(1), ...uploadStatusFixtures.exported },
  ];
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function MockHomePage() {
  const [greeting, setGreeting] = useState<string>('Hello');
  const [files] = useState<MockFile[]>(generateMockFiles);

  useEffect(() => {
    setGreeting(getGreeting());
  }, []);

  // Group and sort files by state
  const groupedFiles = useMemo(() => {
    const groups: Map<string, MockFile[]> = new Map();

    // Initialize all groups
    stateGroups.forEach(group => {
      groups.set(group.id, []);
    });

    // Assign files to groups
    files.forEach(file => {
      const group = stateGroups.find(g => g.statuses.includes(file.status));
      if (group) {
        const groupFiles = groups.get(group.id) || [];
        groupFiles.push(file);
        groups.set(group.id, groupFiles);
      }
    });

    // Sort files within each group by createdAt (newest first)
    groups.forEach((groupFiles, groupId) => {
      groupFiles.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      groups.set(groupId, groupFiles);
    });

    return groups;
  }, [files]);

  // Get groups with files, sorted by priority
  const activeGroups = useMemo(() => {
    return stateGroups
      .filter(group => (groupedFiles.get(group.id) || []).length > 0)
      .sort((a, b) => b.priority - a.priority);
  }, [groupedFiles]);

  // Mock upload handler (does nothing but logs)
  const handleMockUpload = (uploadedFiles: FileList) => {
    console.log('🎭 [Mock] Upload triggered for:', Array.from(uploadedFiles).map(f => f.name));
    alert(`Mock upload: ${uploadedFiles.length} file(s) selected.\n\nThis is a demo page - no actual upload occurs.`);
  };

  // Mock action handlers
  const handleAction = (action: string, fileId: string) => {
    console.log(`🎭 [Mock] ${action} clicked for file: ${fileId}`);
  };

  return (
    <div className="h-full overflow-auto bg-primary">
      <div className="container mx-auto max-w-4xl p-6">
        {/* Greeting Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-secondary mb-2">{greeting}, Sherry</h1>
          <p className="text-tertiary">
            Upload your documents to get started with automated invoice processing.
          </p>
          <p className="text-xs text-quaternary mt-2 bg-utility-warning-50 text-utility-warning-700 px-3 py-1.5 rounded-md inline-block">
            🎭 Demo Mode — All data below is mocked. Uploads are simulated.
          </p>
        </div>

        {/* Upload Area (Mocked) */}
        <FileUpload.Root>
          <FileUpload.DropZone
            hint="All document types accepted - PDF, DOC, XLS, images, and more up to 50MB"
            maxSize={50 * 1024 * 1024}
            allowsMultiple={false}
            onDropFiles={handleMockUpload}
            onDropUnacceptedFiles={(rejectedFiles) => {
              console.log('🎭 [Mock] Rejected files:', rejectedFiles);
            }}
            onSizeLimitExceed={(oversizedFiles) => {
              console.log('🎭 [Mock] Oversized files:', oversizedFiles);
            }}
          />
        </FileUpload.Root>

        {/* Files by State Group */}
        {activeGroups.length > 0 && (
          <div className="mt-8">
            <Accordion.Root 
              allowMultiple 
              persistKey="upload-status-groups"
              className="space-y-2"
            >
              {activeGroups.map((group) => {
                const groupFiles = groupedFiles.get(group.id) || [];
                
                return (
                  <Accordion.Item key={group.id} id={group.id} itemCount={groupFiles.length}>
                    <Accordion.Trigger
                      badge={
                        <Badge size="sm" color={group.badgeColor} type="color">
                          {groupFiles.length}
                        </Badge>
                      }
                    >
                      {group.label}
                    </Accordion.Trigger>
                    <Accordion.Content>
                      <div className="space-y-4 pt-2">
                        {groupFiles.map((file) => (
                          <UploadStatusCard
                            key={file.id}
                            filename={file.filename}
                            status={file.status}
                            processingStatus={file.processingStatus}
                            pageCount={file.pageCount}
                            fileSize={file.fileSize}
                            invoices={file.invoices}
                            issues={file.issues}
                            detailedIssues={file.detailedIssues}
                            analysisSummary={file.analysisSummary}
                            varianceInfo={file.varianceInfo}
                            errorMessage={file.errorMessage}
                            duplicateInfo={file.duplicateInfo}
                            onCancel={() => handleAction('Cancel', file.id)}
                            onExport={() => handleAction('Export', file.id)}
                            onRemove={() => handleAction('Remove', file.id)}
                            onGetHelp={() => handleAction('Get Help', file.id)}
                            onViewFile={() => handleAction('View File', file.id)}
                            onReprocess={() => handleAction('Reprocess', file.id)}
                            onContactVendor={() => handleAction('Contact Vendor', file.id)}
                          />
                        ))}
                      </div>
                    </Accordion.Content>
                  </Accordion.Item>
                );
              })}
            </Accordion.Root>
          </div>
        )}

        {/* Empty State */}
        {activeGroups.length === 0 && (
          <div className="mt-12 text-center">
            <p className="text-tertiary">No files to display. Upload a document to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}

