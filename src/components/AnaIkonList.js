import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Dimensions } from 'react-native';
import FastImage from 'react-native-fast-image';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../config/theme';

const AnaIkonList = ({ data }) => {
  const scrollRef = useRef(null);
  const [scrollWidth, setScrollWidth] = useState(1); // Başlangıç değeri 1 verildi.
  const [scrollPosition, setScrollPosition] = useState(0);
  const navigation = useNavigation();

  const handleContentSizeChange = (contentWidth) => {
    setScrollWidth(contentWidth > 0 ? contentWidth : 1); // Negatif veya sıfır değeri engelliyoruz.
  };
  const handleScroll = (event) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    setScrollPosition(offsetX);
  };


  return (
    <View style={styles.container}>
      {/* FlatList */}
      <FlatList
        horizontal={true}
        data={data}
        renderItem={({ item }) => <TouchableOpacity
          key={item.id}
          style={styles.itemContainer}
          onPress={() => navigation.navigate('KategoriNav', { cid: item.hid, title: item.baslik })}

        >
          <FastImage
            style={styles.image}
            source={{
              uri: item.imgurl,
              priority: FastImage.priority.normal,
            }}
            resizeMode={FastImage.resizeMode.contain}
          />
          {item.baslik && <Text style={styles.label}  >{global.toTitleCase(item.baslik)}</Text>}
        </TouchableOpacity>}
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    borderTopColor: '#eee', borderTopWidth: 1,
    paddingTop: 5
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
  itemContainer: {
    width: Dimensions.get('window').width / 5.5,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  image: {
    width: Dimensions.get('window').width / 5.5,
    height: 70,
  },
  label: {
    color: 'black',
    height: 30,
    fontSize: 10.5,
    textAlign: 'center',
    flexWrap: 'wrap',
    maxWidth: '100%', // Text için genişlik kısıtı
  }
});

export default AnaIkonList;