/**
 * Comprehensive test script for Status-Modified-Time field
 * Tests various query scenarios
 * Run with: node test-status-modified-time-comprehensive.js
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env.local') });

const BASE_ID = process.env.AIRTABLE_BASE_ID;
const PAT = process.env.AIRTABLE_PAT;

if (!BASE_ID || !PAT) {
  console.error('❌ Error: AIRTABLE_BASE_ID and AIRTABLE_PAT required');
  process.exit(1);
}

async function queryAirtable(formula, description) {
  const url = `https://api.airtable.com/v0/${BASE_ID}/Invoices?filterByFormula=${encodeURIComponent(formula)}&maxRecords=10&sort[0][field]=Status-Modified-Time&sort[0][direction]=desc`;
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${PAT}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`HTTP ${response.status}: ${errorData.error?.message || response.statusText}`);
  }

  return await response.json();
}

async function runTests() {
  console.log('🧪 Comprehensive Status-Modified-Time Query Tests\n');
  console.log(`   Base ID: ${BASE_ID}\n`);
  
  const tests = [
    {
      name: 'Past 10 seconds',
      formula: `IS_AFTER({Status-Modified-Time}, "${new Date(Date.now() - 10 * 1000).toISOString()}")`,
      description: 'Invoices with status updated in the past 10 seconds'
    },
    {
      name: 'Past 1 minute',
      formula: `IS_AFTER({Status-Modified-Time}, "${new Date(Date.now() - 60 * 1000).toISOString()}")`,
      description: 'Invoices with status updated in the past 1 minute'
    },
    {
      name: 'Past 1 hour',
      formula: `IS_AFTER({Status-Modified-Time}, "${new Date(Date.now() - 60 * 60 * 1000).toISOString()}")`,
      description: 'Invoices with status updated in the past 1 hour'
    },
    {
      name: 'Past 24 hours',
      formula: `IS_AFTER({Status-Modified-Time}, "${new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()}")`,
      description: 'Invoices with status updated in the past 24 hours'
    },
    {
      name: 'Has Status-Modified-Time',
      formula: `{Status-Modified-Time}`,
      description: 'Invoices that have a Status-Modified-Time value (not empty)'
    }
  ];

  for (const test of tests) {
    try {
      console.log(`\n📋 Test: ${test.name}`);
      console.log(`   Description: ${test.description}`);
      console.log(`   Formula: ${test.formula}`);
      
      const data = await queryAirtable(test.formula, test.description);
      
      console.log(`   ✅ Found ${data.records.length} invoice(s)`);
      
      if (data.records.length > 0 && data.records.length <= 3) {
        data.records.forEach((record, index) => {
          const fields = record.fields;
          console.log(`\n      ${index + 1}. RecordID: ${fields['RecordID'] || 'N/A'}`);
          console.log(`         Invoice: ${fields['Invoice-Number'] || 'N/A'}`);
          console.log(`         Status: ${fields['Status'] || 'N/A'}`);
          console.log(`         Status-Modified-Time: ${fields['Status-Modified-Time'] || 'N/A'}`);
        });
      } else if (data.records.length > 3) {
        console.log(`   (Showing first 3 of ${data.records.length} results)`);
        data.records.slice(0, 3).forEach((record, index) => {
          const fields = record.fields;
          console.log(`\n      ${index + 1}. RecordID: ${fields['RecordID'] || 'N/A'}, Status: ${fields['Status'] || 'N/A'}, Modified: ${fields['Status-Modified-Time'] || 'N/A'}`);
        });
      }
    } catch (error) {
      console.error(`   ❌ Error: ${error.message}`);
    }
  }
  
  console.log('\n\n📝 Usage Examples:\n');
  console.log('// Query invoices with status updated in past 10 seconds');
  console.log('const tenSecondsAgo = new Date(Date.now() - 10 * 1000).toISOString();');
  console.log('const formula = `IS_AFTER({Status-Modified-Time}, "${tenSecondsAgo}")`;');
  console.log('const response = await fetch(`/api/airtable/Invoices?filterByFormula=${encodeURIComponent(formula)}`);');
  console.log('\n// Query invoices with status updated in past hour');
  console.log('const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();');
  console.log('const formula = `IS_AFTER({Status-Modified-Time}, "${oneHourAgo}")`;');
}

runTests().catch(console.error);

