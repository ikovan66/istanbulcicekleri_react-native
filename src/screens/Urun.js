import API_CONFIG from '../config/apiConfig';
/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable react-native/no-inline-styles */
import React, {
  useMemo,
  useContext,
  useLayoutEffect,
  useState,
  useEffect,
  useRef,
} from 'react';
import {
  Share,
  ScrollView,
  TouchableOpacity,
  View,
  Image,
  Text,
  Alert,
  StyleSheet,
  Animated, Dimensions,
  PanResponder,
  Linking
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useNavigationState } from '@react-navigation/native';
import axios from 'axios';
import stylesglobal from '../stylesglobal';
import Svg, { G, Path, Circle, Rect, Polyline, Line } from 'react-native-svg';
import DynamicIcon from '../components/DynamicIcon';
import AsyncStorage from '@react-native-async-storage/async-storage';
import UrunResimSlider from '../components/UrunResimSlider';
import UrunCesitButonlar from '../components/UrunCesitButonlar';
import { SepetContext } from '../components/SepetContext'; // İçe aktarma
import BirlikteSepete from '../components/BirlikteSepete'; // İçe aktarma
import KalpIcon from '../components/KalpIcon';
import { SvgXml } from 'react-native-svg';
import IkostButton from "../components/IkostButton";
import AnaUrunlistYatay from '../components/AnaUrunlistYatay';
import HeaderleftComp from '../components/HeaderleftComp';
import LottieView from 'lottie-react-native';
import BottomSheet from '../components/IkostBottomSheet';
import MahalleSec from '../components/MahalleSec';
import GunSaatSec from '../components/GunSaatSec';
import { useRoute } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ikostalert } from '../GlobalAlert';
import RenderHTML from 'react-native-render-html';
import { WebView } from 'react-native-webview';
import InsiderEvents from '../utils/InsiderHelper';
import FacebookEvents from '../utils/FacebookEvents';
import FirebaseEvents from '../utils/FirebaseEvents';
import AdresSecimBar from '../components/AdresSecimBar';
import { urls } from '../config/apiUrls';
import { colors } from '../config/theme';

const AutoHeightWebView = ({ htmlContent }) => {
  const [webViewHeight, setWebViewHeight] = useState(100);

  const customHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <style>
          body {
            margin: 0;
            padding: 0;
            font-family: 'NunitoSans', -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            background-color: transparent;
          }
        </style>
      </head>
      <body>
        <div id="wrapper">
          ${htmlContent}
        </div>
        <script>
          function updateHeight() {
            var wrapper = document.getElementById('wrapper');
            if (wrapper) {
               window.ReactNativeWebView.postMessage(wrapper.offsetHeight);
            }
          }
          window.onload = updateHeight;
          setTimeout(updateHeight, 500);
        </script>
      </body>
    </html>
  `;

  return (
    <View style={{ height: webViewHeight, marginBottom: 15 }}>
      <WebView
        originWhitelist={['*']}
        source={{ html: customHtml }}
        style={{ height: webViewHeight, backgroundColor: 'transparent', opacity: 0.99 }}
        onMessage={(event) => {
          const height = parseInt(event.nativeEvent.data, 10);
          if (height > 0 && height !== webViewHeight) {
            setWebViewHeight(height + 10);
          }
        }}
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        javaScriptEnabled={true}
        domStorageEnabled={true}
      />
    </View>
  );
};

const UrunSayfa = () => {
  const Url = `${API_CONFIG.frontendApi}/api/`;
  const { fetchTranslations, translate, updateinsiderProductMap1, secilenMahItem, productInfoDeliveryHtml, formatPrice, language } = useContext(SepetContext);
  const [isAtTop, setIsAtTop] = useState(true);

  const route = useRoute();
  const navigation = useNavigation();

  // Navigation stack'te geri gidebilecek sayfa var mı kontrol et (deep link için)
  const navigationIndex = useNavigationState(state => state.index);
  const canGoBack = navigationIndex > 0;

  const { pid } = route.params;
  const [product, setProduct] = useState(null);
  const scrollY = useRef(new Animated.Value(0)).current;
  const [cid, setCid] = useState(0);
  const [sepetSAY, setSepetSAY] = useState(0);
  const [renk, setRenk] = useState('');
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [sepetactionOK, setSepetactionOK] = useState(false);
  const [benzerProductsData, setbenzerProductsData] = useState(null);
  const scrollViewRef = useRef(null);
  const [uyarstil, setuyarstil] = useState({});
  const [kargoindirimlimit, setkargoindirimlimit] = useState(null);
  const ekranYuksekligiFloat = Dimensions.get('window').height;
  const ekranGenisligiFloat = Dimensions.get('window').width;
  const ekranYuksekligiInt = Math.floor(ekranYuksekligiFloat); // Aşağı yuvarlar
  const { resetScroll } = route.params;
  const [secilenGUN, setsecilenGUN] = useState(null);
  const [secilenSAAT, setsecilenSAAT] = useState(null);
  // secilenMahItem comes from context now
  const [birlikteProductList, setbirlikteProductList] = useState([]);
  const [bayiId, setBayiId] = useState(0);

  const [sheetVisible, setSheetVisible] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(true);
  const [urunKapaliTarihler, setUrunKapaliTarihler] = useState([]);
  const [staticClosedBanner, setStaticClosedBanner] = useState(null);

  const handleMahallesectim = async (item) => {
    // Context controls the mahalle item. Here we just reset dependent states.
    if (item == null) {
      setsecilenGUN(null);
      setsecilenSAAT(null);
      return;
    }

    try {
      const parsed = JSON.parse(item);
      // Boş obje {} veya mahalle property'si eksik ise geçersiz say
      if (!parsed || typeof parsed !== 'object' || !parsed.mahalle) {
        setsecilenGUN(null);
        setsecilenSAAT(null);
        return;
      }
      // Valid item logic - just reset gun/saat
      setsecilenGUN(null);
      setsecilenSAAT(null);
    } catch (e) {
      console.log('handleMahallesectim parse error:', e);
      setsecilenGUN(null);
      setsecilenSAAT(null);
    }
  };

  const handleScroll = (event) => {
    const scrollPosition = event.nativeEvent.contentOffset.y;
    setIsAtTop(scrollPosition < 10);
  };

  const handlegunsectim = async (gun, saat, sepetegit = false) => {

    const formattedDate = new Intl.DateTimeFormat('tr-TR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(gun);
    setsecilenGUN(formattedDate);
    setsecilenSAAT(saat);

    if (sepetegit) {
      setSheetVisible(false);
      //setSepetactionOK(true);
      // Direkt Teslimat Bilgileri sayfasına git (sepetAdim=1)
      navigation.navigate('SepetNav', { sepetAdim: 1 });
    }

  };

  // Deep link'ten gelince geri tuşu anasayfaya gitsin
  const handleGoBack = () => {
    if (canGoBack) {
      navigation.goBack();
    } else {
      // Deep link'ten geldik, stack boş - anasayfaya git
      navigation.reset({
        index: 0,
        routes: [{ name: 'AnaNav' }],
      });
    }
  };

  const sepeteklepressed = () => {
    // if (product.cesitlist && cid == 0) {
    //   setuyarstil({
    //     borderColor: 'red',
    //   });
    //   scrollViewRef.current?.scrollTo({y: 300, animated: true});
    //   ikostalert(product.cesitalan1, 'Lütfen seçim yapın!', [{text: 'TAMAM'}]);
    //   return;
    // }
    setSheetVisible(true);
  };

  const paylasSvg = `
  <svg width="28px" height="28px" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fill-rule="evenodd" clip-rule="evenodd" d="M3.5 5.00006C3.22386 5.00006 3 5.22392 3 5.50006L3 11.5001C3 11.7762 3.22386 12.0001 3.5 12.0001L11.5 12.0001C11.7761 12.0001 12 11.7762 12 11.5001L12 5.50006C12 5.22392 11.7761 5.00006 11.5 5.00006L10.25 5.00006C9.97386 5.00006 9.75 4.7762 9.75 4.50006C9.75 4.22392 9.97386 4.00006 10.25 4.00006L11.5 4.00006C12.3284 4.00006 13 4.67163 13 5.50006L13 11.5001C13 12.3285 12.3284 13.0001 11.5 13.0001L3.5 13.0001C2.67157 13.0001 2 12.3285 2 11.5001L2 5.50006C2 4.67163 2.67157 4.00006 3.5 4.00006L4.75 4.00006C5.02614 4.00006 5.25 4.22392 5.25 4.50006C5.25 4.7762 5.02614 5.00006 4.75 5.00006L3.5 5.00006ZM7 1.6364L5.5682 3.0682C5.39246 3.24393 5.10754 3.24393 4.9318 3.0682C4.75607 2.89246 4.75607 2.60754 4.9318 2.4318L7.1818 0.181802C7.26619 0.09741 7.38065 0.049999 7.5 0.049999C7.61935 0.049999 7.73381 0.09741 7.8182 0.181802L10.0682 2.4318C10.2439 2.60754 10.2439 2.89246 10.0682 3.0682C9.89246 3.24393 9.60754 3.24393 9.4318 3.0682L8 1.6364L8 8.5C8 8.77614 7.77614 9 7.5 9C7.22386 9 7 8.77614 7 8.5L7 1.6364Z" fill={colors.black}></path> </g></svg>  
  `;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return scrollY._value === 0 && gestureState.dy > 0;
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dy > 150) {
          handleGoBack();
        }
      },
    }),
  ).current;


  const getkargoIndirimLimit = async () => {
    var indirimlimit = 0;
    await axios
      .get(
        urls.kargoIndirimLimit,
      )
      .then(async response => {
        setkargoindirimlimit(response.data);
      })
      .catch(error => {
        console.log('Hata:' + error.message);
      });
  }

  async function getproduct() {


    const langParam = (language && language.toLowerCase() !== 'tr') ? language.toLowerCase() : undefined;

    axios
      .post(urls.urun2026, { prID: pid, lang: langParam }, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      })
      .then(response => {
        setProduct(response.data);

        // Fetch similar products from new API
        const obek = response.data.ad || '';
        const bolgeid = secilenMahItem?.bolge_id || null;

        axios.get(urls.benzerUrunler, {
          params: { pid: pid, obek: obek, bolgeid: bolgeid }
        })
          .then(res => setbenzerProductsData(res.data))
          .catch(err => console.log('Benzer urun hatasi:', err));

        //console.log('benzer Urun data alindi' + JSON.stringify(response.data));
        // Insider SDK - Product Detail Page View Event
        if (response.data) {
          const taxonomyList = ["İstanbul Çiçekleri"]; // Default taxonomy if API doesn't provide categories
          const { breadcatad3, breadcatad2, breadcatad } = response.data;

          if (breadcatad3 && breadcatad3 !== "") taxonomyList.push(breadcatad3);
          if (breadcatad2 && breadcatad2 !== "" && breadcatad2 !== breadcatad3) taxonomyList.push(breadcatad2);
          if (breadcatad && breadcatad !== "" && breadcatad !== breadcatad2) taxonomyList.push(breadcatad);

          const insiderProduct = {
            id: 'P-' + pid,
            name: response.data.ad || '',
            unit_sale_price: response.data.fiyat || 0,
            unit_price: response.data.fiyatindirimsiz > 0 ? response.data.fiyatindirimsiz : response.data.fiyat || 0,
            taxonomy: taxonomyList,
            product_image_url: response.data.imgurl || '',
            url: `${API_CONFIG.webBaseUrl}/` + response.data.url || '',
            currency: 'TRY'
          };
          console.log('Insider Urun Detay Event gonderiliyor: ' + JSON.stringify(insiderProduct));
          InsiderEvents.visitProductDetailPage(insiderProduct);
          FacebookEvents.logViewContent({
            id: 'P-' + pid,
            type: 'product',
            currency: 'TRY',
            price: response.data.fiyatindirimsiz > 0 ? response.data.fiyatindirimsiz : response.data.fiyat || 0
          });
          FirebaseEvents.logViewItem({
            id: 'P-' + pid,
            name: response.data.ad || '',
            type: 'product',
            currency: 'TRY',
            price: response.data.fiyatindirimsiz > 0 ? response.data.fiyatindirimsiz : response.data.fiyat || 0
          });

          // Save to Context for later use in Cart
          updateinsiderProductMap1({
            id: String(response.data.id || pid), // Ensure ID matches what we use in cart
            ...insiderProduct
          });
        }

      })
      .catch(error => console.log(error));

    //benzerler();

    if (resetScroll && scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: 0, animated: true });
    }
  }

  useEffect(() => {


    getproduct();
    // getkargoIndirimLimit();

    // gunKapatListUrun API - ürünün kapalı tarihleri ve special day kontrolü
    Promise.all([
      axios.get(urls.gunKapatListUrun, { params: { prID: pid } }),
      axios.get(`${API_CONFIG.webBaseUrl}/api/delivery/cargo-settings`)
    ]).then(([kapaliRes, settingsRes]) => {
      const kapaliData = kapaliRes.data || [];
      setUrunKapaliTarihler(kapaliData);
      
      const specialDayTabs = settingsRes.data?.specialDayTabs || [];
      if (kapaliData.length > 0 && specialDayTabs.length > 0) {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const closedSpecialDay = specialDayTabs.find(sdt => {
          if (!sdt.date) return false;
          const sdDate = new Date(sdt.date + 'T00:00:00');
          if (sdDate < todayStart) return false;

          if (sdt.publishDate) {
            const pubDate = new Date(sdt.publishDate + 'T00:00:00');
            if (todayStart < pubDate) return false;
          }

          const isClosedForProduct = kapaliData.some(closed => {
            const closedDate = new Date(closed.gun);
            return closedDate.getFullYear() === sdDate.getFullYear() &&
                   closedDate.getMonth() === sdDate.getMonth() &&
                   closedDate.getDate() === sdDate.getDate();
          });

          return isClosedForProduct;
        });

        if (closedSpecialDay) {
          const localeKey = language ? String(language).toLowerCase() : 'tr';
          let finalSdt = { ...closedSpecialDay };
          if (localeKey !== 'tr' && closedSpecialDay.locales && closedSpecialDay.locales[localeKey]) {
            finalSdt = { ...finalSdt, ...closedSpecialDay.locales[localeKey] };
          }
          setStaticClosedBanner(finalSdt);
        } else {
          setStaticClosedBanner(null);
        }
      }
    }).catch(err => {
      console.log('gunKapatListUrun error:', err);
      setUrunKapaliTarihler([]);
      setStaticClosedBanner(null);
    });

  }, [pid, secilenMahItem]); // navigation'ı bağımlılıklara eklemeyi unutmayın


  const onShare = async () => {
    try {
      const result = await Share.share({
        message: product.ad,
        url: `${API_CONFIG.webBaseUrl}/` + product.url + '/',
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          console.log(result.activityType);
        }
      } else if (result.action === Share.dismissedAction) {
        console.log('Paylaşım iptal edildi');
      }
    } catch (error) {
      console.error(error.message);
    }
  };



  const [number, setNumber] = useState(1);

  const increaseNumber = () => {
    setNumber(prevNumber => prevNumber + 1);
  };

  const decreaseNumber = () => {
    setNumber(prevNumber => (prevNumber > 1 ? prevNumber - 1 : 1));
  };

  const handleRenksecCommand = (renk, cesitId) => {
    setuyarstil({});
    setCid(cesitId);
    setRenk(renk);
    setSepetactionOK(false);
    // Seçilen varyantı bul ve kaydet (NJ parity: fiyat/resim güncelleme)
    if (product?.cesitlist) {
      const variant = product.cesitlist.find(c => c.id === cesitId);
      setSelectedVariant(variant || null);
    }
  };

  const SagOkSvg = ({ style, rotation }) => (
    <Svg
      height="10"
      width="10"
      viewBox="0 0 50 50"
      style={[style, { transform: [{ rotate: rotation }] }]}
      preserveAspectRatio="xMidYMid meet">
      <G
        transform="translate(0,50) scale(0.1,-0.1)"
        fill={colors.black}
        stroke="none">
        <Path d="M115 480 c-18 -19 -16 -22 85 -125 l104 -105 -103 -104 c-92 -93 -101 -107 -91 -125 6 -12 18 -21 28 -21 10 0 73 56 142 125 l125 125 -125 125 c-69 69 -130 125 -136 125 -6 0 -19 -9 -29 -20z" />
      </G>
    </Svg>
  );
  const birlikteAPIYE = async products => {
    for (const product of products) {
      if (product.checked) {
        if (product.Variants.length) {
          for (const variant of product.Variants) {
            if (variant.checked) {
              const productDetails = {
                id: 'P-' + String(product.Id),
                name: variant.Name || product.Name,
                price: parseFloat(variant.Price),
                image_url: product.ImageUrl,
                currency: 'TRY'
              };
              await birlikteAPIYE2(product.Id, variant.Id, productDetails);
            }
          }
        } else {
          const productDetails = {
            id: String(product.Id),
            name: product.Name,
            price: parseFloat(product.Price),
            image_url: product.imgurl,
            currency: 'TRY'
          };
          await birlikteAPIYE2(product.Id, 0, productDetails);
        }
      }
    }
    //  setSepetactionOK(false);
    // navigation.navigate("SepetNav");
  };

  // Scroll handling


  const birlikteAPIYERIBBON = async (products) => {
    let bpl = [];
    for (const product of products) {
      if (product.checked) {
        if (product.Variants.length) {
          for (const variant of product.Variants) {
            if (variant.checked) {
              let pid2 = product.Id;
              let cid2 = variant.Id;
              bpl.push({ pid: pid2, cid: cid2 });

            }
          }
        } else {
          let pid2 = product.Id;
          let cid2 = 0;
          bpl.push({ pid: pid2, cid: cid2 });
        }
      }
    }
    setbirlikteProductList(bpl);
    setSheetVisible(true);

  };
  const SepeteUpdateKargo = async () => {
    // const mahalleitem = await AsyncStorage.getItem('@mahalleitem');
    // const mah = JSON.parse(mahalleitem);
    const mah = secilenMahItem; // Context usage
    const Code = await AsyncStorage.getItem('@code');

    if (mah && Code) {
      const apiUrl = `${Url}SepeteUpdateKargo/`;
      const requestData = {
        Code: Code,
        TeslimMahalle: mah.description,
        Mahalle: mah.mahalle,
        Sehir: mah.sehir,
        Semt: mah.semt,
      };

      try {
        const response = await axios.post(apiUrl, requestData);
      } catch (error) {
        ikostalert(
          'Hata',
          `Sepet ggüncellenirken bir hata oluştu: ${error.message}`,
        );
      }
    }
  };

  async function birlikteAPIYE2(pid1, cid1, productDetails = null) {
    var code = await AsyncStorage.getItem('@code');
    var username = await AsyncStorage.getItem('username');
    if (username == null) {
      username = '';
    }

    if (code == null) {
      var os = Platform.OS;
      await axios
        .get(
          `${urls.codeverVeSiparis(os)}`,
        )
        .then(async response => {
          code = response.data;
          await AsyncStorage.setItem('@code', response.data);
        })
        .catch(error => {
          // Burada 'error' tanımlı olarak yakalanacak
          ikostalert('Hata', error.message); // Hata mesajı kullanıcıya gösterilecek
        });
    }
    if (code != null) {
      var model = {
        codesanal: code,
        pid: pid1,
        cid: cid1,
        adet: 1,
        username: username,
      };
      sepeteekle2(model, productDetails);
    }
  }



  async function sepeteekle() {
    if (product.cesitlist && cid == 0) {
      setuyarstil({
        borderColor: 'red',
      });
      scrollViewRef.current?.scrollTo({ y: 300, animated: true });
      ikostalert(product.cesitalan1, 'Lütfen seçim yapın!', [{ text: 'TAMAM' }]);
      return;
    }
    var code = await AsyncStorage.getItem('@code');
    var username = await AsyncStorage.getItem('username');
    if (username == null) {
      username = '';
    }

    if (code == null) {
      var os = Platform.OS;
      await axios
        .get(
          `${urls.codeverVeSiparis(os)}`,
        )
        .then(async response => {
          code = response.data;
          await AsyncStorage.setItem('@code', response.data);
        })
        .catch(error => {
          // Burada 'error' tanımlı olarak yakalanacak
          ikostalert('Hata', error.message); // Hata mesajı kullanıcıya gösterilecek
        });
    }
    if (code != null) {
      var model = {
        codesanal: code,
        pid: pid,
        cid: cid,
        adet: number,
        username: username,
      };
      sepeteekle2(model);
    }
  }
  const { sepetSayisi, setSepetSayisi, insiderProductMap1 } = useContext(SepetContext);

  async function sepeteekle2(model, extraProductDetails = null) {

    const responseSEPET = await axios.post(
      urls.sepeteEkle,
      model,
      {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      },
    );

    if (responseSEPET.data == '-1') {
      alert('Hata: eklenemedi!');
    }
    if (responseSEPET.data != '-1') {
      setSepetactionOK(true);

      // Insider SDK - Item Added to Cart Event
      // Try to find persisted product details first
      const productId = String(extraProductDetails?.id || model.pid || product?.id);
      // Try with 'P-' prefix if not found directly, as map keys might have it
      const persistedProduct = insiderProductMap1[productId] || insiderProductMap1['P-' + productId];

      if (persistedProduct) {
        // Use the high-quality persisted data
        const insiderProduct = {
          ...persistedProduct,
          quantity: model.adet || 1,
          // Ensure currency is set
          currency: persistedProduct.currency || 'TRY'
        };
        InsiderEvents.itemAddedToCart(insiderProduct);
        FacebookEvents.logAddToCart({
          id: insiderProduct.id,
          type: 'product',
          currency: insiderProduct.currency,
          price: insiderProduct.unit_price || insiderProduct.unit_sale_price || 0,
          quantity: insiderProduct.quantity
        });
        FirebaseEvents.logAddToCart({
          id: insiderProduct.id,
          name: insiderProduct.name || '',
          type: 'product',
          currency: insiderProduct.currency,
          price: insiderProduct.unit_price || insiderProduct.unit_sale_price || 0,
          quantity: insiderProduct.quantity
        });
      } else if (extraProductDetails) {
        const insiderProduct = {
          ...extraProductDetails,
          id: extraProductDetails.id || model.pid,
          quantity: model.adet || 1,
          // Ensure these are present if not in extraProductDetails
          taxonomy: extraProductDetails.taxonomy || ['General'],
          url: extraProductDetails.url || '', // Extra products might not have full URL readily available here without more data
          currency: 'TRY'
        };
        InsiderEvents.itemAddedToCart(insiderProduct);
      } else if (product) {
        // Pass the FULL product object so InsiderHelper can extract everything (including breadcatad, fiyatindirimsiz etc.)
        const insiderProduct = {
          ...product, // Spread full product data
          id: 'P-' + product.id,
          quantity: model.adet || 1,
          imageURL: product.imgurl,
          url: `${API_CONFIG.webBaseUrl}/` + product.url, // Ensure URL is absolute
          image_url: product.imgurl, // Explicitly extract image
          currency: 'TRY'
        };
        InsiderEvents.itemAddedToCart(insiderProduct);
      }

      var sepetadet = await AsyncStorage.getItem('@sepetadet5');
      if (sepetadet == null) {
        await AsyncStorage.setItem('@sepetadet5', model.adet.toString());
        sepetadet = model.adet;
      } else {
        const yeniadet = parseInt(sepetadet) + model.adet;
        await AsyncStorage.setItem('@sepetadet5', yeniadet.toString());
        sepetadet = yeniadet;
      }
      setSepetSAY(sepetadet);
      setSepetSayisi(sepetadet);
      SepeteUpdateKargo();
    }
  }

  const scaleAnim = useRef(new Animated.Value(0)).current; // Başlangıç değeri 0 (görünmez)

  useEffect(() => {
    if (sepetactionOK) {
      Animated.timing(scaleAnim, {
        toValue: 1, // Son değer 1 (tam boyut)
        duration: 300, // Animasyon süresi, örneğin 300 ms
        useNativeDriver: true,
      }).start();
    } else {
      scaleAnim.setValue(0); // Eğer sepetactionOK false ise animasyon değerini sıfırla
    }
  }, [sepetactionOK]);

  const tagsStyles = useMemo(() => ({
    ul: {
      paddingLeft: 10, // Madde işaretleriyle metin arasındaki boşluk
      marginLeft: 0,
    },
    li: {
      paddingLeft: 5, fontSize: 12,
      marginBottom: 8, // Maddeler arası boşluk
    },
    p: {
      margin: 0,
      marginBottom: 10,
      padding: 0, fontSize: 12
    },
    strong: {
      marginTop: 10,

    }
  }), []);

  const customListStyleSpecs = useMemo(() => ({
    ul: {
      marker: '• ',
      markerStyle: {
        fontSize: 16,
        marginRight: 5,
      },
    },
    ol: {
      marker: (index) => `${index + 1}. `,
      markerStyle: {
        fontSize: 16,
        marginRight: 5,
      },
    },
  }), []);


  const yuzde = (a, b) => {
    let y = 0;
    if (b != 0) y = Math.round(100 * (b - a) / b);
    let sonuc = (<></>);
    if (y > 0) {
      sonuc = (<>
        <View style={styles.indirimoran}>
          <Text style={{ color: 'white', fontFamily: 'NunitoSans-Regular', fontSize: 12 }}>%{y}</Text>
        </View>
      </>);
    }
    return sonuc

  }
  if (!product) {
    return (
      <SafeAreaView style={stylesglobal.SafeAreaCSS}>
        <View style={stylesglobal.headerCustom}>
          <HeaderleftComp title={''} />


        </View>
        <View style={stylesglobal.loaderview}><LottieView source={require('../assets/animations/yukleme_ani.json')}
          autoPlay loop style={stylesglobal.loading} /></View></SafeAreaView>
    );
  }

  const { ad, aciklama, boyutaciklama, aciklamaon, fiyatstring, fiyat, fiyatindirimsiz, fiyatindirimsizstring } = product;

  // NJ parity: activeFiyat — varyant seçiliyse varyant fiyatını göster
  const activeFiyat = (selectedVariant?.fiyat != null && selectedVariant.fiyat > 0) ? selectedVariant.fiyat : fiyat;
  const activeFiyatString = (selectedVariant?.fiyatstring && selectedVariant.fiyat > 0) ? selectedVariant.fiyatstring : fiyatstring;
  const activeHasDiscount = Boolean(fiyatindirimsiz && fiyatindirimsiz > 0 && fiyatindirimsiz > activeFiyat);

  function gotosepet() {
    setSepetactionOK(false);
    navigation.navigate('SepetNav');
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>

      <SafeAreaView style={stylesglobal.SafeAreaCSS}>
        <View style={stylesglobal.container}>


          <Animated.ScrollView
            ref={scrollViewRef}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            {...panResponder.panHandlers}>
            <View style={styles.container}>

              <View style={{ minHeight: 250, width: '100%', position: 'relative' }}>

                {/* <UrunResimlerList data={product.resimlist} multislidewidth={1.22} /> */}

                <UrunResimSlider data={product.resimlist} renk={renk} />
              </View>
              <Text style={styles.title}>{ad}</Text>


              <View><AdresSecimBar onPress={() => setSheetVisible(true)} /></View>


              {Array.isArray(product.cesitlist) && product.cesitlist.length > 0 && (<View><UrunCesitButonlar
                uyarstil={uyarstil}
                cesitler={product.cesitlist}
                cesitad={product.cesitalan1}
                onCommand={handleRenksecCommand}
              /></View>
              )}


              <View style={{ paddingHorizontal: 15 }}>

                {productInfoDeliveryHtml ? (
                  <AutoHeightWebView htmlContent={productInfoDeliveryHtml} />
                ) : null}

                {aciklamaon != "" && (
                  <View style={{ marginBottom: 20 }}>
                    <RenderHTML
                      systemFonts={['NunitoSans-Regular', 'NunitoSans-Bold']}
                      ignoredStyles={['width', 'height', 'minWidth', 'maxWidth']}
                      tagsStyles={{
                        p: { fontFamily: 'NunitoSans-Regular', fontSize: 14, lineHeight: 24, color: colors.black, marginBottom: 0 },
                        div: { fontFamily: 'NunitoSans-Regular', fontSize: 14, lineHeight: 24, color: colors.black },
                        img: { width: '100%', height: 'auto', alignSelf: 'center', objectFit: 'contain' }
                      }}
                      contentWidth={ekranGenisligiFloat - 30}
                      source={{ html: aciklamaon }}
                    />
                  </View>
                )}


                <View style={{ marginTop: 0, marginBottom: 40 }}>
                  <View
                    style={{
                      paddingVertical: 10,
                      paddingHorizontal: 15,
                      borderWidth: .5,
                      borderColor: '#ddd',
                      backgroundColor: colors.bgLight // Optional: slightly different background for header? Or keep white. User didn't specify. Keeping it simple.
                    }}>
                    <Text
                      style={{
                        fontFamily: 'NunitoSans-Bold', // Making it bold as it is a header now
                        fontSize: 15,
                        color: 'black',
                      }}>
                      {translate('Ürün Detayları')}
                    </Text>
                  </View>

                  <View style={{
                    paddingTop: 15, paddingHorizontal: 15, borderWidth: .5, borderTopWidth: 0,
                    borderColor: '#ddd',
                  }}>
                    <RenderHTML
                      tagsStyles={tagsStyles}
                      contentWidth={ekranGenisligiFloat - 40}
                      source={{ html: aciklama }}
                      customListStyleSpecs={customListStyleSpecs}
                    />
                  </View>
                </View>

                {/* <View style={{flexDirection:'row'}}>
            <Text style={{fontFamily:'NunitoSans-Bold',  fontSize: 14,marginRight:25,color:'black'}}>
              {translate('Boyut')}
            </Text>

            <Text style={styles.description2}>
              {boyutaciklama.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ')}
            </Text>
            </View> */}
                <BirlikteSepete pid={pid} bayiId={bayiId} mainProduct={product} onCommand={birlikteAPIYERIBBON} />
              </View>
              {Array.isArray(benzerProductsData) && benzerProductsData.length > 0 && (
                <View>
                  <Text
                    style={{
                      marginLeft: 20, marginBottom: 15,
                      fontFamily: 'NunitoSans-SemiBold',
                      fontSize: 18, color: 'black'
                    }}>
                    {translate('İlginizi Çekebilecek Benzer Seçenekler')}
                  </Text>
                  <AnaUrunlistYatay urunlist={benzerProductsData} navigation={navigation} />
                </View>
              )}
            </View>
          </Animated.ScrollView>
          {!sepetactionOK && (
            <View style={stylesglobal.footersepet}>
              <View style={{ width: 0, backgroundColor: '#BAB09D', marginRight: 10 }}></View>
              <View style={{ flex: 1, justifyContent: 'center' }}>
                {activeHasDiscount && (
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {yuzde(activeFiyat, fiyatindirimsiz)}
                    <Text style={styles.indirimsiz}>
                      {formatPrice(fiyatindirimsiz)}
                    </Text>
                  </View>
                )}
                <Text style={{ fontSize: 24, fontFamily: 'NunitoSans-Regular', color: colors.black, }}>
                  {formatPrice(activeFiyat)}
                </Text>
                {/* {kargoindirimlimit && kargoindirimlimit<=fiyat ?  */}
                <Text style={{ fontSize: 11, color: 'green' }}>
                  {translate('& Ücretsiz Teslim')}
                </Text>
                {/* :null}   */}

              </View>

              {/*      <View
            style={{
              flex: 0.4,
              flexDirection: 'row',
              marginRight: 15,
              paddingHorizontal: 5,
              paddingVertical: 5,
              alignItems: 'center',
              borderRadius: 15,
              borderColor: '#ddd',
              borderWidth: 1,
              justifyContent: 'center',
            }}>
            <Text style={styles.number}>{number}</Text>
            <View style={styles.arrowsContainer}>
              <TouchableOpacity onPress={increaseNumber}>
                <SagOkSvg rotation="-90deg" />
              </TouchableOpacity>
              <TouchableOpacity onPress={decreaseNumber} style={{marginTop: 3}}>
                <SagOkSvg rotation="90deg" />
              </TouchableOpacity>
            </View>
          </View> */}
              <View style={{ flex: 1 }} >
                <IkostButton title={translate("Sipariş Ver")} onPress={() => sepeteklepressed()}></IkostButton>
                {product.stok_sanal <= 0 &&
                  <View style={{ flex: 1, alignSelf: 'flex-end' }}>
                    <View style={{ alignSelf: 'flex-end', backgroundColor: colors.error, padding: 10, borderRadius: 10 }}>
                      <Text style={{ color: 'white', fontFamily: 'NunitoSans-Bold', fontSize: 11 }}>{translate('Tükendi')}</Text>
                    </View></View>}
              </View>
            </View>
          )}
          {!sepetactionOK && staticClosedBanner && (
            <View style={{
              backgroundColor: '#fff5f5',
              borderRadius: 8,
              marginHorizontal: 10,
              marginBottom: 10,
              padding: 12,
              borderWidth: 1,
              borderColor: '#ffcdd2',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap'
            }}>
              <Text style={{
                fontFamily: 'NunitoSans-Bold',
                fontSize: 14,
                color: '#d32f2f',
                flex: 1,
                minWidth: 200,
                marginBottom: 8
              }}>
                {staticClosedBanner.kapaliYonlendirmeMetni || translate("Seçtiğiniz ürün bu özel günde gönderime kapalıdır. Alternatif ürünlerimize göz atabilirsiniz.")}
              </Text>
              {staticClosedBanner.yonlendirmeButonLinki && (
                <TouchableOpacity
                  style={{
                    backgroundColor: '#e74c3c',
                    borderRadius: 6,
                    paddingVertical: 8,
                    paddingHorizontal: 16,
                    alignItems: 'center',
                    flexDirection: 'row',
                    justifyContent: 'center',
                  }}
                  onPress={() => {
                    // Buton linkine göre yönlendirme yapalım (RN'de linking veya navigation kullanılabilir)
                    // Örnek basit link açma
                    Linking.openURL(staticClosedBanner.yonlendirmeButonLinki).catch(err => console.error("Couldn't load page", err));
                  }}
                >
                  <Text style={{ color: 'white', fontFamily: 'NunitoSans-Bold', fontSize: 13 }}>
                    {staticClosedBanner.yonlendirmeButonYazisi || translate("Alternatifleri Gör")}
                  </Text>
                  <Text style={{ color: 'white', fontSize: 16, marginLeft: 6 }}>›</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
          {sepetactionOK && (
            <View style={stylesglobal.footersepet}>
              <Animated.View
                style={{
                  flex: 1,
                  backgroundColor: '#F5A623',
                  borderRadius: 6,
                  alignItems: 'center',
                  justifyContent: 'center',
                  transform: [{ scale: scaleAnim }],
                }}>
                <Text style={{ color: 'white' }}>
                  <Text style={{ color: 'white', fontWeight: '700', fontSize: 20 }}>
                    ✓
                  </Text>{' '}
                  {translate('Sepete Eklendi')}
                </Text>
              </Animated.View>
              <TouchableOpacity
                style={{
                  flex: 0.3,
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                }}
                onPress={() => gotosepet()}>
                <Animated.View
                  style={{
                    flex: 1,
                    width: '100%',
                    borderWidth: 1,
                    marginLeft: 10,
                    borderColor: '#F5A623',
                    borderRadius: 6,
                    alignItems: 'center',
                    justifyContent: 'center',
                    transform: [{ scale: scaleAnim }],
                  }}>
                  <DynamicIcon name="bag" size={28} color="#2D3E50" />
                </Animated.View>
                {sepetSAY > 0 && (
                  <Animated.View
                    style={{
                      position: 'absolute',
                      top: 5,
                      right: 5,
                      justifyContent: 'center',
                      alignContent: 'center',
                      borderRadius: 12,
                      width: 24,
                      height: 24,
                      backgroundColor: 'green',
                      transform: [{ scale: scaleAnim }],
                    }}>
                    <Text
                      style={{
                        fontSize: 12,
                        color: 'white',
                        fontWeight: '700',
                        textAlign: 'center',
                      }}>
                      {sepetSAY}
                    </Text>
                  </Animated.View>
                )}
              </TouchableOpacity>
            </View>
          )}



          <View style={isAtTop ? styles.header : styles.header2}>
            <View style={styles.headerPR}>
              <TouchableOpacity onPress={() => handleGoBack()}
                style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={styles.icon2}>
                  <DynamicIcon name="arrow-left" size={20} color="#2D3E50" />
                </View>



              </TouchableOpacity>
              <View style={{ flexDirection: 'row', flex: 1, justifyContent: 'flex-end' }}>

                <TouchableOpacity style={styles.icon2}
                  onPress={() => onShare()}
                  disabled={!product || !product.ad || !product.url} // Butonu disable yap
                >
                  <DynamicIcon name="share" size={20} color="#2D3E50" />
                </TouchableOpacity>

                <KalpIcon pid={pid} widthB={24} heightB={24} borderRadiusB={0}
                  paddingB={10} paddingVerticalB={5} style={{ marginHorizontal: 10 }} />

                <TouchableOpacity style={styles.icon2}
                  onPress={() => navigation.navigate('SepetNav')}
                  disabled={!product || !product.ad || !product.url} // Butonu disable yap
                >
                  <DynamicIcon name="bag" size={24} color="#2D3E50" />
                  {sepetSayisi > 0 && <View style={{
                    position: 'absolute', top: -1, right: -1,
                    justifyContent: 'center', alignContent: 'center',
                    borderRadius: 10, width: 17, height: 17,
                    backgroundColor: colors.primary
                  }}>
                    <Text style={{ fontSize: 11, color: 'white', fontWeight: '700', textAlign: 'center' }}>{sepetSayisi}</Text>
                  </View>}
                </TouchableOpacity>


              </View>
            </View>
          </View>
          <BottomSheet visible={sheetVisible}
            onClose={() => setSheetVisible(false)}
            height={ekranYuksekligiInt * .85}
            onKeyboardViewHeight={ekranYuksekligiInt * .90} // Klavye açılınca yükseklik
            sheetBackgroundColor={colors.white}
            backgroundColor="rgba(0,0,0,0.6)"
            hasDraggableIcon
          >
            <View style={{ flex: 1, justifyContent: 'flex-end' }}>

              <View style={{
                width: '100%', height: '100%', paddingHorizontal: 0, paddingVertical: 10,
                borderTopLeftRadius: 0, borderTopRightRadius: 0, flex: 1
              }}>

                {/*       <TouchableOpacity
          style={{ alignSelf: 'flex-end', width: 30, height: 30,position:'absolute',right:18 }}
          onPress={() => bottomSheet.current.close()}>
           <Image source={require('../assets/images/kapat.png')}  style={{width:30,height:30}} />
        </TouchableOpacity> */}

                {<MahalleSec onCommand={handleMahallesectim} notcat={true} />}
                {secilenMahItem &&
                  <GunSaatSec
                    item={secilenMahItem}
                    onCommand={handlegunsectim} pid={pid} cid={cid}
                    birliktelist={birlikteProductList}
                    onBayiIdResolved={(id) => setBayiId(id || 0)}
                    productData={product}
                    benzeruruns={benzerProductsData} />
                }

              </View>

            </View>
          </BottomSheet>
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>

  );
};

const styles = StyleSheet.create({
  header: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, .0)', // %50 şeffaf
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
  icon2: {
    padding: 5, paddingHorizontal: 10,
    backgroundColor: 'rgba(255, 255, 255, 1)', // %50 şeffaf
    justifyContent: 'center', alignContent: 'center'
  },
  headerPR: {
    position: 'absolute', zIndex: 555, width: '100%',
    flexDirection: 'row',
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: Platform.OS === 'android' ? 10 : 10,
    paddingBottom: 10,
  },
  container: {
    flex: 1,
    backgroundColor: 'white',
    marginBottom: 20,
  },

  icon: {
    alignSelf: 'center',
    width: 35,
    height: 35,
  },
  title: {
    fontFamily: 'NunitoSans-SemiBold',
    color: 'black',
    fontSize: 27,
    marginVertical: 15,
    marginBottom: 15,
    marginHorizontal: 15,
  },
  indirimsiz: {
    fontSize: 12,
    fontFamily: 'NunitoSans-Regular',
    textDecorationLine: 'line-through',
    textDecorationStyle: 'solid',
    color: '#aaa',
    marginBottom: 1
  },
  description: {
    fontSize: 14,
    lineHeight: 24,
    fontFamily: 'NunitoSans-Regular',
    color: colors.black,
    marginBottom: 20,
  },
  description2: {
    fontSize: 14,
    lineHeight: 24,
    fontFamily: 'NunitoSans-Regular',
    color: colors.black,
    padding: 25,
    paddingTop: 0, flex: 1
  },
  arrowsContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  number: {
    color: 'green',
    marginHorizontal: 5,
    fontSize: 24,
    marginRight: 12,
  },
  indirimoran: {
    backgroundColor: '#e64e41',
    borderRadius: 4,
    paddingVertical: 2,
    paddingHorizontal: 5,
    minWidth: 30,
    marginRight: 6,
  },
});

export default UrunSayfa;
