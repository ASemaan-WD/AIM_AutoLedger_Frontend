/**
 * Debug endpoint to inspect what's in a file record
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ recordId: string }> }
) {
  try {
    const { recordId } = await params;
    
    const baseId = process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID || process.env.AIRTABLE_BASE_ID;
    const url = `http://localhost:3000/api/airtable/Files/${recordId}?baseId=${baseId}`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `API error: ${response.status}` },
        { status: response.status }
      );
    }

    const record = await response.json();
    
    return NextResponse.json({
      record_id: record.id,
      all_fields: record.fields,
      field_keys: Object.keys(record.fields || {}),
      raw_text_field_id: 'fldqYhVrJ09KBnVLk',
      raw_text_by_id: record.fields?.['fldqYhVrJ09KBnVLk'] || null,
      raw_text_by_name: record.fields?.['Raw Text'] || null,
      status: record.fields?.['Status'] || record.fields?.['fld9ouHowI4sch0n0'] || null,
    });
    
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}





