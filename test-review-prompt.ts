/**
 * Test Script: Review PO Matching Prompt
 * 
 * Usage: npx tsx test-review-prompt.ts <invoiceId>
 * 
 * This script fetches an invoice from Airtable and displays the complete
 * prompt that would be sent to OpenAI for PO matching, without actually
 * calling OpenAI.
 */

import dotenv from 'dotenv';
import { createPOMatchingPrompt } from './src/lib/po-matching/openai-matcher';
import { POMatchingJSONSchema } from './src/lib/types/po-matching';
import { TABLE_NAMES, FIELD_NAMES } from './src/lib/airtable/schema-types';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

// Load environment variables
const BASE_ID = process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID || process.env.AIRTABLE_BASE_ID;
const AIRTABLE_TOKEN = process.env.AIRTABLE_PAT;

if (!BASE_ID || !AIRTABLE_TOKEN) {
  console.error('❌ Missing required environment variables:');
  if (!BASE_ID) console.error('   - AIRTABLE_BASE_ID or NEXT_PUBLIC_AIRTABLE_BASE_ID');
  if (!AIRTABLE_TOKEN) console.error('   - AIRTABLE_PAT');
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
    console.log(`✅ Found invoice record\n`);
    return record;
  } catch (error) {
    console.error('❌ Failed to fetch invoice:', error);
    throw error;
  }
}

/**
 * Main function
 */
async function main() {
  const invoiceId = process.argv[2];
  
  if (!invoiceId) {
    console.error('❌ Usage: npx tsx test-review-prompt.ts <invoiceId>');
    console.error('   Example: npx tsx test-review-prompt.ts recXXXXXXXXXXXXXX');
    process.exit(1);
  }
  
  if (!invoiceId.startsWith('rec')) {
    console.error('❌ Invoice ID must be an Airtable record ID (starts with "rec")');
    process.exit(1);
  }
  
  console.log('🔍 PO Matching Prompt Review\n');
  console.log('='.repeat(80));
  console.log();
  
  try {
    // Fetch the invoice
    const invoiceRecord = await fetchInvoice(invoiceId);
    
    if (!invoiceRecord || !invoiceRecord.fields) {
      throw new Error(`Invoice ${invoiceId} not found or has no fields`);
    }
    
    // Filter out null/empty fields
    console.log('🔍 Filtering non-null fields...');
    const nonNullFields: Record<string, any> = {};
    Object.entries(invoiceRecord.fields).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        nonNullFields[key] = value;
      }
    });
    console.log(`   Kept ${Object.keys(nonNullFields).length} non-null fields\n`);
    
    // Extract and parse MatchPayloadJSON
    console.log('📦 Extracting MatchPayloadJSON...');
    const matchPayloadRaw = nonNullFields[FIELD_NAMES.INVOICES.MATCH_PAYLOAD_JSON] || 
                            nonNullFields['MatchPayloadJSON'];
    
    if (!matchPayloadRaw) {
      console.warn('   ⚠️  Warning: No MatchPayloadJSON found, using empty object');
    }
    
    let matchPayload: any = {};
    if (matchPayloadRaw) {
      try {
        matchPayload = typeof matchPayloadRaw === 'string' 
          ? JSON.parse(matchPayloadRaw) 
          : matchPayloadRaw;
        console.log(`   ✅ Parsed match payload`);
        console.log(`   - Total receipts: ${matchPayload.matchingReceipts?.length || 0}`);
        console.log(`   - Vendor info: ${matchPayload.vendorInfo ? 'Yes' : 'No'}\n`);
      } catch (error) {
        console.warn('   ⚠️  Warning: Failed to parse MatchPayloadJSON, using empty object\n');
      }
    }
    
    // Remove MatchPayloadJSON from invoice fields
    delete nonNullFields[FIELD_NAMES.INVOICES.MATCH_PAYLOAD_JSON];
    delete nonNullFields['MatchPayloadJSON'];
    
    // Generate the prompt
    console.log('📝 Generating prompt...\n');
    const prompt = createPOMatchingPrompt(nonNullFields, matchPayload);
    
    // Display the prompt
    console.log('='.repeat(80));
    console.log('📋 COMPLETE PROMPT TO OPENAI');
    console.log('='.repeat(80));
    console.log();
    console.log('SYSTEM MESSAGE:');
    console.log('-'.repeat(80));
    console.log('You are an expert at matching invoices to purchase orders and generating structured ERP import data.');
    console.log();
    console.log('USER MESSAGE:');
    console.log('-'.repeat(80));
    console.log(prompt);
    console.log();
    console.log('='.repeat(80));
    console.log();
    
    // Display prompt statistics
    console.log('📊 PROMPT STATISTICS');
    console.log('='.repeat(80));
    console.log(`Total characters: ${prompt.length.toLocaleString()}`);
    console.log(`Estimated tokens: ~${Math.ceil(prompt.length / 4).toLocaleString()}`);
    console.log(`Invoice fields: ${Object.keys(nonNullFields).length}`);
    console.log(`Matching receipts: ${matchPayload.matchingReceipts?.length || 0}`);
    console.log();
    
    // Display the schema
    console.log('='.repeat(80));
    console.log('📋 JSON SCHEMA (Structured Outputs)');
    console.log('='.repeat(80));
    console.log();
    console.log(JSON.stringify(POMatchingJSONSchema, null, 2));
    console.log();
    console.log('='.repeat(80));
    console.log();
    
    console.log('✅ Prompt review complete!');
    console.log();
    console.log('💡 Tips:');
    console.log('   - Review the invoice data to ensure all necessary fields are present');
    console.log('   - Check that matchingReceipts array has the expected PO receipt data');
    console.log('   - Verify the schema matches your Airtable field requirements');
    console.log();
    
  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

// Run the script
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

