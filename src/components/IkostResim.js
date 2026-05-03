import React from 'react';
import { Image } from 'react-native';

const IkostResim = (props) => {
  // bunu ya  ene göre boyu ya da boya göre eni orantılı ayarlamak için yaptım
  const imageSource = props.source; 
  const { width: originalWidth, height: originalHeight } = Image.resolveAssetSource(imageSource);
  const fixedWidth = props.width==undefined && props.height!=undefined ? props.height * originalWidth / originalHeight:props.width;
  const fixedHeight = props.height==undefined && props.width!=undefined ? props.width * originalHeight / originalWidth : props.height;

  return (
    <Image
      source={imageSource}
      style={[ {width: fixedWidth,height:fixedHeight}, props.style]}/>
  );
};

export default IkostResim;