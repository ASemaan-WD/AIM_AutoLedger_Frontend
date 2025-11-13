"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import type { Key } from "react";
import { parseDate, getLocalTimeZone } from "@internationalized/date";
import { Tabs, TabList, Tab, TabPanel } from "@/components/application/tabs/tabs";
import { Input } from "@/components/base/input/input";
import { FormField } from "@/components/base/input/form-field";
import { DatePicker } from "@/components/application/date-picker/date-picker";
import { Select } from "@/components/base/select/select";
import { Button } from "@/components/base/buttons/button";
import { ButtonUtility } from "@/components/base/buttons/button-utility";
import { Badge } from "@/components/base/badges/badges";
import { AlertTriangle, CheckCircle, Clock, User01, LinkExternal01, Trash01, Copy01, Mail01, File01, MessageChatCircle, FileCheck02, Receipt, CreditCard01, Package, Edit03, FileDownload02, HelpCircle, RefreshCcw01, DotsVertical } from "@untitledui/icons";
import { cx } from "@/utils/cx";
import { LinksTab, RawContentTab } from "@/components/documents/shared-tabs";
import { InvoiceCodingInterface } from "@/components/documents/invoice-coding-interface";
import { DialogTrigger, ModalOverlay, Modal, Dialog } from "@/components/application/modals/modal";
import { Dropdown } from "@/components/base/dropdown/dropdown";
import { PendingStateIndicator, BalanceAlert, QueuedIndicator, ErrorAlert, ExportedIndicator } from "@/components/documents/invoice-state-indicators";
// DEPRECATED: Teams table no longer exists in new schema
// import { useTeams } from "@/lib/airtable";
import { useDocumentLinks } from "@/lib/airtable/linked-documents-hooks";
import type { Invoice, DeliveryTicket, DocumentLink, StoreReceiver, DocumentStatus } from "@/types/documents";
import { INVOICE_STATUS, UX_STATUS_MAP, UX_STATUS_COLORS, INTERNAL_TO_AIRTABLE_STATUS, type UXStatus } from "@/lib/airtable/schema-types";
import { validateInvoice, getMissingFieldsMessage, isMultiLineMode } from "@/utils/invoice-validation";



interface DocumentDetailsPanelProps {
    document?: Invoice | DeliveryTicket | StoreReceiver;
    className?: string;
    onSave?: (document: Invoice | DeliveryTicket | StoreReceiver) => void;
    onSendForApproval?: (document: Invoice | DeliveryTicket | StoreReceiver) => void;
    onApprove?: (document: Invoice | DeliveryTicket | StoreReceiver) => void;
    onReject?: (document: Invoice | DeliveryTicket | StoreReceiver) => void;
    onReopen?: (document: Invoice | DeliveryTicket | StoreReceiver) => void;
    onResendForApproval?: (document: Invoice | DeliveryTicket | StoreReceiver) => void;
    onViewReason?: (document: Invoice | DeliveryTicket) => void;
    onViewInOracle?: (document: Invoice | DeliveryTicket) => void;
    onDelete?: (document: Invoice | DeliveryTicket) => void;
    activeTab?: string;
    onTabChange?: (tab: string) => void;
    isRecentlyUpdated?: boolean; // Indicator for recently updated invoices
}

const CompletenessChecker = ({ document }: { document?: Invoice }) => {
    if (!document) return null;

    // Don't show completeness checker for Pending state - use PendingStateIndicator instead
    if (document.status === 'pending') {
        return null;
    }

    // Use server-side validation from Airtable
    const issueMessage = getMissingFieldsMessage(document);

    // Hide alert if no issues (empty message means all fields are complete)
    if (!issueMessage || issueMessage.trim() === '') {
        return null;
    }

    return (
        <div className={cx(
            "rounded-lg border p-3 mb-4",
            "border-warning bg-warning-25 text-warning-700"
        )}>
            <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-warning-primary" />
                <span className="text-sm font-medium">
                    {isMultiLineMode(document) ? 'Issues Found' : 'Missing Required Fields'}
                </span>
            </div>
            <p className="text-xs">
                {issueMessage} — complete to continue
            </p>
        </div>
    );
};

// RejectionReasonBanner removed - now using ErrorAlert component from invoice-state-indicators

export const DocumentDetailsPanel = ({ 
    document, 
    className, 
    onSave,
    onSendForApproval,
    onApprove,
    onReject,
    onReopen,
    onResendForApproval,
    onViewReason,
    onViewInOracle,
    onDelete,
    activeTab = "extracted",
    onTabChange,
    isRecentlyUpdated = false
}: DocumentDetailsPanelProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedDocument, setEditedDocument] = useState<Invoice | DeliveryTicket | undefined>(document);
    const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
    const [editingVendorName, setEditingVendorName] = useState('');
    const [isUpdatingVendor, setIsUpdatingVendor] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    
    // Refs for scroll delegation
    const panelRef = useRef<HTMLDivElement>(null);
    const contentAreaRef = useRef<HTMLDivElement>(null);


    // Fetch linked documents (files and emails) for the current document
    // Determine document type and use appropriate hook
    const documentType = document?.type === 'delivery-tickets' ? 'delivery-ticket' : 'invoice';
    const { linkedItems, files, emails, loading: linkedDocsLoading, error: linkedDocsError } = useDocumentLinks(document?.id, documentType);

    // Keep panel state in sync with selected document
    useEffect(() => {
        setEditedDocument(document);
    }, [document]);

    // Handle scroll delegation - forward wheel events to content area
    useEffect(() => {
        const panel = panelRef.current;
        const contentArea = contentAreaRef.current;
        
        if (!panel || !contentArea) return;

        const handleWheel = (e: WheelEvent) => {
            // Only delegate scroll if the target is not already inside the scrollable content area
            const target = e.target as Element;
            const isInsideContentArea = contentArea.contains(target);
            
            // If the wheel event happened on the panel but not inside the scrollable content,
            // delegate it to the content area
            if (!isInsideContentArea && contentArea.scrollHeight > contentArea.clientHeight) {
                e.preventDefault();
                e.stopPropagation();
                contentArea.scrollBy({
                    top: e.deltaY,
                    behavior: 'auto'
                });
            }
        };

        panel.addEventListener('wheel', handleWheel, { passive: false });
        
        return () => {
            panel.removeEventListener('wheel', handleWheel);
        };
    }, []);

    // Helpers for date formatting/parsing for DatePicker component
    const formatDateValue = (date: Date | undefined) => {
        if (!date) return null;
        // Use local timezone consistently to avoid off-by-one day issues
        const y = date.getFullYear();
        const m = `${date.getMonth() + 1}`.padStart(2, '0');
        const d = `${date.getDate()}`.padStart(2, '0');
        return parseDate(`${y}-${m}-${d}`);
    };

    // Status display helpers
    // Map status to user-friendly display text
    const getDisplayStatus = (status: DocumentStatus): UXStatus => {
        // Convert internal status to Airtable status, then to display text
        const airtableStatus = INTERNAL_TO_AIRTABLE_STATUS[status] || 'Pending';
        return UX_STATUS_MAP[airtableStatus] || 'Processing';
    };

    const getStatusColor = (uxStatus: UXStatus) => {
        return UX_STATUS_COLORS[uxStatus] || 'gray';
    };

    // Dirty check: enable Save when edited fields differ from original
    const isDirty = useMemo(() => {
        if (!document || !editedDocument) return false;
        
        // Check all editable fields
        const fieldsToCheck: (keyof (Invoice | DeliveryTicket))[] = [
            "vendorName", "invoiceNumber", "invoiceDate", "amount", "freightCharge", "surcharge", "glAccount", "team"
        ];
        
        // Check top-level fields
        const topLevelChanged = fieldsToCheck.some((key) => {
            const originalValue = document[key];
            const editedValue = editedDocument[key];
            
            // Handle Date objects specially
            if (originalValue instanceof Date && editedValue instanceof Date) {
                return originalValue.getTime() !== editedValue.getTime();
            }
            
            // Handle array fields (like team) specially
            if (Array.isArray(originalValue) && Array.isArray(editedValue)) {
                if (originalValue.length !== editedValue.length) {
                    return true;
                }
                return originalValue.some((val, index) => val !== editedValue[index]);
            }
            
            // Handle array vs non-array comparison
            if (Array.isArray(originalValue) !== Array.isArray(editedValue)) {
                return true;
            }
            
            // Handle null/undefined equivalence
            if ((originalValue ?? "") !== (editedValue ?? "")) {
                return true;
            }
            
            return false;
        });
        
        // Check lines array for changes (multiline coding)
        const linesChanged = (() => {
            const originalLines = document.lines || [];
            const editedLines = editedDocument.lines || [];
            
            // Different number of lines
            if (originalLines.length !== editedLines.length) {
                return true;
            }
            
            // Check each line for changes
            return originalLines.some((originalLine, index) => {
                const editedLine = editedLines[index];
                if (!editedLine) return true;
                
                // Check line properties that can be edited
                return (
                    originalLine.description !== editedLine.description ||
                    originalLine.amount !== editedLine.amount ||
                    originalLine.id !== editedLine.id
                );
            });
        })();
        
        return topLevelChanged || linesChanged;
    }, [document, editedDocument]);

    const handleSave = async () => {
        if (!editedDocument || !onSave || isSaving || !isDirty) return;
        
        setIsSaving(true);
        try {
            await onSave(editedDocument);
            setIsEditing(false);
            // The parent component will update the document prop after saving,
            // which will trigger the useEffect to sync editedDocument
        } catch (error) {
            console.error('Failed to save invoice:', error);
            // TODO: Show error toast/notification to user
        } finally {
            setIsSaving(false);
        }
    };

    // Render state-specific indicators
    const renderStateIndicator = () => {
        if (!currentDoc) return null;

        const status = currentDoc.status;

        switch (status) {
            case 'pending':
                return <PendingStateIndicator />;

            case 'open':
                // Show balance alert if balance exists
                if (currentDoc.balance !== undefined && currentDoc.balance !== null && currentDoc.balance !== 0) {
                    return <BalanceAlert balance={currentDoc.balance} explanation={currentDoc.balanceExplanation} />;
                }
                return null;

            case 'reviewed':
            case 'queued':
            case 'approved':
                return <QueuedIndicator />;

            case 'exported':
                return <ExportedIndicator />;

            case 'rejected':
                return <ErrorAlert errorCode={currentDoc.errorCode} errorMessage={currentDoc.errorMessage} />;

            default:
                return null;
        }
    };

    // Render action buttons based on invoice status
    const renderActionButtons = () => {
        if (!currentDoc) return null;

        const status = currentDoc.status;
        const validation = validateInvoice(currentDoc);

        switch (status) {
            case 'pending': // Pending - processing
                return (
                    <div className="flex items-center gap-2">
                        <Button 
                            size="sm" 
                            color="secondary-destructive"
                            iconLeading={Trash01}
                            onClick={() => onDelete?.(currentDoc)}
                            className="flex-1"
                        >
                            Delete
                        </Button>
                    </div>
                );

            case 'open': // Matched/Processed - editable
                return (
                    <div className="flex items-center gap-2">
                        <Button 
                            size="sm" 
                            color="primary"
                            className="flex-1"
                            onClick={async () => {
                                // Export = Save (if dirty) + Export
                                setIsExporting(true);
                                try {
                                    if (isDirty) {
                                        await handleSave();
                                    }
                                    await onSendForApproval?.(currentDoc);
                                } catch (error) {
                                    console.error('Export failed:', error);
                                } finally {
                                    setIsExporting(false);
                                }
                            }}
                            isDisabled={!validation.canMarkAsReviewed || isExporting}
                            isLoading={isExporting}
                        >
                            Export
                        </Button>
                        <Button 
                            size="sm" 
                            color="secondary"
                            className="flex-1"
                            onClick={handleSave}
                            isDisabled={!isDirty || isSaving || isExporting}
                            isLoading={isSaving}
                        >
                            Save
                        </Button>
                        <Dropdown.Root>
                            <ButtonUtility 
                                size="sm" 
                                color="secondary"
                                icon={DotsVertical}
                                tooltip="More actions"
                            />
                            <Dropdown.Popover>
                                <Dropdown.Menu>
                                    <Dropdown.Item
                                        label="Reprocess"
                                        icon={RefreshCcw01}
                                        onAction={() => {
                                            // TODO: Implement reprocess logic
                                            console.log('Reprocess invoice:', currentDoc.id);
                                        }}
                                    />
                                    <Dropdown.Item
                                        label="Delete"
                                        icon={Trash01}
                                        onAction={() => onDelete?.(currentDoc)}
                                    />
                                </Dropdown.Menu>
                            </Dropdown.Popover>
                        </Dropdown.Root>
                    </div>
                );

            case 'reviewed': // Queued - waiting for export
            case 'queued': // Queued - waiting for export
            case 'approved': // Also maps to Queued
                return null; // No action buttons for queued state

            case 'exported': // Exported
                return null; // No action buttons for exported state


            case 'rejected': // Error state
                return (
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                            <Button 
                                size="sm" 
                                color="secondary"
                                iconLeading={Trash01}
                                onClick={() => onDelete?.(currentDoc)}
                                className="flex-1"
                            >
                                Delete
                            </Button>
                            <Button 
                                size="sm" 
                                color="secondary"
                                iconLeading={HelpCircle}
                                onClick={() => {
                                    // Open help/support - could be a modal or external link
                                    window.open('mailto:support@example.com?subject=Invoice%20Error%20Help', '_blank');
                                }}
                                className="flex-1"
                            >
                                Need Help
                            </Button>
                        </div>
                    </div>
                );

            default:
                // Fallback for unknown statuses
                return (
                    <div className="flex items-center gap-2">
                        <Button 
                            size="sm" 
                            color="primary"
                            className="flex-1"
                            onClick={handleSave}
                            isDisabled={!isDirty}
                        >
                            Save
                        </Button>
                    </div>
                );
        }
    };

    const updateField = (field: keyof Invoice, value: string | number | Date | boolean | null) => {
        if (editedDocument) {
            setEditedDocument({
                ...editedDocument,
                [field]: value
            });
            setIsEditing(true);
        }
    };

    const updateVendorName = (value: string) => {
        if (editedDocument) {
            setEditedDocument({
                ...editedDocument,
                vendorName: value,
            });
            setIsEditing(true);
        }
    };

    const handleVendorEdit = () => {
        setEditingVendorName(currentDoc?.vendorName || '');
        setIsVendorModalOpen(true);
    };

    const handleVendorSubmit = async () => {
        if (!currentDoc || !editingVendorName.trim() || isUpdatingVendor) return;
        
        setIsUpdatingVendor(true);
        
        try {
            // Update Airtable directly
            const response = await fetch(`/api/airtable/Invoices`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    records: [{
                        id: currentDoc.id,
                        fields: {
                            'Vendor-Name': editingVendorName.trim(),
                            'VendId': null // Clear vendor code since we're manually editing
                        }
                    }]
                })
            });

            if (!response.ok) {
                throw new Error('Failed to update vendor in Airtable');
            }

            // Parse the response to get the updated record
            const responseData = await response.json();
            const updatedRecord = responseData.records?.[0];

            // Update the document locally to reflect the changes
            updateVendorName(editingVendorName.trim());
            
            // Clear vendor code since we're manually editing
            if (editedDocument) {
                const updatedDoc = {
                    ...editedDocument,
                    vendorName: editingVendorName.trim(),
                    vendorCode: undefined,
                };
                setEditedDocument(updatedDoc);
                
                // Trigger parent component to refetch/reload the document data
                if (onSave) {
                    onSave(updatedDoc);
                }
            }
            
            // Close modal and reset state
            setIsVendorModalOpen(false);
            setEditingVendorName('');
            
        } catch (error) {
            console.error('Error updating vendor:', error);
            // TODO: Show error message to user
        } finally {
            setIsUpdatingVendor(false);
        }
    };


    const tabs = [
        { id: "extracted", label: "Header" },
        // Details tab hidden for all invoice states per user requirements
        // { id: "coding", label: "Details" },
        { id: "raw", label: "Raw" },
        { id: "links", label: "Links" }
    ];

    // Move all hooks before any conditional returns
    const currentDoc = editedDocument || document;
    const validation = useMemo(() => {
        return currentDoc ? validateInvoice(currentDoc) : { canMarkAsReviewed: false, isValid: false, issues: [] };
    }, [currentDoc]);

    // Ensure activeTab is valid - default to "extracted" if invalid
    const validActiveTab = tabs.some(tab => tab.id === activeTab) ? activeTab : "extracted";

    if (!document) {
        return (
            <div className={cx("border-l border-secondary bg-primary", className)} style={{ width: '320px', minWidth: '320px', maxWidth: '320px' }}>
                <div className="flex flex-col items-center justify-center py-12 px-6">
                    <div className="text-4xl mb-3">📋</div>
                    <h3 className="text-lg font-medium text-primary mb-2">No Document Selected</h3>
                    <p className="text-tertiary text-center">Select a document to view details</p>
                </div>
            </div>
        );
    }
    // Only allow editing when status is 'open' (displays as "Matched" in Airtable)
    const canEdit = currentDoc?.status === 'open';

    return (
        <div ref={panelRef} className={cx("border-l border-secondary bg-primary flex flex-col h-full overflow-hidden", className)} style={{ width: '320px', minWidth: '320px', maxWidth: '320px' }}>
            {/* Header */}
            <div className="px-[18px] pt-[18px] pb-[18px] border-b border-secondary flex-shrink-0">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-semibold text-primary">
                        Details
                    </h2>
                    <div className="flex items-center gap-2">
                        <Badge 
                            size="sm" 
                            color={getStatusColor(getDisplayStatus(currentDoc.status))}
                            type="color"
                        >
                            {getDisplayStatus(currentDoc.status)}
                        </Badge>
                        {currentDoc?.status === 'pending' || currentDoc?.status === 'queued' || currentDoc?.status === 'reviewed' || currentDoc?.status === 'approved' || currentDoc?.status === 'rejected' || currentDoc?.status === 'exported' ? (
                            // No icon for processing, exporting, queued, error, or exported states
                            null
                        ) : validation.canMarkAsReviewed ? (
                            <CheckCircle className="w-4 h-4 text-success-primary" />
                        ) : (
                            <AlertTriangle className="w-4 h-4 text-warning-primary" />
                        )}
                    </div>
                </div>

                {/* State-specific indicators */}
                {renderStateIndicator()}
                
                {/* Completeness checker (not shown for Pending state) */}
                <CompletenessChecker document={currentDoc} />
                
                {/* Primary Actions */}
                {renderActionButtons()}
            </div>

            {/* Tabs */}
            <Tabs 
                key={`tabs-${document?.id || 'no-doc'}`}
                defaultSelectedKey="extracted"
                selectedKey={validActiveTab}
                onSelectionChange={(key) => onTabChange?.(key as string)}
                className="flex-1 flex flex-col overflow-hidden"
            >
                <div className="border-b border-secondary flex-shrink-0">
                    <TabList 
                        items={tabs}
                        type="underline"
                        size="sm"
                        className="px-[18px] pt-2 w-full justify-evenly"
                    >
                        {(item) => <Tab key={item.id} id={item.id} label={item.label} />}
                    </TabList>
                </div>

                {/* Content */}
                <div ref={contentAreaRef} className="flex-1 overflow-y-auto min-h-0 w-full" style={{ padding: '18px' }} data-keyboard-nav-container>
                    <TabPanel id="extracted" className="space-y-4">
                            <div>
                                <label className="text-xs font-medium text-tertiary mb-1 block">Amount</label>
                                <Input 
                                    value={currentDoc?.amount != null ? `$${currentDoc.amount.toFixed(2)}` : ''}
                                    onChange={(value) => {
                                        // Remove dollar sign and parse as float
                                        const numericValue = value.toString().replace(/[$,]/g, '');
                                        const parsedValue = parseFloat(numericValue);
                                        if (!isNaN(parsedValue)) {
                                            updateField('amount', parsedValue);
                                        } else if (numericValue === '') {
                                            updateField('amount', 0);
                                        }
                                    }}
                                    size="sm"
                                    isDisabled={!canEdit}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-tertiary mb-1 block">Vendor Name</label>
                                <Input 
                                    value={currentDoc?.vendorName || ''}
                                    onChange={(value) => updateField('vendorName', value)}
                                    size="sm"
                                    placeholder="Enter vendor name"
                                    isDisabled={!canEdit}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-tertiary mb-1 block">Invoice Number</label>
                                <Input 
                                    value={currentDoc?.invoiceNumber || ''}
                                    onChange={(value) => updateField('invoiceNumber', value)}
                                    size="sm"
                                    isDisabled={!canEdit}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-tertiary mb-1 block">Date</label>
                                <DatePicker 
                                    aria-label="Date picker"
                                    value={formatDateValue(currentDoc?.invoiceDate)}
                                    onChange={(value) => {
                                        if (value) {
                                            // Use local timezone to match formatDateValue
                                            const date = value.toDate(getLocalTimeZone());
                                            updateField('invoiceDate', date);
                                        }
                                    }}
                                    isDisabled={!canEdit}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-tertiary mb-1 block">Freight Charge</label>
                                <Input 
                                    value={currentDoc?.freightCharge != null ? `$${currentDoc.freightCharge.toFixed(2)}` : ''}
                                    onChange={(value) => {
                                        // Remove dollar sign and parse as float
                                        const numericValue = value.toString().replace(/[$,]/g, '');
                                        const parsedValue = parseFloat(numericValue);
                                        if (!isNaN(parsedValue)) {
                                            updateField('freightCharge', parsedValue);
                                        } else if (numericValue === '') {
                                            updateField('freightCharge', undefined);
                                        }
                                    }}
                                    size="sm"
                                    placeholder="0.00"
                                    isDisabled={!canEdit}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-tertiary mb-1 block">Surcharge</label>
                                <Input 
                                    value={currentDoc?.surcharge != null ? `$${currentDoc.surcharge.toFixed(2)}` : ''}
                                    onChange={(value) => {
                                        // Remove dollar sign and parse as float
                                        const numericValue = value.toString().replace(/[$,]/g, '');
                                        const parsedValue = parseFloat(numericValue);
                                        if (!isNaN(parsedValue)) {
                                            updateField('surcharge', parsedValue);
                                        } else if (numericValue === '') {
                                            updateField('surcharge', undefined);
                                        }
                                    }}
                                    size="sm"
                                    placeholder="0.00"
                                    isDisabled={!canEdit}
                                />
                            </div>
                    </TabPanel>

                    <TabPanel id="coding" className="space-y-4">
                        {currentDoc?.type === 'invoices' ? (
                            <InvoiceCodingInterface 
                                invoice={currentDoc as Invoice}
                                onCodingChange={(invoiceCoding) => {
                                    // Update the invoice with new coding data
                                    if (invoiceCoding.glAccount !== undefined) {
                                        updateField('glAccount', invoiceCoding.glAccount);
                                    }
                                }}
                                disabled={!canEdit}
                            />
                        ) : (
                            <div className="text-center py-8 text-tertiary">
                                <p>Coding interface not available for this document type</p>
                            </div>
                        )}
                    </TabPanel>

                    <TabPanel id="raw">
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-medium text-secondary truncate flex-1 min-w-0">Raw Document Text</h4>
                            <ButtonUtility 
                                size="xs" 
                                color="secondary"
                                icon={Copy01}
                                tooltip="Copy raw text"
                                onClick={() => {
                                    const rawText = currentDoc?.rawTextOcr || '';
                                    navigator.clipboard.writeText(rawText);
                                }}
                                className="flex-shrink-0 ml-2"
                            />
                        </div>
                        <div className="text-xs text-tertiary font-mono bg-tertiary rounded p-3 overflow-y-auto overflow-x-hidden">
                            <div className="space-y-2 overflow-hidden">
                                <div className="whitespace-pre-wrap break-words overflow-hidden">
                                    {currentDoc?.rawTextOcr || 'No raw text available'}
                                </div>
                            </div>
                        </div>
                    </TabPanel>

                    <TabPanel id="links" className="space-y-6">
                            {linkedDocsLoading && (
                                <div className="flex items-center justify-center py-8">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                    <span className="ml-2 text-sm text-gray-600">Loading linked documents...</span>
                                </div>
                            )}
                            
                            {linkedDocsError && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                    <p className="text-sm text-red-800">
                                        Error loading linked documents: {linkedDocsError}
                                    </p>
                                </div>
                            )}
                            
                            {!linkedDocsLoading && !linkedDocsError && (
                                <LinksTab 
                                    linkedItems={linkedItems}
                                    files={files}
                                    emails={emails}
                                    emptyStateMessage="No documents linked to this invoice"
                                />
                            )}
                    </TabPanel>
                </div>
            </Tabs>
            
            {/* Vendor Edit Modal */}
            {isVendorModalOpen && (
                <ModalOverlay isOpen={isVendorModalOpen} onOpenChange={setIsVendorModalOpen} isDismissable>
                    <Modal className="max-w-md">
                        <Dialog>
                            <div className="bg-white rounded-lg p-6">
                                {/* Modal Header */}
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg font-semibold text-gray-900">Edit Vendor</h2>
                                    <Button
                                        color="secondary"
                                        size="sm"
                                        onClick={() => setIsVendorModalOpen(false)}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        ×
                                    </Button>
                                </div>
                                
                                {/* Modal Content */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 mb-1 block">
                                            Vendor Name
                                        </label>
                                        <Input
                                            value={editingVendorName}
                                            onChange={(value) => setEditingVendorName(value as string)}
                                            placeholder="Enter vendor name"
                                            size="sm"
                                            autoFocus
                                        />
                                    </div>
                                </div>
                                
                                {/* Modal Actions */}
                                <div className="flex justify-end gap-3 mt-6">
                                    <Button
                                        color="secondary"
                                        size="sm"
                                        onClick={() => setIsVendorModalOpen(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        size="sm"
                                        onClick={handleVendorSubmit}
                                        isDisabled={!editingVendorName.trim() || isUpdatingVendor}
                                        isLoading={isUpdatingVendor}
                                    >
                                        {isUpdatingVendor ? 'Updating...' : 'Update Vendor'}
                                    </Button>
                                </div>
                            </div>
                        </Dialog>
                    </Modal>
                </ModalOverlay>
            )}
        </div>
    );
};
