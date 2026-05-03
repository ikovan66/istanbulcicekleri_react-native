import React, { useContext, useState, useRef, useEffect } from 'react';
import { Dimensions, View, Text, TouchableOpacity, ScrollView, StyleSheet, Animated, ActivityIndicator } from 'react-native';
import FastImage from 'react-native-fast-image';
import stylesglobal from '../stylesglobal';
import AnaFooter from '../components/AnaFooter';
import SagOk from '../components/SagOk';
import SolOk from '../components/SolOk';
import { SafeAreaView } from 'react-native-safe-area-context';
import LottieView from 'lottie-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SepetContext } from '../components/SepetContext';
import Arama_V2 from '../components/Arama_v2';
import Svg, { Path, Circle } from 'react-native-svg';

import axios from 'axios';
import InsiderEvents from '../utils/InsiderHelper';
import { urls } from '../config/apiUrls';
import { colors } from '../config/theme';
import API_CONFIG from '../config/apiConfig';


// Next.js mobile categories API
const NEXTJS_CATEGORIES_URL = `https://${API_CONFIG.universalDomain}/api/mobile/categories`;

/**
 * .NET kategori ağacından düz url → id haritası oluştur (recursive)
 */
const buildSlugToIdMap = (categories, map = {}) => {
  if (!Array.isArray(categories)) return map;
  for (const cat of categories) {
    const url = (cat.url || '').replace(/^\/+/, '').toLowerCase();
    if (url && cat.id) {
      map[url] = cat.id;
    }
    if (cat.altkategori && Array.isArray(cat.altkategori)) {
      buildSlugToIdMap(cat.altkategori, map);
    }
  }
  return map;
};

/**
 * navigation item → app menu format dönüştürücü
 * slugToIdMap ile her href'i numeric category ID'ye çözümler
 */
const transformNavigationToMenu = (navItems, slugToIdMap = {}) => {
  const resolveId = (item) => {
    // 1. cat-XXX prefix varsa direkt çıkar
    if (item.id?.startsWith('cat-')) {
      return parseInt(item.id.replace('cat-', ''), 10) || 0;
    }
    // 2. href'ten slug çıkar ve map'te ara
    const slug = (item.href || '').replace(/^\/+/, '').toLowerCase();
    if (slug && slugToIdMap[slug]) {
      return slugToIdMap[slug];
    }
    // 3. dataValue'dan dene
    const dv = (item.dataValue || '').toLowerCase();
    if (dv && slugToIdMap[dv]) {
      return slugToIdMap[dv];
    }
    return 0;
  };

  return navItems.map(item => {
    const numericId = resolveId(item);
    const cleanHref = (item.href || '').replace(/^\/+/, '');

    // Alt kategorileri oluştur
    let altkategori = null;

    if (item.children && item.children.length > 0) {
      altkategori = item.children.map((child, ci) => {
        const childSlug = (child.href || '').replace(/^\/+/, '').toLowerCase();
        const childDv = (child.dataValue || '').toLowerCase();
        const childId = slugToIdMap[childSlug] || slugToIdMap[childDv] || 0;
        return {
          _menuKey: `${item.id}-child-${ci}`,
          id: childId,
          ad: child.label,
          url: child.href || '',
          altkategori: null,
        };
      });
    } else if (item.columns && item.columns.length > 0) {
      // mega-menu: columns'daki linkleri düzleştir
      const seen = new Set();
      const allLinks = [];
      item.columns.forEach(col => {
        (col.links || []).forEach(link => {
          const key = link.href || link.label;
          if (!seen.has(key)) {
            seen.add(key);
            allLinks.push(link);
          }
        });
      });
      if (allLinks.length > 0) {
        altkategori = allLinks.map((link, li) => {
          const linkSlug = (link.href || '').replace(/^\/+/, '').toLowerCase();
          const linkDv = (link.dataValue || '').toLowerCase();
          const linkId = slugToIdMap[linkSlug] || slugToIdMap[linkDv] || 0;
          return {
            _menuKey: `${item.id}-link-${li}`,
            id: linkId,
            ad: link.label,
            url: link.href || '',
            altkategori: null,
          };
        });
      }
    }

    return {
      _menuKey: item.id || `nav-${cleanHref}`,
      id: numericId,
      ad: item.label,
      url: cleanHref,
      resim: item.mobileIcon || '',
      altkategori,
    };
  });
};

/**
 * .NET kategoriler API'sinden tüm kategori ağacını çek
 */
const fetchDotNetCategories = async () => {
  try {
    const response = await axios.post(
      urls.kategoriler,
      {},
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data || [];
  } catch (e) {
    console.log('[KategoriSayfa] .NET kategoriler fetch failed:', e.message);
    return [];
  }
};

const fetchMenuItems = async (lang) => {
  // 1. NJ navigation + .NET kategoriler paralel çek
  let navigation = null;
  let dotNetCategories = [];

  try {
    const langParam = (lang && lang.toLowerCase() !== 'tr') ? `&lang=${lang.toLowerCase()}` : '';
    const [njResponse, dotNetCats] = await Promise.all([
      axios.get(
        `${NEXTJS_CATEGORIES_URL}?domain=${API_CONFIG.universalDomain}${langParam}`,
        { timeout: 5000, headers: { 'Accept': 'application/json', 'User-Agent': 'IstanbulCicekleriApp/1.0' } }
      ).catch(e => {
        console.log('[KategoriSayfa] Next.js API failed:', e.message);
        return null;
      }),
      fetchDotNetCategories(),
    ]);

    if (njResponse?.data?.categories?.length > 0) {
      // NJ categories varsa direkt kullan (zaten numeric ID'li)
      return njResponse.data.categories;
    }

    navigation = njResponse?.data?.navigation || null;
    dotNetCategories = dotNetCats;
  } catch (e) {
    console.log('[KategoriSayfa] Parallel fetch error:', e.message);
  }

  // 2. Navigation varsa, .NET'ten slug→ID haritası oluştur ve dönüştür
  if (navigation && navigation.length > 0 && dotNetCategories.length > 0) {
    const slugToIdMap = buildSlugToIdMap(dotNetCategories);
    console.log('[KategoriSayfa] navigation + .NET ID eşleme kullanılıyor');
    return transformNavigationToMenu(navigation, slugToIdMap);
  }

  // 3. Fallback: .NET kategorileri direkt kullan
  if (dotNetCategories.length > 0) {
    return dotNetCategories;
  }

  return [];
};

const MenuItem = ({ item, onItemPressed, isSubmenu, showAll }) => {
  const { fetchTranslations, translate } = useContext(SepetContext);

  const hasSubMenu = item.altkategori && item.altkategori.length > 0;
  const imageUrl = item.resim || item.mobileIcon || '';
  const slideAnim = useRef(new Animated.Value(300)).current;
  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={{ transform: [{ translateX: slideAnim }] }}>
      <TouchableOpacity onPress={() => onItemPressed(item, hasSubMenu, showAll)}>
        <View style={styles.ButtonRow}>
          {imageUrl ? (
            <FastImage
              style={styles.menuImage}
              source={{ uri: imageUrl, priority: FastImage.priority.normal }}
              resizeMode={FastImage.resizeMode.cover}
            />
          ) : null}
          <Text style={[styles.title, imageUrl ? { marginLeft: 10 } : null]}>
            {showAll ? `${item.ad}` : item.ad}
          </Text>
          {hasSubMenu && !item.ad.includes(translate('Tüm Ürünler')) && <SagOk style={{ backgroundColor: 'black' }} />}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const DrawerMenu = ({ navigation }) => {
  const [menuItems, setMenuItems] = useState(null);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);  // Yükleme durumunu izlemek için state
  const { fetchTranslations, translate, language, setLanguage, kur, aktifDiller, aktifKurlar, setCurrency, activeCurrency } = useContext(SepetContext);

  useEffect(() => {
    const loadMenuItems = async () => {
      setIsLoading(true);
      const items = await fetchMenuItems(language);
      setMenuItems(items);
      setIsLoading(false);
    };
    loadMenuItems();
  }, [language]);

  const onItemPressed = (item, hasSubMenu, showAll = false) => {
    if (hasSubMenu && !showAll) {

      setHistory([...history, item]);
      // Trigger Insider Listing Page Event for subcategory
      const taxonomy = [item.ad];
      InsiderEvents.visitListingPage(taxonomy);
    } else {

      navigation.navigate('KategoriNav', { cid: item.id, title: item.ad, obek: item.obek || item.url || '', altKategoriler: item.altkategori, showAll });
    }
  };

  const goBack = () => {
    history.pop();
    setHistory([...history]);
  };

  const getCurrentItems = () => {
    if (history.length > 0) {
      const current = history[history.length - 1];
      return [{ ...current, _menuKey: `${current._menuKey || current.id}-all`, ad: `${current.ad} ` + translate('Tüm Ürünler') }, ...current.altkategori];
    }
    return menuItems;
  };

  if (isLoading) {
    return (

      <SafeAreaView style={stylesglobal.SafeAreaCSS}>
        <View style={stylesglobal.loaderview}>
          <LottieView source={require('../assets/animations/yukleme_ani.json')}
            autoPlay loop style={stylesglobal.loading} />
        </View>
      </SafeAreaView>

    );
  }

  return (


    <SafeAreaView style={stylesglobal.SafeAreaCSS} edges={['bottom', 'left', 'right']}>
      <View style={{ flex: 1, backgroundColor: colors.white }}>
        <SafeAreaView style={{ flex: 1 }}
          edges={['top', 'left', 'right']}>

          <View style={{ flex: 1 }}> 

            <View style={{ padding: 10, flexDirection: 'row', alignItems: 'center' }} >
              <View style={styles.line2}></View>
              <Text style={{ color: 'black', opacity: .8, fontFamily: 'NunitoSans-Regular' }}>{translate('Kategoriler')}</Text>
              <View style={styles.line}></View>

            </View>
            <View style={styles.src}>
              <Arama_V2 navigation={navigation}></Arama_V2>
            </View>
            {history.length > 0 && (
              <TouchableOpacity onPress={goBack} style={styles.header}>
                <View style={styles.solokcontianer}><SolOk style={{ backgroundColor: 'black' }} /></View>
                <Text style={styles.headerTitle}>{history.length > 0 ? history[history.length - 1].ad : "Ana Menü"}</Text>
              </TouchableOpacity>
            )}
            <ScrollView style={{ flex: 1 }}>
              {menuItems && getCurrentItems().map((item, index) => (
                <MenuItem key={item._menuKey || `${item.id}-${index}`} item={item} onItemPressed={onItemPressed} isSubmenu={history.length > 0}
                  showAll={index === 0}
                />
              ))}

              {/* Dil & Kur Seçimi — sadece birden fazla seçenek varsa göster */}
              {history.length === 0 && (aktifDiller?.length > 1 || aktifKurlar?.length > 1) && (
                <View style={styles.langCurrContainer}>
                  {/* Dil Seçici — sadece birden fazla dil varsa */}
                  {aktifDiller?.length > 1 && (
                  <View style={styles.selectorRow}>
                    <View style={styles.selectorIcon}>
                      <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                        <Circle cx="12" cy="12" r="9" stroke={colors.textDark} strokeWidth={1.5} />
                        <Path d="M3 12h18M12 3c2.5 2.5 4 5.5 4 9s-1.5 6.5-4 9c-2.5-2.5-4-5.5-4-9s1.5-6.5 4-9z" stroke={colors.textDark} strokeWidth={1.5} />
                      </Svg>
                    </View>
                    <View style={styles.selectorButtons}>
                      {aktifDiller.map((dil) => {
                        const dilCode = (typeof dil === 'string' ? dil : (dil.kisa || '')).toUpperCase();
                        const isActive = (language || 'TR').toUpperCase() === dilCode;
                        return (
                          <TouchableOpacity
                            key={dilCode}
                            style={[styles.selectorBtn, isActive && styles.selectorBtnActive]}
                            onPress={async () => {
                              if (!isActive) {
                                setLanguage(dilCode);
                                await AsyncStorage.setItem('dil', dilCode);
                              }
                            }}
                          >
                            <Text style={[styles.selectorBtnText, isActive && styles.selectorBtnTextActive]}>
                              {dilCode}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                  )}

                  {/* Kur Seçici — sadece birden fazla kur varsa */}
                  {aktifKurlar?.length > 1 && (
                  <View style={styles.selectorRow}>
                    <View style={styles.selectorIcon}>
                      <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                        <Circle cx="12" cy="12" r="9" stroke={colors.textDark} strokeWidth={1.5} />
                        <Path d="M12 6v12M9 8.5c0 0 0-1.5 3-1.5s3 1.5 3 1.5-0 1.5-3 2-3 2-3 2 0 1.5 3 1.5 3-1.5 3-1.5" stroke={colors.textDark} strokeWidth={1.5} strokeLinecap="round" />
                      </Svg>
                    </View>
                    <View style={styles.selectorButtons}>
                      {aktifKurlar.map((kurItem) => {
                        const kurad = (kurItem.kurad || '').trim().toUpperCase();
                        const sembol = (kurItem.sembol || kurItem.kurad || '').trim();
                        const isActive = activeCurrency?.kurad?.toUpperCase() === kurad;
                        return (
                          <TouchableOpacity
                            key={kurad}
                            style={[styles.selectorBtn, isActive && styles.selectorBtnActive]}
                            onPress={() => {
                              if (!isActive) {
                                setCurrency(kurad);
                              }
                            }}
                          >
                            <Text style={[styles.selectorBtnText, isActive && styles.selectorBtnTextActive]}>
                              {sembol}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                  )}
                </View>
              )}

            </ScrollView>

          </View>
        </SafeAreaView>
      </View>
      <View style={stylesglobal.footer}>
        <AnaFooter parametre={'Kategoriler'} navigation={navigation} />
      </View>

    </SafeAreaView>

  );
};

export default DrawerMenu;

const styles = StyleSheet.create({
  line: {
    flex: 1,
    borderBottomColor: 'black',
    opacity: .5,
    borderBottomWidth: 1,
    alignSelf: 'center', // Ortalar çizgiyi
    marginLeft: 5
  },
  line2: {
    flex: 1,
    borderBottomColor: 'black',
    opacity: .5,
    borderBottomWidth: 1,
    alignSelf: 'center', // Ortalar çizgiyi
    marginRight: 5
  },
  solokcontianer: {
    position: 'absolute', left: 20,
  },
  ButtonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    paddingLeft: 25,
    borderBottomWidth: 2,
    borderBottomColor: colors.bgLight,
  },
  title: {
    flex: 1,
    fontFamily: 'NunitoSans-Regular',
    color: 'black',
    fontSize: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: 14,
    paddingLeft: 25,
    paddingTop: 0,
    position: 'relative',
    borderBottomWidth: 1,
    borderBottomColor: colors.bgLight,
  },
  src: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: 10,
    paddingTop: 0,
    position: 'relative',
    borderBottomWidth: 1,
    borderBottomColor: colors.bgLight,
  },
  headerTitle: {
    fontFamily: 'NunitoSans-SemiBold',
    flex: 1,
    fontSize: 16,
    color: 'black',
    textAlign: 'center'
  },
  baklava: {
    opacity: .5,
    fontSize: 10
  },
  menuImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  langCurrContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.bgLight,
  },
  selectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  selectorIcon: {
    width: 28,
    alignItems: 'center',
  },
  selectorButtons: {
    flexDirection: 'row',
    flex: 1,
    marginLeft: 8,
    gap: 6,
  },
  selectorBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border || '#ddd',
    backgroundColor: colors.bgLight || '#f5f5f5',
  },
  selectorBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  selectorBtnText: {
    fontFamily: 'NunitoSans-SemiBold',
    fontSize: 13,
    color: colors.textDark || '#333',
  },
  selectorBtnTextActive: {
    color: '#fff',
  },
});
