import React, { useContext, useState, useEffect } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import SagOk from '../components/SagOk';
import StatusCircles from '../components/StatusCircles';
import stylesglobal from '../stylesglobal';
import AnaFooter from '../components/AnaFooter';
import HeaderleftComp from '../components/HeaderleftComp';
import IkostResim from '../components/IkostResim';
import IkostButton from "../components/IkostButton";
import LottieView from 'lottie-react-native';
import { SepetContext } from '../components/SepetContext'; // İçe aktarma
import Auth from '../components/Auth';
import { urls } from '../config/apiUrls';
import { colors } from '../config/theme';

const Siparislerim = ({ navigation, route }) => {
  const [orders, setOrders] = useState(null);
  const [isLoading, setIsLoading] = useState(true);  // Yükleme durumunu izlemek için state
  const { fetchTranslations, translate } = useContext(SepetContext);

  useEffect(() => {
    const checkSiparis = async () => {
      setIsLoading(true);
      const dilStored = await AsyncStorage.getItem('dil');
      const kurStored = await AsyncStorage.getItem('kur');
      var username = await AsyncStorage.getItem('username');
      var memberID = await AsyncStorage.getItem('memberID');
      var model = {
        username: username,
        memberID: memberID,
        kur: kurStored,
        lang: dilStored
      };

      const response = await Auth.post(`${urls.siparisList}`);
      setOrders(response.data);
      setIsLoading(false);

    };
    checkSiparis();
  }, []);
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
    let text = "";
    let color = "";
    switch (status) {
      case 12:
        text = translate("Hazırlanıyor");
        color = colors.white; // turuncu
        break;
      case 11:
        text = translate("Yola Çıktı");
        color = colors.white; // sarı
        break;
      case 4:
        text = translate("Onaylandı");
        color = colors.white; // koyu mavi
        break;
      case 6:
        text = translate("İptal Edildi");
        color = colors.white; // gri
        break;
      case 999:
        text = translate("İptal");
        color = colors.white; // gri
        break;
      case 2:
        text = translate("Ödeme Bekliyor");
        color = colors.white; // kırmızı
        break;
      case 5:
        text = translate("Teslim Edildi");
        color = colors.white; // yeşil
        break;
      default:
        text = translate("Bilinmeyen");
        color = colors.white; // koyu gri
        break;
    }
    return { text, color };
  }

  if (isLoading) {
    return (

      <SafeAreaView style={stylesglobal.SafeAreaCSS}>
        <View style={stylesglobal.headerCustom}>
          <HeaderleftComp title="Siparişlerim" />
        </View>
        <View style={stylesglobal.loaderview}><LottieView source={require('../assets/animations/yukleme_ani.json')}
          autoPlay loop style={stylesglobal.loading} /></View></SafeAreaView>

    );
  }

  if (orders && orders.length == 0) {
    return (

      <SafeAreaView style={stylesglobal.SafeAreaCSS}>
        <View style={stylesglobal.headerCustom}>
          <HeaderleftComp title="Siparişlerim" />
        </View>
        <View style={styles.emptyBasketContainer}>
          <Image source={require('../assets/images/empty3.png')} style={styles.emptyBasketImage} />
          <Text style={styles.emptyBasketText}>Siparişiniz Yok</Text>
          <Text style={{ marginBottom: 20, marginTop: 20, display: 'none', color: 'black' }}>
          </Text>
          <IkostButton title="Alışverişe Başla" onPress={() => navigation.navigate("AnaNav")}
            style={{ width: '100%' }} />
        </View>
      </SafeAreaView>

    );
  }

  return (
    <SafeAreaView style={stylesglobal.SafeAreaCSS}>
      <View style={stylesglobal.headerCustom}>
        <HeaderleftComp title="Siparişlerim" />
      </View>
      <ScrollView style={styles.container}>
        <View style={styles.itemsList}>
          {orders.map((item, index) => (
            <TouchableOpacity key={index} style={styles.item}
              onPress={() => navigation.navigate('SiparisNav', { Code: item.code })}>
              <View>
                <Text style={{ fontWeight: '700', marginBottom: 5, color: colors.textSecondary }}>
                  {item.code}
                </Text>
                <Text style={{ fontSize: 12, marginBottom: 5, color: 'black' }}>{new Date(item.tarih).toLocaleDateString('tr-TR')} {new Date(item.tarih).toLocaleTimeString('tr-TR')}</Text>
                <Text style={{ fontSize: 12, fontWeight: '600', marginTop: 0, color: 'black' }}>{translate("Tutar")}: {item.orderTotalString.replace(".", ",")}</Text>

              </View>
              <View style={{
                backgroundColor: sipdurumText(item.status).color,
                borderRadius: 15,
                padding: 5, paddingHorizontal: 15,
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {/* <IkostResim source={images[item.status]} height={25}     /> */}

                {/* <Text style={{ color: 'black', fontSize:11,fontWeight:'bold',marginTop:5,color:'black' }}>{sipdurumText(item.status).text}</Text> */}
              </View>
              <SagOk />

            </TouchableOpacity>
          ))}
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
    padding: 0,
    backgroundColor: colors.bgLight,
  },
  emptyBasketContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30
  },
  emptyBasketImage: {

  },
  emptyBasketText: {
    fontFamily: "NunitoSans-Regular",
    fontSize: 14,
    color: 'black',
    marginTop: 20,
    marginBottom: 50
  },
  itemsList: {
    padding: 5,
    paddingHorizontal: 0,
    backgroundColor: colors.bgLight,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
    padding: 15,
    paddingVertical: 15,
    backgroundColor: colors.white,
  },

});

export default Siparislerim;
