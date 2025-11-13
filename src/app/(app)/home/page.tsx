"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FileUpload } from "@/components/application/file-upload/file-upload-base";
import { Button } from "@/components/base/buttons/button";
import { Folder, RefreshCw05 } from "@untitledui/icons";

interface UploadedFile {
    id: string;
    name: string;
    size: number;
    progress: number;
    failed?: boolean;
    type?: string;
    isDuplicate?: boolean;
    duplicateInfo?: Record<string, unknown>;
    errorCode?: string;
    errorDescription?: string;
    errorLink?: string;
}

// Helper function to get time-based greeting
function getGreeting() {
    const hour = new Date().getHours();
    
    if (hour < 12) {
        return "Good morning";
    } else if (hour < 18) {
        return "Good afternoon";
    } else {
        return "Good evening";
    }
}

export default function HomePage() {
    const [files, setFiles] = useState<UploadedFile[]>([]);
    const [greeting, setGreeting] = useState<string>("Hello");
    const router = useRouter();

    // Set greeting only on client side to avoid hydration mismatch
    useEffect(() => {
        setGreeting(getGreeting());
    }, []);

    // Check if all files are uploaded
    const allFilesComplete = useMemo(() => {
        return files.length > 0 && files.every(file => file.progress === 100 && !file.failed);
    }, [files]);

    // Check if any files are currently uploading
    const hasActiveUploads = useMemo(() => {
        return files.some(file => file.progress < 100 && !file.failed);
    }, [files]);

    // Check if any files are duplicates
    const hasDuplicates = useMemo(() => {
        return files.some(file => file.isDuplicate);
    }, [files]);

    const uploadFiles = async (uploadedFiles: FileList) => {
        const newFiles: UploadedFile[] = Array.from(uploadedFiles).map((file) => ({
            id: Math.random().toString(36).substr(2, 9),
            name: file.name,
            size: file.size,
            progress: 0,
            type: file.type,
        }));

        setFiles((prev) => [...prev, ...newFiles]);

        // Upload each file to the API
        for (const uploadFile of newFiles) {
            try {
                // Get the actual File object
                const actualFile = Array.from(uploadedFiles).find(f => f.name === uploadFile.name);
                if (!actualFile) continue;

                // Create FormData for upload
                const formData = new FormData();
                formData.append('file', actualFile);

                // Start upload
                setFiles(prev => prev.map(f => 
                    f.id === uploadFile.id ? { ...f, progress: 10 } : f
                ));

                // Upload to API
                const response = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData,
                });

                if (!response.ok) {
                    throw new Error(`Upload failed: ${response.statusText}`);
                }

                const result = await response.json();
                
                if (result.success) {
                    // Upload successful
                    setFiles(prev => prev.map(f => 
                        f.id === uploadFile.id ? { 
                            ...f, 
                            progress: 100,
                            isDuplicate: result.isDuplicate,
                            duplicateInfo: result.duplicateInfo,
                            errorCode: result.airtableRecord?.fields?.['Error-Code'],
                            errorDescription: result.airtableRecord?.fields?.['Error-Description'],
                            errorLink: result.airtableRecord?.fields?.['Error-Link']
                        } : f
                    ));
                    console.log('File uploaded successfully:', result);
                    
                    if (result.isDuplicate) {
                        console.warn('Duplicate file detected:', result.duplicateInfo);
                    }
                } else {
                    throw new Error(result.error || 'Upload failed');
                }

            } catch (error) {
                console.error('Upload error:', error);
                setFiles(prev => prev.map(f => 
                    f.id === uploadFile.id ? { ...f, failed: true, progress: 0 } : f
                ));
            }
        }
    };

    const handleDelete = (fileId: string) => {
        setFiles((prev) => prev.filter((f) => f.id !== fileId));
    };

    const handleRetry = (fileId: string) => {
        setFiles((prev) =>
            prev.map((f) =>
                f.id === fileId ? { ...f, failed: false, progress: 0 } : f
            )
        );

        // Restart upload simulation
        const interval = setInterval(() => {
            setFiles((prev) =>
                prev.map((f) => {
                    if (f.id === fileId) {
                        const newProgress = Math.min(f.progress + Math.random() * 30, 100);
                        if (newProgress === 100) {
                            clearInterval(interval);
                        }
                        return { ...f, progress: newProgress };
                    }
                    return f;
                })
            );
        }, 200);
    };

    return (
        <div className="h-full overflow-auto bg-primary">
            <div className="container mx-auto max-w-4xl p-6">
                {/* Greeting Section */}
                <div className="mb-8">
                    <h1 className="text-3xl font-semibold text-secondary mb-2">
                        {greeting}, Gary
                    </h1>
                    <p className="text-tertiary">
                        Upload your documents to get started with automated invoice processing.
                    </p>
                </div>

                {/* Upload Area */}
                <FileUpload.Root>
                    <FileUpload.DropZone
                        hint="All document types accepted - PDF, DOC, XLS, images, and more up to 50MB"
                        maxSize={50 * 1024 * 1024} // 50MB
                        allowsMultiple={false}
                        onDropFiles={uploadFiles}
                        onDropUnacceptedFiles={(rejectedFiles) => {
                            console.log("Rejected files:", rejectedFiles);
                            // Handle rejected files (show error message, etc.)
                        }}
                        onSizeLimitExceed={(oversizedFiles) => {
                            console.log("Oversized files:", oversizedFiles);
                            // Handle oversized files (show error message, etc.)
                        }}
                    />

                    {files.length > 0 && (
                        <div>
                            <h2 className="text-lg font-medium text-secondary mb-4 mt-6">
                                Recently Uploaded
                            </h2>

                            {/* Status Messages - Below "Recently Uploaded" header */}
                            {hasActiveUploads && (
                                <div className="bg-brand-50 border border-brand-200 rounded-lg p-4 mb-4">
                                    <div className="flex items-center gap-3">
                                        <RefreshCw05 className="size-5 text-brand-600 animate-spin" />
                                        <div>
                                            <p className="text-sm font-medium text-brand-800">Uploading</p>
                                            <p className="text-sm text-brand-700">
                                                Please keep this page open while your file is uploading.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {allFilesComplete && !hasDuplicates && (
                                <div className="bg-success-50 border border-success-200 rounded-lg p-6 mb-4">
                                    <div className="flex flex-col gap-4">
                                        <div className="text-center">
                                            <p className="text-lg font-semibold text-success-900 mb-2">Uploaded</p>
                                            <p className="text-sm text-success-700">
                                                Your file has been successfully uploaded and is ready to view.
                                            </p>
                                        </div>
                                        <div className="flex justify-center">
                                            <Button 
                                                color="primary" 
                                                size="lg"
                                                iconLeading={Folder}
                                                onClick={() => router.push('/files')}
                                            >
                                                View File
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <FileUpload.List>
                                {files.map((file) => (
                                    <FileUpload.ListItemProgressBar
                                        key={file.id}
                                        name={file.name}
                                        size={file.size}
                                        progress={file.progress}
                                        failed={file.failed}
                                        isDuplicate={file.isDuplicate}
                                        errorCode={file.errorCode}
                                        errorDescription={file.errorDescription}
                                        errorLink={file.errorLink}
                                        onDelete={() => handleDelete(file.id)}
                                        onRetry={() => handleRetry(file.id)}
                                    />
                                ))}
                            </FileUpload.List>
                        </div>
                    )}
                </FileUpload.Root>
            </div>
        </div>
    );
}

