import API_CONFIG from '../config/apiConfig';
import React, { useContext, useState, useRef, useLayoutEffect, useEffect, useCallback } from 'react';
import {
  FlatList,
  TouchableOpacity, View, Dimensions, Button, StyleSheet, Text,
  ScrollView, Alert, ActivityIndicator, Image, Switch
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import { WebView } from 'react-native-webview';
import stylesglobal from '../stylesglobal';
import IkostButton from '../components/IkostButton';
import { SvgXml } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SepetContext } from '../components/SepetContext'; // İçe aktarma
import IkostTextInput from '../components/IkostTextInput';
import BottomSheet from "react-native-gesture-bottom-sheet";
import { ikostalert } from '../GlobalAlert';
import IkostResim from '../components/IkostResim';
import HeaderleftComp from '../components/HeaderleftComp';
import LottieView from 'lottie-react-native';
import Auth from '../components/Auth';
import InsiderEvents from '../utils/InsiderHelper';
import FacebookEvents from '../utils/FacebookEvents';
import FirebaseEvents from '../utils/FirebaseEvents';
import { urls } from '../config/apiUrls';
import { colors } from '../config/theme';
import { convertPriceString } from '../utils/priceFormatter';

const SepetOdeme = ({ navigation, route }) => {
  const [sepettitle, setsepettitle] = useState('Ödeme');
  const { translate, sepetSayisi, language, setLanguage, kur, setKur, setSepetSayisi, sepetTutari, activeCurrency } = useContext(SepetContext);
  const [isLoadingREFRESH, setisLoadingREFRESH] = useState(false);

  const [paymentStatus, setPaymentStatus] = useState(null);
  const [contractHtml, setContractHtml] = useState(null);
  const [showCreditCardWebView, setshowCreditCardWebView] = useState(false);
  const [webViewKey, setWebViewKey] = useState(0);
  const [loading1, setLoading1] = useState(false);
  const [loading2, setLoading2] = useState(false);
  const [loading, setLoading] = useState(false);
  const [aktiftab, setaktiftab] = useState(1);
  // 3DS state (yeni payment.ikost.com akışı)
  const [show3DS, setShow3DS] = useState(false);
  const [threeDSHtml, setThreeDSHtml] = useState('');
  const Url = `${API_CONFIG.frontendApi}/api/`;
  const [sozlesmeOnaylandi, setSozlesmeOnaylandi] = useState(false);
  const [hizliOnaylandi, sethizliOnaylandi] = useState(false);
  const [odemeadimi, setodemeadimi] = useState(false);
  const [ad, setAd] = useState('');
  const [kartNo, setKartNo] = useState('');
  const [tarihAy, setTarihAy] = useState('');
  const [tarihYil, setTarihYil] = useState('');
  const [ccv, setCcv] = useState('');
  const [ucdsend, setucdsend] = useState(null); // legacy - artık show3DS kullanılıyor
  const [bankalar, setbankalar] = useState(null);
  const [secilenbanka, setsecilenbanka] = useState(null);
  const { username, code } = route.params;
  const bottomSheet = useRef();
  const ekranYuksekligiFloat = Dimensions.get('window').height * .80;
  const ekranYuksekligiInt = Math.floor(ekranYuksekligiFloat); // Aşağı yuvarlar
  const [kredikartlar, setKredikartlar] = useState(null);
  const [kartlargoster, setkartlargoster] = useState(false);
  const [secilenkart, setsecilenkart] = useState(null);
  const [geneltoplam, setgeneltoplam] = useState(sepetTutari.replace('.', ','));

  // WebView crash fix - refs ve mounted state
  const webViewRef = useRef(null);
  const sozlesmeWebViewRef = useRef(null);
  const isMountedRef = useRef(true);

  // Cleanup effect - WebView safe unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      // WebView'leri güvenli şekilde durdur
      if (webViewRef.current) {
        webViewRef.current.stopLoading();
      }
      if (sozlesmeWebViewRef.current) {
        sozlesmeWebViewRef.current.stopLoading();
      }
    };
  }, []);

  // Safe state setter - prevents state updates after unmount
  const safeSetState = useCallback((setter, value) => {
    if (isMountedRef.current) {
      setter(value);
    }
  }, []);


  const [installments, setInstallments] = useState(null);
  const [selectedInstallment, setSelectedInstallment] = useState(null);
  const [is2d, setIs2d] = useState(true);
  // 3DS polling ref
  const pollTimerRef = useRef(null);
  const orderCompletedRef = useRef(false);

  // Taksit oranlarını payment.ikost.com'dan çek
  const fetchInstallments = async () => {
    try {
      // Toplam tutarı parse et
      let amount = 0;
      if (sepetTutari && sepetTutari.toplam) {
        let cleanPrice = typeof sepetTutari.toplam === 'string'
          ? sepetTutari.toplam.replace(' TL', '').replace('€ ', '').replace('$ ', '').replace(/\./g, '').replace(',', '.')
          : sepetTutari.toplam;
        amount = parseFloat(cleanPrice) || 0;
      }
      if (amount <= 0) return;

      const response = await axios.get(urls.mobileInstallments(amount));
      const data = response.data;

      if (data.rates && data.rates.length > 0) {
        // payment API formatını eski formata dönüştür
        const formatted = data.rates.map(r => ({
          InstallmentNumber: r.installment,
          MonthlyAmount: r.monthlyAmount > 0 ? `${r.monthlyAmount.toFixed(2)} TL` : '-',
          AmountToBePaid: r.totalAmount > 0 ? `${r.totalAmount.toFixed(2)}` : geneltoplam,
          Rate: r.rate,
        }));
        setInstallments(formatted);
        setSelectedInstallment(formatted[0]);
      } else {
        setInstallments(null);
      }
    } catch (error) {
      console.log('Taksit oranları alınamadı:', error.message);
      setInstallments(null);
    }
  };

  // Mount'ta taksit oranlarını çek
  useEffect(() => {
    fetchInstallments();
  }, [sepetTutari]);

  useEffect(() => {
    selectedInstallment && setgeneltoplam(selectedInstallment.AmountToBePaid);
  }, [selectedInstallment]);

  const FlatInstallment = () => {
    return (<>
      <View style={{ paddingTop: 10, flex: 1, borderWidth: 1, borderRadius: 6, margin: 15, marginBottom: 5, borderColor: '#e6e6e6' }}>
        <View style={styles.tableHeader}>
          <View style={styles.headerCell}>
            <Text style={styles.headerText}>{translate('Taksit Sayısı')}</Text>
          </View>
          <View style={styles.headerCell}>
            <Text style={styles.headerText}>{translate('Aylık Ödeme')}</Text>
          </View>
        </View>

        <FlatList style={{ flex: 1 }}
          data={installments}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderInstallment}
        />
      </View>

    </>
    );
  }

  const renderInstallment = ({ item }) => {
    const isSelected = selectedInstallment === item;
    return (
      <TouchableOpacity
        style={[
          styles.tableRow,
          isSelected && styles.selectedRow
        ]}
        onPress={() => setSelectedInstallment(item)}
      >
        {/* Sol tarafta daire/radio butonu göstermek isterseniz */}
        <View style={styles.radioButtonContainer}>
          <View style={styles.radioButton2}>
            {isSelected && <View style={styles.radioButtonSelected} />}

          </View>
          <Text style={[styles.cellText, isSelected && styles.selectedText]}>
            {item.InstallmentNumber}
          </Text>
        </View>

        {/* Taksit Sayısı sütunu */}
        {/*      <View style={styles.tableCell}>
          <Text style={[styles.cellText, isSelected && styles.selectedText]}>
            {item.InstallmentNumber}
          </Text>
        </View> */}

        {/* Aylık Ödeme sütunu */}
        <View style={styles.tableCell}>
          <Text style={[styles.cellText, isSelected && styles.selectedText]}>
            {item.MonthlyAmount}
          </Text>
        </View>

        {/* Toplam Ödenecek Tutar sütunu (opsiyonel) */}
        {/*    <View style={styles.tableCell}>
          <Text style={[styles.cellText, isSelected && styles.selectedText]}>
            {item.AmountToBePaid} TL
          </Text>
        </View> */}
      </TouchableOpacity>
    );
  };


  const chk = `
  <svg width="24px" height="24px" viewBox="0 0 512.00 512.00" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill={colors.black}><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" stroke={colors.border} stroke-width="1.024"></g><g id="SVGRepo_iconCarrier"> <title>checkbox-component-unchecked</title> <g id="Page-1" stroke-width="0.00512" fill="none" fill-rule="evenodd"> <g id="drop" fill={colors.black} transform="translate(64.000000, 64.000000)"> <path d="M384,1.42108547e-14 L384,384 L1.42108547e-14,384 L1.42108547e-14,1.42108547e-14 L384,1.42108547e-14 Z M362.666667,21.3333333 L21.3333333,21.3333333 L21.3333333,362.666667 L362.666667,362.666667 L362.666667,21.3333333 Z" id="Combined-Shape"> </path> </g> </g> </g></svg>
    `;
  useEffect(() => {
    setLoading1(true);

    // Insider SDK - Checkout Started Event
    // Sepet bilgilerini route'dan veya context'ten al
    InsiderEvents.checkoutStarted([], code);

    // Facebook SDK - Initiate Checkout
    // We might not have full product details here easily without fetching cart again, 
    // but we have total amount from context/props usually.
    // For now, let's log the event. Ideally we need the total value.
    // We can use 'sepetTutari' from context if available and parsed.
    // Assuming context has 'sepetTutari' string e.g. "1.234,50 TL"

    if (sepetTutari && sepetTutari.toplam) {
      let price = 0;
      if (typeof sepetTutari.toplam === 'string') {
        let cleanPrice = sepetTutari.toplam.replace(' TL', '').replace('€ ', '').replace('$ ', '').replace(/\./g, '').replace(',', '.');
        price = parseFloat(cleanPrice);
      }
      FacebookEvents.logInitiateCheckout({
        totalPrice: price,
        currency: 'TRY',
        itemCount: sepetSayisi ? parseInt(sepetSayisi) : 0
      });
    }

  }, []);

  // cc.id = (int)dr["id"];
  // cc.baslik = dr["baslik"].ToString();
  // cc.adsoyad = dr["adsoyad"].ToString();
  // cc.last4char = dr["last4char"].ToString();
  // cc.mastervisa=(bool)dr["mastervisa"];

  useEffect(() => {
    const fetchKrediKartlar = async () => {
      try {
        const memberID = await AsyncStorage.getItem('memberID');
        if (memberID !== null) {
          var username1 = await AsyncStorage.getItem('username');
          const response = await Auth.post(
            urls.kredikartlarim
          );
          setKredikartlar(response.data);
        }
      } catch (error) {
        console.log('Hata oluştu: ', error);
      };
    };

    const verifyCartTotal = async () => {
      const code = await AsyncStorage.getItem('@code');
      if (code) {
        try {
          // Double check total from backend to ensure we don't carry over stale state
          const response = await axios.get(`${urls.sepetIzle}`, {
            params: { code: code }
          });
          if (response.data && response.data.uruntoplam) {
            console.log('SepetOdeme verified total:', response.data.uruntoplam);
            const backendTotal = response.data.uruntoplam;
            setSepetTutari(backendTotal);
            setgeneltoplam(backendTotal.replace('.', ',')); // Update displayed total!
          }
        } catch (error) {
          console.log('Error verifying cart total in SepetOdeme:', error);
        }
      }
    }

    fetchKrediKartlar();
    verifyCartTotal();
  }, []);

  const handleSozlesmeOnay = () => {
    setSozlesmeOnaylandi(!sozlesmeOnaylandi);
  };

  const fetchContractHtml = async () => {
    if (contractHtml) return; // already fetched
    try {
      const res = await axios.get(`${API_CONFIG.webBaseUrl}/api/page-content?path=mesafeli-satis-sozlesmesi`);
      if (res.data?.success && res.data?.html) {
        setContractHtml(res.data.html);
      }
    } catch (err) {
      console.log('Error fetching contract content:', err.message);
    }
  };
  const handlehizliOnay = () => {
    sethizliOnaylandi(!hizliOnaylandi);
  };
  const handleOdemeTamamla = () => {
    setPaymentStatus(null);
    if (!sozlesmeOnaylandi) {
      ikostalert("Sözleşmeyi Onaylamalısınız", "Lütfen sözleşmeyi onaylayınız.");
    } else if (kartNo === '' || tarihAy === '' || tarihYil === '' || ccv === '') {
      ikostalert("Eksik Bilgiler", "Lütfen tüm alanları doldurunuz.");
    } else {
      odemeCraftgate();
    }
  };

  // ──── YENİ ÖDEME AKIŞI: payment.ikost.com via NJ proxy ────
  async function odemeCraftgate() {
    setisLoadingREFRESH(true);
    orderCompletedRef.current = false;

    try {
      const memberID = await AsyncStorage.getItem('memberID');
      const userEmail = await AsyncStorage.getItem('username');

      if (!memberID) {
        setisLoadingREFRESH(false);
        ikostalert('Hata', 'Oturum bilgisi bulunamadı. Lütfen tekrar giriş yapın.');
        return;
      }

      // Toplam tutarı parse et
      let toplamFloat = 0;
      if (geneltoplam) {
        let cleanPrice = geneltoplam.toString().replace(' TL', '').replace('€ ', '').replace('$ ', '').replace(/\./g, '').replace(',', '.');
        toplamFloat = parseFloat(cleanPrice) || 0;
      }
      if (toplamFloat <= 0 && sepetTutari?.toplam) {
        let cleanPrice = sepetTutari.toplam.toString().replace(' TL', '').replace('€ ', '').replace('$ ', '').replace(/\./g, '').replace(',', '.');
        toplamFloat = parseFloat(cleanPrice) || 0;
      }

      // Fatura bilgilerini AsyncStorage'dan al (Iyzico customer/address için)
      const faturaAd = await AsyncStorage.getItem('faturaAd') || ad || 'Customer';
      const faturaTelefon = await AsyncStorage.getItem('faturaTelefon') || '';
      const faturaAdres = await AsyncStorage.getItem('faturaAdres') || 'Adres bilgisi girilmedi';

      // İsmi ad/soyad olarak ayır
      const nameParts = (faturaAd || ad || 'Customer').trim().split(/\s+/);
      const firstName = nameParts[0] || 'Customer';
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : firstName;

      const model = {
        domain: urls.paymentDomain,
        Code: code,
        ccv: ccv,
        kartno: kartNo.replace(/\s/g, ''),
        ay: tarihAy,
        yil: tarihYil,
        adsoyad: ad,
        taksit: selectedInstallment ? selectedInstallment.InstallmentNumber : 1,
        toplam: toplamFloat,
        customerEmail: userEmail || '',
        // Iyzico-specific: customer with identityNumber
        customer: {
          id: memberID || userEmail || '',
          name: firstName,
          surname: lastName,
          email: userEmail || 'customer@example.com',
          phone: faturaTelefon,
          identityNumber: '11111111111',
          city: 'Istanbul',
          country: 'Turkey',
          zipCode: '34000',
          registrationAddress: faturaAdres,
        },
        // Iyzico-specific: billing & shipping address
        billingAddress: {
          contactName: faturaAd,
          city: 'Istanbul',
          country: 'Turkey',
          address: faturaAdres,
          zipCode: '34000',
        },
        shippingAddress: {
          contactName: faturaAd,
          city: 'Istanbul',
          country: 'Turkey',
          address: faturaAdres,
          zipCode: '34000',
        },
        // Iyzico-specific: tek ürün olarak toplam tutarı gönder
        basketItems: [{
          id: code,
          name: 'Internet Urunu',
          category1: 'Genel',
          itemType: 'VIRTUAL',
          price: toplamFloat,
        }],
        paidPrice: toplamFloat,
        basketId: code,
      };

      console.log(`[Payment] Sending to NJ proxy: code=${code}, amount=${toplamFloat}`);

      const response = await axios.post(urls.mobilePayment, model, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 30000,
      });

      const data = response.data;
      setisLoadingREFRESH(false);

      if (data.redirectUrl) {
        // Hosted checkout (Paymennt) - WebView ile aç
        console.log('[Payment] Hosted checkout redirect');
        setThreeDSHtml('');
        setShow3DS(true);
        setucdsend(data.redirectUrl); // URL olarak kaydet
      } else if (data.requires3DS && data.threeDSHtml) {
        // 3DS doğrulama - HTML'i WebView'de göster
        console.log('[Payment] 3DS HTML received');
        setThreeDSHtml(data.threeDSHtml);
        setShow3DS(true);
        startPaymentPolling(); // Polling fallback başlat
      } else if (data.success) {
        // Direkt başarı
        console.log('[Payment] Direct success');
        await handlePaymentSuccess();
      } else {
        // Hata
        const errorMsg = data.error || 'Ödeme işlemi başarısız oldu.';
        setPaymentStatus(errorMsg);
      }
    } catch (error) {
      setisLoadingREFRESH(false);
      console.error('[Payment] Error:', error.message);
      const msg = error.response?.data?.error || 'Ödeme işlemi sırasında bir hata oluştu.';
      setPaymentStatus(msg);
    }
  }

  // Ödeme başarılı olduğunda
  const handlePaymentSuccess = async () => {
    if (orderCompletedRef.current) return;
    orderCompletedRef.current = true;
    stopPaymentPolling();
    await AsyncStorage.setItem('@sepetadet5', '0');
    setSepetSayisi('0');
    await AsyncStorage.removeItem('@code');
    if (isMountedRef.current) {
      navigation.navigate('SiparisNav', { Code: code, yeni: true });
    }
  };

  // 3DS polling fallback
  const startPaymentPolling = () => {
    stopPaymentPolling();
    let pollCount = 0;
    const maxPolls = 36; // 3 dakika (5sn aralık)

    // 10sn sonra başla
    pollTimerRef.current = setTimeout(() => {
      const interval = setInterval(async () => {
        pollCount++;
        if (orderCompletedRef.current || pollCount > maxPolls) {
          clearInterval(interval);
          return;
        }
        try {
          const res = await axios.get(urls.mobilePaymentStatus(code));
          const status = (res.data?.status || '').toLowerCase();
          console.log(`[3DS Poll #${pollCount}] Status: ${status}`);
          if (status === 'success') {
            clearInterval(interval);
            await handlePaymentSuccess();
          } else if (status === 'failed') {
            clearInterval(interval);
            safeSetState(setShow3DS, false);
            safeSetState(setThreeDSHtml, '');
            safeSetState(setPaymentStatus, 'Ödeme başarısız oldu.');
          }
        } catch (e) {
          console.log('[3DS Poll] Error:', e.message);
        }
      }, 5000);
    }, 10000);
  };

  const stopPaymentPolling = () => {
    if (pollTimerRef.current) {
      clearTimeout(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  };

  // Cleanup polling on unmount
  useEffect(() => {
    return () => stopPaymentPolling();
  }, []);
  const goBack = () => {
    navigation.goBack();

  }
  const handleTab2 = () => {
    setaktiftab(2);
    setucdsend(false);
  };
  useLayoutEffect(() => {
    setPaymentStatus(null);
    navigation.setOptions({

      // headerTitle: () => (


      // ), 
    });
  }, [aktiftab]);

  useEffect(() => {
    const fetchBankalar = async () => {
      try {

        const response = await axios.get(
          urls.bankalar
        );
        setbankalar(response.data);
        setsecilenbanka(response.data[0].ad);

      } catch (error) {
        console.log('Hata oluştu: ', error);
      };
    };
    fetchBankalar();
  }, []);

  const handleMessage = async (event) => {
    // Unmount durumunda işlem yapma
    if (!isMountedRef.current) return;

    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.success) {
        console.log('[Payment] 3DS callback success via postMessage');
        await handlePaymentSuccess();
      } else {
        safeSetState(setShow3DS, false);
        safeSetState(setThreeDSHtml, '');
        safeSetState(setucdsend, false);
        safeSetState(setPaymentStatus, 'Ödeme başarısız. ' + (data.hata || ''));
      }
    } catch (error) {
      console.log('WebView message parse error:', error);
    }
  };

  async function havaletamamla() {

    if (!sozlesmeOnaylandi) {
      ikostalert("Sözleşmeyi Onaylamalısınız", "Lütfen sözleşmeyi onaylayınız.");
    } else {

      setisLoadingREFRESH(true);

      var username = await AsyncStorage.getItem('username');
      var memberID = await AsyncStorage.getItem('memberID');

      const model = {
        banka: secilenbanka,
        code: code
      };
      const response = await Auth.post(`${API_CONFIG.basketApi}/api/SepetOdeme/SiparisTamamlaHavale/`, model);
      const result = response.data;
      console.log(result);
      if (result == "success") {
        await AsyncStorage.setItem('@sepetadet5', '0');
        setSepetSayisi('0');
        await AsyncStorage.removeItem('@code');
        navigation.navigate("SiparisNav", { Code: code, yeni: true });
      } else {
        setisLoadingREFRESH(false);
        ikostalert('Hata', result);
      }
    }


  }
  return (
    <SafeAreaView style={stylesglobal.SafeAreaCSS}>
      <View style={stylesglobal.headerCustom}>
        <HeaderleftComp title="Ödeme" />
      </View>
      <View style={{ flexDirection: 'row', backgroundColor: colors.background, padding: 6, paddingHorizontal: 10, paddingBottom: 8 }}>
        <TouchableOpacity
          style={aktiftab === 1 ? styles.aktifTouch : styles.pasifTouch}
          onPress={() => setaktiftab(1)}>
          <Text style={styles.textTouch}>{translate('Kredi Kartı')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={aktiftab === 2 ? styles.aktifTouch : styles.pasifTouch}
          onPress={() => handleTab2()}>
          <Text style={styles.textTouch}>{translate('Havale/Eft')}</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.container}>


        {aktiftab == 1 ? (<>{show3DS ? (<><View style={styles.cardPaymentContainer}>
          {loading2 && (
            <ActivityIndicator size="large" color="green" style={{ marginTop: 40 }} />
          )}
          <WebView
            ref={webViewRef}
            key={webViewKey}
            source={threeDSHtml ? { html: threeDSHtml } : { uri: typeof ucdsend === 'string' ? ucdsend : '' }}
            onMessage={handleMessage}
            onLoadStart={() => safeSetState(setLoading2, true)}
            onLoadEnd={() => safeSetState(setLoading2, false)}
            style={{ flex: 1 }}
            incognito={true}
            cacheEnabled={false}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            onError={(syntheticEvent) => {
              console.log('WebView error:', syntheticEvent.nativeEvent);
            }}
          />
        </View></>)
        : (<>{/* Kayıtlı kartlar şimdilik pasif */}
        
          {paymentStatus && <View style={{ padding: 15, backgroundColor: 'red', marginTop: 5, borderRadius: 6 }}>
            <Text style={{ color: 'white', fontFamily: 'NunitoSans-Regular', fontSize: 13 }}>{paymentStatus}</Text>
          </View>}

          {/* Kayıtlı kartlar bölümü - şimdilik pasif
          {kartlargoster && <View>...</View>}
          */}

          {!secilenkart && <View style={styles.cardPaymentContainer}>
            <IkostTextInput
              style={styles.input}
              title={translate("Kart Numarası")}
              keyboardType="numeric"
              mask={(text) => {
                const cleaned = text.replace(/\D+/g, '');
                // Amex kontrolü: ilk rakam 3 ise genelde Amex
                if (/^3[47]/.test(cleaned)) {
                  // American Express: 4-6-5 formatı (15 karakter)
                  return [
                    /\d/, /\d/, /\d/, /\d/, ' ',
                    /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, ' ',
                    /\d/, /\d/, /\d/, /\d/, /\d/,
                  ];
                } else {
                  // Visa, MasterCard vb: 4-4-4-4 formatı (16 karakter)
                  return [
                    /\d/, /\d/, /\d/, /\d/, ' ',
                    /\d/, /\d/, /\d/, /\d/, ' ',
                    /\d/, /\d/, /\d/, /\d/, ' ',
                    /\d/, /\d/, /\d/, /\d/,
                  ];
                }
              }}
              value={kartNo}
              onChangeText={setKartNo}
            />
            <View style={styles.dateCcvContainer}>
              <View style={{ flex: .25, paddingRight: 5 }}>

                <IkostTextInput
                  style={styles.input}
                  title={translate("Ay")}
                  keyboardType="numeric"
                  value={tarihAy}
                  onChangeText={setTarihAy}
                  maxLength={2}
                />
              </View>
              <View style={{ flex: .25, paddingRight: 5 }}>

                <IkostTextInput
                  style={styles.input}
                  title={translate("Yıl")}
                  keyboardType="numeric"
                  value={tarihYil}
                  onChangeText={setTarihYil}
                  maxLength={4}
                />
              </View>
              <View style={{ flex: .50 }}>

                <IkostTextInput
                  style={styles.input}
                  title="CCV"
                  keyboardType="numeric"
                  value={ccv}
                  onChangeText={setCcv}
                  maxLength={4}
                />
              </View>
            </View>

            {/* Hızlı ödeme kaydet - kayıtlı kartlar pasif olduğu için gizli
            <View style={styles.swcontainer2}>...</View>
            */}

            {installments && <FlatInstallment />}


          </View>}</>)}

        </>) : (null)}

        {aktiftab == 2 && bankalar && bankalar.map((banka) => (
          <TouchableOpacity
            key={banka.banka_id}
            onPress={() => setsecilenbanka(banka.ad)}
            style={[
              styles.button,
              secilenbanka === banka.banka_id && styles.selectedButton

            ]}
          >
            <View style={styles.radioButton}>
              {secilenbanka === banka.ad && <View style={styles.radioButtonSelected} />}
            </View>
            <View style={styles.textContainer}>
              <Text style={{ fontFamily: 'NunitoSans-Bold', color: 'black' }}>{banka.ad}</Text>
              <Text style={{ fontFamily: 'NunitoSans-Regular', color: 'black' }}>{banka.iban}</Text>
            </View>

          </TouchableOpacity>
        ))}
      </View>

      {!show3DS && <View style={styles.swcontainer}>
        <TouchableOpacity onPress={() => { fetchContractHtml(); bottomSheet.current.show(); }} style={{ flex: 1, paddingRight: 15 }}>
          <Text style={[styles.swtext, sozlesmeOnaylandi && { fontWeight: "bold", color: 'black' }]}>
            {translate('Ön Bilgilendirme Formu ve Mesafeli Satış Sözleşmesini okudum ve onaylıyorum.')}</Text>
        </TouchableOpacity>

        <Switch
          trackColor={{ false: "gray", true: "#e37c33" }}
          thumbColor={"#f4f3f4"}
          onValueChange={handleSozlesmeOnay}
          value={sozlesmeOnaylandi}
        /></View>}

      <BottomSheet sheetBackgroundColor="white"
        hasDraggableIcon
        ref={bottomSheet}
        height={ekranYuksekligiInt}
      >
        <SafeAreaView style={stylesglobal.SafeAreaCSS}>



          <View style={{
            width: '100%', height: '100%', paddingHorizontal: 20, paddingVertical: 10, backgroundColor: 'white',
            borderTopLeftRadius: 0, borderTopRightRadius: 0
          }}>

            <Text style={{
              fontWeight: '600', fontSize: 16,
              textAlign: 'center', marginBottom: 10, color: 'black'
            }}>{translate('Sözleşme')}</Text>

            {contractHtml ? (
              <WebView
                ref={sozlesmeWebViewRef}
                onLoadEnd={() => safeSetState(setLoading1, false)}
                key="sozlesme1"
                source={{ html: `<html><head><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>body{font-family:-apple-system,sans-serif;padding:10px;font-size:14px;color:#333;line-height:1.6;}h1,h2,h3{color:#111;}</style></head><body>${contractHtml}</body></html>` }}
                style={{ flex: 1 }}
              />
            ) : (
              <WebView
                ref={sozlesmeWebViewRef}
                onLoadEnd={() => safeSetState(setLoading1, false)}
                key="sozlesme1"
                source={{ uri: `${API_CONFIG.webBaseUrl}/mesafeli-satis-sozlesmesi` }}
                style={{ flex: 1 }}
                incognito={true}
                cacheEnabled={false}
              />
            )}

          </View>


        </SafeAreaView>

      </BottomSheet>

      {!show3DS &&
        <View style={stylesglobal.footersepet}>
          <View style={{ flex: 1.3, justifyContent: 'left', alignItems: 'baseline' }}>


            <View style={{ flex: 1, justifyContent: 'left', flexDirection: 'row', alignSelf: 'baseline', alignItems: 'center', }}>
              <Text style={{ fontSize: 11, fontWeight: 'bold', marginBottom: 5, fontFamily: 'NunitoSans-Regular', color: colors.textSecondary }}>{translate('TOPLAM')}: </Text>
              <Text style={{ fontSize: 20, fontFamily: 'NunitoSans-Regular', color: 'black' }}>{convertPriceString(geneltoplam, null, activeCurrency)}</Text>
            </View>
          </View>
          {!isLoadingREFRESH && (<TouchableOpacity style={{ flex: 1 }} onPress={() => aktiftab == 2 ? havaletamamla() : handleOdemeTamamla()}>
            <View style={stylesglobal.butonsepet}>
              <Text style={stylesglobal.butonsepetTEXT}>{translate('Siparişi Tamamla')}</Text>
            </View>
          </TouchableOpacity>)}
        </View>}

      {/* {isLoadingREFRESH && (
                <View style={stylesglobal.loaderviewPOP}>
                  <LottieView source={require('../assets/animations/yukleme_ani.json')} autoPlay loop style={stylesglobal.loading} />
                </View>
              )} */}
    </SafeAreaView>


  );
};

const styles = StyleSheet.create({
  kartContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: colors.background,
    marginTop: 5
  },
  kartContainerSEC: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: colors.primary,
    marginTop: 5
  },
  input: {
    fontSize: 18,
  },
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 5,
    paddingBottom: 10,
  },
  cardPaymentContainer: { flex: 1 },
  dateInput: {
    width: 50, maxWidth: 50, flex: .1
  },
  dateCcvContainer: {
    flexDirection: 'row', alignItems: 'baseline'
  },
  contractContainer: {
    flex: 1,
    padding: 10
  },
  contractText: {
    fontSize: 16, fontFamily: 'NunitoSans-Regular',
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
  swcontainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginVertical: 10,
    paddingHorizontal: 20,
  },
  swcontainer2: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginVertical: 10,
  },
  swtext: {
    fontFamily: 'NunitoSans-Regular',
    fontSize: 13, color: 'black'

  },

  containerbankas: {
    flexDirection: 'column',
    paddingTop: 3,

  },
  label: {
    fontFamily: 'NunitoSans-Bold',
    fontSize: 13, color: 'black'
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#F7F6F4",
    borderRadius: 10,
    marginVertical: 5,
  },
  button2: {
    backgroundColor: '#e7cdb2',
    padding: 10,
    paddingVertical: 11,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
    marginTop: 5, marginBottom: 5
  },
  radioButton: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: .5,
    borderColor: colors.black,
    backgroundColor: 'white',
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  radioButtonSelected: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: colors.black,
  },

  tableHeader: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    paddingVertical: 10,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  headerCell: {
    flex: 1,
    alignItems: 'center',
  },
  headerCellRadio: {
    width: 40,
    alignItems: 'center',
  },
  headerText: {
    fontWeight: 'bold',
    fontSize: 13,
    color: '#555'
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: .5,
    borderBottomColor: '#e6e6e6',
    alignItems: 'center'
  },
  selectedRow: {
    backgroundColor: '#dceee3' // seçili satırın arkaplan rengi
  },
  tableCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  cellText: {
    fontSize: 13,
    color: colors.textDark
  },
  selectedText: {
    fontWeight: 'bold',
    color: colors.black
  },
  //-------------------------------------------------------
  // Radio Buttonlar
  radioButtonContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  radioButton2: {
    height: 20,
    width: 20,
    marginRight: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e7e9',
    alignItems: 'center',
    justifyContent: 'center'
  },
  radioButtonSelected: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: '#444'
  },
});

export default SepetOdeme;
