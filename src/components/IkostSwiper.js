import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  ScrollView,
  Dimensions,
  StyleSheet,
} from 'react-native';
import PropTypes from 'prop-types';

const IkostSwiper = (props) => {
  const {
    data,
    renderItem,
    visibleItems = 1.2,       // Örneğin: 1 tam + %20 sonraki slide
    spaceBetween = 10,         // Slide'lar arası boşluk (px cinsinden)
    autoplay = false,          // Otomatik oynatma opsiyonu
    autoScrollInterval = 3000, // Otomatik oynatma aralığı (ms cinsinden)
    onIndexChanged,            // Slide değişiminde aktif index bilgisini döndüren callback
    borderColor = 'transparent', // Default border color
    borderWidth = 0,           // Default border width
  } = props;

  const scrollViewRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(
    Dimensions.get('window').width
  );

  // Her slide'ın genişliği; container genişliği / visibleItems
  const slideWidth = containerWidth / visibleItems;
  // Snap interval: slide genişliği + boşluk
  const snapInterval = slideWidth + spaceBetween;

  // Konteyner genişliği alındığında slide genişliğini yeniden hesaplamak için
  const onLayout = (event) => {
    const { width } = event.nativeEvent.layout;
    setContainerWidth(width);
  };

  // Şu anki slide index'ini referans olarak saklamak için
  const currentIndexRef = useRef(0);

  // Otomatik oynatma işlemi (autoplay true ise)
  useEffect(() => {
    let autoScrollTimer = null;
    if (autoplay && data.length > 1) {
      autoScrollTimer = setInterval(() => {
        let nextIndex = currentIndexRef.current + 1;
        if (nextIndex >= data.length) {
          nextIndex = 0;
        }
        currentIndexRef.current = nextIndex;
        if (scrollViewRef.current) {
          scrollViewRef.current.scrollTo({ x: nextIndex * snapInterval, animated: true });
        }
        if (onIndexChanged) {
          onIndexChanged(nextIndex);
        }
      }, autoScrollInterval);
    }
    return () => {
      if (autoScrollTimer) clearInterval(autoScrollTimer);
    };
  }, [autoplay, autoScrollInterval, data, snapInterval, onIndexChanged]);

  // Kullanıcı kaydırmayı tamamladığında aktif slide index'ini hesaplamak için
  const onMomentumScrollEnd = (event) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(offsetX / snapInterval);
    currentIndexRef.current = newIndex;
    if (onIndexChanged) {
      onIndexChanged(newIndex);
    }
  };

  return (
    <View onLayout={onLayout}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        decelerationRate="fast"
        snapToInterval={snapInterval}
        snapToAlignment="start"
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onMomentumScrollEnd}
        // İlk ve son slide için padding ekleyebilirsiniz
        contentContainerStyle={{ paddingHorizontal: spaceBetween / 2 }}
      >
        {data.map((item, index) => (
          <View
            key={index}
            style={[
              {
                borderRadius: 10,
                overflow: 'hidden',
                width: slideWidth - spaceBetween,
                marginRight: index === data.length - 1 ? 0 : spaceBetween,
                borderColor: borderColor,
                borderWidth: borderWidth
              },
              styles.slide,
            ]}
          >
            {renderItem({ item, index })}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

IkostSwiper.propTypes = {
  data: PropTypes.array.isRequired,
  renderItem: PropTypes.func.isRequired,
  visibleItems: PropTypes.number,
  spaceBetween: PropTypes.number,
  autoplay: PropTypes.bool,
  autoScrollInterval: PropTypes.number,
  onIndexChanged: PropTypes.func,
  borderColor: PropTypes.string,
  borderWidth: PropTypes.number,
};

const styles = StyleSheet.create({
  container: {
  },
  slide: {
    // Slide içi stil düzenlemeleri buraya eklenebilir
  },
});

export default IkostSwiper;