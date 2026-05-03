import API_CONFIG from '../config/apiConfig';
import React, { useContext, useState, useEffect } from 'react';
import { View, Linking, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AnaFooter from '../components/AnaFooter';
import stylesglobal from '../stylesglobal';
import axios from 'axios';
import HeaderleftComp from '../components/HeaderleftComp';
import IkostButton from '../components/IkostButton';
import { WebView } from 'react-native-webview';
import { SepetContext } from '../components/SepetContext';
import { colors } from '../config/theme';
import LottieView from 'lottie-react-native';

const BizeContact = ({ navigation, route }) => {
  const { translate } = useContext(SepetContext);
  const [contactInfo, setContactInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchContactInfo = async () => {
      try {
        const response = await axios.get(`${API_CONFIG.frontendApi}/api/app-contact`);
        setContactInfo(response.data);
      } catch (error) {
        console.log('Contact info fetch error:', error);
        // Fallback to hardcoded values
        setContactInfo({
          phone: '',
          email: API_CONFIG.appEmail || '',
          address: '',
          workingHours: '',
          whatsappNumber: '',
          googleMapsEmbed: '',
          googleMapsLink: '',
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchContactInfo();
  }, []);

  const getMapHtml = (embedUrl) => {
    if (!embedUrl) return '';
    return `
    <html>
      <head>
        <meta name="viewport" content="initial-scale=1.0, maximum-scale=1.0">
        <style>html,body {margin: 0; padding: 0; height: 100%;} iframe {width: 100%; height: 100%; border: 0;}</style>
      </head>
      <body>
        <iframe src="${embedUrl}" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
      </body>
    </html>`;
  };

  if (isLoading) {
    return (
      <SafeAreaView style={stylesglobal.SafeAreaCSS}>
        <View style={stylesglobal.headerCustom}>
          <HeaderleftComp title={translate("İletişim Bilgilerimiz")} />
        </View>
        <View style={stylesglobal.loaderview}>
          <LottieView source={require('../assets/animations/yukleme_ani.json')} autoPlay loop style={stylesglobal.loading} />
        </View>
      </SafeAreaView>
    );
  }

  const phone = contactInfo?.phone || '';
  const email = contactInfo?.email || '';
  const address = contactInfo?.address || '';
  const workingHours = contactInfo?.workingHours || '';
  const googleMapsEmbed = contactInfo?.googleMapsEmbed || '';
  const googleMapsLink = contactInfo?.googleMapsLink || '';
  const whatsappNumber = contactInfo?.whatsappNumber || '';

  return (
    <SafeAreaView style={stylesglobal.SafeAreaCSS}>
      <View style={stylesglobal.headerCustom}>
        <HeaderleftComp title={translate("İletişim Bilgilerimiz")} />
      </View>
      <View style={stylesglobal.container}>
        <ScrollView style={{ flex: 1 }}>
          <View style={styles.orderBlock}>

            {email ? (<>
              <View style={styles.title}>
                <Text style={styles.titlelabel}>{translate('E-posta')}</Text>
              </View>
              <TouchableOpacity style={styles.row1} onPress={() => Linking.openURL(`mailto:${email}`)}>
                <Text style={styles.titlelabel2}>{email}</Text>
              </TouchableOpacity>
            </>) : null}

            {phone ? (<>
              <View style={styles.title}>
                <Text style={styles.titlelabel}>{translate('Telefon')}</Text>
              </View>
              <TouchableOpacity style={styles.row1} onPress={() => Linking.openURL(`tel:${phone.replace(/\s/g, '')}`)}>
                <Text style={styles.titlelabel2}>{phone}</Text>
              </TouchableOpacity>
            </>) : null}

            {address ? (<>
              <View style={styles.title}>
                <Text style={styles.titlelabel}>{translate('Adres')}</Text>
              </View>
              <View style={styles.row1}>
                <Text style={styles.titlelabel2}>{address}</Text>
              </View>
            </>) : null}

            {workingHours ? (<>
              <View style={styles.title}>
                <Text style={styles.titlelabel}>{translate('Çalışma Saatleri')}</Text>
              </View>
              <View style={styles.row1}>
                <Text style={styles.titlelabel2}>{workingHours}</Text>
              </View>
            </>) : null}

            <View style={styles.row1center}>
              <TouchableOpacity
                onPress={() => navigation.navigate('BizeYazinNav')}
                style={{
                  padding: 10, paddingHorizontal: 15,
                  backgroundColor: colors.primary, borderRadius: 6,
                  alignSelf: 'center'
                }}
              >
                <Text style={{
                  textAlign: 'center', color: 'white', fontSize: 12,
                }}>{translate('Bize Yazın')}</Text>
              </TouchableOpacity>
            </View>

            {googleMapsLink ? (
              <TouchableOpacity
                style={{ paddingHorizontal: 15, paddingVertical: 8 }}
                onPress={() => Linking.openURL(googleMapsLink)}
              >
                <Text style={{ color: colors.primary, fontSize: 13, fontFamily: 'NunitoSans-Bold' }}>
                  {translate('Haritada Aç')} ↗
                </Text>
              </TouchableOpacity>
            ) : null}

            {googleMapsEmbed ? (
              <View style={{ flex: 1, minHeight: 300 }}>
                <WebView
                  source={{ html: getMapHtml(googleMapsEmbed) }}
                  style={{ flex: 1 }}
                  incognito={true}
                  cacheEnabled={false}
                />
              </View>
            ) : null}

          </View>
        </ScrollView>

        <View style={stylesglobal.footer}>
          <AnaFooter parametre={'Hesabım'} navigation={navigation} />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  orderBlock: {
    backgroundColor: colors.white,
    flex: 1
  },
  title: {
    backgroundColor: colors.background,
    height: 35, justifyContent: 'center',
    paddingLeft: 20,
  },
  titlelabel: {
    fontFamily: "NunitoSans-Bold", color: 'black',
    fontSize: 13, letterSpacing: 1.3,
  },
  titlelabel2: {
    fontFamily: "NunitoSans-Regular", color: 'black',
    fontSize: 13, letterSpacing: 1.3,
  },
  row1: {
    flexDirection: 'row',
    marginBottom: 2,
    margin: 10,
    backgroundColor: 'white',
    padding: 15, paddingVertical: 10,
  },
  row1center: {
    flexDirection: 'row',
    marginBottom: 2,
    alignItems: 'center',
    padding: 15, paddingVertical: 10,
    backgroundColor: 'white',
    justifyContent: 'center', alignContent: 'center'
  },
});

export default BizeContact;