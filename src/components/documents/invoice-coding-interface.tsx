"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "@untitledui/icons";
import { Input } from "@/components/base/input/input";
import { AmountInput } from "@/components/base/input/amount-input";
import { FormField } from "@/components/base/input/form-field";
import { cx } from "@/utils/cx";
import { useInvoiceDetails } from "@/lib/airtable";
import type { Invoice } from "@/types/documents";

interface InvoiceCodingInterfaceProps {
  invoice: Invoice;
  onCodingChange?: (lineId: string, glAccount: string) => void;
  onLineUpdate?: (lineId: string, field: 'description' | 'amount', value: string | number) => void;
  className?: string;
  disabled?: boolean;
}

export const InvoiceCodingInterface = ({ 
  invoice, 
  onCodingChange, 
  onLineUpdate,
  className,
  disabled = false
}: InvoiceCodingInterfaceProps) => {
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  
  // Fetch invoice line items from POInvoiceDetails table
  const { lines, loading, error } = useInvoiceDetails({
    invoiceDetailsIds: invoice.invoiceDetails, // Pass the linked record IDs
    autoFetch: true
  });

  // Reset to first line when invoice changes
  useEffect(() => {
    setCurrentLineIndex(0);
  }, [invoice.id]);

  const currentLine = lines[currentLineIndex];

  const handleLineCodingChange = (value: string) => {
    if (currentLine && onCodingChange) {
      onCodingChange(currentLine.id, value);
    }
  };

  const handlePreviousLine = () => {
    if (currentLineIndex > 0) {
      setCurrentLineIndex(currentLineIndex - 1);
    }
  };

  const handleNextLine = () => {
    if (currentLineIndex < lines.length - 1) {
      setCurrentLineIndex(currentLineIndex + 1);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className={cx("flex flex-col items-center justify-center py-8", className)}>
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mb-2"></div>
        <p className="text-sm text-tertiary">Loading invoice lines...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={cx("flex flex-col", className)}>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800">
            <strong>Error loading lines:</strong> {error}
          </p>
        </div>
      </div>
    );
  }

  // No lines state
  if (lines.length === 0) {
    return (
      <div className={cx("flex flex-col", className)}>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800 mb-2">
            <strong>No Line Items Found</strong>
          </p>
          <p className="text-xs text-blue-700">
            This invoice doesn&apos;t have any line items in the POInvoiceDetails table yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cx("flex flex-col", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-primary">Invoice Line Items</h3>
        <span className="text-xs text-tertiary">{lines.length} {lines.length === 1 ? 'line' : 'lines'}</span>
      </div>

      {/* Header Divider */}
      <div className="border-b border-secondary" />

      {/* Pagination Row - Always enabled for navigation even in read-only states */}
      <div className="flex items-center justify-between py-2 -mx-6 px-6">
        <button
          onClick={handlePreviousLine}
          disabled={currentLineIndex === 0}
          className={cx(
            "p-1 rounded-lg transition-colors",
            currentLineIndex === 0
              ? "text-quaternary cursor-not-allowed"
              : "text-secondary hover:text-primary hover:bg-secondary"
          )}
          aria-label="Previous line"
        >
          <ChevronLeft className="size-5" />
        </button>

        <span className="text-sm font-medium text-secondary">
          Line {currentLineIndex + 1} of {lines.length}
        </span>

        <button
          onClick={handleNextLine}
          disabled={currentLineIndex === lines.length - 1}
          className={cx(
            "p-1 rounded-lg transition-colors",
            currentLineIndex === lines.length - 1
              ? "text-quaternary cursor-not-allowed"
              : "text-secondary hover:text-primary hover:bg-secondary"
          )}
          aria-label="Next line"
        >
          <ChevronRight className="size-5" />
        </button>
      </div>

      {/* Pagination Divider */}
      <div className="border-b border-secondary" />

      {/* Line Details */}
      {currentLine && (
        <>
          <div className="flex flex-col gap-4 mb-4 mt-3">
            {/* Line Number */}
            {currentLine.lineNumber && (
              <div>
                <label className="text-xs font-medium text-tertiary mb-1 block">Line Number</label>
                <div className="text-sm text-primary">{currentLine.lineNumber}</div>
              </div>
            )}

            {/* Item Number */}
            {currentLine.itemNo && (
              <div>
                <label className="text-xs font-medium text-tertiary mb-1 block">Item Number</label>
                <div className="text-sm text-primary">{currentLine.itemNo}</div>
              </div>
            )}

            {/* Description */}
            <FormField label="Description">
              <Input
                value={currentLine.description || ''}
                onChange={(value) => {
                  if (currentLine && onLineUpdate) {
                    onLineUpdate(currentLine.id, 'description', String(value ?? ""));
                  }
                }}
                size="sm"
                placeholder="Enter line description"
                isDisabled={disabled}
              />
            </FormField>

            {/* Amount */}
            <FormField label="Line Amount">
              <AmountInput
                value={currentLine.amount || 0}
                onChange={(value) => {
                  if (currentLine && onLineUpdate) {
                    onLineUpdate(currentLine.id, 'amount', value);
                  }
                }}
                size="sm"
                isDisabled={disabled}
              />
            </FormField>

            {/* Quantity and Unit Price (if available) */}
            {(currentLine.quantity !== undefined || currentLine.unitPrice !== undefined) && (
              <div className="grid grid-cols-2 gap-3">
                {currentLine.quantity !== undefined && (
                  <div>
                    <label className="text-xs font-medium text-tertiary mb-1 block">Quantity</label>
                    <div className="text-sm text-primary">{currentLine.quantity}</div>
                  </div>
                )}
                {currentLine.unitPrice !== undefined && (
                  <div>
                    <label className="text-xs font-medium text-tertiary mb-1 block">Unit Price</label>
                    <div className="text-sm text-primary">
                      ${currentLine.unitPrice.toFixed(2)}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* PO Info (if available) */}
            {(currentLine.poNumber || currentLine.poLineNumber) && (
              <div className="grid grid-cols-2 gap-3">
                {currentLine.poNumber && (
                  <div>
                    <label className="text-xs font-medium text-tertiary mb-1 block">PO Number</label>
                    <div className="text-sm text-primary">{currentLine.poNumber}</div>
                  </div>
                )}
                {currentLine.poLineNumber && (
                  <div>
                    <label className="text-xs font-medium text-tertiary mb-1 block">PO Line</label>
                    <div className="text-sm text-primary">{currentLine.poLineNumber}</div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* No GL Account coding section - removed */}
        </>
      )}
    </div>
  );
};
