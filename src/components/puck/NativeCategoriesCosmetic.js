import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Dimensions, Image } from 'react-native';
import FastImage from 'react-native-fast-image';
import { useNavigation } from '@react-navigation/native';
import { navigatePuckLink } from './PuckLinkResolver';

const screenWidth = Dimensions.get('window').width;
const VISIBLE_ITEMS = 4.5;
const GAP = 8;
const ITEM_WIDTH = (screenWidth - GAP * 2) / VISIBLE_ITEMS;

/**
 * NativeCategoriesCosmetic — Horizontal scrollable category display
 * Maps to Puck: Categories_Cosmetic
 * 
 * Ekranda 4.5 item görünür, sağa kaydırarak geri kalanlar gelir.
 * Yuvarlak görseller + altında başlık.
 */
const NativeCategoriesCosmetic = ({ items, title, showTitle }) => {
  const navigation = useNavigation();
  const [imageRatio, setImageRatio] = useState(1); // Default square

  const data = items || [];
  if (data.length === 0) return null;

  const heading = showTitle !== false ? title : '';

  // İlk görselin aspect ratio'sunu ölç
  useEffect(() => {
    if (data.length > 0) {
      const firstImg = data[0].mobileImgSrc || data[0].imgSrc || '';
      if (firstImg) {
        Image.getSize(
          firstImg,
          (w, h) => {
            if (w > 0 && h > 0) {
              setImageRatio(h / w);
            }
          },
          () => {}
        );
      }
    }
  }, [data]);

  const imageSize = ITEM_WIDTH - GAP;

  const handlePress = (item) => {
    const link = item.link || '';
    if (link) {
      navigatePuckLink(link, navigation, item.title || '');
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.itemContainer, { width: ITEM_WIDTH }]}
      onPress={() => handlePress(item)}
      activeOpacity={0.7}
    >
      <FastImage
        style={[styles.image, { width: imageSize, height: imageSize, borderRadius: imageSize / 2 }]}
        source={{
          uri: item.mobileImgSrc || item.imgSrc || '',
          priority: FastImage.priority.normal,
        }}
        resizeMode={FastImage.resizeMode.cover}
      />
      {item.title ? (
        <Text style={styles.label} numberOfLines={2}>
          {item.title}
        </Text>
      ) : null}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {heading ? <Text style={styles.heading}>{heading}</Text> : null}
      <FlatList
        horizontal
        data={data}
        renderItem={renderItem}
        keyExtractor={(item, index) => `coscat-${index}`}
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
  heading: {
    fontFamily: 'NunitoSans-SemiBold',
    fontSize: 16,
    color: 'black',
    marginHorizontal: 15,
    marginBottom: 10,
  },
  listContent: {
    paddingHorizontal: GAP,
  },
  itemContainer: {
    alignItems: 'center',
  },
  image: {
    backgroundColor: '#f5f5f5',
  },
  label: {
    color: 'black',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 6,
    fontFamily: 'NunitoSans-SemiBold',
    paddingHorizontal: 2,
  },
});

export default NativeCategoriesCosmetic;
