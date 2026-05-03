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
import BottomSheet from "react-native-gesture-bottom-sheet";
import IkostTextInput from '../components/IkostTextInput';
import { ikostalert } from '../GlobalAlert';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import LottieView from 'lottie-react-native';
import { useFocusEffect } from '@react-navigation/native';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { SepetContext } from '../components/SepetContext'; // İçe aktarma
import { colors } from '../config/theme';

const Hatirlatmalarim = ({ navigation, route }) => {
  const swipeableRef = useRef(null);
  const [aktiftab, setaktiftab] = useState(1);
  const { fetchTranslations, translate } = useContext(SepetContext);

  const bottomSheet = useRef();
  const ekranYuksekligiFloat = Dimensions.get('window').height * 0.80;
  const ekranYuksekligiInt = Math.floor(ekranYuksekligiFloat); // Aşağı yuvarlama

  const [isLoading, setIsLoading] = useState(true); // Yükleme durumunu izlemek için
  const [hatirlatmalar, sethatirlatmalar] = useState(null);

  // Hatırlatma tekrar türleri
  const repeatTypeArray = [
    { name: 'Asla', value: 0 },
    { name: 'Günlük', value: 1 },
    { name: 'Haftalık', value: 2 },
    { name: 'Aylık', value: 3 },
    { name: '3 Aylık', value: 4 },
    { name: '6 Aylık', value: 5 },
    { name: 'Yıllık', value: 6 }
  ];

  // Hatırlatma bildirim süresi
  const notifyBeforeArray = [
    { name: '1 Gün Önce', value: 0 },
    { name: '1 Gün Önce', value: 1 },
    { name: '3 Gün Önce', value: 3 },
    { name: '7 Gün Önce', value: 7 },
    { name: '30 Gün Önce', value: 30 }
  ];

  // Seçili değere göre dizideki ismi döndürmek için yardımcı fonksiyon
  const getArrayByValue = (kaynakDizi, value) => {
    try {
      const option = kaynakDizi.find(item => item.value === value);
      return option ? translate(option.name) : '';
    } catch (error) {
      console.log('Hata oluştu: ', error);
      return '';
    }
  };

  const fetchhatirlatmalar = async () => {
    try {
      const memberID = await AsyncStorage.getItem('memberID');
      if (memberID !== null) {
        const username1 = await AsyncStorage.getItem('username');
        const response = await axios.post(
          `${API_CONFIG.frontendApi}/api/Home/Hatirlatmalar/`,
          {
            memberID: memberID,
            username: username1
          }
        );
        sethatirlatmalar(response.data);
        console.log(response.data);
      }
    } catch (error) {
      console.log('Hata oluştu: ', error);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchhatirlatmalar();
    }, [])
  );

  useEffect(() => {
    // Swipeable ile ufak bir animasyon
    setTimeout(() => {
      try {
        swipeableRef.current.openRight();
      } catch (error) { }
    }, 200);

    setTimeout(() => {
      try {
        swipeableRef.current.close();
      } catch (error) { }
    }, 500);
  }, [hatirlatmalar]);

  const hatirlatmasil = async (id) => {
    try {
      const memberID = await AsyncStorage.getItem('memberID');
      const username = await AsyncStorage.getItem('username');

      await axios.post(
        `${API_CONFIG.frontendApi}/api/Home/HatirlatmaEkle/`,
        {
          memberID: memberID,
          username: username,
          id: id,
          islem: 'sil'
        }
      );
      fetchhatirlatmalar();
    } catch (error) {
      console.log('Hatırlatma silme sırasında hata oluştu:', error);
    }
  };

  const onRemove = (id) => {
    ikostalert(
      'Hatırlatma Sil',
      'Hatırlatmayı silmek istediğinizden emin misiniz?',
      [
        { text: 'Evet', onPress: () => hatirlatmasil(id) },
        { text: 'Vazgeç', onPress: () => swipeableRef.current.close() }
      ],
      { cancelable: true }
    );
  };
  const [locale, setLocale] = useState('tr'); // default tr

  useEffect(() => {
    const getStoredLanguage = async () => {
      const dilStored = await AsyncStorage.getItem('dil');
      const selectedLocale = dilStored === 'EN' ? 'en' : 'tr';
      setLocale(selectedLocale);
    };

    getStoredLanguage();


  }, []);
  const renderRightActions = (item) => {
    return (
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => onRemove(item.id)}
      >
        <Text style={{ color: 'white', fontWeight: '700', fontSize: 16 }}>{translate('Sil')}</Text>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={stylesglobal.SafeAreaCSS}>
        <View style={stylesglobal.loaderview}>
          <LottieView
            source={require('../assets/animations/yukleme_ani.json')}
            autoPlay
            loop
            style={stylesglobal.loading}
          />
        </View>
      </SafeAreaView>
    );
  }

  if (hatirlatmalar && hatirlatmalar.length === 0) {
    return (
      <SafeAreaView style={stylesglobal.SafeAreaCSS}>
        <View style={stylesglobal.headerCustom}>
          <HeaderleftComp title="Hatırlatmalarım" />
          <View style={{ flexDirection: 'row', flex: 1, justifyContent: 'flex-end' }}>
            <TouchableOpacity
              style={{ padding: 5 }}
              onPress={() => navigation.navigate('ReminderFormNav')}
            >
              <Text>{translate('Ekle')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.emptyBasketContainer}>
          <Image
            source={require('../assets/images/empty3.png')}
            style={styles.emptyBasketImage}
          />
          <Text style={styles.emptyBasketText}>{translate('Hatırlatmanız Yok')}</Text>
          <IkostButton
            title="Hatırlatma Ekle"
            onPress={() => navigation.navigate('ReminderFormNav')}
            style={{ width: '100%' }}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={stylesglobal.SafeAreaCSS}>
        <View style={stylesglobal.headerCustom}>
          <HeaderleftComp title="Hatırlatmalarım" />
          <View style={{ flexDirection: 'row' }}>
            <TouchableOpacity
              style={{ padding: 5 }}
              onPress={() => navigation.navigate('ReminderFormNav')}
            >
              <Text>{translate('Ekle')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.container}>
          <View style={styles.itemsList}>
            {aktiftab === 1 &&
              hatirlatmalar &&
              hatirlatmalar.map((item, index) => (
                <View style={{ marginTop: 10 }} key={item.id}>
                  <Swipeable
                    ref={swipeableRef}
                    renderRightActions={() => renderRightActions(item)}
                  >
                    <TouchableOpacity
                      style={styles.reminderItem}
                      onPress={() =>
                        navigation.navigate('ReminderFormNav', { reminder: item })
                      }
                    >
                      <View>
                        <Text style={styles.reminderName}>{item.baslik}</Text>
                        <Text style={styles.reminderSub}>
                          {item.adsoyad}, {item.note}
                        </Text>
                        <Text style={styles.reminderDate}>
                          {item.tarih
                            ? new Date(item.tarih).toLocaleDateString(locale == 'tr' ? 'tr-TR' : 'en-EN', {
                              day: 'numeric',
                              month: 'long'
                            })
                            : ''}
                          {', ' + getArrayByValue(repeatTypeArray, item.tekrargunsay)}
                        </Text>
                      </View>
                      <View style={styles.rightContainer}>
                        {/* 
                          // BURADA notifyBefore mantığı:
                          // Eğer item.notifyBefore varsa notifyBeforeArray'den ilgili değeri bulup gösteriyoruz.
                          // Yoksa hiç göstermiyoruz.
                        */}
                        {item.notifyBefore || item.notifyBefore == 0 ? (
                          <View style={styles.tagContainer}>
                            <Text style={styles.tagText}>
                              {getArrayByValue(notifyBeforeArray, item.notifyBefore)}
                            </Text>
                          </View>
                        ) : null}
                      </View>
                    </TouchableOpacity>
                  </Swipeable>
                </View>
              ))}
          </View>
        </ScrollView>

        <View style={stylesglobal.footer}>
          <AnaFooter parametre={'Hesabım'} navigation={navigation} />
        </View>

        <BottomSheet
          sheetBackgroundColor="white"
          hasDraggableIcon
          KeyboardAvoidingView
          ref={bottomSheet}
          height={ekranYuksekligiInt}
        >
          <View style={{ flex: 1, justifyContent: 'flex-end' }}>
            <View
              style={{
                flex: 1,
                paddingHorizontal: 0,
                paddingVertical: 10,
                borderTopLeftRadius: 0,
                borderTopRightRadius: 0
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  paddingHorizontal: 20,
                  paddingVertical: 5,
                  marginTop: 5,
                  marginBottom: 10
                }}
              >
                <Text
                  style={{
                    flex: 1,
                    fontSize: 14,
                    color: 'black',
                    textAlign: 'center',
                    fontFamily: 'NunitoSans-Bold'
                  }}
                >
                  {aktiftab === 2 ? 'Fatura' : 'Teslim'} Adresi
                </Text>
                <TouchableOpacity
                  style={{
                    alignSelf: 'flex-end',
                    width: 30,
                    height: 30,
                    position: 'absolute',
                    right: 18
                  }}
                  onPress={() => bottomSheet.current.close()}
                >
                  <Image
                    source={require('../assets/images/kapat.png')}
                    width={30}
                    style={{ width: 30, height: 30 }}
                  />
                </TouchableOpacity>
              </View>
              <View
                style={{
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                  borderTopLeftRadius: 0,
                  borderTopRightRadius: 0
                }}
              >
                {/* BottomSheet içeriği buraya */}
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
    backgroundColor: colors.white
  },
  container: {
    flex: 1,
    padding: 0,
    backgroundColor: colors.bgLight
  },
  textContainer: { flex: 1 },
  deleteButton: {
    backgroundColor: colors.error,
    justifyContent: 'center',
    alignItems: 'center',
    width: 100,
    top: 0,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  text: {
    fontSize: 12,
    fontFamily: 'NunitoSans-Regular',
    fontWeight: 'normal',
    lineHeight: 18
  },
  emptyBasketContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30
  },
  emptyBasketImage: {},
  emptyBasketText: {
    fontFamily: 'NunitoSans-Regular',
    fontSize: 14,
    color: 'black',
    marginTop: 20,
    marginBottom: 22
  },
  itemsList: {
    padding: 5,
    paddingHorizontal: 0,
    backgroundColor: colors.bgLight
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    paddingVertical: 15,
    backgroundColor: colors.white
  },
  aktifTouch: {
    padding: 10,
    paddingHorizontal: 15,
    backgroundColor: colors.white,
    alignItems: 'center',
    borderRadius: 5,
    margin: 3,
    marginVertical: 0,
    flex: 1
  },
  pasifTouch: {
    padding: 10,
    paddingHorizontal: 15,
    alignItems: 'center',
    flex: 1
  },
  textTouch: {
    color: 'black',
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600'
  },
  reminderItem: {
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  reminderName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.black
  },
  reminderSub: {
    color: '#666',
    marginTop: 4
  },
  reminderDate: {
    color: '#666',
    marginTop: 2
  },
  rightContainer: {
    justifyContent: 'center',
    alignItems: 'flex-end'
  },
  tagContainer: {
    backgroundColor: '#FF6F6F',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 12
  },
  tagText: {
    color: colors.white
  }
});

export default Hatirlatmalarim;