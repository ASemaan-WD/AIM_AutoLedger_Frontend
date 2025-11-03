/**
 * Debug endpoint to inspect file records
 * GET /api/debug/file/:recordId
 */

import { NextRequest, NextResponse } from 'next/server';

const BASE_ID = process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID || process.env.AIRTABLE_BASE_ID;
const AIRTABLE_TOKEN = process.env.AIRTABLE_PAT;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ recordId: string }> }
) {
  try {
    const { recordId } = await params;
    
    if (!recordId || !recordId.startsWith('rec')) {
      return NextResponse.json({ error: 'Invalid record ID' }, { status: 400 });
    }

    const url = `https://api.airtable.com/v0/${BASE_ID}/Files/${recordId}`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Airtable error: ${response.status}` },
        { status: response.status }
      );
    }

    const record = await response.json();
    
    return NextResponse.json({
      record_id: record.id,
      fields_available: Object.keys(record.fields || {}),
      raw_text_field_id: 'fldqYhVrJ09KBnVLk',
      raw_text_present: !!(record.fields?.['fldqYhVrJ09KBnVLk']),
      raw_text_length: record.fields?.['fldqYhVrJ09KBnVLk']?.length || 0,
      raw_text_preview: record.fields?.['fldqYhVrJ09KBnVLk']?.substring(0, 200) || null,
      all_fields: record.fields,
    });
    
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}





