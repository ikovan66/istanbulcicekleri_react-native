/**
 * Language & Currency Service
 * ─────────────────────────────────────────────────────
 * Backend API'lerinden aktif dilleri ve kurları çeker.
 * NJ'deki /api/aktif-diller ve /api/kurlar proxy'lerinin
 * gittiği aynı backend endpoint'lerine doğrudan gider.
 * ─────────────────────────────────────────────────────
 */

import API_CONFIG from '../config/apiConfig';

const HEADERS = {
  'Accept': 'application/json',
  'Content-Type': 'application/json',
  'X-Tenant-Db': API_CONFIG.tenantDb,
};

/**
 * Aktif dilleri backend'den çeker
 * Endpoint: api-frontend.ikost.com/api/Product/AktifDiller
 * Response: [{ kisa: "TR", tam: "Türkçe", ana: true, para_birimi: "TRY" }, ...]
 */
export async function fetchAktifDiller() {
  try {
    const url = `${API_CONFIG.frontendApi}/api/Product/AktifDiller`;
    const response = await fetch(url, { headers: HEADERS });
    if (!response.ok) return [];
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.log('[LanguageCurrencyService] AktifDiller fetch error:', error.message);
    return [];
  }
}

/**
 * Aktif kurları backend'den çeker
 * Endpoint: api-frontend.ikost.com/api/Product/Kurlar
 * Response: [{ id, kurad: "TRY", parite: 1, sembol: "TL", is_default: true }, ...]
 */
export async function fetchAktifKurlar() {
  try {
    const url = `${API_CONFIG.frontendApi}/api/Product/Kurlar`;
    const response = await fetch(url, { headers: HEADERS });
    if (!response.ok) return [];
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.log('[LanguageCurrencyService] Kurlar fetch error:', error.message);
    return [];
  }
}

/**
 * UI çevirilerini backend'den çeker
 * Endpoint: api-frontend.ikost.com/api/ceviriler
 * Response: [{ ifade: "Sepete Ekle", ceviri: "Add To Cart" }, ...]
 */
export async function fetchCeviriler() {
  try {
    const url = `${API_CONFIG.frontendApi}/api/ceviriler`;
    const response = await fetch(url, { headers: HEADERS });
    if (!response.ok) return [];
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.log('[LanguageCurrencyService] Ceviriler fetch error:', error.message);
    return [];
  }
}
