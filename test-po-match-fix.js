/**
 * Test script to verify PO matching fix
 * Tests invoice recVM0HJxFqUeaA8N
 */

const BASE_URL = process.env.VERCEL_URL || 'https://acom-aim-j51obccfw-matinesfahani-3361s-projects.vercel.app';
const INVOICE_ID = 'recVM0HJxFqUeaA8N';

async function testPOMatching() {
  console.log('🧪 Testing PO Matching Fix');
  console.log('=' .repeat(50));
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Invoice ID: ${INVOICE_ID}`);
  console.log('');

  try {
    // Step 1: Verify invoice exists and has MatchPayloadJSON
    console.log('Step 1: Fetching invoice record...');
    const invoiceResponse = await fetch(`${BASE_URL}/api/airtable/Invoices/${INVOICE_ID}?baseId=app5C8mBoJu9FLJ57`);
    const invoice = await invoiceResponse.json();
    
    if (!invoice.fields) {
      console.error('❌ Invoice not found or has no fields');
      return;
    }
    
    console.log(`✅ Invoice found with ${Object.keys(invoice.fields).length} fields`);
    console.log(`   Has MatchPayloadJSON: ${!!invoice.fields.MatchPayloadJSON}`);
    console.log('');

    // Step 2: Call PO matching endpoint
    console.log('Step 2: Calling PO matching endpoint...');
    const startTime = Date.now();
    
    const matchResponse = await fetch(`${BASE_URL}/api/match-invoice`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        invoiceId: INVOICE_ID,
      }),
    });

    const duration = Date.now() - startTime;
    const result = await matchResponse.json();
    
    console.log(`   Response status: ${matchResponse.status}`);
    console.log(`   Duration: ${duration}ms`);
    console.log('');

    // Step 3: Check results
    console.log('Step 3: Results');
    console.log('=' .repeat(50));
    
    if (result.success) {
      console.log('✅ PO Matching succeeded!');
      console.log(`   Headers created: ${result.headers?.count || 0}`);
      console.log(`   Details created: ${result.details?.count || 0}`);
      
      if (result.headers?.ids?.length > 0) {
        console.log(`   Header IDs: ${result.headers.ids.join(', ')}`);
      }
      if (result.details?.ids?.length > 0) {
        console.log(`   Detail IDs: ${result.details.ids.slice(0, 5).join(', ')}${result.details.ids.length > 5 ? '...' : ''}`);
      }
    } else {
      console.error('❌ PO Matching failed!');
      console.error(`   Error: ${result.error}`);
      
      // Check if it's the old FIELD_NAMES error
      if (result.error?.includes('Cannot read properties of undefined')) {
        console.error('\n⚠️  This appears to be the FIELD_NAMES error.');
        console.error('   The deployment may not have completed yet.');
        console.error('   Please wait a few minutes and try again.');
      }
    }
    
    console.log('');
    console.log('=' .repeat(50));
    
  } catch (error) {
    console.error('❌ Test failed with error:');
    console.error(error.message);
    if (error.stack) {
      console.error(error.stack);
    }
  }
}

// Run the test
testPOMatching();

