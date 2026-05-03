import React, { useContext, useRef } from 'react';
import {Image,
  Dimensions,
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView
} from 'react-native';

import BottomSheet from 'react-native-gesture-bottom-sheet';

import IkostResim from '../components/IkostResim';
import stylesglobal from '../stylesglobal';
import HeaderleftComp from '../components/HeaderleftComp';
import AnaFooter from '../components/AnaFooter';
import AsagiOk from '../components/AsagiOk';

// Context importu
import { SepetContext } from '../components/SepetContext';
import { colors } from '../config/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function DilSecimi({ route, navigation }) {
  // route.params.reminder vb. kullanmayacaksanız, gereksizse çıkarabilirsiniz
  const { reminder } = route.params || {};
   const { fetchTranslations, translate, aktifDiller, aktifKurlar, setCurrency } = useContext(SepetContext);

  // Context’ten language, setLanguage, kur, setKur alıyoruz
  const { language, setLanguage, kur, setKur } = useContext(SepetContext);

  // BottomSheet referansları
  const dilSheetRef = useRef(null);
  const kurSheetRef = useRef(null);

  // Ekran yüksekliği (bottom sheet için)
  const ekranYuksekligiFloat = Dimensions.get('window').height * 0.8;
  const ekranYuksekligiInt = Math.floor(ekranYuksekligiFloat);

  // Dil seçimi
  const dilsec = async (dil) => {
    setLanguage(dil);
    await AsyncStorage.setItem('dil', dil);
    dilSheetRef.current?.close();
    setTimeout(() => {
      navigation.navigate('AnaNav',{refresh:true});
    }, 300);
  };

  // Kur seçimi
  const kursec = (secilenKur) => {
    setCurrency(secilenKur.kurad || secilenKur); // setCurrency NJ pattern — parite ile activeCurrency günceller
    kurSheetRef.current?.close();
    navigation.navigate('AnaNav',{refresh:true});
  };

  return (
    <SafeAreaView style={stylesglobal.SafeAreaCSS}>
      {/* HEADER */}
      <View style={stylesglobal.headerCustom}>
        <HeaderleftComp title="Ayarlar" />
      </View>

      {/* İçerik */}
      <ScrollView style={{ backgroundColor: colors.bgLight, flex: 1 }}>
        <View style={{ padding: 10, paddingVertical: 20 }}>
          {/* Dil seçimi butonu */}
          <TouchableOpacity
            style={styles.selectorButton}
            onPress={() => dilSheetRef.current?.show()}
          >
            <IkostResim
              source={require('../assets/images/ayar_dil.png')}
              width={20}
              style={styles.itemIMG}
            />
            <Text style={styles.selectorText1}>{translate('Dil')}</Text>
            <View style={styles.selectorText2Container}>
            <Text style={styles.selectorText2}>{language}</Text>
            </View>
            <AsagiOk />
          </TouchableOpacity>

          {/* Kur seçimi butonu */}
          <TouchableOpacity
            style={styles.selectorButton}
            onPress={() => kurSheetRef.current?.show()}
          >
            <IkostResim
              source={require('../assets/images/ayar_para.png')}
              width={20}
              style={styles.itemIMG}
            />
            <Text style={styles.selectorText1}>{translate('Kur')}</Text>
            <View style={styles.selectorText2Container}>
            <Text style={styles.selectorText2}>{kur}</Text>
            </View>
            <AsagiOk/>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* FOOTER */}
      <View style={stylesglobal.footer}>
        <AnaFooter parametre="Hesabım" navigation={navigation} />
      </View>

      {/* Dil Seçimi Bottom Sheet */}
      <BottomSheet
        sheetBackgroundColor={colors.background}
        hasDraggableIcon
        ref={dilSheetRef}
        height={ekranYuksekligiInt}
      >
        <View style={stylesglobal.bottomSheet}>
          <View style={stylesglobal.bottomSheetContainer}>

            <View style={stylesglobal.bottomSheetTitleConatiner}>
              
              <Text style={stylesglobal.bottomSheetTitle}>{translate('Dil Seçin')}</Text>
              <TouchableOpacity
                style={{}}
                onPress={() => dilSheetRef.current.close()}>
                <Image source={require('../assets/images/kapat.png')} style={{ width: 25, height: 25 }} />
              </TouchableOpacity>
            </View>

            <View style={stylesglobal.bottomSheetcontentStyle}>
              {aktifDiller.length > 0 ? (
                aktifDiller.map((dil) => {
                  const dilKisa = (dil.kisa || '').toUpperCase();
                  const dilTam = dil.tam || dil.kisa;
                  const isSelected = language === dilKisa;
                  return (
                    <TouchableOpacity
                      key={dilKisa}
                      style={styles.touch}
                      onPress={() => dilsec(dilKisa)}
                    >
                      <IkostResim
                        source={
                          isSelected
                            ? require('../assets/images/check_nokta.png')
                            : require('../assets/images/check_bos.png')
                        }
                        width={20}
                        style={styles.itemIMG}
                      />
                      <Text style={styles.itemDetails}>{dilTam} ({dilKisa})</Text>
                    </TouchableOpacity>
                  );
                })
              ) : (
                /* Fallback: Backend'den veri gelmediyse hardcoded seçenekler */
                <>
                  <TouchableOpacity style={styles.touch} onPress={() => dilsec('TR')}>
                    <IkostResim
                      source={language === 'TR' ? require('../assets/images/check_nokta.png') : require('../assets/images/check_bos.png')}
                      width={20}
                      style={styles.itemIMG}
                    />
                    <Text style={styles.itemDetails}>Türkçe (TR)</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.touch} onPress={() => dilsec('EN')}>
                    <IkostResim
                      source={language === 'EN' ? require('../assets/images/check_nokta.png') : require('../assets/images/check_bos.png')}
                      width={20}
                      style={styles.itemIMG}
                    />
                    <Text style={styles.itemDetails}>English (EN)</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </View>
       
      </BottomSheet>

      {/* Kur Seçimi Bottom Sheet */}
      <BottomSheet
        sheetBackgroundColor={colors.background}
        hasDraggableIcon
        ref={kurSheetRef}
        height={ekranYuksekligiInt}
      >
        <View style={stylesglobal.bottomSheet}>
          <View style={stylesglobal.bottomSheetContainer}>

            <View style={stylesglobal.bottomSheetTitleConatiner}>
              
              <Text style={stylesglobal.bottomSheetTitle}>{translate('Kur Seçin')}</Text>
              <TouchableOpacity
                style={{}}
                onPress={() => kurSheetRef.current.close()}>
                <Image source={require('../assets/images/kapat.png')} style={{ width: 25, height: 25 }} />
              </TouchableOpacity>
            </View>
            <View style={stylesglobal.bottomSheetcontentStyle}>
              {aktifKurlar.length > 0 ? (
                aktifKurlar.map((kurItem) => {
                  const kurad = (kurItem.kurad || '').trim().toUpperCase();
                  const sembol = (kurItem.sembol || kurItem.kurad || '').trim();
                  const isSelected = (kur || '').toUpperCase() === kurad ||
                    (kur || '').toUpperCase() === sembol.toUpperCase();
                  return (
                    <TouchableOpacity
                      key={kurItem.id || kurad}
                      style={styles.touch}
                      onPress={() => kursec(kurItem)}
                    >
                      <IkostResim
                        source={
                          isSelected
                            ? require('../assets/images/check_nokta.png')
                            : require('../assets/images/check_bos.png')
                        }
                        width={20}
                        style={styles.itemIMG}
                      />
                      <Text style={styles.itemDetails}>{sembol} ({kurad})</Text>
                    </TouchableOpacity>
                  );
                })
              ) : (
                /* Fallback: Backend'den veri gelmediyse hardcoded seçenekler */
                <>
                  <TouchableOpacity style={styles.touch} onPress={() => kursec({ kurad: 'TRY', sembol: 'TL', parite: 1 })}>
                    <IkostResim
                      source={kur === 'TL' ? require('../assets/images/check_nokta.png') : require('../assets/images/check_bos.png')}
                      width={20}
                      style={styles.itemIMG}
                    />
                    <Text style={styles.itemDetails}>TL</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.touch} onPress={() => kursec({ kurad: 'USD', sembol: '$', parite: 30 })}>
                    <IkostResim
                      source={kur === 'USD' ? require('../assets/images/check_nokta.png') : require('../assets/images/check_bos.png')}
                      width={20}
                      style={styles.itemIMG}
                    />
                    <Text style={styles.itemDetails}>USD</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.touch} onPress={() => kursec({ kurad: 'EUR', sembol: '€', parite: 33 })}>
                    <IkostResim
                      source={kur === 'EUR' ? require('../assets/images/check_nokta.png') : require('../assets/images/check_bos.png')}
                      width={20}
                      style={styles.itemIMG}
                    />
                    <Text style={styles.itemDetails}>EUR</Text>
                  </TouchableOpacity>
                </>
              )}
               </View>
          </View>
          </View>
       </BottomSheet>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  touch:{flexDirection: 'row', padding: 20,paddingLeft:10,borderBottomWidth:.2,borderBottomColor:colors.textSecondary },
  itemIMG: {
    marginRight: 15,
  },
  selectorButton: {
    backgroundColor: colors.white,
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 25,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  selectorText1: {
    fontFamily: 'NunitoSans-Bold',
fontSize:13,    color: colors.black,
    flex: 1,
  },
  selectorText2Container: {
    backgroundColor:colors.background,padding:10,borderRadius:6,marginRight:10
  },
  selectorText2: {
    fontFamily: 'NunitoSans-Bold',
    fontSize:11,
    color: colors.textSecondary,
    alignSelf: 'flex-end',
  },
  
  itemDetails: {
    fontFamily: 'NunitoSans-Regular',
    color: colors.textDark,
    alignSelf: 'center',
  },
});