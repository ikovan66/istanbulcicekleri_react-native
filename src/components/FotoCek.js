import React, { useEffect, useState, useRef } from 'react';
import {
  Alert,
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ImageResizer from 'react-native-image-resizer';
import { Camera, useCameraDevice } from 'react-native-vision-camera';
import axios from 'axios';
import { ikostalert } from '../GlobalAlert';
import { colors } from '../config/theme';


function FotoCek({ item, onCommand }) {
  const camera = useRef(null);
  const device = useCameraDevice('back');

  const [image, setImage] = useState('');
  const [showCamera, setShowCamera] = useState(true);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    const requestCameraPermission = async () => {
      const permission = await Camera.requestCameraPermission();
      console.log('Camera Permission:', permission);
    };
    requestCameraPermission();
  }, []);

  const resizeImage = async (photo, newSize, quality) => {
    try {
      const { width, height, path } = photo;
      const aspectRatio = width / height;

      const newWidth = width > height ? newSize : newSize * aspectRatio;
      const newHeight = width > height ? newSize / aspectRatio : newSize;

      const resizedImage = await ImageResizer.createResizedImage(
        path,
        newWidth,
        newHeight,
        'JPEG',
        quality
      );
      return resizedImage.uri;
    } catch (error) {
      console.error('Image resizing error:', error);
      return photo.path;
    }
  };

  const capturePhoto = async () => {
    if (camera.current) {
      try {
        const photo = await camera.current.takePhoto({ qualityPrioritization: 'balanced' });
        setShowCamera(false);

        const resizedUri = await resizeImage(photo, 2500, 90);
        setImage(resizedUri);
      } catch (error) {
        console.error('Capture error:', error);
        ikostalert('Hata', 'Fotoğraf çekilirken bir sorun oluştu.');
      }
    }
  };

  const uploadToCloudflare = async (photoUri) => {
    const apiUrl = 'https://api.cloudflare.com/client/v4/accounts/db6ba4190765cb8cebde3b66cdca4b20/images/v1';
    const apiToken = 'YGUcl2AUN-fxq2Mduldd6DAFnv2IXqf1PMRtWQEb';

    const formData = new FormData();
    formData.append('file', {
      uri: photoUri,
      type: 'image/jpeg',
      name: 'uploaded_photo.jpg',
    });

    try {
      const response = await axios.post(apiUrl, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${apiToken}`,
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        },
      });

      if (response.data.success) {
        const imageUrl = response.data.result.variants[0];
        console.log('Cloudflare Image URL:', imageUrl);
        onCommand(item, imageUrl);

      } else {
        ikostalert('Hata', 'Resim Cloudflare\'a yüklenirken bir sorun oluştu.');
      }
    } catch (error) {
      console.error('Cloudflare upload error:', error);
      ikostalert('Hata', 'Cloudflare yükleme sırasında bir hata oluştu.');
    }
  };



  if (!device) {
    return <Text>Kamera erişilebilir değil.</Text>;
  }

  return (
    <View style={{ flex: 1, padding: 10 }}>
      {uploadProgress > 0 && uploadProgress < 100 && (
        <View style={{ height: 5, backgroundColor: '#ddd', width: '100%', marginBottom: 10 }}>
          <View style={{ height: 5, backgroundColor: '#4caf50', width: `${uploadProgress}%` }} />
        </View>
      )}

      {showCamera ? (
        <>
          <Camera
            ref={camera}
            style={{ flex: 1 }}
            device={device}
            isActive={true}
            photo={true}
          />
          <TouchableOpacity
            style={{
              position: 'absolute',
              bottom: 20,
              alignSelf: 'center',
              backgroundColor: colors.black,
              padding: 15,
              borderRadius: 50,
            }}
            onPress={capturePhoto}
          >
            <Text style={{ color: colors.white }}>Fotoğraf Çek</Text>
          </TouchableOpacity>
        </>
      ) : (
        <View style={{ flex: 1 }}>
          <TouchableOpacity onPress={() => setShowCamera(true)} style={{ flex: 1 }}>
            {image ? (
              <Image source={{ uri: image }} style={{ flex: 1 }} />
            ) : (
              <Text style={{ textAlign: 'center', marginTop: 20 }}>Görsel Yok</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              padding: 15,
              backgroundColor: '#4caf50',
              marginTop: 10,
              borderRadius: 5,
            }}
            onPress={() => uploadToCloudflare(image)}
          >
            <Text style={{ color: colors.white, textAlign: 'center' }}>Cloudflare'a Yükle ve Gönder</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  buttonContainer: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    position: 'absolute',

    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    bottom: 10,
    padding: 20,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  camButton: {
    height: 80,
    width: 80,
    borderRadius: 40,
    backgroundColor: '#B2BEB5',

    alignSelf: 'center',
    borderWidth: 4,
    borderColor: 'white',
  },
  image: {
    width: '100%',
    height: '100%',
  }, image2: {
    width: 150,
    height: 150,
  },
  progressBarContainer: {
    height: 20,
    width: '100%',
    backgroundColor: 'white',
    borderColor: colors.black,
    borderWidth: 2,
    borderRadius: 5,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#77c3ec',
    borderRadius: 5,
  },
});

export default FotoCek;