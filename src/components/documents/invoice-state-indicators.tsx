"use client";

import { AlertTriangle, Clock, CheckCircle, AlertCircle, HelpCircle } from "@untitledui/icons";
import { cx } from "@/utils/cx";
import type { Invoice } from "@/types/documents";

interface PendingStateIndicatorProps {
    className?: string;
}

/**
 * Pending State Indicator
 * Shows a blue information styling with spinner indicating processing
 */
export const PendingStateIndicator = ({ className }: PendingStateIndicatorProps) => {
    return (
        <div className={cx(
            "rounded-lg border p-3 mb-4",
            "border-blue-200 bg-blue-50 text-blue-700",
            className
        )}>
            <div className="flex items-center gap-2 mb-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                <span className="text-sm font-medium">
                    Processing Invoice
                </span>
            </div>
            <p className="text-xs">
                We're processing this invoice. Most fields are read-only until processing is complete.
            </p>
        </div>
    );
};

interface BalanceAlertProps {
    balance: number;
    explanation?: string;
    className?: string;
}

/**
 * Balance Alert
 * Shows attention/alert box when invoice has a balance discrepancy
 */
export const BalanceAlert = ({ balance, explanation, className }: BalanceAlertProps) => {
    const isPositive = balance > 0;
    const formattedBalance = Math.abs(balance).toFixed(2);
    
    return (
        <div className={cx(
            "rounded-lg border p-3 mb-4",
            "border-warning bg-warning-25 text-warning-700",
            className
        )}>
            <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-warning-primary" />
                <span className="text-sm font-medium">
                    Balance Discrepancy
                </span>
            </div>
            <p className="text-xs mb-1">
                {isPositive ? 'Invoice exceeds PO by' : 'Invoice is under PO by'} <strong>${formattedBalance}</strong>
            </p>
            {explanation && (
                <p className="text-xs text-warning-600 mt-2">
                    {explanation}
                </p>
            )}
        </div>
    );
};

interface QueuedIndicatorProps {
    className?: string;
}

/**
 * Queued State Indicator
 * Shows spinner/queued indicator for invoices waiting to be exported
 */
export const QueuedIndicator = ({ className }: QueuedIndicatorProps) => {
    return (
        <div className={cx(
            "rounded-lg border p-3",
            "border-success bg-success-25 text-success-700",
            className
        )}>
            <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-success-primary" />
                <span className="text-sm font-medium">
                    Ready for Export
                </span>
            </div>
            <p className="text-xs">
                This invoice is queued for export. All fields are locked.
            </p>
        </div>
    );
};

interface ErrorAlertProps {
    errorCode?: string;
    errorMessage?: string;
    className?: string;
}

/**
 * Error Alert
 * Shows alert box with error message for invoices in error state
 */
export const ErrorAlert = ({ errorCode, errorMessage, className }: ErrorAlertProps) => {
    const displayMessage = errorMessage || 'An error occurred while processing this invoice.';
    
    return (
        <div className={cx(
            "rounded-lg border p-3 mb-4",
            "border-error bg-error-25 text-error-700",
            className
        )}>
            <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-error-primary" />
                <span className="text-sm font-medium">
                    Error Processing Invoice
                </span>
            </div>
            {errorCode && (
                <p className="text-xs font-mono mb-1">
                    Error Code: {errorCode}
                </p>
            )}
            <p className="text-xs">
                {displayMessage}
            </p>
        </div>
    );
};

interface ExportedIndicatorProps {
    className?: string;
}

/**
 * Exported State Indicator
 * Shows success indicator for exported invoices
 */
export const ExportedIndicator = ({ className }: ExportedIndicatorProps) => {
    return (
        <div className={cx(
            "rounded-lg border p-3 mb-4",
            "border-brand bg-brand-25 text-brand-700",
            className
        )}>
            <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-brand-primary" />
                <span className="text-sm font-medium">
                    Successfully Exported
                </span>
            </div>
            <p className="text-xs">
                This invoice has been exported to AIM Vision. All fields are read-only.
            </p>
        </div>
    );
};

