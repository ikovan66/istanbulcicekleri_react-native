import 'react-native-gesture-handler';
import React, { useEffect, useRef, useState } from 'react';
import API_CONFIG from './src/config/apiConfig';
import setupGlobalInterceptors from './src/config/axiosConfig';
import { preloadIcons } from './src/components/DynamicIcon';

// Multi-tenant API interceptor'ları başlat
setupGlobalInterceptors();
import { Alert, PermissionsAndroid, Platform } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Anasayfa from "./src/screens/Anasayfa";
import Arama from "./src/screens/Arama";
import BasketView from './src/screens/Sepet';
import SepetTeslim from './src/screens/SepetTeslim';
import SepetFatura from './src/screens/SepetFatura';
import SepetOdeme from './src/screens/SepetOdeme';
import SepetViewOdeme from './src/screens/SepetViewOdeme';
import Giris from './src/screens/Giris';
import Kayit from './src/screens/Kayit';
import SepetEkurunler from './src/screens/SepetEkurunler';
import SepetKartNotlar from './src/screens/SepetKartNotlar';
import UrunSayfa from './src/screens/Urun';
import KategoriSayfa from './src/screens/KategoriSayfa';
import Kategori from './src/screens/Kategori';
import FiltrePop from './src/components/FiltrePop';
import { SepetProvider } from './src/components/SepetContext';
import OnboardingScreen from './src/screens/OnboardingScreen';

import CameraScreen from './src/screens/CameraScreen';
import Siparis from './src/screens/Sparis';
import Siparislerim from './src/screens/Sparislerim';
import Adreslerim from './src/screens/Adreslerim';
import HizliOdemelerim from './src/screens/HizliOdemelerim';
import Hesabim from './src/screens/Hesabim';
import HesapGuncelle from './src/screens/HesapGuncelle';
import SifreYenile from './src/screens/SifreYenile';
import Favorilerim from './src/screens/Favorilerim';
import Contact from './src/screens/Contact';
import { requestTrackingPermission } from 'react-native-tracking-transparency';
import analytics from '@react-native-firebase/analytics';
import GlobalAlertContainer from './src/components/GlobalAlertContainer';
import { setAlertRef, alert } from './src/GlobalAlert';
import BizeSorun from './src/screens/BizeSorun';
import BizeYazin from './src/screens/BizeYazin';
import BizeContact from './src/screens/BizeContact';
import Hatirlatmalarim from './src/screens/Hatirlatmalarim';
import ReminderForm from './src/screens/ReminderForm';
import DilSecimi from './src/screens/DilSecimi';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

import { Host, Portal } from 'react-native-portalize';
import RNInsider from 'react-native-insider';
import InsiderCallbackType from 'react-native-insider/src/InsiderCallbackType';
import InsiderEvents from './src/utils/InsiderHelper';
import { linkingConfig } from './src/utils/DeeplinkConfig';
import { handleInsiderDeeplink } from './src/utils/DeeplinkHandler';
import { checkForUpdate } from './src/utils/VersionCheck';
import ForceUpdateModal from './src/components/ForceUpdateModal';
import OtaUpdater from './src/utils/OtaUpdater';
import { Settings } from 'react-native-fbsdk-next';


//npx react-native run-ios --simulator=“iPhone 16”
//npx react-native run-ios --device
//npm install ....
//cd ios && pod install && cd ..
//cd android && ./gradlew assembleRelease
//ViewPropTypes RNCamera.js de yorum satırı yap!!!!!!
//
//node_moules yeniden kurma:
//1: rm -rf node_modules/
//2: rm package-lock.json
//3: npm install
//
//xcode product>archive
//xcode windows>orginizer


//# 1. Proje dizinine git
//cd /Users/murat/Heryerbitki2026

//# 2. Bundle + Zip + Hash tek seferde
//npx react-native bundle --platform ios --dev false --entry-file index.js --bundle-output ota_js_only.jsbundle && \
//ZIPNAME="ota_js_only_$(date +%Y%m%d_%H%M%S).zip" && \
//zip $ZIPNAME ota_js_only.jsbundle && \
//echo "Dosya: $ZIPNAME" && \
//echo "Hash: $(shasum -a 256 $ZIPNAME | cut -d' ' -f1)"

//INSERT INTO OtaBundles (Version, Platform, BundlePath, Hash, IsMandatory, Description, IsActive)
//VALUES (
//    '1.0.1',
//    'ios',
//    'ota_bundle_20251231_211614.zip',
//    '19990497ef2957a678ad338c7eedf7ef27cdbf7c147c412ca830714f07bc4eaa',
//    1,
//    'İndirim kodu tüm checkout adımlarına eklendi, ödeme formundan kart sahibi adı kaldırıldı',
//    1
//);

const Stack = createNativeStackNavigator();
const INSIDER_GDPR_STORAGE_KEY = '@app/insider_gdpr_consent';
const INSIDER_CCPA_STORAGE_KEY = '@app/insider_ccpa_consent';

async function requestNotificationPermission() {
  try {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    InsiderEvents.setPushNotificationPermission(enabled);

    if (enabled) {
      console.log('Authorization status:', authStatus);
    } else {
      console.log('Notification permission not granted');
    }

    return enabled;
  } catch (error) {
    console.error('[Insider] Notification permission request failed', error);
    InsiderEvents.setPushNotificationPermission(false);
    return false;
  }
}

async function syncInsiderConsents() {
  try {
    const [storedGdprConsent, storedCcpaConsent] = await Promise.all([
      AsyncStorage.getItem(INSIDER_GDPR_STORAGE_KEY),
      AsyncStorage.getItem(INSIDER_CCPA_STORAGE_KEY),
    ]);

    const gdprConsent = storedGdprConsent !== 'false';
    const ccpaConsent = storedCcpaConsent !== 'false';

    InsiderEvents.setGDPRConsent(gdprConsent);
    InsiderEvents.setCCPAConsent(ccpaConsent);
  } catch (error) {
    console.error('[Insider] Failed to sync consent preferences', error);
  }
}
async function requestTracking() {
  const trackingStatus = await requestTrackingPermission();
  if (trackingStatus === 'authorized' || trackingStatus === 'unavailable') {
    console.log('Tracking authorized or unavailable');
    await analytics().setAnalyticsCollectionEnabled(true);
  } else {
    console.log('Tracking denied. trackingStatus:' + trackingStatus);
    await analytics().setAnalyticsCollectionEnabled(false);
  }
}
global.toTitleCase = (str) => {
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};
function App() {

  const navigationRef = useRef(null);
  const alertContainerRef = useRef();

  // Force Update State
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateInfo, setUpdateInfo] = useState({
    forceUpdate: false,
    updateMessage: '',
    storeUrl: '',
    latestVersion: '',
  });


  useEffect(() => {
    // npx react-native start --experimental-debugger
    // npm run debug

    // Pre-load dynamic icons (non-blocking)
    preloadIcons();

    const initializeApp = async () => {
      // 0. Önce versiyon kontrolü yap (Store güncellemesi için)
      console.log('[App] Checking for updates...');
      const versionCheck = await checkForUpdate();
      if (versionCheck.needsUpdate) {
        console.log('[App] Update available:', versionCheck);
        setUpdateInfo({
          forceUpdate: versionCheck.forceUpdate,
          updateMessage: versionCheck.updateMessage,
          storeUrl: versionCheck.storeUrl,
          latestVersion: versionCheck.latestVersion,
        });
        setShowUpdateModal(true);

        // Zorunlu güncelleme ise burada dur, uygulama başlatmayı engelle
        if (versionCheck.forceUpdate) {
          console.log('[App] Force update required, stopping app initialization');
          return;
        }
      }

      // 0.5 OTA Bundle Kontrolü (JavaScript güncellemeleri için)
      // Debug modda OTA kontrolü yapma - simülatörde eski bundle indirilmesini önler
      if (!__DEV__) {
        try {
          console.log('[App] Checking for OTA updates...');
          const otaCheck = await OtaUpdater.checkForUpdate();
          if (otaCheck.hasUpdate && otaCheck.bundleUrl && otaCheck.version) {
            console.log('[App] OTA update available:', otaCheck.version);

            // Bundle'ı indir
            const downloadResult = await OtaUpdater.downloadBundle(
              otaCheck.bundleUrl,
              otaCheck.version,
              (progress: number) => console.log('[OTA] Download progress:', progress + '%')
            );

            if (downloadResult.success) {
              console.log('[App] OTA bundle downloaded, will apply on next restart');
              // Zorunlu güncelleme ise hemen uygula
              if (otaCheck.isMandatory) {
                await OtaUpdater.applyUpdate();
                // Uygulama yeniden başlatılacak
              }
            }
          } else {
            console.log('[App] No OTA update available');
          }

          // Eski bundle'ları temizle
          await OtaUpdater.cleanupOldBundles(2);
        } catch (otaError) {
          console.log('[App] OTA check failed:', otaError);
          // OTA hatası uygulamayı engellemez
        }
      } else {
        console.log('[App] Skipping OTA check in DEV mode');
      }

      // 1. Önce push notification izni al
      console.log('[App] Requesting notification permission...');
      const pushEnabled = await requestNotificationPermission();
      console.log('[App] Notification permission result:', pushEnabled);

      // 1.1 Firebase topic subscription (toplu push gönderim için)
      if (pushEnabled) {
        try {
          await messaging().subscribeToTopic('all');
          console.log('[App] Subscribed to "all" topic for broadcast push');
        } catch (topicError) {
          console.log('[App] Topic subscription failed:', topicError);
        }
      }

      // 1.1 Facebook SDK Başlat
      try {
        Settings.initializeSDK();
        console.log('[App] Facebook SDK Initialized');
      } catch (e) {
        console.log('[App] Facebook SDK Initialization Error:', e);
      }


      // 2. Insider SDK — merkezi on/off kontrolü
      if (API_CONFIG.insider.enabled) {
        console.log('[App] Initializing Insider SDK...');
        RNInsider.init(
          API_CONFIG.insider.partnerName,
          API_CONFIG.insider.appGroupId,
          (type, data) => {
            switch (type) {
              case InsiderCallbackType.NOTIFICATION_OPEN:
                console.log('[INSIDER][NOTIFICATION_OPEN]: ', data);
                // Deeplink navigation from push notification
                if (navigationRef.current) {
                  handleInsiderDeeplink(data, navigationRef.current);
                }
                break;
              case InsiderCallbackType.INAPP_BUTTON_CLICK:
                console.log('[INSIDER][INAPP_BUTTON_CLICK]: ', data);
                break;
              case InsiderCallbackType.TEMP_STORE_PURCHASE:
                console.log('[INSIDER][TEMP_STORE_PURCHASE]: ', data);
                break;
              case InsiderCallbackType.TEMP_STORE_ADDED_TO_CART:
                console.log('[INSIDER][TEMP_STORE_ADDED_TO_CART]: ', data);
                break;
              case InsiderCallbackType.TEMP_STORE_CUSTOM_ACTION:
                console.log('[INSIDER][TEMP_STORE_CUSTOM_ACTION]: ', data);
                break;
            }
          },
        );

        // Enable In-App Messages Explicitly
        console.log('[App] Enabling Insider In-App Messages...');
        RNInsider.enableInAppMessages();

        // 3. Push izni alındıysa Insider'a kaydet
        if (pushEnabled) {
          console.log('[App] Registering for push notifications with Insider...');
          RNInsider.registerWithQuietPermission(false);

          // 4. Foreground Push View - Uygulama ön plandayken push banner göster
          console.log('[App] Enabling foreground push view...');
          RNInsider.setActiveForegroundPushView();
        } else {
          console.log('[App] Push permission not granted, skipping Insider push registration');
        }

        syncInsiderConsents();
      } else {
        console.log('[App] Insider SDK is DISABLED');
      }
      await requestTracking();

      // Check if app was opened from a deep link natively (Android cold start)
      const { handleInitialDeeplink } = require('./src/utils/DeeplinkHandler');
      handleInitialDeeplink(navigationRef.current);
    };

    initializeApp();

    setAlertRef(alertContainerRef.current);

    // FCM onMessage handler — foreground'da push geldiğinde
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      console.log('[App] FCM foreground message received:', JSON.stringify(remoteMessage));

      // iOS'ta tüm push'ları native tarafta işle (AppDelegate willPresentNotification)
      if (Platform.OS === 'ios') {
        console.log('[App] iOS - Letting native handle foreground push');
        return;
      }

      // Android — foreground'da push bildirimini Alert ile göster
      const title = remoteMessage?.notification?.title || 'Bildirim';
      const body = remoteMessage?.notification?.body || '';
      const deeplink = remoteMessage?.data?.deeplink || remoteMessage?.data?.url || remoteMessage?.data?.link;

      Alert.alert(
        title,
        body,
        deeplink && navigationRef.current
          ? [
              { text: 'Kapat', style: 'cancel' },
              {
                text: 'Görüntüle',
                onPress: async () => {
                  const { navigateFromUrl } = require('./src/utils/DeeplinkHandler');
                  await navigateFromUrl(deeplink, navigationRef.current);
                },
              },
            ]
          : [{ text: 'Tamam' }]
      );
    });

    // FCM background message handler
    messaging().setBackgroundMessageHandler(async remoteMessage => {
      console.log('[App] FCM background message:', remoteMessage);
    });

    // FCM push tıklama — uygulama background'dayken
    const unsubscribeNotificationOpened = messaging().onNotificationOpenedApp(async remoteMessage => {
      console.log('[App] FCM push tapped (background):', JSON.stringify(remoteMessage));

      const deepLinkUrl = remoteMessage?.data?.deeplink ||
                          remoteMessage?.data?.url ||
                          remoteMessage?.data?.link;

      if (deepLinkUrl && navigationRef.current) {
        const { navigateFromUrl } = require('./src/utils/DeeplinkHandler');
        await navigateFromUrl(deepLinkUrl, navigationRef.current);
      }
    });

    // FCM push tıklama — uygulama tamamen kapalıyken (cold start)
    messaging()
      .getInitialNotification()
      .then(async remoteMessage => {
        if (remoteMessage) {
          console.log('[App] FCM push opened app from quit state:', JSON.stringify(remoteMessage));

          const deepLinkUrl = remoteMessage?.data?.deeplink ||
                              remoteMessage?.data?.url ||
                              remoteMessage?.data?.link;

          if (deepLinkUrl) {
            // Cold start'ta navigation hazır olmayabilir, kısa gecikme
            setTimeout(async () => {
              if (navigationRef.current) {
                const { navigateFromUrl } = require('./src/utils/DeeplinkHandler');
                await navigateFromUrl(deepLinkUrl, navigationRef.current);
              }
            }, 1500);
          }
        }
      });

    return () => {
      unsubscribe();
      unsubscribeNotificationOpened();
    };
  }, []);


  return (
    <SepetProvider>
      <GlobalAlertContainer ref={alertContainerRef} />
      <ForceUpdateModal
        visible={showUpdateModal}
        forceUpdate={updateInfo.forceUpdate}
        updateMessage={updateInfo.updateMessage}
        storeUrl={updateInfo.storeUrl}
        latestVersion={updateInfo.latestVersion}
        onClose={() => setShowUpdateModal(false)}
      />
      <Host>
        <NavigationContainer
          ref={navigationRef}
          linking={linkingConfig}
          onReady={() => {
            console.log('[Navigation] Navigation is ready');
          }}
          onStateChange={(state) => {
            console.log('[Navigation] State changed');
          }}
        >
          <Stack.Navigator
            screenOptions={{
              headerTintColor: '#9C8D7D',
            }}
          >

            <Stack.Screen name="Onboarding" component={OnboardingScreen}
              options={{ headerShown: false }} />

            <Stack.Screen
              name="AnaNav"
              options={{ headerShown: false }}
              component={Anasayfa}
            />

            <Stack.Screen
              name="AramaNav"
              options={{ headerShown: false, animation: 'none' }}
              component={Arama}
            />

            <Stack.Screen
              name="KategoriListNav"
              options={{
                headerShown: false, headerTitle: 'Kategoriler', headerBackTitleVisible: false, headerBackVisible: false
              }}
              component={KategoriSayfa}
            />

            <Stack.Screen
              name="SepetNav"
              options={{
                headerShown: false, headerTitle: 'Sepetim', headerBackTitleVisible: false
              }}
              component={BasketView}
            />
            <Stack.Screen
              name="SepetTeslimNav"
              options={{
                headerShown: true, headerTitle: 'Teslim Bilgileri', headerBackTitleVisible: false
              }}
              component={SepetTeslim}
            />
            <Stack.Screen
              name="SepetFaturaNav"
              options={{
                headerShown: false, headerTitle: 'Fatura Bilgileri', headerBackTitleVisible: false
              }}
              component={SepetFatura}
            />
            <Stack.Screen
              name="SepetOdemeNav"
              options={{
                headerShown: false, headerTitle: 'Ödeme', headerBackTitleVisible: false
              }}
              component={SepetOdeme}
            />
            <Stack.Screen
              name="SepetViewOdemeNav"
              options={{
                headerShown: true, headerTitle: 'Ödeme', headerBackTitleVisible: false
              }}
              component={SepetViewOdeme}
            />
            <Stack.Screen
              name="GirisNav"
              options={{
                headerShown: false, headerTitle: 'Kullanıcı Girişi', headerBackTitleVisible: false
              }}
              component={Giris}
            />
            <Stack.Screen
              name="HesabimNav"
              options={{
                headerShown: false, headerTitle: 'Hesabım', headerBackTitleVisible: false, headerBackVisible: true
              }}
              component={Hesabim}
            />
            <Stack.Screen
              name="FavorilerimNav"
              options={{
                headerShown: false, headerTitle: 'Favorilerim', headerBackTitleVisible: false, headerBackVisible: true
              }}
              component={Favorilerim}
            />
            <Stack.Screen
              name="HesapGuncelleNav"
              options={{
                headerShown: false, headerTitle: 'Bilgilerimi Güncelle', headerBackTitleVisible: false
              }}
              component={HesapGuncelle}
            />
            <Stack.Screen
              name="SifreYenileNav"
              options={{
                headerShown: false, headerTitle: 'Şifremi Güncelle', headerBackTitleVisible: false
              }}
              component={SifreYenile}
            />
            <Stack.Screen
              name="CameraScreenNav"
              options={{
                headerShown: false, headerTitle: 'Kamera', headerBackTitleVisible: false
              }}
              component={CameraScreen}
            />
            <Stack.Screen
              name="SiparisNav"
              options={{
                headerShown: false, headerTitle: 'Sipariş Bilgisi', headerBackTitleVisible: false
              }}
              component={Siparis}
            />
            <Stack.Screen
              name="SiparislerimNav"
              options={{
                headerShown: false, headerTitle: 'Siparişleriniz', headerBackTitleVisible: false
              }}
              component={Siparislerim}
            />
            <Stack.Screen
              name="KayitNav"
              options={{
                headerShown: false, headerTitle: 'Üye Kaydı', headerBackTitleVisible: false
              }}
              component={Kayit}
            />
            <Stack.Screen
              name="SepetEkurunlerNav"
              options={{
                headerShown: false, headerTitle: 'Ek Ürünler', headerBackTitleVisible: false
              }}
              component={SepetEkurunler}
            />
            <Stack.Screen
              name="SepetKartNotlarNav"
              options={{
                headerShown: false, headerTitle: 'Kart Notları', headerBackTitleVisible: false
              }}
              component={SepetKartNotlar}
            />
            <Stack.Screen
              name="UrunNav"
              component={UrunSayfa}
              options={{
                headerShown: false,
                headerTitle: '',
                headerTintColor: 'black',
                headerBackTitleVisible: false
              }}
            />
            <Stack.Screen
              name="AdreslerimNav"
              options={{
                headerShown: false, headerTitle: 'Adreslerim', headerBackTitleVisible: false
              }}
              component={Adreslerim}
            />
            <Stack.Screen
              name="HizliOdemelerimNav"
              options={{
                headerShown: false, headerTitle: 'Hızlı Ödemelerim', headerBackTitleVisible: false
              }}
              component={HizliOdemelerim}
            />

            <Stack.Screen
              name="BizeSorunNav"
              options={{
                headerShown: false, headerTitle: 'Bize Sorun', headerBackTitleVisible: false
              }}
              component={BizeSorun}
            />
            <Stack.Screen
              name="BizeContactNav"
              options={{
                headerShown: false, headerTitle: 'İletişim Bilgilerimiz', headerBackTitleVisible: false
              }}
              component={BizeContact}
            />
            <Stack.Screen
              name="BizeYazinNav"
              options={{
                headerShown: false, headerTitle: 'Bize Yazın', headerBackTitleVisible: false
              }}
              component={BizeYazin}
            />

            <Stack.Screen
              name="HatirlatmalarimNav"
              options={{
                headerShown: false, headerTitle: 'Hatırlatmalarım', headerBackTitleVisible: false
              }}
              component={Hatirlatmalarim}
            />


            <Stack.Screen
              name="ReminderFormNav"
              options={{
                headerShown: false, headerTitle: 'ReminderForm', headerBackTitleVisible: false
              }}
              component={ReminderForm}
            />

            <Stack.Screen
              name="DilSecimiNav"
              options={{
                headerShown: false, headerTitle: 'Dil Seçimi', headerBackTitleVisible: false
              }}
              component={DilSecimi}
            />



            <Stack.Screen name="KategoriNav" component={Kategori} options={{
              headerShown: false,
            }} />
            <Stack.Screen name="FiltrePopNav" component={FiltrePop}
              options={{
                animation: 'slide_from_bottom',
                presentation: 'modal',
                headerBackVisible: false,
                headerTintColor: 'black',
                title: 'Filtre',
              }} />
          </Stack.Navigator>
        </NavigationContainer>
      </Host>

    </SepetProvider>
  );
}

export default App;
