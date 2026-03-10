// src/daifugo/LanguageContext.jsx
import React, { createContext, useState, useContext } from 'react';
import { translations } from './utils/translations';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('ko'); // 기본값: 한국어

  // 번역 함수 (key를 넣으면 현재 언어에 맞는 텍스트 반환)
  const t = (key) => translations[lang][key] || key;

  const toggleLanguage = () => {
    setLang(prev => (prev === 'ko' ? 'ja' : 'ko'));
  };

  return (
    <LanguageContext.Provider value={{ lang, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

// 다른 파일에서 쉽게 가져다 쓰기 위한 커스텀 훅
// eslint-disable-next-line react-refresh/only-export-components
export const useLanguage = () => useContext(LanguageContext);