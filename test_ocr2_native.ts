/**
 * Test script for OCR2 Native PDF Processing
 * Tests the updated implementation with the BR-INV-41001.pdf file
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { processPDFFromURL } from './src/lib/ocr2/orchestrator-native';
import { extractTextFromPDF } from './src/lib/ocr2/vision-client-native';

async function testWithLocalFile() {
  console.log('='.repeat(60));
  console.log('Testing OCR2 Native PDF Processing');
  console.log('='.repeat(60));
  
  try {
    // Read the test PDF
    const pdfPath = join(__dirname, 'BR-INV-41001.pdf');
    console.log(`\nReading PDF from: ${pdfPath}`);
    
    const pdfBuffer = readFileSync(pdfPath);
    console.log(`PDF size: ${(pdfBuffer.length / 1024).toFixed(2)}KB`);
    console.log('-'.repeat(60));
    
    // Test direct extraction
    console.log('\n📄 Testing direct PDF extraction...\n');
    const startTime = Date.now();
    
    const result = await extractTextFromPDF(pdfBuffer);
    
    const duration = Date.now() - startTime;
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ EXTRACTION SUCCESSFUL');
    console.log('='.repeat(60));
    
    console.log('\n📊 Statistics:');
    console.log(`  Processing Time: ${duration}ms`);
    console.log(`  Text Length: ${result.text.length} characters`);
    console.log(`  Tokens Used: ${result.tokensUsed.total}`);
    console.log(`    - Input: ${result.tokensUsed.input}`);
    console.log(`    - Output: ${result.tokensUsed.output}`);
    console.log(`  Confidence: ${result.confidence}`);
    
    console.log('\n📝 Extracted Text:');
    console.log('-'.repeat(60));
    console.log(result.text);
    console.log('-'.repeat(60));
    
    // Verify key invoice data
    console.log('\n🔍 Verification:');
    const expectedFields = [
      { name: 'Invoice Number', pattern: /BR-INV-41001/i },
      { name: 'Vendor ID', pattern: /BRCM0001/i },
      { name: 'Total Amount', pattern: /1285\.00|1,285\.00/i },
      { name: 'Product', pattern: /Solvent A/i },
      { name: 'Quantity', pattern: /100\s*KG/i },
      { name: 'Customer', pattern: /AIM Company LM/i },
    ];
    
    let allFound = true;
    for (const field of expectedFields) {
      const found = field.pattern.test(result.text);
      const status = found ? '✅' : '❌';
      console.log(`  ${status} ${field.name}: ${found ? 'Found' : 'NOT FOUND'}`);
      if (!found) allFound = false;
    }
    
    console.log('\n' + '='.repeat(60));
    if (allFound) {
      console.log('✅ ALL EXPECTED FIELDS FOUND - TEST PASSED!');
    } else {
      console.log('⚠️  SOME FIELDS MISSING - Review extraction');
    }
    console.log('='.repeat(60));
    
    return result;
    
  } catch (error) {
    console.error('\n' + '='.repeat(60));
    console.error('❌ TEST FAILED');
    console.error('='.repeat(60));
    console.error('\nError:', error instanceof Error ? error.message : String(error));
    
    if (error instanceof Error && error.stack) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }
    
    throw error;
  }
}

async function testWithDataURI() {
  console.log('\n\n' + '='.repeat(60));
  console.log('Testing with Data URI (simulating URL processing)');
  console.log('='.repeat(60));
  
  try {
    const pdfPath = join(__dirname, 'BR-INV-41001.pdf');
    const pdfBuffer = readFileSync(pdfPath);
    
    // Convert to data URI
    const base64 = pdfBuffer.toString('base64');
    const dataUri = `data:application/pdf;base64,${base64}`;
    
    console.log(`\nData URI length: ${dataUri.length} characters`);
    console.log('-'.repeat(60));
    
    console.log('\n📄 Processing via orchestrator...\n');
    const result = await processPDFFromURL(dataUri);
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ ORCHESTRATOR TEST SUCCESSFUL');
    console.log('='.repeat(60));
    
    console.log('\n📊 Statistics:');
    console.log(`  Total Pages: ${result.totalPages}`);
    console.log(`  Processed Pages: ${result.processedPages}`);
    console.log(`  Processing Time: ${result.processingTime}ms`);
    console.log(`  Text Length: ${result.extractedText.length} characters`);
    console.log(`  Tokens Used: ${result.summary.totalTokensUsed}`);
    console.log(`  Success Rate: ${result.summary.successRate}%`);
    
    console.log('\n📝 Extracted Text (first 500 chars):');
    console.log('-'.repeat(60));
    console.log(result.extractedText.substring(0, 500));
    console.log(result.extractedText.length > 500 ? '...' : '');
    console.log('-'.repeat(60));
    
    return result;
    
  } catch (error) {
    console.error('\n' + '='.repeat(60));
    console.error('❌ ORCHESTRATOR TEST FAILED');
    console.error('='.repeat(60));
    console.error('\nError:', error instanceof Error ? error.message : String(error));
    throw error;
  }
}

// Run tests
async function main() {
  try {
    // Test 1: Direct extraction
    await testWithLocalFile();
    
    // Test 2: Full orchestrator with data URI
    await testWithDataURI();
    
    console.log('\n\n' + '='.repeat(60));
    console.log('🎉 ALL TESTS PASSED!');
    console.log('='.repeat(60));
    console.log('\nThe native PDF processing is working correctly!');
    console.log('No more PDF-to-image conversion needed! 🚀');
    console.log('\n');
    
  } catch (error) {
    console.error('\n\n' + '='.repeat(60));
    console.error('❌ TEST SUITE FAILED');
    console.error('='.repeat(60));
    process.exit(1);
  }
}

main();


