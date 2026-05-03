import API_CONFIG from '../config/apiConfig';
import React, { useContext, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import axios from 'axios';
import CollapsibleView from './CollapsableView';
import { useFocusEffect } from '@react-navigation/native';
import { SepetContext } from '../components/SepetContext';
import { colors } from '../config/theme';

const checkedIcon = require('../assets/images/checked.png');
const uncheckedIcon = require('../assets/images/unchecked.png');

const BirlikteSepete = ({ pid, bayiId, mainProduct, onCommand }) => {
    const [products, setProducts] = useState([]);
    const [total, setTotal] = useState(0);
    const [eklendi, seteklendi] = useState(false);
    const [collapsibles, setCollapsibles] = useState({});
    const { fetchTranslations, translate } = useContext(SepetContext);

    // Ana ürün fiyatı
    const mainPrice = mainProduct?.fiyat ? parseFloat(mainProduct.fiyat) : 0;
    const mainName = mainProduct?.ad || '';
    const mainImage = mainProduct?.resimlist?.[0]?.resim 
        ? mainProduct.resimlist[0].resim 
        : (mainProduct?.imgurl || '');

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const params = { pid };
                if (bayiId && bayiId > 0) params.bayiId = bayiId;
                const response = await axios.get(`${API_CONFIG.basketApi}/api/SepetView/complementary-products`, {
                    params
                });
                const rawProducts = response.data?.products || response.data || [];
                
                const initialProducts = rawProducts.map(product => ({
                    Id: product.Id || product.id,
                    Name: product.Name || product.ad,
                    Price: product.Price ?? product.fiyat,
                    ImageUrl: product.ImageUrl || product.imgurl,
                    VariantLabel: product.VariantLabel || product.variantLabel || '',
                    checked: true,
                    Variants: (product.Variants || product.variants || []).map((variant, index) => ({
                        Id: variant.Id || variant.id,
                        Name: variant.Name || variant.ad,
                        Price: variant.Price ?? variant.fiyat,
                        checked: index === 0
                    }))
                }));

                setProducts(initialProducts);
            } catch (error) {
                console.error('[BirlikteSepete] API veri çekme hatası:', error.message);
            }
        };

        if (pid) fetchProducts();
    }, [pid, bayiId]);

    function birlikteAPIYE() {
        // Sadece seçili tamamlayıcıları gönder (ana ürün sheet'ten ekleniyor)
        onCommand(products);
        seteklendi(true);
    }

    useFocusEffect(
        React.useCallback(() => {
            seteklendi(false);
            return () => {};
        }, [])
    );

    const toggleProduct = (product) => {
        setProducts(currentProducts =>
            currentProducts.map(p =>
                p.Id === product.Id ? { ...p, checked: !p.checked } : p
            )
        );
    };

    const toggleVariant = (product, variant) => {
        setProducts(currentProducts =>
            currentProducts.map(p =>
                p.Id === product.Id ? {
                    ...p,
                    Variants: p.Variants.map(v =>
                        v.Id === variant.Id ? { ...v, checked: true } : { ...v, checked: false }
                    )
                } : p
            )
        );
        setCollapsibles(prev => ({ ...prev, [product.Id]: !prev[product.Id] }));
    };

    useEffect(() => {
        const newCollapsibles = {};
        products.forEach(product => {
            newCollapsibles[product.Id] = true;
        });
        setCollapsibles(newCollapsibles);
        toplamhesapla();
    }, [products]);

    const toplamhesapla = () => {
        // Ana ürün fiyatı + seçili tamamlayıcılar
        var toplam = mainPrice;
        products.forEach(product => {
            if (product.checked) {
                if (product.Variants.length) {
                    product.Variants.forEach(variant => {
                        if (variant.checked) toplam += parseFloat(variant.Price || 0);
                    });
                } else {
                    toplam += parseFloat(product.Price || 0);
                }
            }
        });
        setTotal(toplam);
    }

    if (products.length < 1) return null;

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{translate('Tamamlayıcı Ürünler')}</Text>

            {/* Ana Ürün - her zaman seçili, disabled (NJ ile aynı) */}
            {mainProduct && (
                <View style={[styles.productRow, styles.mainProductRow]}>
                    {mainImage ? (
                        <Image source={{ uri: mainImage }} style={styles.image} />
                    ) : null}
                    <View style={{ flex: 1 }}>
                        <View style={styles.chktouch}>
                            <Image source={checkedIcon} style={[styles.checkbox, { opacity: 0.5 }]} />
                            <View style={{ flex: 1 }}>
                                <Text style={styles.label}>{mainName}</Text>
                                <Text style={styles.mainBadge}>{translate('Bu ürün')}</Text>
                                <Text style={styles.label}>{mainPrice.toFixed(2)} TL</Text>
                            </View>
                        </View>
                    </View>
                </View>
            )}

            {/* Tamamlayıcı Ürünler */}
            {products.map((item) => (
                <View key={item.Id} style={styles.productRow}>
                    <Image source={{ uri: item.ImageUrl }} style={styles.image} />
                    <View style={{ flex: 1 }}>
                        <View >
                            <TouchableOpacity style={styles.chktouch} onPress={() => toggleProduct(item)}>
                                <Image
                                    source={item.checked ? checkedIcon : uncheckedIcon}
                                    style={styles.checkbox}
                                />
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.label}>{item.Name}</Text>
                                    {!item.Variants.length && <Text style={styles.label}>{item.Price} TL</Text>}
                                </View>
                            </TouchableOpacity>

                            {!item.Variants.length ? (<>

                            </>) : (
                                <>
                                    <CollapsibleView label={item.VariantLabel} title={item.Variants.find(x => x.checked).Name + ' - ' + item.Variants.find(x => x.checked).Price + ' TL'}
                                        collapsed={collapsibles[item.Id]}
                                        onToggle={() => setCollapsibles(prev => ({ ...prev, [item.Id]: !prev[item.Id] }))}
                                    >
                                        {item.Variants.map(variant => (
                                            <TouchableOpacity key={'v' + variant.Id} style={variant.checked ? styles.chktouchVAR2 : styles.chktouchVAR}
                                                onPress={() => toggleVariant(item, variant)}>
                                                <Text style={styles.label3}>{variant.Name} - {variant.Price} TL</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </CollapsibleView>
                                </>)}
                        </View>
                    </View>
                </View>
            ))}
            <Text style={styles.total}>{translate('Toplam')}: {total.toFixed(2)} TL</Text>
            {!eklendi || 1 == 1 ? (<TouchableOpacity style={styles.button} onPress={() => birlikteAPIYE()}>
                <Text style={styles.buttonText}>{translate('Birlikte Sepete Ekle')}</Text>
            </TouchableOpacity>) : (
                <Text style={{ color: 'green', marginVertical: 10, textAlign: 'center', width: '100%', fontFamily: 'NunitoSans-Regular', }}>{translate('Ürünler sepete başarıyla eklendi.')}</Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    chktouchVAR: { flexDirection: 'row', alignItems: 'center', marginTop: 4, paddingHorizontal: 15, paddingVertical: 5 },
    chktouchVAR2: { flexDirection: 'row', alignItems: 'center', marginTop: 4, backgroundColor: 'orange', paddingHorizontal: 15, paddingVertical: 5 },
    chktouch: { flexDirection: 'row', flex: 1, marginTop: 5 },
    container: { flex: 1, padding: 5 },
    title: { fontSize: 18, fontFamily: 'NunitoSans-SemiBold', marginBottom: 10, flex: 1 },
    productRow: { flexDirection: 'row', marginVertical: 3, padding: 3, backgroundColor: colors.white },
    mainProductRow: { borderLeftWidth: 3, borderLeftColor: colors.primary, opacity: 0.85 },
    mainBadge: { fontSize: 11, color: colors.primary, fontFamily: 'NunitoSans-Bold', marginBottom: 2 },
    image: { width: 50, height: 50, marginRight: 10 },
    checkbox: { width: 24, height: 24, marginRight: 10 },
    label: { flex: 1, marginBottom: 5, fontSize: 14, fontFamily: 'NunitoSans-Regular', },
    label3: { flex: 1, fontSize: 14, fontFamily: 'NunitoSans-Regular', },
    total: { fontSize: 18, marginTop: 10, fontFamily: 'NunitoSans-Regular', },
    button: { backgroundColor: colors.primary, fontFamily: 'NunitoSans-Regular', padding: 10, alignItems: 'center', marginTop: 10, marginBottom: 20, borderRadius: 6 },
    buttonText: { color: 'white', fontSize: 16, fontFamily: 'NunitoSans-Regular', }
});

export default BirlikteSepete;
