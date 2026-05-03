import axios from 'axios';
import API_CONFIG from '../../config/apiConfig';
import { urls } from '../../config/apiUrls';

// Cache — aynı URL'i tekrar tekrar sorgulamayı önler
const _cache = new Map();

// NJ resolve-link endpoint (handles EN→TR slug translation via slug-map)
const RESOLVE_API_URL = `https://${API_CONFIG.universalDomain}/api/mobile/resolve-link`;

/**
 * URL slug'ını çözer:
 *   1) NJ resolve-link API (EN→TR dönüşümü + .NET proxy) — birincil
 *   2) .NET resolvePermalink API — fallback (NJ deploy olmamışsa)
 */
export async function resolveLink(permalink) {
  if (!permalink) return { type: 'notfound', id: null };

  const clean = permalink.replace(/^\/+|\/+$/g, '');
  if (!clean) return { type: 'notfound', id: null };

  if (_cache.has(clean)) {
    return _cache.get(clean);
  }

  // 1) NJ resolve-link (slug-map dönüşümü ile)
  try {
    const response = await axios.post(RESOLVE_API_URL, {
      Permalink: clean,
      domain: API_CONFIG.universalDomain,
    }, {
      timeout: 5000,
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
    });

    const result = response.data || { type: 'notfound', id: null };
    if (result.type !== 'notfound') {
      _cache.set(clean, result);
      return result;
    }
  } catch (error) {
    console.log('[PuckLinkResolver] NJ resolve-link failed, trying .NET fallback:', error.message);
  }

  // 2) .NET resolvePermalink fallback (TR slug'lar doğrudan çalışır)
  try {
    const response = await axios.post(urls.resolvePermalink, {
      Permalink: clean,
    }, {
      timeout: 5000,
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
    });

    const result = response.data || { type: 'notfound', id: null };
    _cache.set(clean, result);
    return result;
  } catch (error) {
    console.log('[PuckLinkResolver] .NET fallback also failed:', error.message);
    return { type: 'notfound', id: null };
  }
}

/**
 * Puck link'ine tıklanınca doğru ekrana navigate et
 * @param {string} link - "/cicek" gibi URL
 * @param {object} navigation - React Navigation ref
 * @param {string} [title] - Opsiyonel sayfa başlığı
 */
export async function navigatePuckLink(link, navigation, title = '') {
  if (!link || !navigation) return;

  // Dış link (http/https) → webview veya browser
  if (link.startsWith('http://') || link.startsWith('https://')) {
    // Şimdilik dış linkleri atla
    console.log('[PuckLinkResolver] External link ignored:', link);
    return;
  }

  const resolved = await resolveLink(link);

  switch (resolved.type) {
    case 'category':
      navigation.navigate('KategoriNav', {
        cid: resolved.id,
        title: title || link.replace(/^\//, ''),
      });
      break;

    case 'product':
      navigation.navigate('UrunNav', {
        id: resolved.id,
      });
      break;

    default:
      console.log('[PuckLinkResolver] Link not found:', link);
      break;
  }
}

/**
 * Cache'i temizle (pull-to-refresh gibi durumlarda)
 */
export function clearLinkCache() {
  _cache.clear();
}
