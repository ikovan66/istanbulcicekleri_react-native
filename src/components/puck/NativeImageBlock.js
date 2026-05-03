import React from 'react';
import { View, Dimensions, TouchableOpacity } from 'react-native';
import FastImage from 'react-native-fast-image';
import { useNavigation } from '@react-navigation/native';
import IkostScalableImage from '../IkostScalableImage';
import { navigatePuckLink } from './PuckLinkResolver';

const windowWidth = Dimensions.get('window').width;

/**
 * NativeImageBlock — Full-width banner image with optional link
 * Maps to Puck: ImageBlock, BannerCountdown_Home5
 */
const NativeImageBlock = ({ image, mobileImage, alt, link, maxWidth, borderRadius }) => {
  const navigation = useNavigation();
  const imgUrl = mobileImage || image;

  if (!imgUrl) return null;

  const handlePress = () => {
    if (link) {
      navigatePuckLink(link, navigation);
    }
  };

  const content = (
    <IkostScalableImage
      width={windowWidth}
      source={{
        uri: imgUrl,
        priority: FastImage.priority.high,
      }}
      resizeMode={FastImage.resizeMode.contain}
    />
  );

  if (link) {
    return (
      <TouchableOpacity onPress={handlePress} activeOpacity={0.9}>
        {content}
      </TouchableOpacity>
    );
  }

  return <View>{content}</View>;
};

export default NativeImageBlock;
