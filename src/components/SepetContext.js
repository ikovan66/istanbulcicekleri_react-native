// SepetContext.js
import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Auth from './Auth';
import InsiderEvents from '../utils/InsiderHelper';
import { urls } from '../config/apiUrls';
import API_CONFIG from '../config/apiConfig';
import { fetchAktifDiller, fetchAktifKurlar, fetchCeviriler } from '../services/languageCurrencyService';
import { formatPrice as formatPriceUtil } from '../utils/priceFormatter';

// Statik çeviri sözlükleri (NJ'deki messages/site/*.json ile aynı yaklaşım)
import enTranslations from '../translations/en.json';
const staticDictionaries = {
  EN: enTranslations,
  // Yeni diller eklenirse: AR: arTranslations, DE: deTranslations vb.
};

export const SepetContext = createContext({
  // sepet
  sepetSayisi: 0,
  setSepetSayisi: () => { },

  // sepet
  sepetTutari: 0,
  setSepetTutari: () => { },

  // Favoriler
  favoriListesi: [],
  setFavoriListesi: () => { },
  checkFavoriler: () => { },
  favToggle: () => { },

  // Bölge Seçimi
  secilenMahItem: null,
  setSecilenMahItem: () => { },


  // dil/çeviri
  language: 'TR',
  setLanguage: () => { },
  translations: [],
  translate: () => { },
  fetchTranslations: () => { },  // Sunucudan çeviri çekme fonksiyonu

  // kur
  kur: 'TL',
  setKur: () => { },

  // multi-lang/multi-currency (NJ senkron)
  aktifDiller: [],
  aktifKurlar: [],
  activeCurrency: { id: 0, kurad: 'TRY', parite: 1, sembol: 'TL' },
  setCurrency: () => { },
  formatPrice: () => '',

  // insider product map
  insiderProductMap1: {},
  updateinsiderProductMap1: () => { },

  // Dinamik tenant logosu (Next.js sitesinden çekilir)
  logoUrl: API_CONFIG.defaultLogo,

  // Tenant'ın ürün sayfası bilgi HTML'i
  productInfoDeliveryHtml: '',
});

export const SepetProvider = ({ children }) => {
  const [sepetSayisi, setSepetSayisi] = useState(0);
  const [sepetTutari, setSepetTutari] = useState(0);
  const [favoriListesi, setFavoriListesi] = useState([]);
  const [language, setLanguage] = useState('TR');
  const [kur, setKur] = useState('TL');
  const [translations, setTranslations] = useState([]);
  const [aktifDiller, setAktifDiller] = useState([]);
  const [aktifKurlar, setAktifKurlar] = useState([]);
  const [activeCurrency, setActiveCurrency] = useState({ id: 0, kurad: 'TRY', parite: 1, sembol: 'TL' });
  const [logoUrl, setLogoUrl] = useState(API_CONFIG.defaultLogo);
  const [productInfoDeliveryHtml, setProductInfoDeliveryHtml] = useState('');


  const [insiderProductMap1, setinsiderProductMap1] = useState({});

  const fetchLogo = async (lang) => {
    try {
      // Önce cache'den oku
      const cachedLogo = await AsyncStorage.getItem('tenantLogoUrl');
      if (cachedLogo) {
        setLogoUrl(cachedLogo);
      }
      const cachedDeliveryHtml = await AsyncStorage.getItem('productInfoDeliveryHtml');
      if (cachedDeliveryHtml) {
        setProductInfoDeliveryHtml(cachedDeliveryHtml);
      }

      // Arka planda güncel verileri çek (dil parametresiyle)
      const langParam = (lang && lang.toLowerCase() !== 'tr') ? `?lang=${lang.toLowerCase()}` : '';
      const response = await fetch(`${API_CONFIG.webBaseUrl}/api/app-logo${langParam}`);
      if (response.ok) {
        const data = await response.json();
        if (data.logo) {
          setLogoUrl(data.logo);
          await AsyncStorage.setItem('tenantLogoUrl', data.logo);
        }
        if (data.productInfoDeliveryHtml !== undefined) {
          setProductInfoDeliveryHtml(data.productInfoDeliveryHtml || '');
          await AsyncStorage.setItem('productInfoDeliveryHtml', data.productInfoDeliveryHtml || '');
        }
      }
    } catch (err) {
      console.log('Logo/ayar çekme hatası:', err);
    }
  };

  useEffect(() => {
    const loadFromAsync = async () => {
      try {
        const dilStored = await AsyncStorage.getItem('dil');
        if (dilStored) setLanguage(dilStored);

        const kurStored = await AsyncStorage.getItem('kur');
        if (kurStored) setKur(kurStored);

        const translationsStored = await AsyncStorage.getItem('ceviriler');
        if (translationsStored) {
          setTranslations(JSON.parse(translationsStored));
        } else {

          await fetchTranslations();
        }

        // Load Insider Product Map
        const insiderMapStored = await AsyncStorage.getItem('insiderProductMap1');
        if (insiderMapStored) {
          setinsiderProductMap1(JSON.parse(insiderMapStored));
        }

        // Load Favorites
        const favStored = await AsyncStorage.getItem('favoriListesi');
        if (favStored) {
          setFavoriListesi(JSON.parse(favStored));
        }
        // Background update for favorites
        checkFavoriler();

      } catch (err) {
        console.log('Dil/Kur/çeviri/Favori yüklenirken hata:', err);
      }
    };

    // Load Mahalle Item from AsyncStorage
    const loadMahalle = async () => {
      try {
        const mahalleStored = await AsyncStorage.getItem('@mahalleitem');
        if (mahalleStored) {
          setSecilenMahItem(JSON.parse(mahalleStored));
        }
      } catch (e) {
        console.log('Mahalle yükleme hatası:', e);
      }
    };

    loadFromAsync();
    loadMahalle();
    fetchLogo(language); // Tenant logosunu çek (dil parametresiyle)
    loadLanguagesAndCurrencies(); // Aktif dil/kur verilerini çek
  }, []);

  // Dil değiştiğinde productInfoDeliveryHtml'i güncel dilde yeniden çek
  useEffect(() => {
    if (language) {
      fetchLogo(language);
    }
  }, [language]);

  const [secilenMahItem, setSecilenMahItem] = useState(null);

  const updateSecilenMahItem = async (item) => {
    try {
      if (item === null) {
        await AsyncStorage.removeItem('@mahalleitem');
        setSecilenMahItem(null);
      } else {
        const itemStr = typeof item === 'string' ? item : JSON.stringify(item);
        const itemObj = typeof item === 'string' ? JSON.parse(item) : item;
        await AsyncStorage.setItem('@mahalleitem', itemStr);
        setSecilenMahItem(itemObj);
      }
    } catch (e) {
      console.log('Mahalle save error:', e);
    }
  };

  // Removed duplicate useEffect for insiderMap loading since it's merged above

  const updateinsiderProductMap1 = async (productDetails) => {
    if (!productDetails || !productDetails.id) return;

    setinsiderProductMap1(prevMap => {
      const newMap = { ...prevMap, [productDetails.id]: productDetails };
      AsyncStorage.setItem('insiderProductMap1', JSON.stringify(newMap));
      return newMap;
    });
  };

  const fetchTranslations = async () => {
    try {
      const data = await fetchCeviriler();
      if (data && data.length > 0) {
        setTranslations(data);
        await AsyncStorage.setItem('ceviriler', JSON.stringify(data));
      }
    } catch (error) {
      console.log('Sunucudan çeviri çekme hatası:', error);
    }
  };

  // Aktif dilleri ve kurları backend'den çek (NJ senkron)
  const loadLanguagesAndCurrencies = async () => {
    try {
      // Aktif diller
      const diller = await fetchAktifDiller();
      if (diller.length > 0) {
        setAktifDiller(diller);
        await AsyncStorage.setItem('aktifDiller', JSON.stringify(diller));
      }

      // Aktif kurlar
      const kurlar = await fetchAktifKurlar();
      if (kurlar.length > 0) {
        setAktifKurlar(kurlar);
        await AsyncStorage.setItem('aktifKurlar', JSON.stringify(kurlar));

        // Mevcut kur seçimine göre activeCurrency'i belirle
        const savedKurad = await AsyncStorage.getItem('kur');
        let active = null;
        if (savedKurad) {
          active = kurlar.find(k => (k.kurad || '').trim().toUpperCase() === savedKurad.trim().toUpperCase());
        }
        if (!active) {
          active = kurlar.find(k => k.is_default) || kurlar.find(k => parseFloat(k.parite) === 1) || kurlar[0];
        }
        if (active) {
          const currency = {
            id: active.id,
            kurad: (active.kurad || '').trim(),
            parite: parseFloat(active.parite) || 1,
            sembol: (active.sembol || active.kurad || '').trim(),
          };
          setActiveCurrency(currency);
          setKur(currency.sembol || currency.kurad);
        }
      }
    } catch (error) {
      console.log('Dil/Kur yükleme hatası:', error);
    }
  };

  // Kur seçimi değiştirme (NJ setCurrency pattern)
  const setCurrency = async (kurad) => {
    const normalKurad = (kurad || '').trim().toUpperCase();
    const found = aktifKurlar.find(k => (k.kurad || '').trim().toUpperCase() === normalKurad);
    if (found) {
      const currency = {
        id: found.id,
        kurad: (found.kurad || '').trim(),
        parite: parseFloat(found.parite) || 1,
        sembol: (found.sembol || found.kurad || '').trim(),
      };
      setActiveCurrency(currency);
      setKur(currency.sembol || currency.kurad);
      await AsyncStorage.setItem('kur', currency.kurad);
    }
  };

  // formatPrice wrapper — context üzerinden erişilebilir
  const formatPriceFn = (price) => {
    return formatPriceUtil(price, activeCurrency);
  };

  const checkFavoriler = async () => {
    console.log('checkFavoriler called');
    try {
      var username = await AsyncStorage.getItem('username');
      var memberID = await AsyncStorage.getItem('memberID');
      console.log('User:', username, 'MemberID:', memberID);
      if (!username || !memberID) return;

      var model = {
        username: username,
        memberID: memberID
      };

      const response = await Auth.post(`${urls.favorilerim}`, model);
      console.log('Favoriler response:', response.data ? response.data.length : 'null');
      if (response.data) {
        setFavoriListesi(response.data);
        await AsyncStorage.setItem('favoriListesi', JSON.stringify(response.data));
      }
    } catch (error) {
      console.log("Favorileri güncelleme hatası:", error);
    }
  };

  const favToggle = async (pid, navigation) => {
    console.log('favToggle called for pid:', pid);
    const memberID = await AsyncStorage.getItem('memberID');
    if (memberID == null) {
      if (navigation) navigation.navigate('GirisNav');
      return;
    }

    // Determine if currently favorited based on string IDs
    const isFav = favoriListesi.some(item => String(item.id) === String(pid));
    console.log('Current status isFav:', isFav);
    const islem = isFav ? "sil" : "ekle";

    var model = {
      islem: islem,
      pid: pid
    }

    try {
      // Optimistic UI Update
      let newFavList;
      if (islem === "sil") {
        newFavList = favoriListesi.filter(item => String(item.id) !== String(pid));
        InsiderEvents.itemRemovedFromWishlist(pid);
        if (newFavList.length === 0) InsiderEvents.wishlistCleared();
      } else {
        // Creating a temporary item for optimistic update if needed, but best to refresh list or just rely on checkFavoriler logic.
        // For better UX, we can just trigger checkFavoriler after API call, or manually add if we have details.
        // Since we don't have full product details here easily for the list, we'll rely on checkFavoriler to fetch fresh data.
        InsiderEvents.itemAddedToWishlist({ id: pid, product_id: pid });
      }

      // We update local state optimistically only for removal to feel instant. 
      // For adding, we wait for server unless we pass full product object (which we can refactor later if needed).
      // For now, let's just do the API call then refresh.

      await Auth.post(`${urls.favoriEkle}`, model);

      await checkFavoriler(); // Refresh list from server to get full details (images etc)

    } catch (error) {
      console.log("Favori işlemi hatası:", error);
    }
  };


  // 3) language ya da kur değiştiğinde AsyncStorage’a yazmak isterseniz:
  useEffect(() => {
    AsyncStorage.setItem('dil', language);
  }, [language]);

  useEffect(() => {
    AsyncStorage.setItem('kur', kur);
  }, [kur]);

  // 4) translate fonksiyonu
  const translate = (key) => {
    if (!key) return '';

    // Ana dil (TR) seçiliyse key'in kendisi zaten Türkçe metindir
    if (language === 'TR') return key;

    // Statik sözlükten bak (NJ pattern)
    const dict = staticDictionaries[language];
    if (dict && dict[key]) return dict[key];

    // Backend çevirilerinden bak (translations state)
    const found = translations.find(item => item.ifade === key);
    if (found && found.ceviri) return found.ceviri;

    // Fallback: key'in kendisi
    return key;
  };

  return (
    <SepetContext.Provider
      value={{
        sepetSayisi,
        setSepetSayisi,

        sepetTutari,
        setSepetTutari,

        language,
        setLanguage,

        translations,
        translate,
        fetchTranslations,

        kur,
        setKur,

        // Multi-lang/multi-currency (NJ senkron)
        aktifDiller,
        aktifKurlar,
        activeCurrency,
        setCurrency,
        formatPrice: formatPriceFn,

        insiderProductMap1,
        updateinsiderProductMap1,

        favoriListesi,
        setFavoriListesi,
        checkFavoriler,
        favToggle,

        secilenMahItem,
        setSecilenMahItem: updateSecilenMahItem,

        logoUrl,

        productInfoDeliveryHtml,
      }}
    >
      {children}
    </SepetContext.Provider>
  );
};