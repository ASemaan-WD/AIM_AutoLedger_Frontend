#!/usr/bin/env node

/**
 * Test script for native PDF processing
 * Tests the new OpenAI native PDF support implementation
 */

import { processPDFFromURL } from '../src/lib/ocr2/orchestrator-native.js';
import { testPDFSupport } from '../src/lib/ocr2/vision-client-native.js';
import { createLogger } from '../src/lib/ocr2/logger.js';

const logger = createLogger('TestNative');

async function main() {
  console.log('\n' + '='.repeat(80));
  console.log('🧪 Testing Native PDF Processing Implementation');
  console.log('='.repeat(80) + '\n');

  try {
    // Test 1: Check OpenAI PDF support
    console.log('📋 Test 1: Checking OpenAI PDF support...');
    const isPDFSupported = await testPDFSupport();
    
    if (isPDFSupported) {
      console.log('✅ OpenAI PDF support is working!\n');
    } else {
      console.log('❌ OpenAI PDF support test failed!\n');
      process.exit(1);
    }

    // Test 2: Process a test PDF
    // You can provide a PDF URL as a command line argument
    const testPdfUrl = process.argv[2];
    
    if (!testPdfUrl) {
      console.log('⚠️  No PDF URL provided for full test.');
      console.log('Usage: node test-native-pdf.js <PDF_URL>');
      console.log('\nBasic tests passed! ✅\n');
      process.exit(0);
    }

    console.log('📋 Test 2: Processing test PDF...');
    console.log(`📄 URL: ${testPdfUrl.substring(0, 80)}...\n`);

    const startTime = Date.now();
    const result = await processPDFFromURL(testPdfUrl);
    const duration = Date.now() - startTime;

    console.log('\n' + '='.repeat(80));
    console.log('✅ PDF PROCESSING COMPLETED SUCCESSFULLY');
    console.log('='.repeat(80));
    console.log(`⏱️  Total Time: ${(duration / 1000).toFixed(2)}s`);
    console.log(`📊 Pages: ${result.totalPages}`);
    console.log(`📝 Extracted Text Length: ${result.extractedText.length} characters`);
    console.log(`🎯 Tokens Used: ${result.summary.totalTokensUsed}`);
    console.log(`   - Input: ${result.summary.totalTokensUsed - (result.extractedText.length / 4)}`);
    console.log(`   - Output: ~${Math.round(result.extractedText.length / 4)}`);
    console.log(`📈 Success Rate: ${result.summary.successRate}%`);
    console.log('='.repeat(80));
    
    console.log('\n📄 First 500 characters of extracted text:');
    console.log('-'.repeat(80));
    console.log(result.extractedText.substring(0, 500));
    console.log('-'.repeat(80));

    console.log('\n✅ All tests passed!\n');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Test failed with error:');
    console.error(error);
    console.error('');
    process.exit(1);
  }
}

main();





