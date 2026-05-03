import API_CONFIG from '../config/apiConfig';
import React, { useRef, useContext, useState, useEffect } from 'react';
import {
    Switch, TextInput, View, Button, ScrollView, Text, Alert,
    Image, TouchableOpacity, StyleSheet, Dimensions, KeyboardAvoidingView, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import stylesglobal from '../stylesglobal';
import AnaFooter from '../components/AnaFooter';
import { useRoute } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import IkostTextInput from '../components/IkostTextInput';
import BottomSheet from '../components/IkostBottomSheet';
import BasketItem from '../components/BasketItem';
import IkostButton from "../components/IkostButton";
import Svg, { G, Path } from 'react-native-svg';
import { SepetContext } from '../components/SepetContext';
import LottieView from 'lottie-react-native';

import { ikostalert } from '../GlobalAlert';


import InsiderEvents from '../utils/InsiderHelper';
import { checkTimeValidity } from '../utils/TimeSlotValidator';
import ExpiredSlotModal from '../components/ExpiredSlotModal';
import { useFocusEffect } from '@react-navigation/native';
import { urls } from '../config/apiUrls';
import { colors } from '../config/theme';
import { convertPriceString } from '../utils/priceFormatter';

const KapatSVG = () => (
    <Svg width="8" height="8" viewBox="0 0 20 20">
        <G clipPath="url(#clip-path)">
            <Path d="M9.555,8.231a1.36,1.36,0,0,1,.134-.193Q13.532,4.19,17.376.344A.953.953,0,0,1,18.331.03a.924.924,0,0,1,.505,1.476,2.328,2.328,0,0,1-.191.2q-3.818,3.82-7.637,7.639c-.052.052-.112.1-.238.2A1.166,1.166,0,0,1,11,9.684q3.848,3.843,7.692,7.689a.962.962,0,0,1,.322.953.925.925,0,0,1-1.5.5c-.062-.051-.117-.11-.174-.167L9.711,11.028c-.057-.057-.105-.122-.172-.2-.072.068-.124.117-.175.167q-3.852,3.852-7.7,7.706a.952.952,0,0,1-.955.311.924.924,0,0,1-.512-1.462,2.124,2.124,0,0,1,.189-.2q3.825-3.827,7.651-7.652a1.621,1.621,0,0,1,.19-.14c-.084-.089-.133-.143-.184-.194L.378,1.693a1.875,1.875,0,0,1-.21-.235A.926.926,0,0,1,1.47.176,2.048,2.048,0,0,1,1.7.388L9.355,8.039c.051.051.105.1.2.192" fill={colors.black} />
        </G>
    </Svg>
);

const Url = `${API_CONFIG.frontendApi}/api/`;

const BasketView = ({ navigation }) => {
    const route = useRoute();
    const { fetchTranslations, translate, sepetTutari, setSepetTutari, insiderProductMap1, activeCurrency } = useContext(SepetContext);
    const scrollRef = useRef(null);

    const [sepetData, setsepetData] = useState([]);
    const [sepetList, setsepetList] = useState(null);
    const [kargofiyatstring, setkargofiyatstring] = useState(null);
    const [sepetAdet, setsepetAdet] = useState(0);
    const [secilenGUN, setsecilenGUN] = useState(null);
    const [secilenSAAT, setsecilenSAAT] = useState(null);
    const [toplam, settoplam] = useState('');
    const [title, settitle] = useState('Sepet');
    const [indirim, setindirim] = useState(null);
    const [secilenMahItem, setsecilenMahItem] = useState(null);
    const [discountCode, setDiscountCode] = useState('');
    const [Code, setCode] = useState(null);
    const [sheetVisible, setSheetVisible] = useState(false);
    const ekranYuksekligiFloat = Dimensions.get('window').height * 0.80;
    const ekranYuksekligiInt = Math.floor(ekranYuksekligiFloat);
    const [isLoading, setIsLoading] = useState(true);
    const [username, setusername] = useState(null);
    const [memberID, setumemberID] = useState(null);
    const { sepetSayisi, setSepetSayisi } = useContext(SepetContext);


    const [invalidItems, setInvalidItems] = useState([]);
    const [expiredModalVisible, setExpiredModalVisible] = useState(false);
    const [expiredItem, setExpiredItem] = useState(null);
    const [availableSlots, setAvailableSlots] = useState([]); // ALL slots for a day
    const [availableDay, setAvailableDay] = useState(null); // { dayLabel, dateString, date }
    const [selectedSlotIndex, setSelectedSlotIndex] = useState(null);
    const [isLoadingSlot, setIsLoadingSlot] = useState(false);
    // Route params'dan sepetAdim al (default 0)
    const initialSepetAdim = route.params?.sepetAdim ?? 0;
    const [sepetAdim, setsepetAdim] = useState(initialSepetAdim);
    // Eğer sepetAdim=1 ile geldiyse formları aç (gurupla=true)
    const [gurupla, setGurupla] = useState(initialSepetAdim === 1);
    const [kartDetailsList, setKartDetailsList] = useState([]); // Kart detayları için liste
    const [formDataMap, setFormDataMap] = useState({}); // Teslimat formu verileri (id -> formData)

    // **Sepet verilerini parent-child olarak gruplayan fonksiyon**
    const groupSepetList = (items) => {
        const groupedData = [];
        items.forEach((item) => {
            // parent_ID=null olan item "ana" item olur
            if (item.parent_ID === null) {
                // Bu parent’a bağlı child’ları bul
                const children = items.filter(childItem => childItem.parent_ID === item.id);
                groupedData.push({
                    parent: item,
                    children
                });
            }
        });
        return groupedData;
    };

    const applyDiscount = () => {

        axios.get(`${urls.sepetIndirim}`, {
            params: {
                code: Code,
                kupon: discountCode
            }
        })
            .then(async response => {
                if (response.data !== "tamam") {
                    ikostalert("HATA", response.data, [{ text: 'TAMAM' }]);
                }
                if (response.data === "tamam") {
                    verial();
                    setSheetVisible(false);
                }
            })
            .catch(error => console.log(error));
    };

    useEffect(() => {

        verial();
    }, []);

    // Insider SDK - Cart Page View Event
    useEffect(() => {

        const products = (sepetList || []).map(item => {
            const productId = String('P-' + item.urun_id);
            const persistedProduct = insiderProductMap1[productId];

            return {
                id: productId,
                name: item.ad || item.title || '',
                price: (persistedProduct && persistedProduct.unit_sale_price) || 0,
                unit_price: (persistedProduct && persistedProduct.unit_price) || 0, // Add original price
                quantity: item.adet || 1,
                // Use persisted taxonomy if available, otherwise fall back to item taxonomy or empty
                taxonomy: (persistedProduct && persistedProduct.taxonomy) ? persistedProduct.taxonomy : (item.taxonomy || []),
                // Use persisted image if available, otherwise fall back to item image
                image_url: (persistedProduct && persistedProduct.product_image_url) ? persistedProduct.product_image_url : (item.resim || ''),
                url: (persistedProduct && persistedProduct.url) ? persistedProduct.url : '', // Add URL
                currency: 'TRY'
            };
        });
        console.log('Insider Cart Products:', products);
        InsiderEvents.visitCartPage(products);
    }, [sepetList, insiderProductMap1]);

    useEffect(() => {
        scrollRef.current?.scrollTo({ y: 0, animated: true });
    }, [sepetAdim]);

    // Check validation on screen focus
    useFocusEffect(
        React.useCallback(() => {
            validateCartItems();
        }, [sepetList])
    );

    const validateCartItems = async () => {
        if (!sepetList || sepetList.length === 0) return true;

        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normalize to start of day

        for (const item of sepetList) {
            // Only validate time if delivery date is TODAY
            if (item.teslimtarih) {
                const deliveryDate = new Date(item.teslimtarih);
                deliveryDate.setHours(0, 0, 0, 0); // Normalize to start of day

                // Skip validation if delivery date is not today
                if (deliveryDate.getTime() !== today.getTime()) {
                    continue;
                }
            }

            // We check 'tarih' (if present) OR 'teslimsaat' which we are now populating with the full string.
            const slotString = item.teslimsaat || item.tarih;
            if (!slotString) continue;

            let slotExpired = false;

            // Step 1: API-based bugunpasif validation (same as Next.js)
            try {
                let bolgeId = item.bolge_id;
                if (!bolgeId) {
                    try {
                        const storedMahalleItem = await AsyncStorage.getItem('@mahalleitem');
                        if (storedMahalleItem) {
                            const mahalleItem = JSON.parse(storedMahalleItem);
                            bolgeId = mahalleItem.bolge_id;
                        }
                    } catch (e) { /* ignore */ }
                }
                const productId = item.urun_id || item.product_id;

                if (bolgeId && productId) {
                    // Get delivery availability (sonsaat, minteslimsure)
                    const availRes = await axios.post(urls.teslimGunSayisi, {
                        UretimSuresi: 0, Premium: 0,
                        BolgeId: bolgeId, bayiUserName: '',
                        PrID: productId,
                    }, { headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' } });
                    const availData = availRes.data;

                    // sonsaat kontrolü
                    const sonSaat = availData.sonsaat ?? 24;
                    const currentHour = new Date().getHours();
                    if (currentHour >= sonSaat) {
                        slotExpired = true;
                    }

                    // bugunpasif kontrolü via teslimSaatleri API
                    if (!slotExpired) {
                        const bugunyoktur = currentHour >= sonSaat;
                        const timesRes = await axios.post(urls.teslimSaatleri, {
                            minteslimsure: availData.minteslimsure ?? 30,
                            bugunyoktur,
                            haftagun: false,
                        }, { headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' } });
                        const allSlots = [
                            ...(timesRes.data.saatlerUcretsiz || []),
                            ...(timesRes.data.saatlerUcretli || []),
                        ];

                        const cartSlotText = (slotString || '').replace(/\s/g, '');
                        const matchingSlot = allSlots.find(s => {
                            const apiSlotText = (s.metin || '').replace(/\s/g, '').replace(/\s*\/\s*/g, '-');
                            return apiSlotText === cartSlotText;
                        });

                        if (matchingSlot) {
                            // bugunpasif (server-side pasife_alma_saati)
                            if (matchingSlot.bugunpasif) {
                                console.warn('[ExpiredSlot] Slot bugunpasif=true for:', cartSlotText);
                                slotExpired = true;
                            }
                            // tarih#deadline (client-side double check)
                            if (!slotExpired && matchingSlot.tarih && matchingSlot.tarih.includes('#')) {
                                const limitTimeStr = matchingSlot.tarih.split('#')[1]?.trim();
                                if (limitTimeStr) {
                                    const [h, m, s] = limitTimeStr.split(':').map(Number);
                                    const limitDate = new Date();
                                    limitDate.setHours(h, m, s || 0, 0);
                                    if (new Date() > limitDate) {
                                        console.warn('[ExpiredSlot] Slot tarih#deadline passed:', limitTimeStr);
                                        slotExpired = true;
                                    }
                                }
                            }
                        } else {
                            // No match found — slot no longer active
                            console.warn('[ExpiredSlot] No matching slot in API for:', cartSlotText);
                            slotExpired = true;
                        }
                    }
                }
            } catch (e) {
                console.warn('[ExpiredSlot] API validation skipped:', e.message);
            }

            // Fallback: checkTimeValidity (uses start time when # is stripped)
            if (slotExpired || !checkTimeValidity(slotString)) {
                setExpiredItem(item);
                await findNextAvailableSlot(item);
                setExpiredModalVisible(true);
                return false;
            }
        }
        return true;
    };

    // Haftagun matching logic (same as Next.js useExpiredSlotValidation)
    const WEEKDAY_MAP = {
        'sunday': 0, 'pazar': 0,
        'monday': 1, 'pazartesi': 1,
        'tuesday': 2, 'salı': 2, 'sali': 2,
        'wednesday': 3, 'çarşamba': 3, 'carsamba': 3,
        'thursday': 4, 'perşembe': 4, 'persembe': 4,
        'friday': 5, 'cuma': 5,
        'saturday': 6, 'cumartesi': 6
    };

    const matchesHaftagun = (slot, targetDate) => {
        const haftagun = slot.haftagun?.toLowerCase().trim();
        if (!haftagun || haftagun === '-') return false;
        if (WEEKDAY_MAP.hasOwnProperty(haftagun)) {
            return targetDate.getDay() === WEEKDAY_MAP[haftagun];
        }
        const parts = slot.haftagun.split('.');
        if (parts.length === 3) {
            const slotDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
            if (!isNaN(slotDate.getTime())) {
                return slotDate.getFullYear() === targetDate.getFullYear() &&
                    slotDate.getMonth() === targetDate.getMonth() &&
                    slotDate.getDate() === targetDate.getDate();
            }
        }
        return false;
    };

    const getDayLabel = (date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        if (d.getTime() === today.getTime()) return translate('Bugün');
        if (d.getTime() === tomorrow.getTime()) return translate('Yarın');
        const gunler = [translate('Pazar'), translate('Pazartesi'), translate('Salı'), translate('Çarşamba'), translate('Perşembe'), translate('Cuma'), translate('Cumartesi')];
        return gunler[d.getDay()];
    };

    const getTurkishDateString = (date) => {
        const d = new Date(date);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}.${month}.${year}`;
    };

    // Find ALL available slots for the first available day (matching Next.js)
    const findNextAvailableSlot = async (item) => {
        try {
            let bolgeId = item.bolge_id;
            if (!bolgeId) {
                try {
                    const storedMahalleItem = await AsyncStorage.getItem('@mahalleitem');
                    if (storedMahalleItem) {
                        const mahalleItem = JSON.parse(storedMahalleItem);
                        bolgeId = mahalleItem.bolge_id;
                    }
                } catch (e) {
                    console.error('Error reading mahalleitem:', e);
                }
            }

            const model = {
                UretimSuresi: 0, Premium: 0,
                BolgeId: bolgeId, bayiUserName: '',
                PrID: item.urun_id || item.product_id
            };

            const responseteslimgunsay = await axios.post(urls.teslimGunSayisi, model, {
                headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
            });
            const teslimgunsaybak = responseteslimgunsay.data;

            if (teslimgunsaybak.kargolu || teslimgunsaybak.bayi_id === 0) {
                setAvailableSlots([]);
                setAvailableDay(null);
                setIsLoadingSlot(false);
                return;
            }

            // Step 2: Fetch slots
            const sonSaatFindSlot = teslimgunsaybak.sonsaat ?? 24;
            const currentHourFindSlot = new Date().getHours();
            const bugunyokturFindSlot = currentHourFindSlot >= sonSaatFindSlot;
            const responsesaatler = await axios.post(urls.teslimSaatleri, {
                minteslimsure: teslimgunsaybak.minteslimsure ?? 30,
                bayiUserName: '', bugunyoktur: bugunyokturFindSlot, haftagun: false
            }, { headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' } });

            const { saatlerUcretsiz } = responsesaatler.data;
            const slots = saatlerUcretsiz || [];

            // Step 3: Fetch closed days
            let closedDays = [];
            try {
                const responsekapaligunler = await axios.get(
                    `${API_CONFIG.basketApi}/api/Home/gunKapatList`, {
                    params: { bayiUserName: '', bayi_id: teslimgunsaybak.bayi_id ?? 0 }
                });
                closedDays = Array.isArray(responsekapaligunler.data) ? responsekapaligunler.data : [];
            } catch (e) {
                console.error('Failed to fetch closed days:', e);
            }

            const isDayClosed = (date) => {
                return closedDays.some(closed => {
                    const closedDate = new Date(closed.gun);
                    return closedDate.getFullYear() === date.getFullYear() &&
                        closedDate.getMonth() === date.getMonth() &&
                        closedDate.getDate() === date.getDate();
                });
            };

            const now = new Date();

            // Sort slots by start time
            const sortedSlots = [...slots].sort((a, b) => {
                const timeA = (a.metin || '').split('-')[0] || '23:59';
                const timeB = (b.metin || '').split('-')[0] || '23:59';
                return timeA.localeCompare(timeB);
            });

            // Check if slot is valid for today
            const isSlotValidForToday = (slot) => {
                if (slot.bugunpasif) return false;
                if (!slot.tarih || !slot.tarih.includes('#')) {
                    const timeRange = (slot.metin || '').split('-');
                    if (timeRange.length >= 2) {
                        const startTimeStr = timeRange[0].trim();
                        const [startHour, startMinute] = startTimeStr.split(':').map(Number);
                        const startDate = new Date();
                        startDate.setHours(startHour, startMinute, 0, 0);
                        return now <= startDate;
                    }
                    return true;
                }
                const limitTimeStr = slot.tarih.split('#')[1]?.trim();
                if (!limitTimeStr) return true;
                const [h, m, s] = limitTimeStr.split(':').map(Number);
                const limitDate = new Date();
                limitDate.setHours(h, m, s || 0, 0);
                return now <= limitDate;
            };

            // Get ALL available slots for a specific date
            const getSlotsForDate = (date, isToday) => {
                let generalSlots = [];
                let specificSlots = [];
                for (const slot of sortedSlots) {
                    const hg = slot.haftagun?.toLowerCase().trim();
                    if (!hg || hg === '-') {
                        if (isToday) {
                            if (isSlotValidForToday(slot)) generalSlots.push(slot);
                        } else {
                            generalSlots.push(slot);
                        }
                    } else if (matchesHaftagun(slot, date)) {
                        if (isToday) {
                            if (isSlotValidForToday(slot)) specificSlots.push(slot);
                        } else {
                            specificSlots.push(slot);
                        }
                    }
                }
                return specificSlots.length > 0 ? specificSlots : generalSlots;
            };

            // Loop through 7 days to find first day with available slots
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            for (let dayOffset = 0; dayOffset <= 7; dayOffset++) {
                const candidateDate = new Date(today);
                candidateDate.setDate(candidateDate.getDate() + dayOffset);
                const isToday = dayOffset === 0;

                if (isDayClosed(candidateDate)) continue;

                const daySlots = getSlotsForDate(candidateDate, isToday);
                if (daySlots.length > 0) {
                    const dayLabel = getDayLabel(candidateDate);
                    const dateString = getTurkishDateString(candidateDate);

                    setAvailableSlots(daySlots);
                    setAvailableDay({ dayLabel, dateString, date: candidateDate });
                    setSelectedSlotIndex(null);
                    setIsLoadingSlot(false);
                    return;
                }
            }

            setAvailableSlots([]);
            setAvailableDay(null);
            setIsLoadingSlot(false);
        } catch (error) {
            console.error('Error fetching slots:', error);
            setAvailableSlots([]);
            setAvailableDay(null);
            setIsLoadingSlot(false);
        }
    };

    // Call API to update cart item's delivery time
    const updateCartItemSlot = async (slotIndex) => {
        const idx = slotIndex !== undefined ? slotIndex : selectedSlotIndex;
        if (!expiredItem || idx === null || idx === undefined || !availableSlots[idx] || !availableDay) return;

        const selectedSlot = availableSlots[idx];

        try {
            let yeniSonSaat = '23:59:59';
            if (selectedSlot.tarih && selectedSlot.tarih.includes('#')) {
                yeniSonSaat = selectedSlot.tarih.split('#')[1]?.trim() || '23:59:59';
            }

            const model = {
                Code: Code,
                Sid: expiredItem.id,
                TeslimSaat: selectedSlot.tarih?.split('#')[0]?.trim() || selectedSlot.metin,
                YeniSonSaat: yeniSonSaat,
                TeslimGun: availableDay.dateString
            };

            console.log('Updating cart item slot:', model);
            await axios.post(urls.sepetSaatGuncelle, model);

            verial();
            setExpiredModalVisible(false);
            setExpiredItem(null);
            setAvailableSlots([]);
            setAvailableDay(null);
            setSelectedSlotIndex(null);
        } catch (error) {
            console.error('Error updating slot:', error);
            if (error.response) {
                Alert.alert('Hata', 'Sunucu hatası: ' + (error.response.data.message || 'Bilinmeyen hata'));
            } else {
                ikostalert('Hata', 'Teslimat saati güncellenirken bir hata oluştu.');
            }
        }
    };


    const verial = async () => {
        setIsLoading(true);
        const username = await AsyncStorage.getItem('username');
        const memberID = await AsyncStorage.getItem('memberID');
        setusername(username);
        setumemberID(memberID);

        const code = await AsyncStorage.getItem('@code');
        console.log(code);

        if (code !== null) {
            setCode(code);
            const dilStored = await AsyncStorage.getItem('dil');
            const kurStored = await AsyncStorage.getItem('kur');

            axios.get(`${urls.sepetIzle}`, {
                params: {
                    code: code
                }
            })
                .then(async response => {
                    setsepetAdet(response.data.sepetlist);
                    setsepetList(response.data.sepetlist);
                    settoplam(response.data.uruntoplam);
                    setSepetTutari(response.data.uruntoplam);
                    setkargofiyatstring(response.data.kargofiyatstring);
                    setindirim(response.data.indirim);
                    setsepetData(response.data);
                    setIsLoading(false);
                    await AsyncStorage.setItem('@toplam', response.data.uruntoplam);
                })
                .catch(error => {
                    console.log('verial error (sepetizle):', error);
                    setIsLoading(false);
                });
        } else {
            setIsLoading(false);
        }
    };

    const sepetadet = async () => {
        if (sepetList != null) {
            const totalQuantity = sepetList.reduce((total, item) => {
                return total + item.adet;
            }, 0);
            await AsyncStorage.setItem('@sepetadet5', totalQuantity.toString());
            setSepetSayisi(totalQuantity.toString());
        }
    };

    useEffect(() => {
        sepetadet();
    }, [sepetList]);

    useEffect(() => {
        if (sepetAdim == 0) settitle(translate('Sepetim'));
        if (sepetAdim == 1) settitle(translate('Teslimat Bilgileri'));
        if (sepetAdim == 2) settitle(translate('Ek Ürünler'));
        // Kart Notu adımı kaldırıldı - teslimat bilgileriyle birlikte alınıyor

    }, [sepetAdim]);

    const sonrakiadim = async () => {

        // Validate before proceeding
        const isValid = validateCartItems();
        if (!isValid) return;

        if (sepetAdim == 0) {
            await setGurupla(true);

        }
        let hatavar = false;

        if (sepetAdim == 1) {
            // Gruplu modda sadece parent item'ları kontrol et (parent_ID === null)
            const itemsToCheck = gurupla
                ? sepetList.filter(item => item.parent_ID === null)
                : sepetList;

            // Form verilerini kontrol et
            const invalidItemsList = [];
            for (const item of itemsToCheck) {
                const formData = formDataMap[item.id];
                if (!formData || !formData.adres || !formData.isim || !formData.telefon) {
                    invalidItemsList.push(item.id);
                }
            }

            if (invalidItemsList.length > 0) {
                ikostalert("Eksik Bilgi", "Lütfen Teslimat Bilgilerini Tamamlayınız!", [{ text: "Tamam" }]);
                setInvalidItems(invalidItemsList);
                hatavar = true;
            } else {
                // Tüm formları API'ye kaydet
                try {
                    const usernameStored = await AsyncStorage.getItem('username');

                    for (const item of itemsToCheck) {
                        const formData = formDataMap[item.id];
                        if (formData) {
                            // Check if this item acts as a parent (has children attached)
                            const hasChildren = sepetList.some(child => child.parent_ID === item.id);
                            let parentID = hasChildren ? item.id : -1;

                            // Also need to handle if we are updating a CHILD item directly (though rare in grouped view)
                            // But usually we update via the parent.

                            let model = {
                                Code: Code,
                                sid: item.id,
                                TeslimAdres: formData.adres,
                                TeslimAd: formData.isim,
                                TeslimTelefon: formData.telefon,
                                parentID: parentID,
                                Username: usernameStored,
                                isKayit: formData.isKayit || false,
                                TeslimKartNot: formData.kartNot || '',
                                TeslimKartAd: formData.kartAd || ''
                            };

                            await axios.post(`${API_CONFIG.basketApi}/api/SepetView/sepetupdate/`, model);

                            // Kart notunu da ayrı kaydet (KartNotUpdate API)
                            if (formData.kartNot || formData.kartAd) {
                                const kartNotModel = {
                                    codesanal: Code,
                                    sid: item.id,
                                    teslimkartnot: formData.kartNot || '',
                                    teslimkartad: formData.kartAd || ''
                                };
                                await axios.post(`${urls.kartNotUpdate}`, kartNotModel);
                            }
                        }
                    }

                    // Sepet verilerini yenile
                    await verial();
                    // İnvalid items listesini temizle
                    setInvalidItems([]);
                } catch (error) {
                    console.error('Form kaydetme hatası:', error);
                    ikostalert('Hata', 'Bilgiler kaydedilirken bir hata oluştu.');
                    hatavar = true;
                }
            }
        }

        // Ek Ürünler adımından sonra direkt ödeme sayfasına git
        if (sepetAdim == 2) {
            const memberID = await AsyncStorage.getItem('memberID');
            if (memberID !== null) {
                navigation.navigate('SepetFaturaNav', { toplam });
            } else {
                navigation.navigate('GirisNav', { returnScreen: 'SepetFaturaNav' });
            }
            return;
        }

        if (!hatavar && sepetAdim < 2) await setsepetAdim(sepetAdim + 1);


    };


    const deleteCartItem = async (id) => {
        try {
            const response = await axios.post(
                `${urls.sepetItemSil}?id=${id}&code=${encodeURIComponent(Code)}`,
                {},
                {
                    headers: {
                        'Accept': 'application/json',
                    },
                },
            );
            if (response.data.message === 'yes') {
                console.log('Başarıyla silindi.');
            } else {
                console.log('Silme başarısız.');
            }
        } catch (error) {
            console.error('API çağrısında hata:', error.response?.data || error.message);
        }
    };

    const indirimsil = async () => {

        axios.get(`${urls.indirimSil}`, {
            params: {
                code: Code
            }
        })
            .then(async response => {
                if (response.data !== "yes") {
                    ikostalert("HATA", response.data, [{ text: 'TAMAM' }]);
                }
                if (response.data === "yes") {
                    verial();
                }
            })
            .catch(error => console.log(error));

    };

    const handleRemove = async (id) => {
        if (!sepetList) return;

        // Insider SDK - Item Removed from Cart Event
        const itemToRemove = sepetList.find(item => item.id === id);
        if (itemToRemove) {
            InsiderEvents.itemRemovedFromCart('P-' + itemToRemove.urun_id);
        }

        // Sepet boşaldıysa Cart Cleared event'i tetikle
        const remainingItems = sepetList.filter(item => item.id !== id);
        if (remainingItems.length === 0) {
            InsiderEvents.cartCleared();
        }

        // Optimistic UI update: remove item immediately from UI
        setsepetList(remainingItems);

        // Show loading or block interaction if needed, though optimistic update handles visual part
        setIsLoading(true);

        // AWAIT the deletion! Critical fix for race condition.
        await deleteCartItem(id);

        // Refresh cart from backend to ensure state consistency (prices, etc)
        // Also refreshes the "total quantity" which might be stuck if we don't refresh
        await verial();
    };

    const handleUpdateAdres = async () => {
        // Sepet verilerini yeniden al
        const code = await AsyncStorage.getItem('@code');
        if (code) {
            try {
                const response = await axios.get(`${urls.sepetIzle}`, {
                    params: { code: code }
                });
                const updatedSepetList = response.data.sepetlist;
                setsepetList(updatedSepetList);
                settoplam(response.data.uruntoplam);
                setSepetTutari(response.data.uruntoplam);

                // Gruplu modda sadece parent item'ları kontrol et (parent_ID === null)
                const itemsToCheck = gurupla
                    ? updatedSepetList.filter(item => item.parent_ID === null)
                    : updatedSepetList;

                // Tüm ürünlerin teslimat adresi dolu mu kontrol et
                const allAddressesComplete = itemsToCheck.every(item => item.teslimadres && item.teslimadres !== '');

                // Eğer tüm adresler tamamsa, sepetAdim=1 ise VE SADECE TEK ÜRÜN VARSA otomatik olarak Ek Ürünler (sepetAdim=2) adımına geç
                const hasSingleItem = itemsToCheck.length === 1;
                if (allAddressesComplete && sepetAdim === 1 && hasSingleItem) {
                    setTimeout(() => {
                        setsepetAdim(2);
                    }, 500);
                }
            } catch (error) {
                console.log('Adres güncelleme sonrası veri çekme hatası:', error);
                verial();
            }
        }
    };

    const handleUpdateQuantity = async () => {
        verial();
    };

    // Form değişikliklerini topla
    const handleFormChange = (formData) => {
        setFormDataMap(prev => ({
            ...prev,
            [formData.id]: formData
        }));
    };

    // **Burada sepetList'i gruplayarak yeni bir liste elde ediyoruz**
    const groupedSepetList = sepetList ? groupSepetList(sepetList) : [];

    function gurubagerkvarmi(gr) {
        let gerekvar = false;
        gr.forEach((group) => {

            console.log('group.children.length:' + group.children.length);
            if (group.children.length > 0) gerekvar = true
        });
        return gerekvar;
    }

    const handleonEkurunUpt = async (toplamsepettutar) => {
        console.log(toplamsepettutar);
        settoplam(toplamsepettutar);
        setSepetTutari(toplamsepettutar);
        //setSepetTutari(toplamsepettutar);


    };
    const handleKartNotUpdate = (id, kartNot, kartAd) => {

        setKartDetailsList(prevState => {
            const existingItemIndex = prevState.findIndex(item => item.id === id);
            const updatedList = [...prevState];

            if (existingItemIndex !== -1) {
                updatedList[existingItemIndex] = { id, kartNot, kartAd };
            } else {
                updatedList.push({ id, kartNot, kartAd });
            }
            return updatedList;
        });
    };

    const sendUpateDataToAPI = async (sid, kartNot, kartAd) => {
        const apiUrl = `${urls.kartNotUpdate}`;
        const requestData = {
            codesanal: Code,
            sid: sid,
            teslimkartnot: kartNot,
            teslimkartad: kartAd
        };

        try {
            const response = await axios.post(apiUrl, requestData);
            verial();
        } catch (error) {
            ikostalert('Hata', `Kart notunuz kaydedilirken bir hata oluştu: ${error.message}`);
        }
    };

    const goBack = async () => {
        if (sepetAdim == 0) {
            navigation.goBack();
        } else {
            await setsepetAdim(sepetAdim - 1)

        }

    };

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaView style={stylesglobal.SafeAreaCSS}>
                <View style={[stylesglobal.headerCustom, { justifyContent: 'space-between' }]}>
                    <TouchableOpacity onPress={() => goBack()}
                        style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View style={{ paddingRight: 10 }}>
                            <Image
                                source={require('../assets/images/left_big.png')}
                                style={{ width: 9.78, height: 19.21 }}
                            />
                        </View>

                        <Text numberOfLines={1}
                            style={{
                                fontSize: 17,
                                color: colors.black, marginLeft: 5, marginRight: 20,
                                fontFamily: 'NunitoSans-SemiBold'
                            }}>{global.toTitleCase(translate(title))}</Text>

                    </TouchableOpacity>

                    {groupedSepetList && groupedSepetList.length > 0 && (
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            {!indirim ? (
                                <TouchableOpacity
                                    style={{
                                        backgroundColor: '#e7cdb2',
                                        paddingVertical: 5,
                                        paddingHorizontal: 12,
                                        borderRadius: 15,
                                    }}
                                    onPress={() => setSheetVisible(true)}
                                >
                                    <Text style={{ color: colors.black, fontFamily: 'NunitoSans-Regular', fontSize: 12 }}>
                                        {translate('indirim kodu girin')}
                                    </Text>
                                </TouchableOpacity>
                            ) : (
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Text style={{ fontSize: 12, fontFamily: 'NunitoSans-SemiBold', color: '#e37c33' }}>
                                        -{String(indirim).replace('.', ',')}
                                    </Text>
                                    <TouchableOpacity
                                        onPress={() => indirimsil()}
                                        style={{ marginLeft: 5 }}
                                    >
                                        <View style={{
                                            backgroundColor: '#e7cdb2',
                                            borderRadius: 10,
                                            padding: 4,
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <KapatSVG />
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    )}
                </View>

                <View style={stylesglobal.container}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        style={{ flex: 1 }}
                        keyboardVerticalOffset={100}
                    >
                        <ScrollView ref={scrollRef} style={{ flex: 1, backgroundColor: colors.background }} keyboardShouldPersistTaps="handled">

                            {sepetAdim == 1 && gurubagerkvarmi(groupedSepetList) &&
                                <View style={styles.swcontainer2}>

                                    <Switch
                                        trackColor={{ false: "gray", true: "#e37c33" }}
                                        thumbColor={"#f4f3f4"}
                                        onValueChange={(value) => { setGurupla(!value); setInvalidItems([]); }}
                                        value={!gurupla}
                                    />
                                    <View style={{ flex: 1, marginLeft: 20 }}>
                                        <Text style={[styles.swtext, !gurupla && { fontWeight: "bold" }]}>
                                            {translate('Her Birine Farklı Alıcı Bilgisi Ayarla')}</Text>
                                    </View>


                                </View>
                            }

                            {groupedSepetList && groupedSepetList.length > 0 ? (


                                sepetAdim == 0 || !gurupla ? (
                                    sepetList.map((item, index) => (
                                        <View key={item.id + '-' + index} style={stylesglobal.basketlistcontainer}>

                                            <BasketItem
                                                item={item}
                                                code={Code}
                                                username={username}
                                                memberID={memberID}
                                                sepetAdim={sepetAdim}
                                                gurupla={gurupla}
                                                onEkurunUpt={handleonEkurunUpt}
                                                KartNotUpdate={handleKartNotUpdate}
                                                isInvalid={invalidItems.includes(item.id)} // Kırmızı çerçeve kontrolü
                                                onUpdateQuantity={handleUpdateQuantity}
                                                onRemove={handleRemove}
                                                onUpdateAdres={handleUpdateAdres}
                                                onFormChange={handleFormChange}
                                                index={index + 1}
                                            />
                                        </View>
                                    ))


                                ) : (
                                    groupedSepetList.map((group, index) => (

                                        <View key={group.parent.id + '-' + index} style={stylesglobal.basketlistcontainer}>
                                            {/* <TouchableOpacity onPress={() => setGurupla(false)}
                                            style={{
                                                backgroundColor: 'orange', padding: 5,
                                                justifyContent: 'center', alignItems: 'center',
                                                paddingHorizontal: 10, borderRadius: 6, marginBottom: 10
                                            }} >
                                            <Text style={{ color: 'white', fontSize: 14 }}>
                                                {translate('Her Biri İçin Farklı Alıcı Bilgileri Ayarla')}
                                            </Text>
                                        </TouchableOpacity> */}


                                            <BasketItem
                                                item={group.parent}
                                                code={Code}
                                                username={username}
                                                memberID={memberID}
                                                sepetAdim={sepetAdim}
                                                gurupla={gurupla}
                                                onEkurunUpt={handleonEkurunUpt}
                                                KartNotUpdate={handleKartNotUpdate}
                                                isInvalid={invalidItems.includes(group.parent.id)}
                                                onUpdateQuantity={handleUpdateQuantity}
                                                onRemove={handleRemove}
                                                onUpdateAdres={handleUpdateAdres}
                                                onFormChange={handleFormChange}
                                                index={index + 1}
                                                // İsteğe bağlı: child item’ları BasketItem'a göndermek
                                                childItems={group.children}
                                            />
                                        </View>
                                    ))
                                )

                            ) : (

                                <>
                                    {!isLoading ? (
                                        <View style={styles.emptyBasketContainer}>
                                            <Image
                                                source={require('../assets/images/empty4.png')}
                                                style={styles.emptyBasketImage}
                                            />
                                            <Text style={styles.emptyBasketText}>
                                                {translate('Sepetiniz Boş')}
                                            </Text>
                                            <Text style={{ marginBottom: 20, marginTop: 20, display: 'none' }}>
                                                Beğendiğiniz ürünü sepetinize ekleyerek siparişinizi kolayca tamamlayabilirsiniz.
                                            </Text>
                                            <IkostButton
                                                title={translate("Alışverişe Başla")}
                                                onPress={() => navigation.navigate("AnaNav")}
                                                style={{ width: '100%' }}
                                            />
                                        </View>
                                    ) : (
                                        <SafeAreaView style={stylesglobal.SafeAreaCSS}>
                                            <View style={stylesglobal.loaderview}>
                                                <LottieView
                                                    source={require('../assets/animations/yukleme_ani.json')}
                                                    autoPlay
                                                    loop
                                                    style={stylesglobal.loading}
                                                />
                                            </View>
                                        </SafeAreaView>
                                    )}
                                </>
                            )}

                            {kargofiyatstring && kargofiyatstring !== "0,00 TL" && (
                                <View style={styles.itemContainer}>
                                    <View>
                                        <View style={{ flexDirection: 'row', marginBottom: 5 }}>
                                            <Text>{translate('Gönderim Fiyatı')}: </Text>
                                            <Text style={styles.price}>{convertPriceString(kargofiyatstring, null, activeCurrency)}</Text>
                                        </View>
                                        {kargoindirimlimit && (
                                            <Text style={{ fontSize: 12 }}>
                                                {kargoindirimlimit}₺ {translate('ve Üzeri Ücretsiz Teslimat')}
                                            </Text>
                                        )}
                                    </View>
                                </View>
                            )}
                        </ScrollView>
                    </KeyboardAvoidingView>

                    {/** groupSepetList sonrası hâlâ öğe varsa footer: */}
                    {groupedSepetList && groupedSepetList.length > 0 && (
                        <View style={stylesglobal.footersepet}>
                            <View style={{ flex: 1.3, justifyContent: 'center' }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Text style={{
                                        fontSize: 11,
                                        fontWeight: 'bold',
                                        fontFamily: 'NunitoSans-Regular',
                                        color: colors.textSecondary
                                    }}>
                                        {translate('TOPLAM')}:
                                    </Text>
                                    <Text style={{
                                        fontSize: 20,
                                        fontFamily: 'NunitoSans-Regular',
                                        color: 'black',
                                        marginLeft: 5
                                    }}>
                                        {convertPriceString(String(toplam), null, activeCurrency)}
                                    </Text>
                                </View>
                            </View>

                            <TouchableOpacity style={{ flex: 1 }} onPress={() => sonrakiadim()}>
                                <View style={stylesglobal.butonsepet}>
                                    <Text style={stylesglobal.butonsepetTEXT}>
                                        {translate(sepetAdim == 0 ? 'Satın Al' : 'Devam')}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/** Sepet boşsa alt tarafta footer gözükmesi isteniyorsa: */}
                    {!(groupedSepetList && groupedSepetList.length > 0) && !isLoading && (
                        <View style={stylesglobal.footer}>
                            <AnaFooter parametre={'Sepetim'} navigation={navigation} />
                        </View>
                    )}
                </View>

                <BottomSheet
                    visible={sheetVisible}
                    onClose={() => setSheetVisible(false)}
                    height={ekranYuksekligiInt * 0.75}
                    onKeyboardViewHeight={ekranYuksekligiInt * 0.75}
                    sheetBackgroundColor={colors.white}
                    backgroundColor="rgba(0,0,0,0.6)"
                    hasDraggableIcon
                >
                    <View style={{
                        flex: 1,
                        justifyContent: 'flex-end',
                        backgroundColor: 'rgba(0, 0, 0, 0.5)'
                    }}>
                        <View style={{
                            width: '100%',
                            height: '100%',
                            paddingHorizontal: 20,
                            paddingVertical: 20,
                            backgroundColor: 'white'
                        }}>
                            <IkostTextInput
                                placeholder="İndirim Kodu"
                                autoCapitalize="none"
                                title="İndirim Kodu"
                                autoFocus={true}
                                onChangeText={setDiscountCode}
                            />
                            <IkostButton title="Uygula" onPress={applyDiscount} />
                        </View>
                    </View>
                </BottomSheet>
            </SafeAreaView>


            <ExpiredSlotModal
                visible={expiredModalVisible}
                onCancel={() => {
                    setExpiredModalVisible(false);
                    setExpiredItem(null);
                    setAvailableSlots([]);
                    setAvailableDay(null);
                    setSelectedSlotIndex(null);
                }}
                title="Süre Doldu"
                message={expiredItem ? `${expiredItem.ad} adlı ürün için seçtiğiniz saat aralığı dolmuştur.` : "Seçtiğiniz saat aralığı dolmuştur."}
                onRemoveItem={() => {
                    if (expiredItem) handleRemove(expiredItem.id);
                    setExpiredModalVisible(false);
                    setExpiredItem(null);
                    setAvailableSlots([]);
                    setAvailableDay(null);
                    setSelectedSlotIndex(null);
                }}
                availableSlots={availableSlots}
                availableDay={availableDay}
                selectedSlotIndex={selectedSlotIndex}
                onSlotSelect={(index) => setSelectedSlotIndex(index)}
                onConfirmSlot={updateCartItemSlot}
                isLoading={isLoadingSlot}
                showCancel={false}
            />
        </GestureHandlerRootView >
    );
};

const styles = StyleSheet.create({
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
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 0.5,
        borderBottomColor: colors.border,
        paddingVertical: 10,
        paddingHorizontal: 10,
        backgroundColor: 'white'
    },
    price: {
        fontSize: 14,
        color: '#F5A623',
    },
    swcontainer2: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        marginVertical: 10,
        paddingHorizontal: 20,
        marginBottom: 0
    },
    swtext: {
        fontFamily: 'NunitoSans-Regular',
        fontSize: 13, color: 'black'

    },
});

export default BasketView;