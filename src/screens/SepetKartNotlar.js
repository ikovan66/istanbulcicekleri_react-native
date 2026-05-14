import API_CONFIG from '../config/apiConfig';
import { tenantFetch } from '../config/tenantFetch';
import React, { useContext, useState, useEffect, useRef } from 'react';
import {
    ActivityIndicator,
    TextInput, View, Button, ScrollView, Text, Alert,
    Image, TouchableOpacity, StyleSheet, Dimensions, Animated
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import stylesglobal from '../stylesglobal';
import AnaFooter from '../components/AnaFooter';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import BottomSheet from "react-native-gesture-bottom-sheet";
import IkostTextInput from '../components/IkostTextInput';
import BasketItem from '../components/BasketItem';
import IkostButton from "../components/IkostButton";
import Svg, { G, Circle, Path } from 'react-native-svg';
import { SepetContext } from '../components/SepetContext'; // İçe aktarma

import HeaderleftComp from '../components/HeaderleftComp';
import LottieView from 'lottie-react-native';
import { ikostalert } from '../GlobalAlert';
import { colors } from '../config/theme';
import UserCoupons from '../components/UserCoupons';




const KapatSVG = () => (
    <Svg width="8" height="8" viewBox="0 0 20 20">
        <G clipPath="url(#clip-path)">
            <Path d="M9.555,8.231a1.36,1.36,0,0,1,.134-.193Q13.532,4.19,17.376.344A.953.953,0,0,1,18.331.03a.924.924,0,0,1,.505,1.476,2.328,2.328,0,0,1-.191.2q-3.818,3.82-7.637,7.639c-.052.052-.112.1-.238.2A1.166,1.166,0,0,1,11,9.684q3.848,3.843,7.692,7.689a.962.962,0,0,1,.322.953.925.925,0,0,1-1.5.5c-.062-.051-.117-.11-.174-.167L9.711,11.028c-.057-.057-.105-.122-.172-.2-.072.068-.124.117-.175.167q-3.852,3.852-7.7,7.706a.952.952,0,0,1-.955.311.924.924,0,0,1-.512-1.462,2.124,2.124,0,0,1,.189-.2q3.825-3.827,7.651-7.652a1.621,1.621,0,0,1,.19-.14c-.084-.089-.133-.143-.184-.194L.378,1.693a1.875,1.875,0,0,1-.21-.235A.926.926,0,0,1,1.47.176,2.048,2.048,0,0,1,1.7.388L9.355,8.039c.051.051.105.1.2.192" fill={colors.white} />
        </G>
    </Svg>
);
const Url = `${API_CONFIG.frontendApi}/api/`;



const SepetKartNotlar = ({ navigation }) => {

    const [sepetList, setsepetList] = useState(null);
    const [kartDetailsList, setKartDetailsList] = useState([]); // Kart detayları için liste
    const [kargofiyatstring, setkargofiyatstring] = useState(null);
    const [sepetAdet, setsepetAdet] = useState(0);
    const { translate, sepetSayisi, setSepetSayisi, sepetTutari, setSepetTutari } = useContext(SepetContext);
    const [sepetData, setsepetData] = useState([]);

    const [toplam, settoplam] = useState('');
    const [indirim, setindirim] = useState(null);
    const [secilenMahItem, setsecilenMahItem] = useState(null);
    const [discountCode, setDiscountCode] = useState('');
    const [Code, setCode] = useState(null);
    const bottomSheet = useRef();
    const ekranYuksekligiFloat = Dimensions.get('window').height * .80;
    const ekranYuksekligiInt = Math.floor(ekranYuksekligiFloat); // Aşağı yuvarlar
    const [isLoading, setIsLoading] = useState(true);
    const [username, setusername] = useState(null);
    const [memberID, setumemberID] = useState(null);
    const [kargoindirimlimit, setkargoindirimlimit] = useState(null);
    const [invalidItems, setInvalidItems] = useState([]);


    // Kart notu ve adı güncellendiğinde listeye ekle
    const handleKartNotUpdate = (id, kartNot, kartAd) => {

        setKartDetailsList(prevState => {
            const existingItemIndex = prevState.findIndex(item => item.id === id);
            const updatedList = [...prevState];

            if (existingItemIndex !== -1) {
                updatedList[existingItemIndex] = { id, kartNot, kartAd };
            } else {
                updatedList.push({ id, kartNot, kartAd });
            }
            return updatedList;
        });
    };
    const applyDiscount = () => {
        // case when @toplam<min then 'min' when @toplam>maks then 'maks' when GETDATE()>sontarih then 'sontarih' else 'tamam' end as durum
        var url = `${Url}sepetindirim/` + Code + `_` + discountCode + `/`;
        axios.get(url)
            .then(async response => {
                if (response.data != "tamam") {
                    ikostalert("HATA", response.data, [{ text: 'TAMAM' }]);
                }
                if (response.data == "tamam") {
                    await SepeteUpdateKargo();
                    verial();
                    bottomSheet.current.close();
                }
            })
            .catch(error => console.log(error));

    };

    const SepeteUpdateKargo = async () => {
        if (secilenMahItem && Code) {
            const apiUrl = `${Url}SepeteUpdateKargo/`;
            const requestData = {
                Code: Code,
                TeslimMahalle: secilenMahItem.description,
                Mahalle: secilenMahItem.mahalle,
                Sehir: secilenMahItem.sehir,
                Semt: secilenMahItem.semt
            };

            try {
                const response = await axios.post(apiUrl, requestData);

            } catch (error) {
                ikostalert('Hata', `Sepet ggüncellenirken bir hata oluştu: ${error.message}`);
            }
        }
    };

    useEffect(() => {
        verial();
    }, []);

    useEffect(() => {
        // SepeteUpdateKargo();
        verial();
    }, [secilenMahItem]);

    const verial = async () => {
        setIsLoading(true);

        var username = await AsyncStorage.getItem('username');
        var memberID = await AsyncStorage.getItem('memberID');
        setusername(username);
        setumemberID(memberID);

        const code = await AsyncStorage.getItem('@code');
        if (code != null) {
            setCode(code);
            const dilStored = await AsyncStorage.getItem('dil');
            const kurStored = await AsyncStorage.getItem('kur');

            axios.get(`${Url}sepetizle/${code}_${dilStored}_${kurStored}/`)
                .then(response => {
                    setsepetAdet(response.data.sepetlist);
                    setsepetList(response.data.sepetlist);
                    settoplam(response.data.uruntoplam);
                    setSepetTutari(response.data.uruntoplam);
                    setkargofiyatstring(response.data.kargofiyatstring);
                    setindirim(response.data.indirim);
                    setsepetData(response.data);
                    setIsLoading(false);


                })
                .catch(error => {
                    console.log(error);
                    setIsLoading(false);
                });

        } else {
            setIsLoading(false);

        }

    };


    const sepetadet = async () => {
        if (sepetList != null) {
            const totalQuantity = sepetList.reduce((total, item) => {
                return total + item.adet;
            }, 0);
            await AsyncStorage.setItem('@sepetadet5', totalQuantity.toString());
            setSepetSayisi(totalQuantity.toString());

        }
    }

    useEffect(() => {

        sepetadet();

    }, [sepetList]);



    const deleteCartItem = async (id) => {
        const url = `${Url}sepetitemsil/${id}`;
        try {
            const response = await tenantFetch(url);
            const result = await response.text();
            //await SepeteUpdateKargo();
            verial();
            return result.replace(/\"/g, ''); // Çift tırnakları kaldır
        } catch (error) {
            console.error('Hata:', error);
        }
    };
    const indirimsil = async () => {
        const url = `${Url}indirimsil/${Code}`;
        try {
            const response = await tenantFetch(url);
            const result = await response.text();
            //await SepeteUpdateKargo();
            verial();
            return result.replace(/\"/g, '');
        } catch (error) {
            console.error('Hata:', error);
        }
    };
    const handleRemove = (id) => {
        setsepetList(sepetList.filter(item => item.id !== id));
        deleteCartItem(id);

    };

    const sendUpateDataToAPI = async (sid, kartNot, kartAd) => {
        const apiUrl = `${Url}KartNotUpdate/`;
        const requestData = {
            codesanal: Code,
            sid: sid,
            teslimkartnot: kartNot,
            teslimkartad: kartAd
        };

        try {
            const response = await axios.post(apiUrl, requestData);
            verial();
        } catch (error) {
            ikostalert('Hata', `Kart notunuz kaydedilirken bir hata oluştu: ${error.message}`);
        }
    };
    const handleUpdateAdres = () => {
        verial();
    };

    const goBack = () => {
        navigation.goBack();

    }

    const sonrakiadim = async () => {
        let isimsizvar = false;
        for (const { id, kartNot, kartAd } of kartDetailsList) {
            if (kartAd == "") {
                isimsizvar = true;
            }
        }

        if (!isimsizvar) {
            for (const { id, kartNot, kartAd } of kartDetailsList) {
                await sendUpateDataToAPI(id, kartNot, kartAd.replace('isimsiz', ''));
            }
            const memberID = await AsyncStorage.getItem('memberID');
            if (memberID !== null) {
                navigation.navigate('SepetFaturaNav', { toplam });
            } else {
                navigation.navigate('GirisNav', { returnScreen: 'SepetFaturaNav' });
            }
        } else {
            ikostalert(translate("Gönderen Adı"), translate("Lütfen isimsiz gönderimi onaylayın veya gönderen adını yazınız."));

        }



    };

    const handleUpdateQuantity = async () => {
        //await SepeteUpdateKargo();
        verial();
    };
    const handleonEkurunUpt = async (toplamsepettutar) => {
        settoplam(toplamsepettutar);
        setSepetTutari(toplamsepettutar);
    };
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaView style={stylesglobal.SafeAreaCSS}>

                <View style={stylesglobal.headerCustom}>
                    <HeaderleftComp title="Mesaj Kartı" />
                </View>

                <View style={stylesglobal.container}>

                    <ScrollView style={{ flex: 1 }}>

                        {sepetList && sepetList.length > 0 ? (
                            sepetList.map((item, index) => (
                                <View key={item.id + '-' + index}
                                    style={stylesglobal.basketlistcontainer}
                                >

                                    <BasketItem
                                        item={item}
                                        code={Code}
                                        username={username}
                                        memberID={memberID}
                                        sepetstep={3}
                                        isInvalid={invalidItems.includes(item.id)} // Kırmızı çerçeve kontrolü
                                        onUpdateQuantity={handleUpdateQuantity}
                                        onEkurunUpt={handleonEkurunUpt}
                                        onRemove={handleRemove}
                                        onUpdateAdres={handleUpdateAdres}
                                        KartNotUpdate={handleKartNotUpdate}

                                    />
                                </View>
                            ))


                        ) : (<>

                            {
                                !isLoading ?
                                    <View style={styles.emptyBasketContainer}>
                                        <Image source={require('../assets/images/sepetbos.png')} style={styles.emptyBasketImage} />
                                        <Text style={styles.emptyBasketText}>Sepetiniz şu an boş görünüyor.</Text>
                                        <Text style={{ marginBottom: 20, marginTop: 20 }}>Beğendiğiniz ürünü sepetinize ekleyerek siparişinizi kolayca tamamlayabilirsiniz.</Text>
                                        <IkostButton title="Alışverişe Devam Et" onPress={() => navigation.navigate("AnaNav")} />
                                    </View> :
                                    <SafeAreaView style={stylesglobal.SafeAreaCSS}>
                                        <View style={stylesglobal.loaderview}><LottieView source={require('../assets/animations/yukleme_ani.json')}
                                            autoPlay loop style={stylesglobal.loading} /></View></SafeAreaView>}

                        </>)}
                        {kargofiyatstring && kargofiyatstring != "0,00 TL" &&
                            <View style={styles.itemContainer}>
                                <View>
                                    <View style={{ flexDirection: 'row', marginBottom: 5 }}>
                                        <Text>{translate('Gönderim Fiyatı')}: </Text><Text style={styles.price}>{kargofiyatstring}</Text>

                                    </View>
                                    {kargoindirimlimit && <Text style={{ fontSize: 12 }}>{kargoindirimlimit}₺ {translate('ve Üzeri Ücretsiz Teslimat')}</Text>}
                                </View>

                            </View>
                        }

                    </ScrollView>
                    {sepetList && sepetList.length > 0 &&
                        <View style={stylesglobal.footersepet}>
                            <View style={{ flex: 1.3, justifyContent: 'left', alignItems: 'baseline' }}>
                                {!indirim && 5 == 6 && <View style={{ flex: 1, justifyContent: 'left', flexDirection: 'row' }}>
                                    <TouchableOpacity
                                        style={{
                                            backgroundColor: '#F5A623', padding: 0, justifyContent: 'center',
                                            alignItems: 'center', borderRadius: 5, width: 150, marginBottom: 5
                                        }}
                                        onPress={() => bottomSheet.current.show()}>
                                        <View  >
                                            <Text style={{ color: 'white' }}>indirim kodum var</Text>
                                        </View>
                                    </TouchableOpacity>
                                </View>}
                                {!indirim && <View style={{ flex: 1, justifyContent: 'left', flexDirection: 'row', marginBottom: 5 }}>
                                    <TouchableOpacity
                                        style={{
                                            backgroundColor: '#e7cdb2', padding: 0, justifyContent: 'center',
                                            alignItems: 'center', borderRadius: 5, width: 150, marginBottom: 5
                                        }}
                                        onPress={() => bottomSheet.current.show()}>
                                        <View  >
                                            <Text style={{ color: 'black', fontFamily: 'NunitoSans-Regular', }}>{translate('indirim kodu girin')}</Text>
                                        </View>
                                    </TouchableOpacity>
                                </View>}
                                {!indirim && <UserCoupons
                                    indirim={indirim}
                                    onApply={async (couponCode) => {
                                        setDiscountCode(couponCode);
                                        var url = `${Url}sepetindirim/` + Code + `_` + couponCode + `/`;
                                        const response = await axios.get(url);
                                        if (response.data == "tamam") {
                                            await SepeteUpdateKargo();
                                            verial();
                                        } else {
                                            ikostalert("HATA", response.data, [{ text: 'TAMAM' }]);
                                        }
                                    }}
                                />}
                                {indirim && <View style={{ flex: 1, justifyContent: 'left', flexDirection: 'row', alignContent: 'center', alignItems: 'center' }}>
                                    <Text style={{ fontSize: 11, fontWeight: 'bold', marginBottom: 5, fontFamily: 'NunitoSans-Regular', color: colors.textSecondary }}>İndirim: </Text>
                                    <Text style={{ fontSize: 16, marginBottom: 5, fontFamily: 'NunitoSans-Regular', }}>-{indirim.replace('.', ',')}</Text>

                                </View>}

                                <View style={{ flex: 1, justifyContent: 'left', flexDirection: 'row', alignSelf: 'baseline', alignItems: 'center', }}>
                                    <Text style={{ fontSize: 11, fontWeight: 'bold', marginBottom: 5, fontFamily: 'NunitoSans-Regular', color: colors.textSecondary }}>{translate('TOPLAM')}: </Text>
                                    <Text style={{ fontSize: 20, fontFamily: 'NunitoSans-Regular', color: colors.black, }}>{toplam.replace('.', ',')}</Text>
                                </View>
                            </View>
                            <TouchableOpacity style={{ flex: 1 }} onPress={() => sonrakiadim()}>
                                <View style={stylesglobal.butonsepet}>
                                    <Text style={stylesglobal.butonsepetTEXT}>{translate('Devam')}</Text>
                                </View>
                            </TouchableOpacity>
                        </View>}
                    {/* <View style={stylesglobal.footer}>
                        <AnaFooter parametre={'Sepet'} navigation={navigation} />
                    </View> */}
                </View>

                <BottomSheet sheetBackgroundColor="white"
                    hasDraggableIcon KeyboardAvoidingView
                    ref={bottomSheet}
                    height={ekranYuksekligiInt}

                >
                    <View style={{
                        flex: 1, justifyContent: 'flex-end',
                        backgroundColor: 'rgba(0, 0, 0, 0.5)'
                    }}>

                        <View style={{
                            flex: 1, paddingHorizontal: 20, paddingVertical: 20, backgroundColor: 'white',
                            borderTopLeftRadius: 0, borderTopRightRadius: 0
                        }}>

                            <IkostTextInput
                                placeholder="İndirim Kodu"
                                autoCapitalize="none"
                                title="İndirim Kodu"
                                autoFocus={true}
                                onChangeText={setDiscountCode}
                            />
                            <IkostButton title="Uygula" onPress={applyDiscount} />


                        </View>
                    </View>

                </BottomSheet>
                {!(sepetList && sepetList.length > 0) && !isLoading && (
                    <View style={stylesglobal.footer}>
                        <AnaFooter parametre={'Sepetim'} navigation={navigation} />
                    </View>)}
            </SafeAreaView>
        </GestureHandlerRootView>
    );
};

const styles = StyleSheet.create({
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
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: .5,
        borderBottomColor: colors.border,
        paddingVertical: 10,
        paddingHorizontal: 10,
        backgroundColor: 'white'
    },
    image: {
        flex: .2,
        height: 80,
    },
    infoContainer: {
        flex: .75,
        flexDirection: 'row',
    },
    name: {
        fontSize: 13,
        fontWeight: 'normal',
        marginBottom: 5, color: colors.black,
    },
    price: {
        fontSize: 14,
        color: '#F5A623',
    },
    textContainer: {
        flex: 1,
        paddingLeft: 10,
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
        marginHorizontal: 6, color: colors.black,
    },
    deleteButton: {
        backgroundColor: '#F5A623',
        justifyContent: 'center',
        alignItems: 'center',
        width: 100,
        height: '100%',

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
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 10,
        alignItems: 'center',
    },

    button: {
        backgroundColor: '#2196F3',
        padding: 10,
        borderRadius: 5,
        marginTop: 10,
        width: '100%',
        alignItems: 'center',
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
        color: '#2196F3',
        fontSize: 16,
    },
});

export default SepetKartNotlar;