/**
 * File hash generation utilities for duplicate detection
 * Uses browser's native Web Crypto API
 */

/**
 * Generate SHA-256 hash from File (browser-side)
 */
export async function generateFileHash(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  return generateArrayBufferHash(buffer);
}

/**
 * Generate SHA-256 hash from ArrayBuffer (browser-side)
 * Uses native Web Crypto API available in all modern browsers
 */
export async function generateArrayBufferHash(arrayBuffer: ArrayBuffer): Promise<string> {
  // Use browser's native crypto.subtle (Web Crypto API)
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

/**
 * Compare two file hashes for exact match
 */
export function compareHashes(hash1: string, hash2: string): boolean {
  return hash1.toLowerCase() === hash2.toLowerCase();
}

/**
 * Validate hash format (64 character hex string for SHA-256)
 */
export function isValidHash(hash: string): boolean {
  return /^[a-fA-F0-9]{64}$/.test(hash);
}
