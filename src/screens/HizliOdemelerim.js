import API_CONFIG from '../config/apiConfig';
import React, { useContext, useState, useEffect, useRef } from 'react';
import {
  View, Text, Image, ScrollView, StyleSheet, TouchableOpacity,
  SafeAreaView, ActivityIndicator, Dimensions
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import SagOk from '../components/SagOk';
import StatusCircles from '../components/StatusCircles';
import stylesglobal from '../stylesglobal';
import AnaFooter from '../components/AnaFooter';
import HeaderleftComp from '../components/HeaderleftComp';
import IkostResim from '../components/IkostResim';
import IkostButton from "../components/IkostButton";
import BottomSheet from "react-native-gesture-bottom-sheet";
import IkostTextInput from '../components/IkostTextInput';
import { ikostalert } from '../GlobalAlert';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import LottieView from 'lottie-react-native';
import { SepetContext } from '../components/SepetContext'; // İçe aktarma
import Auth from '../components/Auth';

import Swipeable from 'react-native-gesture-handler/Swipeable';
import { urls } from '../config/apiUrls';
import { colors } from '../config/theme';

const HizliOdeme = ({ navigation, route }) => {
  const swipeableRef = useRef(null);
  const [aktiftab, setaktiftab] = useState(1);
  const { fetchTranslations, translate } = useContext(SepetContext);

  const bottomSheet = useRef();
  const ekranYuksekligiFloat = Dimensions.get('window').height * .80;
  const ekranYuksekligiInt = Math.floor(ekranYuksekligiFloat); // Aşağı yuvarlar

  const [isLoading, setIsLoading] = useState(true);  // Yükleme durumunu izlemek için state
  const [kredikartlar, setKredikartlar] = useState(null);


  const fetchKrediKartlar = async () => {
    try {
      const memberID = await AsyncStorage.getItem('memberID');
      if (memberID !== null) {
        var username1 = await AsyncStorage.getItem('username');
        const response = await Auth.post(
          urls.kredikartlarim
        );
        setKredikartlar(response.data);
        setIsLoading(false);
      }
    } catch (error) {
      console.log('Hata oluştu: ', error);
    };
  };

  useEffect(() => {

    fetchKrediKartlar();
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


  }, [kredikartlar]);


  const kartsil = async (id) => {
    const memberID = await AsyncStorage.getItem('memberID');
    const username = await AsyncStorage.getItem('username');

    const response2 = await Auth.post(`${API_CONFIG.basketApi}/api/SepetOdeme/tokencAsync/`, {
      id: id,
      islem: 'sil'

    });
    fetchKrediKartlar();
  };
  const onRemove = async (id) => {

    ikostalert(
      'Adres Sil',
      'Adresi silmek istediğinizden emin misiniz?',
      [
        { text: 'Evet', onPress: () => kartsil(id) },
        { text: 'Vazgeç', onPress: () => swipeableRef.current.close() },
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




  if (isLoading) {
    return (

      <SafeAreaView style={stylesglobal.SafeAreaCSS}>
        <View style={stylesglobal.loaderview}><LottieView source={require('../assets/animations/yukleme_ani.json')}
          autoPlay loop style={stylesglobal.loading} /></View></SafeAreaView>

    );
  }

  if (kredikartlar && kredikartlar.length == 0) {
    return (

      <SafeAreaView style={stylesglobal.SafeAreaCSS}>
        <View style={stylesglobal.headerCustom}>
          <HeaderleftComp title="Hızlı Ödemelerim" />
        </View>

        <View style={styles.emptyBasketContainer}>
          <Image source={require('../assets/images/empty3.png')} style={styles.emptyBasketImage} />
          <Text style={styles.emptyBasketText}>{translate('Hızlı Ödemeniz Yok')}</Text>
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
          <HeaderleftComp title="Hızlı Ödemelerim" />
        </View>


        <ScrollView style={styles.container}>
          <View style={styles.itemsList}>

            {aktiftab === 1 && kredikartlar && kredikartlar.map((item, index) => (
              <>
                <Swipeable
                  ref={swipeableRef}

                  renderRightActions={() => renderRightActions(item)} >

                  <TouchableOpacity style={styles.kartContainer}
                    activeOpacity={1}
                    key={item.id + '-' + index}
                  >

                    <View style={{
                      borderColor: 'white', borderWidth: .5, borderRadius: 6, padding: 10, paddingHorizontal: 10,
                      backgroundColor: '#BAB09D', alignItems: 'flex-end'
                    }}>
                      <Text style={{ color: 'white', fontSize: 10, marginBottom: 10 }}>**            {item.last4char}</Text>
                      {item.mastervisa ? (
                        <Image style={{ width: 25, height: 15 }}
                          source={require('../assets/images/master.png')} />
                      )
                        :
                        (<Image style={{ width: 37, height: 11 }}
                          source={require('../assets/images/visa.png')} />)
                      }
                    </View>


                    <View style={{ alignItems: 'flex-end', flex: 1 }}>
                      <Text style={[styles.text, { fontWeight: 'bold', marginBottom: 5 }]}>{item.adsoyad}</Text>
                      <Text style={styles.text}>**** **** **** {item.last4char} </Text>
                    </View>

                    <SagOk />
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

        <BottomSheet sheetBackgroundColor="white"
          hasDraggableIcon KeyboardAvoidingView
          ref={bottomSheet}
          height={ekranYuksekligiInt}

        >

          <View style={{ flex: 1, justifyContent: 'flex-end' }}>

            <View style={{
              flex: 1, paddingHorizontal: 0, paddingVertical: 10,
              borderTopLeftRadius: 0, borderTopRightRadius: 0
            }}>

              <View style={{ flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 5, marginTop: 5, marginBottom: 10 }}>
                <Text style={{ flex: 1, fontSize: 14, color: 'black', textAlign: 'center', fontFamily: 'NunitoSans-Bold' }}>{aktiftab === 2 ? 'Fatura' : 'Teslim'} Adresi</Text>
                <TouchableOpacity
                  style={{ alignSelf: 'flex-end', width: 30, height: 30, position: 'absolute', right: 18 }}
                  onPress={() => bottomSheet.current.close()}>
                  <Image source={require('../assets/images/kapat.png')} width={30} style={{ width: 30, height: 30 }} />
                </TouchableOpacity>
              </View>
              <View style={{
                paddingHorizontal: 20, paddingVertical: 10,
                borderTopLeftRadius: 0, borderTopRightRadius: 0
              }}>



              </View>

            </View>

          </View>

        </BottomSheet>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  kartContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: colors.white,
  },
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
    fontWeight: 'normal', lineHeight: 18, color: 'black'
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

export default HizliOdeme;
