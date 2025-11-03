#!/usr/bin/env node

/**
 * Test script for Post-OCR Processing
 * 
 * Usage:
 *   node test-post-ocr.js <file_record_id>
 *   node test-post-ocr.js recXXXXXXXXXXXXXX
 * 
 * This script tests the post-OCR processing endpoint step by step
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

async function testHealthCheck() {
  console.log('\n' + '='.repeat(60));
  console.log('🏥 Step 1: Health Check');
  console.log('='.repeat(60));
  
  try {
    const response = await fetch(`${BASE_URL}/api/post-ocr/process`);
    const data = await response.json();
    
    console.log('✅ Endpoint is available');
    console.log('📊 Configuration:', {
      openai: data.environment?.openai_configured ? '✅ Configured' : '❌ Missing',
      airtable: data.environment?.airtable_configured ? '✅ Configured' : '❌ Missing',
    });
    
    return true;
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    return false;
  }
}

async function processFile(fileRecordId) {
  console.log('\n' + '='.repeat(60));
  console.log(`🚀 Step 2: Process File ${fileRecordId}`);
  console.log('='.repeat(60));
  
  try {
    console.log('⏳ Sending request...\n');
    
    const startTime = Date.now();
    const response = await fetch(`${BASE_URL}/api/post-ocr/process`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        file_record_id: fileRecordId,
      }),
    });
    
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    const data = await response.json();
    
    console.log(`⏱️  Processing took ${elapsed} seconds\n`);
    
    if (data.success) {
      console.log('✅ SUCCESS!\n');
      console.log('📋 Results:');
      console.log(`   File Record: ${data.fileRecordId}`);
      console.log(`   Documents Created: ${data.documentsCreated}`);
      console.log('');
      
      if (data.details?.documents) {
        console.log('📄 Documents:');
        data.details.documents.forEach((doc) => {
          console.log(`   ${doc.index}. ${doc.type.toUpperCase()}`);
          console.log(`      Vendor: ${doc.vendor || 'unknown'}`);
          console.log(`      Invoice #: ${doc.invoiceNumber || 'none'}`);
          console.log(`      Amount: ${doc.amount || 'unknown'}`);
          console.log(`      Record ID: ${doc.recordId}`);
          console.log('');
        });
      }
      
      if (data.documentIds && data.documentIds.length > 0) {
        console.log('🔗 Created Records:');
        data.documentIds.forEach((doc) => {
          console.log(`   ${doc.type}: ${doc.id}`);
        });
        console.log('');
      }
      
      console.log('✅ Check your Airtable base to verify the records!');
    } else {
      console.log('❌ FAILED!\n');
      console.log('Error:', data.error);
      if (data.stack) {
        console.log('\nStack trace:');
        console.log(data.stack);
      }
    }
    
    return data.success;
    
  } catch (error) {
    console.error('❌ Request failed:', error.message);
    return false;
  }
}

async function main() {
  const fileRecordId = process.argv[2];
  
  console.log('\n╔═══════════════════════════════════════════════════════════╗');
  console.log('║        POST-OCR PROCESSING TEST SUITE                    ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');
  
  if (!fileRecordId) {
    console.error('\n❌ Error: Missing file record ID\n');
    console.log('Usage:');
    console.log('  node test-post-ocr.js <file_record_id>');
    console.log('');
    console.log('Example:');
    console.log('  node test-post-ocr.js recXXXXXXXXXXXXXX');
    console.log('');
    console.log('To find a file record ID:');
    console.log('  1. Open your Airtable Files table');
    console.log('  2. Find a file with Status = "Processed"');
    console.log('  3. Copy the record ID (looks like recXXXXXXXXXXXXXX)');
    console.log('');
    process.exit(1);
  }
  
  if (!fileRecordId.startsWith('rec')) {
    console.error('\n❌ Error: Invalid record ID format\n');
    console.log('Record ID must start with "rec"');
    console.log('Example: recXXXXXXXXXXXXXX');
    console.log('');
    process.exit(1);
  }
  
  console.log(`\n📌 Testing with file: ${fileRecordId}`);
  console.log(`🌐 Base URL: ${BASE_URL}`);
  
  // Run tests
  const healthOk = await testHealthCheck();
  
  if (!healthOk) {
    console.log('\n⚠️  Health check failed. Make sure:');
    console.log('   1. Your dev server is running (npm run dev)');
    console.log('   2. OPENAI_API_KEY is set in .env.local');
    console.log('   3. AIRTABLE credentials are configured');
    console.log('');
    process.exit(1);
  }
  
  const success = await processFile(fileRecordId);
  
  console.log('\n' + '='.repeat(60));
  console.log(success ? '✅ ALL TESTS PASSED' : '❌ TESTS FAILED');
  console.log('='.repeat(60) + '\n');
  
  if (success) {
    console.log('Next steps:');
    console.log('  1. Open your Airtable base');
    console.log('  2. Check the appropriate table (Invoices/Delivery Tickets/Store Receivers)');
    console.log('  3. Verify the document fields are populated correctly');
    console.log('  4. Check that the document links back to the file');
    console.log('  5. Test with more files to verify reliability');
    console.log('');
  } else {
    console.log('Troubleshooting:');
    console.log('  1. Check the server console logs for detailed error messages');
    console.log('  2. Verify the file record exists and has raw text');
    console.log('  3. Check OPENAI_API_KEY is valid');
    console.log('  4. Verify Airtable credentials and permissions');
    console.log('  5. Try with a different file record');
    console.log('');
  }
  
  process.exit(success ? 0 : 1);
}

main();





