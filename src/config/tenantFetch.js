/**
 * Tenant-aware fetch() wrapper
 * ─────────────────────────────────────────────────────
 * Bazı ekranlar düz fetch() kullanır (axios yerine).
 * Bu wrapper her çağrıya X-Tenant-Db header'ı ekler.
 *
 * Kullanım:
 *   import { tenantFetch } from '../config/tenantFetch';
 *   const response = await tenantFetch(url);
 * ─────────────────────────────────────────────────────
 */

import API_CONFIG from './apiConfig';

export async function tenantFetch(url, options = {}) {
  const headers = {
    'X-Tenant-Db': API_CONFIG.tenantDb,
    'Accept': 'application/json',
    ...(options.headers || {}),
  };

  return fetch(url, {
    ...options,
    headers,
  });
}

export default tenantFetch;
