import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet
} from 'react-native';

import axios from 'axios';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { ikostalert } from '../GlobalAlert';
import { Camera, useCameraDevices } from 'react-native-vision-camera';
import { Picker } from '@react-native-picker/picker';
 
import FastImage from 'react-native-fast-image';
import IkostResim from './IkostResim';
import IkostScalableImage from './IkostScalableImage';
import { colors } from '../config/theme';

const FormScreen = ({ fv, ua , onSubmit}) => {
    const [urunAlanlar, setUrunAlanlar] = useState(ua || []);
    const [formValues, setFormValues] = useState(fv || {});
    const [isuploading, setisuploading] = useState(false);
    const [imageUri, setImageUri] = useState('');
    const [currentOptions, setCurrentOptions] = useState([]);
  const [currentPickerId, setCurrentPickerId] = useState(null);
    // Metin girişlerinde karakter sınırı
    const handleTextChange = (alanadi, value, maxChar) => {
      let val = value;
      if (maxChar && value.length > maxChar) {
        val = value.substring(0, maxChar);
      }
      setFormValues((prev) => ({
        ...prev,
        [alanadi]: val
      }));
    };
  
    // Select / Picker değişiminde
    const handleSelectChange = (alanadi, value) => {
      setFormValues((prev) => ({
        ...prev,
        [alanadi]: value
      }));
    };
  
    // Resim seçme butonuna basıldığında
    const handleImagePick = (item) => {
      // item: tablo satırı (tip=true, coktansecmeli=false)
      // "ikostalert" gibi davranarak Alert.alert kullanalım veya direkt ikostalert yazalım:
      ikostalert(
        "Seçenekler",
        "Fotoğraf çekmek veya galeriden seçmek ister misiniz?",
        [
          { text: "Kamerayı Aç", onPress: () => openCamera(item) },
          { text: "Galeriden Seç", onPress: () => openGallery(item) },
          { text: "İptal", style: "cancel" },
        ]
      );
    };
  
  
  
 // Kamera açma
const openCamera = async (item) => {
    const { alanadi,id } = item;
  
    const { status } = await Camera.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('İzin Gerekli', 'Kamera izni vermeniz gerekmektedir.');
      return;
    }
  
    const options = {
      mediaType: 'photo',
      saveToPhotos: true
    };
  
    const result = await launchCamera(options);
    if (result.didCancel) {
      console.log('Kullanıcı kamera kullanımını iptal etti.');
    } else if (result.errorCode) {
      console.error('Kamera hatası:', result.errorMessage);
      Alert.alert('Hata', 'Kamerayı açarken bir hata oluştu.');
    } else if (result.assets && result.assets.length > 0) {
      const { uri, type, fileName } = result.assets[0];
      await cloudflareUpload(id, uri, type, fileName);
    }
  };
  
  // Galeriden resim seçme
  const openGallery = async (item) => {
    const { alanadi,id } = item;
  
    const options = {
      mediaType: 'photo',
      selectionLimit: 1
    };
  
    try {
      const result = await launchImageLibrary(options);
      if (!result.didCancel && result.assets && result.assets.length > 0) {
        const { uri, type, fileName } = result.assets[0];
        await cloudflareUpload(id, uri, type, fileName);
      }
    } catch (error) {
      console.error('Galeriyi açarken hata:', error);
      Alert.alert('Hata', 'Galeriyi açarken bir sorun oluştu.');
    }
  };
  
  // Cloudflare’a upload eden fonksiyon
  const cloudflareUpload = async (id, imgurl, imgtype, imgname) => {
    setisuploading(true);
  
    const apiUrl = 'https://api.cloudflare.com/client/v4/accounts/db6ba4190765cb8cebde3b66cdca4b20/images/v1';
    const apiToken = 'YGUcl2AUN-fxq2Mduldd6DAFnv2IXqf1PMRtWQEb';
  
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: imgurl,
        type: imgtype,
        name: imgname
      });
  
      const response = await axios.post(apiUrl, formData, {
        headers: {
          Authorization: `Bearer ${apiToken}`,
          'Content-Type': 'multipart/form-data'
        }
      });
  
      const result = response.data.result;
      const uploadedUrl = result.variants[0];
      console.log('Yüklenen dosya URL\'si:', uploadedUrl);
  
      // Yüklenen URL’yi ilgili alanadi’na kaydet
      successact(id, uploadedUrl);
  
      setisuploading(false);
      return uploadedUrl;
    } catch (error) {
      setisuploading(false);
      console.error('Hata:', error.response?.data || error.message);
      Alert.alert('Hata', 'Resim yüklenirken bir sorun oluştu.');
      throw error;
    }
  };
  
  // Cloudflare yükleme başarılı olduğunda, formValues’a atama
  const successact = (id, uploadedUrl) => {
    setFormValues((prev) => ({
      ...prev,
      [id]: uploadedUrl
    }));
  };
  
    // Form alanlarını oluşturma
    const renderFormField = (item) => {
      const { id, alanadi, tip, coktansecmeli, karakter, cevapvarsay } = item;
  
      // tip = true => resimli kısım
      if (tip) {
        return (
          <View style={styles.fieldContainer} key={id}>
            <Text style={styles.label}>{alanadi} (Resim):</Text>
            <TouchableOpacity onPress={() => handleImagePick(item)}>
              <Text style={styles.uploadLink}>Resim Yükle</Text>
            </TouchableOpacity>
            {/* Localde seçilen resmi göstermek isterseniz */}
            {formValues[id] ? (
             
                <IkostScalableImage
                width={80}
                                    source={{
                        uri: formValues[id].replace('desktop', 'thumba'),
                        priority: FastImage.priority.high,
                    }}
                />
      
            ) : null}
          </View>
        );
      }
      else {
        // tip = false => metinsel giriş veya select
        if (coktansecmeli) {
          // cevapvarsay virgül ile ayrılmış seçenekler
          let options = [];
          if (cevapvarsay) {
            options = cevapvarsay.split(',').map(opt => opt.trim());
          }
          return (

            
            <View style={styles.fieldContainer} key={id}>
              <Text style={styles.label}>{alanadi}</Text>

                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryContainer}>
                              {options.map((opt, index) => {
                                  const isSelected = opt === formValues[id];
                                  return (
                                      <TouchableOpacity
                                      key={opt} onPress={() => handleSelectChange(id, opt)}
                                          style={[
                                              styles.categoryButton,
                                              { backgroundColor: isSelected ? '#679A97' : '#dddddd' },
                                          ]}
                                      >
                                          <Text
                                              style={[
                                                  styles.categoryButtonText,
                                                  { color: isSelected ? colors.white : colors.black }
                                              ]}
                                          >
                                              {opt}
                                          </Text>
                                      </TouchableOpacity>
                                  );
                              })}
                          </ScrollView>
      
    
            </View>
          );
    
        }
        else {
          // Normal metin giriş
          return (
            <View style={styles.fieldContainer} key={id}>
              <Text style={styles.label}>{alanadi} (Metin):</Text>
              <TextInput
                style={styles.textInput}
                value={formValues[id] || ''}
                onChangeText={(val) => handleTextChange(id, val, karakter)}
                placeholder={cevapvarsay}
              />
              {karakter > 0 && (
                <Text style={{ fontSize: 12, color: '#888' }}>
                  Kalan karakter hakkı: {karakter - (formValues[id]?.length || 0)}
                </Text>
              )}
            </View>
          );
        }
      }
    };

    useEffect(() => {
         handleSubmit();
      }, [formValues, urunAlanlar]);
      
   
    // Formu gönder (Tüm alanlar zorunlu)
    const handleSubmit = () => {
        let convertedValues = {};
        let ozelnotlar='';
      
        for (const item of urunAlanlar) {
          const { alanadi, id } = item;
          const value = formValues[id];
      
          if (!value || value.trim() === '') {
           // Alert.alert('Uyarı', `${alanadi} alanı boş bırakılamaz!`);
            return;
          }

          if(value.includes('https://imagedelivery.net/')){
            ozelnotlar+='resim_'+value.replace('https://imagedelivery.net/','').replace('desktop','thumba')+',';

          }else{
            ozelnotlar+=alanadi+': '+value+',';

          }
          
          convertedValues[alanadi + '_' + id] = value;
        }
      
        if (onSubmit) {
          onSubmit(ozelnotlar); // Parent bileşene verileri gönder
        }
      };
      
  
    return (
      <View style={styles.container}>
  
        {isuploading && (
          <Text style={{ color: 'red', marginBottom: 10 }}>
            Resim yükleniyor, lütfen bekleyin...
          </Text>
        )}
  
        {urunAlanlar.map((item) => renderFormField(item))}
  
       </View>
    );
  };
  
  export default FormScreen;
  
  const styles = StyleSheet.create({
    categoryContainer: {
      marginTop: 10,
      marginBottom: 10,
      paddingHorizontal: 5,
  },
  categoryButton: {
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 20,
      marginRight: 8,
  },
  categoryButtonText: {
      fontSize: 14,
      fontFamily: 'NunitoSans-Bold',
  },
    container: {
      flex: 1,
      padding: 16,paddingBottom:0
    },
    title: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 16
    },
    fieldContainer: {
      marginBottom: 16
    },
    label: {
      fontWeight: 'bold'
    },
    textInput: {
      borderWidth: 1,
      borderColor: colors.border,
      padding: 8,
      marginTop: 6
    },
    uploadLink: {
      color: 'blue',
      textDecorationLine: 'underline',
      marginTop: 4
    }
  });