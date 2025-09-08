"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "@untitledui/icons";
import { Toggle } from "@/components/base/toggle/toggle";
import { ButtonGroup, ButtonGroupItem } from "@/components/base/button-group/button-group";
import { Select } from "@/components/base/select/select";
import { Input } from "@/components/base/input/input";
import { AmountInput } from "@/components/base/input/amount-input";
import { FormField } from "@/components/base/input/form-field";
import { Badge } from "@/components/base/badges/badges";
import { cx } from "@/utils/cx";
import type { Invoice, DocumentLine } from "@/types/documents";

type CodingMode = "invoice" | "lines";

interface CodingData {
  glAccount?: string;
  isMultilineCoding?: boolean;
}

interface LineCodingData extends CodingData {
  lineId: string;
}

interface InvoiceCodingInterfaceProps {
  invoice: Invoice;
  onCodingChange?: (invoiceCoding?: CodingData, lineCoding?: LineCodingData[]) => void;
  onLineUpdate?: (lineId: string, field: 'description' | 'amount', value: string | number) => void;
  className?: string;
  disabled?: boolean;
  keyboardNav?: {
    handleInputFocus?: () => void;
    handleInputBlur?: (e?: FocusEvent) => void;
  };
}


export const InvoiceCodingInterface = ({ 
  invoice, 
  onCodingChange, 
  onLineUpdate,
  className,
  disabled = false,
  keyboardNav
}: InvoiceCodingInterfaceProps) => {
  const [mode, setMode] = useState<CodingMode>(invoice.isMultilineCoding ? "lines" : "invoice");
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  
  // Invoice-level coding
  const [invoiceCoding, setInvoiceCoding] = useState<CodingData>({
    glAccount: invoice.glAccount,
  });

  // Per-line coding (initialized with invoice defaults)
  const [lineCoding, setLineCoding] = useState<LineCodingData[]>(
    (invoice.lines || []).map(line => ({
      lineId: line.id,
      glAccount: line.glAccount ?? invoice.glAccount,
    }))
  );

  const lines = invoice.lines || [];

  // Reset state when invoice changes and update mode based on invoice characteristics
  useEffect(() => {
    // Determine the appropriate mode based on the isMultilineCoding flag
    const appropriateMode: CodingMode = invoice.isMultilineCoding ? "lines" : "invoice";
    
    // Update mode to match the invoice characteristics
    setMode(appropriateMode);
    
    setCurrentLineIndex(0);
    setInvoiceCoding({
      glAccount: invoice.glAccount,
    });
    setLineCoding(
      (invoice.lines || []).map(line => ({
        lineId: line.id,
        glAccount: line.glAccount ?? invoice.glAccount,
      }))
    );

  }, [invoice.id]); // Only trigger on invoice ID change, not on every invoice update



  const currentLine = lines[currentLineIndex];
  const currentLineCoding = lineCoding.find(lc => lc.lineId === currentLine?.id) || { 
    lineId: currentLine?.id || '',
    glAccount: undefined
  };

  const handleInvoiceCodingChange = (field: keyof CodingData, value: string) => {
    const newCoding = { 
      ...invoiceCoding, 
      [field]: value,
      isMultilineCoding: mode === "lines"
    };
    setInvoiceCoding(newCoding);
    onCodingChange?.(newCoding, lineCoding);
  };

  const handleLineCodingChange = (field: keyof CodingData, value: string) => {
    if (!currentLine) return;
    
    const newLineCoding = lineCoding.map(lc => 
      lc.lineId === currentLine.id 
        ? { ...lc, [field]: value }
        : lc
    );
    setLineCoding(newLineCoding);
    onCodingChange?.(invoiceCoding, newLineCoding);
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };


  return (
    <div className={cx("flex flex-col", className)}>
      {/* 1. Header Row */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-primary">Multiline Coding</h3>
        <Toggle
          slim
          isSelected={mode === "lines"}
          onChange={(isSelected) => {
            const newMode = isSelected ? "lines" : "invoice";
            setMode(newMode);
            // Notify parent about multiline coding change
            if (onCodingChange) {
              onCodingChange({
                ...invoiceCoding,
                isMultilineCoding: newMode === "lines"
              });
            }
          }}
          size="sm"
          isDisabled={disabled}
        >
          <div className="flex items-center gap-3">
            <span className={cx("text-sm font-medium", mode === "invoice" ? "text-primary" : "text-tertiary")}>
              Invoice
            </span>
            <span className={cx("text-sm font-medium", mode === "lines" ? "text-primary" : "text-tertiary")}>
              Lines
            </span>
          </div>
        </Toggle>
      </div>

      {/* Header Divider */}
      <div className={cx("border-b border-secondary", mode === "invoice" && "mb-3")} />

      {mode === "invoice" ? (
        /* Invoice Mode - Just Coding Fields */
        <div className="flex flex-col gap-4">
          <FormField label="GL Account (6-digit)">
            <Input
              placeholder="000000"
              value={invoiceCoding.glAccount || ""}
              onChange={(value) => handleInvoiceCodingChange("glAccount", String(value ?? ""))}
              size="sm"
              maxLength={6}
              pattern="[0-9]{6}"
              isDisabled={disabled}
              onFocus={keyboardNav?.handleInputFocus}
              onBlur={keyboardNav?.handleInputBlur}
            />
          </FormField>
        </div>
      ) : (
        /* Lines Mode */
        <div className="flex flex-col">
          {lines.length > 0 ? (
            <>
              {/* 2. Pagination Row - Edge to Edge */}
              <div className="flex items-center justify-between py-2 -mx-6 px-6">
                <button
                  onClick={handlePreviousLine}
                  disabled={disabled || currentLineIndex === 0}
                  className={cx(
                    "p-1 rounded-lg transition-colors",
                    (disabled || currentLineIndex === 0)
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
                  disabled={disabled || currentLineIndex === lines.length - 1}
                  className={cx(
                    "p-1 rounded-lg transition-colors",
                    (disabled || currentLineIndex === lines.length - 1)
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

              {/* 3. Line Context Row */}
              {currentLine && (
                <div className="flex flex-col gap-4 mb-4 mt-3">
                  <FormField label="Line Description">
                    <Input
                      value={currentLine.description}
                      onChange={(value) => {
                        if (currentLine && onLineUpdate) {
                          onLineUpdate(currentLine.id, 'description', String(value ?? ""));
                        }
                      }}
                      size="sm"
                      placeholder="Enter line description"
                      isDisabled={disabled}
                      onFocus={keyboardNav?.handleInputFocus}
                      onBlur={keyboardNav?.handleInputBlur}
                    />
                  </FormField>
                  <FormField label="Amount">
                    <AmountInput
                      value={currentLine.amount}
                      onChange={(value) => {
                        if (currentLine && onLineUpdate) {
                          onLineUpdate(currentLine.id, 'amount', value);
                        }
                      }}
                      size="sm"
                      isDisabled={disabled}
                      onFocus={keyboardNav?.handleInputFocus}
                      onBlur={keyboardNav?.handleInputBlur}
                    />
                  </FormField>
                </div>
              )}

              {/* Line Context Divider */}
              <div className="border-b border-secondary mb-3" />

              {/* 4. Coding Fields */}
              <div className="flex flex-col gap-4">
                <FormField label="GL Account (6-digit)">
                  <Input
                    placeholder="000000"
                    value={currentLineCoding.glAccount || ""}
                    onChange={(value) => handleLineCodingChange("glAccount", String(value ?? ""))}
                    size="sm"
                    maxLength={6}
                    pattern="[0-9]{6}"
                    isDisabled={disabled}
                    onFocus={keyboardNav?.handleInputFocus}
                    onBlur={keyboardNav?.handleInputBlur}
                  />
                </FormField>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-tertiary">
              <p className="text-sm">No line items available for this invoice.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
