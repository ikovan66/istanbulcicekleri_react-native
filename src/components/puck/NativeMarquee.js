import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet, Dimensions } from 'react-native';

const screenWidth = Dimensions.get('window').width;

/**
 * NativeMarquee — Scrolling text banner
 * Maps to Puck: Marquee_Home1
 */
const NativeMarquee = ({ items }) => {
  const scrollX = useRef(new Animated.Value(0)).current;

  if (!items || items.length === 0) return null;

  const fullText = items.map(i => i.text).join('     •     ');
  // Approximate total width for animation
  const totalWidth = fullText.length * 8;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(scrollX, {
        toValue: -totalWidth,
        duration: totalWidth * 30, // Speed: ~30ms per pixel
        useNativeDriver: true,
      })
    );
    animation.start();
    return () => animation.stop();
  }, [totalWidth]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.textRow,
          { transform: [{ translateX: scrollX }] },
        ]}
      >
        <Text style={styles.text}>{fullText}     •     {fullText}</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: '#f8f8f8',
    paddingVertical: 12,
  },
  textRow: {
    flexDirection: 'row',
    width: screenWidth * 10,
  },
  text: {
    fontFamily: 'NunitoSans-Regular',
    fontSize: 13,
    color: '#333',
  },
});

export default NativeMarquee;
