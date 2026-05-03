/**
 * OTA Asset Resolver
 * Asset'lerin OTA dizininden yüklenmesini sağlar
 */

import { Platform, Image } from 'react-native';
import RNFS from 'react-native-fs';

const OTA_BUNDLE_DIR = RNFS.DocumentDirectoryPath + '/ota_bundles';

// Orijinal resolveAssetSource'u sakla
const originalResolveAssetSource = Image.resolveAssetSource;

/**
 * OTA asset resolver'ı aktif et
 * Bu fonksiyon, asset'lerin OTA dizininden yüklenmesini sağlar
 */
export const enableOtaAssetResolver = async () => {
    if (Platform.OS !== 'ios') return; // Sadece iOS için

    try {
        const otaBundlePath = `${OTA_BUNDLE_DIR}/main.jsbundle`;
        const otaBundleExists = await RNFS.exists(otaBundlePath);

        if (!otaBundleExists) {
            console.log('[OTA AssetResolver] No OTA bundle, using default assets');
            return;
        }

        console.log('[OTA AssetResolver] OTA bundle detected, patching asset resolver');

        // Asset resolver'ı patch et
        Image.resolveAssetSource = (source) => {
            const resolved = originalResolveAssetSource(source);

            if (resolved && resolved.uri && typeof source === 'object' && source.httpServerLocation) {
                // Asset yolunu OTA dizinine yönlendir
                const assetPath = source.httpServerLocation.replace('/assets/', '');
                const otaAssetPath = `${OTA_BUNDLE_DIR}/assets/${assetPath}/${source.name}.${source.type}`;

                // Senkron kontrol yapamayız, ama dosya var varsayıyoruz
                return {
                    ...resolved,
                    uri: `file://${otaAssetPath}`,
                };
            }

            return resolved;
        };

        console.log('[OTA AssetResolver] Asset resolver patched');
    } catch (error) {
        console.error('[OTA AssetResolver] Error:', error);
    }
};

/**
 * OTA asset resolver'ı devre dışı bırak
 */
export const disableOtaAssetResolver = () => {
    Image.resolveAssetSource = originalResolveAssetSource;
    console.log('[OTA AssetResolver] Asset resolver restored to default');
};

export default {
    enableOtaAssetResolver,
    disableOtaAssetResolver,
};
