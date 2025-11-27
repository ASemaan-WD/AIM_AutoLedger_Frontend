import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CompactFilesList } from '@/components/documents/compact-files-list';
import { PDFViewer } from '@/components/documents/pdf-viewer';
import { FileDetailsPanel } from '@/components/documents/file-details-panel';
import { useFiles } from '@/lib/airtable/files-hooks';
import { useFilePolling } from '@/lib/airtable/use-file-polling';
import type { AirtableFile } from '@/lib/airtable/files-hooks';

function FilesPageContent() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [selectedFileId, setSelectedFileId] = useState<string>('');
  const [subView, setSubView] = useState('all');
  const [activeTab, setActiveTab] = useState('overview');

  // Use Airtable hook for files
  const { files, loading, error, updateFile, deleteFile, archiveFile, updateFilesInPlace } =
    useFiles({
      autoFetch: true,
    });

  // Poll for file updates every 8 seconds
  const handleUpdatesDetected = useCallback(
    (updatedFiles: AirtableFile[]) => {
      console.log(`🔄 Detected ${updatedFiles.length} file(s) with recent status changes`);

      // Update files in place without re-fetching (no flicker)
      updateFilesInPlace(updatedFiles);

      // Log the updated file IDs for debugging
      updatedFiles.forEach((file) => {
        console.log(`  - File ${file.id}: Status updated`);
      });
    },
    [updateFilesInPlace]
  );

  const { updatedFileIds, isPolling, lastPollTime } = useFilePolling({
    interval: 8000, // Poll every 8 seconds
    updateWindow: 10000, // Check for updates in past 10 seconds
    enabled: true,
    onUpdatesDetected: handleUpdatesDetected,
  });

  // Sync URL with selectedFileId
  useEffect(() => {
    const urlFileId = searchParams.get('id');
    if (urlFileId && urlFileId !== selectedFileId) {
      setSelectedFileId(urlFileId);
    }
  }, [searchParams, selectedFileId]);

  // Update URL when selectedFileId changes
  const updateSelectedFileId = (fileId: string) => {
    setSelectedFileId(fileId);

    if (fileId) {
      setSearchParams({ id: fileId });
    } else {
      setSearchParams({});
    }
  };

  const selectedFile = files.find((file) => file.id === selectedFileId);

  // Helper function to check if a file has blocking issues
  const hasBlockingIssues = (file: AirtableFile) => {
    // Files need attention if they're in attention state or are duplicates
    return file.status === 'Attention' || file.isDuplicate;
  };

  // Get the filtered and sorted files that match what the UI shows
  const filteredFiles = files
    .filter((file) => {
      // Apply sub-view filter
      switch (subView) {
        case 'needs_attention':
          return hasBlockingIssues(file);
        case 'queued':
          return file.status === 'Queued';
        case 'processing':
          return file.status === 'Processing';
        case 'processed':
          return file.status === 'Processed';
        case 'error':
          return file.status === 'Attention';
        case 'linked':
          return file.isLinked;
        case 'duplicates':
          return file.isDuplicate;
        default:
          return true;
      }
    })
    .sort((a, b) => {
      // Sort by blocking issues first (most urgent)
      const aHasIssues = hasBlockingIssues(a);
      const bHasIssues = hasBlockingIssues(b);

      if (aHasIssues && !bHasIssues) return -1;
      if (!aHasIssues && bHasIssues) return 1;

      // Then by status priority (Error -> Attention -> Processing -> Queued -> Processed)
      const statusPriority = {
        Error: 5,
        Attention: 4,
        Processing: 3,
        Queued: 2,
        Processed: 1,
      };
      const aPriority = statusPriority[a.status] || 0;
      const bPriority = statusPriority[b.status] || 0;

      if (aPriority !== bPriority) {
        return bPriority - aPriority;
      }

      // Then by upload date (most recent first)
      if (a.uploadDate && b.uploadDate) {
        return b.uploadDate.getTime() - a.uploadDate.getTime();
      }
      if (a.uploadDate && !b.uploadDate) return -1;
      if (!a.uploadDate && b.uploadDate) return 1;

      // Finally by name
      return a.name.localeCompare(b.name);
    });

  // Set initial selection when files load - use filtered files
  useEffect(() => {
    if (filteredFiles.length > 0 && !selectedFileId) {
      updateSelectedFileId(filteredFiles[0].id);
    }
  }, [filteredFiles.length > 0 && !selectedFileId]);

  const handleFileUpdate = async (updatedFile: AirtableFile) => {
    try {
      await updateFile(updatedFile.id, updatedFile);
    } catch (err) {
      console.error('Failed to update file:', err);
    }
  };

  // Status change handlers
  const handleMarkAsLinked = async (file: AirtableFile) => {
    try {
      await updateFile(file.id, { status: 'Processed' });
    } catch (err) {
      console.error('Failed to mark as linked:', err);
    }
  };

  const handleMarkAsNeedsAttention = async (file: AirtableFile) => {
    try {
      await updateFile(file.id, { status: 'Attention' });
    } catch (err) {
      console.error('Failed to mark as needs attention:', err);
    }
  };

  const handleArchive = async (file: AirtableFile) => {
    try {
      await archiveFile(file.id);
    } catch (err) {
      console.error('Failed to archive file:', err);
    }
  };

  const handleDelete = async (file: AirtableFile) => {
    try {
      await deleteFile(file.id);

      // Clear selection if deleted file was selected
      if (selectedFileId === file.id) {
        const remainingFiles = files.filter((f) => f.id !== file.id);
        updateSelectedFileId(remainingFiles.length > 0 ? remainingFiles[0].id : '');
      }
    } catch (err) {
      console.error('Failed to delete file:', err);
    }
  };

  const handleReprocess = async (file: AirtableFile) => {
    try {
      // Reset file status to queued for reprocessing
      await updateFile(file.id, {
        status: 'Queued',
        relatedInvoices: [], // Clear existing links
      });
    } catch (error) {
      console.error('Failed to reprocess file:', error);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading files...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load files: {error}</p>
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
  if (files.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📁</div>
          <h2 className="text-xl font-semibold text-primary mb-2">No Files</h2>
          <p className="text-tertiary">No files found. Upload some documents to get started.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full overflow-hidden min-h-0">
      {/* Left Column - Compact Files List */}
      <div className="flex-shrink-0 h-full">
        <CompactFilesList
          files={files}
          filteredFiles={filteredFiles}
          selectedFileId={selectedFileId}
          onSelectionChange={updateSelectedFileId}
          subView={subView}
          onSubViewChange={setSubView}
        />
      </div>

      {/* Center Column - PDF Viewer */}
      <div className="flex-1 min-w-0 overflow-hidden h-full">
        <PDFViewer document={selectedFile} />
      </div>

      {/* Right Column - File Details */}
      <div className="flex-shrink-0 h-full">
        <FileDetailsPanel
          file={selectedFile}
          onDelete={handleDelete}
          onReprocess={handleReprocess}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </div>
    </div>
  );
}

export default function FilesPage() {
  return <FilesPageContent />;
}

