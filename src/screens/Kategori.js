import React, { useContext, useEffect, useState, useRef } from 'react';
import {
  ScrollView, View, Text, StyleSheet, Image,
  FlatList, TouchableOpacity, Alert, Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import stylesglobal from '../stylesglobal';
import { useRoute } from '@react-navigation/native';
import UrunView from '../components/UrunView';
import UrunView1 from '../components/UrunView1';
import UrunView2 from '../components/UrunView2';
import HeaderleftComp from '../components/HeaderleftComp';
import FiltrePop from '../components/FiltrePop';
import BottomSheet from "react-native-gesture-bottom-sheet";
import LottieView from 'lottie-react-native';
import AnaFooter from '../components/AnaFooter';
import { ikostalert } from '../GlobalAlert';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SepetContext } from '../components/SepetContext';
import MahalleSec from '../components/MahalleSec';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Arama_V2 from '../components/Arama_v2';
import InsiderEvents from '../utils/InsiderHelper';
import { urls } from '../config/apiUrls';
import { colors } from '../config/theme';
import DynamicIcon from '../components/DynamicIcon';
import API_CONFIG from '../config/apiConfig';
import Svg, { Path } from 'react-native-svg';

const Kategori = () => {
  const { fetchTranslations, translate, secilenMahItem, language } = useContext(SepetContext);

  const route = useRoute();
  const navigation = useNavigation();
  const { cid = '0', title = '', obek = '' } = route.params || {};
  const [currentCid, setCurrentCid] = useState(cid);
  const altKategoriler = route.params?.altKategoriler || [];
  const menuitems = route.params?.menuitems || [];
  const [activeTab, setActiveTab] = useState(-1);

  const [page, setPage] = useState(1);
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [duzen, setduzen] = useState(0);
  const [columns, setcolumns] = useState(2);

  const [filtrebusayfada, setFiltrebusayfada] = useState(new Set());
  const [filtreBYsection, setfiltreBYsection] = useState({});
  const [siralama, setSiralama] = useState(10000);

  const ekranYuksekligiFloat = Dimensions.get('window').height * 0.75;
  const ekranYuksekligiInt = Math.floor(ekranYuksekligiFloat);

  const [productsData, setProductsData] = useState(null);

  // bolgeid is derived from context
  const bolgeid = secilenMahItem?.bolge_id;

  const [isFirstLoading, setFirstLoading] = useState(true);
  const [isListEnd, setListEnd] = useState(false);
  const [moreLoading, setmoreLoading] = useState(false);

  const bottomSheet = useRef();

  // -- YENİ EKLEDİK: Alt kategoriyi gösterip göstermeye yarayan state ve scroll konumunu takip eden ref
  const [showSubCategories, setShowSubCategories] = useState(true);
  const scrollOffsetY = useRef(0);

  // AsyncStorage loading removed - relying on Context

  // Mahalle seçimi handled by Context + Effect
  const handleMahallesectim = (item) => {
    // Context updates automatically trigger re-fetch via useEffect below
    console.log('Mahalle değişti (Context):', item);
  };

  const filtrePressed = () => {
    bottomSheet.current.show();
  };

  const duzenPressed = () => {
    if (duzen < 2) setduzen(duzen + 1);
    if (duzen == 2) setduzen(0);
  };

  useEffect(() => {
    if (duzen == 0) setcolumns(2);
    if (duzen == 1) setcolumns(1);
    if (duzen == 2) setcolumns(1);
  }, [duzen]);

  const getLayoutIconName = () => {
    return duzen === 0 ? 'list' : 'grid';
  };

  let isMounted = true;
  useEffect(() => {
    if (isMounted) {
      setCurrentCid(cid);
    }
    return () => { isMounted = false; };
  }, [cid]);

  useEffect(() => {
    // Relying on secilenMahItem change or cid change
    fetchMoreData(true);
    // Trigger Insider Listing Page Event since we have fresh data load
    if (title) {
      const taxonomy = [title];
      if (activeTab >= 0 && altKategoriler[activeTab]) {
        taxonomy.push(altKategoriler[activeTab].ad);
      }
      InsiderEvents.visitListingPage(taxonomy);
    }
  }, [currentCid, secilenMahItem, language]); // bolgeid yerine secilenMahItem nesnesini izleyelim oradan bolgeid alıyoruz

  const fetchMoreData = async (forceFirstLoading = false, filitrek = [], siralamasi = siralama) => {
    if ((isListEnd || moreLoading) && !forceFirstLoading) return;
    setmoreLoading(true);

    try {
      const langParam = (language && language.toLowerCase() !== 'tr') ? language.toLowerCase() : undefined;
      const urm = {
        hedID: Number(currentCid),
        obek: "",
        bolgeid: bolgeid,
        kargolu: "",
        siralama: siralamasi,
        filtres: filitrek,
        lang: langParam
      };
      await URUNLER_API_REQUEST(urm, forceFirstLoading);
    } catch (e) {
      console.log('loginMOD1 okuma hatası', e);
    }
  };

  const handleFilterCommand = (filters, filtresayfada, filtreBYsection, siralamasi) => {
    setSelectedFilters(filtresayfada);
    setFiltrebusayfada(filtresayfada);
    setfiltreBYsection(filtreBYsection);
    setSiralama(siralamasi);
    bottomSheet.current.close();
    fetchMoreData(true, filtresayfada, siralamasi);
  };

  const URUNLER_API_REQUEST = async (model1, forceFirstLoading = false) => {
    const model = {
      ...model1,
      PageSize: 30,
      PageNumber: forceFirstLoading ? 1 : page
    };

    setFirstLoading(forceFirstLoading);
    try {
      const response = await axios.post(
        urls.urunler,
        model,
        {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-Tenant-Db': API_CONFIG.tenantDb,
          },
        }
      );

      if (forceFirstLoading) {
        setListEnd(false);
        setPage(2);
        setProductsData(response.data);
      } else {
        setPage(page + 1);
        setProductsData(prevData => [...prevData, ...response.data]);
      }

      if (response.data.length === 0) {
        setListEnd(true);
      }

      return response.data;
    } catch (error) {
      console.log(error.toString());
      Alert.alert('Hata!', error.toString(), [{ text: 'TAMAM' }]);
      return null;
    } finally {
      setFirstLoading(false);
      setmoreLoading(false);
    }
  };

  const renderFooter = () => (
    <View style={stylesglobal.loaderview2}>
      {!isListEnd && moreLoading &&
        <LottieView
          source={require('../assets/animations/yukleme_ani.json')}
          autoPlay
          loop
          style={stylesglobal.loading3}
        />
      }
      {isListEnd && <View></View>}
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyBasketContainer}>
      <Image source={require('../assets/images/empty3.png')} style={styles.emptyBasketImage} />
      <Text style={styles.emptyBasketText}>
        {translate('Seçiminize ait sonuç bulunamadı.')}
      </Text>
    </View>
  );

  // -- FlatList onScroll ile scroll yönüne göre subcat gizle/göster
  const handleScroll = (event) => {
    const currentOffset = event.nativeEvent.contentOffset.y;
    const direction = currentOffset > scrollOffsetY.current ? 'down' : 'up';
    // Ufak kaymalarda hemen gizleyip göstermesin diye basit bir eşik kullanabilirsiniz (örnek 5 px):
    const diff = Math.abs(currentOffset - scrollOffsetY.current);

    if (diff > 5) {
      if (direction === 'down' && showSubCategories) {
        setShowSubCategories(false);
      } else if (direction === 'up' && !showSubCategories) {
        setShowSubCategories(true);
      }
    }
    scrollOffsetY.current = currentOffset;
  };



  return (
    <GestureHandlerRootView>
      <SafeAreaView style={stylesglobal.SafeAreaCSS}>
        <View style={{ flex: 1 }}>
          {/* Üst Header */}
          <View style={styles.headerCat}>
            <TouchableOpacity onPress={() => navigation.goBack()}
              style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ paddingRight: 5 }}>
                <Image
                  source={require('../assets/images/left_big.png')}
                  style={{ width: 9.78, height: 19.21 }}
                />
              </View>



            </TouchableOpacity>

            <Arama_V2 navigation={navigation}></Arama_V2>

            <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
              <TouchableOpacity
                onPress={() => filtrePressed()}
                style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" style={{ marginLeft: 5 }}>
                  <Path d="M3 4h18M6 9h12M9 14h6M11 19h2" stroke="#2D3E50" strokeWidth={1.8} strokeLinecap="round" />
                </Svg>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => duzenPressed()}
                style={{ flexDirection: 'row', alignItems: 'center' }}>
                {duzen === 0 ? (
                  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" style={{ marginLeft: 15 }}>
                    <Path d="M3 3h8v8H3zM13 3h8v8h-8zM3 13h8v8H3zM13 13h8v8h-8z" stroke="#2D3E50" strokeWidth={1.5} strokeLinejoin="round" />
                  </Svg>
                ) : duzen === 1 ? (
                  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" style={{ marginLeft: 15 }}>
                    <Path d="M4 6h16M4 10h16M4 14h16M4 18h16" stroke="#2D3E50" strokeWidth={1.5} strokeLinecap="round" />
                  </Svg>
                ) : (
                  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" style={{ marginLeft: 15 }}>
                    <Path d="M3 3h18v8H3zM3 13h18v8H3z" stroke="#2D3E50" strokeWidth={1.5} strokeLinejoin="round" />
                  </Svg>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Mahalle seçimi */}
          {showSubCategories && <MahalleSec onCommand={handleMahallesectim} focusmu={false} />}

          {/* Alt kategoriler: showSubCategories true ise göster */}
          {showSubCategories && altKategoriler.length > 0 && (
            <ScrollView
              horizontal={true}
              showsHorizontalScrollIndicator={false}
              removeClippedSubviews={true}
              style={styles.scrollViewStyle}
            >
              <TouchableOpacity
                key={cid}
                style={[styles.button, activeTab === -1 ? styles.activeButton : null]}
                onPress={() => {
                  setCurrentCid(cid);
                  setActiveTab(-1);
                }}
              >
                <Text style={[
                  styles.buttonText,
                  activeTab === -1 ? styles.activebuttonText : null
                ]}>
                  {translate('Tümü')}
                </Text>
              </TouchableOpacity>
              {altKategoriler.length > 0 && altKategoriler.map((kategori, index) => (
                <TouchableOpacity
                  key={kategori.id}
                  style={[styles.button, activeTab === index ? styles.activeButton : null]}
                  onPress={() => {
                    setCurrentCid(kategori.id);
                    setActiveTab(index);
                  }}
                >
                  <Text style={[
                    styles.buttonText,
                    activeTab === index ? styles.activebuttonText : null
                  ]}>
                    {kategori.ad}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {/* Ürün Listesi */}
          {isFirstLoading ? (
            <View style={stylesglobal.loaderview}>
              <LottieView
                source={require('../assets/animations/yukleme_ani.json')}
                autoPlay
                loop
                style={stylesglobal.loading}
              />
            </View>
          ) : (
            <FlatList
              style={{ marginHorizontal: 5 }}
              key={`${duzen}-${columns}`}
              data={productsData}
              renderItem={({ item, index }) => {
                let catstil;

                if (columns === 2) {
                  // columns=2 durumunda normalde index'e göre solda sağda vs. css'i ayırmak isterseniz
                  // catstil = 0 veya 1 gibi kullanabilirsiniz. (Sizin proje stilinize göre)
                  catstil = 0;
                } else {
                  catstil = index % 2 === 0 ? 1 : 2;
                }
                if (duzen === 1) {
                  return <UrunView1 item={item} kategoriden={true} catstil={catstil} />;
                } else if (duzen === 2) {
                  return <UrunView2 item={item} kategoriden={true} catstil={catstil} />;
                } else {
                  return <UrunView item={item} kategoriden={true} catstil={catstil} />;
                }
              }}
              keyExtractor={(item, index) => `${item.id}_${index}_${duzen}_${columns}`}
              numColumns={columns}
              columnWrapperStyle={columns > 1 ? { justifyContent: 'space-between' } : null}
              contentContainerStyle={{ flexGrow: 1 }}
              removeClippedSubviews={true}
              maxToRenderPerBatch={10}
              windowSize={7}
              initialNumToRender={10}
              ListFooterComponent={renderFooter}
              ListEmptyComponent={renderEmpty}
              onEndReachedThreshold={0.5}
              onEndReached={() => fetchMoreData()}
              // onScroll ile scroll yönünü yakala
              onScroll={handleScroll}
              scrollEventThrottle={16} // Her frame'de (16ms) onScroll tetiklenir
            />
          )}

          {/* Footer */}
          {showSubCategories && <View style={stylesglobal.footer}>
            <AnaFooter parametre={'Kategoriler'} navigation={navigation} />
          </View>}
        </View>

        {/* Filtre BottomSheet */}
        <BottomSheet
          sheetBackgroundColor={colors.background}
          hasDraggableIcon
          ref={bottomSheet}
          height={ekranYuksekligiInt}
        >
          <View style={{ flex: 1, justifyContent: 'flex-end' }}>
            <View style={{
              width: '100%',
              height: '100%',
              paddingHorizontal: 0,
              paddingVertical: 10,
              borderTopLeftRadius: 0,
              borderTopRightRadius: 0
            }}>
              <View style={{
                flexDirection: 'row',
                paddingHorizontal: 20,
                paddingVertical: 5,
                marginTop: 5,
                marginBottom: 10
              }}>
                <Text style={{
                  flex: 1,
                  fontSize: 14,
                  color: 'black',
                  textAlign: 'center',
                  fontFamily: 'NunitoSans-Bold'
                }}>
                  {global.toTitleCase(translate('Filtrele'))}
                </Text>
                <TouchableOpacity
                  style={{
                    alignSelf: 'flex-end',
                    width: 30,
                    height: 30,
                    position: 'absolute',
                    right: 18
                  }}
                  onPress={() => bottomSheet.current.close()}
                >
                  <Image
                    source={require('../assets/images/kapat.png')}
                    style={{ width: 30, height: 30 }}
                  />
                </TouchableOpacity>
              </View>

              <FiltrePop
                cid={cid}
                filtrebusayfada={filtrebusayfada}
                filtreBYsection={filtreBYsection}
                siralamasi={siralama}
                obek={obek}
                onCommand={handleFilterCommand}
              />
            </View>
          </View>
        </BottomSheet>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  headerCat: {

    flexDirection: 'row',
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: Platform.OS === 'android' ? 10 : 0,
    borderBottomWidth: 1,
    borderColor: colors.background,
  },
  emptyBasketContainer: {
    flex: 1,
    padding: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  emptyBasketImage: {},
  emptyBasketText: {
    fontFamily: "NunitoSans-Bold",
    fontSize: 16,
    color: 'black',
    marginTop: 20,
    marginBottom: 50
  },
  button: {
    padding: 12,
    height: 38,
    alignContent: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    color: 'black',
    borderRadius: 5,
    marginHorizontal: 5,
    borderWidth: 0.5,
    borderRadius: 6,
    borderColor: '#BAB09D'
  },
  activeButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  buttonText: {
    color: 'black',
    fontFamily: 'NunitoSans-Regular',
    fontSize: 11,
  },
  activebuttonText: {
    color: 'white',
  },
  scrollViewStyle: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginBottom: 8,
    height: 65
  },
});

export default Kategori;