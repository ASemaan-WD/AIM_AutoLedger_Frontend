#!/usr/bin/env node

/**
 * Toggle auth bypass in .env.local
 * Usage: node scripts/toggle-bypass.js
 * Or: npm run bypass:toggle
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const ENV_FILE = '.env.local';
const ENV_PATH = join(process.cwd(), ENV_FILE);

function toggleBypass() {
  let content = '';
  let bypassEnabled = false;

  // Read existing file if it exists
  if (existsSync(ENV_PATH)) {
    content = readFileSync(ENV_PATH, 'utf-8');
    bypassEnabled = content.includes('VITE_BYPASS_AUTH=true');
  }

  // Toggle the value
  if (bypassEnabled) {
    // Disable bypass
    if (content.includes('VITE_BYPASS_AUTH=true')) {
      content = content.replace(/VITE_BYPASS_AUTH=true/g, 'VITE_BYPASS_AUTH=false');
    }
    writeFileSync(ENV_PATH, content);
    console.log('🔒 Auth bypass DISABLED');
    console.log('   Restart your dev server for changes to take effect');
  } else {
    // Enable bypass
    if (content.includes('VITE_BYPASS_AUTH=false')) {
      content = content.replace(/VITE_BYPASS_AUTH=false/g, 'VITE_BYPASS_AUTH=true');
    } else if (!content.includes('VITE_BYPASS_AUTH')) {
      // Add it if it doesn't exist
      content += (content ? '\n' : '') + 'VITE_BYPASS_AUTH=true\n';
    }
    writeFileSync(ENV_PATH, content);
    console.log('🔓 Auth bypass ENABLED');
    console.log('   Restart your dev server for changes to take effect');
  }
}

toggleBypass();




