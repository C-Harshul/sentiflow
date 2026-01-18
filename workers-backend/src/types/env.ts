export interface Env {
  AI: Ai;
  DB: D1Database;
  CACHE: KVNamespace;
  ENVIRONMENT?: string;
  CLOUDFLARE_ACCOUNT_ID?: string;
  CLOUDFLARE_API_TOKEN?: string;
}
