import API_CONFIG from '../config/apiConfig';
import React, { useContext, useState, useRef, useEffect } from 'react';
import { Modal, Button, View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import IkostTextInput from '../components/IkostTextInput';
import IkostButton from "../components/IkostButton";
import IkostButton2 from "../components/IkostButton2";
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import stylesglobal from '../stylesglobal';
import EyeIcon from '../components/EyeIcon';
import Auth from '../components/Auth';
import BottomSheet from "react-native-gesture-bottom-sheet";
import messaging from '@react-native-firebase/messaging';
import HeaderleftComp from '../components/HeaderleftComp';
import { ikostalert } from '../GlobalAlert';
import { WebView } from 'react-native-webview';
import { SepetContext } from '../components/SepetContext'; // İçe aktarma

// Apple ile giriş için importlar
import appleAuth, { AppleAuthRequestScope, AppleAuthRequestOperation } from '@invertase/react-native-apple-authentication';
import { AppleButton } from '@invertase/react-native-apple-authentication';



// Facebook ile giriş için importlar (react-native-fbsdk-next)
import { LoginManager, AccessToken } from 'react-native-fbsdk-next';

// Google ile giriş için importlar (en güncel kütüphane: @react-native-google-signin/google-signin)
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';

// Insider SDK import
import { InsiderUser } from '../utils/InsiderHelper';
import FacebookEvents from '../utils/FacebookEvents';
import FirebaseEvents from '../utils/FirebaseEvents';
import { urls } from '../config/apiUrls';
import { colors } from '../config/theme';

const Giris = ({ route, navigation }) => {
  const { fetchTranslations, translate, seciliDil } = useContext(SepetContext);

  const [modalVisible, setModalVisible] = useState(false);
  const [sozlesmeview, setsozlesmeview] = useState(false);
  const [unutview, setunutview] = useState(false);

  const [rememberEposta, setRememberEposta] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [memberID, setmemberID] = useState(null);
  const Url = `${API_CONFIG.frontendApi}/api/Home/`;
  const [passwordVisibility, setPasswordVisibility] = useState(true);
  const bottomSheet = useRef();
  const ekranYuksekligiFloat = Dimensions.get('window').height * 0.80;
  const ekranYuksekligiInt = Math.floor(ekranYuksekligiFloat); // Aşağı yuvarlar

  useEffect(() => {
    //// https://console.cloud.google.com/apis/credentials?project=371501346518 dan yönet
    GoogleSignin.configure({
      webClientId: '371501346518-r2khe29n92n6p7mmm45g4hba6uqg553k.apps.googleusercontent.com',
      iosClientId: '371501346518-q3uj48ebjcd1su9advrg2ev63kj8g3ja.apps.googleusercontent.com',
    });
  }, []);

  const saveUserInfo = async (userDetails) => {
    try {
      const { memberID, username, ad, soyad, email, telefon, accessToken, refreshToken } = userDetails;
      await AsyncStorage.multiSet([
        ['memberID', memberID],
        ['username', username],
        ['ad', ad],
        ['soyad', soyad],
        ['email', email],
        ['telefon', telefon],
        ['accessToken', accessToken || ''],
        ['refreshToken', refreshToken || '']
      ]);
    } catch (error) {
      console.error('Bilgiler kaydedilirken bir hata oluştu:', error);
      throw error;
    }
  };

  const checkfAV = async () => {
    const memberID = await AsyncStorage.getItem('memberID');
    if (memberID) {
      const response = await Auth.post(`${urls.favorilerim}`, {
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      });
      await AsyncStorage.setItem('favoriListesi', JSON.stringify(response.data));
    }
  };

  const handleLogin = async () => {

    try {
      const response = await Auth.post(urls.login, {
        username: username,
        password: password
      });
      const { accessToken, refreshToken, userID, ad, soyad, telefon } = response.data;
      console.log(response.data);
      await AsyncStorage.setItem('accessToken', accessToken);
      await AsyncStorage.setItem('refreshToken', refreshToken);
      await AsyncStorage.setItem('memberID', userID);
      await AsyncStorage.setItem('username', username);
      await AsyncStorage.setItem('ad', ad);
      await AsyncStorage.setItem('soyad', soyad);
      await AsyncStorage.setItem('telefon', telefon);
      await AsyncStorage.setItem('username', username);
      // await AsyncStorage.setItem('password', password);

      console.log('accessToken: ' + accessToken);
      console.log('refreshToken: ' + refreshToken);
      console.log('userID: ' + userID);

      try {

        const token = await messaging().getToken();
        await Auth.post(`${API_CONFIG.authApi}/api/UyeUpdate/UyeCihazTokenGuncelle/`, { Sifre: token });
      } catch (error) {
        console.log("caihaz token alma hatası:" + error);
      }
      setmemberID(userID);
      InsiderUser.login({
        id: userID,
        email: username,
        name: `${ad || ''} ${soyad || ''}`.trim(),
        phone: telefon,
      });
      FacebookEvents.logLogin('email');
      FirebaseEvents.logLogin('email');

      checkfAV();
      const returnScreen = route.params?.returnScreen || 'AnaNav';
      navigation.navigate(returnScreen);

    } catch (err) {
      console.log('Login hata:', err);
      if (err.response && err.response.status === 401) {
        ikostalert(translate('Giriş Hatası'), translate('Giriş bilgileriniz hatalıdır.'));
      } else {
        ikostalert('API Giriş Hatası:' + err);
      }
    }




  };

  const rememberaction = async () => {
    try {
      console.log(rememberEposta);
      const sonuc = await Auth.post(urls.sendPasswordReset, { Username: rememberEposta }, {
        headers: { 'Content-Type': 'application/json' }
      });
      console.log(sonuc.data);

      if (sonuc.data === "no") {
        console.log("Kullanıcı yok.");
        ikostalert(translate("Hata!"), translate("Bu e-posta adresiyle kayıtlı kullanıcı bulunamadı."));
      } else if (sonuc.data === "hata") {
        console.log("Bilinmeyen hata oluştu.");
        ikostalert(translate("Hata!"), translate("Bir hata oluştu. Lütfen tekrar deneyin."));
      } else {
        ikostalert(translate("Başarılı"), translate("Şifre sıfırlama linki e-posta adresinize gönderildi. Lütfen e-postanızı kontrol edin."));
        setRememberEposta(null);
        bottomSheet.current.close();

      }
    } catch (error) {
      console.log(error);
      ikostalert('API Giriş Hatası:' + error);
    }
  };

  const togglePasswordVisibility = () => {
    setPasswordVisibility(!passwordVisibility);
  };

  const handleAppleLogin = async () => {
    try {
      const appleAuthRequestResponse = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
      });
      const credentialState = await appleAuth.getCredentialStateForUser(appleAuthRequestResponse.user);

      if (credentialState === appleAuth.State.AUTHORIZED) {
        const { user, email, identityToken, fullName } = appleAuthRequestResponse;
        console.log(user);
        if (!identityToken) {
          ikostalert("Apple Kimlik Doğrulama Hatası", "Kimlik doğrulama başarısız.");
          return;
        }

        if (fullName) {
          firstName = fullName.givenName ? fullName.givenName : "";
          lastName = fullName.familyName ? fullName.familyName : "";
        }

        let finalEmail = email;

        // Helper to extract email from JWT token if Apple doesn't return it explicitly (subsequent logins)
        const getEmailFromToken = (token) => {
          try {
            if (!token) return null;
            const parts = token.split('.');
            if (parts.length !== 3) return null;
            const payload = parts[1];
            // Base64Url to Base64
            const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
            // Decode
            // React Native 0.75+ should support atob globally or we use a polyfill logic if needed.
            // If atob is not available, this catch block will handle it.
            const decodedString = atob(base64);
            const json = JSON.parse(decodedString);
            return json.email || null;
          } catch (e) {
            console.log("Token decode error:", e);
            return null;
          }
        };

        // If email is missing, try to recover it from identityToken
        if (!finalEmail && identityToken) {
          const recoveredEmail = getEmailFromToken(identityToken);
          if (recoveredEmail) {
            console.log("Recovered email from token:", recoveredEmail);
            finalEmail = recoveredEmail;
          }
        }


        //const firebaseToken = await messaging().getToken();

        const model = {
          email: finalEmail,
          ad: firstName,
          soyad: lastName,
          clientid: user,
          company: 'apple'//bu olunca appleID den soruyor db de, yoksa yine de appleID den!

        };

        const sonuc = await Auth.post(`${API_CONFIG.authApi}/api/SosyalGiris/SosyalLogin`, model, {
          headers: { 'Content-Type': 'application/json' }
        });

        console.log(sonuc.data);

        if (sonuc.data.userId === "0" || sonuc.data.userId === "" || !sonuc.data.userId) {
          // New User Detected: Auto-Register
          console.log("New User Detected. Attempting Auto-Registration...");

          const dummyPhone = "0(000) 000 00 00";
          const randomPassword = Math.random().toString(36).slice(-10) + "Aa1!" + Date.now();

          const newUser = {
            Ad: firstName || "-",
            Soyad: lastName || "-",
            Email: finalEmail,
            Telefon: dummyPhone,
            Password: randomPassword,
            appleID: user,
            bulten: true
          };

          try {
            // Use the same register endpoint as Kayit.js
            const registerResponse = await Auth.post(`${API_CONFIG.authApi}/api/Auth/register`, newUser);
            const registerData = registerResponse.data;

            if (registerData.userId && registerData.userId !== "0") {
              console.log("Auto-Registration Successful:", registerData.userId);

              // Save info to behave as logged in
              await saveUserInfo({
                memberID: registerData.userId,
                username: finalEmail, // username is email
                ad: newUser.Ad,
                soyad: newUser.Soyad,
                email: finalEmail,
                telefon: dummyPhone,
                accessToken: registerData.accessToken || "", // Check if register returns token, usually it does or we might need to login. 
                // If register doesn't return tokens, we might need to call login immediately. 
                // Let's assume standard auth flow: Register -> Login or Register returns Token.
                // Looking at Kayit.js, it calls handleLogin after register. 
                // Let me check Kayit.js again... it calls handleLogin(username, submitPassword).
                // So we should do that too.
              });

              // Authenticate to get tokens
              const loginResponse = await Auth.post(urls.login, {
                username: finalEmail,
                password: randomPassword
              });

              const { accessToken, refreshToken, userID, ad, soyad, telefon } = loginResponse.data;

              // Re-save with full token data
              await saveUserInfo({
                memberID: userID,
                username: finalEmail,
                ad: ad,
                soyad: soyad,
                email: finalEmail,
                telefon: telefon,
                accessToken: accessToken,
                refreshToken: refreshToken
              });

              InsiderUser.login({
                id: userID,
                email: finalEmail,
                name: `${ad} ${soyad}`,
                phone: telefon,
              });

              FacebookEvents.logLogin('apple');
              FirebaseEvents.logLogin('apple');
              checkfAV();

              // Redirect logic
              const returnScreen = route.params?.returnScreen;
              if (returnScreen && returnScreen !== 'AnaNav') {
                // If there is a specific return screen (e.g. from Cart), go there.
                navigation.navigate(returnScreen);
              } else {
                // Otherwise (standard login), go to Profile Update to fix phone number
                navigation.navigate('HesapGuncelleNav', { showSuccessAlert: true });
              }

            } else {
              throw new Error("Registration returned invalid ID");
            }

          } catch (regError) {
            console.log("Auto-Registration Failed:", regError);
            // Fallback to manual registration screen
            const returnScreen = route.params?.returnScreen || 'AnaNav';
            navigation.navigate('KayitNav', { returnScreen: returnScreen, email: finalEmail, ad: firstName, soyad: lastName, appleID: user });
          }

        } else {
          await saveUserInfo({
            memberID: sonuc.data.userId,
            username: sonuc.data.userName,
            ad: sonuc.data.ad,
            soyad: sonuc.data.soyad,
            email: sonuc.data.userName,
            telefon: sonuc.data.telefon,
            accessToken: sonuc.data.accessToken,
            refreshToken: sonuc.data.refreshToken,
          });
          try {
            const token = await messaging().getToken();
            await Auth.post(`${API_CONFIG.authApi}/api/UyeUpdate/UyeCihazTokenGuncelle/`,
              { Sifre: token }, {
              headers: { 'Content-Type': 'application/json' }
            });
          } catch (error) {
            console.log("token alma hatası:" + error);
          }
          InsiderUser.login({
            id: sonuc.data.userId,
            email: sonuc.data.userName,
            name: `${sonuc.data.ad || ''} ${sonuc.data.soyad || ''}`.trim(),
            phone: sonuc.data.telefon,
          });
          FacebookEvents.logLogin('apple');
          FirebaseEvents.logLogin('apple');
          checkfAV();
          const returnScreen = route.params?.returnScreen || 'AnaNav';
          navigation.navigate(returnScreen);
        }
      }
    } catch (error) {
      ikostalert("Apple Giriş Hatası", error.message);
    }
  };

  // Facebook ile giriş: Graph API üzerinden kullanıcı verilerini alıyoruz.
  const fetchFacebookUserData = async (accessToken) => {
    const response = await fetch(`https://graph.facebook.com/me?fields=id,email,first_name,last_name&access_token=${accessToken}`);
    return response.json();
  };



  // Google ile giriş fonksiyonu: en güncel @react-native-google-signin/google-signin kütüphanesi kullanılarak
  const handleGoogleLogin = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();


      const { email, givenName, familyName, id } = userInfo.data.user;

      let firebaseToken = "";
      try {
        firebaseToken = await messaging().getToken();

      } catch (error) {
        console.log("token alma hatası:" + error);
      }

      const model = {
        email: email,
        ad: givenName,
        soyad: familyName,
        clientid: id, // Google tarafından verilen kullanıcı ID'si
        // company: 'google'//bu olunca googleID den soruyor db de, yoksa appleID den!
      };

      // Log idToken just in case we need it later
      console.log("Google idToken:", userInfo.data.idToken);

      console.log("Sending Google Login Model (Axios):", JSON.stringify(model));

      const sonuc = await axios.post(`${API_CONFIG.authApi}/api/SosyalGiris/SosyalLogin`, model, {
        headers: { 'Content-Type': 'application/json' }
      });

      console.log("Google Login Response Status:", sonuc.status);
      console.log("Google Login Response Data:", JSON.stringify(sonuc.data));

      if (sonuc.data.userId === "0" || sonuc.data.userId === "" || !sonuc.data.userId) {
        const returnScreen = route.params?.returnScreen || 'AnaNav';
        navigation.navigate('KayitNav', { returnScreen: returnScreen, email: email, ad: givenName, soyad: familyName, googleID: id });
      } else {
        await saveUserInfo({
          memberID: sonuc.data.userId,
          username: sonuc.data.userName,
          ad: sonuc.data.ad,
          soyad: sonuc.data.soyad,
          email: sonuc.data.userName,
          telefon: sonuc.data.telefon,
          accessToken: sonuc.data.accessToken,
          refreshToken: sonuc.data.refreshToken,
        });
        try {
          const token = await messaging().getToken();
          await Auth.post(`${API_CONFIG.authApi}/api/UyeUpdate/UyeCihazTokenGuncelle/`, { Sifre: token });
        } catch (error) {
          console.log("token alma hatası:" + error);
        }
        InsiderUser.login({
          id: sonuc.data.userId,
          email: sonuc.data.userName,
          name: `${sonuc.data.ad || ''} ${sonuc.data.soyad || ''}`.trim(),
          phone: sonuc.data.telefon,
        });
        FacebookEvents.logLogin('google');
        FirebaseEvents.logLogin('google');
        checkfAV();
        const returnScreen = route.params?.returnScreen || 'AnaNav';
        navigation.navigate(returnScreen);
      }
    } catch (error) {
      console.log("Google Sign-In Full Error:", JSON.stringify(error, null, 2));
      console.log("Error code:", error.code);
      console.log("Error message:", error.message);

      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        ikostalert("Google Giriş İptali", "Google girişi iptal edildi.");
      } else if (error.code === statusCodes.IN_PROGRESS) {
        ikostalert("Google Giriş", "Google girişi zaten devam ediyor.");
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        ikostalert("Google Giriş Hatası", "Google Play Servisleri mevcut değil.");
      } else {
        console.log("Google Giriş Hatası", error);
        ikostalert("Google Giriş Hatası", `Hata: ${error.code || 'Bilinmiyor'} - ${error.message || 'Detay yok'}`);
      }
    }
  };

  return (
    <SafeAreaView style={stylesglobal.SafeAreaCSS}>
      <View style={stylesglobal.headerCustom}>
        <HeaderleftComp title={translate("Giriş Yap")} />
      </View>
      <ScrollView automaticallyAdjustKeyboardInsets={true} style={{ backgroundColor: 'white' }}>
        <View>
          {memberID ? (
            <View style={styles.container3}>
              <Text>{translate('Hoşgeldiniz.')}</Text>
            </View>
          ) : (
            <>
              <View style={styles.container}>
                <IkostTextInput
                  title={translate("E-posta Adresi")}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  onChangeText={setUsername}
                />

                <View style={styles.containerX}>
                  <IkostTextInput
                    title={translate("Şifre")}
                    secureTextEntry={passwordVisibility}
                    onChangeText={setPassword}
                  />
                  <TouchableOpacity onPress={togglePasswordVisibility} style={styles.eye}>
                    <EyeIcon isOpen={passwordVisibility} />
                  </TouchableOpacity>
                </View>
                <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'flex-end' }}>
                  <TouchableOpacity onPress={() => (bottomSheet.current.show(), setunutview(true), setsozlesmeview(false))}
                    style={{ paddingBottom: 5, paddingRight: 5, marginBottom: 10 }}>
                    <Text style={{ textAlign: 'right', fontFamily: 'NunitoSans-Regular', fontSize: 12 }}>
                      {translate('Şifremi Unuttum')}
                    </Text>
                  </TouchableOpacity>
                </View>
                <IkostButton title={translate("GİRİŞ")} onPress={handleLogin} style={{ width: '100%' }} />

                <Text style={{ marginTop: 10 }}>{translate('veya')}</Text>



                {/* Sadece iOS cihazlarda Apple ile giriş butonu */}
                {Platform.OS === 'ios' && (
                  <View style={{ marginTop: 15, width: '100%' }}>
                    <TouchableOpacity
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '100%',
                        height: 50,
                        backgroundColor: 'black',
                        borderRadius: 6,
                        paddingHorizontal: 10,
                      }}
                      onPress={handleAppleLogin}
                    >
                      <Image
                        source={require('../assets/images/apple_logo.png')}
                        style={{ width: 20, height: 20, resizeMode: 'contain', marginRight: 10 }}
                      />
                      <Text style={{ color: 'white', fontSize: 13, fontFamily: 'NunitoSans-Regular' }}>
                        {translate('Apple İle Giriş Yap')}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Facebook ile giriş butonu (örnek, istenirse aktif edilebilir) */}
                {/*    <View style={{ marginTop: 15, width: '100%'}}>
                  <TouchableOpacity
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '100%',
                      height: 50,
                      backgroundColor: '#3b5998',
                      borderRadius: 6,
                      paddingHorizontal: 10,
                    }}
                    onPress={handleFacebookLogin}
                  >
                    <Image
                      source={require('../assets/images/facebook-logo-white.png')}
                      style={{ width: 20, height: 20, resizeMode: 'contain', marginRight: 10 }}
                    />
                    <Text style={{ color: 'white', fontSize: 13, fontFamily: 'NunitoSans-Regular' }}>
                      {translate('Facebook İle Giriş Yap')}
                    </Text>
                  </TouchableOpacity>
                </View> */}

                {/* Sadece Android cihazlarda Google ile giriş butonu */}
                {Platform.OS === 'android' && (
                  <View style={{ marginTop: 15, width: '100%' }}>
                    <TouchableOpacity
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '100%',
                        height: 50,
                        backgroundColor: '#DB4437',
                        borderRadius: 6,
                        paddingHorizontal: 10,
                        marginBottom: 7,
                      }}
                      onPress={handleGoogleLogin}
                    >
                      <Image
                        source={require('../assets/images/google-logo.png')}
                        style={{ width: 20, height: 20, resizeMode: 'contain', marginRight: 10 }}
                      />
                      <Text style={{ color: 'white', fontSize: 13, fontFamily: 'NunitoSans-Regular' }}>
                        {translate('Google İle Giriş Yap')}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
                <TouchableOpacity onPress={() => (bottomSheet.current.show(), setunutview(false), setsozlesmeview(true))} style={{ flex: 1, paddingRight: 15 }}>
                  <Text style={{ color: 'gray', fontFamily: 'NunitoSans-Regular', fontSize: 12, marginVertical: 10 }}
                  >{translate('Sosyal medya hesaplarımla giriş yaparak hesaplarımın Gizlilik politikası\'na uygun şekilde bağlanmasını kabul ediyorum.')}
                  </Text>
                </TouchableOpacity>


                <IkostButton2
                  title={translate("Üye Kayıt")}
                  onPress={() => navigation.navigate("KayitNav", { returnScreen: route.params?.returnScreen })}
                />
                <View style={{ height: 50 }} />
              </View>
            </>
          )}
        </View>
      </ScrollView>
      <Modal
        animationType="slide" // "none", "slide" veya "fade" seçenekleri mevcut
        transparent={true}   // Modal arka planın transparan olup olmayacağını belirler
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)} // Android için gerekli, geri tuşuyla kapatma
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text> </Text>
            <Button title="Kapat" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>
      <BottomSheet
        sheetBackgroundColor="white"
        hasDraggableIcon
        KeyboardAvoidingView
        ref={bottomSheet}
        height={ekranYuksekligiInt}
      >
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          {unutview && <View
            style={{
              width: '100%',
              height: '100%',
              paddingHorizontal: 20,
              paddingVertical: 20,
              backgroundColor: 'white',
              borderTopLeftRadius: 0,
              borderTopRightRadius: 0,
            }}
          >
            <IkostTextInput
              placeholder={translate("E-posta adresi")}
              autoCapitalize="none"
              title={translate("E-posta Adresi")}
              autoFocus={true}
              value={rememberEposta}
              onChangeText={setRememberEposta}
            />
            <IkostButton title={translate("Sıfırlama Linki Gönder")} onPress={rememberaction} />
          </View>}
          {sozlesmeview && <View
            style={{
              width: '100%',
              height: '100%',
              paddingHorizontal: 20,
              paddingVertical: 20,
              backgroundColor: 'white',
              borderTopLeftRadius: 0,
              borderTopRightRadius: 0,
            }}
          >

            <WebView
              key="sozlesme1"
              source={{ uri: urls.sayfaHtml('aydinlatma-metni-ve-gizlilik-politikasi', seciliDil) }}
              style={{ flex: 1 }}
              incognito={true}
              cacheEnabled={false}
            />
          </View>}
        </View>
      </BottomSheet>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    paddingLeft: 25,
    paddingRight: 25,
    backgroundColor: colors.white,
    alignItems: "center",
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    elevation: 5
  },
  container3: {
    flex: 1,
    paddingTop: 40,
    paddingBottom: 40,
    paddingLeft: 25,
    paddingRight: 25,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  containerX: {
    position: 'relative',
    width: '100%'
  },
  eye: {
    position: 'absolute',
    right: 10,
    top: 30
  },
  image: {
    marginBottom: 40,
  },
  forgot_button: {
    height: 30,
    marginBottom: 30,
  }
});

export default Giris;