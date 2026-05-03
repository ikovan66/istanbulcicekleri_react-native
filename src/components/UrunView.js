import API_CONFIG from '../config/apiConfig';
import React, { useState, useContext } from 'react';
import { Text, View, Image, TouchableOpacity, StyleSheet } from 'react-native';
import FastImage from 'react-native-fast-image';
import { useNavigation } from '@react-navigation/native';
import KalpIcon from '../components/KalpIcon';
import { ZoomOut } from 'react-native-reanimated';
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

const UrunView = ({ item, kayan = false, catstil = 0 }) => {
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
        if (catstil == 1) return styles.touchCAT;//CATEGORİ RENK 1
        if (catstil == 2) return styles.touchCAT2;//CATEGORİ RENK 2
        return styles.touch;//ANASAYFADAKİ STİL

    }

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
        ><View style={kayan ? styles.touchicKayan : styles.touchic}>
                <KalpIcon pid={item.id} style={styles.kalp} />


                <FastImage
                    style={styles.image}
                    source={{
                        uri: resolveImageUrl(item.imgurl),
                        priority: FastImage.priority.high,
                    }}
                    resizeMode={FastImage.resizeMode.contain}
                    onError={() => handleError(item)}
                />


                <Text style={styles.productName} numberOfLines={3}>{item.ad}</Text>


                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    {yuzde(item.fiyat, item.fiyatindirimsiz)}

                    <View style={styles.productPriceView}>

                        {item.fiyatindirimsiz > 0 && item.fiyatindirimsiz > item.fiyat &&
                            <Text style={styles.indirimsiz}>{formatPrice(item.fiyatindirimsiz)} </Text>}
                        <Text style={styles.productPrice}>{formatPrice(item.fiyat)}</Text>

                    </View>
                </View>
                <RatingStars rating={item.rating} size={15} />

                <Text style={styles.prom} numberOfLines={1} ellipsizeMode="tail" >{now.getHours() >= 19 ? translate('Yarın') : translate('Bugün')} /{translate('Ücretsiz Hızlı Teslimat')}</Text>
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
        marginBottom: 10,
        marginTop: 5,
        textAlign: 'center'
    },
    touch: {
        flex: 1,
        margin: 5,
        padding: 0,
        borderRadius: 0,
        backgroundColor: colors.white,
        overflow: 'hidden',
        borderColor: '#e2e7e9',
        borderWidth: 1,
        borderRadius: 10,
    },
    touchCAT: {
        flex: 1,
        margin: 0,
        padding: 10,
        borderRadius: 0,
        backgroundColor: colors.white,
        overflow: 'hidden',
    },
    touchCAT2: {
        flex: 1,
        margin: 0,
        padding: 10,
        borderRadius: 0,
        backgroundColor: colors.white,
        overflow: 'hidden',
    },
    touchic: {
        flex: 1,
        margin: 0,
        padding: 0,
        borderRadius: 0,
        alignItems: 'center',
        justifyContent: 'space-between', // İçerikleri dikeyde yayar (ürün adı ve fiyat arasında boşluk)
        flexDirection: 'column' // Dikey yerleştirme
    },
    touchicKayan: {
        width: 180,
        flex: 1,
        margin: 0,
        padding: 0,
        backgroundColor: colors.white,
        // borderColor:'#e2e7e9',
        // borderWidth:1,
        // borderRadius:10,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'space-between', // İçerikleri dikeyde yayar (ürün adı ve fiyat arasında boşluk)
        flexDirection: 'column' // Dikey yerleştirme
    },
    kalp: {
        position: 'absolute', right: 5, top: 5, zIndex: 10,
    },
    image: {
        width: '100%', aspectRatio: 0.8746, resizeMode: 'contain'
    },
    productName: {
        fontFamily: 'NunitoSans-Bold',
        color: 'black',
        fontSize: 12,
        lineHeight: 17,
        textAlign: 'center',
        padding: 4,
        marginTop: 5, flex: 1
    },

    productPriceView: {
        flexDirection: 'column',
        justifyContent: 'space-between',
        marginTop: 10,
        marginBottom: 10,
        textAlign: 'center'
        // Flex ayarları
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
        marginRight: 10,
    },
});
export default UrunView;