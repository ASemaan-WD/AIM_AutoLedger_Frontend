/**
 * Tests for PO matching processor
 * 
 * Run with: npm test (or whatever test runner is configured)
 */

import { processPOMatching } from '../processor';
import { createPOInvoiceHeaders, createPOInvoiceDetails } from '../airtable-creator';
import {
  mockInvoiceRecord,
  mockGPTResponse,
  mockMinimalInvoiceRecord,
  mockMinimalGPTResponse,
  mockInvalidJSONInvoiceRecord,
  createMockFetchInvoice,
  createMockCreateRecords,
} from './mocks';

describe('PO Matching Processor', () => {
  describe('processPOMatching', () => {
    test('should process invoice with PO matches successfully', async () => {
      const mockFetch = createMockFetchInvoice(mockInvoiceRecord);
      const { createRecordsFn, getCreatedRecords } = createMockCreateRecords();

      const result = await processPOMatching(
        'recMockInvoice123',
        mockFetch,
        createRecordsFn
      );

      // Verify result structure
      expect(result.headerIds).toBeDefined();
      expect(result.detailIds).toBeDefined();
      expect(result.headerCount).toBeGreaterThan(0);
      expect(result.detailCount).toBeGreaterThan(0);

      // Verify records were created
      const created = getCreatedRecords();
      expect(created.length).toBe(2); // headers and details
      expect(created[0].table).toBe('POInvoiceHeaders');
      expect(created[1].table).toBe('POInvoiceDetails');
    });

    test('should handle invoice with minimal data', async () => {
      const mockFetch = createMockFetchInvoice(mockMinimalInvoiceRecord);
      const { createRecordsFn } = createMockCreateRecords();

      const result = await processPOMatching(
        'recMockInvoiceMin',
        mockFetch,
        createRecordsFn
      );

      // Should still succeed even with minimal data
      expect(result.headerIds).toBeDefined();
      expect(result.detailIds).toBeDefined();
    });

    test('should handle invoice with invalid MatchPayloadJSON gracefully', async () => {
      const mockFetch = createMockFetchInvoice(mockInvalidJSONInvoiceRecord);
      const { createRecordsFn } = createMockCreateRecords();

      // Should not throw - processor should handle JSON parse errors
      const result = await processPOMatching(
        'recMockInvoiceInvalid',
        mockFetch,
        createRecordsFn
      );

      expect(result).toBeDefined();
    });

    test('should throw error for non-existent invoice', async () => {
      const mockFetch = async () => null; // Invoice not found
      const { createRecordsFn } = createMockCreateRecords();

      await expect(
        processPOMatching('recNonExistent', mockFetch, createRecordsFn)
      ).rejects.toThrow();
    });
  });

  describe('createPOInvoiceHeaders', () => {
    test('should create header records with correct fields', async () => {
      const mockCreate = async (tableName: string, records: any[]) => {
        expect(tableName).toBe('POInvoiceHeaders');
        expect(records.length).toBe(mockGPTResponse.headers.length);
        
        // Verify Invoice link is present
        records.forEach((record) => {
          expect(record.fields['Invoice']).toBeDefined();
          expect(Array.isArray(record.fields['Invoice'])).toBe(true);
        });

        return {
          records: records.map((_, i) => ({ id: `recHeader${i}` })),
        };
      };

      const headerIds = await createPOInvoiceHeaders(
        mockGPTResponse.headers,
        'recMockInvoice123',
        mockCreate
      );

      expect(headerIds.length).toBe(mockGPTResponse.headers.length);
    });

    test('should handle empty headers array', async () => {
      const mockCreate = async () => ({ records: [] });

      const headerIds = await createPOInvoiceHeaders(
        [],
        'recMockInvoice123',
        mockCreate
      );

      expect(headerIds).toEqual([]);
    });
  });

  describe('createPOInvoiceDetails', () => {
    test('should create detail records linked to correct headers', async () => {
      const mockHeaderIds = ['recHeader1', 'recHeader2'];
      const mockCreate = async (tableName: string, records: any[]) => {
        expect(tableName).toBe('POInvoiceDetails');
        expect(records.length).toBe(mockGPTResponse.details.length);
        
        // Verify POInvoiceHeaders link is present
        records.forEach((record, i) => {
          expect(record.fields['POInvoiceHeaders']).toBeDefined();
          expect(Array.isArray(record.fields['POInvoiceHeaders'])).toBe(true);
          
          // Verify correct header is linked based on headerIndex
          const detail = mockGPTResponse.details[i];
          const headerIndex = detail.headerIndex ?? 0;
          expect(record.fields['POInvoiceHeaders'][0]).toBe(mockHeaderIds[headerIndex]);
        });

        return {
          records: records.map((_, i) => ({ id: `recDetail${i}` })),
        };
      };

      const detailIds = await createPOInvoiceDetails(
        mockGPTResponse.details,
        mockHeaderIds,
        mockCreate
      );

      expect(detailIds.length).toBe(mockGPTResponse.details.length);
    });

    test('should handle empty details array', async () => {
      const mockCreate = async () => ({ records: [] });

      const detailIds = await createPOInvoiceDetails(
        [],
        ['recHeader1'],
        mockCreate
      );

      expect(detailIds).toEqual([]);
    });

    test('should handle invalid headerIndex gracefully', async () => {
      const mockHeaderIds = ['recHeader1'];
      const invalidDetail = {
        ...mockGPTResponse.details[0],
        headerIndex: 999, // Out of range
      };

      const mockCreate = async (tableName: string, records: any[]) => {
        // Should default to first header
        expect(records[0].fields['POInvoiceHeaders'][0]).toBe(mockHeaderIds[0]);
        return { records: [{ id: 'recDetail1' }] };
      };

      await createPOInvoiceDetails([invalidDetail], mockHeaderIds, mockCreate);
    });
  });
});





















