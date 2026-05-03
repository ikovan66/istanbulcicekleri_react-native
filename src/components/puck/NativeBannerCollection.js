import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Dimensions, Image } from 'react-native';
import FastImage from 'react-native-fast-image';
import { useNavigation } from '@react-navigation/native';
import { navigatePuckLink } from './PuckLinkResolver';

const screenWidth = Dimensions.get('window').width;
const CARD_WIDTH = screenWidth * 0.75;
const CARD_GAP = 10;

/**
 * NativeBannerCollection — Horizontal banner cards with image + heading + subheading
 * Maps to Puck: BannerCollection_Cosmetic
 * 
 * API Data: items[] = { imgSrc, mobileImgSrc, heading, subheading, bgClass, link }
 * 
 * Ekranda 1.2 kart görünür, yatay kaydırma ile diğerleri gelir.
 * Her kart: üstte kare görsel, altta başlık ve açıklama.
 */

// bgClass → renk eşlemesi (Puck CSS class'larından)
const BG_COLORS = {
  'bg_dark-pink': '#f8e8ef',
  'bg_dark-yellow': '#fdf3e0',
  'bg_violet-2': '#ede8f5',
  'bg_light-green': '#e8f5e9',
  'bg_light-blue': '#e3f2fd',
  'bg_beige': '#faf5ef',
};

const NativeBannerCollection = ({ items }) => {
  const navigation = useNavigation();
  const [imageRatio, setImageRatio] = useState(1);

  const data = items || [];
  if (data.length === 0) return null;

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

  const imageHeight = CARD_WIDTH * imageRatio;

  const handlePress = (item) => {
    const link = item.link || '';
    if (link) {
      navigatePuckLink(link, navigation, item.heading || '');
    }
  };

  const renderItem = ({ item }) => {
    const bgColor = BG_COLORS[item.bgClass] || '#f5f5f5';

    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor: bgColor }]}
        onPress={() => handlePress(item)}
        activeOpacity={0.85}
      >
        <FastImage
          style={[styles.image, { height: imageHeight }]}
          source={{
            uri: item.mobileImgSrc || item.imgSrc || '',
            priority: FastImage.priority.normal,
          }}
          resizeMode={FastImage.resizeMode.cover}
        />
        {item.heading ? (
          <Text style={styles.heading} numberOfLines={1}>
            {item.heading}
          </Text>
        ) : null}
        {item.subheading ? (
          <Text style={styles.subheading} numberOfLines={3}>
            {item.subheading}
          </Text>
        ) : null}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        horizontal
        data={data}
        renderItem={renderItem}
        keyExtractor={(item, index) => `bancol-${index}`}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        snapToInterval={CARD_WIDTH + CARD_GAP}
        decelerationRate="fast"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
  },
  listContent: {
    paddingHorizontal: CARD_GAP,
  },
  card: {
    width: CARD_WIDTH,
    borderRadius: 14,
    overflow: 'hidden',
    marginRight: CARD_GAP,
  },
  image: {
    width: CARD_WIDTH,
  },
  heading: {
    fontFamily: 'NunitoSans-Bold',
    fontSize: 16,
    color: '#222',
    marginTop: 12,
    marginHorizontal: 14,
  },
  subheading: {
    fontFamily: 'NunitoSans-Regular',
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    marginHorizontal: 14,
    marginBottom: 14,
    lineHeight: 17,
  },
});

export default NativeBannerCollection;
