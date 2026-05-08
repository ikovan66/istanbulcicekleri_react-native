import API_CONFIG from '../config/apiConfig';
import React, {
    useContext,
    useState, useEffect
} from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert, Image } from 'react-native';
import DynamicIcon from './DynamicIcon';
import axios from 'axios';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import IkostButton from "../components/IkostButton";
import KisiyeOzel from "../components/KisiyeOzel";
import { SepetContext } from '../components/SepetContext'; // İçe aktarma
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { ikostalert } from '../GlobalAlert';
import LottieView from 'lottie-react-native';
import stylesglobal from '../stylesglobal';
import InsiderEvents from '../utils/InsiderHelper';
import { urls } from '../config/apiUrls';
import { colors } from '../config/theme';
//test
LocaleConfig.locales['tr'] = {
    monthNames: [
        'Ocak',
        'Şubat',
        'Mart',
        'Nisan',
        'Mayıs',
        'Haziran',
        'Temmuz',
        'Ağustos',
        'Eylül',
        'Ekim',
        'Kasım',
        'Aralık'
    ],
    monthNamesShort: ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'],
    dayNames: ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'],
    dayNamesShort: ['Pz', 'Pzt', 'Sal', 'Çrş', 'Prş', 'Cu', 'Cmt'],
    today: "Bugün"
};
LocaleConfig.locales['en'] = {
    monthNames: [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ],
    monthNamesShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    dayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    dayNamesShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    today: "Today"
};


function formatDateToDDMMYYYY(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Ay 0'dan başlar, bu yüzden +1 ekliyoruz.
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
}

const formatDateForCalendar = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const GunSaatSec = ({ item, pid, cid, birliktelist, onCommand, onBayiIdResolved, productData, benzeruruns }) => {
    const [locale, setLocale] = useState('tr'); // default tr
    const { fetchTranslations, translate, insiderProductMap1 } = useContext(SepetContext);

    const [startDate, setStartDate] = useState(new Date());
    const [kapaliguns, setKapaliguns] = useState([]);
    const [ozelguns, setOzelguns] = useState([]);
    const [teslimSaatler, setTeslimSaatler] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showCalendar1, setShowCalendar1] = useState(false);
    const [sepetSAY, setSepetSAY] = useState(0);
    const [bugunNO, setbugunNO] = useState(false);
    const [gun1, setgun1] = useState(null);
    const [gun2, setgun2] = useState(null);
    const [gun3, setgun3] = useState(null);
    const [gun4, setgun4] = useState(null);
    const [kargouyartext, setkargouyartext] = useState(null);
    const [yoktext, setyoktext] = useState(null);

    const [bayi_id, setBayi_id] = useState(null);
    const [cbkid, setcbkid] = useState(null);
    const [secilenGUN, setsecilenGUN] = useState(null);
    const [secilenSAAT, setsecilenSAAT] = useState(null);
    const [tabsec, settabsec] = useState(1);
    const [mounted, setmounted] = useState(false);
    const [calendarBTN, setcalendarBTN] = useState(null);
    const bugun = new Date();
    const navigation = useNavigation();
    const [formValues, setFormValues] = useState({});
    const [urunAlanlar, setUrunAlanlar] = useState([]);
    const [LevhaNot, setLevhaNot] = useState(null);
    const [specialDayTabs, setSpecialDayTabs] = useState([]);
    const [closedSpecialDayRedirect, setClosedSpecialDayRedirect] = useState(null);
    const [showRedirectModal, setShowRedirectModal] = useState(false);
    const [cargoSettings, setCargoSettings] = useState({
        cargoCalendarEnabled: false,
        cargoCutoffWeekday: 16,
        cargoCutoffSaturday: 15,
        cargoSkipSunday: true,
    });

    // Fetch specialDayTabs + cargoSettings from Next.js panel
    const fetchSpecialDayTabs = async () => {
        try {
            const domain = API_CONFIG.universalDomain || API_CONFIG.webBaseUrl?.replace('https://', '').replace('http://', '');
            const res = await axios.get(`${API_CONFIG.webBaseUrl}/api/mobile/special-day-tabs?domain=${domain}`);
            if (res.data?.specialDayTabs) {
                setSpecialDayTabs(res.data.specialDayTabs);
            }
            if (res.data?.cargoSettings) {
                setCargoSettings(res.data.cargoSettings);
            }
        } catch (e) {
            console.log('specialDayTabs fetch error (non-critical):', e.message);
        }
    };

    useEffect(() => {
        const getStoredLanguage = async () => {
            const dilStored = await AsyncStorage.getItem('dil');
            const selectedLocale = dilStored === 'EN' ? 'en' : 'tr';

            LocaleConfig.defaultLocale = selectedLocale;
            setLocale(selectedLocale);
        };

        getStoredLanguage();
        fetchDataKISIYEOZEL();
        fetchSpecialDayTabs();

    }, []);

    useEffect(() => {
        handleMahallesectim(item);
    }, [item]);

    useEffect(() => {
        if (!mounted && gun1 instanceof Date) {
            // Ürün tarihi kapalıysa ilk günü otomatik seçme, sonraki açık günü bul
            const isGunClosed = (gunDate) => {
                if (!gunDate || !(gunDate instanceof Date)) return false;
                return kapaliguns.some(item => 
                    new Date(item.gun).toDateString() === gunDate.toDateString()
                );
            };

            if (!isGunClosed(gun1)) {
                setsecilenGUN(gun1);
                settabsec(1);
                console.log('gun1 (auto-select):' + gun1);
            } else if (gun2 instanceof Date && !isGunClosed(gun2)) {
                setsecilenGUN(gun2);
                settabsec(2);
                console.log('gun1 kapalı, gun2 seçildi:' + gun2);
            } else if (gun3 instanceof Date && !isGunClosed(gun3)) {
                setsecilenGUN(gun3);
                settabsec(3);
                console.log('gun1,gun2 kapalı, gun3 seçildi:' + gun3);
            } else {
                // Tüm günler kapalı - seçim yapma
                console.log('Tüm günler ürün için kapalı, otomatik seçim yapılmadı');
            }

            setmounted(true);
        }
    }, [gun1]);

    useEffect(() => {
        setsecilenSAAT(null);

        // Debug: secilenGUN tipini kontrol et
        console.log('secilenGUN type:', typeof secilenGUN, 'isDate:', secilenGUN instanceof Date, 'value:', secilenGUN);

        if (secilenGUN instanceof Date && teslimSaatler) {
            const saatler = filtreliSaatler();
            if (saatler && saatler.length > 0) {
                setsecilenSAAT(saatler[0].metin); // Görünür durumdaki saatlerden ilkini seç
            }
            onCommand(secilenGUN, secilenSAAT);
        } else if (secilenGUN === null) {
            // Sadece null ise parent'a bildir
            onCommand(null, null);
        }
        // {} boş obje ise onCommand çağrılmaz
    }, [secilenGUN]);

    useEffect(() => {
        if (secilenSAAT != null && secilenGUN instanceof Date) {
            onCommand(secilenGUN, secilenSAAT);
        }
    }, [secilenSAAT]);

    const fetchDataKISIYEOZEL = async () => {
        try {
            const response = await axios.get(`${API_CONFIG.basketApi}/api/Home/GetUrunAlanlar`, {
                params: { prID: pid, ccboz: 0 }
            });
            const data = response.data;
            setUrunAlanlar(data);
            console.log('UrunAlanlar :', data);

            // Her alan için formValues’a başlangıç değerlerini boş string olarak atayabiliriz
            let initialValues = {};
            data.forEach((item) => {
                initialValues[item.id] = '';
            });
            setFormValues(initialValues);
            console.log('formValues :', formValues);

        } catch (error) {
            console.log('fetchData error:', error);
        }
    };

    async function sepeteekle() {


        if (urunAlanlar.length > 0 && !LevhaNot) {
            ikostalert("Eksik Bilgi", "Lütfen tüm alanları doldurunuz.", [{ text: 'TAMAM' }]);
            return;

        }

        var code = await AsyncStorage.getItem('@code');
        var username = await AsyncStorage.getItem('username');
        if (username == null) {
            username = '';
        }

        if (code == null) {
            const osType = Platform.OS === 'ios' ? 'P' : 'A';

            try {
                const response = await axios.post(`${API_CONFIG.basketApi}/api/SepetEkle/CodeVer`, { osType }, {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                    }
                });

                code = response.data.code;
                await AsyncStorage.setItem('@code', code);
                console.log(code);
            } catch (error) {
                console.error('API Hatası:', error);
            }


        }

        const formattedDate = new Intl.DateTimeFormat(locale == 'tr' ? 'tr-TR' : 'en-EN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).format(secilenGUN);

        // Bu fonksiyonu kullanarak doğru UTC tarih oluştur
        function getLocalISOString(date) {
            const offset = date.getTimezoneOffset();
            const localDate = new Date(date.getTime() - (offset * 60 * 1000));
            return localDate.toISOString().split('T')[0] + 'T00:00:00Z';
        }


        //console.log('formattedDate:'+formattedDate);


        if (code != null) {
            // Use the full tarih string (with # limit) if available, otherwise fallback to secilenSAAT
            // This ensures validation data is persisted to the cart.
            const selectedSlotObj = teslimSaatler.find(s => s.metin === secilenSAAT);
            const teslimSaatValue = (selectedSlotObj && selectedSlotObj.tarih)
                ? selectedSlotObj.tarih
                : (secilenSAAT ? secilenSAAT : 'undefined');

            var model = {
                Code: code,
                CatID: 0,
                ProductID: pid,
                ColorID: cid,
                OzelNotlar: '',
                Quantity: 1,
                CbkId: cbkid,
                OrtakUrunBayi: '',//sıkıntı yok, presedorde [cicek_bolge_kurye_bayi] den tekrar hesaplattık.
                BayiUserName: '',
                TeslimSaat: teslimSaatValue,
                SonSaatTime: '23:59:59',//maks 23:59:59 olabilir!
                MinimumTeslimSure: 30,
                TeslimTarih: secilenGUN ? getLocalISOString(secilenGUN) : getLocalISOString(bugun),
                TeslimMahalle: item.mahalle + ', ' + item.semt + ', ' + item.sehir,
                Mahalle: item.mahalle,
                Il: item.sehir,
                Ilce: item.semt,
                bolge_id: item.bolge_id ? item.bolge_id : null,
                LevhaNot: LevhaNot ? LevhaNot : '',
                Refe: 'app',
                TeslimAd: item.adsoyad ? item.adsoyad : null,
                TeslimAdres: item.adres ? item.adres : null,
                TeslimTelefon: item.telefon ? item.telefon : null,
                //ekurunler:birliktelist,
            };
            console.log(model);
            sepeteekle2(model);
        }
    }
    const { sepetSayisi, setSepetSayisi } = useContext(SepetContext);

    async function sepeteekle2(model) {

        try {
            const responseSEPET = await axios.post(
                `${API_CONFIG.basketApi}/api/SepetEkle/sepeteekle/`,
                model,
                {
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                    },
                },
            );

            // const response2 = await axios.post(`${API_CONFIG.basketApi}/api/SepetView/sepetupdate/`, {
            //     Code: code,
            //     sid: item.id,
            //     TeslimAdres: adres,
            //     TeslimAd: isim,
            //     TeslimTelefon: telefon,
            //     parentID:parentID,
            //     Username:username,
            //     isKayit:isKayit

            // });

            console.log('responseSEPET:', responseSEPET.data);
            if (responseSEPET.data?.message != 'Sepet başarıyla eklendi.') {
                alert('Hata: eklenemedi!');
            }
            if (responseSEPET.data?.message === 'Sepet başarıyla eklendi.') {
                //setSepetactionOK(true);
                var sepetadet = await AsyncStorage.getItem('@sepetadet5');
                if (sepetadet == null) {
                    await AsyncStorage.setItem('@sepetadet5', model.Quantity.toString());
                    sepetadet = model.Quantity;
                } else {
                    const yeniadet = parseInt(sepetadet) + model.Quantity; // ← burada adet yerine Quantity kullanılmalı
                    await AsyncStorage.setItem('@sepetadet5', yeniadet.toString());
                    sepetadet = yeniadet;
                }
                setSepetSAY(sepetadet);
                setSepetSayisi(sepetadet);
                console.log('sepet eklendi');

                // Insider SDK - Item Added to Cart Event
                // Try to find persisted product details first
                const productId = String(model.ProductID);
                const persistedProduct = insiderProductMap1[productId] || insiderProductMap1['P-' + productId];

                if (persistedProduct) {
                    const insiderProduct = {
                        ...persistedProduct,
                        quantity: model.Quantity || 1,
                        currency: persistedProduct.currency || 'TRY'
                    };
                    InsiderEvents.itemAddedToCart(insiderProduct);
                } else {
                    // Fallback to constructing from productData
                    // Construct taxonomy from productData if available
                    let taxonomy = productData?.taxonomy || [];
                    if (taxonomy.length === 0 && productData) {
                        const { breadcatad3, breadcatad2, breadcatad } = productData;
                        taxonomy = ["İstanbul Çiçekleri"];
                        if (breadcatad3 && breadcatad3 !== "") taxonomy.push(breadcatad3);
                        if (breadcatad2 && breadcatad2 !== "" && breadcatad2 !== breadcatad3) taxonomy.push(breadcatad2);
                        if (breadcatad && breadcatad !== "" && breadcatad !== breadcatad2) taxonomy.push(breadcatad);
                    }

                    InsiderEvents.itemAddedToCart({
                        id: String(model.ProductID),
                        name: productData?.ad || '',
                        price: productData?.fiyat || 0,
                        unit_price: productData?.fiyatindirimsiz || productData?.fiyat || 0, // Original price
                        quantity: model.Quantity || 1,
                        image_url: productData?.resimlist?.[0]?.resim || '',
                        url: productData?.url ? (`${API_CONFIG.webBaseUrl}/` + productData.url) : '',
                        currency: 'TRY',
                        taxonomy: taxonomy,
                    });
                }

                // Tamamlayıcı ürünleri ekurun olarak ekle (NJ ComplementaryProducts akışı)
                if (birliktelist && birliktelist.length > 0) {
                    try {
                        // Bayide mevcut ürünleri doğrula
                        let validProductIds = null;
                        if (bayi_id && bayi_id > 0) {
                            try {
                                const compResponse = await axios.get(`${API_CONFIG.basketApi}/api/SepetView/complementary-products`, {
                                    params: { pid, bayiId: bayi_id }
                                });
                                const compProducts = compResponse.data?.products || compResponse.data || [];
                                validProductIds = new Set(compProducts.map(p => p.Id || p.id));
                            } catch (valErr) {
                                console.warn('[GunSaatSec] Bayi ürün doğrulaması yapılamadı:', valErr.message);
                            }
                        }

                        // Sepetten parent item ID'yi bul
                        const sepetResponse = await axios.get(`${API_CONFIG.basketApi}/api/SepetView/sepetizle`, {
                            params: { code: model.Code }
                        });
                        const sepetList = sepetResponse.data?.sepetlist || [];
                        const mainItem = sepetList
                            .filter(s => s.urun_id === model.ProductID)
                            .sort((a, b) => b.id - a.id)[0];

                        if (mainItem) {
                            for (const comp of birliktelist) {
                                // Bayide yoksa atla
                                if (validProductIds && !validProductIds.has(comp.pid)) {
                                    console.warn(`[GunSaatSec] Tamamlayıcı ürün ${comp.pid} bayide mevcut değil, atlanıyor`);
                                    continue;
                                }
                                try {
                                    await axios.post(`${API_CONFIG.basketApi}/api/SepetView/ekurun-ekle`, {
                                        EkurunId: comp.pid,
                                        ParentProductId: mainItem.id,
                                        Code: model.Code,
                                        ColorId: comp.cid || 0
                                    });
                                    console.log(`[GunSaatSec] Tamamlayıcı ürün eklendi: ${comp.pid}`);
                                } catch (ekErr) {
                                    console.error(`[GunSaatSec] Tamamlayıcı ürün eklenemedi ${comp.pid}:`, ekErr.message);
                                }
                            }
                        } else {
                            console.warn('[GunSaatSec] Parent item bulunamadı, tamamlayıcı ürünler eklenemedi');
                        }
                    } catch (sepetErr) {
                        console.error('[GunSaatSec] Sepet alınamadı, tamamlayıcı ürünler eklenemedi:', sepetErr.message);
                    }
                }

                onCommand(secilenGUN, secilenSAAT, true);
            }
        } catch (error) {
            if (error.response && error.response.data) {
                console.error("Hata Detayı:", error.response.data);
                alert(`Hata: ${error.response.data.message}\nDetay: ${error.response.data.error}`);
            } else {
                console.error("Beklenmeyen hata:", error.message);
                alert(`Beklenmeyen hata: ${error.message}`);
            }
        }
    }

    function filtreliSaatler() {
        // secilenGUN geçerli Date değilse boş dizi dön
        if (!(secilenGUN instanceof Date)) {
            console.log('filtreliSaatler: secilenGUN geçerli Date değil');
            return [];
        }

        var normalsaatler = [];
        var tarihsaatler = [];
        var tarihsaatvar = false;
        teslimSaatler.forEach(saat => {
            var genelsartlar = !tarihKarsilastirma(secilenGUN, bugun) || (tarihKarsilastirma(secilenGUN, bugun) && !saat.bugunpasif);


            //normalsaatler.push(saat); // test amaçlı açık
            if (saat.haftagun == '-') {
                if (genelsartlar) {
                    normalsaatler.push(saat);
                }
            } else {
                if (genelsartlar && tarihKarsilastirma2(secilenGUN, saat.haftagun)) {
                    tarihsaatvar = true;
                    tarihsaatler.push(saat);
                }
            }
        });
        if (tarihsaatvar) {
            return tarihsaatler;
        } else {
            return normalsaatler;
        }
    };

    const tarihKarsilastirma = (tarih1, tarih2) => {

        var sonuc = tarih1.getFullYear() === tarih2.getFullYear() &&
            tarih1.getMonth() === tarih2.getMonth() &&
            tarih1.getDate() === tarih2.getDate();
        return sonuc;
    };
    const tarihKarsilastirma2 = (tarih1, tarih2a) => {
        // tarih2a geçerlilik kontrolü
        if (!tarih2a || typeof tarih2a !== 'string') return false;

        // Hafta günü isimleri (API'den gelebilir: Sunday, Monday, etc.)
        const gunIsimleri = {
            'sunday': 0, 'pazar': 0,
            'monday': 1, 'pazartesi': 1,
            'tuesday': 2, 'salı': 2, 'sali': 2,
            'wednesday': 3, 'çarşamba': 3, 'carsamba': 3,
            'thursday': 4, 'perşembe': 4, 'persembe': 4,
            'friday': 5, 'cuma': 5,
            'saturday': 6, 'cumartesi': 6
        };

        const tarih2aLower = tarih2a.toLowerCase().trim();

        // Hafta günü kontrolü (Sunday, Monday, Pazar, Pazartesi, etc.)
        if (gunIsimleri.hasOwnProperty(tarih2aLower)) {
            const hedefGun = gunIsimleri[tarih2aLower];
            return tarih1.getDay() === hedefGun;
        }

        // Tarih formatı kontrolü (31.12.2024 formatı)
        const parcalar = tarih2a.split('.');
        if (parcalar.length !== 3) return false;

        const duzeltilmisTarih = `${parcalar[2]}-${parcalar[1]}-${parcalar[0]}`; // "2024-12-31"
        const tarih2 = new Date(duzeltilmisTarih);

        // Invalid date kontrolü
        if (isNaN(tarih2.getTime())) return false;

        return tarih1.getFullYear() === tarih2.getFullYear() &&
            tarih1.getMonth() === tarih2.getMonth() &&
            tarih1.getDate() === tarih2.getDate();
    };
    const onStartDateChange = (selectedDate1) => {
        var selectedDate = new Date(selectedDate1);
        const selectedDay = new Date(selectedDate);

        if (selectedDay < bugun) {
            ikostalert("Seçilen tarih bugünden önceki bir gün olamaz.", 'Lütfen başka bir gün seçiniz.', [{ text: 'TAMAM' }]);
            return; // Eğer önceyse, işlemi durdur.
        }

        if (tarihKarsilastirma(selectedDay, bugun) && bugunNO) {
            ikostalert("Saat itibariyle bugünü seçemezsiniz.", 'Lütfen başka bir gün seçiniz.', [{ text: 'TAMAM' }]);
            return; // Eğer önceyse, işlemi durdur.
        }
        var gunkapali = false
        kapaliguns.forEach((item, index) => {
            if (new Date(item.gun).toDateString() == selectedDate1.toDateString()) {
                gunkapali = true;
            }
        });

        const sdt = getCustomSpecialDay(selectedDate);
        if (gunkapali && sdt) {
            setClosedSpecialDayRedirect(sdt);
            setShowRedirectModal(true);
            return;
        } else if (gunkapali) {
            ikostalert("Bu tarih siparişe kapalıdır.", 'Lütfen başka bir gün seçiniz.', [{ text: 'TAMAM' }]);
            return;
        } else {
            setClosedSpecialDayRedirect(null);
        }

        setShowCalendar1(false);
        setsecilenGUN(selectedDate);
        console.log('selectedDate:' + selectedDate);

        if (tarihKarsilastirma(selectedDate, gun1)) {
            setgun1(selectedDate);
            tabcheck(1, selectedDate);
        } else if (tarihKarsilastirma(selectedDate, gun2)) {
            setgun2(selectedDate);
            console.log('setgun2:' + selectedDate);
            tabcheck(2, selectedDate);
        }
        // else if (tarihKarsilastirma(selectedDate, gun3)) {
        //     setgun3(selectedDate)
        //     tabcheck(3, selectedDate);
        // } 
        else {
            setgun3(selectedDate);
            tabcheck(3, selectedDate);

        }
    };
    const handleMahallesectim = async (item) => {

        setLoading(true);

        if (item == null) {
            setgun1(null);
            setgun2(null);
            setgun3(null);
            setgun4(null);

        } else {
            if (item.mahalle !== undefined) {
                let teslimgunsaybak;
                let bayiID;
                let kapaligunler;
                let ozelgunler;
                let saatler;
                try {
                    const model = { UretimSuresi: 0, Premium: 0, BolgeId: item.bolge_id, bayiUserName: '', PrID: pid };
                    console.log(model);

                    const responseteslimgunsaybak = await axios.post(
                        urls.teslimGunSayisi,
                        model,
                        {
                            headers: {
                                'Accept': 'application/json',
                                'Content-Type': 'application/json',
                            },
                        }
                    );
                    console.log(responseteslimgunsaybak.data);
                    teslimgunsaybak = responseteslimgunsaybak.data;
                    //console.log(teslimgunsaybak.bayi_id);
                    bayiID = teslimgunsaybak.bayi_id

                    await setcbkid(teslimgunsaybak.cbkid);
                    await setBayi_id(teslimgunsaybak.bayi_id);
                    if (onBayiIdResolved) onBayiIdResolved(teslimgunsaybak.bayi_id);

                    await setyoktext(null);

                    if (!teslimgunsaybak.bayi_id || teslimgunsaybak.bayi_id == 0) {
                        await setgun1(null);
                        await setgun2(null);
                        await setgun3(null);
                        await setyoktext(`${productData?.ad || 'Bu'} ürünümüzü bu bölgeye şu an için gönderememekteyiz.`);
                        await setLoading(false);

                    }


                } catch (error) {
                    console.error('Teslim Gün Sayısı Axios Hatası:', error);
                }

                if (!bayiID || bayiID == 0) return;

                if (teslimgunsaybak.kargolu) {

                    setTeslimSaatler([]);
                    setkargouyartext(teslimgunsaybak.kargouyartext);

                    if (cargoSettings.cargoCalendarEnabled) {
                        const now = new Date();
                        let daysToAdd = teslimgunsaybak.minteslimsure || 0;

                        const cutoffHour = now.getDay() === 6
                            ? cargoSettings.cargoCutoffSaturday
                            : cargoSettings.cargoCutoffWeekday;
                        if (now.getHours() >= cutoffHour) {
                            daysToAdd += 1;
                        }

                        let cargoClosedDays = [];
                        try {
                            const [closedRes, productClosedRes] = await Promise.all([
                                axios.get(`${API_CONFIG.basketApi}/api/Home/gunKapatList`, {
                                    params: { bayiUserName: '', bayi_id: bayiID ?? 0 }
                                }),
                                axios.get(`${API_CONFIG.basketApi}/api/Home/gunKapatListUrun`, {
                                    params: { prID: pid }
                                })
                            ]);
                            const bayiClosed = Array.isArray(closedRes.data) ? closedRes.data : [];
                            const productClosed = Array.isArray(productClosedRes.data) ? productClosedRes.data : [];
                            cargoClosedDays = [...bayiClosed, ...productClosed];
                            await setKapaliguns(cargoClosedDays);
                        } catch (e) {
                            console.error('Cargo closed days fetch error:', e);
                        }

                        const isClosedDay = (date) => {
                            return cargoClosedDays.some(closed => {
                                const closedDate = new Date(closed.gun);
                                return closedDate.getFullYear() === date.getFullYear() &&
                                    closedDate.getMonth() === date.getMonth() &&
                                    closedDate.getDate() === date.getDate();
                            });
                        };

                        const getNextValidDate = (startDate, days) => {
                            const result = new Date(startDate);
                            let added = 0;
                            while (added < days) {
                                result.setDate(result.getDate() + 1);
                                if (cargoSettings.cargoSkipSunday && result.getDay() === 0) continue;
                                if (isClosedDay(result)) continue;
                                added++;
                            }
                            while ((cargoSettings.cargoSkipSunday && result.getDay() === 0) || isClosedDay(result)) {
                                result.setDate(result.getDate() + 1);
                            }
                            return result;
                        };

                        let startDate = new Date();
                        while ((cargoSettings.cargoSkipSunday && startDate.getDay() === 0) || isClosedDay(startDate)) {
                            startDate.setDate(startDate.getDate() + 1);
                        }

                        let minDeliveryDate = daysToAdd === 0
                            ? new Date(startDate)
                            : getNextValidDate(startDate, daysToAdd);

                        setgun1(minDeliveryDate);

                        let day2 = new Date(minDeliveryDate);
                        day2.setDate(day2.getDate() + 1);
                        while ((cargoSettings.cargoSkipSunday && day2.getDay() === 0) || isClosedDay(day2)) {
                            day2.setDate(day2.getDate() + 1);
                        }
                        setgun2(day2);

                        let day3 = new Date(day2);
                        day3.setDate(day3.getDate() + 1);
                        while ((cargoSettings.cargoSkipSunday && day3.getDay() === 0) || isClosedDay(day3)) {
                            day3.setDate(day3.getDate() + 1);
                        }
                        setgun3(day3);

                        setsecilenGUN(minDeliveryDate);
                        settabsec(1);
                        setbugunNO(true);

                        onCommand(minDeliveryDate, 'undefined');
                    } else {
                        onCommand(bugun, 'undefined');
                    }
                } else {
                    setkargouyartext('');
                    try {
                        const responsesaatler = await axios.post(
                            urls.teslimSaatleri,
                            { minteslimsure: teslimgunsaybak.minteslimsure, bayiUserName: '', bugunyoktur: false, haftagun: false },
                            {
                                headers: {
                                    'Accept': 'application/json',
                                    'Content-Type': 'application/json',
                                },
                            }
                        );

                        const { saatlerUcretsiz, saatlerUcretli, ucretlivar } = responsesaatler.data;

                        console.log('Ücretsiz Saatler:', saatlerUcretsiz);
                        console.log('Ücretli Saatler:', saatlerUcretli);
                        console.log('Ücretli Var mı:', ucretlivar);

                        saatler = saatlerUcretsiz;

                        await setTeslimSaatler(saatler);
                    } catch (error) {
                        console.error('Teslim Saatleri Axios Hatası:', error);
                    }
                }

                // gunKapatList + gunKapatListUrun (bayi + ürün bazlı kapalı günler)
                try {
                    const [responsekapaligunler, responseUrunKapali] = await Promise.all([
                        axios.get(`${API_CONFIG.basketApi}/api/Home/gunKapatList`, {
                            params: { bayiUserName: '', bayi_id: bayiID ?? 0 }
                        }),
                        axios.get(`${API_CONFIG.basketApi}/api/Home/gunKapatListUrun`, {
                            params: { prID: pid }
                        })
                    ]);
                    const bayiKapali = Array.isArray(responsekapaligunler.data) ? responsekapaligunler.data : [];
                    const urunKapali = Array.isArray(responseUrunKapali.data) ? responseUrunKapali.data : [];
                    kapaligunler = [...bayiKapali, ...urunKapali];
                    await setKapaliguns(kapaligunler);
                } catch (error) {
                    if (error.response) {
                        console.log('Server responded with:', error.response.data);
                    } else {
                        console.error('Error:', error.message);
                    }
                }

                // gunOzelList axios isteği (GET metodu ile)
                try {
                    const responseozelgunler = await axios.get(
                        `${API_CONFIG.basketApi}/api/Home/gunOzelList`
                    );
                    ozelgunler = responseozelgunler.data;
                    console.log('ozelgunler:', ozelgunler);
                    await setOzelguns(ozelgunler);
                } catch (error) {
                    console.error('Özel Günler Axios Hatası:', error);
                }

                if (!teslimgunsaybak.kargolu && bayiID != 0) {

                    gunleritesiset(teslimgunsaybak, saatler, kapaligunler, ozelgunler);
                }

            }


        }
        setcalendarBTN(true);

        setLoading(false);
    };

    // Helper: check if a date matches a specialDayTab from NJ panel
    const getCustomSpecialDay = (date) => {
        if (!specialDayTabs || specialDayTabs.length === 0) return null;
        return specialDayTabs.find(sdt => {
            if (!sdt.date) return false;
            const sdDate = new Date(sdt.date + 'T00:00:00');
            return sdDate.toDateString() === new Date(date).toDateString();
        });
    };

    function gunleritesiset(teslimgunsaybak, saatler, kapaligunler, ozelgunler) {

        var bugunyok = teslimgunsaybak.bugunpasif;
        var minteslimsure = teslimgunsaybak.minteslimsure;
        var sonsaat = teslimgunsaybak.sonsaat;
        var teslimgunsay = teslimgunsaybak.teslimgunsay;
        var kargolu = teslimgunsaybak.kargolu;

        const bugun = new Date();

        if (!bugunyok) {
            bugunyok = true;
            saatler.forEach((item, index) => {
                if (!item.bugunpasif) bugunyok = false;
            });
        }
        setbugunNO(bugunyok);

        let candidateDates = [];

        // 1. Collect standard available days
        for (let i = 0; i <= 30; i++) {
            let tarih = new Date(bugun);
            tarih.setDate(tarih.getDate() + i);

            if (i == 0 && bugunyok) continue;

            // Check old API special days
            let isSpecialIdx = -1;
            ozelgunler.forEach((item, index) => {
                if (new Date(item.gun).toDateString() == tarih.toDateString()) {
                    isSpecialIdx = index;
                }
            });

            // Check NJ panel special day tabs
            const customSD = getCustomSpecialDay(tarih);
            const isSpecial = isSpecialIdx !== -1 || !!customSD;

            let gunkapali = false;
            kapaligunler.forEach((item) => {
                if (new Date(item.gun).toDateString() == tarih.toDateString()) gunkapali = true;
            });

            // If closed but NOT a custom special day, skip
            if (gunkapali && !customSD) continue;

            candidateDates.push({
                date: tarih,
                isSpecial: isSpecial,
                specialData: isSpecialIdx !== -1 ? ozelgunler[isSpecialIdx] : null,
                customSpecialDay: customSD || null,
                isClosedSpecialDay: (gunkapali && !!customSD)
            });
        }

        // 2. Also add NJ specialDayTabs that aren't already in candidates (extra days)
        if (specialDayTabs && specialDayTabs.length > 0) {
            const todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0);
            specialDayTabs.forEach(sdt => {
                if (!sdt.date) return;
                const sdDate = new Date(sdt.date + 'T00:00:00');
                if (sdDate < todayStart) return;
                // Check not already in candidates
                const alreadyExists = candidateDates.some(c => c.date.toDateString() === sdDate.toDateString());
                if (alreadyExists) return;
                // Check not closed
                let gunkapali = false;
                kapaligunler.forEach((item) => {
                    if (new Date(item.gun).toDateString() == sdDate.toDateString()) gunkapali = true;
                });
                
                candidateDates.push({
                    date: sdDate,
                    isSpecial: true,
                    specialData: null,
                    customSpecialDay: sdt,
                    isClosedSpecialDay: gunkapali
                });
            });
            // Re-sort after adding
            candidateDates.sort((a, b) => a.date - b.date);
        }

        // 3. Select Top 3: first day + prioritize specials + fill
        let selectedDates = [];

        if (candidateDates.length > 0) {
            selectedDates.push(candidateDates[0]);

            let distinctSpecialDays = candidateDates.filter((d, idx) => idx !== 0 && d.isSpecial);
            distinctSpecialDays.forEach(d => {
                if (selectedDates.length < 3) {
                    if (!selectedDates.some(sd => sd.date.toDateString() === d.date.toDateString())) {
                        selectedDates.push(d);
                    }
                }
            });

            let nextIdx = 1;
            while (selectedDates.length < 3 && nextIdx < candidateDates.length) {
                let candidate = candidateDates[nextIdx];
                if (!selectedDates.some(sd => sd.date.toDateString() === candidate.date.toDateString())) {
                    selectedDates.push(candidate);
                }
                nextIdx++;
            }
        }

        selectedDates.sort((a, b) => a.date - b.date);

        setgun1(selectedDates.length > 0 ? selectedDates[0].date : null);
        setgun2(selectedDates.length > 1 ? selectedDates[1].date : null);
        setgun3(selectedDates.length > 2 ? selectedDates[2].date : null);
        setgun4(null);
    }

    const tabcheck = (tabsay, tarih) => {
        // gun4 (tabsay=4) takvim butonu olarak çalışıyor
        if (tabsay == 4) {
            if (!showCalendar1) {
                setShowCalendar1(true);
            } else {
                setShowCalendar1(false);
            }
        } else {
            setShowCalendar1(false);
            // Sadece geçerli Date objesi ise set et
            if (tarih instanceof Date) {
                let gunkapali = false;
                kapaliguns.forEach((item) => {
                    if (new Date(item.gun).toDateString() == tarih.toDateString()) {
                        gunkapali = true;
                    }
                });
                const sdt = getCustomSpecialDay(tarih);
                if (gunkapali && sdt) {
                    setClosedSpecialDayRedirect(sdt);
                    setShowRedirectModal(true);
                    return;
                } else if (gunkapali) {
                    ikostalert("Bu tarih siparişe kapalıdır.", 'Lütfen başka bir gün seçiniz.', [{ text: 'TAMAM' }]);
                    return;
                } else {
                    setClosedSpecialDayRedirect(null);
                }

                setsecilenGUN(tarih);
                // Kargolu + cargoCalendarEnabled modda: saat seçimi yok,
                // tab seçildiğinde direkt onCommand çağır
                if (cargoSettings.cargoCalendarEnabled && (!teslimSaatler || teslimSaatler.length === 0)) {
                    onCommand(tarih, 'undefined');
                }
            }
        }
        settabsec(tabsay);

    }
    const Tabrender = ({ tabsay, tarih }) => {
        let bugun = new Date();
        let yarin = new Date();
        let ozelgun = false;
        let ozelimg = null;
        yarin.setDate(bugun.getDate() + 1);

        // Check NJ panel custom special day tab
        const customSD = tarih ? getCustomSpecialDay(tarih) : null;
        const isActive = tabsec == tabsay;

        var guntext = translate('Takvim');
        var tarihtext = gun3 == null ? "" : gun3.toLocaleDateString(locale == 'tr' ? 'tr-TR' : 'en-EN', {
            day: '2-digit',
            month: 'long'
        });

        if (tarih != null) {
            guntext = new Date(tarih).toLocaleDateString(locale == 'tr' ? 'tr-TR' : 'en-EN', {
                weekday: 'long'
            });

            if (new Date(tarih).getDay() === bugun.getDay()) guntext = translate('Bugün');
            if (new Date(tarih).getDay() === yarin.getDay()) guntext = translate('Yarın');

            // NJ panel special day overrides name
            if (customSD) {
                ozelgun = true;
                guntext = customSD.name || guntext;
                if (customSD.icon) ozelimg = customSD.icon;
            } else {
                // Fallback: old API special days
                ozelguns.forEach((item) => {
                    if (new Date(item.gun).toDateString() == new Date(tarih).toDateString()) {
                        ozelgun = true;
                        guntext = item.ozelyazi;
                        if (locale == 'tr') {
                            if (item.ozelimg && item.ozelimg != "") ozelimg = item.ozelimg;
                        } else {
                            if (item.ozelimg_eng && item.ozelimg_eng != "") ozelimg = item.ozelimg_eng;
                            else if (item.ozelimg && item.ozelimg != "") ozelimg = item.ozelimg;
                        }
                    }
                });
            }

            tarihtext = new Date(tarih).toLocaleDateString(locale == 'tr' ? 'tr-TR' : 'en-EN', {
                day: '2-digit',
                month: 'long'
            });
        }

        // Custom background color from NJ panel
        const tabBg = customSD && isActive
            ? (customSD.bgColor || colors.primary)
            : (isActive ? colors.primary : colors.bgGray);
        const tabTextColor = customSD && isActive
            ? (customSD.textColor || 'white')
            : (isActive ? 'white' : colors.textDark);
        const tabDateColor = customSD && isActive
            ? (customSD.textColor || 'white')
            : (isActive ? 'white' : colors.primary);

        return (
            <TouchableOpacity
                style={[styles.tab, { backgroundColor: tabBg }]}
                onPress={() => tabcheck(tabsay, tarih)}
            >
                {/* Icon only mode (NJ panel) */}
                {tarih && customSD && customSD.iconOnly && ozelimg && (
                    <Image source={{ uri: ozelimg }} style={{ width: '100%', height: 50 }} resizeMode="contain" />
                )}

                {/* Icon + text (NJ panel or old API) */}
                {tarih && ozelgun && ozelimg && !(customSD && customSD.iconOnly) && (
                    <Image source={{ uri: ozelimg }} style={styles.ozelicon} resizeMode="contain" />
                )}

                {/* Date text when no icon */}
                {tarih && !ozelgun &&
                    <Text style={[styles.tabTextDate, { color: tabDateColor, fontWeight: '700' }]}>{tarihtext}</Text>
                }
                {tarih && ozelgun && !ozelimg &&
                    <Text style={[styles.tabTextDate, { color: tabDateColor, fontWeight: '700' }]}>{tarihtext}</Text>
                }

                {/* Calendar icon for tab 4 */}
                {!tarih &&
                    <DynamicIcon name="calendar" size={25} color="#2D3E50" />
                }

                {/* Name text (skip if iconOnly) */}
                {!(customSD && customSD.iconOnly) && (
                    <Text numberOfLines={2} style={[styles.tabText, { color: tabTextColor, fontSize: ozelgun ? 11 : 13 }]}>
                        {guntext.replace("(", "").replace(")", "")}
                    </Text>
                )}
            </TouchableOpacity>
        );
    };

    const getMarkedDates = (kapaliguns, ozelguns) => {

        var arrayOfKAPALIDates = [];
        kapaliguns.forEach(element => {
            arrayOfKAPALIDates.push(element.gun.split('T')[0]);
        });

        var arrayOfOZELDates = [];
        ozelguns.forEach(element => {
            arrayOfOZELDates.push(element.gun.split('T')[0]);
        });

        let markedDay = {};

        arrayOfKAPALIDates.map((item) => {
            markedDay[item] = {
                selected: true,
                selectedColor: "#ddd",
            };
        });

        arrayOfOZELDates.map((item) => {
            markedDay[item] = {
                selected: true,
                marked: true,
                selectedColor: "darkred",
            };
        });

        return markedDay;
    };

    const renderSimilarProduct = (product) => {
        const fiyat = product.fiyat || 0;
        const fiyatindirimsiz = product.fiyatindirimsiz || 0;
        const discount = fiyatindirimsiz > fiyat ? Math.round(((fiyatindirimsiz - fiyat) / fiyatindirimsiz) * 100) : 0;

        return (
            <TouchableOpacity
                key={product.id}
                onPress={() => navigation.push('UrunNav', { pid: product.id, resetScroll: true })}
                style={{
                    backgroundColor: 'white',
                    borderRadius: 12,
                    padding: 10,
                    marginBottom: 10,
                    flexDirection: 'row',
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: '#f0f0f0',
                    shadowColor: colors.black,
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.1,
                    shadowRadius: 2,
                    elevation: 2
                }}
            >
                <View style={{ width: 80, height: 80, borderRadius: 8, overflow: 'hidden', marginRight: 15 }}>
                    <Image
                        source={{ uri: product.imgurl }}
                        style={{ width: '100%', height: '100%' }}
                        resizeMode="cover"
                    />
                </View>

                <View style={{ flex: 1, justifyContent: 'center' }}>
                    <Text numberOfLines={2} style={{ fontFamily: 'NunitoSans-SemiBold', fontSize: 13, color: colors.textDark, marginBottom: 5 }}>
                        {product.ad}
                    </Text>

                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        {discount > 0 && (
                            <View style={{ backgroundColor: '#e64e41', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2, marginRight: 8 }}>
                                <Text style={{ color: 'white', fontSize: 11, fontWeight: 'bold' }}>%{discount}</Text>
                            </View>
                        )}

                        <View>
                            {discount > 0 && (
                                <Text style={{ fontSize: 11, color: '#999', textDecorationLine: 'line-through' }}>
                                    {fiyatindirimsiz.toFixed(2).replace('.', ',')} TL
                                </Text>
                            )}
                            <Text style={{ fontSize: 16, fontWeight: 'bold', color: colors.textDark }}>
                                {fiyat.toFixed(2).replace('.', ',')} TL
                            </Text>
                        </View>
                    </View>
                </View>


            </TouchableOpacity>
        );
    };

    return (<>


        {loading && <View style={stylesglobal.loaderview2}>
            <LottieView source={require('../assets/animations/yukleme_ani.json')} autoPlay loop style={stylesglobal.loading} />
        </View>}

        {yoktext && (
            <View style={{ width: '100%', alignItems: 'center' }}>
                <View style={{
                    marginTop: 10,
                    padding: 16,
                    width: '100%',
                    backgroundColor: '#FFF5F5',
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: '#FECACA',
                    flexDirection: 'row',
                    alignItems: 'flex-start'
                }}>
                    <View style={{ marginRight: 12, marginTop: 2 }}>
                        {/* Replace with a better warning icon if available, using question mark for now or maybe pure SVGs */}
                        <Image
                            source={require('../assets/images/soru.png')}
                            style={{ width: 24, height: 24, tintColor: colors.black }}
                            resizeMode="contain"
                        />
                    </View>
                    <Text style={{ flex: 1, fontFamily: 'NunitoSans-Bold', fontSize: 13, color: '#1F2937', lineHeight: 20 }}>
                        {yoktext}
                    </Text>
                </View>

                {benzeruruns && benzeruruns.length > 0 && (
                    <View style={{
                        width: '100%',
                        marginTop: 20,
                        backgroundColor: '#EFF6FF',
                        borderRadius: 16,
                        borderWidth: 1,
                        borderColor: '#DBEAFE',
                        padding: 12
                    }}>
                        <View style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: 12,
                            paddingHorizontal: 4
                        }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Image
                                    source={require('../assets/images/hesap_hediye.png')}
                                    style={{ width: 22, height: 22, marginRight: 8, tintColor: '#1E40AF' }}
                                    resizeMode="contain"
                                />
                                <Text style={{ fontFamily: 'NunitoSans-Bold', fontSize: 16, color: '#1E3A8A' }}>
                                    {translate('Aynı Gün Teslim Ürünleri')}
                                </Text>
                            </View>

                            <TouchableOpacity onPress={() => navigation.navigate('KategoriNav', { cid: 87, title: 'Çiçek' })}>
                                <Text style={{ fontFamily: 'NunitoSans-Bold', fontSize: 13, color: '#2563EB' }}>
                                    {translate('Tümünü Gör')} {'>'}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {benzeruruns.map(item => renderSimilarProduct(item))}
                    </View>
                )}
            </View>
        )}

        {kargouyartext && <View style={{ marginTop: 10, padding: 8, width: '100%', alignItems: 'center', backgroundColor: colors.white, }}>
            <Text style={{ textAlign: 'center', fontSize: 13, color: 'green' }}>{kargouyartext}</Text>

        </View>}
        {gun1 && <View style={{
            flexDirection: 'row', padding: 6, paddingBottom: 4,
            paddingTop: 10, position: 'relative', zIndex: 100
        }}>
            <Tabrender tabsay={1} tarih={gun1} />
            <Tabrender tabsay={2} tarih={gun2} />
            <Tabrender tabsay={3} tarih={gun3} />
            <Tabrender tabsay={4} tarih={gun4} />

            {showCalendar1 && calendarBTN && (<View style={styles.calendar}>
                <Calendar
                    minDate={formatDateForCalendar(new Date())}
                    maxDate={formatDateForCalendar(new Date(new Date().setDate(new Date().getDate() + 30)))}
                    firstDay={1} // Haftanın ilk günü olarak Pazartesi'yi ayarla (0: Pazar, 1: Pazartesi)
                    onDayPress={day => { onStartDateChange(new Date(day.dateString)); }}
                    markedDates={getMarkedDates(kapaliguns, ozelguns)}
                    locale={locale}
                    style={{
                        borderWidth: 1,
                        borderColor: '#efefef',
                    }}
                    theme={{
                        backgroundColor: colors.white,
                        calendarBackground: colors.white,
                        textSectionTitleColor: '#b6c1cd',
                        textSectionTitleDisabledColor: '#d9e1e8',
                        selectedDayBackgroundColor: '#00adf5',
                        selectedDayTextColor: colors.white,
                        todayTextColor: '#00adf5',
                        dayTextColor: '#2d4150',
                        textDisabledColor: '#d9e1e8',
                        dotColor: '#00adf5',
                        selectedDotColor: colors.white,
                        arrowColor: '#e7cdb2',
                        disabledArrowColor: '#d9e1e8',
                        monthTextColor: 'black',
                        indicatorColor: 'black',
                        textDayFontFamily: 'black',
                        textMonthFontFamily: 'black',
                        textDayHeaderFontFamily: 'black',
                        textDayFontWeight: '300',
                        textMonthFontWeight: 'bold',
                        textDayHeaderFontWeight: '300',
                        textDayFontSize: 16,
                        textMonthFontSize: 16,
                        textDayHeaderFontSize: 16
                    }}
                />
            </View>
            )}
        </View>}
        <View style={{ flex: 1 }}>

            {secilenGUN && <View style={{ flexDirection: 'row', padding: 7, paddingTop: 0, paddingBottom: 0 }}>
                <ScrollView style={{ height: 50, flex: 1 }} horizontal={true}>
                    {teslimSaatler && secilenGUN && filtreliSaatler().map((saat) => {
                        return (
                            <TouchableOpacity key={saat.metin} onPress={() => setsecilenSAAT(saat.metin)}
                                style={[styles.saattab, { backgroundColor: secilenSAAT == saat.metin ? colors.primary : colors.bgGray }]}>
                                <Text style={[styles.saattabText, { color: secilenSAAT == saat.metin ? 'white' : colors.textDark }]}>{saat.metin}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>}

            {urunAlanlar.length > 0 && <KisiyeOzel fv={formValues} ua={urunAlanlar}
                onSubmit={(values) => setLevhaNot(values)}
            ></KisiyeOzel>}

            {(secilenGUN || kargouyartext) && <View style={{ padding: 30 }} >
                {closedSpecialDayRedirect ? (
                    <View style={{ backgroundColor: '#FFF5F5', borderRadius: 8, padding: 15, borderWidth: 1, borderColor: '#ffcdd2', alignItems: 'center' }}>
                        <Text style={{ color: '#d32f2f', fontSize: 13, textAlign: 'center', marginBottom: 10, fontFamily: 'NunitoSans-Bold' }}>
                            {closedSpecialDayRedirect.kapaliYonlendirmeMetni || "Seçtiğiniz ürün bu özel günde gönderime kapalıdır. Alternatif ürünlerimize göz atabilirsiniz."}
                        </Text>
                        {closedSpecialDayRedirect.yonlendirmeButonLinki && (
                            <TouchableOpacity onPress={() => navigation.navigate('Home')} style={{ backgroundColor: '#e91e63', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 6 }}>
                                <Text style={{ color: 'white', fontWeight: 'bold' }}>{closedSpecialDayRedirect.yonlendirmeButonYazisi || "Alternatifleri Gör"}</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                ) : (
                    <IkostButton title="Devam" onPress={() => sepeteekle()}></IkostButton>
                )}
                
                <View style={{
                    marginTop: 25,
                    backgroundColor: colors.bgLight,
                    borderRadius: 8,
                    padding: 12,
                    flexDirection: 'row',
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: '#F1F1F1'
                }}>
                    <View style={{
                        width: 24,
                        height: 24,
                        borderRadius: 12,
                        borderWidth: 1.5,
                        borderColor: '#555',
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginRight: 10
                    }}>
                        <Text style={{
                            fontSize: 14,
                            fontWeight: 'bold',
                            color: '#555',
                            fontFamily: 'NunitoSans-Bold'
                        }}>i</Text>
                    </View>
                    <Text style={{
                        fontFamily: 'NunitoSans-Regular',
                        fontSize: 12,
                        color: '#555',
                        flex: 1,
                        lineHeight: 16
                    }}>
                        {translate('Yukarıda verilen teslimat süreleri tahmini olup mevzuattaki yasal sürelerin aşılmaması koşuluyla sapmalar yaşanabilmektedir.')}
                    </Text>
                </View>
            </View>}
        </View>

        {showRedirectModal && closedSpecialDayRedirect && (
            <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', zIndex: 9999, elevation: 10 }]}>
                <View style={{ backgroundColor: 'white', width: '85%', borderRadius: 16, padding: 25, alignItems: 'center', shadowColor: '#000', shadowOffset: {width: 0, height: 5}, shadowOpacity: 0.3, shadowRadius: 10, elevation: 15 }}>
                    {closedSpecialDayRedirect.icon && (
                        <Image source={{uri: closedSpecialDayRedirect.icon}} style={{width: 64, height: 64, marginBottom: 15}} resizeMode="contain" />
                    )}
                    <Text style={{ fontSize: 18, fontFamily: 'NunitoSans-Bold', marginBottom: 15, textAlign: 'center', color: '#111' }}>
                        {closedSpecialDayRedirect.name || "Özel Gün"}
                    </Text>
                    <Text style={{ fontSize: 14, fontFamily: 'NunitoSans-Regular', marginBottom: 20, textAlign: 'center', color: '#555', lineHeight: 20 }}>
                        {closedSpecialDayRedirect.kapaliYonlendirmeMetni || "Seçtiğiniz ürün bu özel günde gönderime kapalıdır. Alternatif ürünlerimize göz atabilirsiniz."}
                    </Text>
                    {closedSpecialDayRedirect.yonlendirmeButonLinki && (
                        <TouchableOpacity onPress={() => { setShowRedirectModal(false); navigation.navigate('Home'); }} style={{ backgroundColor: '#e91e63', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8, width: '100%', alignItems: 'center', marginBottom: 10 }}>
                            <Text style={{ color: 'white', fontFamily: 'NunitoSans-Bold', fontSize: 15 }}>{closedSpecialDayRedirect.yonlendirmeButonYazisi || "Alternatifleri Gör"}</Text>
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity onPress={() => setShowRedirectModal(false)} style={{ padding: 10, width: '100%', alignItems: 'center' }}>
                        <Text style={{ color: '#888', fontFamily: 'NunitoSans-Bold', fontSize: 14 }}>Kapat</Text>
                    </TouchableOpacity>
                </View>
            </View>
        )}

    </>
    )
};

const styles = StyleSheet.create({
    calendar: {
        position: 'absolute', width: '100%',
        top: 100,
        zIndex: 2000,
    },
    icon: {
        width: 25, height: 25, marginBottom: 3
    },
    ozelicon: {
        width: '100%', height: 40, marginBottom: 3
    },
    tab: {
        height: 85,
        flex: .25,
        padding: 5,
        margin: 3,
        backgroundColor: colors.bgGray,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center'
    },
    saattab: {
        height: 42,
        paddingHorizontal: 15,
        margin: 3,
        backgroundColor: colors.bgGray,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center'
    },
    tabText: {
        color: 'black',
        paddingHorizontal: 5,
        fontWeight: 'bold',
        textAlign: 'center'
    },
    saattabText: {
        color: 'black',
        fontSize: 12,
        fontWeight: 'bold',
    },
    tabTextDate: {
        color: 'black',
        fontSize: 12,
        marginBottom: 6
    },
});

export default GunSaatSec;
