import React, { useState, useEffect } from 'react';
import { View, Image, Dimensions, TouchableOpacity } from 'react-native';
import Swiper from 'react-native-swiper';
import FastImage from 'react-native-fast-image';
import { useNavigation } from '@react-navigation/native';
const windowWidth = Dimensions.get('window').width;
import IkostSwiper from './IkostSwiper'; 
import IkostScalableImage from './IkostScalableImage';
import IkostResim from './IkostResim';

const AnaSlider = ({ data,multislidewidth }) => {
  const [dimensions, setDimensions] = useState({});
  const [swiperHeight, setSwiperHeight] = useState(200); // Default swiper height
  const navigation = useNavigation();

  useEffect(() => {
    let newDimensions = {};
    const imagePromises = data.map(item =>
      new Promise(resolve => {
        Image.getSize(item.imgurl, (width, height) => {
          const scaleFactor = width / windowWidth;
          const imageHeight = height / scaleFactor;
          newDimensions[item.imgurl] = { width: windowWidth, height: imageHeight };
          resolve(imageHeight);
        }, error => { 
          console.error(`Cannot get dimensions for image ${item.imgurl}`, error);
          resolve(200); // Default height in case of an error
        });
      })
    );

    Promise.all(imagePromises).then(heights => {
      setDimensions(newDimensions);
      // Find the max height from all image heights
      const maxHeight = Math.max(...heights);
      setSwiperHeight(maxHeight); // Set the swiper height
    });
  }, [data]);

  // Style object for the swiper container
  const swiperStyle = { height: swiperHeight }; // Set the swiper height dynamically
  // Style object for the image container
  const imageContainerStyle = (imgDimensions) => ({ width: imgDimensions.width, height: imgDimensions.height });
  // Style object for the image
  const imageStyle = { width: '100%', height: '100%' };

  const renderItem = ({ item, index }) => {
    // Değişkeni burada tanımlayabilirsiniz.
    const imgDimensions = dimensions[item.imgurl] || { width: windowWidth};
  
    return (
      <TouchableOpacity 
        key={item.id || item.imgurl} 
        onPress={() => navigation.navigate('KategoriNav', { cid: item.hid, title: item.baslik })}
      >
        <IkostScalableImage width={windowWidth*1/(data.length>1?multislidewidth:1)-10}
        source={{
            uri: item.imgurl,
            priority: FastImage.priority.normal,
          }}
          resizeMode={FastImage.resizeMode.contain}
        />
      </TouchableOpacity>
    );
  };


  return (
    <View style={{ width: windowWidth, marginBottom:10 }}>
      {data && data.length > 0 && (
           <IkostSwiper 
           data={data}
           renderItem={renderItem}
           visibleItems={data.length>1?multislidewidth:1}          // Ekranda 1 tam + %20 sonraki slide görünmesi için
           spaceBetween={10}           // Slide'lar arası 20px boşluk
           autoScroll={true}           // Otomatik kaydırma aktif
           autoScrollInterval={3000}   // 3 saniyede bir slide değişimi
           onIndexChanged={(index) => console.log('Aktif slide indexi:', index)}
         />

         
      )}
    </View>
  );
};

export default AnaSlider;
