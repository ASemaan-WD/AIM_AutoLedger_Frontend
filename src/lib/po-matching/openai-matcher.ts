/**
 * OpenAI integration for PO matching
 * Uses GPT-4o (2024-08-06) with structured outputs to generate POInvoiceHeaders and POInvoiceDetails
 * Structured outputs ensure 100% schema adherence with no hallucinated fields
 */

import { openai, MODEL } from '../openai';
import { GPTMatchingResponse, POMatchingJSONSchema } from '../types/po-matching';

/**
 * Generate structured PO matches using OpenAI
 * @param invoiceData - Non-null invoice fields
 * @param matchPayload - Parsed MatchPayloadJSON containing PO candidates
 * @returns Structured data for creating POInvoiceHeaders and POInvoiceDetails
 */
export async function generatePOMatches(
  invoiceData: Record<string, any>,
  matchPayload: any
): Promise<GPTMatchingResponse> {
  console.log('🤖 Generating PO matches with OpenAI...');
  console.log(`   Invoice data keys: ${Object.keys(invoiceData).length}`);
  console.log(`   Match payload type: ${typeof matchPayload}`);

  try {
    const prompt = createPOMatchingPrompt(invoiceData, matchPayload);
    
    console.log(`   Calling OpenAI (${MODEL}) with ${prompt.length} character prompt`);
    
    // Use Structured Outputs - guarantees schema adherence
    // See: https://platform.openai.com/docs/guides/structured-outputs
    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content: "You are an expert at matching invoices to purchase orders and generating structured ERP import data."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "POMatchingResponse",
          schema: POMatchingJSONSchema,
          strict: true,
        },
      },
      // Note: GPT-5 only supports default temperature (1), cannot set to 0
    });

    // With structured outputs, the response is automatically parsed
    const message = completion.choices[0]?.message;
    
    if (!message) {
      throw new Error('No message returned from OpenAI');
    }

    // Check for refusal (structured outputs may refuse if safety triggered)
    if ('refusal' in message && message.refusal) {
      throw new Error(`OpenAI refused to generate response: ${message.refusal}`);
    }

    // Parse the JSON content
    const content = message.content;
    if (!content) {
      throw new Error('No content returned from OpenAI');
    }

    console.log(`   Received structured output from OpenAI`);
    
    const parsed = JSON.parse(content) as GPTMatchingResponse;
    
    // Validate response structure
    if (!parsed.headers || !Array.isArray(parsed.headers)) {
      throw new Error('Invalid response: missing or invalid headers array');
    }
    if (typeof parsed.error !== 'string') {
      throw new Error('Invalid response: missing or invalid error field');
    }

    const totalDetails = parsed.headers.reduce((sum, h) => {
      const lineCount = h.details?.reduce((lineSum, lineArray) => lineSum + lineArray.length, 0) || 0;
      return sum + lineCount;
    }, 0);
    console.log(`✅ Successfully generated ${parsed.headers.length} headers with ${totalDetails} total match objects`);
    
    return parsed;
  } catch (error) {
    console.error('❌ Error generating PO matches:', error);
    throw error;
  }
}

/**
 * Create the prompt for PO matching
 */
export function createPOMatchingPrompt(
  invoiceData: Record<string, any>,
  matchPayload: any
): string {
  return `You match supplier invoices to PO receipt lines. Use only the provided JSON. Do not invent data. Output valid JSON matching the exact schema below. No extra text.

## INVOICE DATA
${JSON.stringify(invoiceData, null, 2)}

## PO MATCH CANDIDATES
${JSON.stringify(matchPayload, null, 2)}

# RULES
- Match each invoice line to exactly one \`matchingReceipts\` entry.
- Primary key: exact item number equality (\`invoice.itemNo == receipt.itemNo\`). Some variations in format (i.e. hyphens and spaces are fine, but the item number should be the same)
- Item description can also be used for matching if item number matching is vague.
- Quantities, unit pricing, and total pricings should be close
- Matches should ensure that date invoiced (on invoice) should be prior to date received (on PO receipt)
- Never split one invoice line across multiple receipts.
- If any invoice line fails item match, add a concise message to \`error\`. Still return matches for other lines if any. If no matches, return an empty header.

# VENDOR FIELD MAPPING
Populate header fields from the vendor object in matchPayload as follows:
- APAcct: use vendor.apAcct (NOT apapAcct)
- APSub: use vendor.apSub (NOT apapSub)
- Freight-Account: use vendor.freightAccount
- Freight-Subaccount: use vendor.freightSubAccount
- Misc-Charge-Account: use vendor.miscChargeAccount
- Misc-Charge-Subaccount: use vendor.miscChargeSubAccount

# Output formatting
- JSON only. No comments. No trailing commas. Keep numbers as numbers, not strings.

Using the provided invoice and PO data, identify which PO(s) the invoice relates to and produce a JSON structure in this format:

{
  "headers": [
    {
      "Company-Code": "<string>",
      "VendId": "<string>",
      "TermsId": "<string>",
      "TermsDaysInt": <integer>, // convert termsID to an integer in days
      "APAcct": "<string>",
      "APSub": "<string>",
      "Freight-Account": "<string>",
      "Freight-Subaccount": "<string>",
      "Misc-Charge-Account": "<string>",
      "Misc-Charge-Subaccount": "<string>",
      "PO-Number-Seq-Type": "<string>",
      "PO-Number": "<string>",
      "PO-Vendor": "<string>",
      "CuryId": "<string>",
      "CuryRate": <number>,
      "CuryRateType": "<string>",
      "User-Id": "<string>",
      "Job-Project-Number": "<string>",
      "details": [
        [
          {
            "match_object": <index into matchingReceipts>,
            "invoice_price": <unit price from invoice>,
            "invoice_quantity": <quantity from invoice>,
            "invoice_amount": <line total from invoice>
          }
        ]
      ]
    }
  ],
  "error": "<empty if all lines matched; otherwise explain each unmatched invoice line succinctly>"
}
`;
}

