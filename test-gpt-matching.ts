/**
 * Test script to run GPT matching on one invoice record
 * Calls GPT, then creates POInvoiceHeader and POInvoiceDetail records in Airtable
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { generatePOMatches } from './src/lib/po-matching/openai-matcher';
import { createPOInvoiceHeadersAndDetails } from './src/lib/po-matching/airtable-creator';
import { TABLE_IDS, TABLE_NAMES, FIELD_NAMES } from './src/lib/airtable/schema-types';

// Load environment variables from .env.local
function loadEnv() {
  try {
    const envPath = join(process.cwd(), '.env.local');
    const envContent = readFileSync(envPath, 'utf-8');
    const env: Record<string, string> = {};
    
    envContent.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          env[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
        }
      }
    });
    
    return env;
  } catch (error) {
    console.error('Error loading .env.local:', error);
    process.exit(1);
  }
}

// Fetch an invoice from Airtable
async function fetchInvoice(baseId: string, token: string, invoiceId?: string) {
  const TABLE_ID = TABLE_IDS.INVOICES;
  
  let url: string;
  if (invoiceId) {
    // Fetch specific invoice by ID
    url = `https://api.airtable.com/v0/${baseId}/${TABLE_ID}/${invoiceId}`;
  } else {
    // Fetch latest invoice
    url = `https://api.airtable.com/v0/${baseId}/${TABLE_ID}?maxRecords=1&sort[0][field]=Created-At&sort[0][direction]=desc`;
  }
  
  console.log('📥 Fetching invoice from Airtable...');
  console.log(`   Base ID: ${baseId.substring(0, 6)}...`);
  if (invoiceId) {
    console.log(`   Invoice ID: ${invoiceId}`);
  } else {
    console.log(`   Fetching latest invoice...`);
  }
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch invoice: ${response.status} - ${errorText}`);
  }

  const data = invoiceId 
    ? await response.json() // Single record response
    : (await response.json()).records?.[0]; // Array response, get first record
  
  if (!data) {
    throw new Error('No invoice found in Airtable');
  }

  const invoice = invoiceId ? data : data;
  console.log(`✅ Found invoice: ${invoice.id}`);
  console.log(`   Invoice Number: ${invoice.fields['Invoice-Number'] || 'N/A'}`);
  console.log(`   Vendor: ${invoice.fields['Vendor-Name'] || 'N/A'}`);
  
  return invoice;
}

// Extract and process invoice data (same logic as processor)
function processInvoiceData(invoice: any) {
  // Filter out null/empty fields
  const nonNullFields: Record<string, any> = {};
  Object.entries(invoice.fields).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      nonNullFields[key] = value;
    }
  });

  // Extract MatchPayloadJSON
  const matchPayloadRaw = nonNullFields[FIELD_NAMES.INVOICES.MATCH_PAYLOAD_JSON] || 
                          nonNullFields['MatchPayloadJSON'];
  
  // Remove MatchPayloadJSON from invoice fields
  delete nonNullFields[FIELD_NAMES.INVOICES.MATCH_PAYLOAD_JSON];
  delete nonNullFields['MatchPayloadJSON'];

  let matchPayload: any = {};
  if (matchPayloadRaw) {
    try {
      matchPayload = typeof matchPayloadRaw === 'string' 
        ? JSON.parse(matchPayloadRaw) 
        : matchPayloadRaw;
      console.log(`   ✅ Parsed MatchPayloadJSON`);
    } catch (error) {
      console.warn('   ⚠️  Warning: Failed to parse MatchPayloadJSON, using empty object');
      matchPayload = {};
    }
  } else {
    console.log(`   ⚠️  No MatchPayloadJSON found, using empty object`);
  }

  return { invoiceData: nonNullFields, matchPayload };
}

// Create records in Airtable
async function createRecordsInAirtable(
  baseId: string,
  token: string,
  tableName: string,
  records: Array<{ fields: Record<string, any> }>
): Promise<{ records: Array<{ id: string }> }> {
  const tableId = tableName === TABLE_NAMES.POINVOICEHEADERS 
    ? TABLE_IDS.POINVOICEHEADERS 
    : TABLE_IDS.POINVOICEDETAILS;
  
  const url = `https://api.airtable.com/v0/${baseId}/${tableId}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ records }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create records in ${tableName}: ${response.status} - ${errorText}`);
  }

  return await response.json();
}

// Update invoice record in Airtable
async function updateInvoiceInAirtable(
  baseId: string,
  token: string,
  invoiceId: string,
  fields: Record<string, any>
): Promise<void> {
  const url = `https://api.airtable.com/v0/${baseId}/${TABLE_IDS.INVOICES}`;
  
  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
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
    throw new Error(`Failed to update invoice ${invoiceId}: ${response.status} - ${errorText}`);
  }
}

// Main function
async function main() {
  console.log('🚀 Testing GPT Matching on Real Invoice\n');
  console.log('='.repeat(70));
  
  // Load environment variables
  const env = loadEnv();
  const baseId = env.AIRTABLE_BASE_ID || env.NEXT_PUBLIC_AIRTABLE_BASE_ID;
  const token = env.AIRTABLE_PAT;
  const openaiKey = env.OPENAI_API_KEY;

  if (!baseId) {
    throw new Error('AIRTABLE_BASE_ID not found in .env.local');
  }
  if (!token) {
    throw new Error('AIRTABLE_PAT not found in .env.local');
  }
  if (!openaiKey) {
    throw new Error('OPENAI_API_KEY not found in .env.local');
  }

  // Allow passing invoice ID as command line argument
  const invoiceId = process.argv[2];

  // Fetch invoice
  const invoice = await fetchInvoice(baseId, token, invoiceId);
  
  // Process invoice data
  const { invoiceData, matchPayload } = processInvoiceData(invoice);
  
  console.log(`\n📊 Invoice Data Summary:`);
  console.log(`   Non-null fields: ${Object.keys(invoiceData).length}`);
  console.log(`   Match Payload keys: ${Object.keys(matchPayload).length}`);
  if (Object.keys(matchPayload).length > 0) {
    console.log(`   Match Payload preview:`, JSON.stringify(matchPayload).substring(0, 200) + '...');
  }
  
  // Call GPT matching
  console.log('\n' + '='.repeat(70));
  console.log('🤖 Calling OpenAI GPT Matching...');
  console.log('='.repeat(70));
  
  try {
    const gptResponse = await generatePOMatches(invoiceData, matchPayload);
    
    console.log('\n' + '='.repeat(70));
    console.log('✅ GPT RESPONSE:');
    console.log('='.repeat(70));
    console.log('\n' + JSON.stringify(gptResponse, null, 2));
    console.log('\n' + '='.repeat(70));
    
    console.log('\n📊 Response Summary:');
    console.log(`   Invoice Line Items: ${gptResponse['Invoice Line Items']?.length || 0}`);
    console.log(`   Headers: ${gptResponse.headers?.length || 0}`);
    
    if (gptResponse.headers && gptResponse.headers.length > 0) {
      const totalDetails = gptResponse.headers.reduce((sum, h) => sum + (h.details?.length || 0), 0);
      console.log(`   Total Details: ${totalDetails}`);
      
      gptResponse.headers.forEach((header, idx) => {
        console.log(`\n   Header ${idx + 1}:`);
        console.log(`     PO-Number: ${header['PO-Number'] || 'N/A'}`);
        console.log(`     VendId: ${header['VendId'] || 'N/A'}`);
        console.log(`     Details: ${header.details?.length || 0}`);
      });
    }
    
    // Now create the records in Airtable
    console.log('\n' + '='.repeat(70));
    console.log('📝 Creating Records in Airtable...');
    console.log('='.repeat(70));
    
    const createRecordsFn = (tableName: string, records: Array<{ fields: Record<string, any> }>) => 
      createRecordsInAirtable(baseId, token, tableName, records);
    
    const { headerIds, detailIds } = await createPOInvoiceHeadersAndDetails(
      gptResponse.headers,
      invoice.id,
      createRecordsFn
    );
    
    // Update Invoice with Line Items JSON and Error Description
    const updateFields: Record<string, any> = {};
    if (gptResponse['Invoice Line Items'] && gptResponse['Invoice Line Items'].length > 0) {
      updateFields['Line Items'] = JSON.stringify(gptResponse['Invoice Line Items']);
    }
    if (gptResponse.error_description && gptResponse.error_description.trim() !== '') {
      updateFields['Error-Description'] = gptResponse.error_description;
    }
    
    if (Object.keys(updateFields).length > 0) {
      console.log('\n' + '='.repeat(70));
      console.log('📝 Updating Invoice with Line Items and Error Description...');
      console.log('='.repeat(70));
      
      try {
        await updateInvoiceInAirtable(
          baseId,
          token,
          invoice.id,
          updateFields
        );
        console.log(`✅ Updated Invoice ${invoice.id}`);
        if (updateFields['Line Items']) {
          console.log(`   - Line Items: ${gptResponse['Invoice Line Items'].length} items`);
        }
        if (updateFields['Error-Description']) {
          console.log(`   - Error Description: ${gptResponse.error_description}`);
        }
      } catch (error) {
        console.warn('⚠️  Warning: Failed to update Invoice:', error);
      }
    }
    
    console.log('\n' + '='.repeat(70));
    console.log('✅ RECORDS CREATED IN AIRTABLE:');
    console.log('='.repeat(70));
    console.log(`\n📋 POInvoiceHeaders (${headerIds.length}):`);
    headerIds.forEach((id, idx) => {
      console.log(`   ${idx + 1}. ${id}`);
    });
    
    console.log(`\n📋 POInvoiceDetails (${detailIds.length}):`);
    detailIds.forEach((id, idx) => {
      console.log(`   ${idx + 1}. ${id}`);
    });
    
    console.log('\n' + '='.repeat(70));
    console.log('✅ TEST COMPLETED SUCCESSFULLY!');
    console.log('='.repeat(70));
    console.log(`\n📊 Final Summary:`);
    console.log(`   Invoice ID: ${invoice.id}`);
    console.log(`   Headers Created: ${headerIds.length}`);
    console.log(`   Details Created: ${detailIds.length}`);
    console.log(`   Each header is linked to invoice: ${invoice.id}`);
    console.log(`   Each detail is linked to its parent header`);
    
  } catch (error) {
    console.error('\n❌ Error:', error);
    if (error instanceof Error) {
      console.error('   Message:', error.message);
      console.error('   Stack:', error.stack);
    }
    process.exit(1);
  }
}

main().catch(error => {
  console.error('\n❌ Fatal Error:', error);
  process.exit(1);
});

