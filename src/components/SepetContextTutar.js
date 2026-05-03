import React, { createContext, useState } from 'react';

// Context oluşturuluyor
export const SepetContextTutar = createContext({
  sepetTutar: '',
  setSepetTutar: () => {}
});

// Provider bileşeni
export const SepetTutarProvider = ({ children }) => {
  const [sepetTutar, setSepetTutar] = useState('');

  return (
    <SepetContextTutar.Provider value={{ sepetTutar, setSepetTutar }}>
      {children}
    </SepetContextTutar.Provider>
  );
};
