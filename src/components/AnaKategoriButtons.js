import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import FastImage from 'react-native-fast-image';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../config/theme';

const AnaKategoriButtons = ({ data }) => {
  const navigation = useNavigation();


  return (
    <View style={styles.frame}>
      {data && data.length > 0 && (
        <View style={styles.container}>
          {data.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.itemContainer}
              onPress={() => navigation.navigate('KategoriNav', { cid: item.hid, title: item.baslik })}              >
              <FastImage
                style={styles.image}
                source={{
                  uri: item.imgurl,
                  priority: FastImage.priority.normal,
                }}
                resizeMode={FastImage.resizeMode.contain}
              />
              {item.baslik && <Text style={styles.label}>{global.toTitleCase(item.baslik)}</Text>}
            </TouchableOpacity>
          ))}
        </View>

      )}
    </View>
  );
};

const styles = StyleSheet.create({
  frame: {
    backgroundColor: colors.primary,
    padding: 10,
    borderRadius: 10,
    margin: 12,
    marginTop: -50,
    marginBottom: 0,
    flex: 1,
    justifyContent: 'flex-end',
  },
  container: {
    borderWidth: 1,
    borderColor: '#4a6765',
    padding: 7,
    flexDirection: 'row',
    justifyContent: 'space-around', // Eşit dağıtım
    flexWrap: 'wrap', // Eğer itemler ekranı aşarsa alta sarar
    flex: 1,
  },
  itemContainer: {
    alignItems: 'center',
    justifyContent: 'flex-start', // Öğeleri üst tarafa hizalar
    flex: 1, // Eşit alan dağılımı
    paddingHorizontal: 5,
    paddingVertical: 0,
    marginHorizontal: 10,
  },
  image: {
    width: 35,
    height: 35,
  },
  label: {
    color: 'white',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 8,
    width: 80,
    lineHeight: 12,
  },
});

export default AnaKategoriButtons;