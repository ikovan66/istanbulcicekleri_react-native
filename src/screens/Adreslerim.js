import API_CONFIG from '../config/apiConfig';
import React, { useContext, useState, useEffect, useRef } from 'react';
import {
  View, Text, Image, ScrollView, StyleSheet, TouchableOpacity,
  ActivityIndicator, Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import SagOk from '../components/SagOk';
import StatusCircles from '../components/StatusCircles';
import stylesglobal from '../stylesglobal';
import AnaFooter from '../components/AnaFooter';
import HeaderleftComp from '../components/HeaderleftComp';
import IkostResim from '../components/IkostResim';
import IkostButton from "../components/IkostButton";
import BottomSheet from '../components/IkostBottomSheet';
import IkostTextInput from '../components/IkostTextInput';
import { ikostalert } from '../GlobalAlert';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import LottieView from 'lottie-react-native';
import { SepetContext } from '../components/SepetContext'; // İçe aktarma
import IkostScalableImage from '../components/IkostScalableImage';
import Auth from '../components/Auth';

import Swipeable from 'react-native-gesture-handler/Swipeable';
import { colors } from '../config/theme';

const Adreslerim = ({ navigation, route }) => {
  const swipeableRef = useRef(null);
  const [aktiftab, setaktiftab] = useState(1);
  const { fetchTranslations, translate } = useContext(SepetContext);

  const [sheetVisible, setSheetVisible] = useState(false);
  const ekranYuksekligiFloat = Dimensions.get('window').height;
  const ekranYuksekligiInt = Math.floor(ekranYuksekligiFloat); // Aşağı yuvarlar
  const [teslimAdreslerim, setteslimAdreslerim] = useState(null);
  const [faturaAdreslerim, setfaturaAdreslerim] = useState(null);
  const [isLoading, setIsLoading] = useState(true);  // Yükleme durumunu izlemek için state
  const [isim, setISIM] = useState(null);
  const [telefon, setTelefon] = useState(null);
  const [adres, setAdres] = useState(null);
  const [mahalle, setmahalle] = useState(null);
  const [il, setil] = useState(null);
  const [ilce, setilce] = useState(null);
  const [adresid, setadresid] = useState(null);
  const [unvan, setUNVAN] = useState('');
  const [vdaire, setVDAIRE] = useState('');
  const [vno, setVNO] = useState('');

  const checkteslimAdreslerim = async () => {
    setIsLoading(true);
    const dilStored = await AsyncStorage.getItem('dil');
    const kurStored = await AsyncStorage.getItem('kur');
    var username = await AsyncStorage.getItem('username');
    var memberID = await AsyncStorage.getItem('memberID');
    var model = {
      username: username,
      memberID: memberID,
      kur: kurStored,
      lang: dilStored
    };

    const response = await Auth.post(`${API_CONFIG.basketApi}/api/Adresler/teslimAdreslerim/`, {
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', },
    });
    setteslimAdreslerim(response.data);
    setIsLoading(false);

  };

  const checkfaturaAdreslerim = async () => {
    setIsLoading(true);
    var username = await AsyncStorage.getItem('username');
    var memberID = await AsyncStorage.getItem('memberID');
    var kurStored = await AsyncStorage.getItem('kur');
    var dilStored = await AsyncStorage.getItem('dil');
    var model = {
      username: username,
      memberID: memberID,
      kur: kurStored || 'TL',
      lang: dilStored || 'TR'
    };

    const response = await Auth.post(`${API_CONFIG.basketApi}/api/Adresler/Adreslerim/`, {
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', },
    });
    setfaturaAdreslerim(response.data);
    setIsLoading(false);

  };

  useEffect(() => {
    checkteslimAdreslerim();
    checkfaturaAdreslerim();
  }, []);

  useEffect(() => {

    setTimeout(() => {
      try {
        swipeableRef.current.openRight();

      } catch (error) {

      }
    }, 200);
    setTimeout(() => {
      try {
        swipeableRef.current.close();

      } catch (error) {

      }
    }, 500);


  }, [teslimAdreslerim]);


  const teslimadressil = async (id) => {
    const memberID = await AsyncStorage.getItem('memberID');
    const username = await AsyncStorage.getItem('username');

    const response2 = await Auth.post(`${API_CONFIG.basketApi}/api/Adresler/TeslimAdresSil/`, {
      memberID: memberID,
      username: username,
      pid: id

    });
    checkteslimAdreslerim();
  };
  const onRemove = async (id) => {

    ikostalert(
      translate('Adres Sil'),
      translate('Adresi silmek istediğinizden emin misiniz?'),
      [
        { text: translate('Evet'), onPress: () => teslimadressil(id) },
        { text: translate('Vazgeç'), onPress: () => swipeableRef.current.close() },
      ],
      { cancelable: true }
    );


  };

  const renderRightActions = (item) => {

    return (
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => onRemove(item.adresid)}
      >
        <Text style={{ color: 'white', fontWeight: '700', fontSize: 16 }}>{translate('Sil')}</Text>
      </TouchableOpacity>
    );

  };
  function adresSec(item) {
    setISIM(item.adsoyad);
    setTelefon(item.telefon);
    setAdres(item.adres);
    setmahalle(item.mahalle);
    setil(item.il);
    setilce(item.ilce);
    setadresid(item.adresid);
    setSheetVisible(true);
  }

  function adresSec2(item) {
    setISIM(item.adsoyad);
    setTelefon(item.telefon);
    setAdres(item.adres);
    setmahalle(item.mahalle);
    setil(item.il);
    setilce(item.ilce);
    setmahalle(item.mahalle);
    setUNVAN(item.unvan);
    setVDAIRE(item.vergidaire);
    setVNO(item.vergino);
    setadresid(item.adresid);

    setSheetVisible(true);
  }
  const phoneRegex = /^0\(\d{3}\) \d{3} \d{2} \d{2}$/; // Telefon numarası formatı: 0(999) 999 99 99

  const adresEkleTeslim = async () => {

    if (!adres || !isim || !telefon) {
      ikostalert(translate('Uyarı'), translate('Lütfen tüm alanları doldurunuz.'));
      return;
    }

    // if (!phoneRegex.test(telefon)) {
    //     ikostalert('Uyarı', 'Lütfen geçerli bir telefon numarası giriniz.');
    //     return;
    // }

    try {


      const memberID = await AsyncStorage.getItem('memberID');
      const username = await AsyncStorage.getItem('username');
      if (aktiftab === 2) {
        const response2 = await Auth.post(`${API_CONFIG.basketApi}/api/Adresler/AdresGuncelle/`, {
          memberID: memberID,
          username: username,
          adresid: adresid,
          adres: adres,
          adsoyad: isim,
          telefon: telefon,
          unvan: unvan ? unvan : '',
          vergidaire: vdaire ? vdaire : '',
          vergino: vno ? vno : ''

        });
        checkfaturaAdreslerim();
      } else {
        const response2 = await Auth.post(`${API_CONFIG.basketApi}/api/Adresler/TeslimAdresGuncelle/`, {
          memberID: memberID,
          username: username,
          adresid: adresid,
          adres: adres,
          adsoyad: isim,
          telefon: telefon

        });
        checkteslimAdreslerim();
      }

      setSheetVisible(false);


    } catch (error) {
      console.error('Hata oluştu:', error);
      throw error;
    }
  };

  if (isLoading) {
    return (

      <SafeAreaView style={stylesglobal.SafeAreaCSS}>
        <View style={stylesglobal.headerCustom}>
          <HeaderleftComp title={translate("Adreslerim")} />
        </View>
        <View style={stylesglobal.loaderview}><LottieView source={require('../assets/animations/yukleme_ani.json')}
          autoPlay loop style={stylesglobal.loading} /></View></SafeAreaView>

    );
  }

  if (teslimAdreslerim && teslimAdreslerim.length == 0) {
    return (

      <SafeAreaView style={stylesglobal.SafeAreaCSS}>
        <View style={stylesglobal.headerCustom}>
          <HeaderleftComp title={translate("Adreslerim")} />
        </View>
        <View style={styles.emptyBasketContainer}>
          <Image source={require('../assets/images/empty3.png')} style={styles.emptyBasketImage} />
          <Text style={styles.emptyBasketText}>{translate('Adresiniz Yok')}</Text>
          <Text style={{ marginBottom: 20, marginTop: 20, display: 'none' }}>
          </Text>

        </View>
      </SafeAreaView>

    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>

      <SafeAreaView style={stylesglobal.SafeAreaCSS}>
        <View style={stylesglobal.headerCustom}>
          <HeaderleftComp title={translate("Adreslerim")} />
        </View>

        <View style={{
          flexDirection: 'row', backgroundColor: colors.background, padding: 6,
          paddingHorizontal: 10, paddingBottom: 3
        }}>
          <TouchableOpacity
            style={aktiftab === 1 ? styles.aktifTouch : styles.pasifTouch}
            onPress={() => setaktiftab(1)}>
            <Text style={styles.textTouch}>{translate('Teslim Adreslerim')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={aktiftab === 2 ? styles.aktifTouch : styles.pasifTouch}
            onPress={() => setaktiftab(2)}>
            <Text style={styles.textTouch}>{translate('Fatura Adreslerim')}</Text>
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.container}>
          <View style={styles.itemsList}>

            {aktiftab === 1 && teslimAdreslerim && teslimAdreslerim.map((item, index) => (
              <>
                <Swipeable
                  ref={swipeableRef}

                  renderRightActions={() => renderRightActions(item)} >
                  <TouchableOpacity activeOpacity={1}
                    onPress={() => adresSec(item)}
                    style={styles.item} key={index}
                  >

                    <View style={styles.textContainer}>
                      <Text style={styles.text}><Text style={{ fontWeight: 'bold' }}>{item.adsoyad}, </Text>
                        {item.telefon}, {item.adres}, {item.mahalle} - {item.ilce} / {item.il}</Text>
                    </View>
                    <View style={{ width: 15 }}>
                      <IkostScalableImage source={require('../assets/images/Edit.png')} width={15} />
                    </View>
                  </TouchableOpacity>
                </Swipeable>
                <View style={{ height: 5 }}></View>
              </>
            ))}


            {aktiftab === 2 && faturaAdreslerim && faturaAdreslerim.map((item, index) => (
              <>
                <Swipeable
                  ref={swipeableRef}

                  renderRightActions={() => renderRightActions(item)} >
                  <TouchableOpacity activeOpacity={1}
                    onPress={() => adresSec2(item)}
                    style={styles.item} key={index}
                  >

                    <View style={styles.textContainer}>
                      <Text style={styles.text}><Text style={{ fontWeight: 'bold' }}>{item.adsoyad}, </Text>
                        {item.telefon}, {item.adres}, {item.unvan}, {item.vergidaire} - {item.vergino}</Text>
                    </View>
                    <View style={{ width: 15 }}>
                      <IkostScalableImage source={require('../assets/images/Edit.png')} width={15} />
                    </View>
                  </TouchableOpacity>
                </Swipeable>
                <View style={{ height: 5 }}></View>
              </>
            ))}
          </View>
        </ScrollView>
        <View style={stylesglobal.footer}>
          <AnaFooter parametre={'Hesabım'} navigation={navigation} />
        </View>

        <BottomSheet visible={sheetVisible}
          onClose={() => setSheetVisible(false)}
          height={ekranYuksekligiInt * .75}
          onKeyboardViewHeight={ekranYuksekligiInt} // Klavye açılınca yükseklik
          sheetBackgroundColor={colors.white}
          backgroundColor="rgba(0,0,0,0.6)"
          hasDraggableIcon
        >

          <View style={{ flex: 1, justifyContent: 'flex-end' }}>

            <View style={{
              flex: 1, paddingHorizontal: 0, paddingVertical: 10,
              borderTopLeftRadius: 0, borderTopRightRadius: 0
            }}>

              <View style={{ flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 5, marginTop: 5, marginBottom: 10 }}>
                <Text style={{ flex: 1, fontSize: 14, color: 'black', textAlign: 'center', fontFamily: 'NunitoSans-Bold' }}>{aktiftab === 2 ? translate('Fatura Adresi') : translate('Teslim Adresi')} </Text>
                <TouchableOpacity
                  style={{ alignSelf: 'flex-end', width: 30, height: 30, position: 'absolute', right: 18 }}
                  onPress={() => setSheetVisible(false)}>
                  <Image source={require('../assets/images/kapat.png')} width={30} style={{ width: 30, height: 30 }} />
                </TouchableOpacity>
              </View>
              <View style={{
                paddingHorizontal: 20, paddingVertical: 10,
                borderTopLeftRadius: 0, borderTopRightRadius: 0
              }}>

                <IkostTextInput
                  value={isim}
                  title={aktiftab === 2 ? translate('Fatura Ad Soyad') : translate('Alıcı Adı Soyadı')}
                  placeholder={aktiftab === 2 ? translate('Fatura Ad Soyad') : translate('Alıcı Adı Soyadı')}
                  onChangeText={(isim) => setISIM(isim)} />

                <IkostTextInput
                  keyboardType='phone-pad'
                  title={aktiftab === 2 ? translate('Fatura Telefon Numarası') : translate('Alıcı Telefon Numarası')}
                  placeholder={aktiftab === 2 ? translate('Fatura Telefon Numarası') : translate('Alıcı Telefon Numarası')}
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
                  title={aktiftab === 2 ? translate('Fatura Adresi') : translate('Alıcı Adresi')}
                  placeholder={aktiftab === 2 ? translate('Fatura Adresi') : translate('Alıcı Adresi')}
                  value={adres}
                  multiline
                  alttext={mahalle}
                  numberOfLines={4}
                  onChangeText={(adres) => setAdres(adres)} />
                {aktiftab === 2 && <>
                  <IkostTextInput
                    value={unvan}
                    title={translate("Ünvan")}
                    onChangeText={setUNVAN} />

                  <IkostTextInput
                    value={vdaire}
                    title={translate("Vergi Dairesi")}
                    onChangeText={setVDAIRE} />

                  <IkostTextInput
                    value={vno}
                    title={translate("Vergi No")}
                    onChangeText={setVNO} />
                </>}
                {mahalle &&
                  <Text style={{
                    marginBottom: 15,
                    fontWeight: '500', color: 'black', marginBottom: 25
                  }}>{mahalle} {ilce} {il} </Text>}



                <IkostButton title={translate("Güncelle")} onPress={adresEkleTeslim} />

              </View>

            </View>

          </View>

        </BottomSheet>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 0,
    backgroundColor: colors.bgLight,
  },
  textContainer: { flex: 1 },
  deleteButton: {
    backgroundColor: colors.error,
    justifyContent: 'center',
    alignItems: 'center',
    width: 100,
    top: 0,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  text: {
    fontSize: 12,
    fontFamily: 'NunitoSans-Regular',
    fontWeight: 'normal', lineHeight: 18,
    color: 'black',
  },
  emptyBasketContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30
  },
  emptyBasketImage: {

  },
  emptyBasketText: {
    fontFamily: "NunitoSans-Regular",
    fontSize: 14,
    color: 'black',
    marginTop: 20,
    marginBottom: 50
  },
  itemsList: {
    padding: 5,
    paddingHorizontal: 0,
    backgroundColor: colors.bgLight,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    paddingVertical: 15,
    backgroundColor: colors.white,
  },
  aktifTouch: {
    padding: 10,
    paddingHorizontal: 15,
    backgroundColor: colors.white,
    alignItems: 'center',
    borderRadius: 5,
    margin: 3, marginVertical: 0, flex: 1

  },
  pasifTouch: {
    padding: 10,
    paddingHorizontal: 15,
    alignItems: 'center', flex: 1

  },
  textTouch: {
    color: 'black',
    textAlign: 'center', fontSize: 12, fontWeight: '600'
  },
});

export default Adreslerim;
