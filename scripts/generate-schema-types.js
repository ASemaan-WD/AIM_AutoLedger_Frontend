/**
 * Generate TypeScript Schema Types from Airtable Schema
 * 
 * This script reads airtable-schema.json and generates TypeScript types
 * in src/lib/airtable/schema-types.ts
 * 
 * Usage:
 *   node scripts/generate-schema-types.js
 * 
 * Prerequisites:
 *   Run fetch-airtable-schema.js first to generate airtable-schema.json
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// File paths
const SCHEMA_FILE = path.join(__dirname, '..', 'airtable-schema.json');
const OUTPUT_FILE = path.join(__dirname, '..', 'src', 'lib', 'airtable', 'schema-types.ts');

// Check if schema file exists
if (!fs.existsSync(SCHEMA_FILE)) {
  console.error('❌ Error: airtable-schema.json not found');
  console.error('Run this first: node scripts/fetch-airtable-schema.js');
  process.exit(1);
}

console.log('🔨 Generating TypeScript schema types...');
console.log('');

/**
 * Read schema file
 */
function readSchema() {
  const content = fs.readFileSync(SCHEMA_FILE, 'utf8');
  return JSON.parse(content);
}

/**
 * Convert table name to constant name (e.g., "Files" -> "FILES")
 */
function toConstantName(name) {
  return name.toUpperCase().replace(/[^A-Z0-9]/g, '_');
}

/**
 * Convert field name to constant name (e.g., "Processing-Status" -> "PROCESSING_STATUS")
 */
function toFieldConstantName(name) {
  return name.toUpperCase().replace(/[^A-Z0-9]/g, '_');
}

/**
 * Generate FIELD_IDS constant
 */
function generateFieldIds(schema) {
  let code = 'export const FIELD_IDS = {\n';
  
  Object.entries(schema.tables).forEach(([tableName, table]) => {
    const tableConst = toConstantName(tableName);
    code += `  ${tableConst}: {\n`;
    
    Object.entries(table.fields).forEach(([fieldName, field]) => {
      const fieldConst = toFieldConstantName(fieldName);
      code += `    ${fieldConst}: '${field.id}',\n`;
    });
    
    code += '  },\n';
  });
  
  code += '} as const;\n\n';
  
  return code;
}

/**
 * Generate TABLE_IDS constant
 */
function generateTableIds(schema) {
  let code = 'export const TABLE_IDS = {\n';
  
  Object.entries(schema.tables).forEach(([tableName, table]) => {
    const tableConst = toConstantName(tableName);
    code += `  ${tableConst}: '${table.id}',\n`;
  });
  
  code += '} as const;\n\n';
  
  return code;
}

/**
 * Generate TABLE_NAMES constant
 */
function generateTableNames(schema) {
  let code = 'export const TABLE_NAMES = {\n';
  
  Object.entries(schema.tables).forEach(([tableName]) => {
    const tableConst = toConstantName(tableName);
    code += `  ${tableConst}: '${tableName}',\n`;
  });
  
  code += '} as const;\n\n';
  
  return code;
}

/**
 * Generate FIELD_NAMES constant
 */
function generateFieldNames(schema) {
  let code = 'export const FIELD_NAMES = {\n';
  
  Object.entries(schema.tables).forEach(([tableName, table]) => {
    const tableConst = toConstantName(tableName);
    code += `  ${tableConst}: {\n`;
    
    Object.entries(table.fields).forEach(([fieldName]) => {
      const fieldConst = toFieldConstantName(fieldName);
      code += `    ${fieldConst}: '${fieldName}',\n`;
    });
    
    code += '  },\n';
  });
  
  code += '} as const;\n\n';
  
  return code;
}

/**
 * Generate status constants (keep existing ones, add new if needed)
 */
function generateStatusConstants() {
  return `// Invoice Status Constants
export const INVOICE_STATUS = {
  PENDING: 'Pending',
  OPEN: 'Matched',
  REVIEWED: 'Reviewed',
  QUEUED: 'Queued',
  APPROVED: 'Approved',
  EXPORTED: 'Exported',
  REJECTED: 'Error',
} as const;

// File Status Constants
export const FILE_STATUS = {
  QUEUED: 'Queued',
  PROCESSING: 'Processing',
  PROCESSED: 'Processed',
  ERROR: 'Error',
} as const;

// File Processing Status Constants (substatus - shows current operation)
export const PROCESSING_STATUS = {
  UPL: 'UPL',           // Uploaded to Vercel
  DETINV: 'DETINV',     // Detecting invoices (OCR)
  PARSE: 'PARSE',       // Parsing invoice data
  RELINV: 'RELINV',     // Relating/finding invoices
  MATCHING: 'MATCHING', // Matching with PO headers
  MATCHED: 'MATCHED',   // Matching complete
  ERROR: 'ERROR',       // Error occurred
} as const;

// User-facing display text for invoice statuses
export type UXStatus = 
  | 'Processing'
  | 'Processed'
  | 'Attention'
  | 'Exported'
  | 'Exporting';

// Maps Airtable status values to user-friendly display text
export const UX_STATUS_MAP = {
  'Pending': 'Processing',
  'Matched': 'Processed',
  'Error': 'Attention',
  'Exported': 'Exported',
  'Queued': 'Exporting',
} as const;

// Maps internal DocumentStatus values to Airtable status values
export const INTERNAL_TO_AIRTABLE_STATUS: Record<string, keyof typeof UX_STATUS_MAP> = {
  'pending': 'Pending',
  'open': 'Matched',
  'queued': 'Queued',
  'reviewed': 'Queued',
  'approved': 'Queued',
  'exported': 'Exported',
  'rejected': 'Error',
};

// Maps user-facing display text to badge colors
export const UX_STATUS_COLORS = {
  'Processing': 'blue',
  'Processed': 'success',
  'Attention': 'error',
  'Exported': 'gray',
  'Exporting': 'warning',
} as const;
`;
}

/**
 * Generate complete TypeScript file
 */
function generateTypeScriptFile(schema) {
  let code = `/**
 * Auto-generated Airtable schema types
 * Generated from airtable-schema.json
 * 
 * Generated: ${new Date().toISOString()}
 * Base ID: ${schema.baseId}
 * 
 * DO NOT EDIT MANUALLY
 * Run 'node scripts/generate-schema-types.js' to regenerate
 */

// ============================================================================
// FIELD IDS - Use these when accessing fields by ID
// ============================================================================

`;

  code += generateFieldIds(schema);
  
  code += `// ============================================================================
// TABLE IDS - Airtable table IDs
// ============================================================================

`;
  
  code += generateTableIds(schema);
  
  code += `// ============================================================================
// TABLE NAMES - Human-readable table names
// ============================================================================

`;
  
  code += generateTableNames(schema);
  
  code += `// ============================================================================
// FIELD NAMES - Human-readable field names
// ============================================================================

`;
  
  code += generateFieldNames(schema);
  
  code += `// ============================================================================
// STATUS CONSTANTS
// ============================================================================

`;
  
  code += generateStatusConstants();
  
  return code;
}

/**
 * Backup existing file
 */
function backupExistingFile() {
  if (fs.existsSync(OUTPUT_FILE)) {
    const backupFile = OUTPUT_FILE.replace('.ts', `.backup-${Date.now()}.ts`);
    fs.copyFileSync(OUTPUT_FILE, backupFile);
    console.log(`📋 Backed up existing file to: ${path.basename(backupFile)}`);
  }
}

/**
 * Write generated code to file
 */
function writeGeneratedCode(code) {
  fs.writeFileSync(OUTPUT_FILE, code, 'utf8');
  console.log(`✅ Generated: ${OUTPUT_FILE}`);
}

/**
 * Display summary
 */
function displaySummary(schema) {
  console.log('');
  console.log('📊 Summary:');
  console.log(`   Tables: ${Object.keys(schema.tables).length}`);
  
  Object.entries(schema.tables).forEach(([tableName, table]) => {
    console.log(`   - ${tableName}: ${Object.keys(table.fields).length} fields`);
  });
  
  console.log('');
  console.log('✨ Schema types updated successfully!');
  console.log('');
  console.log('⚠️  Important:');
  console.log('   - Review the generated file for any changes');
  console.log('   - Update your TypeScript interfaces if needed');
  console.log('   - Test your application to ensure compatibility');
}

/**
 * Main execution
 */
function main() {
  try {
    const schema = readSchema();
    backupExistingFile();
    const code = generateTypeScriptFile(schema);
    writeGeneratedCode(code);
    displaySummary(schema);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();

