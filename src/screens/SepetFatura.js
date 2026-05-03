import React, { useState, useRef, useContext, useEffect } from 'react';
import { View, Image, TouchableOpacity, StyleSheet, Dimensions, Text, ScrollView, Alert, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import IkostTextInput from '../components/IkostTextInput';
import IkostButton from "../components/IkostButton";
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import stylesglobal from '../stylesglobal';
import BottomSheet from "react-native-gesture-bottom-sheet";
import { SepetContext } from '../components/SepetContext'; // İçe aktarma
import { ikostalert } from '../GlobalAlert';
import { SepetContextTutar } from '../components/SepetContextTutar'; // İçe aktarma
import HeaderleftComp from '../components/HeaderleftComp';
import Auth from '../components/Auth';
import { urls } from '../config/apiUrls';
import { colors } from '../config/theme';

const Sepetfatura = ({ navigation, route }) => {

  const bottomSheet = useRef();
  const ekranYuksekligiFloat = Dimensions.get('window').height * .80;
  const ekranYuksekligiInt = Math.floor(ekranYuksekligiFloat); // Aşağı yuvarlar
  const [isim, setISIM] = useState('');
  const [telefon, setTelefon] = useState('');
  const [adres, setAdres] = useState('');
  const [unvan, setUNVAN] = useState('');
  const [vdaire, setVDAIRE] = useState('');
  const [vno, setVNO] = useState('');
  const [kurumsalFatura, setKurumsalFatura] = useState(false);
  const [adresler, setAdresler] = useState(null);
  const [isKayit, setisKayit] = useState(false);
  const [kayitliView, setkayitliView] = useState(false);
  const toggleSwitch = () => setisKayit(previousState => !previousState);
  const { translate, sepetSayisi, setSepetSayisi, sepetTutari, setSepetTutari } = useContext(SepetContext);

  useEffect(() => {
    const checkFatura = async () => {
      var isim1 = await AsyncStorage.getItem('faturaAd');
      var telefon1 = await AsyncStorage.getItem('faturaTelefon');
      var adres1 = await AsyncStorage.getItem('faturaAdres');
      var unvan1 = await AsyncStorage.getItem('faturaUnvan');
      var vdaire2 = await AsyncStorage.getItem('faturaVergiDairesi');
      var vno1 = await AsyncStorage.getItem('faturaVergiNo');

      if (isim1 == null) {
        var ad = await AsyncStorage.getItem('ad');
        var soyad = await AsyncStorage.getItem('soyad');
        isim1 = (ad || '') + ' ' + (soyad || '');
        telefon1 = await AsyncStorage.getItem('telefon');
        unvan1 = '';
        vdaire2 = '';
        vno1 = '';
      }

      // Hide placeholders
      if (isim1.trim() === '- -' || isim1.trim() === '-') {
        isim1 = '';
      }
      if (telefon1 === '0(000) 000 00 00') {
        telefon1 = '';
      }

      if (unvan1 == null) unvan1 = '';
      if (vdaire2 == null) vdaire2 = '';
      if (vno1 == null) vno1 = '';

      setISIM(isim1);
      setTelefon(telefon1);
      setAdres(adres1);
      setUNVAN(unvan1);
      setVDAIRE(vdaire2);
      setVNO(vno1);
    };
    checkFatura();
  }, []);

  useEffect(() => {
    const fetchAdresler = async () => {
      try {
        const memberID = await AsyncStorage.getItem('memberID');
        if (memberID !== null) {
          var username1 = await AsyncStorage.getItem('username');
          const response = await Auth.post(
            urls.adreslerim
          );
          setAdresler(response.data);
        }
      } catch (error) {
        console.log('Hata oluştu: ', error);
      };
    };

    const verifyCartTotal = async () => {
      const code = await AsyncStorage.getItem('@code');
      if (code) {
        try {
          // Double check total from backend to ensure we don't carry over stale state
          const response = await axios.get(`${urls.sepetIzle}`, {
            params: { code: code }
          });
          if (response.data && response.data.uruntoplam) {
            console.log('SepetFatura verified total:', response.data.uruntoplam);
            setSepetTutari(response.data.uruntoplam);
            // Also ensure sepetSayisi is synced just in case
            if (response.data.sepetlist) {
              const totalQty = response.data.sepetlist.reduce((acc, item) => acc + item.adet, 0);
              setSepetSayisi(totalQty.toString());
            }
          }
        } catch (error) {
          console.log('Error verifying cart total:', error);
        }
      }
    }

    fetchAdresler();
    verifyCartTotal();
  }, []);


  useEffect(() => {
    console.log('sepetTutar:' + sepetTutari);
  }, [sepetTutari]);


  const goBack = () => {
    navigation.goBack();

  }
  const handleKurumsalFaturaToggle = (value) => {
    setKurumsalFatura(value);
    if (!value) {
      setUNVAN('');
      setVDAIRE('');
      setVNO('');
    }
  };

  const validateAndNext = () => {
    if (!isim || !telefon || !adres) {
      ikostalert(translate("Hata"), translate("Lütfen tüm zorunlu alanları doldurunuz."));
      return;
    }

    if (isim.length < 3) {
      ikostalert(translate('Hata'), translate('Lütfen ad ve soyadı girin.'), [{ text: translate('TAMAM') }]);
      return;
    }
    if (telefon.length < 10) {
      ikostalert(translate('Hata'), translate('Lütfen 10 karakterli bir telefon numarası girin.'), [{ text: translate('TAMAM') }]);
      return;
    }
    if (adres.length < 3) {
      ikostalert(translate('Hata'), translate('Lütfen fatura adresini girin.'), [{ text: translate('TAMAM') }]);
      return;
    }
    if (kurumsalFatura && (!unvan || !vdaire || !vno)) {
      ikostalert(translate("Hata"), translate("Lütfen tüm kurumsal bilgileri doldurunuz."));
      return;
    }

    if (kurumsalFatura && (vno.length < 10 || vno.length > 11)) {
      ikostalert(translate("Hata"), translate("Vergi numarası 10 veya 11 karakter olmalıdır."));
      return;
    }

    sendDataToAPI();
  };

  async function adresSec(item) {
    setkayitliView(false);
    setISIM(item.adsoyad);
    setTelefon(item.telefon);
    setAdres(item.adres);
    setUNVAN(item.unvan);
    setVDAIRE(item.vergidaire);
    setVNO(item.vergino);
    if (item.unvan != "") {
      setKurumsalFatura(true);
    } else {
      setKurumsalFatura(false);
    }
    bottomSheet.current.close();
  }

  // 401 durumunda çağrılacak örnek fonksiyon
  const handleUnauthorized = async () => {
    await AsyncStorage.clear();
    navigation.navigate("GirisNav");
  };

  const sendDataToAPI = async () => {
    var username = await AsyncStorage.getItem('username');
    var code = await AsyncStorage.getItem('@code');
    var memberID = await AsyncStorage.getItem('memberID');
    if (memberID != null) {

      // Auto-Sync Profile: If current profile has placeholders, update it with these valid details
      try {
        const currentAd = await AsyncStorage.getItem('ad');
        const currentSoyad = await AsyncStorage.getItem('soyad');
        const currentTelefon = await AsyncStorage.getItem('telefon');

        if (currentAd === '-' || currentSoyad === '-' || currentTelefon === '0(000) 000 00 00') {
          console.log("Profile has placeholders. Syncing with checkout data...");

          // Split isim into Ad/Soyad
          const nameParts = isim.trim().split(' ');
          const newAd = nameParts[0];
          const newSoyad = nameParts.length > 1 ? nameParts.slice(1).join(' ') : "";

          const newUser = {
            Ad: newAd,
            Soyad: newSoyad,
            Telefon: telefon, // Use the new valid phone
            Bulten: true // Default to true or check existing pref if possible, but true is safe/standard here
          };

          // Background update - fire and forget (or await if critical, but we don't want to block checkout too much)
          Auth.post(`${urls.updateUye}`, newUser)
            .then(async (resp) => {
              if (resp.data.indexOf('tamam') > -1) {
                console.log("Profile synced successfully.");
                await AsyncStorage.multiSet([
                  ['ad', newAd],
                  ['soyad', newSoyad],
                  ['telefon', telefon]
                ]);
              }
            })
            .catch(err => console.log("Profile sync failed:", err));
        }
      } catch (syncError) {
        console.log("Sync check error:", syncError);
      }

      const requestData = {
        codesiparis: code,
        adsoyad: isim, baslik: "mobil adres", telefon: telefon,
        adres: adres, il: '', ilce: '', ulke: '',
        unvan: unvan, vergidaire: vdaire, vergino: vno,
        isKayit: isKayit

      };
      try {
        const response = await Auth.post(urls.adresEkle, requestData);
        await AsyncStorage.setItem('faturaAd', isim);
        await AsyncStorage.setItem('faturaTelefon', telefon);
        await AsyncStorage.setItem('faturaAdres', adres);
        await AsyncStorage.setItem('faturaUnvan', unvan);
        await AsyncStorage.setItem('faturaVergiDairesi', vdaire);
        await AsyncStorage.setItem('faturaVergiNo', vno);
        console.log(response.data);
        navigation.navigate("SepetOdemeNav", { code: code, username: username, toplam: sepetTutari });

      } catch (error) {
        if (error.response && error.response.status === 401) {
          handleUnauthorized(); // Bu fonksiyonu çağır
        } else {
          ikostalert('Hata', `Sepet güncellenirken bir hata oluştu: ${error.message}`);
        }
      }
    }


  };
  return (
    <SafeAreaView style={stylesglobal.SafeAreaCSS}>
      <View style={stylesglobal.headerCustom}>
        <HeaderleftComp title={translate("Gönderici Bilgileri")} />
      </View>

      {adresler && adresler.length > 0 &&
        <View style={{ backgroundColor: colors.background, paddingHorizontal: 10, width: '100%' }}>
          <TouchableOpacity
            onPress={() => bottomSheet.current.show()}
            style={styles.button} >
            <Text style={{
              fontWeight: '600', fontFamily: 'NunitoSans-Regular',
              textAlign: 'center', color: 'white', fontSize: 13
            }}>{translate('Kayıtlı Adreslerimden Seç')}</Text>
          </TouchableOpacity>
        </View>}

      <BottomSheet sheetBackgroundColor="white"
        hasDraggableIcon KeyboardAvoidingView
        ref={bottomSheet}
        height={ekranYuksekligiInt}
      >
        <SafeAreaView style={stylesglobal.SafeAreaCSS}>

          <View style={{
            flex: 1, justifyContent: 'flex-end',
            backgroundColor: 'rgba(0, 0, 0, 0.5)'
          }}>

            <View style={{
              width: '100%', height: '100%', paddingHorizontal: 20, paddingVertical: 20, backgroundColor: 'white',
              borderTopLeftRadius: 0, borderTopRightRadius: 0
            }}>

              <View style={{ marginTop: 0 }}>
                <Text style={{
                  fontWeight: '600', fontSize: 16,
                  textAlign: 'center', marginBottom: 20
                }}>{translate('Kayıtlı Adreslerimden Seç')}</Text>

                <ScrollView >
                  {adresler && adresler.map((item, index) => (<TouchableOpacity
                    key={item.id + '-' + index}
                    onPress={() => adresSec(item)}
                    style={[
                      styles.button1
                    ]}
                  >
                    <View style={styles.radioButton}>
                    </View>

                    <View style={styles.textContainer}>

                      <Text style={[styles.text, { fontWeight: 'bold' }]}>{item.adsoyad} {item.unvan}</Text>
                      <Text style={styles.text}>{item.adres} {item.telefon} </Text>
                      <Text style={styles.text}>{item.vergidaire} / {item.vergino} </Text>

                    </View>

                  </TouchableOpacity>
                  ))}

                </ScrollView>
              </View>


            </View>
          </View>
        </SafeAreaView>

      </BottomSheet>

      <View style={styles.container}>


        <ScrollView automaticallyAdjustKeyboardInsets={true} style={{ flex: 1, width: '100%' }}>

          <IkostTextInput
            value={isim}
            title={translate("Gönderici Adı Soyadı")}
            onChangeText={setISIM} />

          <IkostTextInput
            keyboardType='phone-pad'
            title={translate("Gönderici Telefon Numarası")}
            mask={[
              '0', '(', /\d/, /\d/, /\d/, ')', ' ',
              /\d/, /\d/, /\d/, ' ',
              /\d/, /\d/, ' ',
              /\d/, /\d/
            ]}
            value={telefon}
            onChangeText={setTelefon}
          />

          <IkostTextInput
            title={translate("Gönderici Adresi")}
            value={adres}
            multiline
            numberOfLines={4}
            onChangeText={setAdres} />


          <View style={styles.swcontainer}>
            <Text style={[styles.swtext, kurumsalFatura && { fontWeight: "bold" }]}>{translate('Fatura Bilgilerimi Düzenle')}</Text>
            <Switch
              trackColor={{ false: "gray", true: "#e37c33" }}
              thumbColor={"#f4f3f4"}
              onValueChange={handleKurumsalFaturaToggle}
              value={kurumsalFatura}
            /></View>



          {kurumsalFatura && (<><IkostTextInput
            value={unvan}
            title={translate("Firma Adı")}
            onChangeText={setUNVAN} />

            <IkostTextInput
              value={vdaire}
              title={translate("Vergi Dairesi")}
              onChangeText={setVDAIRE} />

            <IkostTextInput
              value={vno}
              title={translate("Vergi No")}
              onChangeText={setVNO} /></>)}

          <View style={styles.swcontainer}>
            <Text style={[styles.swtext, isKayit && {}]}>{translate('Kayıtlı Gönderici Adreslerime Ekle')}</Text>
            <Switch
              trackColor={{ false: "gray", true: "#e37c33" }}
              thumbColor={"#f4f3f4"}
              onValueChange={toggleSwitch}
              value={isKayit}
            /></View>

        </ScrollView>



      </View>
      <View style={stylesglobal.footersepet}>
        <View style={{ flex: 1.3, justifyContent: 'left', alignItems: 'baseline' }}>


          {1 == 5 && sepetTutari != null && (
            <View style={{ flex: 1, justifyContent: 'flex-start', flexDirection: 'row', alignSelf: 'baseline', alignItems: 'center' }}>
              <Text style={{ fontSize: 11, fontWeight: 'bold', marginBottom: 5, fontFamily: 'NunitoSans-Regular', color: colors.textSecondary }}>
                {translate('TOPLAM')}:
              </Text>
              <Text style={{ fontSize: 20, fontFamily: 'NunitoSans-Regular', color: 'black' }}>
                {String(sepetTutari).replace('.', ',')}
              </Text>
            </View>
          )}
        </View>
        <TouchableOpacity style={{ flex: 1 }} onPress={() => validateAndNext()}>
          <View style={stylesglobal.butonsepet}>
            <Text style={stylesglobal.butonsepetTEXT}>{translate('Devam')}</Text>
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 25,
    paddingLeft: 25,
    paddingRight: 25,
    backgroundColor: colors.white,
    alignItems: "flex-start",
  },
  button1: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: colors.background,
    borderRadius: 10,
    marginVertical: 2,
  },
  button: {
    backgroundColor: colors.primary,
    padding: 10,
    paddingVertical: 11,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
    marginTop: 10, marginBottom: 10
  },

  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  radioButton: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: .5,
    borderColor: colors.black,
    backgroundColor: 'white',
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  radioButtonSelected: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: colors.black,
  },
  switchLabel: {
    fontFamily: 'NunitoSans-Bold',
    marginRight: 10, color: colors.black,
    fontSize: 16,
  }, textContainer: {
    flex: 1,
    justifyContent: "space-between",

  },
  text: {
    fontFamily: 'NunitoSans-Regular',
    fontSize: 14, lineHeight: 20, color: colors.black,
  },
  swcontainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 20,
    paddingRight: 20,
  },
  swtext: {
    fontFamily: 'NunitoSans-Regular',
    fontSize: 16, color: colors.black,
    marginRight: 10, flex: 1,
  },
});

export default Sepetfatura;
