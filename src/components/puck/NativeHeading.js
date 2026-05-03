import React from 'react';
import { Text, StyleSheet } from 'react-native';

/**
 * NativeHeading — Simple heading text
 * Maps to Puck: Heading_Basic
 */
const NativeHeading = ({ text, level, align, color, marginBottom }) => {
  if (!text || !text.trim()) return null;

  const fontSize = level === 'h1' ? 22 : level === 'h2' ? 18 : 16;
  const fontFamily = level === 'h1' || level === 'h2' ? 'NunitoSans-Bold' : 'NunitoSans-SemiBold';

  return (
    <Text
      style={[
        styles.heading,
        {
          fontSize,
          fontFamily,
          textAlign: align || 'left',
          color: color || '#1a1a1a',
          marginBottom: marginBottom ? parseInt(marginBottom) || 16 : 16,
        },
      ]}
    >
      {text}
    </Text>
  );
};

const styles = StyleSheet.create({
  heading: {
    marginHorizontal: 15,
    marginTop: 10,
  },
});

export default NativeHeading;
