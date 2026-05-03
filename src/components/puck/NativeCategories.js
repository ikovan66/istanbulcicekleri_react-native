import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Dimensions, Image } from 'react-native';
import FastImage from 'react-native-fast-image';
import { useNavigation } from '@react-navigation/native';
import { navigatePuckLink } from './PuckLinkResolver';

const screenWidth = Dimensions.get('window').width;
const ITEM_WIDTH = screenWidth / 3.5;

/**
 * NativeCategories — Horizontal category cards with image + title
 * Maps to Puck: Categories_Furniture, Categories2_MultiBrand, Categories_MultiBrand
 * 
 * Image height adapts to the uploaded image's natural aspect ratio.
 * First image is measured, and its ratio is applied to all items for visual consistency.
 */
const NativeCategories = ({ items, collections, sectionTitle, title }) => {
  const navigation = useNavigation();
  const [imageRatio, setImageRatio] = useState(1.35); // Default portrait fallback

  // Normalize: Puck uses "items" or "collections" depending on variant
  const data = items || collections || [];
  if (data.length === 0) return null;

  const heading = sectionTitle || title || '';

  // Measure the first image's aspect ratio on mount
  useEffect(() => {
    if (data.length > 0) {
      const firstImg = data[0].mobileImgSrc || data[0].imgSrc || '';
      if (firstImg) {
        Image.getSize(
          firstImg,
          (w, h) => {
            if (w > 0 && h > 0) {
              setImageRatio(h / w); // height/width ratio
            }
          },
          () => {} // error — keep default ratio
        );
      }
    }
  }, [data]);

  const imageHeight = ITEM_WIDTH * imageRatio;

  const handlePress = (item) => {
    const link = item.link || '';
    if (link) {
      navigatePuckLink(link, navigation, item.title || '');
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => handlePress(item)}
      activeOpacity={0.7}
    >
      <FastImage
        style={[styles.image, { height: imageHeight }]}
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
        keyExtractor={(item, index) => `cat-${index}`}
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
    paddingHorizontal: 10,
  },
  itemContainer: {
    width: ITEM_WIDTH,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  image: {
    width: ITEM_WIDTH,
    borderRadius: 8,
  },
  label: {
    color: 'black',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 6,
    fontFamily: 'NunitoSans-Regular',
  },
});

export default NativeCategories;
