import React, { createContext, useContext, useState, ReactNode } from 'react';

type UnitType = 'Celcius' | 'Fahrenheit';

interface ConversionContextProps {
  theme: UnitType;
  toggleConversion: () => void;
}

const ConversionContext = createContext<ConversionContextProps | undefined>(undefined);

export const ConversionProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setConversion] = useState<UnitType>('Celcius'); // default to Celcius

  const toggleConversion = () => {
    setConversion((prev) => (prev === 'Celcius' ? 'Fahrenheit' : 'Celcius'));
  };

  return (
    <ConversionContext.Provider value={{ theme, toggleConversion }}>
      {children}
    </ConversionContext.Provider>
  );
};

export const useConversion = (): ConversionContextProps => {
  const context = useContext(ConversionContext);
  if (!context) {
    throw new Error('useConversion must be used within a ConversionProvider');
  }
  return context;
};
