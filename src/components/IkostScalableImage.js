import React, { useState, useEffect } from 'react';
import { Image, ActivityIndicator, View } from 'react-native';
import LottieView from 'lottie-react-native';
import stylesglobal from '../stylesglobal';

const IkostScalableImage = ({ source, width, style }) => {
  const [dimensions, setDimensions] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const handleSuccess = (srcWidth, srcHeight) => {
      const scaleFactor = width / srcWidth;
      if (isMounted) {
        setDimensions({ width, height: srcHeight * scaleFactor });
        setLoading(false);
      }
    };

    const handleError = (error) => {
      console.warn('Resim yüklenirken hata:', error);
      if (isMounted) setLoading(false);
    };

    if (typeof source === 'number') {
      // Yerel kaynak (require)
      const imgSource = Image.resolveAssetSource(source);
      if (imgSource && imgSource.width && imgSource.height) {
        handleSuccess(imgSource.width, imgSource.height);
      } else {
        handleError('Yerel kaynak çözümlenemedi.');
      }
    } else if (source.uri) {
      // Uzak URL
      Image.getSize(source.uri, handleSuccess, handleError);
    } else {
      handleError('Geçersiz kaynak.');
    }

    return () => { isMounted = false; };
  }, [source, width]);

    {loading && <View style={stylesglobal.loaderview2}>
        <LottieView source={require('../assets/animations/yukleme_ani.json')} autoPlay loop style={stylesglobal.loading} />
      </View>}

  if (!dimensions) {
    return <View style={[{ width, height: width }, style]} />;
  }
 
  return <Image source={source} style={[dimensions, style]} />;
};

export default IkostScalableImage;