import { useState, useEffect, useMemo } from 'react';
import { FileUpload } from '@/components/application/file-upload/file-upload-base';
import { UploadStatusCard, type UploadStatus } from '@/components/application/upload-status/upload-status-card';
import { Accordion } from '@/components/application/accordion/accordion';
import { Badge } from '@/components/base/badges/badges';
import { transformMockFilesToUI, type TransformedMockFile } from '@/components/application/upload-status/fixtures';

// =============================================================================
// STATE GROUP CONFIGURATION
// Defines the order and metadata for each state group
// Higher priority = appears higher on the page
// =============================================================================

interface StateGroupConfig {
  id: string;
  label: string;
  description: string;
  priority: number;
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
  
  // Use the transformed mock data - same format as real HomePage.tsx would use
  const [files] = useState<TransformedMockFile[]>(() => transformMockFilesToUI());

  useEffect(() => {
    setGreeting(getGreeting());
  }, []);

  // Group and sort files by state
  const groupedFiles = useMemo(() => {
    const groups: Map<string, TransformedMockFile[]> = new Map();

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
      groupFiles.sort((a, b) => {
        const aTime = a.createdAt?.getTime() ?? 0;
        const bTime = b.createdAt?.getTime() ?? 0;
        return bTime - aTime;
      });
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
            hint="PDF and image files accepted up to 50MB"
            maxSize={50 * 1024 * 1024}
            allowsMultiple={true}
            accept="image/*,application/pdf"
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
                            // Core props - same names as UploadStatusCardProps
                            filename={file.filename}
                            status={file.status}
                            processingStatus={file.processingStatus}
                            pageCount={file.pageCount}
                            fileSize={file.fileSize}
                            // Invoice data - transformed to UI format
                            invoices={file.invoices}
                            // Issues/warnings - derived from Airtable Warnings + Balance
                            issues={file.issues}
                            detailedIssues={file.detailedIssues}
                            analysisSummary={file.analysisSummary}
                            varianceInfo={file.varianceInfo}
                            // Error info
                            errorCode={file.errorCode}
                            errorMessage={file.errorMessage}
                            // Duplicate info
                            duplicateInfo={file.duplicateInfo}
                            // Callbacks
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
