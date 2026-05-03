import API_CONFIG from '../config/apiConfig';
import React, { useContext, useState, useEffect, useRef } from 'react';
import {
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
import BasketItem from '../components/BasketItem';
import IkostButton from "../components/IkostButton";
import Svg, { G, Circle, Path } from 'react-native-svg';
import { SepetContext } from '../components/SepetContext'; // İçe aktarma
import LottieView from 'lottie-react-native';

import HeaderleftComp from '../components/HeaderleftComp';
import { colors } from '../config/theme';



const KapatSVG = () => (
    <Svg width="8" height="8" viewBox="0 0 20 20">
        <G clipPath="url(#clip-path)">
            <Path d="M9.555,8.231a1.36,1.36,0,0,1,.134-.193Q13.532,4.19,17.376.344A.953.953,0,0,1,18.331.03a.924.924,0,0,1,.505,1.476,2.328,2.328,0,0,1-.191.2q-3.818,3.82-7.637,7.639c-.052.052-.112.1-.238.2A1.166,1.166,0,0,1,11,9.684q3.848,3.843,7.692,7.689a.962.962,0,0,1,.322.953.925.925,0,0,1-1.5.5c-.062-.051-.117-.11-.174-.167L9.711,11.028c-.057-.057-.105-.122-.172-.2-.072.068-.124.117-.175.167q-3.852,3.852-7.7,7.706a.952.952,0,0,1-.955.311.924.924,0,0,1-.512-1.462,2.124,2.124,0,0,1,.189-.2q3.825-3.827,7.651-7.652a1.621,1.621,0,0,1,.19-.14c-.084-.089-.133-.143-.184-.194L.378,1.693a1.875,1.875,0,0,1-.21-.235A.926.926,0,0,1,1.47.176,2.048,2.048,0,0,1,1.7.388L9.355,8.039c.051.051.105.1.2.192" fill={colors.white} />
        </G>
    </Svg>
);
const Url = `${API_CONFIG.frontendApi}/api/`;



const SepetEkurunler = ({ navigation }) => {
    const [sepetList, setsepetList] = useState(null);
    const [sepetAdet, setsepetAdet] = useState(0);
    const { sepetSayisi, setSepetSayisi, sepetTutari, setSepetTutari } = useContext(SepetContext);
    const [sepetData, setsepetData] = useState([]);
    const { fetchTranslations, translate } = useContext(SepetContext);

    const [kargofiyatstring, setkargofiyatstring] = useState(null);
    const [toplam, settoplam] = useState('');
    const [indirim, setindirim] = useState(null);
    const [Code, setCode] = useState(null);
    const bottomSheet = useRef();
    const ekranYuksekligiFloat = Dimensions.get('window').height * .80;
    const ekranYuksekligiInt = Math.floor(ekranYuksekligiFloat); // Aşağı yuvarlar
    const [isLoading, setIsLoading] = useState(true);
    const [username, setusername] = useState(null);
    const [memberID, setumemberID] = useState(null);
    const [kargoindirimlimit, setkargoindirimlimit] = useState(null);
    const [invalidItems, setInvalidItems] = useState([]);
    const [sepetStep, setsepetStep] = useState(1);


    const sonrakiadim = async () => {
        navigation.navigate('SepetKartNotlarNav');
    };

    useEffect(() => {
        verial();
    }, []);

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
    useEffect(() => {
    }, [sepetTutari]);
    const handleRemove = (id) => {
        setsepetList(sepetList.filter(item => item.id !== id));
        deleteCartItem(id);

    };
    const goBack = () => {
        navigation.goBack();

    }
    const handleonEkurunUpt = async (toplamsepettutar, discount) => {
        settoplam(toplamsepettutar);
        setSepetTutari(toplamsepettutar);

        setindirim(discount);
    };
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaView style={stylesglobal.SafeAreaCSS}>

                <View style={stylesglobal.headerCustom}>
                    <HeaderleftComp title="Ek Ürünler" />
                </View>

                <View style={stylesglobal.container}>

                    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>

                        {sepetList && sepetList.length > 0 ? (
                            sepetList.map((item) => (
                                <View key={item.id}
                                    style={stylesglobal.basketlistcontainer}>

                                    <BasketItem
                                        item={item}
                                        code={Code}
                                        username={username}
                                        memberID={memberID}
                                        sepetstep={2}
                                        isInvalid={invalidItems.includes(item.id)} // Kırmızı çerçeve kontrolü
                                        onEkurunUpt={handleonEkurunUpt}
                                        onRemove={handleRemove}

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
                                        <IkostButton title={translate("Alışverişe Devam Et")} onPress={() => navigation.navigate("AnaNav")} />
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
                                {/* {(!indirim ||  indirim.includes('0.00')) && <View style={{ flex: 1, justifyContent: 'left', flexDirection: 'row', marginBottom: 5 }}>
                                                               <TouchableOpacity
                                                                   style={{
                                                                       backgroundColor: '#e7cdb2', padding: 0, justifyContent: 'center',
                                                                       alignItems: 'center', borderRadius: 5, width: 150, marginBottom: 5
                                                                   }}
                                                                   onPress={() => bottomSheet.current.show()}>
                                                                   <View  >
                                                                       <Text style={{ color: 'black' , fontFamily: 'NunitoSans-Regular',}}>{translate('indirim kodum var')}</Text>
                                                                   </View>
                                                               </TouchableOpacity>
                                                           </View>} */}
                                {indirim && !indirim.includes('0.00') && <View style={{ flex: 1, justifyContent: 'left', flexDirection: 'row', alignContent: 'center', alignItems: 'center' }}>
                                    <Text style={{ fontSize: 11, fontWeight: 'bold', marginBottom: 5, fontFamily: 'NunitoSans-Regular', color: colors.textSecondary }}>{translate('İndirim')}: </Text>
                                    <Text style={{ fontSize: 16, marginBottom: 5, fontFamily: 'NunitoSans-Regular', }}>-{indirim.replace('.', ',')}</Text>

                                </View>}

                                <View style={{
                                    flex: 1, justifyContent: 'left',
                                    flexDirection: 'row', alignSelf: 'baseline', alignItems: 'center'
                                }}>
                                    <Text style={{ fontSize: 11, fontWeight: 'bold', fontFamily: 'NunitoSans-Regular', color: colors.textSecondary }}>{translate('TOPLAM')}: </Text>
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
                            width: '100%', height: '100%', paddingHorizontal: 20, paddingVertical: 20, backgroundColor: 'white',
                            borderTopLeftRadius: 0, borderTopRightRadius: 0
                        }}>



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

export default SepetEkurunler;