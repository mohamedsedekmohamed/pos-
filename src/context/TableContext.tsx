import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { TableInfo } from '../types/table';

interface GeoCoords {
  lat: number | null;
  lng: number | null;
}

interface TableContextType {
  tableId: number | null;
  setTableId: (id: number | null) => void;
  tableInfo: TableInfo | null;
  setTableInfo: (info: TableInfo | null) => void;
  lang: 'ar' | 'en';
  setLang: (lang: 'ar' | 'en') => void;
  coords: GeoCoords | null;
}

const TableContext = createContext<TableContextType | undefined>(undefined);

const TABLE_STORAGE_KEY = 'table_selected_id';
const LANG_STORAGE_KEY = 'table_selected_lang';

export const TableProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Table ID
  const [tableId, setTableIdState] = useState<number | null>(() => {
    const saved = localStorage.getItem(TABLE_STORAGE_KEY);
    return saved ? parseInt(saved, 10) : null;
  });

  const [tableInfo, setTableInfo] = useState<TableInfo | null>(null);

  // Geolocation Coordinates
  const [coords, setCoords] = useState<GeoCoords | null>(null);

  // Language
  const [lang, setLangState] = useState<'ar' | 'en'>(() => {
    const saved = localStorage.getItem(LANG_STORAGE_KEY);
    return (saved === 'en' ? 'en' : 'ar') as 'ar' | 'en';
  });

  // Request browser geolocation once on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        () => {
          // Geolocation unavailable or denied
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }
  }, []);

  const setTableId = (id: number | null) => {
    setTableIdState(id);
    if (id !== null) {
      localStorage.setItem(TABLE_STORAGE_KEY, id.toString());
    } else {
      localStorage.removeItem(TABLE_STORAGE_KEY);
    }
  };

  const setLang = (newLang: 'ar' | 'en') => {
    setLangState(newLang);
    localStorage.setItem(LANG_STORAGE_KEY, newLang);
  };

  return (
    <TableContext.Provider
      value={{
        tableId,
        setTableId,
        tableInfo,
        setTableInfo,
        lang,
        setLang,
        coords,
      }}
    >
      {children}
    </TableContext.Provider>
  );
};

export const useTableContext = (): TableContextType => {
  const context = useContext(TableContext);
  if (!context) {
    throw new Error('useTableContext must be used within a TableProvider');
  }
  return context;
};
