import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { colors } from '../config/theme';
import {
  View,
  TouchableOpacity,
  Animated,
  PanResponder,
  StyleSheet,
  Dimensions,
  Keyboard,
  ScrollView,
} from 'react-native';

const SCREEN_HEIGHT = Dimensions.get('window').height;

const BottomSheet = ({
  visible = false,
  onClose = () => {},
  height = 300,  // Klavye kapalıyken normal sheet yüksekliği
  onKeyboardViewHeight = 200, // Klavye açıkken kullanılacak yükseklik
  backgroundColor = 'rgba(0,0,0,0.5)', 
  sheetBackgroundColor = colors.white,
  radius = 10,
  children,
  hasDraggableIcon = true,
  dragIconColor = '#A3A3A3',
  dragIconStyle,
  draggable = true,
  closeThresholdRatio = 0.3, // sheet boyunun %30’una çekilince kapat
}) => {

  const animatedHeight = useRef(new Animated.Value(0)).current;
  const pan = useRef(new Animated.ValueXY()).current;
  const [isRendered, setIsRendered] = useState(visible);
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // Klavye event'larını dinleyelim
  useEffect(() => {
    const handleKeyboardShow = (e) => {
      setKeyboardOpen(true);
      setKeyboardHeight(e.endCoordinates?.height || 0);
    };
    const handleKeyboardHide = () => {
      setKeyboardOpen(false);
      setKeyboardHeight(0);
    };

    const showSub = Keyboard.addListener('keyboardDidShow', handleKeyboardShow);
    const hideSub = Keyboard.addListener('keyboardDidHide', handleKeyboardHide);

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // visible değiştiğinde açılış/kapanış animasyonu
  useEffect(() => {
    if (visible) {
      setIsRendered(true);
      Animated.timing(animatedHeight, {
        toValue: getTargetHeight(),
        duration: 300,
        useNativeDriver: false,
      }).start();
    } else {
      Animated.timing(animatedHeight, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start(({ finished }) => {
        if (finished) {
          setIsRendered(false);
          pan.setValue({ x: 0, y: 0 });
        }
      });
    }
  }, [visible]);

  // Klavye açılıp kapanınca sheet yüksekliğini güncelle
  useEffect(() => {
    if (visible) {
      Animated.timing(animatedHeight, {
        toValue: getTargetHeight(),
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  }, [keyboardOpen, keyboardHeight]);

  // Sheet sürükleme mantığı
  const panResponder = useMemo(() => {
    if (!draggable) return {};

    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        if (gestureState.dy > 0) {
          Animated.event([null, { dy: pan.y }], {
            useNativeDriver: false,
          })(evt, gestureState);
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        const gestureDistance = gestureState.dy;
        const gestureLimitArea = getTargetHeight() * closeThresholdRatio; 

        if (gestureDistance > gestureLimitArea) {
          onClose();
        } else {
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
          }).start();
        }
      },
    });
  }, [
    pan,
    draggable,
    closeThresholdRatio,
    onClose,
  ]);

  const sheetStyle = {
    height: animatedHeight,
    transform: pan.getTranslateTransform(),
  };

  // Klavye durumuna göre hedef yüksekliği hesapla
  const getTargetHeight = useCallback(() => {
    if (!keyboardOpen) {
      return height;
    } else {
      return onKeyboardViewHeight;
    }
  }, [keyboardOpen, height, onKeyboardViewHeight]);

  if (!isRendered) return null;

  return (
    <View style={styles.absoluteContainer} pointerEvents="box-none">
      <TouchableOpacity
        style={[styles.overlay, { backgroundColor }]}
        activeOpacity={1}
        onPress={onClose}
      />
      <Animated.View
        {...(draggable && panResponder.panHandlers)}
        style={[
          styles.sheetContainer,
          sheetStyle,
          {
            backgroundColor: sheetBackgroundColor,
            borderTopLeftRadius: radius,
            borderTopRightRadius: radius,
          },
        ]}
      >
        {hasDraggableIcon && (
          <View style={styles.draggableContainer}>
            <View
              style={[
                styles.draggableIcon,
                dragIconStyle,
                { backgroundColor: dragIconColor },
              ]}
            />
          </View>
        )}

        {/* ScrollView: Alt padding'i klavye yüksekliği kadar ayarlıyoruz */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            // Eğer klavye kapalıyken de biraz boşluk kalsın derseniz 
            // keyboardOpen ? keyboardHeight : 20 gibi bir koşullu kullanım da yapabilirsiniz.
            paddingBottom: keyboardHeight,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      </Animated.View>
    </View>
  );
};

export default BottomSheet;

const styles = StyleSheet.create({
  absoluteContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: 9999,
  },
  overlay: {
    flex: 1,
  },
  sheetContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    overflow: 'hidden',
  },
  draggableContainer: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 6,
  },
  draggableIcon: {
    width: 40,
    height: 6,
    borderRadius: 3,
  },
});