import React, { useContext } from 'react';
import { TouchableOpacity, StyleSheet, Text, View } from 'react-native';
import { SepetContext } from '../components/SepetContext';
import { colors } from '../config/theme';

const IkostButton = (props) => {
  // Context'i burada çekiyoruz:
  const { translate } = useContext(SepetContext);

  return (
    <TouchableOpacity style={[stylesBtn.loginBtn, props.style]} onPress={props.onPress}>
      <View style={stylesBtn.loginBtnic}>
        {/* translate fonksiyonunu doğrudan kullanıyoruz */}
        <Text style={[stylesBtn.loginText, props.style]}>
          {translate(props.title)}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const stylesBtn = StyleSheet.create({
  loginBtn: {
    alignItems: "center",
    justifyContent: "center",
    height: 50,
    borderRadius: 6,
    padding: 8,
    backgroundColor: colors.primary
  },
  loginBtnic: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    width: '100%',
    borderWidth: 0,
    borderColor: colors.border,
    borderRadius: 0,
    paddingLeft: 20,
    paddingRight: 20
  },
  loginText: {
    fontFamily: "NunitoSans-Regular",
    fontSize: 14,
    textAlign: 'center',
    color: colors.white
  },
});

export default IkostButton;