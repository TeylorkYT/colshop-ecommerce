import React from 'react';
import { useCurrency } from '@/contexts/CurrencyContext';
import { Button } from '@/components/ui/button';

const CurrencySwitcher = () => {
  const { currency, setCurrency } = useCurrency();

  const toggleCurrency = () => {
    const newCurrency = currency === 'COP' ? 'USD' : 'COP';
    setCurrency(newCurrency);
  };

  return (
    <Button
      variant="outline"
      onClick={toggleCurrency}
      className="border-purple-500/20 hover:bg-purple-500/10 text-gray-300"
    >
      {currency === 'COP' ? 'USD' : 'COP'}
    </Button>
  );
};

export default CurrencySwitcher;