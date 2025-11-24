/**
 * Test script to query Airtable for invoices whose status was updated in the past 10 seconds
 * Run with: node test-status-modified-time.js
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env.local') });

const BASE_ID = process.env.AIRTABLE_BASE_ID;
const PAT = process.env.AIRTABLE_PAT;

if (!BASE_ID) {
  console.error('❌ Error: AIRTABLE_BASE_ID not found in environment variables');
  process.exit(1);
}

if (!PAT) {
  console.error('❌ Error: AIRTABLE_PAT not found in environment variables');
  process.exit(1);
}

async function testStatusModifiedTimeQuery() {
  console.log('🔍 Testing Status-Modified-Time query...');
  console.log(`   Base ID: ${BASE_ID}`);
  
  try {
    // Calculate timestamp 10 seconds ago
    const tenSecondsAgo = new Date(Date.now() - 10 * 1000);
    const isoString = tenSecondsAgo.toISOString();
    
    // Airtable formula to check if Status-Modified-Time is within the last 10 seconds
    // Using IS_AFTER to check if the timestamp is after (tenSecondsAgo)
    const formula = `IS_AFTER({Status-Modified-Time}, "${isoString}")`;
    
    console.log(`\n📋 Formula: ${formula}`);
    console.log(`   Looking for invoices updated after: ${isoString}`);
    
    const url = `https://api.airtable.com/v0/${BASE_ID}/Invoices?filterByFormula=${encodeURIComponent(formula)}&maxRecords=10`;
    
    console.log(`\n🌐 Request URL: ${url.replace(PAT, '***')}`);
    
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

    const data = await response.json();
    
    console.log(`\n✅ Query successful!`);
    console.log(`   Found ${data.records.length} invoice(s) with status updated in the past 10 seconds\n`);
    
    if (data.records.length > 0) {
      console.log('📄 Results:');
      data.records.forEach((record, index) => {
        const fields = record.fields;
        console.log(`\n   ${index + 1}. Invoice RecordID: ${fields['RecordID'] || 'N/A'}`);
        console.log(`      Invoice Number: ${fields['Invoice-Number'] || 'N/A'}`);
        console.log(`      Status: ${fields['Status'] || 'N/A'}`);
        console.log(`      Status-Modified-Time: ${fields['Status-Modified-Time'] || 'N/A'}`);
        console.log(`      Modified-At: ${fields['Modified-At'] || 'N/A'}`);
      });
    } else {
      console.log('   No invoices found with status updated in the past 10 seconds.');
      console.log('   This is expected if no status changes occurred recently.');
    }
    
    return data;
  } catch (error) {
    console.error('❌ Error querying Airtable:', error.message);
    if (error.message.includes('INVALID_FORMULA')) {
      console.error('\n💡 Tip: The formula syntax might need adjustment.');
      console.error('   Airtable formulas use field names in curly braces: {Field Name}');
    }
    process.exit(1);
  }
}

testStatusModifiedTimeQuery();

















