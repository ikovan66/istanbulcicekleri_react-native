import React, { useState, useRef } from 'react';
import { View, FlatList, StyleSheet, Dimensions } from 'react-native';
import UrunView from './UrunView';
import { colors } from '../config/theme';

const AnaUrunlistYatay = ({ urunlist }) => {
  const [scrollWidth, setScrollWidth] = useState(1); // Başlangıç değeri 1 verildi.
  const [scrollPosition, setScrollPosition] = useState(0);
  const scrollRef = useRef(null);
  const screenWidth = Dimensions.get('window').width;

  // FlatList'in toplam genişliğini hesapla
  const handleContentSizeChange = (contentWidth) => {
    setScrollWidth(contentWidth > 0 ? contentWidth : 1); // Negatif veya sıfır değeri engelliyoruz.
  };

  // Kaydırma pozisyonunu izlemek için fonksiyon
  const handleScroll = (event) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    setScrollPosition(offsetX);
  };

  // Kaydırma çubuğunun genişliği (ekran genişliği ile içerik genişliği arasındaki oran)
  const scrollbarWidth = scrollWidth > screenWidth ? screenWidth * (screenWidth / scrollWidth) : screenWidth;

  // Kaydırma çubuğunun sol konumu (scroll pozisyonuna göre ayarlanır)
  const scrollbarPosition = scrollWidth > screenWidth / 3 ? (scrollPosition / scrollWidth) * screenWidth / 3 : 0;

  return (
    <View style={styles.container}>
      {/* FlatList */}
      <FlatList
        horizontal={true}
        data={urunlist}
        renderItem={({ item }) => <UrunView item={item} kayan={true} />}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        contentContainerStyle={{ flexGrow: 1 }}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={10}
        style={{ backgroundColor: colors.white, paddingHorizontal: 10 }}
        onScroll={handleScroll}
        onContentSizeChange={handleContentSizeChange}
        scrollEventThrottle={16}
        ref={scrollRef}
        showsHorizontalScrollIndicator={false} // Varsayılan scrollbar gizleniyor
      />

      {/* Özel Kaydırma Çubuğu */}
      <View style={styles.scrollbarContainer}>
        {scrollWidth > screenWidth && (
          <View
            style={[
              styles.scrollbar,
              {
                width: scrollbarWidth,
                transform: [{ translateX: scrollbarPosition }],
              },
            ]}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',

  },
  scrollbarContainer: {
    width: Dimensions.get('window').width / 3,
    position: 'absolute',
    top: -8, // FlatList'in altına sabitle
    right: 5,
    height: 2,
    backgroundColor: colors.background, // Gri arka plan
    borderRadius: 5,
  },
  scrollbar: {
    height: '100%',
    backgroundColor: colors.primary, // Kaydırma çubuğunun rengi
    borderRadius: 2,
  },
});

export default AnaUrunlistYatay;