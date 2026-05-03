import React from 'react';
import { View, StyleSheet } from 'react-native';

const SolOk = React.memo(function SolOk(props) {
    return (
    <View style={[styles.angleRight]}>
        <View style={[styles.angleLineHorizontal,props.style]} />
        <View style={[styles.angleLineVertical,props.style]} />
    </View>
  );
});


const styles = StyleSheet.create({
    angleRight: {
        width: 24,
        height: 24,
        justifyContent: 'flex-end',
        alignItems: 'flex-end',
        position: 'relative',
        transform: [{ rotate: '135deg'}],

    },
    angleLineHorizontal: {
        width: 12, // Uzunluğunu artırdım
        height: 1,
        position: 'absolute',
        transform: [{ translateY: 0 }], // Yatay çizgiyi ortala
    },
    angleLineVertical: {
        width: 1,
        height: 12, // Uzunluğunu artırdım
        position: 'absolute',
        transform: [{ translateX: 0}], // Dikey çizgiyi ortala
    }
});

export default SolOk;
