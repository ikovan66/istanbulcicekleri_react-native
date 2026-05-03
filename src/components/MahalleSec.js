
import React, { useContext, useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Image, TextInput, FlatList, Text, TouchableOpacity ,Dimensions} from 'react-native';
import Svg, { G, Circle, Path } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScrollView } from 'react-native-gesture-handler';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import stylesglobal from '../stylesglobal';
import { SepetContext } from '../components/SepetContext'; // İçe aktarma
import Auth from '../components/Auth';
import { urls } from '../config/apiUrls';
import { colors } from '../config/theme';

const MahalleSec = ({ onCommand, focusmu = true, notcat = false }) => {
  const [mahalleler, setMahalleler] = useState(null);
  const [adresler, setAdresler] = useState(null);
  const [description, setDescription] = useState('');
  const inputRef = useRef(null); // TextInput'a referans oluştur
  const [secilenAdresId, setsecilenAdresId] = useState(null);
  const [kayitliView, setkayitliView] = useState(false);
  const { fetchTranslations, translate, secilenMahItem, setSecilenMahItem } = useContext(SepetContext);
const SCREEN_HEIGHT = Dimensions.get('window').height;

  const KapatSVG = () => (
    <Svg width="12" height="12" viewBox="0 0 20 20">
      <G clipPath="url(#clip-path)">
        <Path d="M9.555,8.231a1.36,1.36,0,0,1,.134-.193Q13.532,4.19,17.376.344A.953.953,0,0,1,18.331.03a.924.924,0,0,1,.505,1.476,2.328,2.328,0,0,1-.191.2q-3.818,3.82-7.637,7.639c-.052.052-.112.1-.238.2A1.166,1.166,0,0,1,11,9.684q3.848,3.843,7.692,7.689a.962.962,0,0,1,.322.953.925.925,0,0,1-1.5.5c-.062-.051-.117-.11-.174-.167L9.711,11.028c-.057-.057-.105-.122-.172-.2-.072.068-.124.117-.175.167q-3.852,3.852-7.7,7.706a.952.952,0,0,1-.955.311.924.924,0,0,1-.512-1.462,2.124,2.124,0,0,1,.189-.2q3.825-3.827,7.651-7.652a1.621,1.621,0,0,1,.19-.14c-.084-.089-.133-.143-.184-.194L.378,1.693a1.875,1.875,0,0,1-.21-.235A.926.926,0,0,1,1.47.176,2.048,2.048,0,0,1,1.7.388L9.355,8.039c.051.051.105.1.2.192" fill={colors.white} />
      </G>
    </Svg>
  );
  const handleTextChange = async (text) => {
    if (text.length > 2) {
      const response = await fetch(`https://conn.ikost.com/mahalle7.ashx?kuryesel=0&q=${text}&json=true`);

      const responseText = await response.text();
      const data = JSON.parse(responseText);

      setMahalleler(data);
    }
  };


  useEffect(() => {
    const fetchAdresler = async () => {
      try {
        const memberID = await AsyncStorage.getItem('memberID');
        if (memberID !== null) {
          var username1 = await AsyncStorage.getItem('username');
          const response = await Auth.post(
            urls.teslimAdreslerim
          );
          setAdresler(response.data);
        }
      } catch (error) {
        console.log('Hata oluştu teslimAdreslerim: ', error);
      };
    };
    fetchAdresler();
  }, []);

  // Sync internal state with Context
  useEffect(() => {
    if (secilenMahItem) {
      const desc = secilenMahItem.description ||
        (secilenMahItem.adsoyad ? `${secilenMahItem.adsoyad}, ${secilenMahItem.adres}, ${secilenMahItem.mahalle}, ${secilenMahItem.ilce}/${secilenMahItem.il}` : '');
      setDescription(desc);
      // onCommand çağırarak parent'ı da haberdar ediyoruz (eski yapı uyumu için)
      // Ancak döngü oluşmaması için dikkat edilmeli. 
      // Parent context kullanıyorsa buna gerek kalmayabilir ama şimdilik tutalım.
      if (onCommand && typeof onCommand === 'function') {
        // onCommand genellikle string bekliyor gibi görünüyor eski yapıda
        onCommand(JSON.stringify(secilenMahItem));
      }
    } else {
      setDescription('');
      if (inputRef.current && focusmu) {
        inputRef.current.focus();
      }
    }
  }, [secilenMahItem]); // Sadece context değiştiğinde çalışsın


  const handleDescriptionClick = async (item) => {
    // Context üzerinden güncelle
    setSecilenMahItem(item);
    setMahalleler([]);
    // onCommand useEffect içinde çağrılacak
  };

  async function adresSec(item) {
    item.description = item.adsoyad + ', ' + item.telefon + ', ' + item.adres + ', ' + item.mahalle + ', ' + item.ilce + '/' + item.il;
    setSecilenMahItem(item);
    setMahalleler([]);
    setkayitliView(false)
  }

  async function resetle() {
    setMahalleler([]);
    setDescription('');
    setSecilenMahItem(null); // Context sıfırla
    if (onCommand) onCommand(null);

    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 0);
  }


  return (
    <View style={{ zIndex: 200, borderBottomWidth: .0, borderBottomColor: colors.white }}>
      {!description && <View style={{
        flexDirection: 'row', backgroundColor: colors.bgGray,
        borderRadius: 25, marginHorizontal: 7,
        borderWidth: 2, borderColor: colors.primary,
        alignItems: 'center'
      }}>
        <View style={{ marginLeft: 15 }}>
          <Svg width="22" height="25" viewBox="0 0 24 24" fill="none">
            <Path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#666" />
          </Svg>
        </View>
        <TextInput style={{ padding: 15, fontSize: 16, flex: 1, color: colors.textDark }}
          onChangeText={handleTextChange}
          ref={inputRef}
          placeholderTextColor="#999"
          placeholder={translate("Gönderim Yeri Seçin")}
        /></View>}
      {description &&
        <View style={{
          flexDirection: 'row',
          backgroundColor: colors.primary,
          marginHorizontal: 7,
          borderRadius: 25,
          justifyContent: 'center',
          alignItems: 'center',
          paddingVertical: 5
        }}>
          <View style={{ marginLeft: 15 }}>
            <Svg width="22" height="25" viewBox="0 0 24 24" fill="none">
              <Path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill={colors.white} />
            </Svg>
          </View>

          <Text style={{ flex: 1, padding: 10, fontSize: 14, color: 'white' }} numberOfLines={1} ellipsizeMode="tail">{description}</Text>
          <TouchableOpacity onPress={() => resetle()} style={{
            paddingVertical: 9,
            paddingRight: 12,
            paddingLeft: 5
          }}>
            <View style={{
              alignItems: 'center',
              justifyContent: 'center',
              alignContent: 'center',
              backgroundColor: 'rgba(255,255,255,0.3)',
              borderRadius: 12,
              width: 24,
              height: 24
            }}>
              <KapatSVG />
            </View>
          </TouchableOpacity>
        </View>


      }


      {!description && mahalleler &&

        <View style={{
     width: '100%',
          backgroundColor: 'white',
          marginHorizontal: 7,
          borderRadius: 10,
          shadowColor: colors.black,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}>
          <ScrollView keyboardShouldPersistTaps="handled" >
            {mahalleler.map((item, index) => (
              <TouchableOpacity key={item.description + '-' + index}
                onPress={() => handleDescriptionClick(item)}
                style={{
                  paddingHorizontal: 15, paddingVertical: 12, borderBottomWidth: .5, borderColor: '#eee',
                  flexDirection: 'row', flex: 1, alignItems: 'flex-start'
                }}>
                <View style={{ marginTop: 3, marginRight: 10 }}>
                  <Svg width="18" height="21" viewBox="0 0 24 24" fill="none">
                    <Path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill={colors.primary} />
                  </Svg>
                </View>
                <Text style={{ color: colors.black, lineHeight: 22, flex: 1, fontSize: 14 }}>{item.description}</Text>
              </TouchableOpacity>
            ))}


          </ScrollView>

        </View>}
      {notcat && adresler && adresler.length > 0 &&
        <TouchableOpacity
          onPress={() => setkayitliView(prev => !prev)}
          style={styles.button2}            >
          <Text style={{
            fontFamily: 'NunitoSans-Regular',
            fontWeight: '600', fontSize: 13, textAlign: 'center', color: 'white'
          }}>{translate('Kayıtlı Adreslerimden Seç')}</Text>
        </TouchableOpacity>
      }
      {adresler && kayitliView &&

        <View style={{
          paddingBottom: 10, borderTopWidth: .0, paddingHorizontal: 12,
        }}>
          <ScrollView keyboardShouldPersistTaps="handled" >
            {adresler && adresler.map((item, index) => (<TouchableOpacity
              onPress={() => adresSec(item)}
              style={[
                styles.button1
              ]}
            >
              <View style={styles.radioButton}>
                {secilenAdresId === item.adresid && <View style={styles.radioButtonSelected} />}
              </View>

              <View style={styles.textContainer}>
                <Text style={styles.text}><Text style={{ fontWeight: 'bold' }}>{item.adsoyad}, </Text>
                  {item.telefon}, {item.adres}, {item.mahalle} - {item.ilce} / {item.il}</Text>
              </View>

            </TouchableOpacity>
            ))}
          </ScrollView>

        </View>}
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    paddingTop: 3,

  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#F7F6F4",
    borderRadius: 10,
    marginVertical: 5,
  },
  button1: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 15,
    backgroundColor: colors.white,
    borderRadius: 10,
    marginVertical: 1,

  },
  button2: {
    backgroundColor: colors.primary,
    padding: 10,
    paddingVertical: 11,
    borderRadius: 5,
    alignItems: 'center',
    margin: 10, marginBottom: 5
  },
  selectedButton: {
    //borderWidth: 4,
    //borderColor: 'green', 
    // Tıklanan buton için çerçeve rengi
  },
  image: {
    width: 90,
    height: 90,
    borderRadius: 50,


  },
  radioButton: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: .5,
    borderColor: colors.black,
    backgroundColor: 'white',
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  radioButtonSelected: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: colors.black,
  },
  textContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  text: {
    fontFamily: 'NunitoSans-Regular',
    fontSize: 13, lineHeight: 20
  }
});
export default MahalleSec;
