import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, Alert } from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { ikostalert } from '../GlobalAlert';
import { colors } from '../config/theme';

const FotoCekVeSec = () => {
  const [imageUri, setImageUri] = useState(null);

  const openCamera = async () => {
    const options = {
      mediaType: 'photo',
      saveToPhotos: true, // Çekilen fotoğraf galeride kaydedilsin
    };

    try {
      const result = await launchCamera(options);

      if (!result.didCancel && result.assets) {
        console.log('Çekilen Fotoğraf:', result.assets[0].uri);
        setImageUri(result.assets[0].uri);
      } else {
        console.log('Kullanıcı kamerayı iptal etti');
      }
    } catch (error) {
      console.error('Kamerayı açarken hata:', error);
      ikostalert('Hata', 'Kamerayı açarken bir sorun oluştu.');
    }
  };

  const openGallery = async () => {
    const options = {
      mediaType: 'photo',
      selectionLimit: 1, // Tek bir resim seç
    };

    try {
      const result = await launchImageLibrary(options);

      if (!result.didCancel && result.assets) {
        console.log('Seçilen Resim:', result.assets[0].uri);
        setImageUri(result.assets[0].uri);
      } else {
        console.log('Kullanıcı galeriyi iptal etti');
      }
    } catch (error) {
      console.error('Galeriyi açarken hata:', error);
      ikostalert('Hata', 'Galeriyi açarken bir sorun oluştu.');
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      {imageUri ? (
        <Image
          source={{ uri: imageUri }}
          style={{ width: 200, height: 200, marginBottom: 20 }}
        />
      ) : (
        <Text style={{ marginBottom: 20 }}>Henüz bir resim seçilmedi</Text>
      )}

      <TouchableOpacity
        style={{
          backgroundColor: '#4caf50',
          padding: 10,
          marginBottom: 10,
          borderRadius: 5,
        }}
        onPress={openCamera}
      >
        <Text style={{ color: colors.white }}>Kamerayı Aç</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={{
          backgroundColor: '#2196f3',
          padding: 10,
          borderRadius: 5,
        }}
        onPress={openGallery}
      >
        <Text style={{ color: colors.white }}>Galeriden Seç</Text>
      </TouchableOpacity>
    </View>
  );
};

export default FotoCekVeSec;