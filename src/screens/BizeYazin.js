import API_CONFIG from '../config/apiConfig';
// Hesabim.js
import React, { useContext, useState, useEffect, useCallback } from 'react';
import { View, Linking, Text, ScrollView, Image, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SagOk from '../components/SagOk';
import AnaFooter from '../components/AnaFooter';
import stylesglobal from '../stylesglobal';
import axios from 'axios';
import HeaderleftComp from '../components/HeaderleftComp';
import IkostResim from '../components/IkostResim';
import { launchImageLibrary } from 'react-native-image-picker';
import { useFocusEffect } from '@react-navigation/native';
import { ikostalert } from '../GlobalAlert';
import IkostTextInput from '../components/IkostTextInput';
import IkostButton from '../components/IkostButton';
import { SepetContext } from '../components/SepetContext'; // İçe aktarma

import Auth from '../components/Auth';
import { colors } from '../config/theme';

const BizeYazin = ({ navigation, route }) => {
  const [mesaj, setMesaj] = useState(null);
  const [mesajbasar, setmesajbasar] = useState(null);


  const { fetchTranslations, translate } = useContext(SepetContext);


  const gonder = async () => {
    if (mesaj) {

      var ad = await AsyncStorage.getItem('ad');
      var soyad = await AsyncStorage.getItem('soyad');
      var telefon = await AsyncStorage.getItem('telefon');

      const mesajdata = {
        ad: ad,
        soyad: soyad,
        telefon: telefon,
        mesaj: mesaj
      };

      const response = await Auth.post(`${API_CONFIG.basketApi}/api/Adresler/MesajAt/`, mesajdata);
      const result = response.data;

      if (result.indexOf('yes') > -1) {
        setmesajbasar(true);
        //ikostalert('Başarılı', 'Mesajınızı Aldık.');

      } else {
        ikostalert(translate('Hata'), result);
      }

    } else {
      ikostalert(translate('Lütfen bir mesaj yazın.'));

    }
  };


  return (
    <SafeAreaView style={stylesglobal.SafeAreaCSS}>
      <View style={stylesglobal.headerCustom}>
        <HeaderleftComp title={translate("Bize Yazın")} />
      </View>
      <View style={stylesglobal.container}>
        {!mesajbasar && <View style={styles.orderBlock}>
          <IkostTextInput autoFocus={true}
            title={translate("Mesajınız")}
            value={mesaj}
            multiline
            numberOfLines={5}
            onChangeText={(mesaj) => setMesaj(mesaj)}
          />
          <View style={{ marginHorizontal: 20, marginTop: 15 }}>
            <IkostButton title={translate("Mesajı Gönder")}

              onPress={() => gonder()}></IkostButton>
          </View>

        </View>}

        {mesajbasar && <View style={styles.orderBlock}><View style={{ padding: 15, backgroundColor: '#9ddfdf', margin: 10, borderRadius: 6 }}>
          <Text style={{ fontSize: 12, marginVertical: 3, textAlign: 'center' }}>{translate('Mesajınızı başarıyla aldık.')}</Text>

        </View>
        </View>

        }
        <View style={stylesglobal.footer}>
          <AnaFooter parametre={'Hesabım'} navigation={navigation} />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 0,

  },
  title: {
    fontFamily: 'NunitoSans-Bold', color: 'black'
  },
  orderBlock: {
    paddingTop: 10,
    padding: 25,
    backgroundColor: colors.white,
    flex: 1
  },
  row1: {
    marginBottom: 5,
    backgroundColor: colors.bgLight,
    padding: 15,
    paddingTop: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
    margin: 10,
    backgroundColor: 'white',
    padding: 15, paddingVertical: 20,
  },
  row2: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 2,
    backgroundColor: 'white',
    padding: 15,
  },
  itemText: {
    flex: 1,
    textAlign: 'left',
    fontSize: 14,
    fontFamily: 'NunitoSans-Regular', color: 'black'
  },
  itemText: {
    flex: 1,
    textAlign: 'left',
    fontSize: 14,
    fontFamily: 'NunitoSans-Regular', color: 'black'
  },
  itemIMG: {
    marginRight: 20
  },
  itemText2: {
    textAlign: 'left',
    flex: 1,
    marginTop: 5,
    fontSize: 12,
    fontFamily: 'NunitoSans-Regular', color: 'black'
  },
  label: {
    fontWeight: 'bold',
    fontFamily: 'NunitoSans-Bold', color: 'black',
    width: 140,
  },
  value: {
    flex: 1,
    textAlign: 'left',
  },
  itemsList: {
    padding: 10,
    backgroundColor: colors.white,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
    padding: 0,
    backgroundColor: colors.white,
    alignItems: 'center',
  },
  itemDetails: {
    flex: 2,
  },
  itemPrice: {
    flex: 1,
    textAlign: 'right',
  },
  image: {
    width: 50,
    height: 50,
    marginRight: 10,
  },
});

export default BizeYazin;