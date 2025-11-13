/**
 * Script to fetch 4 invoices from Airtable and output their full GPT prompts
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { createPOMatchingPrompt } from './src/lib/po-matching/openai-matcher';
import { TABLE_IDS } from './src/lib/airtable/schema-types';

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

// Fetch 4 invoices from Airtable
async function fetchInvoices(baseId: string, token: string) {
  const TABLE_ID = TABLE_IDS.INVOICES;
  
  const url = `https://api.airtable.com/v0/${baseId}/${TABLE_ID}?maxRecords=4&sort[0][field]=Created-At&sort[0][direction]=desc`;
  
  console.log('📥 Fetching 4 invoices from Airtable...');
  console.log(`   Base ID: ${baseId.substring(0, 6)}...`);
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch invoices: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  
  if (!data.records || data.records.length === 0) {
    throw new Error('No invoices found in Airtable');
  }

  console.log(`✅ Found ${data.records.length} invoice(s)`);
  
  return data.records;
}

// Extract and process invoice data
function processInvoiceData(invoice: any) {
  // Filter out null/empty fields
  const nonNullFields: Record<string, any> = {};
  Object.entries(invoice.fields).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      nonNullFields[key] = value;
    }
  });

  // Extract MatchPayloadJSON
  const matchPayloadRaw = nonNullFields['MatchPayloadJSON'];
  delete nonNullFields['MatchPayloadJSON'];

  let matchPayload: any = {};
  if (matchPayloadRaw) {
    try {
      matchPayload = typeof matchPayloadRaw === 'string' 
        ? JSON.parse(matchPayloadRaw) 
        : matchPayloadRaw;
    } catch (error) {
      console.warn(`⚠️  Warning: Failed to parse MatchPayloadJSON for invoice ${invoice.id}, using empty object`);
      matchPayload = {};
    }
  }

  return { invoiceData: nonNullFields, matchPayload };
}

// Main function
async function main() {
  console.log('🚀 Outputting GPT Prompts for 4 Invoices\n');
  console.log('='.repeat(80));
  
  // Load environment variables
  const env = loadEnv();
  const baseId = env.AIRTABLE_BASE_ID || env.NEXT_PUBLIC_AIRTABLE_BASE_ID;
  const token = env.AIRTABLE_PAT;

  if (!baseId) {
    throw new Error('AIRTABLE_BASE_ID not found in .env.local');
  }
  if (!token) {
    throw new Error('AIRTABLE_PAT not found in .env.local');
  }

  // Fetch invoices
  const invoices = await fetchInvoices(baseId, token);
  
  // Process each invoice and generate prompts
  for (let i = 0; i < invoices.length; i++) {
    const invoice = invoices[i];
    const { invoiceData, matchPayload } = processInvoiceData(invoice);
    
    console.log(`\n${'='.repeat(80)}`);
    console.log(`📄 INVOICE ${i + 1} of ${invoices.length}`);
    console.log('='.repeat(80));
    console.log(`   ID: ${invoice.id}`);
    console.log(`   Invoice Number: ${invoice.fields['Invoice-Number'] || 'N/A'}`);
    console.log(`   Vendor: ${invoice.fields['Vendor-Name'] || 'N/A'}`);
    console.log(`   Fields: ${Object.keys(invoiceData).length}`);
    console.log(`   Match Payload Keys: ${Object.keys(matchPayload).length}`);
    
    // Generate prompt using the actual function from the codebase
    const prompt = createPOMatchingPrompt(invoiceData, matchPayload);
    
    console.log(`\n📝 FULL PROMPT:`);
    console.log('-'.repeat(80));
    console.log(prompt);
    console.log('-'.repeat(80));
    console.log(`\n📏 Prompt Length: ${prompt.length} characters`);
    
    if (i < invoices.length - 1) {
      console.log('\n');
    }
  }
  
  console.log(`\n${'='.repeat(80)}`);
  console.log('✅ COMPLETE');
  console.log('='.repeat(80));
}

main().catch(error => {
  console.error('\n❌ Error:', error);
  process.exit(1);
});


