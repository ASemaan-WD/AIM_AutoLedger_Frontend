/**
 * Airtable record creation helpers for PO matching
 */

import { GPTPOInvoiceHeader, GPTMatchObject } from '../types/po-matching';
import { TABLE_IDS, TABLE_NAMES } from '../airtable/schema-types';

/**
 * Create POInvoiceHeader and POInvoiceDetail records in Airtable
 * @param headersData - Array of header data from GPT (with nested match objects)
 * @param invoiceId - Invoice record ID to link to
 * @param matchPayload - The original match payload containing matchingReceipts array
 * @param createRecordsFn - Function to create records (injected for testability)
 * @returns Object with arrays of created header and detail IDs
 */
export async function createPOInvoiceHeadersAndDetails(
  headersData: GPTPOInvoiceHeader[],
  invoiceId: string,
  matchPayload: any,
  createRecordsFn: (tableName: string, records: any[]) => Promise<{ records: Array<{ id: string }> }>
): Promise<{ headerIds: string[]; detailIds: string[] }> {
  console.log(`📝 Creating ${headersData.length} POInvoiceHeader(s) with nested details...`);
  
  if (headersData.length === 0) {
    console.log('   No headers to create');
    return { headerIds: [], detailIds: [] };
  }

  const allHeaderIds: string[] = [];
  const allDetailIds: string[] = [];
  
  // Extract matchingReceipts array from matchPayload
  const matchingReceipts = matchPayload?.matchingReceipts || [];
  
  // Extract vendor PPV accounts from matchPayload
  const vendorPPVAcct = matchPayload?.vendor?.ppvVoucheredAcct;
  const vendorPPVSubAcct = matchPayload?.vendor?.ppvVoucheredSubAcct;

  // Process each header with its nested details
  for (let i = 0; i < headersData.length; i++) {
    const headerData = headersData[i];
    console.log(`\n   Processing header ${i + 1}/${headersData.length}...`);

    // Build header record
    const headerFields: Record<string, any> = {
      // Link to Invoice (single record link)
      'Invoice': [invoiceId],
    };

    // Add all non-null header fields
    const writableHeaderFields = [
      'Company-Code',
      'VendId',
      'TermsId',
      'TermsDaysInt',
      'APAcct', 'APSub',
      'Freight-Account', 'Freight-Subaccount',
      'Misc-Charge-Account', 'Misc-Charge-Subaccount',
      'PO-Number-Seq-Type', 'PO-Number', 'PO-Vendor',
      'CuryId', 'CuryRate', 'CuryRateType',
      // Note: CuryMultDiv is intentionally omitted - do not populate
      'Job-Project-Number',
    ];

    writableHeaderFields.forEach((fieldName) => {
      const value = headerData[fieldName as keyof GPTPOInvoiceHeader];
      if (value !== undefined && value !== null && value !== '') {
        headerFields[fieldName] = value;
      }
    });

    // Hard-code User-Id to "test-user" for now
    headerFields['User-Id'] = 'test-user';

    // Create the header record
    try {
      const headerResponse = await createRecordsFn(TABLE_NAMES.POINVOICEHEADERS, [{ fields: headerFields }]);
      const headerId = headerResponse.records[0].id;
      allHeaderIds.push(headerId);
      
      console.log(`   ✅ Created header: ${headerId}`);

      // Now create the nested details for this header
      // Details is now an array of arrays of match objects
      const detailsData = headerData.details || [];
      
      // Flatten the array of arrays and count total matches
      const allMatches: GPTMatchObject[] = [];
      detailsData.forEach((lineMatches) => {
        allMatches.push(...lineMatches);
      });
      
      console.log(`   Creating ${allMatches.length} detail(s) for this header...`);

      if (allMatches.length > 0) {
        const detailRecords = allMatches.map((matchObj) => {
          const detailFields: Record<string, any> = {
            // Link to the header we just created
            'POInvoiceHeaders': [headerId],
          };

          // Look up the receipt from matchingReceipts using the match_object index
          const receiptIndex = matchObj.match_object;
          const receipt = matchingReceipts[receiptIndex];
          
          if (!receipt) {
            console.warn(`   ⚠️  Warning: No receipt found at index ${receiptIndex}`);
          } else {
            // Map receipt fields to POInvoiceDetail fields
            // Invoice pricing fields (from match object)
            if (matchObj.invoice_price !== undefined) detailFields['Invoice-Price'] = matchObj.invoice_price;
            if (matchObj.invoice_quantity !== undefined) detailFields['Quantity-Invoiced'] = matchObj.invoice_quantity;
            if (matchObj.invoice_amount !== undefined) detailFields['Line-Amount'] = matchObj.invoice_amount;
            
            // PO receipt fields (from matchingReceipts)
            if (receipt.itemNo) detailFields['Item-No'] = receipt.itemNo;
            if (receipt.itemDescription) detailFields['Item-Description'] = receipt.itemDescription;
            if (receipt.step) detailFields['Step'] = receipt.step;
            if (receipt.poReleaseNumber) detailFields['PO-Release-Number'] = receipt.poReleaseNumber;
            if (receipt.poLineNumber) detailFields['PO-Line-Number'] = receipt.poLineNumber;
            if (receipt.vendorShipNumber) detailFields['Vendor-Ship-Number'] = receipt.vendorShipNumber;
            if (receipt.dateReceived) detailFields['Date-Received'] = receipt.dateReceived;
            if (receipt.quantityReceived !== undefined) detailFields['Quantity-Received'] = receipt.quantityReceived;
            if (receipt.quantityAccepted !== undefined) detailFields['Quantity-Accepted'] = receipt.quantityAccepted;
            if (receipt.purchasePrice !== undefined) detailFields['Purchase-Price'] = receipt.purchasePrice;
            if (receipt.pricingQuantity !== undefined) detailFields['Pricing-Quantity'] = receipt.pricingQuantity;
            if (receipt.expAcct) detailFields['ExpAcct'] = receipt.expAcct;
            if (receipt.expSub) detailFields['ExpSub'] = receipt.expSub;
            if (receipt.standardCost !== undefined) detailFields['Standard-Cost'] = receipt.standardCost;
            if (receipt.surcharge !== undefined) detailFields['Surcharge'] = receipt.surcharge;
            if (receipt.uom) detailFields['PO-UOM'] = receipt.uom;
            
            // Add PPV fields from vendor (from matchPayload)
            if (vendorPPVAcct) detailFields['PPV-Vouchered-Acct'] = vendorPPVAcct;
            if (vendorPPVSubAcct) detailFields['PPV-Vouchered-SubAcct'] = vendorPPVSubAcct;
          }

          return { fields: detailFields };
        });

        const detailResponse = await createRecordsFn(TABLE_NAMES.POINVOICEDETAILS, detailRecords);
        const detailIds = detailResponse.records.map(r => r.id);
        allDetailIds.push(...detailIds);
        
        console.log(`   ✅ Created ${detailIds.length} detail(s): ${detailIds.join(', ')}`);
      }
    } catch (error) {
      console.error(`   ❌ Error creating header ${i + 1}:`, error);
      throw error;
    }
  }

  console.log(`\n✅ Total created: ${allHeaderIds.length} headers, ${allDetailIds.length} details`);
  
  return { headerIds: allHeaderIds, detailIds: allDetailIds };
}

/**
 * Helper to create a mock createRecords function for testing
 */
export function createMockCreateRecordsFn(
  mockHeaderIds: string[] = ['recMockHeader1'],
  mockDetailIds: string[] = ['recMockDetail1', 'recMockDetail2']
): (tableName: string, records: any[]) => Promise<{ records: Array<{ id: string }> }> {
  let headerIndex = 0;
  let detailIndex = 0;
  
  return async (tableName: string, records: any[]) => {
    console.log(`   [MOCK] Creating ${records.length} records in ${tableName}`);
    
    if (tableName === TABLE_NAMES.POINVOICEHEADERS) {
      const ids = mockHeaderIds.slice(headerIndex, headerIndex + records.length);
      headerIndex += records.length;
      return {
        records: ids.map(id => ({ id }))
      };
    } else if (tableName === TABLE_NAMES.POINVOICEDETAILS) {
      const ids = mockDetailIds.slice(detailIndex, detailIndex + records.length);
      detailIndex += records.length;
      return {
        records: ids.map(id => ({ id }))
      };
    }
    
    return { records: [] };
  };
}

