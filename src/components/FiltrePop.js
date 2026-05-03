import API_CONFIG from '../config/apiConfig';
import React, { useContext, useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, TouchableWithoutFeedback, ScrollView, StyleSheet } from 'react-native';
import Accordion from 'react-native-collapsible/Accordion';
import IkostButton from "../components/IkostButton";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SepetContext } from '../components/SepetContext';
import axios from 'axios';

import Svg, { Circle, Path } from 'react-native-svg';
import { colors } from '../config/theme';


const FilterScreen = ({ cid, obek, filtrebusayfada, filtreBYsection, siralamasi, onCommand }) => {

  const { fetchTranslations, translate } = useContext(SepetContext);


  const SolidCircle = ({ color, strokecolor }) => (
    <Svg height="20" width="20" style={{ marginRight: 5 }}>
      <Circle cx="10" cy="10" r="9" stroke={strokecolor} strokeWidth="1" fill={color} />
    </Svg>
  );

  const HollowCircle = () => (
    <Svg height="20" width="20" style={{ marginRight: 5 }}>
      <Circle cx="10" cy="10" r="9" stroke="black" strokeWidth="1" fill="white" />
    </Svg>
  );

  const DownwardArrow = () => (
    <Svg height="20" width="20">
      <Path d="M5 7 L15 7 L10 12 Z" fill="black" />
    </Svg>
  );

  const UpwardArrow = () => (
    <Svg height="20" width="20">
      <Path d="M5 13 L15 13 L10 8 Z" fill="black" />
    </Svg>
  );
  const [selectedFiltersBySection, setSelectedFiltersBySection] = useState({});

  const [FILTER_DATA, setFILTER_DATA] = useState([]);
  const [secdegisimvar, setSecdegisimvar] = useState(false);

  const [activeSections, setActiveSections] = useState([]);
  const [selectedFilters, setSelectedFilters] = useState(new Set());
  const [selectedOrder, setSelectedOrder] = useState(siralamasi);


  // filtre_id -> deger eşleştiren dictionary/Map
  const [idToDegerMap, setIdToDegerMap] = useState({});

  // FILTER_DATA yüklendikten sonra
  useEffect(() => {
    const newMap = {};

    FILTER_DATA.forEach(section => {
      (section.filtrelist || []).forEach(item => {
        // item.filtre_id varsa ekle
        if (item.filtre_id) {
          newMap[item.filtre_id] = item.deger;
        }
      });
    });

    setIdToDegerMap(newMap);
  }, [FILTER_DATA]);

  const fetchFilterItems = async () => {
    try {
      const dilStored = await AsyncStorage.getItem('dil');
      const url = `${API_CONFIG.frontendApi}/api/Product/Filtreler2024`;
      const response = await axios.post(url, { cid: cid, dil: dilStored, obek: obek });
      const json = response.data;
      return Array.isArray(json) ? json : []; // Eğer yanıt dizi değilse, boş dizi dön

    } catch (error) {
      console.error(error);
      return [];

    } finally {
      setSelectedFilters(new Set(filtrebusayfada));
      setSelectedFiltersBySection(filtreBYsection);
    }
  };


  useEffect(() => {
    fetchFilterItems().then(data => setFILTER_DATA([...SORT_OPTIONS, ...data]));
  }, [cid, obek]);

  const SORT_OPTIONS = [
    {
      ad: translate('Sıralama'), filtrelist: [
        { deger: translate('Çok Satana Göre'), value: 6 },
        { deger: translate('Fiyata Göre Azalan'), value: 2 },
        { deger: translate('Fiyata Göre Artan'), value: 1 },
        { deger: translate('En Yeniler'), value: 8 }
      ]
    }
  ];

  const clearFilters = () => {
    setSelectedFilters(new Set());
    setSelectedOrder(10000);
    setSelectedFiltersBySection({});
    setSecdegisimvar(true);
  };



  const applyFilters = () => {
    onCommand && onCommand(
      convertToModel(selectedFiltersBySection),
      Array.from(selectedFilters),    // <--- filtre_id listesi
      selectedFiltersBySection,
      selectedOrder
    );
  };

  function convertToModel(selectedFiltersBySection) {
    const modelList = [];

    for (const section in selectedFiltersBySection) {
      selectedFiltersBySection[section].forEach((filterValue, index) => {
        // Burada, her bir filtre için bir model nesnesi oluşturun
        if (section != 'undefined') {//section!='undefined' Sıralama da undefined
          const model = {
            ad: section,       // Bölüm başlığı
            deger: filterValue, // Filtre değeri
            sira: index,        // Sıra numarası (örneğin, listedeki konumu)
            count: 1            // Varsayılan count değeri, bu değişebilir
          };
          modelList.push(model);
        }
      });
    }

    return modelList;
  }





  const renderHeader = (section, index, isActive) => {
    const selectedItems = selectedFiltersBySection[section.baslik] || [];
    const degerList = selectedItems.map((id) => idToDegerMap[id] || '');


    return (
      <View style={styles.headerPARENTStyle}>
        <View style={styles.headerStyle}>
          <Text style={styles.headerTextStyle}>{section.baslik == undefined ? translate('Sıralama') : global.toTitleCase(translate(section.baslik))}</Text>
          <View style={{ flex: 1 }} />
          {isActive ? <UpwardArrow /> : <DownwardArrow />}
        </View>
        {degerList.length > 0 && (
          <Text style={styles.selectedsHstyle}>{degerList.join(', ')}</Text>
        )}
      </View>
    );
  };


  // Akordiyon içeriğini render etme
  const renderContent = section => {


    return (
      <View style={styles.contentStyle}>
        {section.filtrelist.map((item, index) => {
          const color = getColorFromName(item.deger);
          return (
            <TouchableOpacity key={index} style={styles.itemStyle}
              onPress={() => section.baslik == undefined ? handleOrderSelect(section, item) : handleFilterSelect(section, item)}>

              {selectedFilters.has(item.filtre_id) || selectedOrder == item.value ?
                <Image source={require('../assets/images/check_dolu.png')} style={{ width: 20, height: 20, marginRight: 10 }} />
                :
                <Image source={require('../assets/images/check_bos.png')} style={{ width: 20, height: 20, marginRight: 10 }} />
              }
              {item.ad == 'Renk' && <SolidCircle color={color} strokecolor={color == colors.white ? 'grey' : 'white'} />}

              <Text style={styles.itemtext}>{global.toTitleCase(translate(item.deger))}</Text>
            </TouchableOpacity>
          )
        })}
      </View>
    );
  };

  const getColorFromName = (colorName) => {
    const colorMap = {
      'Kırmızı': '#FF0000', // Kırmızı için RGB kodu
      'Beyaz': colors.white,   // Beyaz için RGB kodu
      'Turuncu': '#FFA500', // Turuncu için RGB kodu
      'Mor': '#800080',     // Mor için RGB kodu
      'Pembe': '#FFC0CB',   // Pembe için RGB kodu
      'Lila': '#C8A2C8',    // Lila için RGB kodu
      'Yeşil': '#008000',   // Yeşil için RGB kodu
      'Sarı': '#FFFF00',    // Sarı için RGB kodu
      'Mavi': '#0000FF',    // Mavi için RGB kodu
      // Diğer renkler eklenebilir
    };
    return colorMap[colorName] || colors.black; // Eğer renk bulunamazsa varsayılan olarak siyah dön
  };

  const handleOrderSelect = (section, item) => {
    setSelectedOrder(item.value);
    const sectionFilters = new Set(selectedFiltersBySection[section.baslik] || []);
    sectionFilters.clear();
    sectionFilters.add(item.filtre_id);
    setSecdegisimvar(true);
    setSelectedFiltersBySection({
      ...selectedFiltersBySection,
      [section.baslik]: Array.from(sectionFilters),
    });
  };

  // Filtre seçimi işleyici
  const handleFilterSelect = (section, item) => {

    const newSelectedFilters = new Set(selectedFilters);

    if (item.ad == undefined) {
      for (const section in selectedFiltersBySection) {
        selectedFiltersBySection[section].forEach((filterValue, index) => {
          if (section == 'undefined') newSelectedFilters.delete(filterValue);
        });
      }
    }
    if (newSelectedFilters.has(item.filtre_id)) {
      newSelectedFilters.delete(item.filtre_id);
    } else {
      newSelectedFilters.add(item.filtre_id);
    }
    setSelectedFilters(newSelectedFilters);
    setSecdegisimvar(true);

    const sectionFilters = new Set(selectedFiltersBySection[section.baslik] || []);

    if (section.baslik == undefined) {//undefined:Sıralama oluyor!
      sectionFilters.clear();
    }

    if (sectionFilters.has(item.filtre_id)) {
      sectionFilters.delete(item.filtre_id);
    } else {
      sectionFilters.add(item.filtre_id);
    }

    setSelectedFiltersBySection({
      ...selectedFiltersBySection,
      [section.baslik]: Array.from(sectionFilters),
    });

  };

  // Hangi akordiyon bölümlerinin aktif olduğunu güncelleme
  const updateSections = activeSections => {
    setActiveSections(activeSections);
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'white', padding: 20 }}>
      <ScrollView>
        <Accordion
          sections={FILTER_DATA}
          activeSections={activeSections}
          renderHeader={renderHeader}
          renderContent={renderContent}
          onChange={updateSections}
        />
      </ScrollView>
      <View style={styles.buttonContainer}>
        {(selectedFilters.size > 0 || selectedOrder != 10000) && (
          <IkostButton onPress={clearFilters} title="Temizle" style={{ marginRight: 4 }} />)}
        {(secdegisimvar) && (<IkostButton onPress={applyFilters} title="Uygula" />)}
      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  itemtext: {
    fontFamily: 'NunitoSans-Regular', fontSize: 14, color: colors.black,
  },
  contentStyle: {
    backgroundColor: colors.white, // Arka plan rengi
    padding: 10, // İç boşluk
    paddingLeft: 0
  },
  itemStyle: {
    paddingBottom: 4, paddingTop: 4,
    flexDirection: 'row', color: colors.black,
    alignItems: 'center',
    marginBottom: 4, // Alt marj
    marginTop: 4, // Üst marj
    paddingHorizontal: 0, backgroundColor: 'white'

  },
  headerPARENTStyle: {
    backgroundColor: 'white',
    padding: 13,
    paddingHorizontal: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e2e2',
  },
  headerStyle: {
    flexDirection: 'row', // İçerikleri yatay olarak hizala
    alignItems: 'center', // İçerikleri dikey olarak ortala
  },
  headerTextStyle: {
    fontFamily: 'NunitoSans-Regular', fontSize: 15,
    marginRight: 10, color: colors.black,
  },
  selectedsHstyle: {
    marginTop: 5, fontFamily: "NunitoSans-Bold",
    color: 'darkred', fontSize: 11,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
  },
  buttonStyle: {
    flex: 1,
    margin: 10,
    textAlign: 'center',
    backgroundColor: colors.primary,
    color: 'white',
    padding: 10,
    borderRadius: 5,
  },
});
export default FilterScreen;
