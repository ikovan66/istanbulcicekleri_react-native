import React, { useRef, useEffect, useState } from 'react';
import { StyleSheet, ActivityIndicator, View } from 'react-native';
import Video from 'react-native-video';
import { colors } from '../config/theme';
//import convertToProxyURL from 'react-native-video-cache-control';

const VideoItem = ({ uri, index, isActive, onEnd }) => {
  const videoRef = useRef(null);
  const [proxyUri, setProxyUri] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // const setupStreamingUri = async () => { 
    //   const cachedUri = convertToProxyURL({ url: uri });
    //   setProxyUri(cachedUri);
    //   setLoading(false);
    // };

    // setupStreamingUri();
  }, [uri]);

  const handleLoad = () => {
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      {loading && (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.white} />
        </View>
      )}
      <Video
        ref={videoRef}
        source={{ uri: proxyUri }}
        style={styles.video}
        resizeMode="cover"
        paused={!isActive}
        muted={true}
        controls={false}
        onEnd={() => onEnd(index)}
        repeat={true}
        onLoad={handleLoad}
        bufferConfig={{
          minBufferMs: 1500,
          maxBufferMs: 5000,
          bufferForPlaybackMs: 500,
          bufferForPlaybackAfterRebufferMs: 1000,
        }}
      />
    </View>
  );
};

export default VideoItem;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  video: {
    width: '100%',
    height: '100%',
  },
  loading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
});