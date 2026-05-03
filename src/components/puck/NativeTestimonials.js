import React from 'react';
import { View, Text, FlatList, StyleSheet, Dimensions } from 'react-native';
import FastImage from 'react-native-fast-image';

const screenWidth = Dimensions.get('window').width;

/**
 * NativeTestimonials — Customer review cards carousel
 * Maps to Puck: Testimonials_MultiBrand
 */
const NativeTestimonials = ({ heading, testimonials }) => {
  if (!testimonials || testimonials.length === 0) return null;

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      {item.imgSrc ? (
        <FastImage
          style={styles.avatar}
          source={{ uri: item.imgSrc, priority: FastImage.priority.low }}
          resizeMode={FastImage.resizeMode.cover}
        />
      ) : null}
      <Text style={styles.reviewText} numberOfLines={4}>{item.text}</Text>
      <Text style={styles.reviewerName}>{item.name}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {heading && heading.trim() ? (
        <Text style={styles.heading}>{heading.trim()}</Text>
      ) : null}
      <FlatList
        horizontal
        data={testimonials}
        renderItem={renderItem}
        keyExtractor={(item, index) => `review-${index}`}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        snapToInterval={screenWidth * 0.75 + 15}
        decelerationRate="fast"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
  },
  heading: {
    fontFamily: 'NunitoSans-Bold',
    fontSize: 18,
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 12,
    marginHorizontal: 15,
  },
  listContent: {
    paddingHorizontal: 15,
  },
  card: {
    width: screenWidth * 0.75,
    backgroundColor: '#fafafa',
    borderRadius: 12,
    padding: 16,
    marginRight: 15,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: 10,
  },
  reviewText: {
    fontFamily: 'NunitoSans-Regular',
    fontSize: 13,
    color: '#444',
    lineHeight: 19,
    marginBottom: 8,
  },
  reviewerName: {
    fontFamily: 'NunitoSans-SemiBold',
    fontSize: 13,
    color: '#1a1a1a',
  },
});

export default NativeTestimonials;
