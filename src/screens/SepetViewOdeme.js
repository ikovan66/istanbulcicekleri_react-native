import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, Button, ScrollView, Switch, StyleSheet, Alert } from 'react-native';
import IkostTextInput from '../components/IkostTextInput';
import { ikostalert } from '../GlobalAlert';
import { colors } from '../config/theme';

const SepetViewOdeme = () => {
  const [isVisibleHavale, setIsVisibleHavale] = useState(false);
  const [isVisibleCreditCard, setIsVisibleCreditCard] = useState(true);
  const [secilenccID, setSecilenccID] = useState(-1);
  const [sozlesmeOnaylandi, setSozlesmeOnaylandi] = useState(false);
  const [havale, setHavale] = useState(false);
  const [ad, setAd] = useState('');
  const [kartNo, setKartNo] = useState('');
  const [tarihAy, setTarihAy] = useState('');
  const [tarihYil, setTarihYil] = useState('');
  const [ccv, setCcv] = useState('');

  const handleHavaleTab = () => {
    setIsVisibleHavale(true);
    setIsVisibleCreditCard(false);
    setHavale(true);
  };

  const handleCreditCardTab = () => {
    setIsVisibleHavale(false);
    setIsVisibleCreditCard(true);
    setHavale(false);
  };

  const handleSozlesmeOnay = () => {
    setSozlesmeOnaylandi(!sozlesmeOnaylandi);
  };

  const handleOdemeTamamla = () => {
    if (!sozlesmeOnaylandi) {
      ikostalert("Sözleşmeyi Onaylamalısınız", "Lütfen sözleşmeyi onaylayınız.");
    } else if (ad === '' || kartNo === '' || tarihAy === '' || tarihYil === '' || ccv === '') {
      ikostalert("Eksik Bilgiler", "Lütfen tüm alanları doldurunuz.");
    } else {
      // Ödeme işlemi yapılabilir.
      ikostalert("Başarılı", "Ödeme tamamlandı.");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => { /* Geriye gitme işlemi */ }}>
          <Image
            source={require('../assets/images/left_big.png')}
            style={{ width: 9.78, height: 19.21 }}
          /></TouchableOpacity>
        <Text style={styles.headerTitle}>Ödeme</Text>
        <View style={styles.headerRight}>
          <View style={styles.rating}>
            <Text style={styles.ratingText}>5/5</Text>
          </View>
        </View>
      </View>

      {/* Tab bar */}
      <View style={styles.tabContainer}>
        <Button title="Kredi Kartı" onPress={handleCreditCardTab} />
        <Button title="Havale/Eft" onPress={handleHavaleTab} />
      </View>

      {/* Kredi Kartı Ödeme Bölümü */}
      {isVisibleCreditCard && (
        <View style={styles.cardPaymentContainer}>
          <IkostTextInput
            style={styles.input}
            placeholder="Kart Sahibinin Adı Soyadı"
            value={ad}
            onChangeText={setAd}
          />
          <IkostTextInput
            style={styles.input}
            placeholder="Kart Numarası"
            keyboardType="numeric"
            value={kartNo}
            onChangeText={setKartNo}
          />
          <View style={styles.dateCcvContainer}>
            <IkostTextInput
              style={styles.dateInput}
              placeholder="Ay"
              keyboardType="numeric"
              value={tarihAy}
              onChangeText={setTarihAy}
              maxLength={2}
            />
            <IkostTextInput
              style={styles.dateInput}
              placeholder="Yıl"
              keyboardType="numeric"
              value={tarihYil}
              onChangeText={setTarihYil}
              maxLength={4}
            />
            <IkostTextInput
              style={styles.ccvInput}
              placeholder="CCV"
              keyboardType="numeric"
              value={ccv}
              onChangeText={setCcv}
              maxLength={4}
            />
          </View>

          <View style={styles.sozlesmeContainer}>
            <Switch value={sozlesmeOnaylandi} onValueChange={handleSozlesmeOnay} trackColor={{ false: "gray", true: "#e7cdb2" }}
              thumbColor={"#f4f3f4"} />
            <TouchableOpacity onPress={handleSozlesmeOnay}>
              <Text>Ön Bilgilendirme Formu ve Mesafeli Satış Sözleşmesini okudum ve onaylıyorum.</Text>
            </TouchableOpacity>
          </View>

          <Button title="Siparişi Tamamla" onPress={handleOdemeTamamla} />
        </View>
      )}

      {/* Havale/Eft Ödeme Bölümü */}
      {isVisibleHavale && (<View style={styles.havaleContainer}><Text>IBAN 1: TR94 0006 2001 5720 0006 2995 64</Text><Text>IBAN 2: TR06 0004 6000 0488 8000 2340 87</Text></View>)}

      {/* Toplam ve Devam Butonu */}
      <View style={styles.totalContainer}>
        <Text style={styles.totalLabel}>TOPLAM</Text>
        <Text style={styles.totalValue}>0 TL</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.white,
  },
  headerIcon: {
    width: 20,
    height: 20,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    textAlign: 'center',
  },
  headerRight: {
    width: 55,
  },
  rating: {
    backgroundColor: '#E8ECEB',
    padding: 8,
    borderRadius: 15,
  },
  ratingText: {
    fontSize: 12,
    textAlign: 'center',
    color: colors.primary,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
  },
  cardPaymentContainer: {
    padding: 20,
  },
  input: {
    borderColor: '#e2dbd7',
    borderWidth: 1,
    padding: 10,
    marginVertical: 10,
  },
  dateCcvContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateInput: {
    width: '30%',
    borderColor: '#e2dbd7',
    borderWidth: 1,
    padding: 10,
    marginVertical: 10,
  },
  ccvInput: {
    width: '30%',
    borderColor: '#e2dbd7',
    borderWidth: 1,
    padding: 10,
    marginVertical: 10,
  },
  sozlesmeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  havaleContainer: {
    padding: 20,
    backgroundColor: colors.white,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: colors.white,
  },
  totalLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  totalValue: {
    fontSize: 24,
  },
});

export default SepetViewOdeme;