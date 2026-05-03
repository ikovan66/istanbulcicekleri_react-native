import API_CONFIG from '../config/apiConfig';
// Hesabim.js
import React, { useContext, useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, Image, StyleSheet, TouchableOpacity, Alert } from 'react-native';
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
import Auth from '../components/Auth';
import { InsiderUser } from '../utils/InsiderHelper';
import { colors } from '../config/theme';

const Hesabim = ({ navigation, route }) => {
  const { fetchTranslations, translate } = useContext(SepetContext);
  const { language, setLanguage, kur, setKur, aktifDiller } = useContext(SepetContext);

  const [username, setUsername] = useState('');
  const [ad, setAd] = useState('');
  const [soyad, setSoyad] = useState('');
  const [telefon, setTelefon] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const Url = `${API_CONFIG.frontendApi}/api/`;

  useEffect(() => {
    const loadUserData = async () => {
      const username = await AsyncStorage.getItem('username');
      const ad = await AsyncStorage.getItem('ad');
      const soyad = await AsyncStorage.getItem('soyad');
      const telefon = await AsyncStorage.getItem('telefon');
      setUsername(username);
      setAd(ad);
      setSoyad(soyad);
      setTelefon(telefon);

      const storedProfileImage = await AsyncStorage.getItem('profileImage');
      if (storedProfileImage) {
        setProfileImage(storedProfileImage);
      }
    };
    loadUserData();
  }, []);

  // Ekran tekrar odaklandığında (örneğin kamera ekranından döndüğümüzde) parametre ile gelen resmi güncelle
  useFocusEffect(
    useCallback(() => {
      if (route.params?.capturedImage) {
        setProfileImage(route.params.capturedImage);
        AsyncStorage.setItem('profileImage', route.params.capturedImage);
      }
    }, [route.params])
  );

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
      'Profil Fotoğrafı',
      'Fotoğrafınızı nasıl seçmek istersiniz?',
      [
        { text: 'Galeriden Seç', onPress: pickImageFromGallery },
        { text: 'Kamerayla Çek', onPress: () => navigation.navigate('CameraScreenNav') },
        { text: 'İptal', style: 'cancel' },
      ],
      { cancelable: true }
    );
  };

  const clearAllData = async () => {
    try {
      InsiderUser.logout();
      const dilStored = await AsyncStorage.getItem('dil');
      const kurStored = await AsyncStorage.getItem('kur');

      await AsyncStorage.clear();

      if (dilStored) await AsyncStorage.setItem('dil', dilStored);
      if (kurStored) await AsyncStorage.setItem('kur', kurStored);

      console.log('Tüm veriler silindi.');
      navigation.navigate("Onboarding");
    } catch (e) {
      console.error('Verileri silerken hata oluştu:', e);
    }
  };

  const deleteMembership = async () => {
    try {
      const username = await AsyncStorage.getItem('username');
      const memberID = await AsyncStorage.getItem('memberID');



      const response = await Auth.post(`${API_CONFIG.authApi}/api/UyeUpdate/DeleteUser`);
      const result = response.data;

      if (result.indexOf('tamam') > -1) {
        ikostalert('Silindi', 'Üyeliğiniz silinmiştir.');

        const dilStored = await AsyncStorage.getItem('dil');
        const kurStored = await AsyncStorage.getItem('kur');
        InsiderUser.logout();
        await AsyncStorage.clear();

        if (dilStored) await AsyncStorage.setItem('dil', dilStored);
        if (kurStored) await AsyncStorage.setItem('kur', kurStored);

        navigation.navigate("Onboarding");
      } else {
        ikostalert(translate('Hata'), result);
      }
    } catch (e) {
      console.error('Verileri silerken hata oluştu:', e);
    }
  };

  async function cikis() {
    ikostalert(
      translate('Çıkış'),
      translate('Çıkış yapmak istediğinizden emin misiniz?'),
      [
        { text: translate('Evet'), onPress: clearAllData },
        { text: translate('Vazgeç') },
      ],
      { cancelable: true }
    );
  }

  async function uyeliksil() {
    ikostalert(
      translate('Üyelik Silmek'),
      translate('Üyeliğinizi silmek istediğinizden emin misiniz? Dikkat: Silme işlemi geri alınamaz.'),
      [
        { text: translate('Evet'), onPress: deleteMembership },
        { text: translate('Vazgeç') },
      ],
      { cancelable: true }
    );
  }

  return (
    <SafeAreaView style={stylesglobal.SafeAreaCSS}>
      <View style={stylesglobal.headerCustom}>
        <HeaderleftComp title={translate("Hesabım")} />
      </View>
      <View style={stylesglobal.container}>
        <ScrollView style={styles.container}>
          <View style={styles.orderBlock}>
            <View style={styles.row1}>
              {/* Profil fotoğrafı alanı */}
              <View style={{ height: 82, width: 82, borderRadius: 80, padding: 4, marginBottom: 10, borderWidth: 0.5, borderColor: '#aaa' }}>
                <View style={{ height: 74, width: 74, backgroundColor: 'white', borderRadius: 74, justifyContent: 'center', alignItems: 'center' }}>
                  {profileImage ? (
                    <Image source={{ uri: profileImage }} style={{ width: 74, height: 74, borderRadius: 74 }} />
                  ) : (
                    <IkostResim source={require('../assets/images/foot_hesap.png')} width={30} />
                  )}
                </View>
              </View>
              <Text style={styles.title}>{translate('Merhaba')} {ad} {soyad}</Text>
            </View>
            <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('HesapGuncelleNav')}>
              {/* <IkostResim source={require('../assets/images/teslimpersonICON.png')} width={20} style={styles.itemIMG}/>     */}
              <Text style={styles.itemText}>{translate('Üyelik Bilgilerim')}</Text>
              <SagOk />
            </TouchableOpacity>

            {aktifDiller.length > 1 && (
            <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('DilSecimiNav')}>
              <Text style={styles.itemText}>{translate('Dil Seçimi')}</Text>
              <SagOk />
            </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('FavorilerimNav')}>
              {/* <IkostResim source={require('../assets/images/uye_kalp.png')} width={20} style={styles.itemIMG}/>     */}
              <Text style={styles.itemText}>{translate('Favorilerim')}</Text>
              <SagOk />
            </TouchableOpacity>
            <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('SiparislerimNav')}>
              {/* <IkostResim source={require('../assets/images/uye_sepet.png')} width={20} style={styles.itemIMG}/>     */}
              <Text style={styles.itemText}>{translate('Siparişlerim')}</Text>
              <SagOk />
            </TouchableOpacity>

            <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('AdreslerimNav')}>
              {/* <IkostResim source={require('../assets/images/uye_loc.png')} width={20} style={styles.itemIMG}/>     */}
              <Text style={styles.itemText}>{translate('Adreslerim')}</Text>
              <SagOk />
            </TouchableOpacity>


          {/*   <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('HizliOdemelerimNav')}>
              <IkostResim source={require('../assets/images/uye_hizliodeme.png')} width={20} style={styles.itemIMG}/>    
              <Text style={styles.itemText}>{translate('Hızlı Ödemelerim')}</Text>
              <SagOk />
            </TouchableOpacity> */}


            {/* <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('HatirlatmalarimNav')}>
            <IkostResim source={require('../assets/images/uye_saat.png')} width={20} style={styles.itemIMG}/>    
              <Text style={styles.itemText}>{translate('Hatırlatmalarım')}</Text>
              <SagOk />
            </TouchableOpacity> */}

            <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('SifreYenileNav')}>
              {/* <IkostResim source={require('../assets/images/uye_sifre.png')} width={20} style={styles.itemIMG}/>     */}
              <Text style={styles.itemText}>{translate('Şifremi Güncelle')}</Text>
              <SagOk />
            </TouchableOpacity>


            <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('BizeContactNav')}>
              {/* <IkostResim source={require('../assets/images/uye_sor.png')} width={20} style={styles.itemIMG}/>     */}
              <Text style={styles.itemText}>{translate('Bize Ulaşın')}</Text>
              <SagOk />
            </TouchableOpacity>

            <TouchableOpacity style={styles.row} onPress={() => cikis()}>
              {/* <IkostResim source={require('../assets/images/uye_cikis.png')} width={20} style={styles.itemIMG}/>     */}
              <Text style={styles.itemText}>{translate('Çıkış Yap')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.row} onPress={() => uyeliksil()}>
              <View style={{
                width: 20, height: 20, borderRadius: 20, borderColor: colors.textSecondary,
                borderWidth: 1, justifyContent: 'center', alignItems: 'center', marginRight: 20, display: 'none'
              }}>
                <IkostResim source={require('../assets/images/kapat.png')} width={10} />
              </View>
              <Text style={styles.itemText}>{translate('Üyeliğimi Sil')}</Text>
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
    backgroundColor: 'white',
    padding: 15, paddingVertical: 13,
    paddingLeft: 30,
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
  itemIMG: {
    marginRight: 20
  },
  itemText2: {
    textAlign: 'left',
    flex: 1,
    fontSize: 14,
    fontFamily: 'NunitoSans-Regular', color: 'black'
  },
  label: {
    fontWeight: 'bold',
    fontFamily: 'NunitoSans-Bold',
    width: 140, color: 'black'
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
    textAlign: 'right', color: 'black'
  },
  image: {
    width: 50,
    height: 50,
    marginRight: 10,
  },
});

export default Hesabim;