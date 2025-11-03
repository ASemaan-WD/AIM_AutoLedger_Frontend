/**
 * Debug endpoint to check environment variables on Vercel
 * IMPORTANT: Remove or protect this endpoint before going to production
 */

import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET() {
  try {
    // Check environment variables without exposing the actual values
    const envCheck = {
      OPENAI_API_KEY: {
        exists: !!process.env.OPENAI_API_KEY,
        length: process.env.OPENAI_API_KEY?.length || 0,
        trimmedLength: process.env.OPENAI_API_KEY?.trim().length || 0,
        hasWhitespace: process.env.OPENAI_API_KEY ? 
          process.env.OPENAI_API_KEY !== process.env.OPENAI_API_KEY.trim() : 
          false,
        startsWithSk: process.env.OPENAI_API_KEY?.trim().startsWith('sk-') || false,
        preview: process.env.OPENAI_API_KEY ? 
          `${process.env.OPENAI_API_KEY.trim().substring(0, 7)}...${process.env.OPENAI_API_KEY.trim().substring(process.env.OPENAI_API_KEY.trim().length - 4)}` : 
          'NOT SET'
      },
      AIRTABLE_BASE_ID: {
        exists: !!process.env.AIRTABLE_BASE_ID,
        length: process.env.AIRTABLE_BASE_ID?.length || 0,
        preview: process.env.AIRTABLE_BASE_ID ? 
          `${process.env.AIRTABLE_BASE_ID.substring(0, 4)}...` : 
          'NOT SET'
      },
      AIRTABLE_PAT: {
        exists: !!process.env.AIRTABLE_PAT,
        length: process.env.AIRTABLE_PAT?.length || 0,
        preview: process.env.AIRTABLE_PAT ? 
          `${process.env.AIRTABLE_PAT.substring(0, 4)}...` : 
          'NOT SET'
      },
      BLOB_READ_WRITE_TOKEN: {
        exists: !!process.env.BLOB_READ_WRITE_TOKEN,
        length: process.env.BLOB_READ_WRITE_TOKEN?.length || 0,
        preview: process.env.BLOB_READ_WRITE_TOKEN ? 
          `${process.env.BLOB_READ_WRITE_TOKEN.substring(0, 4)}...` : 
          'NOT SET'
      },
      NEXT_PUBLIC_AIRTABLE_BASE_ID: {
        exists: !!process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID,
        length: process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID?.length || 0,
      }
    };

    // Check for common issues
    const issues: string[] = [];
    
    if (!envCheck.OPENAI_API_KEY.exists) {
      issues.push('OPENAI_API_KEY is not set');
    } else if (envCheck.OPENAI_API_KEY.hasWhitespace) {
      issues.push('OPENAI_API_KEY has leading/trailing whitespace - this will cause authentication errors');
    } else if (!envCheck.OPENAI_API_KEY.startsWithSk) {
      issues.push('OPENAI_API_KEY does not start with "sk-" - invalid format');
    } else if (envCheck.OPENAI_API_KEY.trimmedLength < 40) {
      issues.push('OPENAI_API_KEY seems too short - might be invalid');
    }
    
    if (!envCheck.AIRTABLE_BASE_ID.exists) {
      issues.push('AIRTABLE_BASE_ID is not set');
    }
    
    if (!envCheck.AIRTABLE_PAT.exists) {
      issues.push('AIRTABLE_PAT is not set');
    }
    
    if (!envCheck.BLOB_READ_WRITE_TOKEN.exists) {
      issues.push('BLOB_READ_WRITE_TOKEN is not set');
    }

    // Test OpenAI API key validity by making a simple request
    let openaiTest = { status: 'not_tested', message: '' };
    if (envCheck.OPENAI_API_KEY.exists && envCheck.OPENAI_API_KEY.startsWithSk) {
      try {
        const OpenAI = (await import('openai')).default;
        const openai = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY?.trim(),
        });
        
        // Simple API call to test authentication
        await openai.models.list();
        openaiTest = { status: 'success', message: 'OpenAI API key is valid' };
      } catch (error: any) {
        if (error.status === 401) {
          openaiTest = { 
            status: 'error', 
            message: '401 Unauthorized - API key is invalid or expired' 
          };
          issues.push('OpenAI API key is invalid or expired (401 error)');
        } else {
          openaiTest = { 
            status: 'error', 
            message: `Error: ${error.message || 'Unknown error'}` 
          };
        }
      }
    }

    return NextResponse.json({
      status: issues.length === 0 ? 'healthy' : 'issues_found',
      environment: process.env.VERCEL_ENV || 'local',
      deployment_region: process.env.VERCEL_REGION || 'unknown',
      node_version: process.version,
      timestamp: new Date().toISOString(),
      env_variables: envCheck,
      openai_test: openaiTest,
      issues: issues.length > 0 ? issues : ['No issues detected'],
      recommendation: issues.length > 0 ? 
        'Please check your Vercel environment variables in the project settings' : 
        'All environment variables are properly configured'
    });

  } catch (error) {
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}

