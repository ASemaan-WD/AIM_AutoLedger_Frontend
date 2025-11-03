/**
 * Post-OCR Processing Workflow
 * 
 * Takes a processed file record and:
 * 1. Parses the raw OCR text with LLM
 * 2. Creates Airtable records for each document
 * 3. Handles single vs multiple documents
 * 4. Links documents back to the file
 */

import { parseDocuments, extractSingleDocumentText } from '../llm/parser';
import { getFileRecord, createDocumentRecord, linkDocumentsToFile, createInvoiceDetails } from './airtable-helpers';
import { FIELD_IDS } from '../airtable/schema-types';
import type { ParsedDocument } from '../llm/schemas';

export interface ProcessFileResult {
  success: boolean;
  fileRecordId: string;
  documentsCreated: number;
  documentIds: { type: string; id: string }[];
  detailsCreated?: number; // Track number of invoice details created
  error?: string;
  details?: any;
}

/**
 * Main post-OCR processing function
 * 
 * @param fileRecordId - Airtable record ID of the processed file
 * @returns Processing result with created document IDs
 */
export async function processPostOCR(fileRecordId: string): Promise<ProcessFileResult> {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🚀 Starting post-OCR processing for file: ${fileRecordId}`);
  console.log(`${'='.repeat(60)}\n`);

  try {
    // Step 1: Fetch the file record
    console.log('📂 Step 1: Fetching file record from Airtable...');
    const fileRecord = await getFileRecord(fileRecordId);
    
    // Try both field name and field ID for raw text
    const rawText = fileRecord.fields['Raw Text'] || fileRecord.fields[FIELD_IDS.FILES.RAW_TEXT];
    
    if (!rawText || rawText.trim().length === 0) {
      throw new Error('File record has no raw text - OCR may not have completed');
    }
    
    console.log(`✅ File record fetched. Raw text length: ${rawText.length} chars\n`);

    // Step 2: Parse documents with LLM
    console.log('🤖 Step 2: Parsing OCR text with LLM...');
    const parsedDocuments = await parseDocuments(rawText);
    
    if (parsedDocuments.length === 0) {
      throw new Error('LLM did not extract any documents from the text');
    }
    
    console.log(`✅ Parsed ${parsedDocuments.length} document(s)\n`);
    
    // Log what we found
    parsedDocuments.forEach((doc, idx) => {
      console.log(`Document ${idx + 1}:`, {
        type: doc.document_type,
        vendor: doc.vendor_name || 'unknown',
        invoiceNumber: doc.invoice_number || 'none',
        amount: doc.amount || 'unknown',
        team: doc.team || 'none',
      });
    });
    console.log();

    // Step 3: Determine if single or multiple documents
    const isMultipleDocuments = parsedDocuments.length > 1;
    
    if (isMultipleDocuments) {
      console.log('📄 Multiple documents detected - will extract individual text for each\n');
    } else {
      console.log('📄 Single document detected - using full raw text\n');
    }

    // Step 4: Create Airtable records
    console.log('💾 Step 3: Creating Airtable records...');
    const createdDocuments: { type: string; id: string }[] = [];
    let totalDetailsCreated = 0;
    
    for (let i = 0; i < parsedDocuments.length; i++) {
      const doc = parsedDocuments[i];
      console.log(`\n  Processing document ${i + 1}/${parsedDocuments.length}...`);
      
      let documentRawText: string;
      
      if (isMultipleDocuments) {
        // Extract individual document text
        console.log(`  🔍 Extracting text for individual document...`);
        documentRawText = await extractSingleDocumentText(rawText, doc);
        console.log(`  ✅ Extracted ${documentRawText.length} chars`);
      } else {
        // Use full raw text for single document
        documentRawText = rawText;
        console.log(`  ✅ Using full file text (${documentRawText.length} chars)`);
      }
      
      // Create the Airtable record for the invoice header
      const recordId = await createDocumentRecord(doc, fileRecordId, documentRawText);
      
      createdDocuments.push({
        type: doc.document_type,
        id: recordId,
      });
      
      // If this is an invoice with line items, create invoice details
      if (doc.document_type === 'invoice' && doc.line_items && doc.line_items.length > 0) {
        console.log(`\n  📋 Processing ${doc.line_items.length} line item(s) for invoice...`);
        const detailIds = await createInvoiceDetails(doc, recordId);
        totalDetailsCreated += detailIds.length;
        console.log(`  ✅ Created ${detailIds.length} invoice detail record(s)`);
      }
    }
    
    console.log(`\n✅ Created ${createdDocuments.length} Airtable record(s)\n`);

    // Step 5: Link documents back to file
    console.log('🔗 Step 4: Linking documents to file record...');
    await linkDocumentsToFile(fileRecordId, createdDocuments);
    console.log('✅ Documents linked to file\n');

    console.log(`${'='.repeat(60)}`);
    console.log(`✅ Post-OCR processing completed successfully!`);
    console.log(`   File: ${fileRecordId}`);
    console.log(`   Documents created: ${createdDocuments.length}`);
    if (totalDetailsCreated > 0) {
      console.log(`   Invoice details created: ${totalDetailsCreated}`);
    }
    console.log(`${'='.repeat(60)}\n`);

    return {
      success: true,
      fileRecordId,
      documentsCreated: createdDocuments.length,
      documentIds: createdDocuments,
      detailsCreated: totalDetailsCreated,
      details: {
        documents: parsedDocuments.map((doc, idx) => ({
          index: idx + 1,
          type: doc.document_type,
          vendor: doc.vendor_name,
          invoiceNumber: doc.invoice_number,
          amount: doc.amount,
          recordId: createdDocuments[idx]?.id,
          lineItemsCount: doc.line_items?.length || 0,
        })),
      },
    };
    
  } catch (error) {
    console.error('\n❌ Post-OCR processing failed:', error);
    
    return {
      success: false,
      fileRecordId,
      documentsCreated: 0,
      documentIds: [],
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

