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
import { SepetContext } from '../components/SepetContext'; // İçe aktarma
import { colors } from '../config/theme';

const BizeSorun = ({ navigation, route }) => {
  const [username, setUsername] = useState('');
  const [ad, setAd] = useState('');
  const [soyad, setSoyad] = useState('');
  const [telefon, setTelefon] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const Url = `${API_CONFIG.frontendApi}/api/`;


  const { fetchTranslations, translate } = useContext(SepetContext);


  const handlePress = async (phone) => {
    const url = 'https://api.whatsapp.com/send?phone=' + phone;
    const supported = await Linking.canOpenURL(url);

    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert('Hata', 'Bu URL açılmıyor: ' + url);
    }
  };




  return (
    <SafeAreaView style={stylesglobal.SafeAreaCSS}>
      <View style={stylesglobal.headerCustom}>
        <HeaderleftComp title="Bize Yazın" />
      </View>
      <View style={stylesglobal.container}>
        <ScrollView style={styles.container}>
          <View style={styles.orderBlock}>

            {/* <TouchableOpacity style={styles.row} onPress={() => handlePress('905354626890')}>
            <IkostResim source={require('../assets/images/bizesorun_telefon.png')} width={37} style={styles.itemIMG}/>  
            <View style={{flex:1}}>
            <Text style={styles.itemText}>{translate('Whatsapp İletişim Hattı')} 1</Text>
            <Text style={styles.itemText2}>{translate('Her gün 09:00-19:00 saatleri arasında ulaşabilirsiniz.')}</Text>
            </View>  
              <SagOk />
            </TouchableOpacity> */}
            {/* <TouchableOpacity style={styles.row} onPress={() => handlePress('905345106777')}>
            <IkostResim source={require('../assets/images/bizesorun_telefon.png')} width={37} style={styles.itemIMG}/>  
            <View style={{flex:1}}>
            <Text style={styles.itemText}>{translate('Whatsapp İletişim Hattı')} 2</Text>
            <Text style={styles.itemText2}>{translate('Her gün 09:00-19:00 saatleri arasında ulaşabilirsiniz.')}</Text>
            </View>  
              <SagOk />
            </TouchableOpacity> */}
            <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('BizeYazinNav')}>
              <IkostResim source={require('../assets/images/bizesorun_yazin.png')} width={37} style={styles.itemIMG} />
              <Text style={styles.itemText}>{translate('Bize Yazın')}</Text>
              <SagOk />
            </TouchableOpacity>
            <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('BizeContactNav')}>
              <IkostResim source={require('../assets/images/bizesorun_iletisim.png')} width={37} style={styles.itemIMG} />
              <Text style={styles.itemText}>{translate('İletişim Bilgilerimiz')}</Text>
              <SagOk />
            </TouchableOpacity>
            <TouchableOpacity style={styles.row} onPress={openAppPushDoc}>
              <IkostResim source={require('../assets/images/bizesorun_iletisim.png')} width={37} style={styles.itemIMG} />
              <View style={{ flex: 1 }}>
                <Text style={styles.itemText}>{translate('App Push Test Wizard Yardım Dokümanı')}</Text>
                <Text style={styles.itemText2}>{translate('Adım adım bağlantı sorunlarını giderin.')}</Text>
              </View>
              <SagOk />
            </TouchableOpacity>


          </View>
        </ScrollView>
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
    backgroundColor: colors.bgLight,
    marginBottom: 0,
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

export default BizeSorun;