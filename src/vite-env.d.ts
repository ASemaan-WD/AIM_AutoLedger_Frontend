/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_AIRTABLE_BASE_ID: string;
  readonly VITE_AIRTABLE_PAT: string;
  readonly VITE_VERCEL_BLOB_TOKEN?: string;
  readonly VITE_VERCEL_BLOB_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

