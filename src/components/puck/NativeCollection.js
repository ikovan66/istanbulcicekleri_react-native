import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import FastImage from 'react-native-fast-image';
import { useNavigation } from '@react-navigation/native';
import { navigatePuckLink } from './PuckLinkResolver';

const screenWidth = Dimensions.get('window').width;

/**
 * NativeCollection — Full-width banner with overlay text
 * Maps to Puck: Collection_MultiBrand
 */
const NativeCollection = ({ imgSrc, imgAlt, heading, description, buttonText, link }) => {
  const navigation = useNavigation();

  if (!imgSrc) return null;

  const handlePress = () => {
    if (link) {
      navigatePuckLink(link, navigation);
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.9}
    >
      <FastImage
        style={styles.image}
        source={{ uri: imgSrc, priority: FastImage.priority.normal }}
        resizeMode={FastImage.resizeMode.cover}
      />
      <View style={styles.overlay}>
        {heading ? <Text style={styles.heading} numberOfLines={3}>{heading}</Text> : null}
        {description ? <Text style={styles.description} numberOfLines={4}>{description}</Text> : null}
        {buttonText ? (
          <View style={styles.button}>
            <Text style={styles.buttonText}>{buttonText}</Text>
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 15,
    marginVertical: 10,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
  },
  image: {
    width: screenWidth - 30,
    height: (screenWidth - 30) * 0.6,
  },
  overlay: {
    padding: 16,
  },
  heading: {
    fontFamily: 'NunitoSans-Bold',
    fontSize: 18,
    color: '#1a1a1a',
    marginBottom: 8,
  },
  description: {
    fontFamily: 'NunitoSans-Regular',
    fontSize: 13,
    color: '#666',
    lineHeight: 19,
  },
  button: {
    marginTop: 12,
    backgroundColor: '#1a1a1a',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  buttonText: {
    color: 'white',
    fontFamily: 'NunitoSans-SemiBold',
    fontSize: 13,
  },
});

export default NativeCollection;
