/**
 * Script to fetch a real invoice from Airtable and generate the GPT prompt
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { createPOMatchingPrompt } from '../src/lib/po-matching/openai-matcher';

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
async function fetchInvoice(baseId: string, token: string) {
  const TABLE_ID = 'tblokyH2U1PBhhCE9'; // Invoices table ID
  
  const url = `https://api.airtable.com/v0/${baseId}/${TABLE_ID}?maxRecords=1&sort[0][field]=Created-At&sort[0][direction]=desc`;
  
  console.log('📥 Fetching latest invoice from Airtable...');
  console.log(`   Base ID: ${baseId.substring(0, 6)}...`);
  
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

  const data = await response.json();
  
  if (!data.records || data.records.length === 0) {
    throw new Error('No invoices found in Airtable');
  }

  const invoice = data.records[0];
  console.log(`✅ Found invoice: ${invoice.id}`);
  console.log(`   Invoice Number: ${invoice.fields['Invoice-Number'] || 'N/A'}`);
  console.log(`   Vendor: ${invoice.fields['Vendor-Name'] || 'N/A'}`);
  
  return invoice;
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
  const matchPayloadRaw = nonNullFields['MatchPayloadJSON'] || nonNullFields['MatchPayloadJSON'];
  delete nonNullFields['MatchPayloadJSON'];

  let matchPayload: any = {};
  if (matchPayloadRaw) {
    try {
      matchPayload = typeof matchPayloadRaw === 'string' 
        ? JSON.parse(matchPayloadRaw) 
        : matchPayloadRaw;
    } catch (error) {
      console.warn('⚠️  Warning: Failed to parse MatchPayloadJSON, using empty object');
      matchPayload = {};
    }
  }

  return { invoiceData: nonNullFields, matchPayload };
}

// Main function
async function main() {
  console.log('🚀 Generating GPT Prompt from Real Airtable Data\n');
  console.log('='.repeat(60));
  
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

  // Fetch invoice
  const invoice = await fetchInvoice(baseId, token);
  
  // Process invoice data
  const { invoiceData, matchPayload } = processInvoiceData(invoice);
  
  console.log(`\n📊 Invoice Data Summary:`);
  console.log(`   Fields: ${Object.keys(invoiceData).length}`);
  console.log(`   Match Payload: ${Object.keys(matchPayload).length > 0 ? 'Present' : 'Empty'}`);
  
  // Generate prompt using the actual function from the codebase
  const { createPOMatchingPrompt } = await import('./src/lib/po-matching/openai-matcher');
  const prompt = createPOMatchingPrompt(invoiceData, matchPayload);

  console.log('\n' + '='.repeat(60));
  console.log('📝 GENERATED GPT PROMPT:');
  console.log('='.repeat(60));
  console.log('\n' + prompt);
  console.log('\n' + '='.repeat(60));
  console.log(`\n📏 Prompt Length: ${prompt.length} characters`);
  console.log(`📊 Invoice Fields: ${Object.keys(invoiceData).length}`);
  console.log(`📦 Match Payload Keys: ${Object.keys(matchPayload).length}`);
}

main().catch(error => {
  console.error('\n❌ Error:', error);
  process.exit(1);
});

