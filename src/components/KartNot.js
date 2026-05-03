import API_CONFIG from '../config/apiConfig';
import React, { useContext, useState, useRef, useEffect } from 'react';
import { Image, View, StyleSheet, Text, ScrollView, Dimensions, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import IkostTextInput from './IkostTextInput';
import IkostButton from "./IkostButton";
import axios from 'axios';
import stylesglobal from '../stylesglobal';
import BottomSheet from "react-native-gesture-bottom-sheet";
import { SvgXml } from 'react-native-svg';
import { SepetContext } from '../components/SepetContext'; // İçe aktarma
import { colors } from '../config/theme';

const KartNot = ({ code, sid, item, onKartNotUpdate }) => {
  const checkedIcon = require('../assets/images/checked.png'); // Bu yolu checked.png dosyanızın yolu ile güncelleyin
  const uncheckedIcon = require('../assets/images/unchecked.png'); // Bu yolu unchecked.png dosyanızın yolu ile güncelleyin
  const [newsletter, setNewsletter] = useState(true);
  const [isEditable, setIsEditable] = useState(true);
  const { fetchTranslations, translate } = useContext(SepetContext);

  const Url = `${API_CONFIG.frontendApi}/api/`;
  const ekranYuksekligiFloat = Dimensions.get('window').height * .80;
  const ekranYuksekligiInt = Math.floor(ekranYuksekligiFloat); // Aşağı yuvarlar
  const bottomSheet = useRef();
  const [kartNot, setKartNot] = useState(item.teslimkartnot);
  const [kartAd, setKartAd] = useState(item.teslimkartad);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState('');
  const [kartnotDATA, setkartnotDATA] = useState(null);
  const [categories, setcategories] = useState(null);
  const chk = `
  <svg width="24px" height="24px" viewBox="0 0 512.00 512.00" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill={colors.black}><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" stroke={colors.border} stroke-width="1.024"></g><g id="SVGRepo_iconCarrier"> <title>checkbox-component-unchecked</title> <g id="Page-1" stroke-width="0.00512" fill="none" fill-rule="evenodd"> <g id="drop" fill={colors.black} transform="translate(64.000000, 64.000000)"> <path d="M384,1.42108547e-14 L384,384 L1.42108547e-14,384 L1.42108547e-14,1.42108547e-14 L384,1.42108547e-14 Z M362.666667,21.3333333 L21.3333333,21.3333333 L21.3333333,362.666667 L362.666667,362.666667 L362.666667,21.3333333 Z" id="Combined-Shape"> </path> </g> </g> </g></svg>
    `;

  useEffect(() => {
    // kartNot veya kartAd değiştiğinde bu değerleri parent'a iletir
    if (onKartNotUpdate) {
      onKartNotUpdate({ kartNot, kartAd });
    }
  }, [kartNot, kartAd]);

  const getkARTNOTLAR = async () => {
    try {
      try {
        const response = await axios.get(`${API_CONFIG.basketApi}/api/SepetView/kartnotlar`);
        console.log(response.data);

        const data = await response.data;
        setkartnotDATA(data);
        setcategories([...new Set(data.map(item => item.kategori))].sort());

      } catch (error) {
        console.error('Hata:', error);
      }

    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (categories != null) {
      setSelectedCategory(categories[0]);
    }
  }, [categories]);

  useEffect(() => {
    getkARTNOTLAR();
  }, []);



  function hazirnotsec(not) {
    setKartNot(not);
    onKartNotUpdate({ kartNot: not, kartAd });  // Değeri hemen gönder
    bottomSheet.current.close();
  }

  const getMessagesForCategory = (category) => {
    return kartnotDATA.filter(item => item.kategori === category);
  };
  const toggleNewsletter = () => {
    setNewsletter(!newsletter);
  };
  useEffect(() => {
    if (!newsletter) {
      setKartAd("isimsiz");
      setIsEditable(false);
    } else {
      setKartAd("");
      setIsEditable(true);
    }
  }, [newsletter]);

  return (

    <View style={{ flex: 1, }}>

      <View style={styles.container}>

        {categories &&
          <TouchableOpacity
            onPress={() => bottomSheet.current.show()}
            style={styles.button}            >
            <Text style={{
              fontFamily: 'NunitoSans-Regular',
              textAlign: 'center', color: 'white', fontSize: 12
            }}>{translate('Hazır Kart Notlarından Seçin')}</Text>
          </TouchableOpacity>
        }

        <IkostTextInput
          title="Kart Notunuz"
          value={kartNot}
          multiline
          numberOfLines={4}
          onChangeText={(kartNot) => setKartNot(kartNot)}
        />
      </View>
      <View style={styles.container}>
        <IkostTextInput
          value={kartAd.replace('isimsiz', '')}
          editable={isEditable}
          title="Gönderen Adı"
          onChangeText={(kartAd) => setKartAd(kartAd)}
        />

        {/* <TouchableOpacity style={styles.chktouch} onPress={() => toggleNewsletter()}>
                        <View style={styles.checkbox}  >
                            <Image
                                source={newsletter ? uncheckedIcon : checkedIcon}
                                style={styles.checkbox}
                            />
                        </View>
                        <View style={{flex:1}}>
                            <Text style={styles.label} >{translate('İsimsiz Gönder')}</Text>
                        </View>
                    </TouchableOpacity> */}
        {/*    <Text style={{    fontFamily: 'NunitoSans-Regular',
color:'darkred',marginBottom:10}}>Lütfen gönderen adını yazın veya isimsiz gönder seçin</Text> */}

      </View>

      {categories &&
        <BottomSheet sheetBackgroundColor="white"
          hasDraggableIcon KeyboardAvoidingView
          ref={bottomSheet}
          height={ekranYuksekligiInt}
        >
          <SafeAreaView style={stylesglobal.SafeAreaCSS}>

            <View style={{
              flex: 1, justifyContent: 'flex-end',
              backgroundColor: 'rgba(0, 0, 0, 0.5)'
            }}>

              <View style={{
                width: '100%', height: '100%', paddingHorizontal: 20, paddingVertical: 20, backgroundColor: 'white',
                borderTopLeftRadius: 0, borderTopRightRadius: 0
              }}>

                <View style={{ marginTop: 0 }}>
                  <Text style={{
                    fontWeight: '600', fontSize: 16,
                    textAlign: 'center', marginBottom: 20, color: colors.black,
                  }}>Hazır Kart Notlarından Seçin</Text>

                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10, height: 30 }}>

                    {categories.map((category, index) => (

                      <TouchableOpacity
                        key={item.id + '-' + category + '-' + index}
                        style={[styles.categoryItem, selectedCategory === category && styles.activeCategory]}
                        onPress={() => setSelectedCategory(category)}
                      >
                        <Text
                          style={[styles.categoryText, selectedCategory === category && styles.categoryTextaCT]}>{category}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                  <ScrollView >

                    {selectedCategory && kartnotDATA && getMessagesForCategory(selectedCategory).map((message, index) => (
                      <TouchableOpacity
                        key={message + '-' + index}
                        style={styles.messageItem}
                        onPress={() => hazirnotsec(message.mesaj)}
                      ><SvgXml xml={chk} width="24" height="24" style={{ alignSelf: 'flex-start', marginRight: 10 }} />
                        <Text style={{
                          fontFamily: 'NunitoSans-Regular', color: colors.black,
                          flex: 1, fontSize: 14
                        }}>{message.mesaj}</Text>
                      </TouchableOpacity>
                    ))}

                  </ScrollView>
                </View>


              </View>
            </View>
          </SafeAreaView>

        </BottomSheet>
      }
    </View>

  );
};

const styles = StyleSheet.create({
  chktouch: {
    flexDirection: 'row', flex: 1, alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10, width: '100%', paddingHorizontal: 0
  },

  title: {
    fontSize: 17, fontWeight: '700', marginBottom: 10, fontFamily: 'NunitoSans-Regular',
    color: colors.black,
  },
  checkbox: { width: 24, height: 24, marginRight: 10 },
  label: {
    fontFamily: 'NunitoSans-Regular',
    color: colors.black,
    fontSize: 13,
  },
  button: {
    backgroundColor: '#e37c33',
    padding: 10,
    paddingVertical: 7,
    borderRadius: 5,
    marginTop: 10,
    right: 5,
    top: -5,
    alignItems: 'center', alignSelf: 'flex-end',
    position: 'absolute', zIndex: 12
  },
  container: {
    flex: 1,
    padding: 12,
    paddingVertical: 0,
    backgroundColor: colors.white,
    alignItems: "center",
    borderRadius: 6,
    marginTop: 10
  },
  image: {
    marginBottom: 40,
  },
  forgot_button: {
    height: 30,
    marginBottom: 30,
  },

  categoryItem: {
    marginHorizontal: 5,
    paddingVertical: 11,
    paddingHorizontal: 20,
    backgroundColor: colors.white,
    borderWidth: .5,
    borderRadius: 20,

  },
  activeCategory: {
    backgroundColor: colors.primary
  },
  categoryText: {
    color: colors.black,
    fontFamily: 'NunitoSans-Regular',
    fontSize: 14
  },
  categoryTextaCT: {
    color: colors.white,
    fontFamily: 'NunitoSans-Regular',
    fontSize: 14
  },
  messageItem: {
    flex: 1,
    flexDirection: 'row',
    fontFamily: 'NunitoSans-Regular',
    padding: 10, color: colors.black,
    paddingLeft: 0,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  }
});

export default KartNot;
