/**
 * Airtable helper functions for post-OCR processing
 */

import { FIELD_IDS, TABLE_NAMES } from '../airtable/schema-types';
import type { ParsedDocument } from '../llm/schemas';

const BASE_ID = process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID || process.env.AIRTABLE_BASE_ID;
const AIRTABLE_TOKEN = process.env.AIRTABLE_PAT;

if (!BASE_ID) {
  throw new Error('Airtable BASE_ID is not configured');
}

/**
 * Fetch a file record from Airtable using the existing API endpoint
 */
export async function getFileRecord(fileRecordId: string): Promise<any> {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const url = `${baseUrl}/api/airtable/${TABLE_NAMES.FILES}/${fileRecordId}?baseId=${BASE_ID}`;
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch file record: ${response.status}`);
  }

  const record = await response.json();
  
  // Debug: Log the record structure to understand what fields are available
  console.log('🔍 File record fields available:', Object.keys(record.fields || {}));
  console.log('🔍 Looking for Raw Text field ID:', FIELD_IDS.FILES.RAW_TEXT);
  console.log('🔍 Raw Text present:', record.fields?.[FIELD_IDS.FILES.RAW_TEXT] ? 'YES' : 'NO');
  if (record.fields?.[FIELD_IDS.FILES.RAW_TEXT]) {
    console.log('🔍 Raw Text length:', record.fields[FIELD_IDS.FILES.RAW_TEXT].length);
    console.log('🔍 Raw Text preview:', record.fields[FIELD_IDS.FILES.RAW_TEXT].substring(0, 100) + '...');
  }
  
  return record;
}

/**
 * Look up a team by name/store number using the existing API
 * Returns the team record ID if found, null otherwise
 * 
 * DEPRECATED: Teams table no longer exists in new schema
 * This function is kept for backward compatibility but will always return null
 */
export async function findTeamByName(teamName: string): Promise<string | null> {
  console.warn('⚠️ findTeamByName called but Teams table no longer exists in new schema');
  return null;
  
  // DEPRECATED CODE - keeping for reference
  /*
  if (!teamName || teamName.trim() === '') {
    return null;
  }

  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const url = `${baseUrl}/api/airtable/${TABLE_NAMES.TEAMS}?baseId=${BASE_ID}&maxRecords=50`;

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.warn(`Failed to lookup teams: ${response.status}`);
      return null;
    }

    const data = await response.json();
    
    console.log(`🔍 Looking for team matching: "${teamName}"`);
    
    // Look for team by exact name match first
    let team = data.records?.find((record: any) => 
      record.fields['Name'] === teamName || 
      record.fields['Full Name'] === teamName
    );
    
    if (team) {
      console.log(`✅ Found exact match: ${team.fields['Name']} (${team.id})`);
      return team.id;
    }
    
    // Try partial matches for store numbers
    team = data.records?.find((record: any) => 
      record.fields['Name']?.includes(teamName) ||
      record.fields['Full Name']?.includes(teamName)
    );
    
    if (team) {
      console.log(`✅ Found partial match: ${team.fields['Name']} (${team.id})`);
      return team.id;
    }
    
    // Try extracting just numbers and matching
    const numericTeam = teamName.replace(/\D/g, ''); // Extract only digits
    if (numericTeam) {
      team = data.records?.find((record: any) => 
        record.fields['Name'] === numericTeam ||
        record.fields['Name']?.includes(numericTeam)
      );
      
      if (team) {
        console.log(`✅ Found numeric match: ${team.fields['Name']} (${team.id}) for "${numericTeam}"`);
        return team.id;
      }
    }
    
    console.log(`⚠️ No team found for: "${teamName}"`);
    console.log(`Available teams:`, data.records?.map((r: any) => r.fields['Name']).join(', '));
    
    return null;
  } catch (error) {
    console.warn(`Error looking up team "${teamName}":`, error);
    return null;
  }
  */
}

/**
 * Get the appropriate table name and field mapping based on document type
 * 
 * NOTE: Only 'invoice' type is supported in new schema
 * Delivery tickets and store receivers are deprecated
 */
function getTableConfig(documentType: string): {
  tableName: string;
  fields: any;
  rawTextField: string;
} {
  switch (documentType) {
    case 'invoice':
      return {
        tableName: TABLE_NAMES.INVOICEHEADERS, // Updated to new table name
        fields: FIELD_IDS.INVOICEHEADERS,
        rawTextField: FIELD_IDS.INVOICEHEADERS.DOCUMENT_RAW_TEXT,
      };
    case 'delivery_ticket':
      console.warn('⚠️ Delivery Tickets table no longer exists - treating as invoice');
      // Fall through to invoice case
      return {
        tableName: TABLE_NAMES.INVOICEHEADERS,
        fields: FIELD_IDS.INVOICEHEADERS,
        rawTextField: FIELD_IDS.INVOICEHEADERS.DOCUMENT_RAW_TEXT,
      };
    case 'store_receiver':
      console.warn('⚠️ Store Receivers table no longer exists - treating as invoice');
      // Fall through to invoice case
      return {
        tableName: TABLE_NAMES.INVOICEHEADERS,
        fields: FIELD_IDS.INVOICEHEADERS,
        rawTextField: FIELD_IDS.INVOICEHEADERS.DOCUMENT_RAW_TEXT,
      };
    default:
      throw new Error(`Unknown document type: ${documentType}`);
  }
}

/**
 * Create an Airtable record for a parsed document using the existing API
 */
export async function createDocumentRecord(
  doc: ParsedDocument,
  fileRecordId: string,
  documentRawText: string
): Promise<string> {
  const config = getTableConfig(doc.document_type);
  
  // Build the fields object using field names instead of IDs
  const fields: Record<string, any> = {};
  
  // Link to the source file - use field name
  fields['Files'] = [fileRecordId];
  
  // Set the document raw text based on document type
  if (doc.document_type === 'invoice') {
    fields['Document Raw Text'] = documentRawText;
  } else if (doc.document_type === 'delivery_ticket') {
    fields['Raw Text OCR'] = documentRawText;
  } else if (doc.document_type === 'store_receiver') {
    fields['Document Raw Text'] = documentRawText;
  }
  
  // Common fields across all document types - UPDATED for new schema
  if (doc.invoice_number) {
    fields['AP-Invoice-Number'] = doc.invoice_number; // New field name
  }
  
  if (doc.vendor_name) {
    fields['Vendor Name'] = doc.vendor_name;
  }
  
  if (doc.invoice_date) {
    fields['Invoice-Date'] = doc.invoice_date; // New field name
  }
  
  if (doc.amount) {
    // Parse amount to number
    const amountNum = parseFloat(doc.amount);
    if (!isNaN(amountNum)) {
      fields['Total-Invoice-Amount'] = amountNum; // New field name
    }
  }
  
  // Team assignment - DEPRECATED in new schema
  // Teams table no longer exists, so we skip this
  if (doc.team) {
    console.warn(`⚠️ Team field ignored (Teams table no longer exists): ${doc.team}`);
    // const teamRecordId = await findTeamByName(doc.team);
    // if (teamRecordId) {
    //   fields['Team'] = [teamRecordId];
    //   console.log(`✅ Linked to team: ${doc.team} (${teamRecordId})`);
    // } else {
    //   console.warn(`⚠️ Team not found: ${doc.team}`);
    // }
  }
  
  // Set default status to 'Pending' (new schema uses capitalized values)
  fields['Status'] = 'Pending';
  
  console.log(`📤 Creating ${doc.document_type} record in ${config.tableName}:`, {
    invoiceNumber: doc.invoice_number,
    vendor: doc.vendor_name,
    amount: doc.amount,
    team: doc.team,
  });
  
  // Create the record using the existing API
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const url = `${baseUrl}/api/airtable/${encodeURIComponent(config.tableName)}?baseId=${BASE_ID}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ fields }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create ${doc.document_type} record: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const recordId = data.records?.[0]?.id || data.id;
  console.log(`✅ Created ${doc.document_type} record: ${recordId}`);
  
  return recordId;
}

/**
 * Update the file record to link to created documents using the existing API
 * 
 * NOTE: In new schema, Files link to InvoiceHeaders only
 * Delivery Tickets and Store Receivers tables no longer exist
 */
export async function linkDocumentsToFile(
  fileRecordId: string,
  documents: { type: string; id: string }[]
): Promise<void> {
  // Filter for invoice documents only (new schema)
  const invoiceIds = documents
    .filter(doc => doc.type === 'invoice')
    .map(doc => doc.id);
  
  if (invoiceIds.length === 0) {
    console.log('⚠️ No invoice documents to link');
    return;
  }
  
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const url = `${baseUrl}/api/airtable/Files?baseId=${BASE_ID}`;
  
  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      records: [{
        id: fileRecordId,
        fields: {
          'InvoiceHeaderID': invoiceIds, // Correct field name from schema
        },
      }]
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to link documents to file: ${response.status} - ${errorText}`);
  }

  console.log(`✅ Linked ${invoiceIds.length} invoice(s) to file ${fileRecordId}`);
}

/**
 * Create InvoiceDetails records for an invoice's line items
 */
export async function createInvoiceDetails(
  doc: ParsedDocument,
  invoiceHeaderId: string
): Promise<string[]> {
  // Only create details for invoices with line items
  if (doc.document_type !== 'invoice' || !doc.line_items || doc.line_items.length === 0) {
    console.log('⚠️ No line items to create for this document');
    return [];
  }

  console.log(`\n📋 Creating ${doc.line_items.length} invoice detail record(s)...`);
  
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const url = `${baseUrl}/api/airtable/InvoiceDetails?baseId=${BASE_ID}`;
  
  const createdDetailIds: string[] = [];
  
  for (let i = 0; i < doc.line_items.length; i++) {
    const lineItem = doc.line_items[i];
    
    // Build fields object for InvoiceDetails using exact Airtable field names
    const fields: Record<string, any> = {
      'InvoiceHeaders': [invoiceHeaderId], // Link to parent invoice
    };
    
    // Map line item fields to exact Airtable field names from schema
    if (lineItem.line_number !== null) {
      fields['Line-Number'] = lineItem.line_number;
    }
    
    if (lineItem.item_no !== null) {
      fields['Item-No'] = lineItem.item_no;
    }
    
    if (lineItem.item_description !== null) {
      fields['Item-Description'] = lineItem.item_description;
    }
    
    if (lineItem.quantity_invoiced !== null) {
      fields['Quantity-Invoiced'] = lineItem.quantity_invoiced;
    }
    
    if (lineItem.invoice_price !== null) {
      fields['Invoice-Price'] = lineItem.invoice_price;
    }
    
    if (lineItem.quantity_invoiced !== null) {
      // Invoice-Pricing-Qty: Use same as quantity invoiced for now
      // These may be different units/measures but we don't have separate data yet
      fields['Invoice-Pricing-Qty'] = lineItem.quantity_invoiced;
    }
    
    if (lineItem.line_amount !== null) {
      fields['Line-Amount'] = lineItem.line_amount;
    }
    
    if (lineItem.po_number !== null) {
      fields['PO-Number'] = lineItem.po_number;
    }
    
    if (lineItem.expacct !== null) {
      fields['Expacct'] = lineItem.expacct;
    }
    
    // Also add common fields from the invoice header for reference
    if (doc.invoice_number) {
      fields['AP-Invoice-Number'] = doc.invoice_number;
    }
    
    // VendId will be populated later when vendor ID lookup is implemented
    // Leaving empty for now
    
    console.log(`  Creating detail ${i + 1}/${doc.line_items.length}: Line ${lineItem.line_number || 'N/A'} - ${lineItem.item_description || 'N/A'}`);
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fields }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`  ❌ Failed to create detail record: ${response.status} - ${errorText}`);
        continue; // Continue with next line item even if one fails
      }

      const data = await response.json();
      const recordId = data.records?.[0]?.id || data.id;
      createdDetailIds.push(recordId);
      console.log(`  ✅ Created detail record: ${recordId}`);
    } catch (error) {
      console.error(`  ❌ Error creating detail record:`, error);
      continue; // Continue with next line item
    }
  }
  
  console.log(`✅ Created ${createdDetailIds.length}/${doc.line_items.length} invoice detail record(s)\n`);
  
  return createdDetailIds;
}

