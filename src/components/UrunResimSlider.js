import React, { useState, useEffect } from 'react';
import { View, Image, Dimensions, TouchableOpacity, Modal, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Swiper from 'react-native-swiper';
import ImageViewer from 'react-native-image-zoom-viewer';
import FastImage from 'react-native-fast-image';
import stylesglobal from '../stylesglobal';

const UrunResimSlider = ({ data, renk }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swiperHeight, setSwiperHeight] = useState(500); // Default swiper height
  const windowWidth = Dimensions.get('window').width;
  const [renkR, setRenkR] = useState(renk);


  const [filtrelenmisData, setFiltrelenmisData] = useState(data);

  useEffect(() => {

    if (renk !== '') {
      var yeniData = data.filter(item => item.renk === renk);
      if (yeniData.length == 0) yeniData = data;
      setFiltrelenmisData(yeniData);
    } else {
      setFiltrelenmisData(data);
    }
  }, [data, renk]);

  useEffect(() => {
    if (data && data.length > 0) {
      Image.getSize(data[0].imgurl, (width, height) => {
        const scaleFactor = width / windowWidth;
        const imageHeight = height / scaleFactor;
        setSwiperHeight(imageHeight);
      }, error => {
        console.error(`Cannot get dimensions for image ${data[0].imgurl}`, error);
        setSwiperHeight(500); // Default height in case of an error
      });
    }
  }, [data]);

  useEffect(() => {
    setRenkR(renk);
  }, [renk]);

  const openModal = (index) => {
    setCurrentIndex(index);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  // Style object for the swiper container
  const swiperStyle = { height: swiperHeight };
  // Style object for the image
  const imageStyle = { width: '100%', height: '100%' };

  const images = data ? data.map(item => ({ url: item.imgurl })) : [];

  return (
    <View style={{ width: windowWidth }}>
      {filtrelenmisData && filtrelenmisData.length > 0 && (
        <Swiper
          showsButtons={false}
          style={swiperStyle}
          activeDot={
            <View
              style={{
                width: 10,
                height: 10,
                marginLeft: 8,
                marginRight: 8,
                marginBottom: 3,
                backgroundColor: 'black',
                borderColor: 'black', borderRadius: 10, borderWidth: 1
              }}
            />
          }
          dot={
            <View
              style={{
                width: 10,
                height: 10,
                marginLeft: 8,
                marginRight: 8,
                marginBottom: 3,
                borderColor: 'white', borderRadius: 10, borderWidth: 1
              }}
            />
          }
        >
          {filtrelenmisData.map((item, index) => (
            <TouchableOpacity
              key={item.id || item.imgurl}
              style={{ width: windowWidth, height: swiperHeight }}
              onPress={() => openModal(index)}
            >
              <FastImage
                style={imageStyle}
                source={{ uri: item.imgurl, priority: FastImage.priority.normal }}
                resizeMode={FastImage.resizeMode.contain}
              />
            </TouchableOpacity>
          ))}
        </Swiper>
      )}
      <Modal visible={modalVisible} transparent={false} style={{ backgroundColor: 'black' }}>
        <SafeAreaView style={stylesglobal.SafeAreaCSS}>

          <ImageViewer imageUrls={images} index={currentIndex} onSwipeDown={closeModal} enableSwipeDown={true} />
          <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
            <Text style={styles.closeButtonText}>X</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
    marginBottom: 8,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 24,
    marginVertical: 8,
  },
  description: {
    fontSize: 16,
    color: 'gray',
  },
  closeButton: {
    position: 'absolute',
    top: 80,
    right: 10,
    width: 30, height: 30,
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 0,
    justifyContent: 'center', alignItems: 'center'
  },
  closeButtonText: {
    color: 'black',
    fontSize: 16,
  },
});

export default UrunResimSlider;
