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

const IkostBottomSheetMahalle = ({
  visible = false,
  onClose = () => { },
  height = 500,  // Klavye kapalıyken normal sheet yüksekliği
  onKeyboardViewHeight = 500, // Klavye açıkken kullanılacak yükseklik
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

      <View
        style={{ flex: 1, height: getTargetHeight() }}


      >
        {children}
      </View>

    </View>
  );
};

export default IkostBottomSheetMahalle;

const styles = StyleSheet.create({
  absoluteContainer: {
    position: 'absolute',
    backgroundColor: 'white',
    left: 0,
    right: 0,
    top: 0,
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