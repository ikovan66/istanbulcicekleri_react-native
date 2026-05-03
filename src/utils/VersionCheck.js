import { Platform, Linking } from 'react-native';
import axios from 'axios';
import { urls } from '../config/apiUrls';
import API_CONFIG from '../config/apiConfig';

// Uygulama versiyonu - her release'de güncellenmeli
export const APP_VERSION = '1.0.0';

const VERSION_CHECK_API = urls.appVersion;

/**
 * Versiyon karşılaştırma fonksiyonu
 * @param {string} currentVersion - Mevcut uygulama versiyonu (örn: "1.0.0")
 * @param {string} minVersion - Minimum gerekli versiyon (örn: "1.1.0")
 * @returns {boolean} - true ise güncelleme gerekli
 */
export const compareVersions = (currentVersion, minVersion) => {
    const current = currentVersion.split('.').map(Number);
    const minimum = minVersion.split('.').map(Number);

    for (let i = 0; i < Math.max(current.length, minimum.length); i++) {
        const currentPart = current[i] || 0;
        const minimumPart = minimum[i] || 0;

        if (currentPart < minimumPart) {
            return true; // Güncelleme gerekli
        }
        if (currentPart > minimumPart) {
            return false; // Güncelleme gerekli değil
        }
    }
    return false; // Versiyonlar eşit
};

/**
 * API'den versiyon bilgisini çeker ve güncelleme gerekip gerekmediğini kontrol eder
 * @returns {Promise<{needsUpdate: boolean, forceUpdate: boolean, updateMessage: string, storeUrl: string}>}
 */
export const checkForUpdate = async () => {
    try {
        const response = await axios.get(VERSION_CHECK_API, {
            timeout: 5000, // 5 saniye timeout
        });

        const data = response.data;

        /*
        Beklenen API response formatı:
        {
          "minVersion": "1.1.0",       // Minimum desteklenen versiyon
          "currentVersion": "1.2.0",   // Store'daki en son versiyon
          "forceUpdate": true,         // Zorunlu güncelleme mi?
          "updateMessage": "Yeni özellikleri kullanmak için lütfen uygulamayı güncelleyin.",
          "storeUrl": {
            "ios": "https://apps.apple.com/app/istanbul-cicekleri/id...",
            "android": "https://play.google.com/store/apps/details?id=com.istanbulcicekleri.mobileapp.istanbulCicekleri"
          }
        }
        */

        const minVersion = data.minVersion || '0.0.0';
        const needsUpdate = compareVersions(APP_VERSION, minVersion);
        const storeUrl = Platform.OS === 'ios'
            ? (data.storeUrl?.ios || '')
            : (data.storeUrl?.android || '');

        return {
            needsUpdate,
            forceUpdate: needsUpdate && data.forceUpdate === true,
            updateMessage: data.updateMessage || 'Yeni bir güncelleme mevcut. Lütfen uygulamayı güncelleyin.',
            storeUrl,
            latestVersion: data.currentVersion || minVersion,
        };
    } catch (error) {
        console.log('[VersionCheck] API error:', error.message);
        // Hata durumunda uygulamayı engellemiyoruz
        return {
            needsUpdate: false,
            forceUpdate: false,
            updateMessage: '',
            storeUrl: '',
            latestVersion: APP_VERSION,
        };
    }
};

/**
 * Store linkini açar
 * @param {string} storeUrl 
 */
export const openStore = async (storeUrl) => {
    if (!storeUrl) {
        // Varsayılan store linkleri
        const defaultUrl = Platform.OS === 'ios'
            ? API_CONFIG.storeUrls.ios
            : API_CONFIG.storeUrls.android;

        try {
            await Linking.openURL(defaultUrl);
        } catch (e) {
            console.log('[VersionCheck] Cannot open default store URL:', e);
        }
        return;
    }

    try {
        const canOpen = await Linking.canOpenURL(storeUrl);
        if (canOpen) {
            await Linking.openURL(storeUrl);
        }
    } catch (error) {
        console.log('[VersionCheck] Cannot open store URL:', error);
    }
};
