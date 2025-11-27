/**
 * Fetch Airtable Schema Script
 * 
 * This script fetches the complete schema from your Airtable base including:
 * - All tables
 * - All fields with their IDs, names, and types
 * - Field options and configurations
 * 
 * Usage:
 *   node scripts/fetch-airtable-schema.js
 * 
 * Requirements:
 *   - VITE_AIRTABLE_PAT environment variable (or pass as argument)
 *   - VITE_AIRTABLE_BASE_ID environment variable (or pass as argument)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file if it exists
try {
  const dotenv = await import('dotenv');
  dotenv.config();
} catch (e) {
  console.log('Note: dotenv not installed, using process.env directly');
}

// Configuration
const AIRTABLE_PAT = process.env.VITE_AIRTABLE_PAT || process.argv[2];
const BASE_ID = process.env.VITE_AIRTABLE_BASE_ID || process.argv[3];
const OUTPUT_FILE = path.join(__dirname, '..', 'airtable-schema.json');

// Validate inputs
if (!AIRTABLE_PAT) {
  console.error('❌ Error: VITE_AIRTABLE_PAT not found');
  console.error('Usage: node scripts/fetch-airtable-schema.js [PAT] [BASE_ID]');
  console.error('Or set VITE_AIRTABLE_PAT and VITE_AIRTABLE_BASE_ID in .env');
  process.exit(1);
}

if (!BASE_ID) {
  console.error('❌ Error: VITE_AIRTABLE_BASE_ID not found');
  console.error('Usage: node scripts/fetch-airtable-schema.js [PAT] [BASE_ID]');
  console.error('Or set VITE_AIRTABLE_PAT and VITE_AIRTABLE_BASE_ID in .env');
  process.exit(1);
}

console.log('🔍 Fetching Airtable schema...');
console.log(`   Base ID: ${BASE_ID}`);
console.log('');

/**
 * Fetch schema from Airtable API
 */
async function fetchSchema() {
  try {
    const response = await fetch(
      `https://api.airtable.com/v0/meta/bases/${BASE_ID}/tables`,
      {
        headers: {
          'Authorization': `Bearer ${AIRTABLE_PAT}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Airtable API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('❌ Failed to fetch schema:', error.message);
    throw error;
  }
}

/**
 * Format schema for better readability
 */
function formatSchema(schema) {
  const formatted = {
    fetchedAt: new Date().toISOString(),
    baseId: BASE_ID,
    tables: {}
  };

  schema.tables.forEach(table => {
    formatted.tables[table.name] = {
      id: table.id,
      name: table.name,
      primaryFieldId: table.primaryFieldId,
      fields: {}
    };

    table.fields.forEach(field => {
      formatted.tables[table.name].fields[field.name] = {
        id: field.id,
        name: field.name,
        type: field.type,
        options: field.options || null,
        description: field.description || null
      };
    });
  });

  return formatted;
}

/**
 * Save schema to file
 */
function saveSchema(schema) {
  const formatted = formatSchema(schema);
  const json = JSON.stringify(formatted, null, 2);
  
  fs.writeFileSync(OUTPUT_FILE, json, 'utf8');
  
  return formatted;
}

/**
 * Display summary
 */
function displaySummary(schema) {
  console.log('✅ Schema fetched successfully!');
  console.log('');
  console.log('📊 Summary:');
  console.log(`   Tables: ${schema.tables.length}`);
  console.log('');
  
  schema.tables.forEach(table => {
    console.log(`   📋 ${table.name}`);
    console.log(`      ID: ${table.id}`);
    console.log(`      Fields: ${table.fields.length}`);
    
    // Show first few fields
    const fieldPreview = table.fields.slice(0, 5).map(f => f.name).join(', ');
    console.log(`      → ${fieldPreview}${table.fields.length > 5 ? ', ...' : ''}`);
    console.log('');
  });
  
  console.log(`💾 Schema saved to: ${OUTPUT_FILE}`);
  console.log('');
  console.log('Next steps:');
  console.log('   1. Review the schema file: airtable-schema.json');
  console.log('   2. Run: node scripts/generate-schema-types.js');
  console.log('   3. This will update: src/lib/airtable/schema-types.ts');
}

/**
 * Main execution
 */
async function main() {
  try {
    const schema = await fetchSchema();
    const formatted = saveSchema(schema);
    displaySummary(schema);
    
    // Check for new Processing-Status field
    const filesTable = schema.tables.find(t => t.name === 'Files');
    if (filesTable) {
      const hasProcessingStatus = filesTable.fields.some(f => f.name === 'Processing-Status');
      
      if (!hasProcessingStatus) {
        console.log('⚠️  WARNING: Processing-Status field not found in Files table!');
        console.log('   You need to add this field to Airtable:');
        console.log('   - Field name: Processing-Status');
        console.log('   - Type: Single select');
        console.log('   - Options: UPL, DETINV, PARSE, RELINV, MATCHING, MATCHED, ERROR');
        console.log('');
      } else {
        console.log('✅ Processing-Status field found in Files table');
        console.log('');
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();

