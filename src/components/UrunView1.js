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

const UrunView1 = ({ item, catstil = 0 }) => {
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
                <View >
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

                    <Text style={styles.productName}>{item.ad}</Text>


                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 }}>

                        {yuzde(item.fiyat, item.fiyatindirimsiz)}



                        {item.fiyatindirimsiz > 0 && item.fiyatindirimsiz > item.fiyat &&
                            <Text style={styles.indirimsiz}>{formatPrice(item.fiyatindirimsiz)} </Text>}
                        <Text style={styles.productPrice}>{formatPrice(item.fiyat)}</Text>


                    </View>

                    <RatingStars rating={item.rating} size={15} />

                    <Text style={styles.prom} numberOfLines={1} ellipsizeMode="tail" >{now.getHours() >= 19 ? translate('Yarın') : translate('Bugün')} /{translate('Ücretsiz Hızlı Teslimat')}</Text>

                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({

    prom: {
        fontFamily: 'NunitoSans-Regular',
        fontSize: 10.5,
        color: colors.primary,
        marginBottom: 10,
        marginTop: 10,
        textAlign: 'center'
    },
    indirimoran: {
        backgroundColor: '#e64e41',
        borderRadius: 4,
        paddingVertical: 2,
        paddingHorizontal: 5,
        minWidth: 30,
        marginRight: 6,
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
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    kalp: {
        position: 'absolute', right: 7, top: 7, zIndex: 10
    },
    image: {
        width: 110, aspectRatio: 0.8746, resizeMode: 'contain', backgroundColor: 'white',
        borderRadius: 10, overflow: 'hidden'
    },
    productInfoContainer: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
        paddingLeft: 20,
    },
    productName: {
        fontFamily: 'NunitoSans-Bold',
        color: colors.black,
        fontSize: 13,
        lineHeight: 17,
        textAlign: 'left',
        marginBottom: 20,
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

export default UrunView1;