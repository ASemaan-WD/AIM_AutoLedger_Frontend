import { useState, useEffect } from 'react';
import { FileUpload } from '@/components/application/file-upload/file-upload-base';
import { UploadStatusCard } from '@/components/application/upload-status/upload-status-card';
import type { UploadStatus } from '@/components/application/upload-status/upload-status-card';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  status: UploadStatus;
  pageCount?: number;
  invoices?: Array<{
    recordId: string;
    vendor: string;
    date: string;
    daysAgo: number;
    amount: string;
    description: string;
  }>;
  caveats?: string[];
  errorMessage?: string;
}

// Helper function to get time-based greeting
function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) {
    return 'Good morning';
  } else if (hour < 18) {
    return 'Good afternoon';
  } else {
    return 'Good evening';
  }
}

export default function Home2Page() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [greeting, setGreeting] = useState<string>('Hello');

  // Set greeting only on client side
  useEffect(() => {
    setGreeting(getGreeting());
  }, []);

  const uploadFiles = async (uploadedFiles: FileList) => {
    const newFiles: UploadedFile[] = Array.from(uploadedFiles).map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      status: 'uploading',
    }));

    setFiles((prev) => [...prev, ...newFiles]);

    // Simulate upload process for each file
    for (const uploadFile of newFiles) {
      try {
        // Simulate uploading phase (2 seconds)
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Move to processing
        setFiles((prev) =>
          prev.map((f) =>
            f.id === uploadFile.id ? { ...f, status: 'processing' as UploadStatus, pageCount: 4 } : f
          )
        );

        // Simulate processing phase (2 seconds)
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Move to connecting with invoice info
        setFiles((prev) =>
          prev.map((f) =>
            f.id === uploadFile.id
              ? {
                  ...f,
                  status: 'connecting' as UploadStatus,
                  invoices: [{
                    recordId: 'recSample' + uploadFile.id,
                    vendor: 'Acme Corporation',
                    date: 'Mar 15, 2024',
                    daysAgo: 5,
                    amount: '$2,450.00',
                    description: 'Fastener nuts assortment including SPAC HGLF Os, Lt, and SPL types',
                  }],
                }
              : f
          )
        );

        // Simulate connecting phase (2 seconds)
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Randomly decide on success or success with caveats
        const hasCaveats = Math.random() > 0.5;

        if (hasCaveats) {
          setFiles((prev) =>
            prev.map((f) =>
              f.id === uploadFile.id
                ? {
                    ...f,
                    status: 'success-with-caveats' as UploadStatus,
                    caveats: ['This invoice is 45 days old', 'No matching PO found in the system'],
                  }
                : f
            )
          );
        } else {
          setFiles((prev) =>
            prev.map((f) => (f.id === uploadFile.id ? { ...f, status: 'success' as UploadStatus } : f))
          );
        }
      } catch (error) {
        console.error('Upload error:', error);
        setFiles((prev) =>
          prev.map((f) =>
            f.id === uploadFile.id
              ? {
                  ...f,
                  status: 'error' as UploadStatus,
                  errorMessage:
                    'Unable to extract text from this document. The file may be corrupted or in an unsupported format.',
                }
              : f
          )
        );
      }
    }
  };

  const handleCancel = (fileId: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const handleExport = (fileId: string) => {
    console.log('Exporting file:', fileId);
    // Handle export logic
  };

  const handleRemove = (fileId: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const handleGetHelp = (fileId: string) => {
    console.log('Getting help for file:', fileId);
    // Handle get help logic
  };

  const handleViewFile = (fileId: string) => {
    console.log('Viewing file:', fileId);
    // Handle view file logic
  };

  return (
    <div className="h-full overflow-auto bg-primary">
      <div className="container mx-auto max-w-4xl p-6">
        {/* Greeting Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-secondary mb-2">{greeting}, Gary</h1>
          <p className="text-tertiary">
            Upload your documents to get started with automated invoice processing.
          </p>
        </div>

        {/* Upload Area */}
        <FileUpload.Root>
          <FileUpload.DropZone
            hint="All document types accepted - PDF, DOC, XLS, images, and more up to 50MB"
            maxSize={50 * 1024 * 1024} // 50MB
            allowsMultiple={true}
            onDropFiles={uploadFiles}
            onDropUnacceptedFiles={(rejectedFiles) => {
              console.log('Rejected files:', rejectedFiles);
            }}
            onSizeLimitExceed={(oversizedFiles) => {
              console.log('Oversized files:', oversizedFiles);
            }}
          />

          {files.length > 0 && (
            <div className="mt-6 space-y-4">
              <h2 className="text-lg font-medium text-secondary">Upload Progress</h2>

              {files.map((file) => (
                <UploadStatusCard
                  key={file.id}
                  filename={file.name}
                  status={file.status}
                  fileSize={file.size}
                  pageCount={file.pageCount}
                  invoices={file.invoices || []}
                  caveats={file.caveats}
                  errorMessage={file.errorMessage}
                  onCancel={() => handleCancel(file.id)}
                  onExport={() => handleExport(file.id)}
                  onRemove={() => handleRemove(file.id)}
                  onGetHelp={() => handleGetHelp(file.id)}
                  onViewFile={() => handleViewFile(file.id)}
                />
              ))}
            </div>
          )}
        </FileUpload.Root>
      </div>
    </div>
  );
}

