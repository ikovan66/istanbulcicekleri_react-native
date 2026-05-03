import API_CONFIG from '../config/apiConfig';
import React, { useContext, useState, useEffect, useRef } from 'react';
import {
    View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions, TextInput, Switch
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import BottomSheet from "react-native-gesture-bottom-sheet";
import { SvgXml } from 'react-native-svg';
import { SepetContext } from './SepetContext';
import Svg, { Path } from 'react-native-svg';
import IkostTextInput from './IkostTextInput';
import { colors } from '../config/theme';


const TeslimBilgileriForm = ({ item, code, childItems, onFormChange, username }) => {
    const { translate } = useContext(SepetContext);
    const ekranYuksekligiFloat = Dimensions.get('window').height * 0.80;
    const ekranYuksekligiInt = Math.floor(ekranYuksekligiFloat);
    const bottomSheet = useRef();

    // Teslimat bilgileri
    const [isim, setISIM] = useState(item.teslimad || '');
    const [telefon, setTelefon] = useState(item.teslimtelefon || '');
    const [adres, setAdres] = useState(item.teslimadres || '');
    const [isKayit, setisKayit] = useState(false);

    // Kart notu bilgileri
    const [kartNot, setKartNot] = useState(item.teslimkartnot || '');
    const [kartAd, setKartAd] = useState(item.teslimkartad || '');
    const [kartnotDATA, setkartnotDATA] = useState(null);
    const [categories, setcategories] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);

    const chk = `<svg width="24px" height="24px" viewBox="0 0 512.00 512.00" version="1.1" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" stroke={colors.border} stroke-width="1.024"></g><g id="SVGRepo_iconCarrier"><g id="Page-1" stroke-width="0.00512" fill="none" fill-rule="evenodd"><g id="drop" fill={colors.black} transform="translate(64.000000, 64.000000)"><path d="M384,1.42108547e-14 L384,384 L1.42108547e-14,384 L1.42108547e-14,1.42108547e-14 L384,1.42108547e-14 Z M362.666667,21.3333333 L21.3333333,21.3333333 L21.3333333,362.666667 L362.666667,362.666667 L362.666667,21.3333333 Z" id="Combined-Shape"></path></g></g></g></svg>`;

    useEffect(() => {
        getkARTNOTLAR();
    }, []);

    useEffect(() => {
        if (categories != null && categories.length > 0) {
            setSelectedCategory(categories[0]);
        }
    }, [categories]);

    // Form değişikliklerini parent'a bildir (ilk render dahil)
    useEffect(() => {
        if (onFormChange) {
            onFormChange({
                id: item.id,
                isim,
                telefon,
                adres,
                kartNot,
                kartAd,
                isKayit
            });
        }
    }, [isim, telefon, adres, kartNot, kartAd, isKayit]);

    // Component mount olduğunda mevcut değerleri parent'a bildir
    useEffect(() => {
        if (onFormChange) {
            onFormChange({
                id: item.id,
                isim: item.teslimad || '',
                telefon: item.teslimtelefon || '',
                adres: item.teslimadres || '',
                kartNot: item.teslimkartnot || '',
                kartAd: item.teslimkartad || '',
                isKayit: false
            });
        }
    }, []);


    const getkARTNOTLAR = async () => {
        try {
            const response = await axios.get(`${API_CONFIG.basketApi}/api/SepetView/kartnotlar`);
            const data = response.data;
            setkartnotDATA(data);
            setcategories([...new Set(data.map(item => item.kategori))].sort());
        } catch (error) {
            console.error('Kart notları yüklenirken hata:', error);
        }
    };

    const getMessagesForCategory = (category) => {
        if (!kartnotDATA) return [];
        return kartnotDATA.filter(item => item.kategori === category);
    };

    const hazirnotsec = (not) => {
        setKartNot(not);
        bottomSheet.current?.close();
    };

    // Icon components - Sol tasarıma uygun
    const HeartIcon = () => (
        <Svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <Path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" stroke={colors.primary} strokeWidth="1.5" fill="none" />
        </Svg>
    );

    const PhoneIcon = () => (
        <Svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <Path d="M6.54 5c.06.89.21 1.76.45 2.59l-1.2 1.2c-.41-1.2-.67-2.47-.76-3.79h1.51m9.86 12.02c.85.24 1.72.39 2.6.45v1.49c-1.32-.09-2.59-.35-3.8-.75l1.2-1.19M7.5 3H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.49c0-.55-.45-1-1-1-1.24 0-2.45-.2-3.57-.57-.1-.04-.21-.05-.31-.05-.26 0-.51.1-.71.29l-2.2 2.2c-2.83-1.45-5.15-3.76-6.59-6.59l2.2-2.2c.28-.28.36-.67.25-1.02C8.7 6.45 8.5 5.25 8.5 4c0-.55-.45-1-1-1z" stroke={colors.primary} strokeWidth="1.5" fill="none" />
        </Svg>
    );

    const LocationIcon = () => (
        <Svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <Path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke={colors.primary} strokeWidth="1.5" fill="none" />
            <Path d="M12 11.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" stroke={colors.primary} strokeWidth="1.5" fill="none" />
        </Svg>
    );

    const PenIcon = () => (
        <Svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <Path d="M14.06 9.02l.92.92L5.92 19H5v-.92l9.06-9.06M17.66 3c-.25 0-.51.1-.7.29l-1.83 1.83 3.75 3.75 1.83-1.83c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.2-.2-.45-.29-.71-.29zm-3.6 3.19L3 17.25V21h3.75L17.81 9.94l-3.75-3.75z" stroke={colors.primary} strokeWidth="1.2" fill="none" />
        </Svg>
    );

    const SenderIcon = () => (
        <Svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <Path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" stroke={colors.primary} strokeWidth="1.5" fill="none" />
        </Svg>
    );

    const ArrowIcon = () => (
        <Svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <Path d="M7 10l5 5 5-5z" fill={colors.white} />
        </Svg>
    );


    return (
        <View style={styles.container}>
            {/* Alıcı Adı Soyadı */}
            <IkostTextInput
                title={translate("Alıcının Adı Soyadı")}
                value={isim}
                onChangeText={setISIM}
            />

            {/* Alıcı Telefon */}
            <IkostTextInput
                title={translate("Alıcının Telefon Numarası")}
                keyboardType="phone-pad"
                mask={[
                    '0', '(', /\d/, /\d/, /\d/, ')', ' ',
                    /\d/, /\d/, /\d/, ' ',
                    /\d/, /\d/, ' ',
                    /\d/, /\d/
                ]}
                value={telefon}
                onChangeText={setTelefon}
            />

            {/* Alıcı Adres */}
            <IkostTextInput
                title={translate("Alıcının Mahalle, sokak, cadde ve diğer bilgileri")}
                value={adres}
                multiline
                numberOfLines={2}
                onChangeText={setAdres}
                alttext={item.teslimmahalle ? item.teslimmahalle : null}
            />

            {/* Kart Notunuz + Hazır Notlar Butonu */}
            <View style={{ position: 'relative' }}>
                <IkostTextInput
                    title={translate("Kart Notunuz")}
                    value={kartNot}
                    multiline
                    numberOfLines={3}
                    onChangeText={setKartNot}
                />
                {/* Hazır Kart Notlarından Seçin - Sağ Alt Köşe */}
                <TouchableOpacity
                    style={styles.hazirNotlarButton}
                    onPress={() => bottomSheet.current?.show()}
                >
                    <Text style={styles.hazirNotlarText}>{translate("Hazır Notlar")}</Text>
                    <ArrowIcon />
                </TouchableOpacity>
            </View>

            {/* Gönderen Adı */}
            <IkostTextInput
                title={translate("Gönderen Adı")}
                value={kartAd.replace('isimsiz', '')}
                onChangeText={setKartAd}
            />

            {/* Kayıtlı Adreslere Ekle Switch */}
            {username && (
                <View style={styles.swcontainer}>
                    <Text style={[styles.swtext, isKayit && { fontWeight: "bold" }]}>
                        {translate('Kayıtlı teslimat adreslerime ekle')}
                    </Text>
                    <Switch
                        trackColor={{ false: "gray", true: "#e37c33" }}
                        thumbColor={"#f4f3f4"}
                        onValueChange={() => setisKayit(!isKayit)}
                        value={isKayit}
                    />
                </View>
            )}

            {/* Hazır Kart Notları BottomSheet */}
            {categories && (
                <BottomSheet
                    sheetBackgroundColor="white"
                    hasDraggableIcon
                    ref={bottomSheet}
                    height={ekranYuksekligiInt}
                >
                    <SafeAreaView style={{ flex: 1 }}>
                        <View style={styles.bottomSheetContent}>
                            <Text style={styles.bottomSheetTitle}>
                                {translate("Hazır Kart Notlarından Seçin")}
                            </Text>

                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                                {categories.map((category, index) => (
                                    <TouchableOpacity
                                        key={category + '-' + index}
                                        style={[
                                            styles.categoryItem,
                                            selectedCategory === category && styles.activeCategory
                                        ]}
                                        onPress={() => setSelectedCategory(category)}
                                    >
                                        <Text style={[
                                            styles.categoryText,
                                            selectedCategory === category && styles.categoryTextActive
                                        ]}>{category}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>

                            <ScrollView style={{ flex: 1 }}>
                                {selectedCategory && kartnotDATA && getMessagesForCategory(selectedCategory).map((message, index) => (
                                    <TouchableOpacity
                                        key={message.mesaj + '-' + index}
                                        style={styles.messageItem}
                                        onPress={() => hazirnotsec(message.mesaj)}
                                    >
                                        <SvgXml xml={chk} width="24" height="24" style={{ marginRight: 10 }} />
                                        <Text style={styles.messageText}>{message.mesaj}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    </SafeAreaView>
                </BottomSheet>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.white,
        paddingHorizontal: 15,
        paddingVertical: 10,
        paddingTop: 0,
        borderRadius: 10,
        marginTop: 0,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingVertical: 8,
    },
    iconWrapper: {
        paddingTop: 8,
        paddingRight: 5,
    },
    textInput: {
        flex: 1,
        fontSize: 14,
        fontFamily: 'NunitoSans-Regular',
        color: colors.black,
        paddingVertical: 8,
        paddingHorizontal: 10,
    },
    mahalleText: {
        fontSize: 13,
        color: colors.textDark,
        fontFamily: 'NunitoSans-Regular',
        paddingHorizontal: 10,
        paddingBottom: 5,
    },
    hazirNotlarButton: {
        position: 'absolute',
        right: 0,
        top: 12,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.primary,
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 15,
    },
    hazirNotlarText: {
        fontSize: 12,
        color: colors.white,
        fontFamily: 'NunitoSans-SemiBold',
        marginRight: 4,
    },
    emojiRow: {
        flexDirection: 'row',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        backgroundColor: colors.bgGray,
        borderRadius: 5,
        marginVertical: 5,
    },
    emojiButton: {
        flex: 1,
        alignItems: 'center',
    },
    emojiText: {
        fontSize: 24,
    },
    bottomSheetContent: {
        flex: 1,
        padding: 20,
    },
    bottomSheetTitle: {
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 20,
        color: colors.black,
    },
    categoryScroll: {
        marginBottom: 10,
        maxHeight: 42,
    },
    categoryItem: {
        marginHorizontal: 5,
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: colors.white,
        borderWidth: 0.5,
        borderRadius: 20,
    },
    activeCategory: {
        backgroundColor: colors.primary,
    },
    categoryText: {
        color: colors.black,
        fontFamily: 'NunitoSans-Regular',
        fontSize: 14,
    },
    categoryTextActive: {
        color: colors.white,
    },
    messageItem: {
        flexDirection: 'row',
        padding: 10,
        paddingLeft: 0,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    messageText: {
        flex: 1,
        fontFamily: 'NunitoSans-Regular',
        color: colors.black,
        fontSize: 14,
    },
    swcontainer: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingVertical: 10,
    },
    swtext: {
        fontFamily: 'NunitoSans-Regular',
        fontSize: 14,
        marginRight: 10,
        color: 'black',
    },
});

export default TeslimBilgileriForm;
