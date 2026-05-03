import React, { useState, useEffect } from 'react';
import { View, Image,Text, StyleSheet } from 'react-native';
import IkostResim from '../components/IkostResim';
import { colors } from '../config/theme';

const StatusCircles = ({ status }) => {

  const [activeIndex, setactiveIndex] = useState(0);
  const [durumimg, setdurumimg] = useState('sip_durum_saat');
  function sipdurumText2(status) {
    var text = "";
    if (status === 12) {
      text = "Hazırlanıyor";
    } else if (status === 11) {
      text = "Yola Çıktı";
    }else if (status === 4) {
      text = "Onaylandı";
    }
    else if (status === 6) {
      text = "İptal";
    } else if (status === 2) {
      text = "Ödeme Bekliyor";
    } else if (status === 5) {
      text = "Teslim Edildi";
    }
return text;
  };
  function sipdurumText(status) {
    var text = "";
    if (status === 12) {
      text = "Hazırlanıyor";
    } else if (status === 11) {
      text = "Yola Çıktı";
    }else if (status === 4) {
      text = "Onaylandı";
    }
    else if (status === 6) {
      text = "İptal";
    } else if (status === 2) {
      text = "Ödeme Bekliyor";
    } else if (status === 5) {
      text = "Teslim Edildi";
    }
return text;
  };
  function sipdurumIMG(status) {
    var text = "";
    if (status === 12) {
      text = "Hazırlanıyor";
    } else if (status === 11) {
      text = "Yola Çıktı";
    }else if (status === 4) {
      text = "Onaylandı";
    }
    else if (status === 6) {
      text = "İptal";
    } else if (status === 2) {
      text = "Ödeme Bekliyor";
    } else if (status === 5) {
      text = "Teslim Edildi";
    }
return text;
  };

  const images = {
    6: require('../assets/images/sip_durum_iptal.png'),
    2: require('../assets/images/sip_durum_odeme_bekliyor.png'),
    4: require('../assets/images/sip_durum_saat.png'),
    12: require('../assets/images/sip_durum_hazirlaniyor.png'),
    11: require('../assets/images/sip_durum_yolda.png'),
    5: require('../assets/images/sip_durum_teslimedildi.png'),
  };

  
  useEffect(() => {
    const checkSiparis = async () => {

      if (status === 2 || status===4) {
        setactiveIndex(1);
      } else if (status === 12) {
        setactiveIndex(2);
      } else if (status === 11) {
        setactiveIndex(3);
      } else if (status === 5) {
        setactiveIndex(4);
      }

    };
    checkSiparis();
  }, []);
  const Circle111 = ({ isActive, sipstatus}) => (
    <View style={styles.durumContainer}>
      <IkostResim source={sipstatus==2?images[2]:images[4]}  height={25} style={[styles.circleIMG, isActive ? null : styles.passiveCircleIMG]} />
      <Text style={[styles.label, isActive ? styles.labelActive : null]}
      >{sipstatus==2?'Ödeme Bekliyor':'Onaylandı'}</Text>
    </View>
  );

  const Circle = ({ isActive, yazi ,status, sipstatus}) => (
    <View style={styles.durumContainer}>
      <IkostResim source={images[status]} height={25} style={[styles.circleIMG, isActive ? null : styles.passiveCircleIMG]}  />
      <Text style={[styles.label, isActive ? styles.labelActive : null]}
       // numberOfLines={1}  // Sadece bir satır göster
       // ellipsizeMode='tail'  // Yazı sonunda kırpma yap (başında "head", ortasında "middle" da kullanılabilir)
      >{yazi}</Text>
    </View>
  );
  return (
    <View style={styles.statusContainer}>
      <View style={styles.circlesContainer}>
      <Circle111 isActive={activeIndex == 1} sipstatus={status}/>
      <Circle isActive={activeIndex == 2} yazi='Hazırlanıyor' status={12} sipstatus={status}/>
      <Circle isActive={activeIndex == 3} yazi='Yola Çıktı' status={11} sipstatus={status}/>
        <Circle isActive={activeIndex == 4} yazi='Teslim Edildi' status={5} sipstatus={status}/>

      </View>

    </View>
  );
};

const styles = StyleSheet.create({

  statusContainer: {
    alignItems: 'center',
    flex:1
  },
  circlesContainer: {
    flex:1,
 
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent:'flex-start'
  },
  durumContainer: {
    marginHorizontal: 0,
flex:1,
    alignItems: 'center',
  },
  circle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 8,
    borderColor: colors.border,
  },
  activeCircle: {
    borderColor: '#32CD32', // Yeşil renk
    //backgroundColor:'#32CD32'
  },  
  circleIMG: {
  
  },  
  passiveCircleIMG: {
    tintColor: colors.border, 
  },
  labelsContainer: {
    flex:1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  label: {flex:1,
    textAlign:'center',
    fontSize: 11,
    color: colors.black,
    marginTop: 4
  },
  labelActive: {
    flex:1,
    fontWeight: '700',
  },
});

export default StatusCircles;
