import API_CONFIG from '../config/apiConfig';
import React, { useState, useContext } from 'react';
import { Text, View, Image, TouchableOpacity, StyleSheet } from 'react-native';
import FastImage from 'react-native-fast-image';
import { useNavigation } from '@react-navigation/native';
import KalpIcon from './KalpIcon';
import RatingStars from './RatingStars';
import { colors } from '../config/theme';
import { SepetContext } from './SepetContext';

const placeholderImage = { uri: `${API_CONFIG.webBaseUrl}/images/placeholder.png` };

// API bazen relative URL döner (/urunler/xxx.jpg) — absolute'a çevir
const resolveImageUrl = (url) => {
    if (!url) return placeholderImage.uri;
    if (url.startsWith('http')) return url;
    return `${API_CONFIG.webBaseUrl}${url}`;
};

const UrunView2 = ({ item, catstil = 0 }) => {
    const navigation = useNavigation();
    const { formatPrice, translate } = useContext(SepetContext);
    const now = new Date();

    const [imageErrors, setImageErrors] = useState({});
    const handleError = (item) => {
        setImageErrors((prevErrors) => ({
            ...prevErrors,
            [item.id]: true
        }));
    };

    const urunstili = () => {
        if (catstil == 1) return styles.touchCAT; // CATEGORİ RENK 1
        if (catstil == 2) return styles.touchCAT2; // CATEGORİ RENK 2
        return styles.touch; // ANASAYFADAKİ STİL
    };
    const yuzde = (a, b) => {
        let y = 0;
        if (b != 0) y = Math.round(100 * (b - a) / b);
        let sonuc = (<></>);
        if (y > 0) {
            sonuc = (<>
                <View style={styles.indirimoran}>
                    <Text style={{ color: 'white', fontFamily: 'NunitoSans-Regular', fontSize: 12 }}>%{y}</Text>
                </View>
            </>);
        }
        return sonuc

    }

    return (
        <TouchableOpacity
            style={urunstili()}
            onPress={() => navigation.navigate('UrunNav', { pid: item.id, resetScroll: true })}
        >
            <View style={styles.touchic}>
                <View  >
                    <KalpIcon pid={item.id} width="20" height="20" style={styles.kalp} />


                    <FastImage
                        style={styles.image}
                        source={{
                            uri: resolveImageUrl(item.imgurl),
                            priority: FastImage.priority.normal,
                        }}
                        resizeMode={FastImage.resizeMode.contain}
                        onError={() => handleError(item)}
                    />

                </View>
                <View style={styles.productInfoContainer}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.productName}>{item.ad}</Text>

                        <RatingStars rating={item.rating} size={15} />

                        <Text style={styles.prom} numberOfLines={1} ellipsizeMode="tail" >{now.getHours() >= 19 ? translate('Yarın') : translate('Bugün')} /{translate('Ücretsiz Hızlı Teslimat')}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        {yuzde(item.fiyat, item.fiyatindirimsiz)}

                        <View style={styles.productPriceView}>

                            {item.fiyatindirimsiz > 0 && item.fiyatindirimsiz > item.fiyat &&
                                <Text style={styles.indirimsiz}>{formatPrice(item.fiyatindirimsiz)} </Text>}
                            <Text style={styles.productPrice}>{formatPrice(item.fiyat)}</Text>

                        </View>
                    </View>

                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    indirimoran: {
        backgroundColor: '#e64e41',
        borderRadius: 4,
        paddingVertical: 2,
        paddingHorizontal: 5,
        minWidth: 30,
        marginRight: 3,
    },
    prom: {
        fontFamily: 'NunitoSans-Regular',
        fontSize: 10.5,
        color: colors.primary,
        marginTop: 10,
        textAlign: 'left'
    },
    touch: {
        flex: 1,
        margin: 5,
        padding: 10,
        borderRadius: 7,
        backgroundColor: colors.background,
    },
    touchCAT: {
        flex: 1,
        margin: 0,
        padding: 10,
        borderRadius: 0,
        backgroundColor: colors.white,
    },
    touchCAT2: {
        flex: 1,
        margin: 0,
        padding: 10,
        borderRadius: 0,
        backgroundColor: colors.background,
    },
    touchic: {
        padding: 20,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    kalp: {
        position: 'absolute', right: 7, top: 7, zIndex: 10
    },
    image: {
        width: '100%', aspectRatio: 0.8746, resizeMode: 'contain', backgroundColor: 'white'
    },
    productInfoContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 20,
    },
    productName: {
        flex: 1,  // Tüm kalan alanı kapla
        fontFamily: 'NunitoSans-Bold',
        color: colors.black,
        fontSize: 13,
        lineHeight: 17,
        textAlign: 'left',
        paddingRight: 20,
        marginBottom: 5,
    },
    productPriceView: {
        textAlign: 'right',
        justifyContent: 'space-between',
    },
    productPrice: {
        fontFamily: 'NunitoSans-Regular',
        fontSize: 14,
        color: colors.black,
    },
    indirimsiz: {
        fontFamily: 'NunitoSans-Regular',
        fontSize: 14,
        textDecorationLine: 'line-through',
        textDecorationStyle: 'solid',
        color: '#A1A1A1',
        marginBottom: 5,
    },
});

export default UrunView2;