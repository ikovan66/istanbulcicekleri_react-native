import React, { useState, useEffect } from 'react';
import { View, Image, Dimensions, TouchableOpacity } from 'react-native';
import Swiper from 'react-native-swiper';
import FastImage from 'react-native-fast-image';
import { useNavigation } from '@react-navigation/native';

const windowWidth = Dimensions.get('window').width;

const AnaSlider = ({ data }) => {
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

  return (
    <View style={{ width: windowWidth, marginBottom:5 }}>
      {data && data.length > 0 && (
        <Swiper autoplay={false} showsButtons={false} style={swiperStyle}
        activeDot={<Image source={require('../assets/images/indi1.png')} 
        style={{ width: 10, height: 10, marginLeft: 8, marginRight: 8, marginTop: -103, marginBottom: 3,}} />}
        dot={<Image source={require('../assets/images/indi0.png')} 
        style={{ width: 10, height: 10, marginLeft: 8, marginRight: 8, marginTop: -103, marginBottom: 3,}} />}
       >
          {data.map((item) => {
            const imgDimensions = dimensions[item.imgurl] || { width: windowWidth, height: 200 };
            return (
              <TouchableOpacity 
              key={item.id || item.imgurl} 
              style={imageContainerStyle(imgDimensions)}
              onPress={() => navigation.navigate('KategoriNav', { cid: item.hid,title:item.baslik})}
              >

                    <FastImage
style={imageStyle}
source={{uri: item.imgurl,priority: FastImage.priority.normal,
}} resizeMode={FastImage.resizeMode.contain}
/>
              </TouchableOpacity>
            );
          })}
        </Swiper>
      )}
    </View>
  );
};

export default AnaSlider;
