import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
} from 'react-native';
import VideoItem from './VideoItem';

const { width } = Dimensions.get('window');

// Ekranın %80'i kadar video genişliği
const CARD_WIDTH = width * 0.8;
// Videolar arası boşluk
const SPACING = 20;
// Karusel yüksekliği
const CAROUSEL_ITEM_HEIGHT = 400; 

const VideoPlaylist = ({ data }) => {
  const [videoList, setVideoList] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // FlatList'i kontrol etmek için referans
  const flatListRef = useRef(null);

  // Ekranda görünen öğe değiştiğinde tetiklenecek callback
  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems && viewableItems.length > 0) {
      const visibleIndex = viewableItems[0].index;
      if (typeof visibleIndex === 'number') {
        setCurrentIndex(visibleIndex);
      }
    }
  });

  // Görünürlük konfigürasyonu
  const viewabilityConfig = useRef({
    viewAreaCoveragePercentThreshold: 50,
  });

  useEffect(() => {
    // data'dan .mp4 uzantılı linkleri çekiyoruz
    const videoUrls = data
      .filter(item => item.uzanti === '.mp4')
      .map(item => item.imgurl);
    setVideoList(videoUrls);
  }, [data]);

  // Video bitince çalışan fonksiyon
  const handleVideoEnd = (videoIndex) => {
    // Sıradaki index
    let nextIndex = videoIndex + 1;
    if (nextIndex >= videoList.length) {
      nextIndex = 0; // son videodan sonra başa dön
    }

    // ÖNEMLİ: State üzerinden currentIndex'i de mutlaka biz güncelleyelim
    setCurrentIndex(nextIndex);

    // Sonra FlatList'i o indekse kaydır
    flatListRef.current?.scrollToIndex({
      index: nextIndex,
      animated: true,
    });
  };

  const renderItem = ({ item, index }) => {
    return (
      <View style={styles.videoCard}>
        <VideoItem
          uri={item}
          index={index}
          isActive={index === currentIndex} // Aktiflik kontrolü
          onEnd={handleVideoEnd}
        />
      </View>
    );
  };

  if (videoList.length === 0) {
    return (
      <View style={styles.loaderContainer}>
        <Text>Video listesi boş.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={videoList}
        renderItem={renderItem}
        keyExtractor={(item, index) => String(index)}
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        // Bir kartın en/boyunun + spacing kadar mesafe katedildiğinde otomatik snap
        snapToInterval={CARD_WIDTH + SPACING}
        snapToAlignment="start"
        onViewableItemsChanged={onViewableItemsChanged.current}
        viewabilityConfig={viewabilityConfig.current}
        // performans için item boyutu
        getItemLayout={(_, index) => ({
          length: CARD_WIDTH + SPACING,
          offset: (CARD_WIDTH + SPACING) * index,
          index,
        })}
        // içerik padding (sağ-sol)
        contentContainerStyle={{ 
          paddingHorizontal: SPACING,
        }}
      />
    </View>
  );
};

export default VideoPlaylist;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    marginVertical :20
  },
  videoCard: {
    width: CARD_WIDTH,
    height: CAROUSEL_ITEM_HEIGHT,
    marginRight: SPACING,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: 'white',
  },
  loaderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});