import React, { useContext, useRef, useState, useEffect } from 'react';
import { View, Text, TextInput, Keyboard } from 'react-native';
import MaskInput from 'react-native-mask-input';
import { SepetContext } from '../components/SepetContext';
import { colors } from '../config/theme';

const IkostTextInput = ({
  secureTextEntry: secureTextEntryProp = false,
  mask,
  onBlur: onBlurProp,
  value,
  onChangeText,
  editable = true,
  title,
  keyboardType,
  maxLength,
  multiline,
  ...ayarlar
}) => {
  const inputRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);
  const [internalValue, setInternalValue] = useState(value); // ✅ Ara state çözümü
  const { translate } = useContext(SepetContext);

  useEffect(() => {
    if (value !== internalValue) {
      setInternalValue(value);
    }
  }, [value]);

  const handleBlur = () => {
    setIsFocused(false);
    if (onBlurProp) {
      onBlurProp();
    }
  };

  const handleChangeText = (text) => {
    setInternalValue(text);
    if (text !== value) {
      onChangeText(text);
    }
  };

  const handleSubmitEditing = () => {
    if (multiline) {
      inputRef.current.blur();
    } else {
      Keyboard.dismiss();
    }
  };

  return (
    <View style={{ position: 'relative', paddingTop: 20, marginTop: 5, width: '100%' }}>
      {internalValue && internalValue.length > 0 && title && (
        <Text
          style={{
            position: 'absolute',
            top: 7,
            fontFamily: 'NunitoSans-Bold',
            fontSize: 12,
            color: 'rgba(26, 26, 26, 255)',
          }}
        >
          {translate(title)}
        </Text>
      )}
      {mask ? (
        <MaskInput
          ref={inputRef}
          autoFocus={ayarlar.autoFocus}
          returnKeyType="done"
          onSubmitEditing={handleSubmitEditing}
          mask={mask}
          placeholder={translate(title)}
          editable={editable}
          keyboardType={keyboardType}
          maxLength={maxLength}
          autoCapitalize={ayarlar.autoCapitalize}
          placeholderTextColor="#999999"
          value={internalValue}
          onChangeText={handleChangeText}
          style={[{
            color: 'black',
            fontFamily: 'NunitoSans-Regular',
            padding: 10,
            paddingHorizontal: 0,
            fontSize: 16,
            marginBottom: 15,
            width: '100%',
            borderBottomWidth: 0.5,
            borderColor: isFocused ? 'black' : '#e1dcd8',
          }, ayarlar.style]}
          onFocus={() => setIsFocused(true)}
          onBlur={handleBlur}
        />
      ) : (
        <TextInput
          ref={inputRef}
          autoFocus={ayarlar.autoFocus}
          returnKeyType="done"
          onSubmitEditing={handleSubmitEditing}
          secureTextEntry={secureTextEntryProp}
          placeholder={translate(title)}
          editable={editable}
          keyboardType={keyboardType}
          autoCapitalize={ayarlar.autoCapitalize}
          maxLength={maxLength}
          placeholderTextColor="#999999"
          value={internalValue} // ✅ Ara state kullanımı
          onChangeText={handleChangeText} // ✅ Kontrollü güncelleme
          style={[{
            fontFamily: 'NunitoSans-Regular',
            color: 'black',
            minHeight: multiline ? 80 : undefined,
            padding: 10,
            paddingHorizontal: 0,
            fontSize: 16,
            marginBottom: ayarlar.alttext ? 5 : 15,
            borderBottomWidth: 0.5,
            borderColor: isFocused ? 'black' : '#e1dcd8',
            width: '100%',
          }, ayarlar.style]}
          onFocus={() => setIsFocused(true)}
          onBlur={handleBlur}
          multiline={multiline}
          numberOfLines={ayarlar.numberOfLines}
          blurOnSubmit={true}
        />
      )}
      {ayarlar.alttext && (
        <Text style={{
          fontSize: 13,
          color: colors.textDark,
          fontFamily: 'NunitoSans-Regular',
          marginBottom: 10,
        }}>{ayarlar.alttext}</Text>
      )}
    </View>
  );
};

export default IkostTextInput;