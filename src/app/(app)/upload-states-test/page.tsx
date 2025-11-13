"use client";

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

/**
 * Test page to visualize different upload states
 * States covered:
 * 1. Empty state (no files)
 * 2. Uploading state (file in progress)
 * 3. Success state (file uploaded successfully)
 * 4. Error state (upload failed)
 */
export default function UploadStatesTestPage() {
    // Mock data for different states
    const emptyFiles: UploadedFile[] = [];
    
    const uploadingFiles: UploadedFile[] = [
        {
            id: "1",
            name: "Invoice-2024-001.pdf",
            size: 2456789,
            progress: 45,
            type: "application/pdf",
        }
    ];

    const successFiles: UploadedFile[] = [
        {
            id: "1",
            name: "Invoice-2024-001.pdf",
            size: 2456789,
            progress: 100,
            type: "application/pdf",
        }
    ];

    const duplicateFiles: UploadedFile[] = [
        {
            id: "1",
            name: "Invoice-2024-001.pdf",
            size: 2456789,
            progress: 100,
            type: "application/pdf",
            isDuplicate: true,
            errorCode: "DUPLICATE_FILE",
            errorDescription: "This file has already been uploaded",
            errorLink: "/home?file=rec123456789",
        }
    ];

    const errorFiles: UploadedFile[] = [
        {
            id: "1",
            name: "Invoice-2024-001.pdf",
            size: 2456789,
            progress: 0,
            failed: true,
            type: "application/pdf",
        }
    ];

    const renderState = (title: string, files: UploadedFile[], description: string) => {
        const allFilesComplete = files.length > 0 && files.every(file => file.progress === 100 && !file.failed);
        const hasActiveUploads = files.some(file => file.progress < 100 && !file.failed);
        const hasDuplicates = files.some(file => file.isDuplicate);

        return (
            <div className="mb-12 p-6 border-2 border-dashed border-secondary rounded-lg">
                <h2 className="text-xl font-bold text-secondary mb-2">{title}</h2>
                <p className="text-sm text-tertiary mb-6">{description}</p>
                
                <div className="bg-primary p-4 rounded-lg">
                    <div className="mb-8">
                        <h1 className="text-2xl font-semibold text-secondary mb-2">Upload File</h1>
                        <p className="text-tertiary mb-4">
                            Upload your document or invoice. Drag and drop a file or click to browse.
                        </p>
                    </div>

                    <FileUpload.Root>
                        <FileUpload.DropZone
                            hint="All document types accepted - PDF, DOC, XLS, images, and more up to 50MB"
                            maxSize={50 * 1024 * 1024}
                            allowsMultiple={false}
                            onDropFiles={() => {}}
                            isDisabled={true}
                        />

                        {files.length > 0 && (
                            <div className="mt-6">
                                <h2 className="text-lg font-medium text-secondary mb-4">
                                    Recently Uploaded
                                </h2>
                                
                                {/* Uploading Status Box - Only show when actively uploading */}
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

                                {/* Success Status Box - Only show when upload complete and NOT duplicate */}
                                {allFilesComplete && !hasDuplicates && (
                                    <div className="bg-success-50 border border-success-200 rounded-lg p-6 mb-4">
                                        <div className="flex flex-col gap-4">
                                            <div className="text-center">
                                                <p className="text-lg font-semibold text-success-900 mb-2">Uploaded</p>
                                                <p className="text-sm text-success-700">
                                                    Your file has been successfully uploaded.
                                                </p>
                                            </div>
                                            <div className="flex justify-center">
                                                <Button 
                                                    color="primary" 
                                                    size="lg"
                                                    iconLeading={Folder}
                                                    onClick={() => {}}
                                                >
                                                    View File
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* File List */}
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
                                            onDelete={() => {}}
                                            onRetry={() => {}}
                                        />
                                    ))}
                                </FileUpload.List>
                            </div>
                        )}
                    </FileUpload.Root>
                </div>
            </div>
        );
    };

    return (
        <div className="h-full overflow-auto bg-primary">
            <div className="container mx-auto max-w-6xl p-6">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-secondary mb-2">Upload States Test Page</h1>
                    <p className="text-tertiary">
                        This page shows all possible upload states for review and testing.
                    </p>
                </div>

                {renderState(
                    "State 1: Empty / Initial State",
                    emptyFiles,
                    "No files uploaded yet. Only the drop zone is visible."
                )}

                {renderState(
                    "State 2: Uploading State",
                    uploadingFiles,
                    "File is currently being uploaded. Shows purple 'Uploading' box with spinner directly below 'Recently Uploaded' heading, followed by the file progress bar."
                )}

                {renderState(
                    "State 3: Success State",
                    successFiles,
                    "File uploaded successfully. Shows green 'Uploaded' box with 'View File' CTA button centered below text, followed by the completed file item."
                )}

                {renderState(
                    "State 4: Duplicate File State",
                    duplicateFiles,
                    "File is a duplicate of an existing file. Shows green 'Uploaded' box with 'View File' button, and the file item displays warning with link to original."
                )}

                {renderState(
                    "State 5: Error State",
                    errorFiles,
                    "Upload failed. No status box shown - only the failed file item with retry option is displayed."
                )}
            </div>
        </div>
    );
}

