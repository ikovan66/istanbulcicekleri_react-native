import React from 'react';
import { View, FlatList, StyleSheet, Dimensions } from 'react-native';
import FastImage from 'react-native-fast-image';

const screenWidth = Dimensions.get('window').width;

/**
 * NativeBrands — Horizontal logo carousel
 * Maps to Puck: Brands, Brands_MultiBrand
 */
const NativeBrands = ({ items }) => {
  if (!items || items.length === 0) return null;

  const renderItem = ({ item }) => (
    <View style={styles.logoContainer}>
      <FastImage
        style={styles.logo}
        source={{
          uri: item.src || '',
          priority: FastImage.priority.low,
        }}
        resizeMode={FastImage.resizeMode.contain}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        horizontal
        data={items}
        renderItem={renderItem}
        keyExtractor={(item, index) => `brand-${index}`}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
  },
  listContent: {
    paddingHorizontal: 15,
  },
  logoContainer: {
    width: screenWidth / 3.5,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
    backgroundColor: '#fafafa',
    borderRadius: 8,
    padding: 8,
  },
  logo: {
    width: '100%',
    height: '100%',
  },
});

export default NativeBrands;
