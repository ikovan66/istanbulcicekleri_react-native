import API_CONFIG from '../config/apiConfig';
import React, { useContext, useState, useEffect, useRef } from 'react';
import {Image,Keyboard,
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
import { ikostalert } from '../GlobalAlert';
import IkostScalableImage from '../components/IkostScalableImage';
import {SepetContext} from '../components/SepetContext'; // İçe aktarma
import { Host, Portal } from 'react-native-portalize';
import { colors } from '../config/theme';


const BasketItem = ({ item, KartNotUpdate, code, onRemove, onUpdateQuantity, onEkurunUpt, onUpdateAdres, isInvalid, username, memberID, sepetstep ,index}) => {
    const Url = `${API_CONFIG.frontendApi}/api/`;
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
    const { fetchTranslations, translate } = useContext(SepetContext);

    const toggleSwitch = () => setisKayit(previousState => !previousState);

    useEffect(() => {
        if (KartNotUpdate) {
            KartNotUpdate(item.id, item.teslimkartnot, item.teslimkartad);
        }

           if(index==1){
            setTimeout(() => {
                swipeableRef.current.openRight(); 
            }, 200); 
            setTimeout(() => {
                swipeableRef.current.close(); 
            }, 500); 
           }

        
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

    

        try {

    
            const memberID = await AsyncStorage.getItem('memberID');
            const username = await AsyncStorage.getItem('username');

            const response2 = await axios.post(`${Url}SepeteUpdate/`, {
                codesanal: code,
                sid: item.id,
                teslimadres: adres,
                teslimad: isim,
                teslimtelefon: telefon,
                username: username,
                isKayit:isKayit

            });
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
            const response = await fetch(url);
            const result = await response.text();
            onUpdateQuantity();
        } catch (error) {
            console.error('Hata:', error);
        }
    };

    const ekurunupadte = (tot,discount) => {
        onEkurunUpt(tot,discount)
    }


    
    const renderRightActions = (progress, dragX) => {
        if (sepetstep == 1) {
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
        const fd = new Intl.DateTimeFormat('tr-TR', {
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
                styles.itemContainer,
                isInvalid && !isvalidhere && styles.redBorder // Eğer öğe geçersizse kırmızı çerçeve ekle
            ]}>
                <View style={{ justifyContent: 'flex-start' }}>
                    <IkostScalableImage source={{ uri: item.imgurl }} width={80} style={{ alignSelf: 'flex-start' }} />

                </View>
                <View style={styles.infoContainer}>
                    <View style={styles.textContainer}>
                        <Text style={styles.name}>{item.ad}{item.cesitad}</Text>
                        <Text style={styles.price}>{item.fiyatstring}</Text>

                        <Text style={styles.text}>{item.teslimmahalle}  <Text style={{ color: '#DFD2B9' }}>●</Text>  {formattedgun(item.teslimtarih)} {item.teslimsaat}</Text>

                        {!item.teslimadres && 
                        <TouchableOpacity onPress={() => setSheetVisible(true)} style={styles.button}>
                            <Text style={{ fontFamily: 'NunitoSans-Regular', fontSize: 13,color:'black' }}>+ {translate('Adres Detaylarını Tamamla')}</Text>
                        </TouchableOpacity>}
                        {item.ekurunler.map((ekurun) => (<View style={styles.itemContainerEKURUN} >
                            <View style={{ flex: 1, paddingHorizontal: 0 }}>
                                <Text style={styles.textekurun}>{ekurun.ad}</Text>
                                <Text style={styles.priceekurun}>{ekurun.fiyatstring}</Text>

                            </View>
                            <View style={{ justifyContent: 'flex-start' }}>
                                <IkostScalableImage source={{ uri: ekurun.url }} width={30} style={{ alignSelf: 'flex-end' }} />
                            </View>
                        </View>
                        ))}


                    </View>


                </View>
            </View>
            {item.teslimadres && sepetstep == 1 && <TouchableOpacity onPress={() => setSheetVisible(true)} style={styles.teslimatadres}>
                <View>
                    <Text style={[styles.text, { fontWeight: 'bold' }]}>{translate('Teslimat')}:</Text>
                </View>
                <View style={{ flex: 1, paddingHorizontal: 15, paddingRight: 5 }}>
                    <Text style={styles.text}><Text style={{ fontWeight: 'bold' }}>{item.teslimad}</Text>  {item.teslimtelefon}</Text>
                    <Text style={styles.text}>{item.teslimadres} {item.teslimmahalle}</Text>
                </View>
                <View style={{ width: 15 }}>
                     <IkostScalableImage source={require('../assets/images/Edit.png')} width={15} />
                </View>
            </TouchableOpacity>}

            {isInvalid && !isvalidhere && sepetstep == 1 && <View style={styles.hata}>
                <Text style={{ color: 'white', textAlign: 'center' }}>{translate('Teslimat adresi girmediniz!')}</Text></View>}

            {sepetstep == 2 && <View >
                <Ekurunler Code={code} sid={item.id} onchange={ekurunupadte} />
            </View>}

            {sepetstep == 3 && <View>
                <KartNot code={code} sid={item.id} item={item} onKartNotUpdate={handleKartNotUpdate} />
            </View>}
        </Swipeable>

        <Portal hostName="rootPortal">

        <BottomSheet  visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        height={ekranYuksekligiInt*.75}
        onKeyboardViewHeight={ekranYuksekligiInt*.90} // Klavye açılınca yükseklik
        sheetBackgroundColor={colors.white}
        backgroundColor="rgba(0,0,0,0.6)"
        hasDraggableIcon
      >

            <View style={{ flex: 1, justifyContent: 'flex-end' }}>

                <View style={{
                    flex:1, paddingHorizontal: 0, paddingVertical: 10,
                    borderTopLeftRadius: 0, borderTopRightRadius: 0
                }}>

                    <View style={{ flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 5,
                         marginTop: 5}}>
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
                            // mask={[
                            //     '0', '(', /\d/, /\d/, /\d/, ')', ' ',
                            //     /\d/, /\d/, /\d/, ' ',
                            //     /\d/, /\d/, ' ',
                            //     /\d/, /\d/
                            //   ]}
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
                        {item.teslimmahalle && <Text style={{ marginBottom: 15, fontWeight: '500', color: 'black',marginBottom:25 }}>{item.teslimmahalle}</Text>}

                        {username &&     <View style={styles.swcontainer}>
                                <Text style={[styles.swtext, isKayit && { fontWeight: "bold" }]}>
                                {translate('Kayıtlı teslimat adreslerime ekle')}</Text>
                                                            <Switch
                                                                    trackColor={{ false: "gray", true: "#e7cdb2" }}
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
        backgroundColor: colors.white, padding: 10, flex: 1, paddingHorizontal: 15,
        paddingBottom: 5,
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
        borderRadius: 6, borderBottomStartRadius: 0, borderBottomEndRadius: 0
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
        marginBottom: 10,color:'black'
    },
    text: {
        fontSize: 12,
        fontFamily: 'NunitoSans-Regular',
        fontWeight: 'normal', lineHeight: 18,color:'black'
    },
    price: {
        fontSize: 14,
        fontFamily: 'NunitoSans-Bold',
        marginBottom: 10,color:'black'
    },
    textekurun: {
        fontSize: 12,
        fontFamily: 'NunitoSans-Regular',
        fontWeight: 'normal', lineHeight: 18,color:'black'
    },
    priceekurun: {
        fontSize: 13,
        fontFamily: 'NunitoSans-Bold',
        marginTop: 5,color:'black'
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
        marginHorizontal: 6,color:'black'
    },
    deleteButton: {
        backgroundColor: colors.error,
        justifyContent: 'center',
        alignItems: 'center',
        width: 100,
        height: '100%',
borderRadius:6,
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
        backgroundColor: '#e7cdb2',
        padding: 10,
        paddingVertical: 11,
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
    swtext: {    fontFamily: 'NunitoSans-Regular',
        fontSize: 16,
        marginRight: 10,color:'black'
    },
});
export default BasketItem;
