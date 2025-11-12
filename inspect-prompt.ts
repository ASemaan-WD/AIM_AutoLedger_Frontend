/**
 * Script to inspect the GPT prompt and schema for debugging
 * Outputs everything to a markdown file for review
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { createPOMatchingPrompt } from './src/lib/po-matching/openai-matcher';
import { POMatchingJSONSchema } from './src/lib/types/po-matching';
import { TABLE_IDS, FIELD_NAMES } from './src/lib/airtable/schema-types';
import { MODEL } from './src/lib/openai';

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
async function fetchInvoice(baseId: string, token: string, invoiceId: string) {
  const TABLE_ID = TABLE_IDS.INVOICES;
  
  const url = `https://api.airtable.com/v0/${baseId}/${TABLE_ID}/${invoiceId}`;
  
  console.log('📥 Fetching invoice from Airtable...');
  console.log(`   Invoice ID: ${invoiceId}`);
  
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

  const invoice = await response.json();
  
  if (!invoice) {
    throw new Error('No invoice found in Airtable');
  }

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

// Generate markdown output
function generateMarkdown(
  invoiceId: string,
  invoiceData: Record<string, any>,
  matchPayload: any,
  prompt: string,
  schema: any
): string {
  const md = `# GPT Prompt and Schema Inspection

**Generated:** ${new Date().toISOString()}
**Invoice ID:** ${invoiceId}
**Model:** ${MODEL}

---

## Invoice Data

\`\`\`json
${JSON.stringify(invoiceData, null, 2)}
\`\`\`

**Invoice Data Summary:**
- Total fields: ${Object.keys(invoiceData).length}
- Fields with values: ${Object.values(invoiceData).filter(v => v !== null && v !== undefined && v !== '').length}

---

## Match Payload (PO Candidates)

\`\`\`json
${JSON.stringify(matchPayload, null, 2)}
\`\`\`

**Match Payload Summary:**
- Has data: ${Object.keys(matchPayload).length > 0 ? 'Yes' : 'No'}
- Keys: ${Object.keys(matchPayload).join(', ') || 'None'}

---

## System Message

\`\`\`
You are an expert at matching invoices to purchase orders and generating structured ERP import data.
\`\`\`

---

## User Prompt (Sent to GPT)

\`\`\`
${prompt}
\`\`\`

**Prompt Statistics:**
- Length: ${prompt.length} characters
- Lines: ${prompt.split('\\n').length}

---

## JSON Schema (Structured Outputs)

\`\`\`json
${JSON.stringify(schema, null, 2)}
\`\`\`

**Schema Notes:**
- Schema Name: \`POMatchingResponse\` (set in API call)
- Strict Mode: \`true\` (set in API call)
- Required Root Fields: \`${schema.required?.join(', ') || 'None'}\`

### Job-Project-Number Field Analysis

**In Headers Schema:**
- Field Name: \`Job-Project-Number\`
- Type: \`${schema.properties?.headers?.items?.properties?.['Job-Project-Number']?.type || 'N/A'}\`
- Required: \`${schema.properties?.headers?.items?.required?.includes('Job-Project-Number') ? 'Yes ⚠️ (MUST BE PROVIDED)' : 'No (Optional)'}\`
- Description: \`${schema.properties?.headers?.items?.properties?.['Job-Project-Number']?.description || 'None'}\`

**In Details Schema:**
- Field Name: \`Job-Project-Number\`
- Type: \`${schema.properties?.headers?.items?.properties?.details?.items?.properties?.['Job-Project-Number']?.type || 'N/A'}\`
- Required: \`${schema.properties?.headers?.items?.properties?.details?.items?.required?.includes('Job-Project-Number') ? 'Yes ⚠️ (MUST BE PROVIDED)' : 'No (Optional)'}\`
- Description: \`${schema.properties?.headers?.items?.properties?.details?.items?.properties?.['Job-Project-Number']?.description || 'None'}\`

---

## Analysis

### Prompt Instructions Related to Job-Project-Number

Searching the prompt for mentions of "job", "project", or related terms:

${prompt.toLowerCase().includes('job') || prompt.toLowerCase().includes('project') 
  ? '✅ Found mentions of job/project in prompt' 
  : '❌ **NO MENTION** of job/project in prompt instructions'}

### Data Availability

**In Invoice Data:**
${Object.keys(invoiceData).some(k => k.toLowerCase().includes('job') || k.toLowerCase().includes('project'))
  ? `✅ Found job/project related fields: ${Object.keys(invoiceData).filter(k => k.toLowerCase().includes('job') || k.toLowerCase().includes('project')).join(', ')}`
  : '❌ No job/project related fields found in invoice data'}

**In Match Payload:**
${JSON.stringify(matchPayload).toLowerCase().includes('job') || JSON.stringify(matchPayload).toLowerCase().includes('project')
  ? `✅ Found job/project related data in match payload`
  : '❌ No job/project related data found in match payload'}

---

## Full API Request (What OpenAI Receives)

\`\`\`json
{
  "model": "${MODEL}",
  "messages": [
    {
      "role": "system",
      "content": "You are an expert at matching invoices to purchase orders and generating structured ERP import data."
    },
    {
      "role": "user",
      "content": ${JSON.stringify(prompt)}
    }
  ],
  "response_format": {
    "type": "json_schema",
      "json_schema": {
        "name": "POMatchingResponse",
        "schema": ${JSON.stringify(schema, null, 2)},
        "strict": true
      }
  }
}
\`\`\`

---

## Recommendations

1. **Check if Job-Project-Number is in the invoice data** - If it's not present, GPT cannot extract it
2. **Check if Job-Project-Number is in the match payload** - PO receipts may contain this field
3. **Review prompt instructions** - The prompt should explicitly mention extracting Job-Project-Number if it's available
4. **Check schema requirements** - If Job-Project-Number is optional, GPT may omit it if not found

`;

  return md;
}

// Main function
async function main() {
  console.log('🔍 Inspecting GPT Prompt and Schema\n');
  console.log('='.repeat(70));
  
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

  // Get invoice ID from command line
  const invoiceId = process.argv[2];
  if (!invoiceId) {
    throw new Error('Please provide an invoice ID as argument: npx tsx inspect-prompt.ts <invoiceId>');
  }

  // Fetch invoice
  const invoice = await fetchInvoice(baseId, token, invoiceId);
  
  // Process invoice data
  const { invoiceData, matchPayload } = processInvoiceData(invoice);
  
  console.log(`\n📊 Invoice Data Summary:`);
  console.log(`   Non-null fields: ${Object.keys(invoiceData).length}`);
  console.log(`   Match Payload keys: ${Object.keys(matchPayload).length}`);
  
  // Generate prompt using the actual function from the codebase
  const prompt = createPOMatchingPrompt(invoiceData, matchPayload);
  
  // Prepare schema for structured outputs (as it would be sent to OpenAI)
  const schema = POMatchingJSONSchema;
  
  // Generate markdown
  const markdown = generateMarkdown(invoice.id, invoiceData, matchPayload, prompt, schema);
  
  // Write to file
  const outputPath = `prompt-inspection-${invoiceId}-${Date.now()}.md`;
  require('fs').writeFileSync(outputPath, markdown, 'utf-8');
  
  console.log('\n' + '='.repeat(70));
  console.log('✅ PROMPT INSPECTION COMPLETE');
  console.log('='.repeat(70));
  console.log(`\n📄 Output saved to: ${outputPath}`);
  console.log(`\n📊 Summary:`);
  console.log(`   Prompt length: ${prompt.length} characters`);
  console.log(`   Invoice fields: ${Object.keys(invoiceData).length}`);
  console.log(`   Match payload keys: ${Object.keys(matchPayload).length}`);
  console.log(`   Job-Project-Number in prompt: ${prompt.toLowerCase().includes('job') || prompt.toLowerCase().includes('project') ? '✅ Yes' : '❌ No'}`);
  console.log(`   Job-Project-Number in invoice: ${Object.keys(invoiceData).some(k => k.toLowerCase().includes('job') || k.toLowerCase().includes('project')) ? '✅ Yes' : '❌ No'}`);
  console.log(`   Job-Project-Number in match payload: ${JSON.stringify(matchPayload).toLowerCase().includes('job') || JSON.stringify(matchPayload).toLowerCase().includes('project') ? '✅ Yes' : '❌ No'}`);
}

main().catch(error => {
  console.error('\n❌ Error:', error);
  if (error instanceof Error) {
    console.error('   Message:', error.message);
    console.error('   Stack:', error.stack);
  }
  process.exit(1);
});

