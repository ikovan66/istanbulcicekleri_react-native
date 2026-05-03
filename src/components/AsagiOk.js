import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../config/theme';

const AsagiOk = React.memo(function AsagiOk(props) {
    return (
    <View style={[styles.angleRight, props.style]}>
        <View style={styles.angleLineHorizontal} />
        <View style={styles.angleLineVertical} />
    </View>
  );
});


const styles = StyleSheet.create({
    angleRight: {
        width: 8,
        height: 8,
        justifyContent: 'flex-end',
        alignItems: 'flex-end',
        position: 'relative',
        transform: [{ rotate: '45deg'}],
        marginTop:-8,

    },
    angleLineHorizontal: {
        width: 8, // Uzunluğunu artırdım
        height: 1.5,
        backgroundColor: colors.black,
        position: 'absolute',
        transform: [{ translateY: 0 }], // Yatay çizgiyi ortala
    },
    angleLineVertical: {
        width: 1.5,
        height: 8, // Uzunluğunu artırdım
        backgroundColor: colors.black,
        position: 'absolute',
        transform: [{ translateX: 0}], // Dikey çizgiyi ortala
    }
});

export default AsagiOk;
