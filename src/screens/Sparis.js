import API_CONFIG from '../config/apiConfig';
import React, { useContext, useState, useLayoutEffect, useEffect, useRef } from 'react';
import { Alert, View, Text, ScrollView, Image, StyleSheet, ActivityIndicator, Dimensions, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import stylesglobal from '../stylesglobal';
import IkostButton from '../components/IkostButton';
import BottomSheet from "react-native-gesture-bottom-sheet";
import { WebView } from 'react-native-webview';
import axios from 'axios';
import HeaderleftComp from '../components/HeaderleftComp';
import IkostResim from '../components/IkostResim';
import FastImage from 'react-native-fast-image';
import Clipboard from '@react-native-clipboard/clipboard';
import { ikostalert } from '../GlobalAlert';
import { SepetContext } from '../components/SepetContext'; // İçe aktarma
import Auth from '../components/Auth';
import InsiderEvents from '../utils/InsiderHelper';
import FacebookEvents from '../utils/FacebookEvents';
import analytics from '@react-native-firebase/analytics';
import { urls } from '../config/apiUrls';
import { colors } from '../config/theme';

const Siparis = ({ navigation, route }) => {
  const [order, setOrder] = useState(null);
  const [code, setCode] = useState(route.params.Code);
  const [username, setusername] = useState(null);
  const [oid, setoid] = useState(0);
  const { fetchTranslations, translate, insiderProductMap1 } = useContext(SepetContext);
  const [lang, setlang] = useState("TR");

  const bottomSheet = useRef();
  const ekranYuksekligiFloat = Dimensions.get('window').height * .80;
  const ekranYuksekligiInt = Math.floor(ekranYuksekligiFloat); // Aşağı yuvarlar
  const [isLoading, setIsLoading] = useState(true);  // Yükleme durumunu izlemek için state
  const siparisOlaylariGonderildi = useRef(false);


  useEffect(() => {
    const checkSiparis = async () => {
      try {
        const username = await AsyncStorage.getItem('username');
        setusername(username);
        const dilStored = await AsyncStorage.getItem('dil');
        const kurStored = await AsyncStorage.getItem('kur');
        setlang(dilStored);
        console.log(code);
        const response = await Auth.post(`${urls.siparis}`, { code: code });
        setOrder(response.data);
        console.log(response.data);
      } catch (error) {
        console.error('Sipariş verileri alınırken hata oluştu:', error);
      }
    };

    checkSiparis();
  }, []);

  // Insider itemPurchased event - Yeni sipariş için
  useEffect(() => {
    console.log('[Insider] Checking purchase event conditions. Yeni:', route.params.yeni, 'Order:', !!order);

    if (route.params.yeni && order && order.orderItems && !siparisOlaylariGonderildi.current) {
      try {
        if (!order.code) {
          console.warn('[Insider] Order code is missing, delaying purchase event until loaded');
          return;
        }

        // Lock it here only when we have a valid order.code
        siparisOlaylariGonderildi.current = true;

        // Firebase Analytics items dizisi için
        const analyticsItems = [];

        // Her ürün için itemPurchased eventi gönder
        order.orderItems.forEach((item) => {
          // Fiyatı güvenli bir şekilde parse et
          let price = 0;
          if (typeof item.unitPrice === 'number') {
            price = item.unitPrice;
          } else if (typeof item.unitPrice === 'string') {
            // "1.234,50" -> "1234.50" formatına çevir
            let cleanPrice = item.unitPrice.replace(/\./g, '').replace(',', '.');
            price = parseFloat(cleanPrice);
            if (isNaN(price)) price = 0;
          }

          // Try to find persisted product details first
          const productId = String(item.productID);
          const persistedProduct = insiderProductMap1[productId] || insiderProductMap1['P-' + productId];

          let product;
          if (persistedProduct) {
            product = {
              ...persistedProduct,
              price: price, // Use the price from the order as it is the actual transaction price
              quantity: item.quantity || 1,
              currency: 'TRY'
            };
          } else {
            product = {
              id: String(item.productID),
              name: item.urunad || '',
              image_url: item.imgurl || '',
              price: price,
              currency: 'TRY',
              // taxonomy: [], // InsiderHelper will default to ['General']
              quantity: item.quantity || 1,
            };
          }

          console.log('[Insider] Sending itemPurchased for product:', product, 'SaleID:', order.code);
          InsiderEvents.itemPurchased(order.code, product);

          // Firebase Analytics için item ekle
          analyticsItems.push({
            item_id: String(item.productID),
            item_name: item.urunad || '',
            price: price,
            quantity: item.quantity || 1,
          });
        });

        console.log('[Insider] itemPurchased events sent for order:', order.code);

        // Firebase Analytics purchase event - GA4 ve Google Ads dönüşüm izleme için
        const sendPurchaseEvent = async () => {
          try {
            // Toplam tutarı hesapla
            let totalValue = 0;
            if (typeof order.orderTotal === 'number') {
              totalValue = order.orderTotal;
            } else if (typeof order.orderTotal === 'string') {
              let cleanTotal = order.orderTotal.replace(/\./g, '').replace(',', '.');
              totalValue = parseFloat(cleanTotal);
              if (isNaN(totalValue)) totalValue = 0;
            }

            await analytics().logEvent('purchase', {
              transaction_id: order.code,
              value: totalValue,
              currency: 'TRY',
              items: analyticsItems,
            });
            console.log('[Firebase Analytics] purchase event sent for order:', order.code, 'value:', totalValue);

            FacebookEvents.logPurchase({
              totalPrice: totalValue,
              currency: 'TRY',
              orderId: order.code,
              numItems: analyticsItems.length
            });

          } catch (analyticsError) {
            console.error('[Firebase Analytics] Error sending purchase event:', analyticsError);
          }
        };
        sendPurchaseEvent();

      } catch (error) {
        console.error('[Insider] Error sending itemPurchased events:', error);
      }
    }
  }, [order, route.params.yeni]);

  useLayoutEffect(() => {
    route.params.yeni && navigation.setOptions({
      headerBackVisible: false
    });
  }, [navigation]);

  if (!order) {

    return (
      <SafeAreaView style={stylesglobal.SafeAreaCSS}>
        <ActivityIndicator size="large" color="green" />
      </SafeAreaView>
    )

  }

  const images = {
    6: require('../assets/images/sip_durum_iptal.png'),
    999: require('../assets/images/sip_durum_iptal.png'),
    2: require('../assets/images/sip_durum_odeme_bekliyor.png'),
    4: require('../assets/images/sip_durum_saat.png'),
    12: require('../assets/images/sip_durum_hazirlaniyor.png'),
    11: require('../assets/images/sip_durum_yolda.png'),
    5: require('../assets/images/sip_durum_teslimedildi.png'),
  };
  function sipdurumText(status) {
    var text = "";
    if (status === 12) {
      text = translate("Hazırlanıyor");
    } else if (status === 11) {
      text = translate("Yola Çıktı");
    } else if (status === 4) {
      text = translate("Onaylandı");
    }
    else if (status === 6 || status === 999) {
      text = translate("İptal Edildi");
    } else if (status === 2) {
      text = translate("Ödeme Bekliyor");
    } else if (status === 5) {
      text = translate("Teslim Edildi");
    } else if (status === 88) {
      text = translate("Ürün Değişimi");
    } else if (status === 99) {
      text = translate("Ulaşılamadı");
    } else if (status === 101) {
      text = translate("Görsel Onay Bekliyor");
    } else if (status === 102) {
      text = translate("Görsel Onaysız");
    } else if (status === 103) {
      text = translate("Görsel Onaylı");
    }
    return text;
  };



  const copyToClipboard = (metin) => {
    Clipboard.setString(metin);
    if (Platform.OS === 'android') {
      ToastAndroid.show('Kopyalandı', ToastAndroid.SHORT);
    } else {
      ikostalert('Kopyalandı', metin);
    }
  };
  function mesajac(oid) {
    setoid(oid);
    bottomSheet.current.show();
  }
  return (
    <SafeAreaView style={stylesglobal.SafeAreaCSS}>
      <View style={stylesglobal.headerCustom}>
        {!route.params.yeni && <HeaderleftComp title="Sipariş Bilgileri" />}


      </View>
      <ScrollView style={styles.container}>
        <View style={styles.orderBlock}>

          {/*   {route.params.yeni &&     <View style={styles.row1a}>
      <Text style={{textAlign:'center',color:'green'}}>Tebrikler! Siparişinizi Aldık.</Text>
        </View>
      } */}


          {/*    <View style={styles.row1a}>
        <StatusCircles status={order.durum}  />
         </View> */}


          {/*     <View style={styles.title}>
          <Text style={styles.titlelabel}>SİPARİŞ BİLGİLERİ</Text>        
        </View> */}

          {/* <View style={styles.row}>
        
          <View style={styles.value}>
          <IkostResim source={images[order.durum]} height={30} style={{marginRight:5}}    />
          <Text style={styles.label1}> {sipdurumText(order.durum)}</Text>
          </View>

        
        </View> */}
          {order.durum == 2 ? (
            <View style={{ padding: 15, backgroundColor: '#9ddfdf', margin: 10, borderRadius: 6 }}>
              <Text style={{ fontSize: 12, marginVertical: 3, color: 'black' }}>{translate('Aşağıdaki banka hesabımıza ödemenizi yapmanızın ardından siprişiniz işleme alınacaktır.')}</Text>
              <Text style={{ fontSize: 12, marginVertical: 3, color: 'black' }}>{translate('Banka')}: {order.banka.banka}</Text>
              <TouchableOpacity onPress={() => copyToClipboard(order.banka.iban)}>
                <Text style={{ fontSize: 13, marginVertical: 3, color: 'black' }}>
                  <IkostResim
                    source={require('../assets/images/copy-icon.png')}
                    height={15} /> {translate('IBAN')}: <Text style={{ color: 'blue' }}>{order.banka.iban} </Text>
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => copyToClipboard(order.banka.hesap_adi)}>
                <Text style={{ fontSize: 13, marginVertical: 3, color: 'black' }}>
                  <IkostResim
                    source={require('../assets/images/copy-icon.png')}
                    height={15} />
                  {translate('Hesap Adı')}: <Text style={{ color: 'blue' }}>{order.banka.hesap_adi}</Text>
                </Text>
              </TouchableOpacity>
            </View>) : (<></>)}
          <View style={styles.row}>
            <Text style={styles.label}>{translate('Sipariş No')}</Text>
            <Text style={styles.value}>: {order.code}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>{translate('Sipariş Tarihi')}</Text>
            <Text style={styles.value}>: {new Date(order.tarih).toLocaleDateString('tr-TR')} {new Date(order.tarih).toLocaleTimeString('tr-TR')}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>{translate('Tutar')}</Text>
            <Text style={styles.value}>: {order.orderTotalString}</Text>
          </View>
          {order.indirim > 0 && <View style={styles.row}>
            <Text style={styles.label}>{translate('İndirim')}</Text>
            <Text style={styles.value}>: {order.indirimString}</Text>
          </View>}
          <View style={styles.title}>
            <Text style={styles.titlelabel}>{translate('Ürünler')}</Text>
          </View>
          <View style={styles.row1}>
            {order.orderItems && order.orderItems.map((item, index) => (
              <>
                <View key={item.ID + '-' + index} style={styles.item}>

                  <FastImage
                    style={styles.image}
                    source={{
                      uri: item.imgurl,
                      priority: FastImage.priority.normal,
                    }}
                    resizeMode={FastImage.resizeMode.contain}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemDetails}>{item.urunad}</Text>
                    <View style={{ flex: 1, borderLeftColor: '#BAB09D', borderLeftWidth: 1, marginRight: 15, paddingLeft: 20, justifyContent: 'center' }}>
                      <Text style={{ fontFamily: 'NunitoSans-Regular', fontSize: 20, color: 'black' }}>{item.unitPriceString}</Text>
                    </View>
                  </View>
                </View>
                <View style={{ paddingLeft: 80, paddingVertical: 5, backgroundColor: 'white' }}>

                  {item.ekurunler.map((ekurun, index) => (<View style={styles.itemContainerEKURUN} key={ekurun.ad + '-' + index}>
                    <View style={{ justifyContent: 'flex-start' }}>
                      <Image source={{ uri: ekurun.url }} width={50} height={50} style={{ alignSelf: 'flex-end', marginRight: 10 }} />
                    </View>
                    <View style={{ paddingHorizontal: 0 }}>
                      <Text style={styles.textekurun}>{ekurun.ad}</Text>
                      <Text style={styles.priceekurun}>{ekurun.fiyatstring}</Text>

                    </View>

                  </View>
                  ))}


                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>{translate('Durumu')}</Text>
                  <Text style={styles.value2}>: {sipdurumText(item.status)}</Text>



                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>{item.teslimsaat == 'undefined' ? translate('Kargoya Veriliş') : translate('Teslim Tarihi')}</Text>
                  <Text style={styles.value}>: {item.teslimtarih}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>{translate('Teslim Saati')}</Text>
                  <Text style={styles.value}>: {item.teslimsaat == 'undefined' ? translate("Gün İçinde") : item.teslimsaat}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>{translate('Teslim Alacak')}</Text>
                  <Text style={styles.value}>: {item.teslimad}</Text>
                </View>
                {item.teslimalan && item.teslimalan != "" &&
                  <View style={styles.row}>
                    <Text style={styles.label}>{translate('Teslim Alan')}</Text>
                    <Text style={styles.value}>: {item.teslimalan}</Text>
                  </View>}
                <View style={styles.row}>
                  <Text style={styles.label}>{translate('Teslim Telefon')}</Text>
                  <Text style={styles.value}>: {item.teslimtelefon}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>{translate('Teslim Adresi')}</Text>
                  <Text style={styles.value22}>: {item.teslimadres}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>{translate('Kart Mesajı')}</Text>
                  <Text style={styles.value22}>: {item.kartnot && item.kartnot.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ')}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>{translate('Karta Yazılan Ad')}</Text>
                  <Text style={styles.value}>: {item.kartad && item.kartad.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ')}</Text>
                </View>
                <View style={styles.row}>

                  <TouchableOpacity
                    onPress={() => mesajac(item.id)}
                    style={{
                      padding: 10, paddingHorizontal: 15,
                      backgroundColor: colors.primary, borderRadius: 6,
                      alignSelf: 'center'
                    }}
                  >
                    <Text style={{
                      textAlign: 'center', color: 'white', fontSize: 11,
                    }}>{translate('Müşteri Hizmetlerine Yazın')}</Text>
                  </TouchableOpacity>
                </View>
              </>

            ))}
          </View>
        </View>

      </ScrollView>
      {route.params.yeni && <View style={{ marginHorizontal: 40 }}>
        <IkostButton title="Anasayfa"

          onPress={() => navigation.navigate("AnaNav")}></IkostButton>
      </View>
      }

      <BottomSheet sheetBackgroundColor="white"
        hasDraggableIcon KeyboardAvoidingView
        ref={bottomSheet}
        height={ekranYuksekligiInt}

      >
        <SafeAreaView style={stylesglobal.SafeAreaCSS}>

          <View style={{
            flex: 1, justifyContent: 'flex-end',
            backgroundColor: 'rgba(0, 0, 0, 0.5)'
          }}>

            <View style={{
              width: '100%', height: '100%', paddingHorizontal: 0, paddingVertical: 0, backgroundColor: 'white',
              borderTopLeftRadius: 0, borderTopRightRadius: 0
            }}> 

              {isLoading && (
                <ActivityIndicator size="large" color="green" style={{ marginTop: 40 }} />
              )}
              {username && order && (
                <WebView

                  onLoadEnd={() => setIsLoading(false)}
                  key="sozlesme"
                  source={{ uri: `https://chat-istanbulcicekleri.ikost.com/mesajlar?user=` + username + '&sipkod=' + code + '&oid=' + oid + '&lang=' + lang }}
                  style={{ flex: 1 }}
                  incognito={true}
                  cacheEnabled={false}
                />
              )}
            </View>
          </View>
        </SafeAreaView>
      </BottomSheet>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  title: {
    backgroundColor: '#efefef',
    height: 40, justifyContent: 'center',
    paddingLeft: 20,
    borderTopColor: '#E7E4E0', borderTopWidth: 1, color: 'black'
  },
  titlelabel: {
    fontFamily: "NunitoSans-Bold",
    fontSize: 13, letterSpacing: 1.3, color: 'black'
  },
  container: {
    flex: 1,
    padding: 0,
  },
  orderBlock: {

    backgroundColor: colors.bgLight,
    marginBottom: 0,
  },
  row1a: {
  },
  row1: {

  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 2,
    backgroundColor: 'white',
    padding: 10, paddingLeft: 20

  },
  label: {
    fontWeight: 'bold',
    width: 115,
    fontFamily: "NunitoSans-Bold",
    fontSize: 13, color: 'black'
  },
  value: {
    flex: 1, flexDirection: 'row',
    justifyContent: 'center', alignItems: 'center',
    textAlign: 'left', fontFamily: "NunitoSans-Regular",
    fontSize: 13, color: 'black'
  },
  value2: {
    flex: 1, flexDirection: 'row',
    justifyContent: 'center', alignItems: 'center',
    textAlign: 'left', fontFamily: "NunitoSans-Regular",
    fontSize: 15, color: 'black', fontWeight: '700'
  },
  value22: {
    flex: 1, flexDirection: 'row',
    justifyContent: 'center', alignItems: 'center',
    textAlign: 'left', fontFamily: "NunitoSans-Regular",
    fontSize: 13, lineHeight: 20, color: 'black'
  },
  label1: {
    flex: 1, flexDirection: 'row',
    justifyContent: 'center', alignItems: 'center',
    textAlign: 'left', fontWeight: 'bold', color: 'black'
  },
  itemsList: {
    padding: 0,
    backgroundColor: '#f0f0f0',
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    paddingVertical: 5,
    paddingBottom: 15,
    backgroundColor: colors.white,
    alignItems: 'center', borderBottomColor: '#ddd',
    borderBottomWidth: .5, color: 'black'
  },
  itemDetails: {
    flex: 1, fontFamily: 'NunitoSans-SemiBold',
    fontSize: 20, justifyContent: 'center', color: 'black'
  },

  image: {
    width: 110, height: 134, marginRight: 20
  },

  itemContainerEKURUN: {
    flexDirection: 'row',
    justifyContent: 'flex-start', alignContent: 'center', alignItems: 'center',
    backgroundColor: 'white',
    borderBottomWidth: 1, borderColor: '#e6e6e6',
    padding: 5, paddingHorizontal: 0, color: 'black'
  },
  textekurun: {
    fontSize: 12,
    fontFamily: 'NunitoSans-Regular',
    fontWeight: 'normal', lineHeight: 18, color: 'black'
  },
  priceekurun: {
    fontSize: 15,
    fontFamily: 'NunitoSans-Regular',
    marginTop: 5, color: 'black'
  },
});

export default Siparis;
