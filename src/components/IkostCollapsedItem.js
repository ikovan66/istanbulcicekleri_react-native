import React, { useState } from 'react';
import { Linking,TouchableOpacity, View, StyleSheet, Text, Image } from 'react-native';
import UpSvg from '../assets/images/up';
import DownSvg from '../assets/images/down';
import IkostButton2 from "./IkostButton2";

const cleanPhoneNumber = (number) => {
  return number.replace(/[()\- ]/g, '');
};

const handlePhoneClick = (number) => {
  const cleanedNumber = cleanPhoneNumber(number);
  const url = `tel:${cleanedNumber}`;
  
  Linking.canOpenURL(url).then(supported => {
    if (supported) {
      Linking.openURL(url);
    } else {
      console.log(`Don't know how to open this URL: ${url}`);
    }
  });
};

  const Ucnokta = (props) => {
    return (

      <View style={{ flexDirection: 'row', marginBottom: 10 }}>
        <View style={{ justifyContent: 'flex-start', marginEnd: 10, }}>
          <View style={{ "width": 12, "height": 12, "borderRadius": 4, backgroundColor: props.durumRenk, marginBottom: 5 }} />
          <Image style={{ marginLeft: 5 }} source={require("../assets/images/line.png")} />
        </View>
        <View>
          <Text style={{ color: '#707070', fontSize: 11, marginBottom: 2 }}>{props.title}</Text>
          <Text style={{ fontSize: 12, fontWeight: props.title == 'Kime' ? 'bold' : 'normal', color: props.title == 'Kime' ? 'black' : '#383838' }}>{props.text}</Text>
        {props.telefon && 
        <Text onPress={() => handlePhoneClick(props.telefon)} 
        style={{ color: 'blue', fontSize: 11, marginBottom: 2 }}>{props.telefon}</Text>
        }
        </View>
      </View>

    )
  }

  const IkostCollapsedItem = ({ item, durum, durumRenk,onCommand }) => {
    const [goster, setgoster] = useState(false);
    const toggleItem = () => {
        var s=goster?false:true;
        setgoster(s);
      };
  return (
    <View style={styles.container}  >
      <TouchableOpacity onPress={() => toggleItem()} >
        <View style={styles.rowhead} >
          <View style={[styles.point, { backgroundColor:durumRenk}]} />
          <Text style={styles.codestyle} >{item.Code} </Text>

          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.textstyle} > Teslim Tarihi</Text>
            <Text style={styles.textstyle} > <Text style={{color: 'black',fontWeight:'700'}}>{item.teslimtarih.replace('.202','.2')}</Text> <Text style={{color: 'blue'}}> {item.teslimsaat}</Text></Text>
          </View>
          <View style={styles.chevronContainer}>
            {goster ? <UpSvg /> : <DownSvg />}
          </View>
        </View> 
      </TouchableOpacity>
      {goster && <View>
        <View style={{ backgroundColor: durumRenk, height: 1, width: '100%', marginBottom: 10 }}></View>
        <View
          style={styles.collapseview}>
          <Image source={{ uri: item.imgurl, width: 84, height: 84 }} resizeMode='contain'></Image>
          <View style={{ flex: 1 }}>

            <Ucnokta title="Kime" durumRenk={durumRenk} telefon={item.teslimtelefon}
              text={item.teslimad} />

            <Ucnokta title="Nereye" durumRenk={durumRenk}
              text={item.teslimadres} />

            <Ucnokta title="Teslim Edilmesi Gereken Zaman" durumRenk={durumRenk}
              text={item.teslimtarih + ' - ' + item.teslimsaat} />

          </View>
        </View>
        {durum !== 5 && <View style={{width:'100%', flexDirection: 'row', justifyContent: 'center', marginBottom: 10 ,flex:1}}>
          <IkostButton2 style={{width:'100%',flex:1}}
          title={durum == 11 ? 'Teslim Et' : 'Yola Çıkar'} 
          onPress={() => onCommand(item,durum == 11 ? 5 : 11)} />
        </View>}
      </View>}
    </View>
  )
};
 
const styles = {
    container: {
      width: '100%',
      marginTop: 8,
      marginBottom: 7,
      "borderRadius": 13,
      "borderWidth": 1,
      "borderColor": "rgba(235, 235, 235, 255)",
      "backgroundColor": "rgba(255, 255, 255, 255)"
    },
    rowhead: {
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      "paddingStart": 9,
      "paddingEnd": 9,
      "paddingTop": 12,
      "paddingBottom": 12,
      "width": '100%',
    },
    codstyle: {
      "fontFamily": "Nunito Sans",
      "fontSize": 14,
      "color": "rgba(56, 56, 56, 255)",
      "marginTop": 10
    },
    textstyle: {
      "fontFamily": "Nunito Sans",
      "fontSize": 12,
      "color": "rgba(56, 56, 56, 255)",
    },
    point: {
      "width": 17,
      "height": 17,
      "borderRadius": 8.5,
    },
  
    collapseview: {
      paddingEnd: 20,
      paddingBottom: 10,
      flexDirection: 'row',
      width: '100%',
    },
    mainContent: {
      flex: 1 // Bu, içeriğin geri kalanını kaplamasını sağlar
    },
    loader: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center'
    },
    chevronContainer: {
      justifyContent: 'center',
      alignItems: 'center',
      paddingTop: 10,
      paddingStart: 3,
      width: 20,
      height: 30,
    },
    footerText: {
      justifyContent: 'center',
      alignItems: 'center',
      padding: 10,
    },
    emptyText: {
      flex: 1, // Bu satırı ekledim
      justifyContent: 'center',
      alignItems: 'center'
    },
  };
export default IkostCollapsedItem;
