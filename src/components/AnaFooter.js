import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SepetContext } from '../components/SepetContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../config/theme';
import DynamicIcon from './DynamicIcon';

const Footer = ({ navigation, parametre }) => {
  const isActive = (menuName) => parametre === menuName;
  const { sepetSayisi, setSepetSayisi, translate } = useContext(SepetContext);

  const checkMemberAndRedirect = async (nav) => {
    try {
      const memberID = await AsyncStorage.getItem('memberID');
      if (memberID !== null) {
        navigation.navigate(nav);
      } else {
        navigation.navigate('GirisNav');
      }
    } catch (error) {
      console.error('AsyncStorage error: ', error);
    }
  };

  const iconSize = 26;
  const activeColor = colors.primary || '#2D3E50';
  const inactiveColor = '#2D3E50';

  return (
    <View style={styles.footer}>
      <TouchableOpacity style={styles.iconContainer} onPress={() => navigation.navigate("AnaNav")}>
        <DynamicIcon
          name="home"
          size={iconSize}
          color={isActive('Anasayfa') ? activeColor : inactiveColor}
        />
        <Text style={[styles.text, isActive('Anasayfa') && styles.activeText]}>{translate('Anasayfa')}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.iconContainer} onPress={() => navigation.navigate("KategoriListNav", { id: 0 })}>
        <DynamicIcon
          name="shop"
          size={iconSize}
          color={isActive('Kategoriler') ? activeColor : inactiveColor}
        />
        <Text style={[styles.text, isActive('Kategoriler') && styles.activeText]}>{translate('Kategoriler')}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.iconContainer}
        onPress={() => checkMemberAndRedirect('FavorilerimNav')}
      >
        <DynamicIcon
          name={isActive('Favorilerim') ? 'heart-full' : 'heart'}
          size={iconSize}
          color={isActive('Favorilerim') ? activeColor : inactiveColor}
        />
        <Text style={[styles.text, isActive('Favorilerim') && styles.activeText]}>{translate('Favorilerim')}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.iconContainer} onPress={() => checkMemberAndRedirect('HesabimNav')}>
        <DynamicIcon
          name="account"
          size={iconSize}
          color={isActive('Hesabım') ? activeColor : inactiveColor}
        />
        <Text style={[styles.text, isActive('Hesabım') && styles.activeText]}>{translate('Hesabım')}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingTop: 8,
    paddingBottom: 5,
    paddingHorizontal: 15,
  },
  iconContainer: {
    flex: 1,
    alignItems: 'center',
  },
  icon: {
    width: 22,
    height: 22,
    marginBottom: 2,
    marginTop: 0
  },
  text: {
    color: '#2D3E50',
    fontSize: 10,
  },
  activeText: {
    color: '#2D3E50',
    fontWeight: 'bold',
  },
});

export default Footer;
