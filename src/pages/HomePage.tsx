import { useState, useEffect, useMemo } from 'react';
import { FileUpload } from '@/components/application/file-upload/file-upload-base';
import { UploadStatusCard } from '@/components/application/upload-status/upload-status-card';
import { Accordion } from '@/components/application/accordion/accordion';
import { Badge } from '@/components/base/badges/badges';
import { useFilesPolling } from '@/hooks/use-files-polling';
import { getGreeting } from '@/lib/invoice-helpers';
import { stateGroups } from '@/config/upload-states';
import type { UploadedFile } from '@/types/upload-file';

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function HomePage() {
  const [greeting, setGreeting] = useState<string>('Hello');
  
  // Use custom hook for file management and polling
  const { files, uploadFiles, deleteFile, fetchExistingFiles } = useFilesPolling();

  // Set greeting only on client side
  useEffect(() => {
    setGreeting(getGreeting());
  }, []);

  // Fetch existing files on mount
  useEffect(() => {
    fetchExistingFiles();
  }, [fetchExistingFiles]);

  const handleAction = (action: string, fileId: string) => {
    if (action === 'Remove' || action === 'Cancel') {
      deleteFile(fileId);
    } else {
      console.log(`${action} triggered for file ${fileId}`);
    }
  };

  // Group and sort files by state
  const groupedFiles = useMemo(() => {
    const groups: Map<string, UploadedFile[]> = new Map();

    stateGroups.forEach(group => {
      groups.set(group.id, []);
    });

    files.forEach(file => {
      const group = stateGroups.find(g => g.statuses.includes(file.status));
      if (group) {
        const groupFiles = groups.get(group.id) || [];
        groupFiles.push(file);
        groups.set(group.id, groupFiles);
      } else {
        // Fallback for unknown statuses
        const activeGroup = groups.get('active');
        activeGroup?.push(file);
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

  return (
    <div className="h-full overflow-auto bg-primary">
      <div className="container mx-auto max-w-4xl p-6">
        {/* Greeting Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-secondary mb-2">{greeting}, Sherry</h1>
          <p className="text-tertiary">
            Upload your documents to get started with automated invoice processing.
          </p>
        </div>

        {/* Upload Area */}
        <FileUpload.Root>
          <FileUpload.DropZone
            hint="PDF and image files accepted up to 50MB"
            maxSize={50 * 1024 * 1024}
            allowsMultiple={true}
            accept="image/*,application/pdf"
            onDropFiles={uploadFiles}
            onDropUnacceptedFiles={(rejectedFiles) => {
              console.log('Rejected files:', rejectedFiles);
            }}
            onSizeLimitExceed={(oversizedFiles) => {
              console.log('Oversized files:', oversizedFiles);
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
              defaultExpanded={['active', 'needs-review', 'errors']}
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
                            filename={file.name}
                            status={file.status}
                            processingStatus={file.processingStatus as any}
                            pageCount={file.pageCount}
                            fileSize={file.size}
                            invoices={file.invoices}
                            issues={file.issues}
                            detailedIssues={file.detailedIssues}
                            analysisSummary={file.analysisSummary}
                            varianceInfo={file.varianceInfo}
                            errorCode={file.errorCode}
                            errorMessage={file.errorDescription}
                            duplicateInfo={file.duplicateInfo ? {
                                originalFilename: 'Original File', // We might want to pass this if available
                                uploadedDate: 'Previously'
                            } : undefined}
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
      </div>
    </div>
  );
}
