import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../config/theme';

const SagOk = React.memo(function SagOk(props) {
  return (
    <View style={[styles.angleRight]}>
        <View style={[styles.angleLineHorizontal,props.style]} />
        <View style={[styles.angleLineVertical,props.style]} />
    </View>
   );
});


const styles = StyleSheet.create({
    angleRight: {
        width: 20,
        height: 20,
        justifyContent: 'flex-end',
        alignItems: 'flex-end',
        position: 'relative',
        transform: [{ rotate: '-45deg'}],

    },
    angleLineHorizontal: {
        width: 12, // Uzunluğunu artırdım
        height: 1,
        backgroundColor: colors.textSecondary, 
        position: 'absolute',
        transform: [{ translateY: 0 }], // Yatay çizgiyi ortala
    },
    angleLineVertical: {
        width: 1,
        height: 12, // Uzunluğunu artırdım
        backgroundColor: colors.textSecondary,
        position: 'absolute',
        transform: [{ translateX: 0}], // Dikey çizgiyi ortala
    }
});

export default SagOk;
