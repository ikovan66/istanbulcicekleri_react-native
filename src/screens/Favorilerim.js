import React, { useContext, useState, useEffect } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import SagOk from '../components/SagOk';
import StatusCircles from '../components/StatusCircles';
import stylesglobal from '../stylesglobal';
import AnaFooter from '../components/AnaFooter';
import { useFocusEffect } from '@react-navigation/native';
import HeaderleftComp from '../components/HeaderleftComp';
import IkostButton from "../components/IkostButton";
import LottieView from 'lottie-react-native';
import { SepetContext } from '../components/SepetContext'; // İçe aktarma
import Auth from '../components/Auth';
import InsiderEvents from '../utils/InsiderHelper';
import { colors } from '../config/theme';

const Favorilerim = ({ navigation, route }) => {
  const { fetchTranslations, translate, favoriListesi, checkFavoriler } = useContext(SepetContext);
  const [isLoading, setIsLoading] = useState(false); // Context manages loading mostly, but we can keep local load state if needed or derive it. For now, let's assume if list is empty but we expect data.. no, let's simpler.
  // Actually, we can rely on favoriListesi from context. 
  // But initial load might need a spinner. 
  // checkFavoriler is async, so we can track it locally.

  const refreshFavs = async () => {
    setIsLoading(true);
    await checkFavoriler();
    setIsLoading(false);
  }

  useEffect(() => {
    refreshFavs();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      // Buraya sayfa her odaklandığında çalışmasını istediğiniz kodları yazın.
      console.log('Sayfa odaklandı! Fonksiyonlar burada çalıştırılabilir.');
      refreshFavs();
      return () => {
        // Sayfa odaktan çıktığında çalışacak temizlik işlemleri burada yapılabilir.
        console.log('Sayfa odaktan çıktı.');
      };
    }, [])
  );

  if (isLoading) {
    return (

      <SafeAreaView style={stylesglobal.SafeAreaCSS}>
        <View style={stylesglobal.headerCustom}>
          <HeaderleftComp title={translate("Favorilerim")} />
        </View>
        <View style={stylesglobal.loaderview}><LottieView source={require('../assets/animations/yukleme_ani.json')}
          autoPlay loop style={stylesglobal.loading} /></View></SafeAreaView>

    );
  }

  if (favoriListesi && favoriListesi.length == 0) {
    return (

      <SafeAreaView style={stylesglobal.SafeAreaCSS}>
        <View style={stylesglobal.headerCustom}>
          <HeaderleftComp title={translate("Favorilerim")} />
        </View>
        <View style={styles.emptyBasketContainer}>
          <Image source={require('../assets/images/empty3.png')} style={styles.emptyBasketImage} />
          <Text style={styles.emptyBasketText}>{translate('Favori Ürününüz Yok')}</Text>
          <Text style={{ marginBottom: 20, marginTop: 20, display: 'none' }}>
          </Text>
          <IkostButton title={translate("Alışverişe Başla")} onPress={() => navigation.navigate("AnaNav")}
            style={{ width: '100%' }} />
        </View>
        <View style={stylesglobal.footer}>
          <AnaFooter parametre={'Favorilerim'} navigation={navigation} />
        </View>
      </SafeAreaView>

    );
  }
  return (
    <SafeAreaView style={stylesglobal.SafeAreaCSS}>
      <View style={stylesglobal.headerCustom}>
        <HeaderleftComp title={translate("Favorilerim")} />
      </View>
      <ScrollView style={styles.container}>
        <View style={styles.itemsList}>
          {favoriListesi.map((item, index) => (
            <TouchableOpacity key={index} style={styles.item}
              onPress={() => navigation.navigate('UrunNav', { pid: item.id, resetScroll: true })}

            >

              <Image source={{ uri: item.imgurl }} style={styles.image} />
              <View style={{ flex: 1 }}>

                <Text style={styles.itemDetails} >{item.ad}</Text>
                <Text style={styles.itemPrice}>{item.fiyatstring}</Text>
              </View>
              <View style={{ paddingLeft: 5 }}>
                {/* <View style={{   
                backgroundColor: item.stok>0?'#e3f1df':colors.border,
                borderRadius: 15,
                padding: 5, paddingHorizontal: 15,
                alignItems: 'center',
                justifyContent: 'center'
              }}>
            <Text style={{fontSize:12}}>{item.stok>0?translate('stokta'):translate('stokta yok')}</Text>
            </View> */}
              </View>
              <SagOk />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      <View style={stylesglobal.footer}>
        <AnaFooter parametre={'Favorilerim'} navigation={navigation} />
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


  itemDetails: {
    fontFamily: "NunitoSans-Regular",
    fontSize: 13, marginBottom: 5, color: 'black'
  },
  itemPrice: {
    fontFamily: "NunitoSans-Bold", marginTop: 5, color: 'black'
  },
  image: {
    width: 50,
    height: 50,
    marginRight: 10,
  },
});

export default Favorilerim;
