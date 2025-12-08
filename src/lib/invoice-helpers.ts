import type { DetailedIssue } from '@/components/application/upload-status/upload-status-card';
import type { InvoiceWarningType } from '@/types/upload-file';
import type { AirtableRecord } from '@/lib/airtable/types';

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

// Parse error code to extract message outside brackets
export const parseErrorCode = (code: string): string => {
  if (!code) return '';
  const match = code.match(/^\[.*?\]\s*(.*)$/);
  return match ? match[1] : code;
};

// Parse error description to get the first sentence
export const parseErrorDescription = (description: string): string => {
  if (!description) return '';
  const dotIndex = description.indexOf('.');
  return dotIndex !== -1 ? description.substring(0, dotIndex + 1) : description;
};

// Convert InvoiceWarning to DetailedIssue[]
export const transformWarningToDetailedIssues = (warning: InvoiceWarningType): DetailedIssue[] => {
  const issues: DetailedIssue[] = [];

  if (warning.Type === 'line_amount' && warning.Items && Array.isArray(warning.Items)) {
    const items = warning.Items as any[];
    items.forEach(item => {
      const qtyMismatch = item.DocQty != null && item.RecQty != null && item.DocQty !== item.RecQty;
      const priceMismatch = item.DocPrice != null && item.RecPrice != null && item.DocPrice !== item.RecPrice;

      if (qtyMismatch) {
        const pctDiff = item.RecQty !== 0 ? ((item.DocQty - item.RecQty) / item.RecQty) * 100 : 0;
        const impactStr = pctDiff > 0 ? `+${pctDiff.toFixed(1)}%` : `${pctDiff.toFixed(1)}%`;
        
        // Calculate dollar impact if we have price
        const price = item.DocPrice || 0;
        const diffQty = item.DocQty - item.RecQty;
        const dollarImpactVal = diffQty * price;
        const dollarImpactStr = dollarImpactVal > 0 
          ? `+$${dollarImpactVal.toFixed(2)}` 
          : `-$${Math.abs(dollarImpactVal).toFixed(2)}`;

        issues.push({
           type: 'quantity-mismatch',
           severity: 'warning',
           lineNumber: parseInt(item.LineNo) || 0,
           lineReference: item.LineNo ? `Line ${item.LineNo}` : 'Unknown Line',
           description: 'Quantity mismatch vs PO',
           impact: impactStr, 
           dollarImpact: dollarImpactStr,
           details: {
             invoiceValue: `${item.DocQty}`,
             poValue: `${item.RecQty}`,
             quantity: item.DocQty,
             unitPrice: item.DocPrice ? `$${item.DocPrice}` : undefined
           }
        });
      }

      if (priceMismatch) {
         const pctDiff = item.RecPrice !== 0 ? ((item.DocPrice - item.RecPrice) / item.RecPrice) * 100 : 0;
         const impactStr = pctDiff > 0 ? `+${pctDiff.toFixed(1)}%` : `${pctDiff.toFixed(1)}%`;
         
         // Dollar impact
         const qty = item.DocQty || 0;
         const diffPrice = item.DocPrice - item.RecPrice;
         const dollarImpactVal = diffPrice * qty;
         const dollarImpactStr = dollarImpactVal > 0 
           ? `+$${dollarImpactVal.toFixed(2)}` 
           : `-$${Math.abs(dollarImpactVal).toFixed(2)}`;

         issues.push({
           type: 'price-variance',
           severity: 'warning',
           lineNumber: parseInt(item.LineNo) || 0,
           lineReference: item.LineNo ? `Line ${item.LineNo}` : 'Unknown Line',
           description: 'Unit price mismatch vs PO',
           impact: impactStr,
           dollarImpact: dollarImpactStr,
           details: {
             invoiceValue: `$${item.DocPrice}`,
             poValue: `$${item.RecPrice}`,
             quantity: item.DocQty
           }
        });
      }
    });
  }

  // Handle missing_receipts (Unmatched items)
  if (warning.Type.trim() === 'missing_receipts') {
    // New structure with ItemDetails array
    if (warning.ItemDetails && Array.isArray(warning.ItemDetails)) {
      const details = warning.ItemDetails as any[];
      details.forEach(detail => {
        // Calculate dollar impact from invoice_amount
        const invoiceAmount = detail.invoice_amount ? parseFloat(detail.invoice_amount) : 0;
        const dollarImpactStr = invoiceAmount > 0 
          ? `+$${invoiceAmount.toFixed(2)}` 
          : `$${invoiceAmount.toFixed(2)}`;

        issues.push({
          type: 'unmatched-item',
          severity: 'error',
          lineNumber: parseInt(detail.line_number) || 0,
          lineReference: detail.line_number ? `Line ${detail.line_number}` : 'Unknown Line',
          description: 'Item not found on original PO',
          impact: 'Full value',
          dollarImpact: dollarImpactStr,
          details: {
             itemDescription: detail.item_name || 'Unmatched item',
             quantity: detail.invoice_quantity,
             unitPrice: detail.invoice_price
          }
        });
      });
    } 
    // Fallback to legacy ItemLineNumbers string
    else if (warning.ItemLineNumbers) {
       issues.push({
         type: 'unmatched-item',
         severity: 'error',
         lineReference: `Line ${warning.ItemLineNumbers}`,
         description: 'Item not found on original PO',
         impact: 'Full value', 
         details: {
            itemDescription: 'Unmatched item'
         }
       });
    }
  }
  
//   // AI Matching warning - Treat as Unmatched Item (using missing-po data)
//   if (warning.Type === 'ai_matching' && warning.Message) {
//     issues.push({
//       type: 'unmatched-item',
//       severity: 'error',
//       description: warning.Message,
//       impact: 'Review needed',
//       lineReference: 'General'
//     });
//   }

  return issues;
};

// Generate analysis summary string
export const generateAnalysisSummary = (detailedIssues: DetailedIssue[], vendor: string): string => {
  if (!detailedIssues || detailedIssues.length === 0) return '';
  
  const summaryParts = detailedIssues.map(issue => {
    let part = `Invoice ${issue.lineReference || 'item'}`;
    if (issue.type === 'price-variance') {
      part += ` has price discrepancy: invoice ${issue.details?.invoiceValue} vs PO ${issue.details?.poValue}`;
    } else if (issue.type === 'quantity-mismatch') {
      part += ` shows quantity of ${issue.details?.invoiceValue} vs PO ${issue.details?.poValue}`;
    } else if (issue.type === 'unmatched-item') {
      part += ` has no matching PO receipt`;
    }
    
    if (issue.dollarImpact) {
      part += ` (${issue.dollarImpact})`;
    }
    // Remove any trailing periods from the individual part before joining
    return part.replace(/\.$/, '');
  });

  // Join with period and space, and ensure exactly one period at the end
  return summaryParts.join('. ') + '.';
};

// Derive variance info
export const deriveVarianceInfo = (balance?: number) => {
  if (balance === undefined || balance === 0) return undefined;
  return {
    amount: `$${Math.abs(balance).toFixed(2)}`,
    direction: balance > 0 ? 'over' as const : 'under' as const
  };
};

// Format invoice warning to display message (Legacy helper)
export const formatInvoiceWarning = (warning: InvoiceWarningType): string | null => {
  if (warning.Type === 'line_amount') {
    if (warning.Items && Array.isArray(warning.Items)) {
      const items = warning.Items as any[];
      if (items.length === 0) return null;
      
      const details = items.map(item => {
        const qtyMismatch = item.DocQty != null;
        const priceMismatch = item.DocPrice !=null;

        if (qtyMismatch && priceMismatch) {
          return `- Line ${item.LineNo} – quantity and unit price mismatch (Invoice: ${item.DocQty} @ $${item.DocPrice}, PO: ${item.RecQty} @ $${item.RecPrice}).`;
        } else if (qtyMismatch) {
          return `- Line ${item.LineNo} – quantity mismatch (Invoice: ${item.DocQty}, PO: ${item.RecQty}).`;
        } else if (priceMismatch) {
          return `- Line ${item.LineNo} – unit price mismatch (Invoice: $${item.DocPrice}, PO: $${item.RecPrice}).`;
        }
        return `- Line ${item.LineNo} – mismatch detected.`;
      }).join('\n');
      
      return `Line item mismatch(es) detected:\n${details}`;
    }
  }
  if (warning.Type === 'missing_receipts') {
    if (warning.ItemLineNumbers) {
      return `Line(s) ${warning.ItemLineNumbers} – item(s) not on PO.`;
    }
  }

//   if (warning.Type === 'ai_matching') {
//     if (warning.Message) {
//       return warning.Message;
//     }
//   }
  return null;
};

// Helper to parse invoice record
export const parseInvoiceRecord = (invoiceRecord: AirtableRecord) => {
  if (!invoiceRecord || !invoiceRecord.fields) return null;
  
  const vendorName = invoiceRecord.fields['Vendor-Name'] as string;
  const amount = invoiceRecord.fields['Amount'] as number;
  const date = invoiceRecord.fields['Date'] as string;
  const summary = invoiceRecord.fields['Summary'] as string;
  const invoiceNumber = invoiceRecord.fields['Invoice-Number'] as string;
  const status = invoiceRecord.fields['Status'] as string;
  const errorCode = invoiceRecord.fields['ErrorCode'] as string;
  const errorDescription = invoiceRecord.fields['Error-Description'] as string;
  const warningsRaw = invoiceRecord.fields['Warnings'];
  const balance = invoiceRecord.fields['Balance'] as number;

  // Parse warnings
  let warnings: InvoiceWarningType[] = [];
  if (warningsRaw) {
    try {
      if (typeof warningsRaw === 'string') {
        warnings = JSON.parse(warningsRaw);
      } else if (Array.isArray(warningsRaw)) {
        warnings = warningsRaw as InvoiceWarningType[];
      }
    } catch (e) {
      console.warn('Failed to parse warnings for invoice', invoiceRecord.id, e);
    }
  }

  // Format the data for the UI
  const invoiceDate = date ? new Date(date) : new Date();
  const daysAgo = Math.floor((Date.now() - invoiceDate.getTime()) / (1000 * 60 * 60 * 24));
  
  return {
    vendor: vendorName || 'Unknown Vendor',
    date: invoiceDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    daysAgo,
    amount: amount ? `$${amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}` : '$0.00',
    description: summary || 'Invoice details',
    invoiceNumber: invoiceNumber || undefined,
    recordId: invoiceRecord.id, // Include recordId for status updates
    status,
    errorCode,
    errorDescription,
    warnings,
    balance,
  };
};

// Helper function to get time-based greeting
export function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

