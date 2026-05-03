import React, { useState } from 'react';
import { View, Text, TouchableWithoutFeedback } from 'react-native';
import AsagiOk from './AsagiOk';
const CollapsibleView = ({ title, label, children, collapsed, onToggle }) => {
 
  const toggleCollapse = () => {
    setCollapsed(!collapsed);
  };

  return (
    <View style={{marginTop:5}}>
      <Text style={{flex: 1, marginBottom: 5, fontSize:13}}>{label}</Text>

      <TouchableWithoutFeedback onPress={onToggle} >
        <View style={{padding:4,paddingHorizontal:10,borderWidth:.5,borderColor:'gray',flexDirection:'row'}}>
          <Text style={{flex:1}}>{title}</Text>
          <AsagiOk style={{}}></AsagiOk>
        </View>
      </TouchableWithoutFeedback>
      {!collapsed && (
        <View style={{borderWidth:.5,paddingBottom:5}}>
          {children}
        </View>
      )}
    </View>
  );
};

export default CollapsibleView;
