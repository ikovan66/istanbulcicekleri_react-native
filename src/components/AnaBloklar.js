import React, { useContext, useState, useEffect, useRef, useCallback } from 'react';
import { FlatList, RefreshControl, View, Text, AppState, StyleSheet } from 'react-native';

import { renderPuckBlock, preparePuckData } from './puck/PuckRenderer';
import { useNavigation } from '@react-navigation/native';
import stylesglobal from '../stylesglobal';
import LottieView from 'lottie-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { SepetContext } from './SepetContext';
import { useRoute } from '@react-navigation/native';
import Auth from '../components/Auth';
import { urls } from '../config/apiUrls';

// ── Puck CMS API (Next.js) ──
const PUCK_API_BASE = 'https://www.istanbulcicekleri.com';
const PUCK_HOME_URL = `${PUCK_API_BASE}/api/mobile/home`;


const AnaBloglar = (props) => {
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setisLoading] = useState(true);
  const [isLoadingREFRESH, setisLoadingREFRESH] = useState(false);
  const { fetchTranslations, secilenMahItem, language } = useContext(SepetContext);
  const appState = useRef(AppState.currentState);
  const route = useRoute();

  const [listData, setListData] = useState([]);
  const [usePuck, setUsePuck] = useState(true); // Puck mi legacy mi?

  // ── Puck API'den veri çek ──
  const fetchPuckData = async (bolgeId) => {
    try {
      const params = new URLSearchParams({ domain: 'www.istanbulcicekleri.com' });
      if (bolgeId) params.append('bolgeid', bolgeId);
      if (language && language.toLowerCase() !== 'tr') params.append('lang', language.toLowerCase());

      const response = await axios.get(`${PUCK_HOME_URL}?${params.toString()}`, {
        timeout: 10000,
      });

      const puckContent = response.data?.content;
      if (!puckContent || !Array.isArray(puckContent) || puckContent.length === 0) {
        throw new Error('Empty Puck content');
      }

      const formattedData = preparePuckData(puckContent);
      setListData(formattedData);
      setUsePuck(true);
      return true;
    } catch (error) {
      console.log('[AnaBloklar] Puck API failed, falling back to legacy:', error.message);
      return false;
    }
  };

  // ── Legacy API (fallback) ──
  const fetchLegacyData = async (bolgeId) => {
    try {
      const response = await axios.get(urls.blocks, {
        params: { bolgeid: bolgeId },
        timeout: 10000,
      });

      const formattedData = response.data.map((item, i) => ({
        ...item,
        id: item.blockType + i.toString(),
        type: item.blockType,
        _key: item.blockType + i.toString(),
      }));
      console.log('AnaBloklar fetchData formattedData:', JSON.stringify(formattedData));
      setListData(formattedData);
      setUsePuck(false);
    } catch (error) {
      console.error('[AnaBloklar] Legacy API also failed:', error.message);
    }
  };

  // ── Ana veri çekme fonksiyonu ──
  const fetchData = async () => {
    setisLoadingREFRESH(true);

    const bolgeId = secilenMahItem?.bolge_id || null;
    console.log('[AnaBloklar] fetchData bolgeId:', bolgeId);

    // Önce Puck CMS'ten dene, başarısız olursa legacy'ye düş
    const puckSuccess = await fetchPuckData(bolgeId);
    if (!puckSuccess) {
      await fetchLegacyData(bolgeId);
    }

    setisLoading(false);
    setisLoadingREFRESH(false);
    setRefreshing(false);

    checkfAV();
  };

  // ── Legacy render (fallback mode) ──
  // Lazy-import legacy components only when needed
  const renderLegacyItem = useCallback(({ item, index }) => {
    // Dynamic imports would be better but RN doesn't support them well,
    // so we keep direct imports but only execute them in legacy mode
    const AnaSlider = require('./AnaSlider').default;
    const AnaIkonList = require('./AnaIkonList').default;
    const AnaUrunlist = require('./AnaUrunlist').default;
    const AnaUrunlistYatay = require('./AnaUrunlistYatay').default;
    const VideoPlaylist = require('./VideoPlaylist').default;

    switch (item.type) {
      case "Ana Slider":
        return <AnaSlider data={item.bannerlist} key={item.id} navigation={navigation} multislidewidth={1.22} />;
      case "Ana Yan Görseller":
        return <AnaSlider data={item.bannerlist} key={item.id} navigation={navigation} multislidewidth={1.22} />;
      case "İkon Görseller":
        return <AnaIkonList data={item.bannerlist} key={item.id} navigation={navigation} />;
      case "3 Görsel":
        return <AnaSlider data={item.bannerlist} key={item.id} navigation={navigation} multislidewidth={1.75} />;
      case "Video":
        return <VideoPlaylist data={item.bannerlist} key={item.id} />;
      case "Urunler":
        return (
          <View key={item.id}>
            <Text style={{ fontFamily: 'NunitoSans-SemiBold', fontSize: 18, margin: 15, color: 'black' }}>
              {item.urunlistAD}
            </Text>
            {item.bloklisttip === 0 && <AnaUrunlist urunlist={item.urunlist} navigation={navigation} />}
            {item.bloklisttip === 1 && <AnaUrunlistYatay urunlist={item.urunlist} navigation={navigation} />}
          </View>
        );
      default:
        return null;
    }
  }, []);

  // ── Render seçimi: Puck veya Legacy ──
  const renderItem = usePuck ? renderPuckBlock(navigation) : renderLegacyItem;

  // FlatList Footer
  const ListFooter = useCallback(() => (
    <View style={{ paddingBottom: 20 }} />
  ), []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const checkfAV = async () => {
    const memberID = await AsyncStorage.getItem('memberID');
    if (memberID) {
      const username = await AsyncStorage.getItem('username');
      const model = { username, memberID };
      const response = await Auth.post(`${urls.favorilerim}`, {
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      });
      await AsyncStorage.setItem('favoriListesi', JSON.stringify(response.data));
    }
  };

  useEffect(() => {
    fetchData();

    const subscription = AppState.addEventListener('change', nextAppState => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        fetchData();
      }
      appState.current = nextAppState;
    });

    return () => subscription.remove();
  }, [secilenMahItem?.bolge_id, language]);

  // Insider SDK - Homepage View Event (moved to AnaSayfa.js useFocusEffect)

  useEffect(() => {
    if (route.params?.refresh) {
      fetchData();
      navigation.setParams({ refresh: false });
    }
  }, [route.params?.refresh]);

  // Scroll handling
  const handleScroll = useCallback((event) => {
    const scrollPosition = event.nativeEvent.contentOffset.y;
    props.onScrollTop(scrollPosition < 10);
  }, [props.onScrollTop]);

  if (isLoading) {
    return (
      <View style={stylesglobal.loaderview}>
        <LottieView source={require('../assets/animations/yukleme_ani.json')} autoPlay loop style={stylesglobal.loading} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={listData}
        renderItem={renderItem}
        keyExtractor={(item) => item._key || item.id}
        ListFooterComponent={ListFooter}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            progressViewOffset={60}
          />
        }
        onScroll={handleScroll}
        scrollEventThrottle={16}
        initialNumToRender={3}
        maxToRenderPerBatch={5}
        windowSize={7}
        contentContainerStyle={{
          paddingTop: 80,
          flexGrow: 1,
        }}
        removeClippedSubviews={true}
      />

      {isLoadingREFRESH && (
        <View style={stylesglobal.loaderviewPOP}>
          <LottieView source={require('../assets/animations/yukleme_ani.json')}
            autoPlay loop
            style={stylesglobal.loading} />
        </View>
      )}
    </View>
  );
};

export default AnaBloglar;