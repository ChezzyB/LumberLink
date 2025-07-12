import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Mill {
  _id: string;
  millNumber: string;
  name: string;
  location: {
    city: string;
    province: string;
    latitude: number;
    longitude: number;
  };
  contact: {
    phone?: string;
    email?: string;
  };
  owner?: string;
  createdAt: string;
}

interface MillContextType {
  selectedMill: Mill | null;
  setSelectedMill: (mill: Mill | null) => void;
  userLocation: { latitude: number; longitude: number } | null;
  setUserLocation: (location: { latitude: number; longitude: number } | null) => void;
}

const MillContext = createContext<MillContextType | undefined>(undefined);

export const MillProvider = ({ children }: { children: ReactNode }) => {
  const [selectedMill, setSelectedMill] = useState<Mill | null>(null);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  return (
    <MillContext.Provider value={{ selectedMill, setSelectedMill, userLocation, setUserLocation }}>
      {children}
    </MillContext.Provider>
  );
};

export const useMill = () => {
  const context = useContext(MillContext);
  if (!context) {
    throw new Error('useMill must be used within a MillProvider');
  }
  return context;
};