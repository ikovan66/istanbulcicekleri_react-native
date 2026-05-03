import React, { useState, useContext } from 'react';
import { View, TextInput, Button, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import IkostTextInput from '../components/IkostTextInput';
import IkostButton from "../components/IkostButton";
import EyeIcon from '../components/EyeIcon';
import stylesglobal from '../stylesglobal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AnaFooter from '../components/AnaFooter';
import HeaderleftComp from '../components/HeaderleftComp';
import { ikostalert } from '../GlobalAlert';
import Auth from '../components/Auth';
import { urls } from '../config/apiUrls';
import { colors } from '../config/theme';
import { SepetContext } from '../components/SepetContext';

const PasswordUpdateScreen = ({ route, navigation }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordVisibility, setPasswordVisibility] = useState(true);
  const [confirmPasswordVisibility, setConfirmPasswordVisibility] = useState(true);
  const { translate } = useContext(SepetContext);

  const togglePasswordVisibility = () => {
    setPasswordVisibility(!passwordVisibility);
  };

  const toggleConfirmPasswordVisibility = () => {
    setConfirmPasswordVisibility(!confirmPasswordVisibility);
  };

  const updatePassword = async () => {
    if (password === confirmPassword && password != '') {

      var username = await AsyncStorage.getItem('username');
      var memberID = await AsyncStorage.getItem('memberID');


      const sifredata = { Sifre: password };

      const response = await Auth.post(
        urls.updatePassword,
        sifredata
      );

      const result = response.data;

      if (result.indexOf('tamam') > -1) {
        ikostalert(translate('Başarılı'), translate('Şifreniz başarıyla güncellenmiştir.'));
      } else {
        ikostalert(translate('Hata'), result);
      }

    } else {
      ikostalert(translate('Lütfen her iki kutucuğa da aynı şifreyi giriniz.'));

    }
  };


  return (<SafeAreaView style={stylesglobal.SafeAreaCSS}>
    <View style={stylesglobal.headerCustom}>
      <HeaderleftComp title={translate("Şifremi Güncelle")} />
    </View>
    <View style={styles.container}>


      <View style={styles.containerX}>
        <IkostTextInput
          title={translate("Şifre")}
          secureTextEntry={passwordVisibility}

          onChangeText={setPassword}
        />
        <TouchableOpacity onPress={togglePasswordVisibility} style={styles.eye}>
          <EyeIcon isOpen={passwordVisibility} />
        </TouchableOpacity>
      </View>

      <View style={styles.containerX}>
        <IkostTextInput
          title={translate("Şifre Doğrula")}
          secureTextEntry={confirmPasswordVisibility}

          onChangeText={setConfirmPassword}
        />
        <TouchableOpacity onPress={toggleConfirmPasswordVisibility} style={styles.eye}>
          <EyeIcon isOpen={confirmPasswordVisibility} />
        </TouchableOpacity>
      </View>
      <IkostButton title={translate("Şifreyi Güncelle")} onPress={updatePassword} style={{ width: '100%' }} />

    </View>


    <View style={stylesglobal.footer}>
      <AnaFooter parametre={'Hesabım'} navigation={navigation} />
    </View>


  </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    paddingLeft: 25,
    paddingRight: 25,
    backgroundColor: colors.white,
    alignItems: "center",
  },
  containerX: {
    position: 'relative',
    width: '100%'
  },
  eye: {
    position: 'absolute', right: 10, top: 30
  },
  input: {
    width: '100%',
    marginVertical: 10,
    borderWidth: 1,
    padding: 10,
    borderRadius: 5
  }
});

export default PasswordUpdateScreen;
