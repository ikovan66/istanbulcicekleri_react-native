import API_CONFIG from '../config/apiConfig';
import { Linking, Platform, Settings, AppState } from 'react-native';
import axios from 'axios';
import { urls } from '../config/apiUrls';

/**
 * React Navigation Linking Configuration for Deeplinks
 * Supports both custom scheme (${appScheme}://) and Universal Links (${universalDomain})
 */

// API endpoint for permalink resolution
const RESOLVE_PERMALINK_API = urls.resolvePermalink;

/**
 * Resolve a permalink from the website to app navigation params
 */
async function resolvePermalinkFromAPI(permalink) {
    try {
        console.log('[Deeplink] Resolving permalink via API:', permalink);
        const response = await axios.post(RESOLVE_PERMALINK_API, {
            Permalink: permalink
        }, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            timeout: 10000 // 10 second timeout for release builds
        });

        console.log('[Deeplink] API response:', JSON.stringify(response.data));
        return response.data;
    } catch (error) {
        console.log('[Deeplink] Permalink resolution error:', error.message);
        console.log('[Deeplink] Error details:', error.response?.status, error.response?.data);
        return null;
    }
}

/**
 * Static path mappings for known URLs
 */
const STATIC_PATHS = {
    '': { screen: 'AnaNav', params: {} },
    'siparis': { screen: 'SepetNav', params: {} },
    'siparis_1': { screen: 'SepetNav', params: {} },
    'siparis_4': { screen: 'SepetOdemeNav', params: {} },
    'siparis_giris': { screen: 'GirisNav', params: {} },
    'siparis_uyeol': { screen: 'KayitNav', params: {} },
};

/**
 * Parse URL and resolve to navigation state
 */
async function resolveUrl(url) {
    if (!url) return null;

    console.log('[Deeplink] Resolving URL:', url);

    // Custom scheme handling - already in correct format
    if (url.startsWith(`${API_CONFIG.appScheme}://`) || url.startsWith(`${API_CONFIG.insiderScheme}://`)) {
        return parseCustomSchemeUrl(url);
    }

    // Website URL handling - needs permalink resolution
    const domainPattern = new RegExp(`^https?://(www\\.)?${API_CONFIG.universalDomain.replace('www.', '').replace('.', '\\.')}/?`);
    const websitePath = url.replace(domainPattern, '');
    const [pathPart, queryPart] = websitePath.split('?');
    const cleanPath = pathPart.replace(/^\/+|\/+$/g, '').toLowerCase();

    // Check static paths first
    if (STATIC_PATHS[cleanPath]) {
        console.log('[Deeplink] Static path matched:', cleanPath);
        return STATIC_PATHS[cleanPath];
    }

    // Handle sip_tesekkur with query params
    if (cleanPath === 'sip_tesekkur' && queryPart) {
        const params = new URLSearchParams(queryPart);
        const code = params.get('code');
        if (code) {
            return { screen: 'SiparisNav', params: { Code: code } };
        }
    }

    // Try to resolve permalink via API
    const resolved = await resolvePermalinkFromAPI(cleanPath);

    if (resolved) {
        const resolvedType = (resolved.type || '').toLowerCase();
        
        if (resolvedType === 'product' && resolved.id) {
            console.log('[Deeplink] Resolved as product:', resolved.id);
            return { screen: 'UrunNav', params: { pid: resolved.id } };
        } else if ((resolvedType === 'category' || resolvedType === 'kategori') && (resolved.id || resolved.CategoryId)) {
            const categoryId = resolved.id || resolved.CategoryId;
            console.log('[Deeplink] Resolved as category:', categoryId);
            return { screen: 'KategoriNav', params: { cid: categoryId, title: '' } };
        }
    }

    // Fallback to home
    console.log('[Deeplink] No match found, going to home');
    return { screen: 'AnaNav', params: {} };
}

/**
 * Parse custom scheme URLs (istanbulcicekleri://urun/123)
 */
function parseCustomSchemeUrl(url) {
    const path = url
        .replace(new RegExp(`^${API_CONFIG.appScheme}://`), '')
        .replace(new RegExp(`^${API_CONFIG.insiderScheme}://`), '');

    const [pathPart, queryPart] = path.split('?');
    const parts = pathPart.split('/').filter(Boolean);

    if (parts.length === 0) {
        return { screen: 'AnaNav', params: {} };
    }

    const route = parts[0].toLowerCase();

    // Parse query params
    const queryParams = {};
    if (queryPart) {
        const searchParams = new URLSearchParams(queryPart);
        searchParams.forEach((value, key) => {
            queryParams[key] = value;
        });
    }

    switch (route) {
        case 'urun':
            return { screen: 'UrunNav', params: { pid: parseInt(parts[1]) || 0, ...queryParams } };

        case 'kategori':
            return { screen: 'KategoriNav', params: { cid: parseInt(parts[1]) || 0, title: decodeURIComponent(parts[2] || ''), ...queryParams } };

        case 'siparis':
            return { screen: 'SiparisNav', params: { Code: parts[1] || '', ...queryParams } };

        case 'sepet':
            return { screen: 'SepetNav', params: queryParams };

        case 'giris':
            return { screen: 'GirisNav', params: queryParams };

        case 'kayit':
            return { screen: 'KayitNav', params: queryParams };

        case 'hesabim':
            return { screen: 'HesabimNav', params: queryParams };

        case 'siparislerim':
            return { screen: 'SiparislerimNav', params: queryParams };

        case 'favorilerim':
            return { screen: 'FavorilerimNav', params: queryParams };

        case 'arama':
            return { screen: 'AramaNav', params: { query: parts[1] || '', ...queryParams } };

        case 'anasayfa':
        default:
            return { screen: 'AnaNav', params: queryParams };
    }
}

/**
 * React Navigation Linking Configuration
 */
export const linkingConfig = {
    prefixes: [
        `${API_CONFIG.appScheme}://`,
        `${API_CONFIG.insiderScheme}://`,
        `https://${API_CONFIG.universalDomain}`,
        `https://${API_CONFIG.universalDomain.replace('www.', '')}`,
    ],

    // Screen configuration for basic path matching
    config: {
        screens: {
            AnaNav: '',
            UrunNav: 'urun/:pid',
            KategoriNav: 'kategori/:cid/:title?',
            SepetNav: 'sepet',
            SiparisNav: 'siparis/:Code',
            SiparislerimNav: 'siparislerim',
            FavorilerimNav: 'favorilerim',
            HesabimNav: 'hesabim',
            GirisNav: 'giris',
            KayitNav: 'kayit',
            AramaNav: 'arama/:query?',
        },
    },

    // Custom URL resolver for Universal Links
    async getInitialURL() {
        console.log('[Deeplink] getInitialURL called');

        // İlk deneme - Linking.getInitialURL
        let url = await Linking.getInitialURL();
        console.log('[Deeplink] Initial URL from Linking:', url);

        // iOS'ta cold start durumunda pending URL'i NSUserDefaults'tan kontrol et
        if (!url && Platform.OS === 'ios') {
            console.log('[Deeplink] Checking pending deep link from Settings...');
            const pendingUrl = Settings.get('pendingDeepLink');
            const pendingTimestamp = Settings.get('pendingDeepLinkTimestamp');

            if (pendingUrl && pendingTimestamp) {
                // Sadece son 30 saniye içinde kaydedilmiş URL'leri kabul et
                const now = Date.now() / 1000; // Unix timestamp in seconds
                const age = now - pendingTimestamp;
                console.log('[Deeplink] Pending URL age:', age, 'seconds');

                if (age < 30) {
                    console.log('[Deeplink] Found valid pending deep link:', pendingUrl);
                    url = pendingUrl;
                } else {
                    console.log('[Deeplink] Pending URL is too old, ignoring');
                }
                // Her durumda temizle
                Settings.set({ pendingDeepLink: null, pendingDeepLinkTimestamp: null });
            }
        }

        // Hala yoksa kısa bekle ve tekrar dene
        if (!url) {
            console.log('[Deeplink] URL still null, waiting 500ms...');
            await new Promise(resolve => setTimeout(resolve, 500));

            // Tekrar Linking'den kontrol et
            url = await Linking.getInitialURL();
            console.log('[Deeplink] Initial URL after wait:', url);

            // iOS'ta tekrar Settings kontrol et
            if (!url && Platform.OS === 'ios') {
                const pendingUrl = Settings.get('pendingDeepLink');
                const pendingTimestamp = Settings.get('pendingDeepLinkTimestamp');

                if (pendingUrl && pendingTimestamp) {
                    const now = Date.now() / 1000;
                    const age = now - pendingTimestamp;

                    if (age < 30) {
                        console.log('[Deeplink] Found valid pending deep link after wait:', pendingUrl);
                        url = pendingUrl;
                    }
                    Settings.set({ pendingDeepLink: null, pendingDeepLinkTimestamp: null });
                }
            }
        }

        if (url) {
            console.log('[Deeplink] Processing initial URL:', url);
            // For website URLs, we need to resolve them
            if (url.includes(API_CONFIG.universalDomain.replace('www.', ''))) {
                const resolved = await resolveUrl(url);

                if (resolved) {
                    // Convert to custom scheme URL for React Navigation
                    console.log('[Deeplink] Resolved to:', resolved.screen);
                    return convertToCustomScheme(resolved);
                }
            }
        }

        return url;
    },

    subscribe(listener) {
        // Listen for incoming links while app is running
        const subscription = Linking.addEventListener('url', async ({ url }) => {
            console.log('[Deeplink] Link received:', url);

            // URL null kontrolü
            if (!url) {
                console.log('[Deeplink] URL is null, ignoring');
                return;
            }

            // URL işlendiğinde NSUserDefaults'tan da temizle (AppState listener tekrar bulmasın)
            if (Platform.OS === 'ios') {
                console.log('[Deeplink] Clearing pending URL from Settings');
                Settings.set({ pendingDeepLink: null, pendingDeepLinkTimestamp: null });
            }

            if (url.includes(API_CONFIG.universalDomain.replace('www.', '')) && !url.startsWith(`${API_CONFIG.appScheme}://`)) {
                const resolved = await resolveUrl(url);
                if (resolved) {
                    const customUrl = convertToCustomScheme(resolved);
                    listener(customUrl);
                    return;
                }
            }

            listener(url);
        });

        // iOS'ta background'dan gelince pending URL'i kontrol et
        let appStateSubscription = null;
        if (Platform.OS === 'ios') {
            appStateSubscription = AppState.addEventListener('change', async (nextAppState) => {
                if (nextAppState === 'active') {
                    console.log('[Deeplink] App became active, checking pending URL...');
                    const pendingUrl = Settings.get('pendingDeepLink');
                    const pendingTimestamp = Settings.get('pendingDeepLinkTimestamp');

                    if (pendingUrl && pendingTimestamp) {
                        const now = Date.now() / 1000;
                        const age = now - pendingTimestamp;
                        console.log('[Deeplink] Pending URL age on activate:', age, 'seconds');

                        // Sadece son 30 saniye içinde kaydedilmiş URL'ler
                        if (age < 30) {
                            console.log('[Deeplink] Found valid pending URL on app activate:', pendingUrl);
                            // Temizle
                            Settings.set({ pendingDeepLink: null, pendingDeepLinkTimestamp: null });

                            // URL'i işle
                            if (pendingUrl.includes(API_CONFIG.universalDomain.replace('www.', ''))) {
                                const resolved = await resolveUrl(pendingUrl);
                                if (resolved) {
                                    const customUrl = convertToCustomScheme(resolved);
                                    listener(customUrl);
                                }
                            } else {
                                listener(pendingUrl);
                            }
                        } else {
                            console.log('[Deeplink] Pending URL is too old, ignoring');
                            Settings.set({ pendingDeepLink: null, pendingDeepLinkTimestamp: null });
                        }
                    }
                }
            });
        }

        return () => {
            subscription.remove();
            if (appStateSubscription) {
                appStateSubscription.remove();
            }
        };
    },
};

/**
 * Convert resolved navigation params to custom scheme URL
 */
function convertToCustomScheme(resolved) {
    const { screen, params } = resolved;

    switch (screen) {
        case 'UrunNav':
            return `${API_CONFIG.appScheme}://urun/${params.pid}`;
        case 'KategoriNav':
            return `${API_CONFIG.appScheme}://kategori/${params.cid}/${encodeURIComponent(params.title || '')}`;
        case 'SiparisNav':
            return `${API_CONFIG.appScheme}://siparis/${params.Code}`;
        case 'SepetNav':
            return `${API_CONFIG.appScheme}://sepet`;
        case 'GirisNav':
            return `${API_CONFIG.appScheme}://giris`;
        case 'KayitNav':
            return `${API_CONFIG.appScheme}://kayit`;
        case 'HesabimNav':
            return `${API_CONFIG.appScheme}://hesabim`;
        case 'SiparislerimNav':
            return `${API_CONFIG.appScheme}://siparislerim`;
        case 'FavorilerimNav':
            return `${API_CONFIG.appScheme}://favorilerim`;
        case 'AramaNav':
            return `${API_CONFIG.appScheme}://arama/${params.query || ''}`;
        default:
            return `${API_CONFIG.appScheme}://anasayfa`;
    }
}

// Export resolveUrl for use in other components (e.g., Insider callback)
export { resolveUrl, parseCustomSchemeUrl };
