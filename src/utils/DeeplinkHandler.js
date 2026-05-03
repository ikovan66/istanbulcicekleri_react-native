import API_CONFIG from '../config/apiConfig';
import { Linking, Platform } from 'react-native';
import { resolveUrl, parseCustomSchemeUrl } from './DeeplinkConfig';

/**
 * Deeplink Handler Utilities
 * Handles navigation from various sources (push notifications, shares, etc.)
 */

/**
 * Handle Insider push notification deeplinks
 * Called from App.tsx when InsiderCallbackType.NOTIFICATION_OPEN is received
 * 
 * @param {object} data - Insider notification data
 * @param {object} navigation - React Navigation reference
 */
export const handleInsiderDeeplink = async (data, navigation) => {
    if (!data || !navigation) {
        console.log('[Deeplink] Missing data or navigation ref');
        return;
    }

    console.log('[Deeplink] Handling Insider notification:', JSON.stringify(data));

    // Insider'ın kullanabileceği tüm olası URL field'ları
    const possibleUrlFields = [
        'url', 'URL',
        'deeplink', 'deep_link', 'deepLink', 'Deeplink',
        'link', 'Link',
        'andUrl', 'iosUrl',
        'launchUrl', 'launch_url',
        'targetUrl', 'target_url',
        'redirectUrl', 'redirect_url',
        'actionUrl', 'action_url',
        'clickUrl', 'click_url'
    ];

    let url = null;

    // Doğrudan data objesinde ara
    for (const field of possibleUrlFields) {
        if (data[field] && typeof data[field] === 'string') {
            url = data[field];
            console.log('[Deeplink] Found URL in field "' + field + '":', url);
            break;
        }
    }

    // Nested data.data içinde ara
    if (!url && data.data && typeof data.data === 'object') {
        console.log('[Deeplink] Checking nested data.data:', JSON.stringify(data.data));
        for (const field of possibleUrlFields) {
            if (data.data[field] && typeof data.data[field] === 'string') {
                url = data.data[field];
                console.log('[Deeplink] Found URL in data.data.' + field + ':', url);
                break;
            }
        }
    }

    // data.source içinde ara
    if (!url && data.source && typeof data.source === 'object') {
        console.log('[Deeplink] Checking data.source:', JSON.stringify(data.source));
        for (const field of possibleUrlFields) {
            if (data.source[field] && typeof data.source[field] === 'string') {
                url = data.source[field];
                console.log('[Deeplink] Found URL in data.source.' + field + ':', url);
                break;
            }
        }
    }

    if (url) {
        console.log('[Deeplink] Navigating with URL:', url);
        await navigateFromUrl(url, navigation);
        return;
    }

    // Check for direct screen/params in data
    if (data.screen) {
        console.log('[Deeplink] Direct screen navigation:', data.screen);
        navigation.navigate(data.screen, data.params || {});
        return;
    }

    // Check for product ID
    if (data.product_id || data.productId || data.pid) {
        const pid = data.product_id || data.productId || data.pid;
        console.log('[Deeplink] Product navigation:', pid);
        navigation.navigate('UrunNav', { pid: parseInt(pid) });
        return;
    }

    // Check for category ID
    if (data.category_id || data.categoryId || data.cid) {
        const cid = data.category_id || data.categoryId || data.cid;
        console.log('[Deeplink] Category navigation:', cid);
        navigation.navigate('KategoriNav', { cid: parseInt(cid), title: data.title || '' });
        return;
    }

    console.log('[Deeplink] No actionable data found in notification');
};

/**
 * Navigate from a URL string
 * 
 * @param {string} url - Deep link URL
 * @param {object} navigation - React Navigation reference
 */
export const navigateFromUrl = async (url, navigation) => {
    if (!url || !navigation) return;

    try {
        const resolved = await resolveUrl(url);

        if (resolved && resolved.screen) {
            console.log('[Deeplink] Navigating to:', resolved.screen, resolved.params);
            navigation.navigate(resolved.screen, resolved.params || {});
        } else {
            console.log('[Deeplink] Could not resolve URL, going to home');
            navigation.navigate('AnaNav');
        }
    } catch (error) {
        console.error('[Deeplink] Navigation error:', error);
        navigation.navigate('AnaNav');
    }
};

/**
 * Generate shareable product link
 * 
 * @param {object} product - Product object with url or id
 * @returns {string} Shareable URL
 */
export const generateProductLink = (product) => {
    if (!product) return API_CONFIG.webBaseUrl;

    // Prefer website URL for better user experience
    if (product.url) {
        return `${API_CONFIG.webBaseUrl}/${product.url}`;
    }

    // Fallback to custom scheme
    return `${API_CONFIG.appScheme}://urun/${product.id}`;
};

/**
 * Generate shareable category link
 * 
 * @param {object} category - Category object with id and optional ad (name)
 * @returns {string} Shareable URL
 */
export const generateCategoryLink = (category) => {
    if (!category) return API_CONFIG.webBaseUrl;

    // Custom scheme with ID
    const title = encodeURIComponent(category.ad || category.title || '');
    return `${API_CONFIG.appScheme}://kategori/${category.id}/${title}`;
};

/**
 * Generate shareable order link
 * 
 * @param {string} orderCode - Order code
 * @returns {string} Shareable URL
 */
export const generateOrderLink = (orderCode) => {
    if (!orderCode) return `${API_CONFIG.appScheme}://siparislerim`;
    return `${API_CONFIG.appScheme}://siparis/${orderCode}`;
};

/**
 * Check if app was opened from a deeplink and handle it
 * Call this from App.tsx useEffect
 * 
 * @param {object} navigation - React Navigation reference
 */
export const handleInitialDeeplink = async (navigation) => {
    try {
        const initialUrl = await Linking.getInitialURL();

        if (initialUrl) {
            console.log('[Deeplink] App opened from URL:', initialUrl);

            // Pass the URL to Insider explicitly for Android cold-starts
            if (Platform.OS === 'android') {
                import('react-native-insider').then(RNInsider => {
                    RNInsider.default.handleUniversalLink(initialUrl);
                    console.log('[Insider] Passed initial URL to handleUniversalLink');
                });
            }

            await navigateFromUrl(initialUrl, navigation);
            return true;
        }
    } catch (error) {
        console.error('[Deeplink] Error handling initial URL:', error);
    }

    return false;
};

export default {
    handleInsiderDeeplink,
    navigateFromUrl,
    generateProductLink,
    generateCategoryLink,
    generateOrderLink,
    handleInitialDeeplink,
};
