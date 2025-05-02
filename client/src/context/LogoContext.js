import React, { createContext, useContext } from 'react';

// Varsayılan logo URL'si
const defaultLogoUrl = process.env.PUBLIC_URL + '/assets/images/iesyazilim-logo.png';

// Context oluştur
const LogoContext = createContext();

// Context hook'u
export const useLogo = () => useContext(LogoContext);

// Logo provider bileşeni
export const LogoProvider = ({ children }) => {
  // Güncel logo URL'sini al
  const getLogoUrl = () => {
    return defaultLogoUrl;
  };

  // Context değeri
  const contextValue = {
    getLogoUrl,
    defaultLogoUrl
  };

  return (
    <LogoContext.Provider value={contextValue}>
      {children}
    </LogoContext.Provider>
  );
};

export default LogoContext;