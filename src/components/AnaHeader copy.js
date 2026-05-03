import API_CONFIG from '../config/apiConfig';
import React, { useState } from 'react';
import {  View, Text, TextInput, Image, StyleSheet,  Keyboard, TouchableOpacity, Alert } from 'react-native';
import axios from 'axios';
import Svg, { G, Circle, Path } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import { ikostalert } from '../GlobalAlert';
import { colors } from '../config/theme';

const KapatSVG = () => (
  <Svg width="12" height="12" viewBox="0 0 20 20">
      <G clipPath="url(#clip-path)">
          <Path d="M9.555,8.231a1.36,1.36,0,0,1,.134-.193Q13.532,4.19,17.376.344A.953.953,0,0,1,18.331.03a.924.924,0,0,1,.505,1.476,2.328,2.328,0,0,1-.191.2q-3.818,3.82-7.637,7.639c-.052.052-.112.1-.238.2A1.166,1.166,0,0,1,11,9.684q3.848,3.843,7.692,7.689a.962.962,0,0,1,.322.953.925.925,0,0,1-1.5.5c-.062-.051-.117-.11-.174-.167L9.711,11.028c-.057-.057-.105-.122-.172-.2-.072.068-.124.117-.175.167q-3.852,3.852-7.7,7.706a.952.952,0,0,1-.955.311.924.924,0,0,1-.512-1.462,2.124,2.124,0,0,1,.189-.2q3.825-3.827,7.651-7.652a1.621,1.621,0,0,1,.19-.14c-.084-.089-.133-.143-.184-.194L.378,1.693a1.875,1.875,0,0,1-.21-.235A.926.926,0,0,1,1.47.176,2.048,2.048,0,0,1,1.7.388L9.355,8.039c.051.051.105.1.2.192" fill={colors.white} />
      </G>
  </Svg>
);
const Header = ({onCommand}) => {
  const navigation = useNavigation();

  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);


  const URUNLER_API_REQUEST = async (obek) => {
    const model = { obek: obek, PageSize: 10, PageNumber: 1 };
    try {
      const response = await axios.post(`${API_CONFIG.frontendApi}/api/Home/urunler/`, model, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      setShowResults(true); // Sonuçları göster
      onCommand(true,response.data,obek);
 
    } catch (error) {
      ikostalert('Hata!', error.toString(), [{ text: 'TAMAM' }]);
      setShowResults(false);
      onCommand(false,[],'');
    }
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    if (text.length >= 3) {
      URUNLER_API_REQUEST(text);
    } else {
      setShowResults(false); // Eğer 3 karakterden azsa sonuçları gizle
          onCommand(false,[],text);

    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    onCommand(false,[],'');
    setShowResults(false);

  };

  return (
    <>
      <View style={styles.header}>
        <View style={styles.logo}>
        <Image 
        
        source={{ uri: `${API_CONFIG.webBaseUrl}/logo.png` }} 
                
        style={styles.logoIMG} resizeMode="contain"/>

        
         <TouchableOpacity onPress={() => navigation.navigate("ContactNav")} style={styles.iletisimButton}>
          
         <Image source={require('../assets/images/buyutec_ara.png')} 
         style={styles.icon} />

        </TouchableOpacity>
        </View>
        <View style={styles.searchContainer} >
          <Image
            source={{ uri: `${API_CONFIG.webBaseUrl}/app_icons/search.png` }} 
            style={{ position: 'absolute', zIndex: 10, top: -2, left: -5, width: 40, height: 40 }}
            resizeMode="contain"
          />
          {5==6 && <TextInput 
            returnKeyType='done'
            onSubmitEditing={() => Keyboard.dismiss()}
            placeholder="Ürün Ara.."
            placeholderTextColor="gray"
            style={styles.input}
            onChangeText={handleSearch}
            value={searchQuery}
          /> }
          {showResults && (<TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
          
            <KapatSVG />
          </TouchableOpacity>)} 
        </View>
      </View>
      
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    padding: 10,
    paddingTop:0,
    position:'absolute',
    backgroundColor: 'rgba(224, 224, 224, 0)', // %50 şeffaf
    top: 0,
    left: 0,
    right: 0,
    zIndex: 3,
 },
  logo: {
    flexDirection: 'row',justifyContent:'center'
  },
  icon: {
    width: 25,
    height: 22,
  },
  logoIMG: {
    width:230,height:33
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 0,
    borderRadius: 5,
    position:'relative'
  },
  input: {
    fontFamily: 'NunitoSans-Regular',
    color: 'black',
    height: 38,
    padding: 8,
    flex: 10,
    paddingLeft: 55,
    marginBottom: 0,
    width: '100%',
    borderRadius: 20,
    borderWidth: 0.5,
    backgroundColor: colors.bgGray,
    borderColor: colors.bgGray,
  },
  clearButton: {
    backgroundColor: '#F5A623', borderWidth: 0, borderColor: 'white', borderRadius: 20,
    padding: 6, alignItems: 'center', justifyContent: 'center', alignContent: 'center',
    justifyContent: 'center',
    alignItems: 'center',
position:'absolute',right:6,zIndex:10,top:6
  },
  iletisimButton: {
    padding: 6,
    alignItems: 'center', justifyContent: 'center', alignContent: 'center',
    justifyContent: 'center',
    alignItems: 'center',
position:'absolute',right:6,zIndex:10,top:6
  },
  
});

export default Header;
