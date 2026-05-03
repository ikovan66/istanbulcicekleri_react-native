import React, { useContext, useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, Text } from 'react-native';
import LottieView from 'lottie-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GestureHandlerRootView, PanGestureHandler, State } from 'react-native-gesture-handler';
import * as RNLocalize from 'react-native-localize';
import { SepetContext } from '../components/SepetContext';
import { colors } from '../config/theme';

const { width } = Dimensions.get('window');

const OnboardingScreen = ({ navigation }) => {
  const animationRef = useRef(null);
  const [slide, setSlide] = useState(0);
  const [animationSource, setAnimationSource] = useState(null);
  const { fetchTranslations, translate } = useContext(SepetContext);
  const { language, setLanguage, kur, setKur } = useContext(SepetContext);
  const [isFirstLaunch, setIsFirstLaunch] = useState(null);

  const frames = [
    { start: 0, end: 212 },
    { start: 250, end: 412 },
    { start: 450, end: 612 },
  ];



  useEffect(() => {

    const checkFirstLaunch = async () => {
      
      const locales = await RNLocalize.getLocales();

        if (locales.length > 0 && locales[0].languageCode != 'tr') {
   console.log(locales[0].languageCode);
          await setLanguage("EN");
          await setKur("USD");
        }

      const value = await AsyncStorage.getItem('isFirstLaunch');

       if (value === null) {
            if (locales.length > 0 && locales[0].languageCode === 'tr') {
              setAnimationSource(require('../assets/animations/onboarding_tr.json'));
            } else {
              setAnimationSource(require('../assets/animations/onboarding_eng.json'));
        }
      } else {
        navigation.replace('AnaNav');

      }
    };

    checkFirstLaunch();


  }, []);

  useEffect(() => {
    animationSource && animationRef.current.play(frames[0].start, frames[0].end);

  }, [animationSource]);

  const handleGesture = async ({ nativeEvent }) => {
    if (nativeEvent.state === State.END) {
      if (nativeEvent.translationX < -30) {
        if (slide < frames.length - 1) {
          setSlide(prev => prev + 1);
          animationRef.current.play(frames[slide + 1].start, frames[slide + 1].end);
        } else {
          finishOnboarding();
        }
      } else if (nativeEvent.translationX > 30) {
        if (slide > 0) {
          //
          await animationRef.current.play(frames[slide].end, frames[slide].start);
          setSlide(prev => prev - 1);
        }
      }
    }
  };

  const finishOnboarding = async () => {
    await AsyncStorage.setItem('isFirstLaunch', 'false');
    navigation.replace('AnaNav');
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <PanGestureHandler onHandlerStateChange={handleGesture}>
        <View style={{ flex: 1 }}>
          {animationSource && <LottieView
            ref={animationRef}
            source={animationSource}

            loop={false}
            style={{ width, flex: 1 }}
          />}
        </View>
      </PanGestureHandler>

      <TouchableOpacity style={styles.skipButton} onPress={finishOnboarding}>
        <Text style={styles.skipText}>ATLA</Text>
      </TouchableOpacity>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
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
