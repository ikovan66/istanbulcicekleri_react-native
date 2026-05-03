import React, { useContext } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import DynamicIcon from './DynamicIcon';
import { SepetContext } from './SepetContext';
import { colors } from '../config/theme';

const AdresSecimBar = ({ onPress }) => {
    const { secilenMahItem, translate } = useContext(SepetContext);

    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.8}
            style={{
                marginHorizontal: 15,
                marginBottom: 10,
                marginTop: 5,
            }}>
            {secilenMahItem ? (
                <View style={{
                    flexDirection: 'row',
                    backgroundColor: colors.primary,
                    borderRadius: 25,
                    alignItems: 'center',
                    paddingVertical: 15,
                    paddingHorizontal: 10
                }}>
                    <View style={{ marginLeft: 5 }}>
                        <DynamicIcon name="place" size={20} color={colors.white} />
                    </View>
                    <Text style={{ flex: 1, paddingHorizontal: 10, fontSize: 13, color: 'white', fontFamily: 'NunitoSans-SemiBold' }} numberOfLines={1}>
                        {secilenMahItem.description || (secilenMahItem.adsoyad ? `${secilenMahItem.adsoyad}, ${secilenMahItem.adres}, ${secilenMahItem.mahalle}, ${secilenMahItem.ilce}/${secilenMahItem.il}` : '')}
                    </Text>
                    <View style={{
                        borderRadius: 12,
                        padding: 4
                    }}>
                        <DynamicIcon name="arrow-down" size={10} color="white" />
                    </View>
                </View>
            ) : (
                <View style={{
                    flexDirection: 'row',
                    backgroundColor: colors.bgGray,
                    borderRadius: 25,
                    borderWidth: 1,
                    borderColor: '#e0e0e0',
                    alignItems: 'center',
                    paddingVertical: 15,
                    paddingHorizontal: 10
                }}>
                    <View style={{ marginLeft: 5 }}>
                        <DynamicIcon name="place" size={20} color="#666" />
                    </View>
                    <Text style={{ flex: 1, paddingHorizontal: 10, fontSize: 13, color: '#666', fontFamily: 'NunitoSans-Regular' }}>{translate('Gönderim Yeri Seçin')}</Text>
                    <View style={{ borderRadius: 12, padding: 4 }}>
                        <DynamicIcon name="arrow-down" size={10} color="#666" />
                    </View>
                </View>
            )}
        </TouchableOpacity>
    );
};

export default AdresSecimBar;
