import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Dimensions, ScrollView } from 'react-native';
import IkostButton from './IkostButton';
import { colors } from '../config/theme';

const ExpiredSlotModal = ({
    visible,
    onRemoveItem,
    onCancel,
    // New multi-slot props
    availableSlots = [],
    availableDay = null,
    selectedSlotIndex = null,
    onSlotSelect,
    onConfirmSlot,
    isLoading = false,
    // Backward compat
    onSelectNextSlot,
    nextSlotAvailable,
    suggestedSlotText,
    showCancel = true,
    title = "Süre Doldu",
    message = "Seçtiğiniz saat aralığı için sipariş süresi dolmuştur."
}) => {
    const hasSlots = availableSlots.length > 0;
    const dayLabel = availableDay?.dayLabel || '';
    const dateString = availableDay?.dateString || '';

    const handleConfirm = () => {
        if (selectedSlotIndex !== null && onConfirmSlot) {
            onConfirmSlot(selectedSlotIndex);
        } else if (onSelectNextSlot) {
            onSelectNextSlot();
        }
    };

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={() => {
                if (showCancel && onCancel) onCancel();
            }}
        >
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    <Text style={styles.modalTitle}>{title}</Text>
                    <Text style={styles.modalText}>{message}</Text>

                    {hasSlots ? (
                        <>
                            <View style={styles.dayHeader}>
                                <View style={styles.dayBadge}>
                                    <Text style={styles.dayBadgeText}>{dayLabel}</Text>
                                </View>
                                <Text style={styles.dayDate}>{dateString}</Text>
                            </View>

                            <ScrollView style={styles.slotsContainer} nestedScrollEnabled>
                                {availableSlots.map((slot, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        style={[
                                            styles.slotItem,
                                            selectedSlotIndex === index && styles.slotItemSelected
                                        ]}
                                        onPress={() => onSlotSelect?.(index)}
                                        disabled={isLoading}
                                    >
                                        <View style={[
                                            styles.radioOuter,
                                            selectedSlotIndex === index && styles.radioOuterSelected
                                        ]}>
                                            {selectedSlotIndex === index && (
                                                <View style={styles.radioInner} />
                                            )}
                                        </View>
                                        <Text style={[
                                            styles.slotText,
                                            selectedSlotIndex === index && styles.slotTextSelected
                                        ]}>
                                            {slot.metin || ''}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>

                            <View style={styles.buttonContainer}>
                                <IkostButton
                                    title={isLoading ? "Güncelleniyor..." : "Seçilen Saati Onayla"}
                                    onPress={handleConfirm}
                                    containerStyle={styles.confirmButton}
                                    disabled={isLoading || selectedSlotIndex === null}
                                />
                                <TouchableOpacity
                                    style={[styles.button, styles.removeButton]}
                                    onPress={onRemoveItem}
                                    disabled={isLoading}
                                >
                                    <Text style={styles.removeButtonText}>Ürünü Sepetten Çıkar</Text>
                                </TouchableOpacity>
                            </View>
                        </>
                    ) : (
                        <>
                            <Text style={styles.modalTextSub}>
                                Uygun saat aralığı bulunamadı. Lütfen ürünü sepetten çıkarıp yeniden ekleyiniz.
                            </Text>
                            <View style={styles.buttonContainer}>
                                <TouchableOpacity
                                    style={[styles.button, styles.removeButton]}
                                    onPress={onRemoveItem}
                                    disabled={isLoading}
                                >
                                    <Text style={styles.removeButtonText}>Ürünü Sepetten Çıkar</Text>
                                </TouchableOpacity>
                            </View>
                        </>
                    )}

                    {showCancel && (
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={onCancel}
                        >
                            <Text style={styles.cancelButtonText}>Vazgeç</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: 'rgba(0,0,0,0.5)'
    },
    modalView: {
        margin: 20,
        backgroundColor: "white",
        borderRadius: 20,
        padding: 25,
        alignItems: "center",
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        width: Dimensions.get('window').width * 0.9,
        maxHeight: Dimensions.get('window').height * 0.8,
    },
    modalTitle: {
        fontSize: 18,
        fontFamily: 'NunitoSans-Bold',
        marginBottom: 8,
        color: '#e64e41'
    },
    modalText: {
        marginBottom: 15,
        textAlign: "center",
        fontSize: 15,
        fontFamily: 'NunitoSans-Regular',
        color: colors.textDark
    },
    modalTextSub: {
        marginBottom: 20,
        textAlign: "center",
        fontSize: 14,
        fontFamily: 'NunitoSans-Regular',
        color: '#666'
    },
    dayHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        width: '100%',
    },
    dayBadge: {
        backgroundColor: colors.primary,
        borderRadius: 8,
        paddingVertical: 4,
        paddingHorizontal: 12,
        marginRight: 10,
    },
    dayBadgeText: {
        color: 'white',
        fontFamily: 'NunitoSans-Bold',
        fontSize: 13,
    },
    dayDate: {
        fontFamily: 'NunitoSans-Regular',
        fontSize: 14,
        color: colors.textDark,
    },
    slotsContainer: {
        maxHeight: 220,
        width: '100%',
        marginBottom: 15,
    },
    slotItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        marginBottom: 6,
        backgroundColor: '#fafafa',
    },
    slotItemSelected: {
        borderColor: colors.primary,
        backgroundColor: '#FFF8F2',
    },
    radioOuter: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#ccc',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    radioOuterSelected: {
        borderColor: colors.primary,
    },
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: colors.primary,
    },
    slotText: {
        fontFamily: 'NunitoSans-Regular',
        fontSize: 15,
        color: colors.textDark,
    },
    slotTextSelected: {
        fontFamily: 'NunitoSans-Bold',
        color: colors.primary,
    },
    buttonContainer: {
        width: '100%',
        gap: 8,
    },
    confirmButton: {
        width: '100%',
        marginBottom: 5,
    },
    button: {
        borderRadius: 10,
        padding: 12,
        width: '100%',
        alignItems: 'center'
    },
    removeButton: {
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: '#e64e41',
    },
    removeButtonText: {
        color: "#e64e41",
        fontFamily: 'NunitoSans-Bold',
        textAlign: "center"
    },
    cancelButton: {
        padding: 10,
        alignItems: 'center',
        marginTop: 5,
    },
    cancelButtonText: {
        color: "#666",
        fontSize: 14,
        fontFamily: 'NunitoSans-Regular',
    }
});

export default ExpiredSlotModal;
