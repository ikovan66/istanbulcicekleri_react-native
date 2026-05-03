import React from 'react';
import { View, Dimensions, ScrollView, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import IkostScalableImage from './IkostScalableImage';

const AnaImageList = ({ data }) => {
  const navigation = useNavigation();

  return (
    <View style={{ padding: 5 }}>
      {data && data.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {data.map((item, index) => (
            <View key={index} style={{ alignItems: 'center', marginRight: 5 }}>
            <TouchableWithoutFeedback 
  key={item.id || item.imgurl} 
  onPress={() => {
    if (item.hid !== 0) {
      navigation.navigate('KategoriNav', { cid: item.hid, title: item.baslik });
    }
  }}
>
            <IkostScalableImage
    width={Dimensions.get("window").width*.75} // height will be calculated automatically
    source={{ uri: item.imgurl }}
  /></TouchableWithoutFeedback>
 
               
             </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

export default AnaImageList;
