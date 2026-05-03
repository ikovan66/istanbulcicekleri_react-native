import React, { useContext,useState } from 'react';
import { TouchableOpacity,  StyleSheet, Text } from 'react-native';
import { SepetContext } from '../components/SepetContext';
import { colors } from '../config/theme';

const IkostButton = (props) => {
  const { translate } = useContext(SepetContext);

  return (
     <TouchableOpacity style={styles.buttonContainer} onPress={props.onPress}>
       <Text style={styles.buttonText}>{translate(props.title)}</Text>
     </TouchableOpacity>
  )
};

const styles = StyleSheet.create({
  buttonContainer: {
    marginBottom:10,
    marginTop:10,
    justifyContent:'center',
    alignItems: "center",
    height: 50,
    borderRadius: 6,
    borderWidth: .5,
    borderColor: colors.black,
    alignItems: "center",
    justifyContent: "center",
    width: '100%',
    backgroundColor: colors.white
  },
  buttonText: {
    fontFamily: 'NunitoSans-Regular',    fontSize: 14,
    color: colors.black
  }
});


export default IkostButton;
