import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Image } from 'react-native';
import FastImage from 'react-native-fast-image';
import { useNavigation } from '@react-navigation/native';
import { navigatePuckLink } from './PuckLinkResolver';

const screenWidth = Dimensions.get('window').width;
const GAP = 6;

/**
 * NativeMasonryCollections — Banner grid layout
 * Maps to Puck: MasonryCollections_Handbag
 * 
 * API Data: items[] = { imgSrc, mobileImgSrc, title, link }
 * 
 * Layout mantığı (web ile aynı):
 *   - mobileImgSrc olan item → tam genişlik (yatay banner)
 *   - mobileImgSrc olmayan itemler → ikişerli grid (2 columns, eşit yükseklik)
 */
const NativeMasonryCollections = ({ items }) => {
  const navigation = useNavigation();
  const [imageRatios, setImageRatios] = useState({});

  const data = items || [];
  if (data.length === 0) return null;

  // Görsellerin aspect ratio'larını ölç
  useEffect(() => {
    data.forEach((item, index) => {
      // Tam genişlik itemlerde mobileImgSrc, grid itemlerde imgSrc kullan
      const hasMobileImg = item.mobileImgSrc && item.mobileImgSrc.trim() !== '';
      const imgUrl = hasMobileImg ? item.mobileImgSrc : item.imgSrc;
      if (imgUrl) {
        Image.getSize(
          imgUrl,
          (w, h) => {
            if (w > 0 && h > 0) {
              setImageRatios(prev => ({ ...prev, [index]: h / w }));
            }
          },
          () => {}
        );
      }
    });
  }, []);

  const handlePress = (item) => {
    const link = item.link || '';
    if (link) {
      navigatePuckLink(link, navigation, item.title || '');
    }
  };

  // Tam genişlik banner (mobileImgSrc olan)
  const renderFullWidthItem = (item, index) => {
    const imgUrl = item.mobileImgSrc || item.imgSrc;
    if (!imgUrl) return null;

    const ratio = imageRatios[index] || 0.5;
    const imageWidth = screenWidth - GAP * 2;
    const imageHeight = imageWidth * ratio;

    return (
      <TouchableOpacity
        key={`masonry-full-${index}`}
        onPress={() => handlePress(item)}
        activeOpacity={0.85}
        style={styles.fullWidthContainer}
      >
        <FastImage
          style={[styles.fullWidthImage, { height: imageHeight }]}
          source={{
            uri: imgUrl,
            priority: FastImage.priority.high,
          }}
          resizeMode={FastImage.resizeMode.cover}
        />
        {item.title ? (
          <View style={styles.titleOverlay}>
            <Text style={styles.titleText}>{item.title}</Text>
          </View>
        ) : null}
      </TouchableOpacity>
    );
  };

  // İkili grid satırı (mobileImgSrc olmayan)
  const renderGridRow = (pair, pairIndex) => {
    const itemWidth = (screenWidth - GAP * 3) / 2;

    // Her iki görselin ratio'sunu al, en büyüğünü kullan (eşit yükseklik için)
    const ratios = pair.map(p => imageRatios[p.originalIndex] || 1);
    const maxRatio = Math.max(...ratios);
    const imageHeight = itemWidth * maxRatio;

    return (
      <View key={`masonry-row-${pairIndex}`} style={styles.row}>
        {pair.map((item) => {
          const imgUrl = item.imgSrc || item.mobileImgSrc;
          if (!imgUrl) return null;

          return (
            <TouchableOpacity
              key={`masonry-grid-${item.originalIndex}`}
              onPress={() => handlePress(item)}
              activeOpacity={0.85}
              style={[styles.gridItem, { width: itemWidth }]}
            >
              <FastImage
                style={[styles.gridImage, { height: imageHeight }]}
                source={{
                  uri: imgUrl,
                  priority: FastImage.priority.normal,
                }}
                resizeMode={FastImage.resizeMode.cover}
              />
              {item.title ? (
                <View style={styles.titleOverlay}>
                  <Text style={styles.titleText}>{item.title}</Text>
                </View>
              ) : null}
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  // Layout'u oluştur: mobileImgSrc olanlar tam genişlik, olmayanlar ikişerli
  const buildLayout = () => {
    const elements = [];
    const gridBuffer = []; // mobileImgSrc olmayan itemleri topla

    const flushGridBuffer = () => {
      // Biriken grid itemleri ikişerli satırlara böl
      for (let i = 0; i < gridBuffer.length; i += 2) {
        const pair = gridBuffer.slice(i, i + 2);
        if (pair.length === 2) {
          elements.push({ type: 'grid', pair, pairIndex: elements.length });
        } else {
          // Tek kalan item → tam genişlik göster
          elements.push({ type: 'full', item: pair[0], index: pair[0].originalIndex });
        }
      }
      gridBuffer.length = 0;
    };

    data.forEach((item, index) => {
      const hasMobileImg = item.mobileImgSrc && item.mobileImgSrc.trim() !== '';

      if (hasMobileImg) {
        // Önce biriken grid itemleri flush et
        flushGridBuffer();
        // Tam genişlik render
        elements.push({ type: 'full', item, index });
      } else {
        // Grid buffer'a ekle
        gridBuffer.push({ ...item, originalIndex: index });
      }
    });

    // Kalan grid itemleri flush et
    flushGridBuffer();

    return elements;
  };

  const layout = buildLayout();

  return (
    <View style={styles.container}>
      {layout.map((el, i) => {
        if (el.type === 'full') {
          return renderFullWidthItem(el.item, el.index);
        }
        if (el.type === 'grid') {
          return renderGridRow(el.pair, i);
        }
        return null;
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: GAP,
    paddingVertical: 5,
  },
  fullWidthContainer: {
    marginBottom: GAP,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  fullWidthImage: {
    width: '100%',
    borderRadius: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: GAP,
  },
  gridItem: {
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  gridImage: {
    width: '100%',
    borderRadius: 10,
  },
  titleOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  titleText: {
    color: 'white',
    fontFamily: 'NunitoSans-Bold',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default NativeMasonryCollections;
