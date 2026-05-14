/**
 * UserCoupons — Kullanıcının aktif hediye çeklerini gösterir.
 * İndirim kodu butonunun altında, "Kullan" butonu ile çek uygulanır.
 *
 * Props:
 *   onApply(couponCode) — çek uygulandığında çağrılır
 *   indirim — mevcut indirim varsa gizlenir
 */
import React, { useState, useEffect, useContext } from 'react';
import {
    View, Text, TouchableOpacity, StyleSheet, ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Auth from './Auth';
import { SepetContext } from './SepetContext';
import { colors } from '../config/theme';

const UserCoupons = ({ onApply, indirim }) => {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [applyingCode, setApplyingCode] = useState(null);
    const { translate } = useContext(SepetContext);

    useEffect(() => {
        fetchCoupons();
    }, []);

    const fetchCoupons = async () => {
        try {
            const memberID = await AsyncStorage.getItem('memberID');
            if (!memberID) {
                setLoading(false);
                return;
            }
            const response = await Auth.get('/user-coupons');
            if (response.data?.coupons) {
                setCoupons(response.data.coupons);
            }
        } catch (err) {
            // User might not be logged in — silently fail
            console.log('[UserCoupons] Error:', err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleUse = async (couponCode) => {
        setApplyingCode(couponCode);
        try {
            if (onApply) {
                await onApply(couponCode);
            }
            // Remove from local list
            setCoupons(prev => prev.filter(c => c.kod !== couponCode));
        } catch (err) {
            console.log('[UserCoupons] Apply error:', err.message);
        } finally {
            setApplyingCode(null);
        }
    };

    const formatDiscount = (coupon) => {
        if (coupon.tip === 'sabit') {
            return `${Number(coupon.sabittutar).toFixed(0)} TL`;
        }
        return `%${Number(coupon.yuzde).toFixed(0)}`;
    };

    const formatDate = (dateStr) => {
        try {
            const d = new Date(dateStr);
            return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`;
        } catch {
            return '';
        }
    };

    // Don't show if: loading, no coupons, or discount already applied
    if (loading || coupons.length === 0 || indirim) return null;

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{translate('Hediye Çekleriniz')}</Text>
            {coupons.map((coupon) => (
                <View key={coupon.kod} style={styles.card}>
                    <View style={styles.cardInfo}>
                        <Text style={styles.code}>{coupon.kod}</Text>
                        <Text style={styles.desc}>
                            {translate('Son tarih')}: {formatDate(coupon.sontarih)}
                            {coupon.minSepet > 0 && ` · Min: ${Number(coupon.minSepet).toFixed(0)} TL`}
                        </Text>
                    </View>
                    <Text style={styles.discount}>{formatDiscount(coupon)}</Text>
                    <TouchableOpacity
                        style={[styles.useBtn, applyingCode === coupon.kod && styles.useBtnDisabled]}
                        onPress={() => handleUse(coupon.kod)}
                        disabled={applyingCode === coupon.kod}
                    >
                        {applyingCode === coupon.kod ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <Text style={styles.useBtnText}>{translate('Kullan')}</Text>
                        )}
                    </TouchableOpacity>
                </View>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: 8,
        marginBottom: 4,
        paddingHorizontal: 0,
    },
    title: {
        fontSize: 11,
        color: '#888',
        marginBottom: 6,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        fontFamily: 'NunitoSans-Regular',
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fafafa',
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 10,
        marginBottom: 6,
        gap: 8,
    },
    cardInfo: {
        flex: 1,
    },
    code: {
        fontFamily: 'Courier',
        fontSize: 13,
        fontWeight: '700',
        color: '#1a1a2e',
        letterSpacing: 1,
    },
    desc: {
        fontSize: 11,
        color: '#666',
        marginTop: 2,
        fontFamily: 'NunitoSans-Regular',
    },
    discount: {
        fontSize: 14,
        fontWeight: '700',
        color: '#e94560',
    },
    useBtn: {
        paddingVertical: 6,
        paddingHorizontal: 14,
        backgroundColor: '#51b549',
        borderRadius: 6,
    },
    useBtnDisabled: {
        opacity: 0.6,
    },
    useBtnText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
        fontFamily: 'NunitoSans-Regular',
    },
});

export default UserCoupons;
