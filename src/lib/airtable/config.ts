/**
 * Airtable configuration and environment setup
 */

export interface AirtableEnvironmentConfig {
  pat: string;
  baseId?: string;
  webhookSecret?: string;
  clientId?: string;
  clientSecret?: string;
  redirectUri?: string;
  rateLimitPerBase?: number;
  rateLimitPerToken?: number;
  enableCache?: boolean;
  cacheTtl?: number;
}

/**
 * Load Airtable configuration from environment variables
 * Uses Vite's import.meta.env for frontend access
 */
export function loadAirtableConfig(): AirtableEnvironmentConfig {
  const pat = import.meta.env.VITE_AIRTABLE_PAT;
  
  if (!pat) {
    throw new Error(
      'VITE_AIRTABLE_PAT environment variable is required. ' +
      'Get your Personal Access Token from https://airtable.com/create/tokens'
    );
  }

  return {
    pat,
    baseId: import.meta.env.VITE_AIRTABLE_BASE_ID,
    webhookSecret: import.meta.env.VITE_AIRTABLE_WEBHOOK_SECRET,
    clientId: import.meta.env.VITE_AIRTABLE_CLIENT_ID,
    clientSecret: import.meta.env.VITE_AIRTABLE_CLIENT_SECRET,
    redirectUri: import.meta.env.VITE_AIRTABLE_REDIRECT_URI || 'http://localhost:3000/api/airtable/oauth/callback',
    rateLimitPerBase: parseInt(import.meta.env.VITE_AIRTABLE_RATE_LIMIT_PER_BASE || '5'),
    rateLimitPerToken: parseInt(import.meta.env.VITE_AIRTABLE_RATE_LIMIT_PER_TOKEN || '50'),
    enableCache: import.meta.env.VITE_AIRTABLE_ENABLE_CACHE !== 'false',
    cacheTtl: parseInt(import.meta.env.VITE_AIRTABLE_CACHE_TTL || '300'),
  };
}

/**
 * Validate environment configuration
 */
export function validateConfig(config: AirtableEnvironmentConfig): void {
  const errors: string[] = [];

  if (!config.pat) {
    errors.push('AIRTABLE_PAT is required');
  }

  if (config.rateLimitPerBase && (config.rateLimitPerBase < 1 || config.rateLimitPerBase > 50)) {
    errors.push('AIRTABLE_RATE_LIMIT_PER_BASE must be between 1 and 50');
  }

  if (config.rateLimitPerToken && (config.rateLimitPerToken < 1 || config.rateLimitPerToken > 100)) {
    errors.push('AIRTABLE_RATE_LIMIT_PER_TOKEN must be between 1 and 100');
  }

  if (config.cacheTtl && config.cacheTtl < 0) {
    errors.push('AIRTABLE_CACHE_TTL must be a positive number');
  }

  if (errors.length > 0) {
    throw new Error(`Invalid Airtable configuration:\n${errors.join('\n')}`);
  }
}

/**
 * Environment variables required for Airtable integration
 * 
 * Create a .env file with these variables (Vite requires VITE_ prefix):
 * 
 * # Required
 * VITE_AIRTABLE_PAT=your_personal_access_token_here
 * 
 * # Optional (can be provided at runtime)
 * VITE_AIRTABLE_BASE_ID=your_base_id_here
 * 
 * # Webhook support (optional)
 * VITE_AIRTABLE_WEBHOOK_SECRET=your_webhook_secret_here
 * 
 * # OAuth support (optional, for multi-tenant)
 * VITE_AIRTABLE_CLIENT_ID=your_client_id_here
 * VITE_AIRTABLE_CLIENT_SECRET=your_client_secret_here
 * VITE_AIRTABLE_REDIRECT_URI=http://localhost:3000/api/airtable/oauth/callback
 * 
 * # Performance tuning (optional)
 * VITE_AIRTABLE_RATE_LIMIT_PER_BASE=5
 * VITE_AIRTABLE_RATE_LIMIT_PER_TOKEN=50
 * VITE_AIRTABLE_ENABLE_CACHE=true
 * VITE_AIRTABLE_CACHE_TTL=300
 */
export const ENVIRONMENT_SETUP = `
# Airtable Integration Environment Variables (Vite Frontend)

## Required Variables

### VITE_AIRTABLE_PAT
Your Personal Access Token from Airtable.
- Get from: https://airtable.com/create/tokens
- Scopes needed: data.records:read, data.records:write (minimum)
- NOTE: Exposed in browser bundle (use scoped token for production)

### VITE_AIRTABLE_BASE_ID (optional)
The ID of your Airtable base (format: appXXXXXXXXXXXXXX)
- Can be provided at runtime via API calls
- Find in your base URL or API documentation

## Optional Variables

### Webhooks
VITE_AIRTABLE_WEBHOOK_SECRET=base64_encoded_secret
- For webhook signature verification
- Get when creating webhook subscription

### OAuth (Multi-tenant)
VITE_AIRTABLE_CLIENT_ID=your_oauth_client_id
VITE_AIRTABLE_CLIENT_SECRET=your_oauth_client_secret
VITE_AIRTABLE_REDIRECT_URI=http://localhost:3000/api/airtable/oauth/callback

### Performance
VITE_AIRTABLE_RATE_LIMIT_PER_BASE=5     # Max 5 req/s per base
VITE_AIRTABLE_RATE_LIMIT_PER_TOKEN=50   # Max 50 req/s per token
VITE_AIRTABLE_ENABLE_CACHE=true         # Enable schema caching
VITE_AIRTABLE_CACHE_TTL=300            # Cache TTL in seconds

## Example .env file:

VITE_AIRTABLE_PAT=patXXXXXXXXXXXXXX.XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_AIRTABLE_BASE_ID=appXXXXXXXXXXXXXX
VITE_AIRTABLE_WEBHOOK_SECRET=base64EncodedSecretHere
`;

/**
 * Default Airtable API configuration
 */
export const AIRTABLE_DEFAULTS = {
  API_URL: 'https://api.airtable.com/v0',
  MAX_PAGE_SIZE: 100,
  DEFAULT_PAGE_SIZE: 25,
  RATE_LIMIT_PER_BASE: 5, // requests per second
  RATE_LIMIT_PER_TOKEN: 50, // requests per second
  MAX_RETRIES: 5,
  BASE_DELAY: 1000, // milliseconds
  MAX_DELAY: 30000, // milliseconds
  BACKOFF_FACTOR: 2,
  CACHE_TTL: 300, // seconds
} as const;
