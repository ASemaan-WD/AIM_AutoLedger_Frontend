/**
 * LLM-based document parser using OpenAI structured outputs
 */

import { openai, MODEL } from '../openai';
import { DocumentArraySchema, type ParsedDocument, type DocumentArrayResponse } from './schemas';
import { createParsePrompt, createExtractDocTextPrompt } from './prompts';

/**
 * Parse raw OCR text into structured document objects
 * Returns an array of parsed documents
 */
export async function parseDocuments(rawText: string): Promise<ParsedDocument[]> {
  if (!rawText || rawText.trim().length === 0) {
    throw new Error('Raw text is empty or missing');
  }

  try {
    console.log(`🤖 Calling OpenAI to parse OCR text (${rawText.length} chars)`);
    
    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "user",
          content: createParsePrompt(rawText)
        }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "DocumentArray",
          schema: DocumentArraySchema,
          strict: true,
        },
      },
      // Note: temperature parameter removed - gpt-5 only supports default (1)
    });

    const content = completion.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('No content returned from OpenAI');
    }

    console.log(`📦 Received response from OpenAI: ${content.substring(0, 200)}...`);
    
    const parsed = JSON.parse(content) as DocumentArrayResponse;
    
    if (!parsed.documents || !Array.isArray(parsed.documents)) {
      throw new Error('Invalid response structure: missing documents array');
    }

    console.log(`✅ Successfully parsed ${parsed.documents.length} document(s)`);
    
    return parsed.documents;
  } catch (error) {
    console.error('❌ Error parsing documents with LLM:', error);
    throw error;
  }
}

/**
 * Extract the text belonging to a specific document from multi-document OCR text
 * Used when a file contains multiple documents
 */
export async function extractSingleDocumentText(
  rawText: string, 
  doc: ParsedDocument
): Promise<string> {
  if (!rawText || rawText.trim().length === 0) {
    throw new Error('Raw text is empty or missing');
  }

  try {
    console.log(`🔍 Extracting text for document: ${doc.document_type} - ${doc.invoice_number || 'no number'}`);
    
    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "user",
          content: createExtractDocTextPrompt(rawText, doc)
        }
      ],
      // Note: temperature parameter removed - gpt-5 only supports default (1)
    });

    const extractedText = completion.choices[0]?.message?.content || '';
    
    console.log(`✅ Extracted ${extractedText.length} chars for individual document`);
    
    return extractedText.trim();
  } catch (error) {
    console.error('❌ Error extracting document text:', error);
    throw error;
  }
}






