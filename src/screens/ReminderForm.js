import API_CONFIG from '../config/apiConfig';
import React, {  useContext,useState, useEffect, useRef } from 'react';
import { Dimensions,SafeAreaView, 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  TouchableOpacity,
  ScrollView 
} from 'react-native';
import IkostResim from '../components/IkostResim';
import {SepetContext} from '../components/SepetContext'; // İçe aktarma

import BottomSheet from 'react-native-gesture-bottom-sheet';
import stylesglobal from '../stylesglobal';
import HeaderleftComp from '../components/HeaderleftComp';
import AnaFooter from '../components/AnaFooter';
import IkostTextInput from '../components/IkostTextInput';
import IkostButton from '../components/IkostButton';
import { rotationHandlerName } from 'react-native-gesture-handler/lib/typescript/handlers/RotationGestureHandler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ikostalert } from '../GlobalAlert';
import axios from 'axios';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { colors } from '../config/theme';

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
 
 
export default function ReminderForm({ route, navigation }) {
  const { reminder } = route.params || {};
  const [title, setTitle] = useState(null);    
  const [reminderId, setreminderId] = useState(null);       // Hatırlatma İsmi
  const [fullName, setFullName] = useState(null); // Ad Soyad
  const [note, setNote] = useState(null);         // Not
  const [date, setDate] = useState(null); // Tarih
  const [repeatType, setRepeatType] = useState(null); // Tekrar
  const [notifyBefore, setNotifyBefore] = useState(null); // Bildirim tarihi
    const { fetchTranslations, translate } = useContext(SepetContext);

    

  // Her alt seçim için birer BottomSheet referansı
  const dateSheetRef = useRef(null);
  const repeatSheetRef = useRef(null);
  const notifySheetRef = useRef(null);
  const ekranYuksekligiFloat = Dimensions.get('window').height * .80;
  const ekranYuksekligiInt = Math.floor(ekranYuksekligiFloat); // Aşağı yuvarlar
  const [locale, setLocale] = useState('tr'); // default tr

  useEffect(() => {
    const getStoredLanguage = async () => {
      const dilStored = await AsyncStorage.getItem('dil');
      const selectedLocale = dilStored === 'EN' ? 'en' : 'tr';
  
      LocaleConfig.defaultLocale = selectedLocale; // 👈 eklenmeli!
      setLocale(selectedLocale);
    };
  
    getStoredLanguage();
  
    if (reminder) {
      loadReminder();
    }
  }, []);

  const repeatTypeArray = [
    // { name: 'Asla', value: 0 },
    { name: 'Günlük', value: 1 },
    { name: 'Haftalık', value: 2 },
    { name: 'Aylık', value: 3 },
    { name: '3 Aylık', value: 4 },
    { name: '6 Aylık', value: 5 },
    { name: 'Yıllık', value: 6 }
  ];

  const notifyBeforeArray = [
    { name: '1 Gün Önce', value: 1 },
    { name: '3 Gün Önce', value: 3 },
    { name: '7 Gün Önce', value: 7 },
    { name: '30 Gün Önce', value: 30 }
  ];
  const getArrayByValue = (kim,value) => {
    const option = kim.find(item => item.value === value);
    return option ? option : null;
  };
  const loadReminder = async () => {
    try {
      const data = reminder;
      setreminderId(data.id);
      setTitle(data.baslik);
      setFullName(data.adsoyad);
      setNote(data.mesaj);
      setDate(data.tarih);
      setRepeatType(getArrayByValue(repeatTypeArray,data.tekrargunsay));
      setNotifyBefore(getArrayByValue(notifyBeforeArray,data.kac_gun_once_bildir));
      console.log(data);
    } catch (error) {
      console.error('Detay yüklenirken hata:', error);
    }
  };

  const handleSave = async () => {
if(!date || !repeatType || !notifyBefore || !title || !fullName || !note )
{
  ikostalert('Hata', 'Lütfen tüm alanları eksiksiz doldurunuz.');

} else{
  const username = await AsyncStorage.getItem('username');
  const memberID = await AsyncStorage.getItem('memberID');

  const hatirlatmaData = {
    username:username,
    memberID:memberID,
    id:reminderId,
    tarih:date,
    tekrargunsay:repeatType.value,
    kac_gun_once_bildir: notifyBefore.value,
    baslik:title,
    adsoyad:fullName,
    mesaj:note,
    islem:'ekle',

  };



  try {
    const response = await axios.post(`${API_CONFIG.frontendApi}/api/Home/HatirlatmaEkle/`, hatirlatmaData);
    if(response.status === 200){
      navigation.goBack();
    }
  } catch (error) {
    console.error('API çağrısında hata:', error);
    ikostalert('Hata', 'İşlem sırasında bir hata oluştu.');
  }
}
    

  };


  const onStartDateChange = (selectedDate1) => {
        var selectedDate = new Date(selectedDate1);
        setDate(selectedDate);
        dateSheetRef.current.close();

    };

 
  const handleRepeatSelect = (val) => {
    setRepeatType(val);
    repeatSheetRef.current.close();
  }; 
  const handleNotifySelect = (val) => {
    setNotifyBefore(val);
    notifySheetRef.current.close();
  };

  return (
    <SafeAreaView style={stylesglobal.SafeAreaCSS}>
    <View style={stylesglobal.headerCustom}>
<HeaderleftComp title="Hatırlatma"/>

 
</View>
      <ScrollView style={{backgroundColor: colors.bgLight,flex:1}}>
    <View  >
      <View  >
        <View style={styles.container}>
      <IkostTextInput
                  style={styles.input}
                  title="Hatırlatma İsmi"
                  value={title}
                  onChangeText={setTitle}
                />

<IkostTextInput
                  style={styles.input}
                  title="Ad Soyad"
                  value={fullName}
                  onChangeText={setFullName}
                />

<IkostTextInput
                  style={styles.input}
                  title="Not"
                  value={note}
                  onChangeText={setNote}
                /> 
</View>
 
 <View style={{padding:25,paddingVertical:20}}>

        {/* Tarih Seçimi */}
              <TouchableOpacity
                style={styles.selectorButton}
                onPress={() => dateSheetRef.current.show()}
              >
              <IkostResim source={require('../assets/images/hatirlatma_tarih.png')} 
              width={20} style={styles.itemIMG}/>    

                <Text style={styles.selectorText1}>{translate('Tarih')}</Text>

                <Text style={styles.selectorText2}>
                {date ? new Date(date).toLocaleDateString(locale=='tr'?'tr-TR':'en-EN', { day: 'numeric', month: 'long' }) : ''}
                 </Text>
              </TouchableOpacity>

        {/* Tekrar Seçimi */}
        <TouchableOpacity 
          style={styles.selectorButton} 
          onPress={() => repeatSheetRef.current.show()}
        >
          <IkostResim source={require('../assets/images/hatirlatma_tekrar.png')} 
              width={20} style={styles.itemIMG}/>  
                    <Text style={styles.selectorText1}>{translate('Tekrar')}</Text>

          <Text style={styles.selectorText2}>{repeatType && translate(repeatType.name)}</Text>
        </TouchableOpacity>

        {/* Bildirim Tarihi Seçimi */}
        <TouchableOpacity 
          style={styles.selectorButton} 
          onPress={() => notifySheetRef.current.show()}
        >
          <IkostResim source={require('../assets/images/uye_bildirim.png')} 
              width={20} style={styles.itemIMG}/>  
                              <Text style={styles.selectorText1}>{translate('Bildirim Tarihi')}</Text>

          <Text style={styles.selectorText2}>{notifyBefore && translate(notifyBefore.name)}</Text>
        </TouchableOpacity>


        <View  style={{marginTop:25}}>
      <IkostButton title={reminderId ? 'Güncelle' : 'Kaydet'}
     
      onPress={() => handleSave()}></IkostButton>
       </View>

        
        </View>
      </View>

      {/* TARİH SEÇİMİ BOTTOM SHEET */}
      <BottomSheet sheetBackgroundColor="white"
             hasDraggableIcon KeyboardAvoidingView
             ref={dateSheetRef}
             height={ekranYuksekligiInt}
           >
             <SafeAreaView style={stylesglobal.SafeAreaCSS}>
    
               <View style={styles.bottomSheetContainer}>
     
    <View style={styles.calendar}>
                  <Calendar  
                      firstDay={1} // Haftanın ilk günü olarak Pazartesi'yi ayarla (0: Pazar, 1: Pazartesi)
                      onDayPress={day => { onStartDateChange(new Date(day.dateString));}}
                      locale={locale}  // Buraya ekledik
                      style={{
                          borderWidth: 1,
                          borderColor: colors.white,
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
              
       
        </View>
        </SafeAreaView>
      </BottomSheet>

      {/* TEKRAR SEÇİMİ BOTTOM SHEET */}
    
         <BottomSheet sheetBackgroundColor="white"
             hasDraggableIcon KeyboardAvoidingView
             ref={repeatSheetRef}
             height={ekranYuksekligiInt}
           >
             <SafeAreaView style={stylesglobal.SafeAreaCSS}>
        <View style={styles.bottomSheetContainer}>
          <Text style={styles.bottomSheetTitle}>{translate('Tekrar')}</Text>
          {repeatTypeArray.map((item) => (
            <TouchableOpacity 
              key={item.name}
              style={styles.bottomSheetItem}
              onPress={() => handleRepeatSelect(item)}
            >
              <Text>{translate(item.name)}</Text>
            </TouchableOpacity>
          ))}
        </View>
        </SafeAreaView>
      </BottomSheet>

      {/* BİLDİRİM TARİHİ SEÇİMİ BOTTOM SHEET */}
 
         <BottomSheet sheetBackgroundColor="white"
             hasDraggableIcon KeyboardAvoidingView
             ref={notifySheetRef}
             height={ekranYuksekligiInt}
           >
             <SafeAreaView style={stylesglobal.SafeAreaCSS}>
        <View style={styles.bottomSheetContainer}>
          <Text style={styles.bottomSheetTitle}>{translate('Bildirim Tarihi')}</Text>
          {notifyBeforeArray.map((item) => (
            <TouchableOpacity 
              key={item.name}
              style={styles.bottomSheetItem}
              onPress={() => handleNotifySelect(item)}
            >
              <Text>{translate(item.name)}</Text>
            </TouchableOpacity>
          ))}
        </View>
        </SafeAreaView>
      </BottomSheet>

    </View>
    </ScrollView>
    <View style={stylesglobal.footer}>
     <AnaFooter parametre={'Hesabım'} navigation={navigation}/>
     </View>
     </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  itemIMG:{
marginRight:10
  },
  container: {
    flex: 1,paddingHorizontal:25,
    backgroundColor: colors.white
  },
  label: {
    fontWeight: 'bold',
    fontSize: 14,
    marginTop: 12
  },
  input: {
  
  },
  selectorButton: {
    backgroundColor: colors.white,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 14,
    marginTop: 12,
    flexDirection:'row',
    justifyContent:'center',
    alignItems:'center'
  },
  selectorText1: {
    fontFamily:'NunitoSans-Regular',
    color: colors.textDark,flex:1
  },
  selectorText2: {
    fontFamily:'NunitoSans-Regular',
    color: colors.textDark,alignSelf:'flex-end'
  },
  saveButton: {
    marginTop: 24,
    backgroundColor: '#006400',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center'
  },
  saveButtonText: {
    color: colors.white,
    fontWeight: 'bold'
  },
  bottomSheetContainer: {
    width: '100%', height: '100%', paddingHorizontal: 20, paddingVertical: 20, backgroundColor: 'white',
    borderTopLeftRadius: 0, borderTopRightRadius: 0
  },
  bottomSheetTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12
  },
  bottomSheetItem: {
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#DDD'
  }
});