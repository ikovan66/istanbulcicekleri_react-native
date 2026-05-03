import React, { useContext } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import DynamicIcon from './DynamicIcon';
import { SepetContext } from './SepetContext';

export default function KalpIcon({ pid, widthB = 24, heightB = 24, paddingB = 5.5, paddingVerticalB = 6, borderRadiusB = 50, style }) {
  const navigation = useNavigation();
  const { favoriListesi, favToggle } = useContext(SepetContext);

  const isFill = favoriListesi && favoriListesi.some(item => String(item.id) === String(pid));

  return (
    <TouchableOpacity
      style={[{
        padding: paddingB,
        paddingVertical: paddingVerticalB,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: borderRadiusB,
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
      }, style]}
      onPress={() => favToggle(pid, navigation)}
    >
      <View>
        <DynamicIcon
          name={isFill ? 'heart-full' : 'heart'}
          size={Math.max(widthB, heightB)}
          color={isFill ? '#e74c3c' : '#2D3E50'}
        />
      </View>
    </TouchableOpacity>
  );
};
