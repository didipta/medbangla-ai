"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "bn" | "en";

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (bn: string, en: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // First language is Bangla (bn), second is English (en)
  const [lang, setLangState] = useState<Language>("bn");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("medbangla_lang") as Language;
      if (stored === "bn" || stored === "en") {
        setLangState(stored);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    try {
      localStorage.setItem("medbangla_lang", newLang);
      document.documentElement.lang = newLang;
    } catch (e) {
      console.error(e);
    }
  };

  const t = (bnText: string, enText: string) => {
    return lang === "bn" ? bnText : enText;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
