import API_CONFIG from '../config/apiConfig';
import React, { useContext, useEffect, useState, useRef } from 'react';
import {
    Platform, Alert, Image, View, Text,
    TouchableOpacity, StyleSheet, Modal, ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import FastImage from 'react-native-fast-image';
import LottieView from 'lottie-react-native';
import stylesglobal from '../stylesglobal';
import FotoCek from './FotoCek';
import Svg, { G, Circle, Path } from 'react-native-svg';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { ikostalert } from '../GlobalAlert';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SepetContext } from '../components/SepetContext';
import { Camera, useCameraDevices } from 'react-native-vision-camera';
import InsiderEvents from '../utils/InsiderHelper';
import { colors } from '../config/theme';
import KisiyeOzel from '../components/KisiyeOzel';

const Ekurunler = ({ Code, sid, onchange }) => {
    const KapatSVG = () => (
        <Svg width="40" height="40" viewBox="0 0 40 40">
            <G clipPath="url(#clip-path)">
                <Path
                    d="M9.555,8.231a1.36,1.36,0,0,1,.134-.193Q13.532,4.19,17.376.344A.953.953,0,0,1,18.331.03a.924.924,0,0,1,.505,1.476,2.328,2.328,0,0,1-.191.2q-3.818,3.82-7.637,7.639c-.052.052-.112.1-.238.2A1.166,1.166,0,0,1,11,9.684q3.848,3.843,7.692,7.689a.962.962,0,0,1,.322.953.925.925,0,0,1-1.5.5c-.062-.051-.117-.11-.174-.167L9.711,11.028c-.057-.057-.105-.122-.172-.2-.072.068-.124.117-.175.167q-3.852,3.852-7.7,7.706a.952.952,0,0,1-.955.311.924.924,0,0,1-.512-1.462,2.124,2.124,0,0,1,.189-.2q3.825-3.827,7.651-7.652a1.621,1.621,0,0,1,.19-.14c-.084-.089-.133-.143-.184-.194L.378,1.693a1.875,1.875,0,0,1-.21-.235A.926.926,0,0,1,1.47.176,2.048,2.048,0,0,1,1.7.388L9.355,8.039c.051.051.105.1.2.192"
                    fill="#383838"
                />
            </G>
        </Svg>
    );

    const { fetchTranslations, translate, insiderProductMap1, formatPrice } = useContext(SepetContext);

    const [sepetEKList, setsepetEKList] = useState(null);
    const [ekurunList, setekurunList] = useState(null);
    const [loading, setLoading] = useState(false);

    // Burada seçili kategoriyi tutacak state
    const [selectedCategory, setSelectedCategory] = useState(null);

    // Kişiye özel modal state
    const [kisiyeOzelModalVisible, setKisiyeOzelModalVisible] = useState(false);
    const [kisiyeOzelItem, setKisiyeOzelItem] = useState(null);
    const [kisiyeOzelAlanlar, setKisiyeOzelAlanlar] = useState([]);
    const [kisiyeOzelNot, setKisiyeOzelNot] = useState(null);


    // Mavi - Beyaz dağılımı (veya sadece beyaz da yapabilirsiniz):
    const getMosaicBgColor = (rowIndex, colIndex) => {
        if ((rowIndex + colIndex) % 2 === 0) {
            return colors.white;
        }
        return colors.white;
    };

    const EkurunItem = ({ item, onRemove, onUpdateQuantity, onEkle, mosaicBgColor }) => {
        const [istikli, setistikli] = useState(false);
        const [adet, setiadet] = useState(0);
        const [modalVisibleFOTOCEK, setmodalVisibleFOTOCEK] = useState(false);
        const [ekurunIMGurl, setekurunIMGurl] = useState(item.imgurl);
        const [imageUri, setImageUri] = useState(null);
        const [isuploading, setisuploading] = useState(false);

        const openCamera = async (iitem) => {
            const status = await Camera.requestCameraPermission();
            if (status !== 'authorized') {
                Alert.alert('İzin Gerekli', 'Kamera izni vermeniz gerekmektedir.');
                return;
            }

            const options = {
                mediaType: 'photo',
                saveToPhotos: true,
            };

            const result = await launchCamera(options);

            if (result.didCancel) {
                console.log('Kullanıcı kamera kullanımını iptal etti.');
            } else if (result.errorCode) {
                console.error('Kamera hatası:', result.errorMessage);
                Alert.alert('Hata', 'Kamerayı açarken bir hata oluştu.');
            } else if (result.assets && result.assets.length > 0) {
                cloudflareUpload(
                    iitem,
                    result.assets[0].uri,
                    result.assets[0].type,
                    result.assets[0].fileName
                );
                setImageUri(result.assets[0].uri);
            }
        };

        const openGallery = async (iitem) => {
            const options = {
                mediaType: 'photo',
                selectionLimit: 1,
            };
            try {
                const result = await launchImageLibrary(options);
                if (!result.didCancel && result.assets) {
                    setImageUri(result.assets[0].uri);
                    cloudflareUpload(
                        iitem,
                        result.assets[0].uri,
                        result.assets[0].type,
                        result.assets[0].fileName
                    );
                }
            } catch (error) {
                console.error('Galeriyi açarken hata:', error);
                Alert.alert('Hata', 'Galeriyi açarken bir sorun oluştu.');
            }
        };

        useEffect(() => {
            let urunSepette = null;
            if (sepetEKList) {
                urunSepette = sepetEKList.find(sepetItem => sepetItem.pid === item.id);
            }
            setiadet(urunSepette ? urunSepette.adet : 0);
            setistikli(urunSepette ? true : false);
            if (urunSepette && urunSepette.yazi) {
                setekurunIMGurl(
                    urunSepette.yazi.replace('mobile', 'thumba').replace('desktop', 'thumba')
                );
            }
        }, [sepetEKList]);

        const cloudflareUpload = async (iitem, imgurl, imgtype, imgname) => {
            setisuploading(true);

            const apiUrl = 'https://api.cloudflare.com/client/v4/accounts/db6ba4190765cb8cebde3b66cdca4b20/images/v1';
            const apiToken = 'YGUcl2AUN-fxq2Mduldd6DAFnv2IXqf1PMRtWQEb';

            try {
                const formData = new FormData();
                formData.append('file', {
                    uri: imgurl,
                    type: imgtype,
                    name: imgname,
                });

                const response = await axios.post(apiUrl, formData, {
                    headers: {
                        Authorization: `Bearer ${apiToken}`,
                        'Content-Type': 'multipart/form-data',
                    },
                });

                const result = response.data.result;
                const uploadedUrl = result.variants[0];
                console.log('Yüklenen dosya URL\'si:', uploadedUrl);
                successact(iitem, uploadedUrl);
                setisuploading(false);

                return uploadedUrl;
            } catch (error) {
                setisuploading(false);
                console.error('Hata:', error.response?.data || error.message);
                throw error;
            }
        };

        function successact(iitem, imageUrl) {
            let yeniadet = 1;
            if (istikli) {
                // zaten seçiliyse kapatalım
                yeniadet = 0;
            }
            if (imageUrl !== '') {
                setekurunIMGurl(
                    imageUrl
                        .replace('mobile', 'thumba')
                        .replace('desktop', 'thumba')
                );
            }
            onUpdateQuantity(
                iitem,
                yeniadet,
                imageUrl
                    .replace('thumba', 'desktop')
                    .replace('mobile', 'desktop')
            );
            setistikli(!istikli);
        }



        function tikle(iitem) {
            // url içinde "foto" geçiyorsa fotoğraf zorunlu
            if (!iitem.url.includes("foto")) {
                // Foto gerekmeden ekleyelim
                successact(iitem, '');
            } else {
                // Daha önce ekli ise kaldıralım
                if (istikli) {
                    successact(iitem, '');
                } else {
                    ikostalert(
                        "Seçenekler",
                        "Fotoğraf çekmek veya galeriden seçmek ister misiniz?",
                        [
                            { text: "Kamerayı Aç", onPress: () => openCamera(iitem) },
                            { text: "Galeriden Seç", onPress: () => openGallery(iitem) },
                            { text: "İptal", style: "cancel" },
                        ]
                    );
                }
            }
        }

        function arttir(iitem) {
            onUpdateQuantity(iitem, adet + 1);
        }

        function azalt(iitem) {
            if (adet > 1) {
                onUpdateQuantity(iitem, adet - 1);
            } else if (adet === 1) {
                onRemove(iitem);
            }
        }

        return (
            <>
                <View
                    style={{
                        flex: 1,
                        margin: 0,
                        padding: 4,
                        borderWidth: 1,
                        margin: 2,
                        borderColor: adet === 1 ? '#EBEBEB' : '#EBEBEB',
                        backgroundColor: mosaicBgColor,
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        position: 'relative',
                    }}
                >
                    {/* {adet === 1 && (
                        <Image
                            source={require('../assets/images/checked.png')}
                            style={{ width: 25, height: 25, alignSelf: 'flex-end' }}
                        />
                    )} */}

                    {isuploading && (
                        <View style={{ width: '100%', height: 100, alignItems: 'center', zIndex: 5, justifyContent: 'center' }}>
                            <LottieView
                                source={require('../assets/animations/yukleme_ani.json')}
                                autoPlay
                                loop
                                style={stylesglobal.loading3}
                            />
                        </View>
                    )}

                    {!isuploading && (
                        <FastImage
                            style={{ width: '100%', height: 100, resizeMode: 'contain' }}
                            source={{
                                uri: ekurunIMGurl,
                                priority: FastImage.priority.normal,
                            }}
                            resizeMode={FastImage.resizeMode.contain}
                            onError={() => console.log('Resim yüklenemedi')}
                        />
                    )}
                    <View style={{ flex: 1, height: 80, }}>


                        <Text style={styles.productName} numberOfLines={2}>{item.ad}</Text>
                        <Text style={styles.productPrice}>{formatPrice(item.fiyat)}</Text>
                    </View>
                    <View style={styles.buttonContainer}>
                        {adet > 0 ? (
                            <>
                                <TouchableOpacity style={styles.ekbutton} onPress={() => azalt(item)}>
                                    <Text style={styles.ekbuttonText}>-</Text>
                                </TouchableOpacity>
                                <Text style={styles.adetText}>{adet}</Text>
                                <TouchableOpacity style={styles.ekbutton} onPress={() => onEkle(item)}>
                                    <Text style={styles.ekbuttonText}>+</Text>
                                </TouchableOpacity>
                            </>
                        ) : (
                            <TouchableOpacity style={styles.ekbutton} onPress={() => onEkle(item)}>
                                <Text style={styles.ekbuttonText}>{translate('Ekle')}</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisibleFOTOCEK}
                    onRequestClose={() => { setmodalVisibleFOTOCEK(!modalVisibleFOTOCEK); }}
                >
                    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
                        <View style={{ flexDirection: 'row', width: '100%', paddingHorizontal: 10, paddingVertical: 10 }}>
                            <Text style={{ flex: 1, fontSize: 18, color: 'black' }}>Fotoğraf Çek</Text>
                            <TouchableOpacity
                                style={{ alignSelf: 'flex-end', width: 30, height: 30 }}
                                onPress={() => setmodalVisibleFOTOCEK(!modalVisibleFOTOCEK)}
                            >
                                <KapatSVG />
                            </TouchableOpacity>
                        </View>
                        <View style={{ height: 1, backgroundColor: 'black', marginBottom: 16 }} />
                        <FotoCek item={item} onCommand={successact} />
                    </SafeAreaView>
                </Modal>
            </>
        );
    };

    const ekurunverial = async () => {
        try {
            // NJ proxy üzerinden çağır (bayi filtreleme server-side yapılıyor)
            const params = new URLSearchParams();
            if (Code) params.append('code', Code);
            const dilStored = await AsyncStorage.getItem('dil');
            if (dilStored && dilStored.toUpperCase() !== 'TR') params.append('lang', dilStored);

            const url = `${API_CONFIG.webBaseUrl}/api/cart/ekurunler?${params.toString()}`;
            console.log('[Ekurunler] Fetching:', url);
            const response = await axios.get(url);
            console.log('[Ekurunler] Response count:', response.data?.length || 0);
            setekurunList(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.log('[Ekurunler] Error:', error.message, error.response?.status, error.response?.data);
            setekurunList([]); // Loading'den çıkması için boş array set et
        }
    };

    const ekurunSEPETTEverial = async () => {
        try {
            const response = await axios.get(`${API_CONFIG.basketApi}/api/SepetView/ekurunlist/`, {
                params: {
                    sid: sid,
                    code: Code,

                }
            });
            setsepetEKList(response.data);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        ekurunverial();
        ekurunSEPETTEverial();
    }, []);

    // kategori butonlarına tıklandığında seçimi değiştirecek
    const handleCategoryPress = (category) => {
        setSelectedCategory(category);
    };

    const handleRemove = (iitem) => {
        // sepetten silme
        setsepetEKList(sepetEKList.filter(item => item.id !== iitem.id));
        handleUpdateQuantity(iitem, 0, '');
    };

    const handleUpdateQuantity = async (iitem, yeniAdet, imageUrl) => {
        setLoading(true);
        try {


            const cikartData = {
                ekurunId: iitem.id,
                parentProductId: sid,
                code: Code
            };

            axios.post(`${API_CONFIG.basketApi}/api/SepetView/ekurun-cikart`, cikartData)
                .then(response => {
                    console.log("Yanıt:", response.data);

                    // Insider SDK - Item Removed from Cart Event
                    InsiderEvents.itemRemovedFromCart(iitem.id);

                    ekurunSEPETTEverial();
                    onchange(response.data);
                })
                .catch(error => {
                    console.error("Hata:", error);
                });

        } catch (error) {
            console.error("Error while updating quantity:", error);
        } finally {
            setLoading(false);
        }
    };

    // Kişiye özel ürün kontrolü - NJ akışıyla aynı
    const handleEkleClick = async (iitem) => {
        // kisiyeOzel flag kontrolü
        if (iitem.kisiyeOzel === true || iitem.kisiyeOzel === 1) {
            try {
                // GetUrunAlanlar API'den kişiye özel alanları çek
                const response = await axios.get(`${API_CONFIG.basketApi}/api/Home/GetUrunAlanlar`, {
                    params: { prID: iitem.id, ccboz: 0 }
                });
                const alanlar = response.data || [];
                if (alanlar.length > 0) {
                    setKisiyeOzelItem(iitem);
                    setKisiyeOzelAlanlar(alanlar);
                    setKisiyeOzelNot(null);
                    setKisiyeOzelModalVisible(true);
                    return;
                }
            } catch (err) {
                console.log('[Ekurunler] KisiyeOzel alanlar alınamadı:', err.message);
            }
        }
        // Kişiye özel değilse veya alanlar boşsa direkt ekle
        handleUEkle(iitem, '');
    };

    // Kişiye özel form tamamlandığında
    const handleKisiyeOzelConfirm = () => {
        if (!kisiyeOzelItem || !kisiyeOzelNot) return;
        handleUEkle(kisiyeOzelItem, kisiyeOzelNot);
        setKisiyeOzelModalVisible(false);
        setKisiyeOzelItem(null);
        setKisiyeOzelAlanlar([]);
        setKisiyeOzelNot(null);
    };

    async function handleUEkle(iitem, yazi) {
        try {
            const dilStored = await AsyncStorage.getItem('dil');
            const kurStored = await AsyncStorage.getItem('kur');
            var model = {
                codesanal: Code,
                pid: iitem.id,
                cid: 0,
                sid: sid,
                adet: 1,
                ad: iitem.ad,
                url: iitem.url,
                kur: kurStored,
                parabirimi: kurStored || 'TL',
                lang: dilStored,
                yazi: yazi
            };

            const ekleData = {
                EkurunId: iitem.id,
                ParentProductId: sid,
                Code: Code,
                OzelNotlar: yazi || ''
            };

            axios.post(`${API_CONFIG.basketApi}/api/SepetView/ekurun-ekle`, ekleData)
                .then(response => {
                    console.log("Yanıt:", response.data);

                    // Insider SDK - Item Added to Cart Event
                    const productId = String(iitem.id);
                    const persistedProduct = insiderProductMap1[productId] || insiderProductMap1['P-' + productId];

                    if (persistedProduct) {
                        const insiderProduct = {
                            ...persistedProduct,
                            quantity: 1,
                            currency: persistedProduct.currency || 'TRY'
                        };
                        InsiderEvents.itemAddedToCart(insiderProduct);
                    } else {
                        // Fallback
                        const insiderProductFixed = {
                            id: iitem.id,
                            name: iitem.ad || '',
                            price: iitem.fiyat || 0,
                            unit_price: iitem.fiyat || 0,
                            quantity: 1,
                            taxonomy: ['Extra Product'],
                            image_url: iitem.imgurl || '',
                            url: iitem.url || '',
                            currency: 'TRY'
                        };
                        InsiderEvents.itemAddedToCart(insiderProductFixed);
                    }

                    ekurunSEPETTEverial();
                    onchange(response.data);
                })
                .catch(error => {
                    console.error("Hata:", error);
                });


        } catch (error) {
            console.log(error);
        }
    }

    // Filtrelenmiş ek ürünler (seçili kategoriye göre)
    const getFilteredEkurunList = () => {
        if (!ekurunList || !selectedCategory) return [];
        return ekurunList.filter(item => item.hm_ad === selectedCategory);
    };

    // Kategorileri render eden fonksiyon
    const renderCategoryButtons = () => {
        if (!ekurunList) return null;

        // Mevcut hm_ad değerlerinden benzersiz kategoriler
        const categories = [...new Set(ekurunList.map(item => item.hm_ad))];

        // Eğer henüz seçili kategori yoksa, varsayılan olarak ilk kategoriyi ata
        // (useEffect içinde de yapılabilir; burada da basitçe handle edebiliriz)
        if (!selectedCategory && categories.length > 0) {
            setSelectedCategory(categories[0]);
        }

        return (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryContainer}>
                {categories.map((cat, index) => {
                    const isSelected = cat === selectedCategory;
                    return (
                        <TouchableOpacity
                            key={index}
                            onPress={() => handleCategoryPress(cat)}
                            style={[
                                styles.categoryButton,
                                { backgroundColor: isSelected ? colors.primary : '#dddddd' },
                            ]}
                        >
                            <Text
                                style={[
                                    styles.categoryButtonText,
                                    { color: isSelected ? colors.white : colors.black }
                                ]}
                            >
                                {cat}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        );
    };

    // Ürünleri (satırlar halinde) render ediyoruz
    const renderEkUrunler = () => {
        const filteredList = getFilteredEkurunList();
        let rows = [];

        for (let i = 0; i < filteredList.length; i += 3) {
            const rowIndex = Math.floor(i / 3);

            rows.push(
                <View
                    key={i}
                    style={{
                        width: '100%',
                        flexDirection: 'row',
                        justifyContent: 'space-between'

                    }}
                >
                    <EkurunItem
                        key={`${filteredList[i].id}-${i}`}
                        item={filteredList[i]}
                        onUpdateQuantity={handleUpdateQuantity}
                        onEkle={handleEkleClick}
                        onRemove={handleRemove}
                        mosaicBgColor={getMosaicBgColor(rowIndex, 0)}
                    />
                    {filteredList[i + 1] && (
                        <EkurunItem
                            key={`${filteredList[i + 1].id}-${i + 1}`}
                            item={filteredList[i + 1]}
                            onUpdateQuantity={handleUpdateQuantity}
                            onEkle={handleEkleClick}
                            onRemove={handleRemove}
                            mosaicBgColor={getMosaicBgColor(rowIndex, 1)}
                        />
                    )}
                    {filteredList[i + 2] && (
                        <EkurunItem
                            key={`${filteredList[i + 2].id}-${i + 2}`}
                            item={filteredList[i + 2]}
                            onUpdateQuantity={handleUpdateQuantity}
                            onEkle={handleEkleClick}
                            onRemove={handleRemove}
                            mosaicBgColor={getMosaicBgColor(rowIndex, 2)}
                        />
                    )}
                </View>
            );
        }
        return rows;
    };

    return (
        <View style={{ marginTop: 10 }}>
            <Text
                style={{
                    fontSize: 14,
                    fontFamily: 'NunitoSans-Bold',
                    textAlign: 'center',
                    marginTop: 15,
                    marginBottom: 10,
                }}
            >
                {translate('EK ÜRÜNLER')}
            </Text>

            {/* Kategori Butonları */}
            {renderCategoryButtons()}

            {/* Seçilen kategoriye ait ürünler */}
            {ekurunList ? (
                renderEkUrunler()
            ) : (
                <View style={{ width: '100%', alignItems: 'center' }}>
                    <LottieView
                        source={require('../assets/animations/yukleme_ani.json')}
                        autoPlay
                        loop
                        style={stylesglobal.loading3}
                    />
                </View>
            )}

            {loading && (
                <Modal transparent={true} animationType="fade">
                    <View style={styles.loadingContainer}>
                        <LottieView
                            source={require('../assets/animations/yukleme_ani.json')}
                            autoPlay
                            loop
                            style={stylesglobal.loading}
                        />
                    </View>
                </Modal>
            )}

            {/* Kişiye Özel Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={kisiyeOzelModalVisible}
                onRequestClose={() => setKisiyeOzelModalVisible(false)}
            >
                <View style={styles.kisiyeOzelOverlay}>
                    <View style={styles.kisiyeOzelModal}>
                        <View style={styles.kisiyeOzelHeader}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                                {kisiyeOzelItem && (
                                    <FastImage
                                        style={{ width: 50, height: 50, borderRadius: 8, marginRight: 10 }}
                                        source={{ uri: kisiyeOzelItem.imgurl }}
                                        resizeMode={FastImage.resizeMode.contain}
                                    />
                                )}
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.kisiyeOzelTitle} numberOfLines={2}>
                                        {kisiyeOzelItem?.ad}
                                    </Text>
                                    <Text style={styles.kisiyeOzelPrice}>
                                        {formatPrice(kisiyeOzelItem?.fiyat)}
                                    </Text>
                                </View>
                            </View>
                            <TouchableOpacity
                                onPress={() => setKisiyeOzelModalVisible(false)}
                                style={styles.kisiyeOzelCloseBtn}
                            >
                                <Text style={{ fontSize: 22, color: '#999' }}>×</Text>
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.kisiyeOzelBody}>
                            <Text style={{ fontSize: 13, color: '#666', marginBottom: 10 }}>
                                {translate('Lütfen aşağıdaki alanları doldurunuz.')}
                            </Text>
                            {kisiyeOzelAlanlar.length > 0 && (
                                <KisiyeOzel
                                    fv={{}}
                                    ua={kisiyeOzelAlanlar}
                                    onSubmit={(notlar) => setKisiyeOzelNot(notlar)}
                                />
                            )}
                        </ScrollView>

                        <View style={styles.kisiyeOzelFooter}>
                            <TouchableOpacity
                                style={styles.kisiyeOzelCancelBtn}
                                onPress={() => setKisiyeOzelModalVisible(false)}
                            >
                                <Text style={{ fontSize: 14, color: '#333' }}>{translate('İptal')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.kisiyeOzelConfirmBtn,
                                    !kisiyeOzelNot && { opacity: 0.5 }
                                ]}
                                onPress={handleKisiyeOzelConfirm}
                                disabled={!kisiyeOzelNot}
                            >
                                <Text style={{ fontSize: 14, color: '#fff', fontWeight: '600' }}>
                                    {translate('Ekle')}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    productName: {
        fontFamily: 'NunitoSans-Bold',
        fontSize: 11,
        lineHeight: 17,
        padding: 4,
        marginTop: 5,
        textAlign: 'center',
        color: colors.black,
    },
    productPrice: {
        fontSize: 15,
        fontFamily: 'NunitoSans-Regular',
        color: colors.black,
        textAlign: 'center',
        marginTop: 10,
        marginBottom: 5,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
    },
    buttonContainer: {
        flex: .2,
        alignSelf: 'center',
        flexDirection: 'row',
        alignItems: 'center',
    },
    ekbutton: {
        flex: .8,
        alignSelf: 'baseline',
        marginTop: 10,
        marginBottom: 5,
        marginHorizontal: 1,
        padding: 6,
        borderRadius: 12,
        backgroundColor: colors.primary,
        color: 'white',
        textAlign: 'center',
    },
    ekbuttonText: {
        fontSize: 15,
        fontFamily: 'NunitoSans-Regular',
        color: 'white',
        textAlign: 'center',
    },
    adetText: {
        flex: .8,
        textAlign: 'center',
        fontFamily: 'NunitoSans-Regular',
        fontSize: 18,
        fontWeight: '600',
        color: colors.black,
    },
    // Kategori butonları için eklediğimiz stiller
    categoryContainer: {
        marginBottom: 10,
        paddingHorizontal: 5,
    },
    categoryButton: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
        marginRight: 8,
    },
    categoryButtonText: {
        fontSize: 14,
        fontFamily: 'NunitoSans-Bold',
    },
    // Kişiye Özel Modal styles
    kisiyeOzelOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    kisiyeOzelModal: {
        backgroundColor: '#fff',
        borderRadius: 16,
        width: '100%',
        maxHeight: '85%',
        overflow: 'hidden',
    },
    kisiyeOzelHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    kisiyeOzelTitle: {
        fontSize: 14,
        fontWeight: '600',
        fontFamily: 'NunitoSans-Bold',
        color: colors.black,
    },
    kisiyeOzelPrice: {
        fontSize: 13,
        color: '#666',
        fontFamily: 'NunitoSans-Regular',
        marginTop: 2,
    },
    kisiyeOzelCloseBtn: {
        width: 30,
        height: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
    kisiyeOzelBody: {
        padding: 16,
        paddingTop: 10,
    },
    kisiyeOzelFooter: {
        flexDirection: 'row',
        gap: 10,
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    kisiyeOzelCancelBtn: {
        flex: 1,
        padding: 12,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        alignItems: 'center',
    },
    kisiyeOzelConfirmBtn: {
        flex: 2,
        padding: 12,
        backgroundColor: colors.primary,
        borderRadius: 8,
        alignItems: 'center',
    },
});

export default Ekurunler;