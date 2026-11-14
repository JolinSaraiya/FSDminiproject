import { createContext, useContext, useEffect, useState } from 'react';

const CurrencyContext = createContext(null);

export const CURRENCIES = {
  INR: { code: 'INR', symbol: '₹', rate: 1, label: 'INR (₹)' },
  USD: { code: 'USD', symbol: '$', rate: 0.012, label: 'USD ($)' },
  EUR: { code: 'EUR', symbol: '€', rate: 0.011, label: 'EUR (€)' },
  GBP: { code: 'GBP', symbol: '£', rate: 0.0095, label: 'GBP (£)' },
  AED: { code: 'AED', symbol: 'AED ', rate: 0.044, label: 'AED (د.إ)' },
};

export function CurrencyProvider({ children }) {
  const [currency, setCurrencyState] = useState(() => {
    return localStorage.getItem('stayhub_currency') || 'INR';
  });

  function setCurrency(code) {
    if (CURRENCIES[code]) {
      setCurrencyState(code);
      localStorage.setItem('stayhub_currency', code);
    }
  }

  function formatPrice(inrAmount) {
    const numeric = Number(inrAmount) || 0;
    const config = CURRENCIES[currency] || CURRENCIES.INR;
    const converted = Math.round(numeric * config.rate);
    return `${config.symbol}${converted.toLocaleString('en-IN')}`;
  }

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        currentConfig: CURRENCIES[currency] || CURRENCIES.INR,
        setCurrency,
        formatPrice,
        currencies: Object.values(CURRENCIES),
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}

export default CurrencyContext;
