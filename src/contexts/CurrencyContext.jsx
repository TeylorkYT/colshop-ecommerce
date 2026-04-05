import React, { createContext, useContext, useState, useMemo } from 'react';
import { useLanguage } from './LanguageContext';

const CurrencyContext = createContext();

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

// Definimos las tasas de cambio relativas a COP (moneda base)
const exchangeRates = {
  COP: 1,
  USD: 1 / 3800, // 1 USD = 3800 COP
};

export const CurrencyProvider = ({ children }) => {
  const { language } = useLanguage();
  // Por defecto es COP, pero carga la preferencia del usuario si existe
  const [currency, setCurrency] = useState(localStorage.getItem('currency') || 'COP');

  const setAndStoreCurrency = (newCurrency) => {
    localStorage.setItem('currency', newCurrency);
    setCurrency(newCurrency);
  };

  const formatPrice = useMemo(() => (amountInCop) => {
    if (typeof amountInCop !== 'number') return 'N/A';

    const rate = exchangeRates[currency] || 1;
    const convertedAmount = amountInCop * rate;

    return new Intl.NumberFormat(language.split('-')[0], {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: currency === 'USD' ? 2 : 0,
      maximumFractionDigits: currency === 'USD' ? 2 : 0,
    }).format(convertedAmount);
  }, [currency, language]);

  const value = { currency, setCurrency: setAndStoreCurrency, formatPrice };

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
};