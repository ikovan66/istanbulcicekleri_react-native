import React, {  useContext,useEffect, useState } from 'react';
import { ScrollView,View,Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import {SepetContext} from '../components/SepetContext'; // İçe aktarma
import { colors } from '../config/theme';

const CesitListesi = ({ uyarstil,cesitler,cesitad, onCommand  }) => {
    const [secilenCesitId, setSecilenCesitId] = useState(null);
    const [secilenrenk, setsecilenrenk] = useState('');
  const { fetchTranslations, translate } = useContext(SepetContext);

  const handleCesitSecimi = (cesitId,renk) => {
    setSecilenCesitId(cesitId);
    setsecilenrenk(renk);
    onCommand && onCommand(renk, cesitId);

   };
  useEffect(() => {
    if (cesitler.length > 0) {
        // İlk öğeyi seç
        const ilkCesit = cesitler[0];
        setSecilenCesitId(ilkCesit.id);
        setsecilenrenk(ilkCesit.ad);
        onCommand && onCommand(ilkCesit.ad, ilkCesit.id);
    }
}, [cesitler]);
  return (
    <View style={{paddingVertical:10,  paddingHorizontal:15,paddingRight:0}}>
    {/* <View >
        <Text>
        <Text style={{fontWeight:'700',color:'green'}}>{secilenrenk}</Text>
        </Text> 
        
    </View> */}
    <ScrollView style={styles.container}  horizontal={false}>
      {cesitler.map((cesit) => (
        <TouchableOpacity 
          key={cesit.id} 
          onPress={() => handleCesitSecimi(cesit.id,cesit.ad)}
          style={[
            styles.button,
            secilenCesitId === cesit.id && styles.selectedButton // Tıklanan buton için stil
            ,uyarstil && {...uyarstil} 
          ]}
        >
             <View style={styles.radioButton}>
        {secilenCesitId === cesit.id && <View style={styles.radioButtonSelected} />}
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.label}>{translate(cesit.ad)}</Text>
        <Text style={styles.price}>{cesit.fiyatstring}</Text>
      </View>
       
        </TouchableOpacity>
      ))}
    </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    paddingTop:3,

  },
  label:{
    fontFamily: 'NunitoSans-Regular',
    fontSize: 13,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#F7F6F4",
    borderRadius: 10,
    marginVertical: 5,
  },
  selectedButton: {
    //borderWidth: 4,
    //borderColor: 'green', 
    // Tıklanan buton için çerçeve rengi
  },
  image: {
    width: 90,
    height: 90,
    borderRadius: 50,


  },
  radioButton: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: .5,
    borderColor: colors.black,
    backgroundColor:'white',
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  radioButtonSelected: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: colors.black,
  },
  textContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
  },
});

export default CesitListesi;
