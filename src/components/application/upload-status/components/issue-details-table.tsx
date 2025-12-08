"use client"

import { Dot } from "@/components/foundations/dot-icon"
import type { DetailedIssue } from "../upload-status-card"

interface IssueDetailsTableProps {
  issues: DetailedIssue[]
}

const issueTypeLabels: Record<DetailedIssue['type'], string> = {
  'price-variance': 'Unit Price Variance',
  'unmatched-item': 'Unmatched Item',
  'quantity-mismatch': 'Quantity Mismatch',
  'missing-po': 'Missing PO'
}

export function IssueDetailsTable({ issues }: IssueDetailsTableProps) {
  if (!issues || issues.length === 0) return null

  return (
    <div className="mt-6">
      {/* Table Header */}
      <div className="flex items-center justify-between pb-3 border-b border-secondary">
        <span className="text-xs font-medium text-tertiary uppercase tracking-wider">Issue Details</span>
        <span className="text-xs font-medium text-tertiary uppercase tracking-wider">Impact</span>
      </div>

      {/* Table Body */}
      <div className="divide-y divide-secondary">
        {issues.map((issue, index) => (
          <div key={index} className="py-4 flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 min-w-0 flex-1">
              {/* Severity Dot */}
              <Dot 
                size="sm" 
                className="text-utility-warning-500 mt-1.5" 
              />
              
              <div className="flex flex-col gap-1.5 min-w-0">
                {/* Issue Type */}
                <span className="text-sm font-semibold text-primary">
                  {issueTypeLabels[issue.type]}
                </span>

                {/* Invoice Line + Item Reference */}
                {issue.lineNumber !== undefined && issue.lineNumber !== 0 && (
                  <span className="text-sm text-tertiary">
                    Invoice line {issue.lineNumber}
                    {issue.itemNumber ? ` - ${issue.itemNumber}`:''}
                    {issue.type === 'unmatched-item' ? ' not found on PO' : ''}
                  </span>
                )}
                
                {/* Additional Details */}
                <div className="text-sm text-tertiary">
                  {/* Variance Details (Price/Quantity) */}
                  {issue.details && issue.details.invoiceValue && issue.details.poValue && (
                    <div>
                      <span>
                        Inv: <span className="font-medium text-secondary">{issue.details.invoiceValue}</span>
                        {' / '}
                        PO: <span className="font-medium text-secondary">{issue.details.poValue}</span>
                      </span>
                      {/* For quantity mismatch: show unit price */}
                      {issue.type === 'quantity-mismatch' && issue.details.unitPrice && (
                        <span> @ <span className="font-medium text-secondary">{issue.details.unitPrice}</span>/unit</span>
                      )}
                      {/* For price variance: show quantity */}
                      {issue.type === 'price-variance' && issue.details.quantity && (
                        <span> × <span className="font-medium text-secondary">{issue.details.quantity.toLocaleString()}</span> units</span>
                      )}
                    </div>
                  )}

                  {/* Item Description (Unmatched Items) */}
                  {issue.details?.itemDescription && (
                    <div className="mt-0.5">
                      Item: <span className="font-medium text-secondary">{issue.details.itemDescription}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Impact - Always dollar amount */}
            <span className="text-sm font-semibold whitespace-nowrap text-utility-warning-700">
              {issue.dollarImpact}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

