import React, { useContext } from 'react';
import { View, TouchableOpacity, Image, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MahalleSec from '../components/MahalleSec';
import stylesglobal from '../stylesglobal';
import { useNavigation } from '@react-navigation/native';
import { SepetContext } from '../components/SepetContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { colors } from '../config/theme';

const MahalleAra = () => {
    const navigation = useNavigation();
    const { secilenMahItem } = useContext(SepetContext);

    const handleBack = () => {
        navigation.goBack();
    };

    const handleSelection = (itemJson) => {
        // MahalleSec converts item to string before passing to onCommand
        // We can just go back when a selection occurs
        // But verify if it's a valid selection (not null reset)
        if (itemJson) {
            navigation.goBack();
        }
    };

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaView style={[stylesglobal.SafeAreaCSS, { backgroundColor: colors.white }]}>
                <View style={styles.headerContainer}>
                    <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                        <Image
                            source={require('../assets/images/arrow-small-left.png')}
                            style={{ width: 15, height: 30 }}
                        />
                    </TouchableOpacity>
                    <View style={{ flex: 1 }}>
                        {/* Pass focusmu=true so it focuses input immediately */}
                        <MahalleSec onCommand={handleSelection} focusmu={true} notcat={true} />
                    </View>
                </View>
                {/* If we want to show something when no search results, e.g. saved addresses (handled by MahalleSec internally with notcat=true) */}
            </SafeAreaView>
        </GestureHandlerRootView>
    );
};

const styles = StyleSheet.create({
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start', // Align to top
        paddingHorizontal: 10,
        paddingTop: 10,
    },
    backButton: {
        padding: 5,
        paddingRight: 10,
        marginTop: 5 // Adjust alignment with the input box in MahalleSec
    }
});

export default MahalleAra;
