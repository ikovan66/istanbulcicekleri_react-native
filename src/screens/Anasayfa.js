
import React, { useContext, useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image } from 'react-native';
import DynamicIcon from '../components/DynamicIcon';
import AnaFooter from '../components/AnaFooter';
import { SafeAreaView } from 'react-native-safe-area-context';
import stylesglobal from '../stylesglobal';
import AnaBloglar from '../components/AnaBloklar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRoute, useFocusEffect } from '@react-navigation/native';
import { SepetContext } from '../components/SepetContext'; // İçe aktarma
import Arama_V2 from '../components/Arama_v2';
import InsiderEvents from '../utils/InsiderHelper';
import { colors } from '../config/theme';
import { SvgUri } from 'react-native-svg';


const Anasayfa = ({ navigation, refresh }) => {
  const [productsSRC, setProductsSRC] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [obek, setobek] = useState('');
  const route = useRoute();
  const [isAtTop, setIsAtTop] = useState(false);
  const { sepetSayisi, setSepetSayisi, logoUrl } = useContext(SepetContext);

  const handleScrollTop = (isTop) => {
    setIsAtTop(isTop);
  };

  useFocusEffect(
    React.useCallback(() => {
      // Delay to ensure Insider SDK initialization completes on first session start
      const timer = setTimeout(() => {
        InsiderEvents.visitHomePage();
      }, 1000);

      return () => clearTimeout(timer);
    }, [])
  );

  const checkMemberAndRedirect = async (nav) => {
    try {
      const memberID = await AsyncStorage.getItem('memberID');
      if (memberID !== null) {
        navigation.navigate(nav);
      } else {
        navigation.navigate('GirisNav');
      }
    } catch (error) {
      console.error('AsyncStorage error: ', error);
    }
  };
  return (
    <SafeAreaView style={stylesglobal.SafeAreaCSS}
    >
      <View style={stylesglobal.container}>

        <View style={isAtTop ? styles.header : styles.header2}>
          <View style={styles.logo}>
            <TouchableOpacity onPress={() => navigation.navigate("KategoriListNav", { id: 0 })} style={{ position: 'relative' }} >

              <DynamicIcon name="menu-burger" size={24} color="#2D3E50" />
            </TouchableOpacity>

            {logoUrl && logoUrl.toLowerCase().endsWith('.svg') ? (
              <SvgUri
                uri={logoUrl}
                width={200}
                height={30}
                style={styles.logoIMG}
              />
            ) : (
              <Image
                source={{ uri: logoUrl }}
                style={styles.logoIMG} resizeMode="contain" />
            )}

            <TouchableOpacity style={{ position: 'relative' }} onPress={() => navigation.navigate('SepetNav')}>
              <DynamicIcon name="bag" size={24} color="#2D3E50" />
              {sepetSayisi > 0 && <View style={{
                position: 'absolute', top: -5, right: 2,
                justifyContent: 'center', alignContent: 'center',
                borderRadius: 10, width: 17, height: 17,
                backgroundColor: colors.primary
              }}>
                <Text style={{ fontSize: 11, color: 'white', fontWeight: '700', textAlign: 'center' }}>{sepetSayisi}</Text>
              </View>}
            </TouchableOpacity>
          </View>

          <Arama_V2 navigation={navigation}></Arama_V2>

        </View>

        <AnaBloglar style={{ display: showResults ? 'none' : 'flex' }}
          onScrollTop={handleScrollTop} />


        {!showResults &&
          <View style={stylesglobal.footer}>
            <AnaFooter parametre={'Anasayfa'} navigation={navigation} />
          </View>
        }

      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({

  resultsContainer: {
    flex: 1,
    backgroundColor: 'white',
    padding: 15,
    paddingTop: 10
  },
  productRow: {
    flexDirection: 'row',
    padding: 5,

    paddingVertical: 5,
    alignItems: 'center',
    borderTopWidth: .5,
    borderTopColor: colors.border
  },
  productImage: {
    width: 60,
    height: 60,
    marginRight: 10,
  },
  productTitle: {
    marginTop: 6,
    fontWeight: 'bold',
  },
  header: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 1)', // %50 şeffaf
    top: 0,
    left: 0,
    right: 0,
    zIndex: 3,
  },
  header2: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 1)', // %50 şeffaf
    top: 0,
    left: 0,
    right: 0,
    zIndex: 3,
  },
  logo: {
    flex: 1,
    marginBottom: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative',
  },
  icon: {
    width: 25,
    height: 25,
    marginLeft: 10,
    marginRight: 10,
  }, icon2: {
    width: 26,
    height: 26,
    marginLeft: 10,
    marginRight: 10,
  },
  logoIMG: {
    flex: 1,
    width: 200, height: 30
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 0,
    borderRadius: 5,
    position: 'relative'
  },
  input: {
    fontFamily: 'NunitoSans-Regular',
    color: 'black',
    height: 38,
    padding: 8,
    flex: 10,
    paddingLeft: 55,
    marginBottom: 0,
    width: '100%',
    borderRadius: 20,
    borderWidth: 0.5,
    backgroundColor: colors.bgGray,
    borderColor: colors.bgGray,
  },
  clearButton: {
    backgroundColor: '#F5A623', borderWidth: 0, borderColor: 'white', borderRadius: 20,
    padding: 6, alignItems: 'center', justifyContent: 'center', alignContent: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute', right: 6, zIndex: 10, top: 6
  },
  iletisimButton: {
    padding: 6,
    alignItems: 'center', justifyContent: 'center', alignContent: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute', right: 6, zIndex: 10, top: 6
  },
});

export default Anasayfa;
