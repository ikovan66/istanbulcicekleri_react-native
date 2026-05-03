import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

const starFull = require('../assets/images/star-full.png');
const starHalf = require('../assets/images/star-half.png');
const starEmpty = require('../assets/images/star-bos.png');

const RatingStars = ({ rating, size = 15 }) => { 
  const stars = [];

  for (let i = 1; i <= 5; i++) {
    if (rating >= i) {
      stars.push(<Image key={i} source={starFull} style={{ width: size, height: size }} />);
    } else if (rating >= i - 0.5) {
      stars.push(<Image key={i} source={starHalf} style={{ width: size, height: size }} />);
    } else {
      stars.push(<Image key={i} source={starEmpty} style={{ width: size, height: size }} />);
    }
  }

  return <View style={styles.container}>{stars}</View>;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row', 
    alignItems: 'center',
  },
});

export default RatingStars;