import React, { useContext, useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import LottieView from 'lottie-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GestureHandlerRootView, PanGestureHandler, State } from 'react-native-gesture-handler';
import * as RNLocalize from 'react-native-localize';
import { SepetContext } from '../components/SepetContext';
import Video from 'react-native-video';
import { SafeAreaView } from 'react-native-safe-area-context';
import stylesglobal from '../stylesglobal';
import { colors } from '../config/theme';

const { width } = Dimensions.get('window');

const OnboardingScreen = ({ navigation }) => {
  const animationRef = useRef(null);
  const [slide, setSlide] = useState(0);
  const [animationSource, setAnimationSource] = useState(null);
  const { fetchTranslations, translate } = useContext(SepetContext);
  const { language, setLanguage, kur, setKur } = useContext(SepetContext);
  const [isFirstLaunch, setIsFirstLaunch] = useState(null);

  useEffect(() => {
    navigation.replace('AnaNav');//geçici

    // const checkFirstLaunch = async () => {

    //   const value = await AsyncStorage.getItem('isFirstLaunch');

    //    if (value === null) {
    //           setAnimationSource(require('../assets/animations/splash.mp4'));
    //   } else {
    //     navigation.replace('AnaNav');
    //   }
    // };

    // checkFirstLaunch();


  }, []);


  const handleEnd = async () => {

    navigation.replace('AnaNav');
  };




  const finishOnboarding = async () => {
    await AsyncStorage.setItem('isFirstLaunch', 'false');
    navigation.replace('AnaNav');
  };

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.textSecondary} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipButton: {
    position: 'absolute',
    top: 50,
    right: 15,
    padding: 10,
  },
  skipText: {
    color: colors.textSecondary,
    fontSize: 16,
  },
});

export default OnboardingScreen;
