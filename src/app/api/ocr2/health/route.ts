/**
 * OCR2 Health Check Endpoint
 * Simple endpoint to test if the OCR function is reachable
 */

import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET() {
  console.log('[OCR-HEALTH] Health check endpoint called');
  console.log('[OCR-HEALTH] Environment:', process.env.VERCEL ? 'Vercel' : 'Local');
  console.log('[OCR-HEALTH] Node version:', process.version);
  console.log('[OCR-HEALTH] Platform:', process.platform);
  
  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.VERCEL ? 'Vercel' : 'Local',
    node: process.version,
    platform: process.platform,
    message: 'OCR function is reachable'
  });
}

export async function POST() {
  console.log('[OCR-HEALTH] POST health check called');
  
  return NextResponse.json({
    status: 'healthy',
    message: 'POST endpoint is reachable',
    timestamp: new Date().toISOString()
  });
}










