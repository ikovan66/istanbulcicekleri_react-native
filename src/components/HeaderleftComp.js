import React, { useContext,useState } from 'react';
import { TouchableOpacity, Text,Image,View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SepetContext } from '../components/SepetContext';
import { colors } from '../config/theme';

const HeaderleftComp = ({title}) => {
  const navigation = useNavigation();
  const { translate } = useContext(SepetContext);

    return (
      <TouchableOpacity onPress={() => navigation.goBack()} 
      style={{ flexDirection: 'row', alignItems: 'center' }}>
      <View style={{ paddingRight: 10 }}>
        <Image
          source={require('../assets/images/left_big.png')} 
          style={{ width: 9.78, height: 19.21 }}
        />
      </View>
      
      <Text numberOfLines={1}
      style={{ fontSize: 17, 
      color: colors.black, marginLeft: 5 , marginRight:20,
      fontFamily:'NunitoSans-SemiBold'}}>{global.toTitleCase(translate(title))}</Text>

    </TouchableOpacity>
    )
  };

  export default HeaderleftComp;
