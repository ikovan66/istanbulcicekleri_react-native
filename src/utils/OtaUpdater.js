/**
 * OTA (Over-the-Air) Updater for React Native
 * Self-hosted CodePush alternative
 */

import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFS from 'react-native-fs';
import RNRestart from 'react-native-restart';
import JSZip from 'jszip';
import { urls } from '../config/apiUrls';

// Konfigürasyon
const OTA_CONFIG = {
    baseUrl: urls.otaBase,
    bundleDir: RNFS.DocumentDirectoryPath + '/ota_bundles',
};

// Storage keys
const STORAGE_KEYS = {
    CURRENT_BUNDLE_VERSION: '@ota_current_version',
    PENDING_UPDATE: '@ota_pending_update',
    LAST_CHECK: '@ota_last_check',
    ROLLBACK_VERSION: '@ota_rollback_version',
};

/**
 * Güncelleme kontrolü
 * @returns {Promise<{hasUpdate: boolean, version?: string, bundleUrl?: string, isMandatory?: boolean}>}
 */
export const checkForUpdate = async () => {
    try {
        const currentVersion = await getCurrentBundleVersion();
        const platform = Platform.OS;

        const apiUrl = `${OTA_CONFIG.baseUrl}/check?platform=${platform}&currentVersion=${currentVersion}`;
        console.log('[OTA] Checking update with:', { currentVersion, platform, apiUrl });

        const response = await fetch(
            apiUrl,
            {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                },
            }
        );

        if (!response.ok) {
            console.log('OTA check failed:', response.status);
            return { hasUpdate: false };
        }

        const data = await response.json();
        console.log('OTA check result:', data);

        return {
            hasUpdate: data.hasUpdate || false,
            version: data.version,
            bundleUrl: data.bundleUrl,
            isMandatory: data.isMandatory || false,
            description: data.description,
        };
    } catch (error) {
        console.error('OTA checkForUpdate error:', error);
        return { hasUpdate: false };
    }
};

/**
 * Mevcut bundle versiyonunu al
 */
export const getCurrentBundleVersion = async () => {
    try {
        const version = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_BUNDLE_VERSION);
        return version || '100.0.6'; // Varsayılan versiyon
    } catch (error) {
        console.error('getCurrentBundleVersion error:', error);
        return '100.0.6';
    }
};

/**
 * Bundle indir (zip veya jsbundle destekler)
 * @param {string} bundleUrl 
 * @param {string} version 
 * @param {function} onProgress - Progress callback (0-100)
 */
export const downloadBundle = async (bundleUrl, version, onProgress = null) => {
    try {
        // Bundle dizinini oluştur
        const bundleDirExists = await RNFS.exists(OTA_CONFIG.bundleDir);
        if (!bundleDirExists) {
            await RNFS.mkdir(OTA_CONFIG.bundleDir);
        }

        // Ana bundle dosyası - native kod bu dosyayı arayacak
        const mainBundlePath = `${OTA_CONFIG.bundleDir}/main.jsbundle`;
        const isZip = bundleUrl.toLowerCase().endsWith('.zip') || bundleUrl.includes('download');
        const ext = isZip ? '.zip' : '.jsbundle';
        const tempPath = `${OTA_CONFIG.bundleDir}/temp_${version}${ext}`;

        // Mevcut versiyon kontrolü
        const currentVersion = await getCurrentBundleVersion();
        if (currentVersion === version) {
            console.log('[OTA] Already on latest version:', version);
            return { success: true, path: mainBundlePath, alreadyLatest: true };
        }

        console.log('[OTA] Downloading bundle from:', bundleUrl);
        console.log('[OTA] Is ZIP file:', isZip);

        // Download işlemi
        const downloadResult = await RNFS.downloadFile({
            fromUrl: bundleUrl,
            toFile: tempPath,
            background: true,
            discretionary: true,
            progress: (res) => {
                const progress = Math.round((res.bytesWritten / res.contentLength) * 100);
                if (onProgress) {
                    onProgress(progress);
                }
                console.log('[OTA] Download progress:', progress + '%');
            },
        }).promise;

        if (downloadResult.statusCode === 200) {
            console.log('[OTA] Download complete, processing...');

            // Eski bundle'ı yedekle (rollback için)
            const backupPath = `${OTA_CONFIG.bundleDir}/main.jsbundle.backup`;
            const mainExists = await RNFS.exists(mainBundlePath);
            if (mainExists) {
                // Eski backup varsa sil
                const backupExists = await RNFS.exists(backupPath);
                if (backupExists) {
                    await RNFS.unlink(backupPath);
                }
                await RNFS.moveFile(mainBundlePath, backupPath);
                console.log('[OTA] Backup created');
            }

            if (isZip) {
                // ZIP dosyasını aç ve tüm içeriği çıkar
                console.log('[OTA] Extracting ZIP file...');
                const zipContent = await RNFS.readFile(tempPath, 'base64');
                const zip = await JSZip.loadAsync(zipContent, { base64: true });

                // iOS için main.jsbundle, Android için index.android.bundle ara
                const bundleFileName = Platform.OS === 'ios' ? 'main.jsbundle' : 'index.android.bundle';
                let bundleFile = zip.file(bundleFileName);

                // Eğer kök dizinde yoksa, alt dizinlerde ara
                if (!bundleFile) {
                    const files = Object.keys(zip.files);
                    const foundFile = files.find(f => f.endsWith(bundleFileName));
                    if (foundFile) {
                        bundleFile = zip.file(foundFile);
                    }
                }

                if (!bundleFile) {
                    throw new Error(`Bundle file not found in ZIP: ${bundleFileName}`);
                }

                // Bundle içeriğini çıkar ve kaydet
                const bundleContent = await bundleFile.async('base64');
                await RNFS.writeFile(mainBundlePath, bundleContent, 'base64');
                console.log('[OTA] Bundle extracted from ZIP');

                // iOS için assets klasörünü de çıkar
                if (Platform.OS === 'ios') {
                    const assetsDir = `${OTA_CONFIG.bundleDir}/assets`;
                    const assetsDirExists = await RNFS.exists(assetsDir);
                    if (!assetsDirExists) {
                        await RNFS.mkdir(assetsDir);
                    }

                    // ZIP'teki tüm asset dosyalarını çıkar
                    const allFiles = Object.keys(zip.files);
                    const assetFiles = allFiles.filter(f =>
                        f.startsWith('assets/') && !zip.files[f].dir
                    );

                    console.log(`[OTA] Extracting ${assetFiles.length} asset files...`);

                    for (const assetPath of assetFiles) {
                        try {
                            const assetFile = zip.file(assetPath);
                            if (assetFile) {
                                // Klasör yapısını oluştur
                                const fullPath = `${OTA_CONFIG.bundleDir}/${assetPath}`;
                                const dirPath = fullPath.substring(0, fullPath.lastIndexOf('/'));

                                const dirExists = await RNFS.exists(dirPath);
                                if (!dirExists) {
                                    await RNFS.mkdir(dirPath);
                                }

                                // Asset'i kaydet
                                const assetContent = await assetFile.async('base64');
                                await RNFS.writeFile(fullPath, assetContent, 'base64');
                            }
                        } catch (assetError) {
                            console.warn(`[OTA] Failed to extract asset: ${assetPath}`, assetError);
                        }
                    }
                    console.log('[OTA] Assets extracted successfully');
                }

                // Temp zip dosyasını sil
                await RNFS.unlink(tempPath);
            } else {
                // Direkt jsbundle dosyası - taşı
                await RNFS.moveFile(tempPath, mainBundlePath);
            }

            console.log('[OTA] Bundle installed to:', mainBundlePath);

            // Pending update olarak işaretle
            await AsyncStorage.setItem(STORAGE_KEYS.PENDING_UPDATE, JSON.stringify({
                version,
                path: mainBundlePath,
                downloadedAt: new Date().toISOString(),
            }));

            console.log('[OTA] Bundle ready, version:', version);
            return { success: true, path: mainBundlePath };
        } else {
            console.error('[OTA] Download failed with status:', downloadResult.statusCode);
            // Temp dosyasını temizle
            const tempExists = await RNFS.exists(tempPath);
            if (tempExists) {
                await RNFS.unlink(tempPath);
            }
            return { success: false, error: 'Download failed' };
        }
    } catch (error) {
        console.error('[OTA] downloadBundle error:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Güncellemeyi uygula
 * NOT: Bu fonksiyon native modül gerektirir!
 * react-native-restart veya benzeri bir kütüphane kullanılmalı
 */
export const applyUpdate = async () => {
    try {
        const pendingUpdateStr = await AsyncStorage.getItem(STORAGE_KEYS.PENDING_UPDATE);
        if (!pendingUpdateStr) {
            console.log('No pending update to apply');
            return { success: false, error: 'No pending update' };
        }

        const pendingUpdate = JSON.parse(pendingUpdateStr);

        // Mevcut versiyonu rollback için sakla
        const currentVersion = await getCurrentBundleVersion();
        await AsyncStorage.setItem(STORAGE_KEYS.ROLLBACK_VERSION, currentVersion);

        // Yeni versiyonu aktif yap
        await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_BUNDLE_VERSION, pendingUpdate.version);

        // Pending update'i temizle
        await AsyncStorage.removeItem(STORAGE_KEYS.PENDING_UPDATE);

        console.log('[OTA] Update applied:', pendingUpdate.version);

        // Uygulamayı yeniden başlat - yeni bundle yüklenecek
        console.log('[OTA] Restarting app to load new bundle...');
        RNRestart.Restart();

        return { success: true, version: pendingUpdate.version };
    } catch (error) {
        console.error('applyUpdate error:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Önceki versiyona geri dön
 */
export const rollback = async () => {
    try {
        const rollbackVersion = await AsyncStorage.getItem(STORAGE_KEYS.ROLLBACK_VERSION);
        if (!rollbackVersion) {
            console.log('No rollback version available');
            return { success: false, error: 'No rollback version' };
        }

        await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_BUNDLE_VERSION, rollbackVersion);
        await AsyncStorage.removeItem(STORAGE_KEYS.ROLLBACK_VERSION);

        console.log('Rolled back to:', rollbackVersion);

        // Uygulamayı yeniden başlat
        // RNRestart.Restart();

        return { success: true, version: rollbackVersion };
    } catch (error) {
        console.error('rollback error:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Sunucuya güncelleme sonucunu raporla
 */
export const reportUpdateStatus = async (version, success, errorMessage = null) => {
    try {
        const platform = Platform.OS;

        await fetch(`${OTA_CONFIG.baseUrl}/report`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                platform,
                version,
                success,
                errorMessage,
                reportedAt: new Date().toISOString(),
            }),
        });
    } catch (error) {
        console.error('reportUpdateStatus error:', error);
    }
};

/**
 * Eski bundle'ları temizle
 */
export const cleanupOldBundles = async (keepVersions = 2) => {
    try {
        const bundleDirExists = await RNFS.exists(OTA_CONFIG.bundleDir);
        if (!bundleDirExists) return;

        const files = await RNFS.readDir(OTA_CONFIG.bundleDir);
        const bundles = files
            .filter(f => f.name.startsWith('bundle_') && f.name.endsWith('.zip'))
            .sort((a, b) => b.mtime - a.mtime); // En yeniden eskiye

        // Son N bundle hariç diğerlerini sil
        for (let i = keepVersions; i < bundles.length; i++) {
            await RNFS.unlink(bundles[i].path);
            console.log('Deleted old bundle:', bundles[i].name);
        }
    } catch (error) {
        console.error('cleanupOldBundles error:', error);
    }
};

// Default export
export default {
    checkForUpdate,
    downloadBundle,
    applyUpdate,
    rollback,
    getCurrentBundleVersion,
    reportUpdateStatus,
    cleanupOldBundles,
};
