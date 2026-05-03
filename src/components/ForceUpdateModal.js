import React from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Platform,
    Image,
} from 'react-native';
import { openStore, APP_VERSION } from '../utils/VersionCheck';
import { colors } from '../config/theme';

/**
 * Zorunlu güncelleme modal'ı
 * forceUpdate true ise kapatılamaz, false ise "Daha Sonra" butonu görünür
 */
const ForceUpdateModal = ({
    visible,
    forceUpdate = true,
    updateMessage = 'Yeni bir güncelleme mevcut. Lütfen uygulamayı güncelleyin.',
    storeUrl = '',
    latestVersion = '',
    onClose,
}) => {
    const handleUpdate = () => {
        openStore(storeUrl);
    };

    const handleLater = () => {
        if (!forceUpdate && onClose) {
            onClose();
        }
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            statusBarTranslucent={true}
            onRequestClose={() => {
                // Android back button - sadece zorunlu değilse kapat
                if (!forceUpdate && onClose) {
                    onClose();
                }
            }}
        >
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    {/* Icon */}
                    <View style={styles.iconContainer}>
                        <Text style={styles.iconText}>🚀</Text>
                    </View>

                    {/* Title */}
                    <Text style={styles.title}>Güncelleme Gerekli</Text>

                    {/* Message */}
                    <Text style={styles.message}>{updateMessage}</Text>

                    {/* Version Info */}
                    <View style={styles.versionContainer}>
                        <Text style={styles.versionText}>
                            Mevcut: v{APP_VERSION}
                        </Text>
                        {latestVersion && (
                            <Text style={styles.versionText}>
                                Yeni: v{latestVersion}
                            </Text>
                        )}
                    </View>

                    {/* Buttons */}
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={styles.updateButton}
                            onPress={handleUpdate}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.updateButtonText}>
                                {Platform.OS === 'ios' ? 'App Store\'a Git' : 'Play Store\'a Git'}
                            </Text>
                        </TouchableOpacity>

                        {/* Daha Sonra butonu - sadece zorunlu değilse göster */}
                        {!forceUpdate && (
                            <TouchableOpacity
                                style={styles.laterButton}
                                onPress={handleLater}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.laterButtonText}>Daha Sonra</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Zorunlu uyarı */}
                    {forceUpdate && (
                        <Text style={styles.forceWarning}>
                            Bu güncelleme zorunludur. Uygulamayı kullanmaya devam etmek için güncellemeniz gerekmektedir.
                        </Text>
                    )}
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContainer: {
        backgroundColor: colors.white,
        borderRadius: 20,
        padding: 24,
        width: '100%',
        maxWidth: 340,
        alignItems: 'center',
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 10,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#E8F5E9',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    iconText: {
        fontSize: 40,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1a1a1a',
        marginBottom: 12,
        textAlign: 'center',
    },
    message: {
        fontSize: 15,
        color: '#666',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 16,
    },
    versionContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 20,
        marginBottom: 20,
    },
    versionText: {
        fontSize: 13,
        color: '#888',
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    },
    buttonContainer: {
        width: '100%',
        gap: 10,
    },
    updateButton: {
        backgroundColor: '#4CAF50',
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 12,
        width: '100%',
        alignItems: 'center',
    },
    updateButtonText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: '600',
    },
    laterButton: {
        backgroundColor: 'transparent',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 12,
        width: '100%',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
    },
    laterButtonText: {
        color: '#666',
        fontSize: 15,
        fontWeight: '500',
    },
    forceWarning: {
        marginTop: 16,
        fontSize: 12,
        color: '#d32f2f',
        textAlign: 'center',
        fontStyle: 'italic',
    },
});

export default ForceUpdateModal;
