import React, { useContext, useState, useEffect } from 'react';
import { View, Image, Text, TouchableOpacity, TextInput, Button, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import IkostTextInput from '../components/IkostTextInput';
import IkostButton from "../components/IkostButton";
import IkostButton2 from "../components/IkostButton2";
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import stylesglobal from '../stylesglobal';
import AnaFooter from '../components/AnaFooter';
import HeaderleftComp from '../components/HeaderleftComp';
import { ikostalert } from '../GlobalAlert';
import { SepetContext } from '../components/SepetContext'; // İçe aktarma
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { Camera, useCameraDevices } from 'react-native-vision-camera';

import Auth from '../components/Auth';

import IkostResim from '../components/IkostResim';
import { useFocusEffect } from '@react-navigation/native';
import { urls } from '../config/apiUrls';
import { colors } from '../config/theme';

const HesapGuncelle = ({ route, navigation }) => {
  const [profileImage, setProfileImage] = useState(null);
  const { fetchTranslations, translate } = useContext(SepetContext);

  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [newsletter, setNewsletter] = useState(false);
  useEffect(() => {
    const checkSiparis = async () => {
      var username = await AsyncStorage.getItem('username');
      var ad = await AsyncStorage.getItem('ad');
      var soyad = await AsyncStorage.getItem('soyad');
      var telefon = await AsyncStorage.getItem('telefon');

      setUsername(username);
      setFirstName(ad === "-" ? "" : ad);
      setLastName(soyad === "-" ? "" : soyad);
      setPhone(telefon === "0(000) 000 00 00" ? "" : telefon);

      const storedProfileImage = await AsyncStorage.getItem('profileImage');
      if (storedProfileImage) {
        setProfileImage(storedProfileImage);
      }
    };
    checkSiparis();
  }, []);
  const handleRegister = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^0\(\d{3}\) \d{3} \d{2} \d{2}$/; // Telefon numarası formatı: 0(999) 999 99 99


    if (!firstName || !lastName || !phone) {
      ikostalert(translate('Uyarı'), translate('Lütfen tüm alanları doldurunuz.'));
      return;
    }

    // if (!phoneRegex.test(phone)) {
    //     ikostalert('Uyarı', 'Lütfen geçerli bir telefon numarası giriniz.');
    //     return;
    // }
    var username = await AsyncStorage.getItem('username');
    var memberID = await AsyncStorage.getItem('memberID');

    const newUser = {
      Ad: firstName,
      Soyad: lastName,
      Telefon: phone,
      Bulten: newsletter
    };

    const saveUserInfo = async (userDetails) => {
      try {
        const { ad, soyad, email, telefon, meslek, dtarih } = userDetails;
        await AsyncStorage.multiSet([
          ['ad', ad],
          ['soyad', soyad],
          ['email', email],
          ['telefon', telefon],
          ['meslek', meslek || ''],  // Eğer meslek bilgisi yoksa boş string kaydedilir
          ['dtarih', dtarih || '']   // Eğer doğum tarihi bilgisi yoksa boş string kaydedilir
        ]);
      } catch (error) {
        console.error('Bilgiler kaydedilirken bir hata oluştu:', error);
        throw error;
      }
    };

    try {
      const response = await Auth.post(`${urls.updateUye}`, newUser);
      const result = response.data;

      if (result.indexOf('tamam') > -1) {

        await saveUserInfo({
          ad: firstName,
          soyad: lastName,
          email: username,
          telefon: phone,
          meslek: null,
          dtarih: null
        });



        ikostalert(translate('Başarılı'), translate('Bilgileriniz başarıyla güncellenmiştir.'));


      } else {
        ikostalert(translate('Hata'), result);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };
  const openCamera = async () => {
    //bunun içinde ikostalert yapma yoksa çift ikostalert oluyor ve tüm ikostalertler patlıyor.
    const status = await Camera.requestCameraPermission();
    if (status !== 'authorized') {
      // Alert.alert('İzin Gerekli', 'Kamera izni vermeniz gerekmektedir.');
    }

    const options = {
      mediaType: 'photo',
      saveToPhotos: true,
    };

    const result = await launchCamera(options);

    if (result.didCancel) {
      console.log('Kullanıcı kamera kullanımını iptal etti.');
    } else if (result.errorCode) {
      console.error('Kamera hatası:', result.errorMessage);
      Alert.alert('Hata', 'Kamerayı açarken bir hata oluştu.');
    } else if (result.assets && result.assets.length > 0) {

      setProfileImage(result.assets[0].uri);
      await AsyncStorage.setItem('profileImage', result.assets[0].uri);
    }
  };
  const pickImageFromGallery = async () => {
    const options = {
      mediaType: 'photo',
      quality: 1,
    };
    launchImageLibrary(options, async (response) => {
      if (response.didCancel) {
        console.log('Kullanıcı galeriden seçimden vazgeçti');
      } else if (response.errorCode) {
        console.error('Galeriden seçim hatası: ', response.errorMessage);
      } else {
        // response.assets dizisinden ilk seçilen resmin uri'sini alıyoruz.
        const uri = response.assets && response.assets.length > 0 ? response.assets[0].uri : null;
        if (uri) {
          setProfileImage(uri);
          await AsyncStorage.setItem('profileImage', uri);
        }
      }
    });
  };

  const chooseImageOption = () => {
    ikostalert(
      translate('Profil Fotoğrafı'),
      translate('Fotoğrafınızı nasıl seçmek istersiniz?'),
      [
        { text: translate('Galeriden Seç'), onPress: pickImageFromGallery },
        { text: translate('Kamerayla Çek'), onPress: openCamera },
        { text: translate('İptal'), style: 'cancel' },
      ],
      { cancelable: true }
    );
  };

  const [showSuccessAlert, setShowSuccessAlert] = useState(route.params?.showSuccessAlert || false);

  return (
    <SafeAreaView style={stylesglobal.SafeAreaCSS}>
      <View style={stylesglobal.headerCustom}>
        <HeaderleftComp title={translate("Bilgilerim")} />
      </View>
      <ScrollView automaticallyAdjustKeyboardInsets={true}>



        <View style={styles.container}>

          {showSuccessAlert && (
            <View style={{
              backgroundColor: '#d4edda',
              borderColor: '#c3e6cb',
              borderWidth: 1,
              padding: 15,
              borderRadius: 8,
              marginBottom: 20,
              width: '100%',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <Text style={{ color: '#155724', flex: 1, fontFamily: 'NunitoSans-Regular', fontSize: 14 }}>
                {translate('Kaydınız başarıyla oluşturuldu ve giriş yapıldı. Lütfen şimdi bilgilerinizi güncelleyiniz.')}
              </Text>
              <TouchableOpacity onPress={() => setShowSuccessAlert(false)}>
                <Text style={{ color: '#155724', fontWeight: 'bold', marginLeft: 10 }}>X</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={{ justifyContent: 'center', alignItems: 'center', marginBottom: 20, position: 'relative' }}>
            <TouchableOpacity onPress={chooseImageOption} style={{
              height: 82, width: 82, borderRadius: 80,
              padding: 4, borderWidth: 0.5, borderColor: '#aaa'
            }}>
              <View style={{ height: 74, width: 74, backgroundColor: 'white', borderRadius: 74, justifyContent: 'center', alignItems: 'center' }}>
                {profileImage ? (
                  <Image source={{ uri: profileImage }} style={{ width: 74, height: 74, borderRadius: 74 }} />
                ) : (
                  <IkostResim source={require('../assets/images/foot_hesap.png')} width={30} />
                )}
              </View>
              <Image source={require('../assets/images/camera.png')}
                style={{ width: 32, height: 32, position: 'absolute', right: 0, bottom: 0 }} />
            </TouchableOpacity>


          </View>

          <View style={{ width: '100%' }}>
            <Text style={{
              color: 'black',
              fontFamily: 'NunitoSans-Bold',
              fontSize: 14, fontWeight: '700',
              marginBottom: 6,
              color: 'rgba(26, 26, 26, 255)',
            }}>{translate('Kullanıcı Adınız')} (<Text style={{
              color: 'black',
              fontFamily: 'NunitoSans-Bold',
              fontSize: 14, fontWeight: '400',
              marginBottom: 6,
              color: 'rgba(26, 26, 26, 255)',
            }}>{translate('değiştirilemez')}</Text>)</Text>
            <Text style={{
              backgroundColor: '#eee',
              color: '#777',
              padding: 10,
              paddingHorizontal: 14,
              fontSize: 16,
              marginBottom: 15,
              width: '100%',
              borderRadius: 12,
              borderWidth: 0,
            }}>{username}</Text>
          </View>
          <IkostTextInput title={translate("Adınız")} onChangeText={setFirstName} value={firstName} />
          <IkostTextInput title={translate("Soyadınız")} onChangeText={setLastName} value={lastName} />
          <IkostTextInput
            keyboardType='phone-pad'
            title={translate("Telefon Numaranız")}
            value={phone}
            mask={[
              '0', '(', /\d/, /\d/, /\d/, ')', ' ',
              /\d/, /\d/, /\d/, ' ',
              /\d/, /\d/, ' ',
              /\d/, /\d/
            ]}
            onChangeText={(text, rawText) => setPhone(text)}
          />

          <IkostButton title={translate("Güncelle")} onPress={handleRegister} style={{ width: '100%' }} />



          <View style={{ height: 50 }} />


        </View>

      </ScrollView>
      <View style={stylesglobal.footer}>
        <AnaFooter parametre={'Hesabım'} navigation={navigation} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
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
  }
});
export default HesapGuncelle;
