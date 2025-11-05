/**
 * Simple test script for OCR2 Native PDF Processing
 * Tests the updated implementation with the BR-INV-41001.pdf file
 * Directly uses OpenAI without the full config system
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import OpenAI from 'openai';

// Check for API key
const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.error('❌ Error: OPENAI_API_KEY environment variable is required');
  console.error('Please set it in your environment or .env.local file');
  process.exit(1);
}

const client = new OpenAI({ apiKey });

async function extractTextFromPDF(pdfBuffer: Buffer) {
  let fileId: string | null = null;
  
  try {
    const sizeMB = pdfBuffer.length / (1024 * 1024);
    console.log(`\n📤 Uploading PDF to OpenAI (${sizeMB.toFixed(2)}MB)...`);

    // Step 1: Upload the PDF file to OpenAI
    const file = await client.files.create({
      file: new File([pdfBuffer], 'document.pdf', { type: 'application/pdf' }),
      purpose: 'assistants'
    });
    
    fileId = file.id;
    console.log(`✅ PDF uploaded successfully (File ID: ${fileId})`);

    // Step 2: Use the Chat Completions API with the file
    console.log(`\n🤖 Processing PDF with GPT-4o...`);
    
    const startTime = Date.now();
    const response = await client.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Extract ALL text from this PDF document. Preserve the original formatting, spacing, and layout as much as possible. 

Instructions:
- Include all visible text from every page
- Preserve tables, lists, headers, and footers
- Maintain paragraph breaks and section divisions
- Include page numbers if visible
- If a page break is detected, indicate it with "--- PAGE BREAK ---"
- Do not add any commentary or explanations
- Return only the extracted text

Return the complete text extraction.`
            },
            {
              type: 'file',
              file: {
                file_id: fileId
              }
            },
          ],
        },
      ],
      max_tokens: 16000,
      temperature: 0.1,
    });

    const duration = Date.now() - startTime;
    const extractedText = response.choices[0]?.message?.content?.trim() || '';
    
    // Step 3: Clean up - delete the file
    try {
      await client.files.delete(fileId);
      console.log(`🗑️  Cleaned up uploaded file`);
    } catch (cleanupError) {
      console.warn(`⚠️  Failed to delete uploaded file: ${fileId}`);
    }

    return {
      text: extractedText,
      tokensUsed: {
        input: response.usage?.prompt_tokens || 0,
        output: response.usage?.completion_tokens || 0,
        total: response.usage?.total_tokens || 0,
      },
      processingTime: duration
    };

  } catch (error) {
    // Clean up file on error if it was uploaded
    if (fileId) {
      try {
        await client.files.delete(fileId);
        console.log(`🗑️  Cleaned up uploaded file after error`);
      } catch (cleanupError) {
        // Ignore cleanup errors
      }
    }
    
    throw error;
  }
}

async function main() {
  console.log('='.repeat(60));
  console.log('Testing OCR2 Native PDF Processing');
  console.log('Using OpenAI Files API + Chat Completions');
  console.log('='.repeat(60));
  
  try {
    // Read the test PDF
    const pdfPath = join(process.cwd(), 'BR-INV-41001.pdf');
    console.log(`\n📁 Reading PDF from: ${pdfPath}`);
    
    const pdfBuffer = readFileSync(pdfPath);
    console.log(`   File size: ${(pdfBuffer.length / 1024).toFixed(2)}KB`);
    
    // Extract text
    const result = await extractTextFromPDF(pdfBuffer);
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ EXTRACTION SUCCESSFUL');
    console.log('='.repeat(60));
    
    console.log('\n📊 Statistics:');
    console.log(`  Processing Time: ${result.processingTime}ms (${(result.processingTime / 1000).toFixed(2)}s)`);
    console.log(`  Text Length: ${result.text.length} characters`);
    console.log(`  Tokens Used: ${result.tokensUsed.total}`);
    console.log(`    - Input Tokens: ${result.tokensUsed.input}`);
    console.log(`    - Output Tokens: ${result.tokensUsed.output}`);
    
    console.log('\n📝 Extracted Text:');
    console.log('-'.repeat(60));
    console.log(result.text);
    console.log('-'.repeat(60));
    
    // Verify key invoice data
    console.log('\n🔍 Verification - Checking for key invoice fields:');
    const expectedFields = [
      { name: 'Invoice Number', pattern: /BR-INV-41001/i },
      { name: 'Vendor ID', pattern: /BRCM0001/i },
      { name: 'Total Amount', pattern: /1285\.00|1,285\.00|1285/i },
      { name: 'Product', pattern: /Solvent A/i },
      { name: 'Quantity', pattern: /\|\s*100\s*\|\s*KG|100\s*KG/i },
      { name: 'Customer', pattern: /AIM Company LM/i },
      { name: 'Invoice Date', pattern: /2025-10-22/i },
      { name: 'Due Date', pattern: /2025-11-21/i },
      { name: 'PO Number', pattern: /00041001/i },
      { name: 'Unit Price', pattern: /12\.50/i },
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
      console.log('🎉 ALL EXPECTED FIELDS FOUND - TEST PASSED!');
      console.log('='.repeat(60));
      console.log('\n✨ The native PDF processing works perfectly!');
      console.log('   No more PDF-to-image conversion needed! 🚀');
      console.log('   Faster, cheaper, and more accurate! 💪\n');
    } else {
      console.log('⚠️  SOME FIELDS MISSING - Review extraction');
      console.log('='.repeat(60));
    }
    
  } catch (error) {
    console.error('\n' + '='.repeat(60));
    console.error('❌ TEST FAILED');
    console.error('='.repeat(60));
    console.error('\nError:', error instanceof Error ? error.message : String(error));
    
    if (error instanceof Error && error.stack) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }
    
    process.exit(1);
  }
}

main();

