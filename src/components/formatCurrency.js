export const formatCurrency = (amount, language) => {
  // Base currency is now COP. Rates are for converting FROM COP.
  const config = {
    es: { currency: 'COP', locale: 'es-CO', rate: 1 },         // Colombia (Base)
    en: { currency: 'USD', locale: 'en-US', rate: 1 / 4000 },  // 1 USD = 4000 COP
    pt: { currency: 'BRL', locale: 'pt-BR', rate: 1 / 800 }    // 1 BRL ~ 800 COP
  };

  const { currency, locale, rate } = config[language] || config.es; // Default to COP
  const convertedAmount = amount * rate;

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: currency === 'COP' ? 0 : 2,
    maximumFractionDigits: currency === 'COP' ? 0 : 2,
  }).format(convertedAmount);
};