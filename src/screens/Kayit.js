import API_CONFIG from '../config/apiConfig';
import React, { useContext, useState, useRef } from 'react';
import {
    View, StyleSheet, ScrollView, Dimensions, Alert,
    TouchableOpacity, Text, Image, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import IkostTextInput from '../components/IkostTextInput';
import IkostButton from "../components/IkostButton";
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import stylesglobal from '../stylesglobal';
import EyeIcon from '../components/EyeIcon';
import BottomSheet from "react-native-gesture-bottom-sheet";
import { WebView } from 'react-native-webview';
import HeaderleftComp from '../components/HeaderleftComp';
import { ikostalert } from '../GlobalAlert';
import { SepetContext } from '../components/SepetContext'; // İçe aktarma
import Auth from '../components/Auth';
import InsiderEvents, { InsiderUser } from '../utils/InsiderHelper';
import messaging from '@react-native-firebase/messaging';
import { urls } from '../config/apiUrls';
import { colors } from '../config/theme';

const Kayit = ({ route, navigation }) => {
    const { fetchTranslations, translate, seciliDil } = useContext(SepetContext);

    const checkedIcon = require('../assets/images/checked.png');
    const uncheckedIcon = require('../assets/images/unchecked.png');
    const bottomSheet = useRef();
    const bottomSheet2 = useRef();
    const ekranYuksekligiFloat = Dimensions.get('window').height * 0.80;
    const ekranYuksekligiInt = Math.floor(ekranYuksekligiFloat);

    const [loading1, setLoading1] = useState(true);
    const [loading2, setLoading2] = useState(true);

    // route.params ile gelen (örneğin sosyal giriş) değerleri
    const [username, setUsername] = useState(route.params?.email || '');
    const [appleID, setappleID] = useState(route.params?.appleID || null);
    const [googleID, setgoogleID] = useState(route.params?.googleID || null);
    const [firstName, setFirstName] = useState(route.params?.ad || '');
    const [lastName, setLastName] = useState(route.params?.soyad || '');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [sozlesme, setSozlesme] = useState(true);
    const [newsletter, setNewsletter] = useState(true);
    const [passwordVisibility, setPasswordVisibility] = useState(true);

    const isSocialLogin = appleID || googleID;


    const handleRegister = async () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!sozlesme) {
            ikostalert(translate('Uyarı'), translate('Lütfen üyelik sözleşmesini onaylayınız.'));
            return;
        }

        let submitPassword = password;
        if (isSocialLogin) {
            // Backend requires a password, so we generate a strong one for social users
            // They won't need to know it as they use social login
            submitPassword = Math.random().toString(36).slice(-10) + "Aa1!" + Date.now();
        }

        if (!username || !firstName || !lastName || !phone) {
            ikostalert(translate('Uyarı'), translate('Lütfen tüm alanları doldurunuz.'));
            return;
        }

        if (!isSocialLogin && !submitPassword) {
            ikostalert(translate('Uyarı'), translate('Lütfen şifre belirleyiniz.'));
            return;
        }

        if (!emailRegex.test(username)) {
            ikostalert(translate('Uyarı'), translate('Lütfen geçerli bir e-posta adresi giriniz.'));
            return;
        }

        // Bu kısım telefon regex kontrolü ise açabilirsiniz:
        // if (!phoneRegex.test(phone)) {
        //     ikostalert('Uyarı', 'Lütfen geçerli bir telefon numarası giriniz.');
        //     return;
        // }


        const newUser = {
            Ad: firstName,
            Soyad: lastName,
            Email: username,
            Telefon: phone,
            Password: submitPassword,

            // Aşağıdakiler .NET tarafında modelde yoksa eklemeniz gerekir!
            appleID: appleID,
            googleID: googleID,
            bulten: newsletter
        };

        console.log("newUser => ", newUser);

        const saveUserInfo = async (userDetails) => {
            try {
                // .NET tarafı gerçekte hangi alanları döndürüyor?
                // Bu örnekte, kayıttan sonra dönen GUID'i userId olarak tutuyoruz.
                const { userId, ad, soyad, email, username, telefon } = userDetails;
                await AsyncStorage.multiSet([
                    ['appleID', appleID || ''],
                    ['googleID', googleID || ''],
                    ['userId', userId || ''],  // .NET'ten dönen GUID
                    ['ad', ad || ''],
                    ['soyad', soyad || ''],
                    ['email', email || ''],
                    ['username', username || ''],
                    ['telefon', telefon || '']
                ]);
            } catch (error) {
                console.error('Bilgiler kaydedilirken bir hata oluştu:', error);
                throw error;
            }
        };

        try {


            const response = await axios.post(`${API_CONFIG.authApi}/api/Auth/register`, newUser);

            const userId = response.data.userId;
            console.log("Kullanıcı kaydı alındı. userId:", userId);

            if (userId) {

                await saveUserInfo({
                    userId: userId,
                    ad: firstName,
                    soyad: lastName,
                    email: username,
                    username: username,
                    telefon: phone
                });

                await handleLogin(username, submitPassword);

                // Insider SDK - Sign Up Confirmation Event
                InsiderEvents.signUpConfirmation();

                const returnScreen = route.params?.returnScreen || 'HesabimNav';
                navigation.navigate(returnScreen);

            } else {
                ikostalert(translate('Hata!'), translate('Kullanıcı kaydı yapılamadı.'));
            }
        } catch (error) {
            console.error('Kayıt esnasında hata:', error);

            ikostalert('Hata', error?.response?.data?.message || 'Kayıt yapılırken hata oluştu.');
        }
    };

    const handleLogin = async (u, p) => {

        const loginser = {
            username: u,
            password: p
        };
        try {
            const response = await Auth.post(urls.login, loginser);
            console.log(response.data)
            const { accessToken, refreshToken, userID, ad, soyad, telefon } = response.data;
            await AsyncStorage.setItem('accessToken', accessToken);
            await AsyncStorage.setItem('refreshToken', refreshToken);
            await AsyncStorage.setItem('memberID', userID);
            await AsyncStorage.setItem('username', username);
            await AsyncStorage.setItem('ad', ad);
            await AsyncStorage.setItem('soyad', soyad);
            await AsyncStorage.setItem('telefon', telefon);
            await AsyncStorage.setItem('username', username);
            // await AsyncStorage.setItem('password', password);



            try {

                const token = await messaging().getToken();
                await Auth.post(`${API_CONFIG.authApi}/api/Auth/UyeCihazTokenGuncelle/`, { username: username, cihaztoken: token });
            } catch (error) {
                console.log("caihaz token alma hatası:" + error);
            }
            const emailValue = u || username;
            InsiderUser.login({
                id: userID,
                email: emailValue,
                name: `${ad || ''} ${soyad || ''}`.trim(),
                phone: telefon,
            });

        } catch (err) {
            console.log('Login hata:', err);
            ikostalert('API Giriş Hatası:' + err);
        }


    };

    const togglePasswordVisibility = () => {
        setPasswordVisibility(!passwordVisibility);
    };

    const toggleSozleseme = () => {
        setSozlesme(!sozlesme);
    };

    const toggleNewsletter = () => {
        setNewsletter(!newsletter);
    };

    return (
        <SafeAreaView style={stylesglobal.SafeAreaCSS}>
            <View style={stylesglobal.headerCustom}>
                <HeaderleftComp title={translate(isSocialLogin ? "Üyelik Bilgileriniz" : "Üye Kaydı")} />
            </View>
            <ScrollView automaticallyAdjustKeyboardInsets={true}>
                <View style={styles.container}>

                    <IkostTextInput
                        value={username}
                        title={translate("E-posta Adresi")}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        onChangeText={setUsername}
                    />

                    {!isSocialLogin && (
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
                    )}

                    <IkostTextInput
                        title={translate("Adınız")}
                        onChangeText={setFirstName}
                        value={firstName}
                    />

                    <IkostTextInput
                        title={translate("Soyadınız")}
                        onChangeText={setLastName}
                        value={lastName}
                    />

                    <IkostTextInput
                        keyboardType='phone-pad'
                        title={translate("Telefon Numaranız")}
                        mask={[
                            '0', '(', /\d/, /\d/, /\d/, ')', ' ',
                            /\d/, /\d/, /\d/, ' ',
                            /\d/, /\d/, ' ',
                            /\d/, /\d/
                        ]}
                        value={phone}
                        onChangeText={setPhone}
                    />

                    <View style={styles.chktouch}>
                        <TouchableOpacity style={styles.checkbox} onPress={() => toggleSozleseme()}>
                            <Image
                                source={sozlesme ? checkedIcon : uncheckedIcon}
                                style={styles.checkbox}
                            />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => bottomSheet.current.show()} style={{ flex: 1 }}>
                            <Text style={styles.label}>
                                {translate('KVKK ve Gizlilik Sözleşmesi okudum ve onaylıyorum.')}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.chktouch}>
                        <TouchableOpacity style={styles.checkbox} onPress={() => toggleNewsletter()}>
                            <Image
                                source={newsletter ? checkedIcon : uncheckedIcon}
                                style={styles.checkbox}
                            />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => bottomSheet2.current.show()} style={{ flex: 1, marginBottom: 10 }}>
                            <Text style={styles.label}>
                                {translate('İndirim ve duyurulardan eposta ve diğer yollarla haberdar olmak istiyorum ve bu yazıya tıklayarak ulaştığım Aydınlatma metni ve gizlilik politikası\'nı okudum ve onaylıyorum.')}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <IkostButton title={translate("Kayıt Ol")} onPress={handleRegister} style={{ width: '100%' }} />

                    <View style={{ height: 50 }} />
                </View>
            </ScrollView>

            {/* -------------- KVKK / Gizlilik Metni BottomSheet-1 -------------- */}
            <BottomSheet
                sheetBackgroundColor="white"
                hasDraggableIcon
                KeyboardAvoidingView
                ref={bottomSheet}
                height={ekranYuksekligiInt}
            >
                <View style={{
                    flex: 1,
                    justifyContent: 'flex-end',
                    backgroundColor: 'rgba(0, 0, 0, 0.5)'
                }}>
                    <View style={{
                        width: '100%',
                        height: '100%',
                        paddingHorizontal: 20,
                        paddingVertical: 20,
                        backgroundColor: 'white',
                        borderTopLeftRadius: 0,
                        borderTopRightRadius: 0
                    }}>
                        {loading1 && (
                            <ActivityIndicator size="large" color="green" style={{ marginTop: 40 }} />
                        )}
                        <WebView
                            onLoadEnd={() => setLoading1(false)}
                            key="sozlesme"
                            source={{ uri: urls.sayfaHtml('aydinlatma-metni-ve-gizlilik-politikasi', seciliDil) }}
                            style={{ flex: 1 }}
                            incognito={true}
                            cacheEnabled={false}
                        />
                    </View>
                </View>
            </BottomSheet>

            {/* -------------- Bülten / Aydınlatma Metni BottomSheet-2 -------------- */}
            <BottomSheet
                sheetBackgroundColor="white"
                hasDraggableIcon
                KeyboardAvoidingView
                ref={bottomSheet2}
                height={ekranYuksekligiInt}
            >
                <View style={{
                    flex: 1,
                    justifyContent: 'flex-end',
                    backgroundColor: 'rgba(0, 0, 0, 0.5)'
                }}>
                    <View style={{
                        width: '100%',
                        height: '100%',
                        paddingHorizontal: 20,
                        paddingVertical: 20,
                        backgroundColor: 'white',
                        borderTopLeftRadius: 0,
                        borderTopRightRadius: 0
                    }}>
                        {loading2 && (
                            <ActivityIndicator size="large" color="green" style={{ marginTop: 40 }} />
                        )}
                        <WebView
                            onLoadEnd={() => setLoading2(false)}
                            key="sozlesme2"
                            source={{ uri: urls.sayfaHtml('aydinlatma-metni-ve-gizlilik-politikasi', seciliDil) }}
                            style={{ flex: 1 }}
                            incognito={true}
                            cacheEnabled={false}
                        />
                    </View>
                </View>
            </BottomSheet>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingLeft: 25,
        paddingRight: 25,
        backgroundColor: colors.white,
        alignItems: "center",
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
    chktouch: {
        flexDirection: 'row',
        flex: 1,
        alignItems: 'flex-start',
        marginVertical: 7,
        width: '100%',
        paddingHorizontal: 10
    },
    title: {
        fontSize: 17,
        fontWeight: '700',
        marginBottom: 10,
        color: colors.black,
    },
    checkbox: {
        width: 24,
        height: 24,
        marginRight: 10
    },
    label: {
        fontSize: 12,
        fontFamily: 'NunitoSans-Regular',
        color: colors.black,
    }
});

export default Kayit;