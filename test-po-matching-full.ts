/**
 * Test Script: Full PO Matching with Record Creation Logging
 * 
 * Usage: npx tsx test-po-matching-full.ts <invoiceId>
 * 
 * This script:
 * 1. Fetches an invoice from Airtable
 * 2. Calls OpenAI to generate PO matches
 * 3. Logs the GPT response
 * 4. Creates POInvoiceHeader and POInvoiceDetail records in Airtable
 * 5. Updates the Invoice with Error Description
 * 6. Displays detailed logs of all operations
 */

import dotenv from 'dotenv';
import { generatePOMatches } from './src/lib/po-matching/openai-matcher';
import { createPOInvoiceHeadersAndDetails } from './src/lib/po-matching/airtable-creator';
import { TABLE_NAMES, FIELD_NAMES } from './src/lib/airtable/schema-types';
import { GPTMatchingResponse } from './src/lib/types/po-matching';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

// Load environment variables
const BASE_ID = process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID || process.env.AIRTABLE_BASE_ID;
const AIRTABLE_TOKEN = process.env.AIRTABLE_PAT;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!BASE_ID || !AIRTABLE_TOKEN || !OPENAI_API_KEY) {
  console.error('❌ Missing required environment variables:');
  if (!BASE_ID) console.error('   - AIRTABLE_BASE_ID or NEXT_PUBLIC_AIRTABLE_BASE_ID');
  if (!AIRTABLE_TOKEN) console.error('   - AIRTABLE_PAT');
  if (!OPENAI_API_KEY) console.error('   - OPENAI_API_KEY');
  process.exit(1);
}

/**
 * Fetch an invoice record from Airtable using REST API
 */
async function fetchInvoice(invoiceId: string): Promise<any> {
  console.log(`📥 Fetching invoice ${invoiceId} from Airtable...`);
  
  const url = `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(TABLE_NAMES.INVOICES)}/${invoiceId}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Airtable API error: ${response.status} - ${errorText}`);
    }
    
    const record = await response.json();
    console.log(`✅ Found invoice record`);
    console.log(`   Fields: ${Object.keys(record.fields).length}`);
    return record;
  } catch (error) {
    console.error('❌ Failed to fetch invoice:', error);
    throw error;
  }
}

/**
 * Create records in Airtable using REST API
 */
async function createRecords(
  tableName: string, 
  records: Array<{ fields: Record<string, any> }>
): Promise<{ records: Array<{ id: string; fields: Record<string, any> }> }> {
  console.log(`   📝 Creating ${records.length} record(s) in ${tableName}...`);
  
  try {
    // Airtable batch create (max 10 at a time)
    const batchSize = 10;
    const allCreated: Array<{ id: string; fields: Record<string, any> }> = [];
    
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      const url = `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(tableName)}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ records: batch }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Airtable API error: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      allCreated.push(...data.records);
    }
    
    console.log(`   ✅ Created ${allCreated.length} record(s)`);
    return { records: allCreated };
  } catch (error) {
    console.error(`   ❌ Failed to create records in ${tableName}:`, error);
    throw error;
  }
}

/**
 * Update invoice record using REST API
 */
async function updateInvoice(
  invoiceId: string,
  fields: Record<string, any>
): Promise<void> {
  console.log(`   📝 Updating invoice ${invoiceId}...`);
  console.log(`   Fields to update: ${Object.keys(fields).join(', ')}`);
  
  try {
    const url = `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(TABLE_NAMES.INVOICES)}`;
    
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        records: [{
          id: invoiceId,
          fields,
        }],
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Airtable API error: ${response.status} - ${errorText}`);
    }
    
    console.log(`   ✅ Updated invoice`);
  } catch (error) {
    console.error(`   ❌ Failed to update invoice:`, error);
    throw error;
  }
}

/**
 * Main function
 */
async function main() {
  const invoiceId = process.argv[2];
  
  if (!invoiceId) {
    console.error('❌ Usage: npx tsx test-po-matching-full.ts <invoiceId>');
    console.error('   Example: npx tsx test-po-matching-full.ts recXXXXXXXXXXXXXX');
    process.exit(1);
  }
  
  if (!invoiceId.startsWith('rec')) {
    console.error('❌ Invoice ID must be an Airtable record ID (starts with "rec")');
    process.exit(1);
  }
  
  console.log('🚀 Full PO Matching Test\n');
  console.log('='.repeat(80));
  console.log();
  
  try {
    // Step 1: Fetch invoice
    console.log('STEP 1: Fetch Invoice');
    console.log('-'.repeat(80));
    const invoiceRecord = await fetchInvoice(invoiceId);
    
    if (!invoiceRecord || !invoiceRecord.fields) {
      throw new Error(`Invoice ${invoiceId} not found or has no fields`);
    }
    console.log();
    
    // Step 2: Filter non-null fields
    console.log('STEP 2: Filter Non-Null Fields');
    console.log('-'.repeat(80));
    const nonNullFields: Record<string, any> = {};
    Object.entries(invoiceRecord.fields).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        nonNullFields[key] = value;
      }
    });
    console.log(`✅ Kept ${Object.keys(nonNullFields).length} non-null fields`);
    console.log(`   Fields: ${Object.keys(nonNullFields).join(', ')}`);
    console.log();
    
    // Step 3: Extract MatchPayloadJSON
    console.log('STEP 3: Extract MatchPayloadJSON');
    console.log('-'.repeat(80));
    const matchPayloadRaw = nonNullFields[FIELD_NAMES.INVOICES.MATCH_PAYLOAD_JSON] || 
                            nonNullFields['MatchPayloadJSON'];
    
    if (!matchPayloadRaw) {
      console.warn('⚠️  Warning: No MatchPayloadJSON found');
    }
    
    let matchPayload: any = {};
    if (matchPayloadRaw) {
      try {
        matchPayload = typeof matchPayloadRaw === 'string' 
          ? JSON.parse(matchPayloadRaw) 
          : matchPayloadRaw;
        console.log(`✅ Parsed match payload`);
        console.log(`   Total receipts: ${matchPayload.matchingReceipts?.length || 0}`);
        if (matchPayload.vendorInfo) {
          console.log(`   Vendor: ${matchPayload.vendorInfo.vendorName || 'N/A'}`);
        }
      } catch (error) {
        console.warn('⚠️  Warning: Failed to parse MatchPayloadJSON');
      }
    }
    
    delete nonNullFields[FIELD_NAMES.INVOICES.MATCH_PAYLOAD_JSON];
    delete nonNullFields['MatchPayloadJSON'];
    console.log();
    
    // Step 4: Call OpenAI
    console.log('STEP 4: Call OpenAI for PO Matching');
    console.log('-'.repeat(80));
    const startTime = Date.now();
    const gptResponse: GPTMatchingResponse = await generatePOMatches(nonNullFields, matchPayload);
    const duration = Date.now() - startTime;
    
    console.log(`✅ OpenAI responded in ${duration}ms`);
    console.log();
    
    // Display GPT Response
    console.log('='.repeat(80));
    console.log('📋 GPT RESPONSE');
    console.log('='.repeat(80));
    console.log();
    console.log(JSON.stringify(gptResponse, null, 2));
    console.log();
    console.log('='.repeat(80));
    console.log();
    
    // Response summary
    console.log('RESPONSE SUMMARY');
    console.log('-'.repeat(80));
    console.log(`Headers: ${gptResponse.headers.length}`);
    
    let totalMatches = 0;
    gptResponse.headers.forEach((header, idx) => {
      const matches = header.details.reduce((sum, lineArray) => sum + lineArray.length, 0);
      totalMatches += matches;
      console.log(`   Header ${idx + 1}: PO ${header['PO-Number'] || 'N/A'} - ${matches} match(es)`);
    });
    
    console.log(`Total match objects: ${totalMatches}`);
    
    if (gptResponse.error) {
      console.log(`⚠️  Error: ${gptResponse.error}`);
    } else {
      console.log(`✅ No errors reported`);
    }
    console.log();
    
    // Step 5: Create records in Airtable
    console.log('STEP 5: Create Records in Airtable');
    console.log('-'.repeat(80));
    const { headerIds, detailIds } = await createPOInvoiceHeadersAndDetails(
      gptResponse.headers,
      invoiceId,
      matchPayload,
      createRecords
    );
    console.log();
    
    console.log('CREATED RECORDS');
    console.log('-'.repeat(80));
    console.log(`✅ Headers created: ${headerIds.length}`);
    headerIds.forEach((id, idx) => {
      console.log(`   ${idx + 1}. ${id}`);
    });
    console.log();
    console.log(`✅ Details created: ${detailIds.length}`);
    detailIds.forEach((id, idx) => {
      console.log(`   ${idx + 1}. ${id}`);
    });
    console.log();
    
    // Step 6: Update Invoice with Error Description
    if (gptResponse.error && gptResponse.error.trim() !== '') {
      console.log('STEP 6: Update Invoice with Error Description');
      console.log('-'.repeat(80));
      await updateInvoice(invoiceId, {
        'Error Description': gptResponse.error
      });
      console.log();
    }
    
    // Final summary
    console.log('='.repeat(80));
    console.log('✅ PO MATCHING COMPLETED SUCCESSFULLY');
    console.log('='.repeat(80));
    console.log();
    console.log('SUMMARY:');
    console.log(`   Invoice: ${invoiceId}`);
    console.log(`   Headers created: ${headerIds.length}`);
    console.log(`   Details created: ${detailIds.length}`);
    console.log(`   Duration: ${duration}ms`);
    if (gptResponse.error) {
      console.log(`   Errors: Yes`);
      console.log(`   Error message: ${gptResponse.error}`);
    } else {
      console.log(`   Errors: None`);
    }
    console.log();
    
    console.log('🔗 View in Airtable:');
    console.log(`   Invoice: https://airtable.com/${BASE_ID}/${TABLE_NAMES.INVOICES}/${invoiceId}`);
    headerIds.forEach((id, idx) => {
      console.log(`   Header ${idx + 1}: https://airtable.com/${BASE_ID}/${TABLE_NAMES.POINVOICEHEADERS}/${id}`);
    });
    console.log();
    
  } catch (error) {
    console.error('\n❌ ERROR:', error);
    if (error instanceof Error) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Run the script
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

