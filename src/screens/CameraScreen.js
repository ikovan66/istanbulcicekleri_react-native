// CameraScreen.js
import React, { useRef, useEffect, useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { Camera, useCameraDevices } from 'react-native-vision-camera';
import { ikostalert } from '../GlobalAlert';
import { colors } from '../config/theme';

const CameraScreen = ({ navigation }) => {
  const camera = useRef(null);
  const devices = useCameraDevices();
  const device = devices.back;
  const [isCameraInitialized, setIsCameraInitialized] = useState(false);

  useEffect(() => {
    (async () => {
      const status = await Camera.requestCameraPermission();
      if (status !== 'authorized') {
        ikostalert('İzin Gerekli', 'Kamera izni vermeniz gerekmektedir.');
        navigation.goBack();
      }
    })();
  }, [navigation]);

  const onInitialized = () => {
    setIsCameraInitialized(true);
  };

  const takePhoto = async () => {
    if (camera.current && isCameraInitialized) {
      try {
        const photo = await camera.current.takePhoto({
          flash: 'off',
        });
        console.log('Fotoğraf çekildi: ', photo);
        // Çekilen fotoğrafın yolunu (photo.path veya photo.uri) Hesabım ekranına gönderiyoruz.
        navigation.navigate('Hesabim', { capturedImage: photo.path || photo.uri });
      } catch (error) {
        console.error('Fotoğraf çekilirken hata:', error);
      }
    }
  };

  if (device == null) {
    return (
      <View style={styles.container}>
        <Text>Kamera bulunamadı</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        ref={camera}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        photo={true}
        onInitialized={onInitialized}
      />
      <View style={styles.captureButtonContainer}>
        <TouchableOpacity onPress={takePhoto} style={styles.captureButton}>
          <Text style={styles.captureText}>Çek</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CameraScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  captureButtonContainer: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
  },
  captureButton: {
    width: 70,
    height: 70,
    backgroundColor: colors.white,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});