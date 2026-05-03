import API_CONFIG from '../config/apiConfig';
import { tenantFetch } from '../config/tenantFetch';
import React, { useContext, useState, useEffect, useRef } from 'react';
import {
    Image, Keyboard,
    Switch, View, Text, Alert,
    TouchableOpacity, StyleSheet, Dimensions,
} from 'react-native';
import axios from 'axios';
import BottomSheet from '../components/IkostBottomSheet';

import AsyncStorage from '@react-native-async-storage/async-storage';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import IkostTextInput from '../components/IkostTextInput';
import IkostButton from "../components/IkostButton";
import Ekurunler from "../components/Ekurunler";
import KartNot from "../components/KartNot";
import TeslimBilgileriForm from "../components/TeslimBilgileriForm";
import { ikostalert } from '../GlobalAlert';
import IkostScalableImage from '../components/IkostScalableImage';
import { SepetContext } from '../components/SepetContext'; // İçe aktarma
import { Host, Portal } from 'react-native-portalize';
import { colors } from '../config/theme';
import { convertPriceString } from '../utils/priceFormatter';


const BasketItem = ({ item, childItems, gurupla, sepetAdim, KartNotUpdate, code,
    onRemove, onUpdateQuantity, onEkurunUpt, onUpdateAdres, onFormChange, isInvalid, username, memberID, index }) => {
    const Url = `${API_CONFIG.basketApi}/api/SepetView/`;
    const [sheetVisible, setSheetVisible] = useState(false);
    const ekranYuksekligiFloat = Dimensions.get('window').height;
    const ekranYuksekligiInt = Math.floor(ekranYuksekligiFloat); // Aşağı yuvarlar
    const [modalVisible, setModalVisible] = useState(false);
    const [adreskaydet, setadreskaydet] = useState(false);
    const [adresbaslik, setadresbaslik] = useState('mobil adres');
    const [isim, setISIM] = useState(item.teslimad);
    const [telefon, setTelefon] = useState(item.teslimtelefon);
    const [adres, setAdres] = useState(item.teslimadres);


    const [burdaadet, setburdaadet] = useState(item.adet);
    const [isKayit, setisKayit] = useState(false);
    const [isvalidhere, setisisvalidhere] = useState(false);
    const swipeableRef = useRef(null);
    const { fetchTranslations, translate, activeCurrency, language } = useContext(SepetContext);
    const dateLocale = language === 'EN' ? 'en-US' : 'tr-TR';

    const toggleSwitch = () => setisKayit(previousState => !previousState);

    useEffect(() => {
        if (KartNotUpdate) {
            KartNotUpdate(item.id, item.teslimkartnot, item.teslimkartad);
        }

        if (index == 1) {
            setTimeout(() => {
                swipeableRef.current && swipeableRef.current.openRight();
            }, 200);
            setTimeout(() => {
                swipeableRef.current && swipeableRef.current.close();
            }, 500);
        }

        // BottomSheet otomatik açma kaldırıldı - artık inline form kullanılıyor

    }, []);

    useEffect(() => {
        console.log('adres');

    }, [adres]);
    const handleKartNotUpdate = (updatedKartDetails) => {
        KartNotUpdate(item.id, updatedKartDetails.kartNot, updatedKartDetails.kartAd);
    };

    const phoneRegex = /^0\(\d{3}\) \d{3} \d{2} \d{2}$/; // Telefon numarası formatı: 0(999) 999 99 99



    const adresEkleTeslim = async () => {

        if (!adres || !isim || !telefon) {
            ikostalert('Uyarı', 'Lütfen tüm alanları doldurunuz.');
            return;
        }
        if (!phoneRegex.test(telefon)) {
            ikostalert('Uyarı', 'Lütfen telefon numarasını 0(555) 555 55 55 şeklinde eksiksiz giriniz');
            return;
        }
        try {


            const memberID = await AsyncStorage.getItem('memberID');
            const username = await AsyncStorage.getItem('username');
            let parentID = -1;
            if (childItems) parentID = item.id;

            let model = {
                Code: code,
                sid: item.id,
                TeslimAdres: adres,
                TeslimAd: isim,
                TeslimTelefon: telefon,
                parentID: parentID,
                Username: username,
                isKayit: isKayit
            }

            console.log(model);
            const response2 = await axios.post(`${API_CONFIG.basketApi}/api/SepetView/sepetupdate/`, model);
            setisisvalidhere(true);
            setSheetVisible(false);
            onUpdateAdres();
            return response2.data;
        } catch (error) {
            console.error('Hata oluştu:', error);
            throw error;
        }
    };

    const sepetadet = async (id, islem) => {
        let yeniAdet = burdaadet;
        if (islem === 'arti') yeniAdet = burdaadet + 1;
        if (islem === 'eksi') yeniAdet = burdaadet - 1;
        if (yeniAdet <= 0) yeniAdet = 1;

        setburdaadet(yeniAdet);  // State'i güncelle

        const code = await AsyncStorage.getItem('@code');
        const url = `${Url}sepetadet/${id}_${yeniAdet}_${code}`;
        try {
            const response = await tenantFetch(url);
            const result = await response.text();
            onUpdateQuantity();
        } catch (error) {
            console.error('Hata:', error);
        }
    };

    const ekurunupadte = (tot) => {
        onEkurunUpt(tot)
    }



    const renderRightActions = (progress, dragX) => {
        if (sepetAdim == 0) {
            return (
                <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => onRemove(item.id)}
                >
                    <Text style={{ color: 'white', fontWeight: '700', fontSize: 18 }}>{translate('Sil')}</Text>
                </TouchableOpacity>
            );
        }
    };
    function formattedgun(gun) {
        const tarih = new Date(gun); // item.teslimtarih'i bir Date objesine dönüştürüyoruz
        if (isNaN(tarih)) {
            return "Invalid Date"; // Eğer tarih geçersizse bir hata mesajı döndürüyoruz
        }
        const fd = new Intl.DateTimeFormat(dateLocale, {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).format(tarih);

        return fd;
    }
    return (<>

        <Swipeable
            ref={swipeableRef}

            renderRightActions={renderRightActions}>
            <View style={[
                sepetAdim > 0 ? styles.itemContainerGroup : styles.itemContainer,
                isInvalid && !isvalidhere && styles.redBorder // Eğer öğe geçersizse kırmızı çerçeve ekle
            ]}>
                {/* Eski Teslimat Adresini Tamamla butonu kaldırıldı - artık inline form gösteriliyor */}
                {sepetAdim > 0 && <>
                    <View style={[styles.itemContainergGR]}>
                        <IkostScalableImage source={{ uri: item.imgurl }} width={40}
                            style={{ alignSelf: 'flex-start', marginRight: 4, }} />

                        {childItems && childItems.length > 0 && childItems.map((child, index) => (
                            <IkostScalableImage source={{ uri: child.imgurl }} width={40}
                                style={{ alignSelf: 'flex-start', marginRight: 4, }} />
                        ))}
                    </View>
                </>}

                {!sepetAdim == 1 && <>
                    <View style={{ justifyContent: 'flex-start' }}>
                        <IkostScalableImage source={{ uri: item.imgurl }} width={70} style={{ alignSelf: 'flex-start' }} />

                    </View>
                </>
                }
                <View style={styles.infoContainer}>
                    <View style={styles.textContainer}>
                        {!sepetAdim == 1 && <><Text style={styles.name}>{item.ad}{item.cesitad}</Text>
                            <Text style={styles.price}>{convertPriceString(item.fiyatstring, null, activeCurrency)}</Text>
                        </>}

                        {/* Tarih gösterimi kaldırıldı */}

                        {/* Delivery formatted date display */}
                        {(() => {
                            if (!item.teslimtarih) return null;
                            try {
                                const date = new Date(item.teslimtarih);
                                if (isNaN(date.getTime())) return null;

                                const formattedDate = new Intl.DateTimeFormat(dateLocale, {
                                    day: '2-digit',
                                    month: 'long',
                                    weekday: 'long'
                                }).format(date);

                                let timeRange = '';
                                if (item.teslimsaat) {
                                    timeRange = item.teslimsaat.split('#')[0];
                                }

                                return (
                                    <Text style={[styles.text, { color: colors.textDark, marginBottom: 2 }]}>
                                        {formattedDate}{timeRange ? `, ${timeRange}` : ''}
                                    </Text>
                                );
                            } catch (e) {
                                return null;
                            }
                        })()}

                        {(!item.teslimadres || sepetAdim == 0) && <Text style={styles.text}>{item.teslimmahalle}  </Text>}


                        {/* Ek ürün detayları sadece sepetAdim=0'da gösterilir */}
                        {sepetAdim == 0 && item.ekurunler && item.ekurunler.map((ekurun, idx) => (<View key={`ekurun-${idx}`} style={styles.itemContainerEKURUN} >
                            <View style={{ flex: 1, paddingHorizontal: 0 }}>
                                <Text style={styles.textekurun}>{ekurun.adet} x {ekurun.ad}</Text>
                                <Text style={styles.priceekurun}>{convertPriceString(ekurun.fiyatstring, null, activeCurrency)}</Text>

                            </View>
                            <View style={{ justifyContent: 'flex-start' }}>
                                <IkostScalableImage source={{ uri: ekurun.url }} width={30} style={{ alignSelf: 'flex-end' }} />
                            </View>
                        </View>
                        ))}


                    </View>


                </View>

            </View>
            {/* Eski teslimat adresi gösterimi kaldırıldı - artık inline form kullanılıyor */}

            {/* {isInvalid && !isvalidhere && sepetAdim == 1 && <View style={styles.hata}>
                <Text style={{ color: 'white', textAlign: 'center' }}>{translate('Lütfen teslimat adresini tamamlayın!')}</Text></View>} */}

            {/* sepetAdim=1 için inline Teslimat Bilgileri Formu */}
            {sepetAdim == 1 && (
                <TeslimBilgileriForm
                    item={item}
                    code={code}
                    childItems={childItems}
                    username={username}
                    onFormChange={(formData) => {
                        // Form değişikliklerini parent'a (Sepet.js) ilet
                        if (onFormChange) {
                            onFormChange(formData);
                        }
                    }}
                />
            )}

            {sepetAdim == 2 && <View style={{ flex: 1 }}>
                <Ekurunler Code={code} sid={item.id} onchange={ekurunupadte} />
            </View>}

            {sepetAdim == 3 && <View>
                <KartNot code={code} sid={item.id} item={item} onKartNotUpdate={handleKartNotUpdate} />
            </View>}
        </Swipeable>

        <Portal hostName="rootPortal">

            <BottomSheet visible={sheetVisible}
                onClose={() => setSheetVisible(false)}
                height={ekranYuksekligiInt * .75}
                onKeyboardViewHeight={ekranYuksekligiInt * .90} // Klavye açılınca yükseklik
                sheetBackgroundColor={colors.white}
                backgroundColor="rgba(0,0,0,0.6)"
                hasDraggableIcon
            >

                <View style={{ flex: 1, justifyContent: 'flex-end' }}>

                    <View style={{
                        flex: 1, paddingHorizontal: 0, paddingVertical: 10,
                        borderTopLeftRadius: 0, borderTopRightRadius: 0
                    }}>

                        <View style={{
                            flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 0,
                            marginTop: 0
                        }}>
                            <Text style={{ flex: 1, fontSize: 14, color: 'black', textAlign: 'center', fontFamily: 'NunitoSans-Bold' }}>{translate('Teslimat Adresi')}</Text>
                            <TouchableOpacity
                                style={{ alignSelf: 'flex-end', width: 30, height: 30, position: 'absolute', right: 18 }}
                                onPress={() => setSheetVisible(false)}>
                                <IkostScalableImage source={require('../assets/images/kapat.png')} width={30} />
                            </TouchableOpacity>
                        </View>
                        <View style={{
                            paddingHorizontal: 20, paddingVertical: 0,
                            borderTopLeftRadius: 0, borderTopRightRadius: 0
                        }}>

                            <IkostTextInput
                                value={isim}
                                title="Alıcı Adı Soyadı"
                                placeholder="Alıcı Adı Soyadı"
                                onChangeText={(isim) => setISIM(isim)} />

                            <IkostTextInput
                                keyboardType='phone-pad'
                                title="Alıcı Telefon Numarası"
                                placeholder="Alıcı Telefon Numarası"
                                mask={[
                                    '0', '(', /\d/, /\d/, /\d/, ')', ' ',
                                    /\d/, /\d/, /\d/, ' ',
                                    /\d/, /\d/, ' ',
                                    /\d/, /\d/
                                ]}
                                value={telefon}
                                onChangeText={(text, rawText) => setTelefon(text)}
                            />

                            <IkostTextInput
                                title="Alıcı Adresi"
                                placeholder="Alıcı Adresi"
                                value={adres}
                                multiline
                                alttext={item.teslimmahalle}
                                numberOfLines={1}
                                onChangeText={(adres) => setAdres(adres)} />
                            {item.teslimmahalle && <Text style={{ marginBottom: 15, fontWeight: '500', color: 'black', marginBottom: 25 }}>{item.teslimmahalle}</Text>}

                            {username && <View style={styles.swcontainer}>
                                <Text style={[styles.swtext, isKayit && { fontWeight: "bold" }]}>
                                    {translate('Kayıtlı teslimat adreslerime ekle')}</Text>
                                <Switch
                                    trackColor={{ false: "gray", true: "#e37c33" }}
                                    thumbColor={"#f4f3f4"}
                                    onValueChange={toggleSwitch}
                                    value={isKayit}
                                /></View>}

                            <IkostButton title="Onayla" onPress={adresEkleTeslim} />

                        </View>

                    </View>

                </View>

            </BottomSheet>
        </Portal>

    </>
    );
};

const styles = StyleSheet.create({
    teslimatadres: {
        backgroundColor: colors.white, padding: 0, flex: 1, paddingRight: 15,
        paddingBottom: 15,
        borderBottomEndRadius: 6, borderBottomStartRadius: 6, borderWidth: 1, borderColor: '#e6e6e6',
        borderTopWidth: 0, flexDirection: 'row',
    },
    itemContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        borderRadius: 6, borderBottomRightRadius: 0, borderBottomLeftRadius: 0,
        paddingVertical: 12,

        paddingHorizontal: 12,
        backgroundColor: 'white',
        overflow: 'hidden', position: 'relative'
    },
    itemContainergGR: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        paddingVertical: 0,
        paddingHorizontal: 10,
        paddingTop: 5,
        backgroundColor: colors.white,
        borderRadius: 6,
        overflow: 'hidden', marginBottom: 0, position: 'relative'
    },
    itemContainerGroup: {
        flexDirection: 'column',
        justifyContent: 'flex-start',
        borderRadius: 6, borderBottomRightRadius: 0, borderBottomLeftRadius: 0,
        paddingVertical: 10,
        paddingHorizontal: 0,
        paddingRight: 10,
        paddingBottom: 0,
        paddingTop: 0,
        backgroundColor: 'white',
        overflow: 'hidden'
    },
    itemContainerEKURUN: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        borderTopWidth: 1, borderColor: '#e6e6e6',
        paddingTop: 10,
        marginTop: 10
    },
    redBorder: {
        borderColor: colors.error, // Kırmızı çerçeve
        borderWidth: 1,
        borderRadius: 6, borderBottomStartRadius: 0, borderBottomEndRadius: 0,
        overflow: 'hidden'
    },
    emptyBasketContainer: {
        flex: 1,
        padding: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 50,
    },
    emptyBasketImage: {
        width: 125,
        height: 125,
    },
    emptyBasketText: {
        fontSize: 16,
        fontWeight: '600',
        color: 'black',
        marginTop: 10,
        marginBottom: 10
    },
    image: {

        width: 100,
    },
    infoContainer: {
        flex: 1,
        flexDirection: 'row',
    },
    name: {
        fontSize: 14,
        fontFamily: 'NunitoSans-Bold',
        marginBottom: 10, color: 'black'
    },
    text: {
        fontSize: 12,
        fontFamily: 'NunitoSans-Regular',
        fontWeight: 'normal', lineHeight: 18, color: 'black'
    },
    text2: {
        fontSize: 12,
        fontFamily: 'NunitoSans-Regular',
        fontWeight: '400', lineHeight: 18, color: '#e37c33'
    },
    price: {
        fontSize: 14,
        fontFamily: 'NunitoSans-Bold',
        marginBottom: 10, color: 'black'
    },
    textekurun: {
        fontSize: 12,
        fontFamily: 'NunitoSans-Regular',
        fontWeight: 'normal', lineHeight: 18, color: 'black'
    },
    priceekurun: {
        fontSize: 13,
        fontFamily: 'NunitoSans-Bold',
        marginTop: 5, color: 'black'
    },
    textContainer: {
        flex: 1,
        paddingLeft: 15,
        paddingRight: 10,
    },
    buttonContainer: {
        flex: .25,
        alignSelf: 'center',
        flexDirection: 'row',
        alignItems: 'center',

    },
    buttonText: {
        fontSize: 17,
        marginHorizontal: 1,
        padding: 5,
        borderWidth: .41,
        borderColor: colors.black,
        textAlign: 'center',
        minWidth: 30,
    },
    quantity: {
        fontSize: 16,
        marginHorizontal: 6, color: 'black'
    },
    deleteButton: {
        backgroundColor: colors.error,
        justifyContent: 'center',
        alignItems: 'center',
        width: 100,
        height: '100%',
        borderRadius: 6,
        top: 0,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalBackground: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.3)', // Arka planı yarı saydam yapar
    },
    modalContent: {
        width: '90%',
        padding: 25,
        paddingTop: 35,
        backgroundColor: 'white',
        borderRadius: 10,
        alignItems: 'center',
    },

    button: {
        backgroundColor: '#e37c33',
        padding: 10,
        paddingVertical: 7,
        borderRadius: 5,
        marginTop: 10,
        right: 10,
        width: 150,
        alignItems: 'center', alignSelf: 'flex-end',
        position: 'absolute', zIndex: 12
    },
    buttonRED: {
        backgroundColor: colors.error,

    },
    buttonText: {
        color: 'white',
        fontSize: 16,
    },
    closeButton: {
        marginTop: 10,
        padding: 10,
        alignItems: 'center',
    },
    closeButtonText: {
        fontFamily: 'NunitoSans-Regular',
        color: '#2196F3',
        fontSize: 16,
    },
    hata: {
        backgroundColor: colors.error, padding: 4, flex: 1, paddingHorizontal: 10,
        borderBottomEndRadius: 6, borderBottomStartRadius: 6

    },
    swcontainer: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingBottom: 20,
    },
    swtext: {
        fontFamily: 'NunitoSans-Regular',
        fontSize: 16,
        marginRight: 10, color: 'black'
    },
});
export default BasketItem;
