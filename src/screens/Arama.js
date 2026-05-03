import API_CONFIG from '../config/apiConfig';
import React, { useContext, useState, useRef, useEffect } from 'react';
import { Image, View, Text, SectionList, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import HeaderleftComp from '../components/HeaderleftComp';
import UrunView1 from '../components/UrunView1';
import stylesglobal from '../stylesglobal';
import { ikostalert } from '../GlobalAlert';
import { SepetContext } from '../components/SepetContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import InsiderEvents from '../utils/InsiderHelper';
import { colors } from '../config/theme';

const Arama = ({ navigation }) => {
  const [sections, setSections] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const inputRef = useRef(null);
  const sectionListRef = useRef(null);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isListEnd, setListEnd] = useState(false);
  const { fetchTranslations, translate, language } = useContext(SepetContext);

  const kategoriAra = async (obek, lang) => {

    try {
      const response = await axios.post(
        `${API_CONFIG.frontendApi}/api/Product/kategoriara`, JSON.stringify(obek),
        {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-Tenant-Db': API_CONFIG.tenantDb,
          }
        }
      );


      return response.data.length ? response.data : [];
    } catch (error) {
      console.error('Kategori arama hatası:', error);
      return [];
    }
  };

  const URUNLER_API_REQUEST = async (obek, pageNumber = page) => {
    setIsLoading(true);

    const langParam = (language && language.toLowerCase() !== 'tr') ? language.toLowerCase() : undefined;

    const model = {
      hedID: 0,
      obek: obek,
      bolgeid: null,
      kargolu: "",
      siralama: null,
      filtres: [],
      PageSize: 30,
      PageNumber: pageNumber,
      lang: langParam
    }
    console.log('model:');
    console.log(model);
    try {
      const response = await axios.post(
        `${API_CONFIG.frontendApi}/api/Product/Urunler`,
        model,
        {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-Tenant-Db': API_CONFIG.tenantDb,
          },
        }
      );


      return response.data.length ? response.data : [];
    } catch (error) {
      ikostalert(translate('Hata!'), error.toString(), [{ text: translate('TAMAM') }]);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (text) => {
    setSearchQuery(text);
    if (text.length >= 3) {
      setPage(1);
      setListEnd(false);

      // Scroll başa dön
      if (sectionListRef.current) {
        sectionListRef.current.scrollToLocation({
          sectionIndex: 0,
          itemIndex: 0,
          animated: false
        });
      }
      const dilStored = await AsyncStorage.getItem('dil');

      // Insider SDK - Search Event
      InsiderEvents.search(text);

      const kategoriler = await kategoriAra(text, dilStored);

      const urunler = await URUNLER_API_REQUEST(text, 1);

      kategoriler.length > 0 ? setSections([
        { title: translate('Kategoriler'), data: kategoriler },
        { title: translate('Ürünler'), data: urunler }
      ]) : setSections([
        { title: translate('Ürünler'), data: urunler }
      ]);

      setShowResults(true);
    } else {
      setShowResults(false);
      setSections([]);
    }
  };

  const fetchMoreData = async () => {
    if (!isLoading && !isListEnd && searchQuery.length >= 3) {
      const nextPage = page + 1;
      setPage(nextPage);
      const moreProducts = await URUNLER_API_REQUEST(searchQuery, nextPage);

      if (moreProducts.length === 0) {
        setListEnd(true);
        return;
      }

      setSections((prevSections) =>
        prevSections.map((section) =>
          section.title === translate('Ürünler') ? { ...section, data: [...section.data, ...moreProducts] } : section
        )
      );
    }
  };

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, []);

  const clearSearch = () => {
    setSearchQuery('');
    setSections([]);
    setShowResults(false);
  };

  return (
    <SafeAreaView style={stylesglobal.SafeAreaCSS}>
      <View style={stylesglobal.container}>
        <View style={styles.searchContainer1}>
          <TouchableOpacity onPress={() => navigation.goBack()}
            style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ padding: 5, paddingRight: 10 }}>
              <Image
                source={require('../assets/images/arrow-small-left.png')}
                style={{ width: 15, height: 30 }}
              />
            </View>
          </TouchableOpacity>
          <View style={styles.searchContainer}>
            <TextInput
              returnKeyType="done"
              ref={inputRef}
              placeholder={translate("Ürün veya Kategori Arayın..")}
              placeholderTextColor="gray"
              style={styles.input}
              onChangeText={handleSearch}
              value={searchQuery}
            />
          </View>
        </View>
        {showResults && (
          <SectionList
            ref={sectionListRef}
            sections={sections}
            keyExtractor={(item, index) => `${item.id}-${index}`}
            renderSectionHeader={({ section: { title } }) => (
              <View style={{ backgroundColor: '#E8ECEB', padding: 10 }}>
                <Text style={{
                  fontSize: 12, color: colors.primary
                  , fontFamily: 'NunitoSans-Regular',
                }}>{title}</Text>
              </View>
            )}
            renderItem={({ item }) =>
              item.imgurl ? (
                <UrunView1 item={item} kategoriden={true} />
              ) : (
                <TouchableOpacity onPress={() => navigation.navigate('KategoriNav', { cid: item.id, title: item.ad })}>
                  <View style={{ padding: 10, borderBottomWidth: 0.5, borderBottomColor: '#ddd' }}>
                    <Text style={{
                      fontSize: 14, fontFamily: 'NunitoSans-Regular', color: 'black'
                    }}>{item.ad}</Text>
                  </View>
                </TouchableOpacity>
              )
            }
            onEndReached={fetchMoreData}
            onEndReachedThreshold={0.5}
          />
        )}
      </View>
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({

  searchContainer1: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 0,

    paddingLeft: 10,

    marginBottom: 10,


  },

  searchContainer: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 0,
    flex: 1,
    borderRadius: 5,
    paddingLeft: 10,
    paddingRight: 15,
    marginHorizontal: 10,
    marginLeft: 0,

    position: 'relative', borderWidth: 1, borderColor: colors.primary
  },
  input: {
    fontFamily: 'NunitoSans-Regular',
    color: 'black',
    height: 38,
    padding: 8,
    flex: 10,
    paddingLeft: 0,
    marginBottom: 0,
    width: '100%',
    borderRadius: 0,
    borderWidth: 0,
    backgroundColor: colors.white,
    borderColor: colors.white,
  },
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
  line: {
    flex: 1,
    backgroundColor: '#e9eceb',
    height: 1,
    paddingLeft: 5
  },
  solokcontianer: {
    position: 'absolute', left: 20,
  },
  ButtonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 11,
    paddingLeft: 20,
    borderBottomWidth: 0,
    borderBottomColor: '#ddd',
  },
  title: {
    flex: 1,
    fontFamily: 'NunitoSans-Regular',
    color: 'black',
    fontSize: 15,
  },
  baklava: {
    opacity: .6,
    fontSize: 11
  },
  kategorilerDIVtitle: {
    paddingHorizontal: 15,
    paddingVertical: 0,
    height: 33,
    backgroundColor: '#E8ECEB',
    flexDirection: 'row',
  },
  kategorilerLABELtitle: {
    fontSize: 12,
    color: colors.primary,
    alignSelf: 'center',
    flex: 1,
  },
});

export default Arama;
