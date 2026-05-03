import React from 'react';
import {
  View,
  Image,
  Text,
  TouchableOpacity
} from 'react-native';

const MenuButon = ({ imageSource, title, onCommand }) => {//onCommand olunca props olmaz! parametreleri ayrı ayrı yazacaksın!
  return (
    <TouchableOpacity 
    style={{ width: '50%', padding: 10 ,alignContent:'center',alignItems:'center',marginBottom:5}}
    onPress={() => onCommand()}  
    >
      <View style = {{
            justifyContent: 'center', // Bu özellik içerisindeki öğeleri dikeyde ortalar
            alignItems: 'center' // Bu özellik içerisindeki öğeleri yatayda ortalar
        ,
          paddingTop: 20.77,
          width: '100%',
          borderRadius: 10,
          borderWidth: 1,
          borderColor: "rgba(235, 235, 235, 255)",
          backgroundColor: "rgba(255, 255, 255, 255)"
      }}>
        <View style={{width:50,height:44,      justifyContent: 'center',
         
            alignItems: 'center' }}>
       <Image source={imageSource} resizeMode='contain' style={{width:'100%',height:'100%'}} />
       </View>
      <Text numberOfLines={1}  // Sadece bir satır göster
       ellipsizeMode='tail' // Metni "..." ile kırp
       style = {{
          fontFamily: "Nunito Sans",
          fontWeight: "bold",
          fontSize: 13,
          textAlign: "center",
          color: "rgba(38, 38, 40, 255)",
          marginTop: 10,marginBottom:10
      }} > {title} </Text>
      </View>
    </TouchableOpacity>
  );
};

export default MenuButon;
