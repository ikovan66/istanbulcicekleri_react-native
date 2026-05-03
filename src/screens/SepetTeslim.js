import API_CONFIG from '../config/apiConfig';
import { tenantFetch } from '../config/tenantFetch';
import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Text, ScrollView, Dimensions, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import IkostTextInput from '../components/IkostTextInput';
import IkostButton from "../components/IkostButton";
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import stylesglobal from '../stylesglobal';
import BottomSheet from "react-native-gesture-bottom-sheet";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SvgXml } from 'react-native-svg';
import { ikostalert } from '../GlobalAlert';
import { urls } from '../config/apiUrls';
import { colors } from '../config/theme';

const SepetTeslim = ({ navigation, route }) => {
  const Url = `${API_CONFIG.frontendApi}/api/Home/`;

  const [sepetData, setsepetData] = useState(route.params.sepetData);
  const ekranYuksekligiFloat = Dimensions.get('window').height * .80;
  const ekranYuksekligiInt = Math.floor(ekranYuksekligiFloat); // Aşağı yuvarlar

  const [isim, setISIM] = useState(route.params.sepetData.teslimad);
  const [telefon, setTelefon] = useState(route.params.sepetData.teslimtelefon);
  const [adres, setAdres] = useState(route.params.sepetData.teslimadres);
  const [secilenMahItem, setsecilenMahItem] = useState(null);
  const bottomSheet = useRef();

  const [code, setCode] = useState(route.params.Code);
  const [ortakUrunBayi, setOrtakUrunBayi] = useState('');
  const [bayiUserName, setBayiUserName] = useState('');
  const [teslimSaat, setTeslimSaat] = useState(route.params.secilenSAAT);
  const [teslimTarih, setTeslimTarih] = useState(route.params.secilenGUN);
  const [kartNot, setKartNot] = useState(route.params.sepetData.teslimkartnot);
  const [kartAd, setKartAd] = useState(route.params.sepetData.teslimkartad);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState('');
  const [kartnotDATA, setkartnotDATA] = useState(null);

  const [categories, setcategories] = useState(null);

  const chk = `
  <svg width="24px" height="24px" viewBox="0 0 512.00 512.00" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill={colors.black}><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" stroke={colors.border} stroke-width="1.024"></g><g id="SVGRepo_iconCarrier"> <title>checkbox-component-unchecked</title> <g id="Page-1" stroke-width="0.00512" fill="none" fill-rule="evenodd"> <g id="drop" fill={colors.black} transform="translate(64.000000, 64.000000)"> <path d="M384,1.42108547e-14 L384,384 L1.42108547e-14,384 L1.42108547e-14,1.42108547e-14 L384,1.42108547e-14 Z M362.666667,21.3333333 L21.3333333,21.3333333 L21.3333333,362.666667 L362.666667,362.666667 L362.666667,21.3333333 Z" id="Combined-Shape"> </path> </g> </g> </g></svg>
    `;

  const getkARTNOTLAR = async () => {
    try {
      const response = await tenantFetch(urls.kartNotlar('TR'));
      const data = await response.json();
      setkartnotDATA(data);
      setcategories([...new Set(data.map(item => item.kategori))].sort());
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (categories != null) {
      setSelectedCategory(categories[0]); // İlk elemanı seç
    }
  }, [categories]); // categories dizisi güncellendiğinde çalışır

  const checkMahalle = async () => {
    const mahalleitem = await AsyncStorage.getItem('@mahalleitem');
    setsecilenMahItem(JSON.parse(mahalleitem));
    //item.description, item.mahalle, item.semt, item.sehir
  };

  useEffect(() => {
    checkMahalle();
    getkARTNOTLAR();
  }, []);

  const handleSubmit = async () => {
    if (isim.length < 3) {
      ikostalert('Hata', 'Lütfen alıcı adını ve soyadını girin.', [{ text: 'TAMAM' }]);
      return;
    }
    if (telefon.length < 10) {
      ikostalert('Hata', 'Lütfen 10 karakterli bir telefon numarası girin.', [{ text: 'TAMAM' }]);
      return;
    }
    if (adres.length < 3) {
      ikostalert('Hata', 'Lütfen alıcı adresini girin.', [{ text: 'TAMAM' }]);
      return;
    }
    sendDataToAPI();
  };

  const sendDataToAPI = async () => {
    const apiUrl = `${Url}SepeteUpdate/`;
    const requestData = {
      Code: code,
      OrtakUrunBayi: ortakUrunBayi,
      BayiUserName: bayiUserName,
      TeslimAd: isim,
      TeslimTelefon: telefon,
      TeslimAdres: adres,
      TeslimMahalle: secilenMahItem.description,
      Mahalle: secilenMahItem.mahalle,
      Sehir: secilenMahItem.sehir,
      Semt: secilenMahItem.semt,
      TeslimSaat: teslimSaat,
      TeslimTarih: teslimTarih,
      KartNot: kartNot,
      KartAd: kartAd
    };

    try {
      const response = await axios.post(apiUrl, requestData);
      navigation.navigate("SepetEkurunlerNav")

    } catch (error) {
      ikostalert('Hata', `Sepet güncellenirken bir hata oluştu: ${error.message}`);
    }
  };



  function hazirnotsec(not) {
    setKartNot(not);
    bottomSheet.current.close();
  }

  const getMessagesForCategory = (category) => {
    return kartnotDATA.filter(item => item.kategori === category);
  };


  return (
    <GestureHandlerRootView style={{ flex: 1 }}>

      <SafeAreaView style={stylesglobal.SafeAreaCSS}>

        <ScrollView automaticallyAdjustKeyboardInsets={true}>

          <View style={styles.container}>

            <IkostTextInput
              value={isim}
              title="Alıcı Adı Soyadı"
              placeholder="Alıcı Adı Soyadı"
              onChangeText={(isim) => setISIM(isim)} />

            <IkostTextInput
              keyboardType='phone-pad'
              title="Alıcı Telefon Numarası"
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
              value={adres}
              multiline
              alttext={secilenMahItem}
              numberOfLines={4}
              onChangeText={(adres) => setAdres(adres)} />
            {secilenMahItem && <Text style={{ marginBottom: 15, fontWeight: '500', color: 'green' }}>{secilenMahItem.description}</Text>}

            <IkostTextInput
              title="Kart Notu"
              value={kartNot}
              multiline
              numberOfLines={4}
              onChangeText={(kartNot) => setKartNot(kartNot)} />

            {categories &&
              <TouchableOpacity
                onPress={() => bottomSheet.current.show()}
                style={{ padding: 10, paddingHorizontal: 15, backgroundColor: '#f0ad4e', borderRadius: 10 }}
              >
                <Text style={{
                  fontWeight: '600',
                  fontSize: 16, textAlign: 'center', color: 'white', fontSize: 13
                }}>Hazır Kart Notlarından Seç</Text>
              </TouchableOpacity>
            }

            <IkostTextInput
              value={kartAd}
              title="Gönderici Adı"
              onChangeText={(kartAd) => setKartAd(kartAd)} />

            <IkostButton title="Sonraki Adım" onPress={handleSubmit} />
            <View style={{ height: 50 }} />

          </View>

        </ScrollView>
        {categories &&
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
                    <Text style={{ fontWeight: '600', fontSize: 16, textAlign: 'center', marginBottom: 20 }}>Hazır Kart Notlarından Seçin</Text>

                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>

                      {categories.map((category, index) => (

                        <TouchableOpacity
                          key={index}
                          style={[styles.categoryItem, selectedCategory === category && styles.activeCategory]}
                          onPress={() => setSelectedCategory(category)}
                        >
                          <Text
                            style={[styles.categoryText, selectedCategory === category && styles.categoryTextaCT]}>{category}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                    <ScrollView >

                      {selectedCategory && kartnotDATA && getMessagesForCategory(selectedCategory).map((message, index) => (
                        <TouchableOpacity
                          key={index}
                          style={styles.messageItem}
                          onPress={() => hazirnotsec(message.mesaj)}
                        ><SvgXml xml={chk} width="24" height="24" style={{ alignSelf: 'flex-start', marginRight: 10 }} />
                          <Text style={{ flex: 1, fontSize: 14 }}>{message.mesaj}</Text>
                        </TouchableOpacity>
                      ))}

                    </ScrollView>
                  </View>


                </View>
              </View>
            </SafeAreaView>

          </BottomSheet>
        }
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 30,
    paddingLeft: 25,
    paddingRight: 25,
    backgroundColor: colors.white,
    alignItems: "center",
  },
  image: {
    marginBottom: 40,
  },
  forgot_button: {
    height: 30,
    marginBottom: 30,
  },

  categoryItem: {
    marginHorizontal: 5,
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,

  },
  activeCategory: {
    backgroundColor: '#4caf50'
  },
  categoryText: {
    color: colors.black,
    fontSize: 14
  },
  categoryTextaCT: {
    color: colors.white,
    fontSize: 14
  },
  messageItem: {
    flex: 1,
    flexDirection: 'row',
    padding: 10,
    paddingLeft: 0,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  }
});

export default SepetTeslim;
