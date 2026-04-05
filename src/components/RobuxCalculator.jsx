import React, { useState, useMemo } from 'react';
import { ShoppingCart, Calculator, Zap, ShieldCheck } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useDatabase } from '@/contexts/DatabaseContext';

const PRESETS = [400, 800, 1700, 4500, 10000];

const RobuxCalculator = () => {
  const { products } = useDatabase();
  const [amount, setAmount] = useState(1000);
  const { addToCart } = useCart();
  const { t } = useLanguage();
  const { formatCurrency: formatPrice, currency } = useDatabase();
  
  // Buscar el producto de configuración de Robux
  // FIX: Buscar también por categoría por si el ID en la base de datos de producción cambió (ej. auto-incremental)
  const robuxProduct = products.find(p => p.id === 'robux-currency' || p.category === 'robux');
  
  // Usar valores del producto o valores por defecto si no existe
  const RATE = robuxProduct?.price || 45; // El precio del producto actúa como la tasa por 1 Robux
  const MAX_STOCK = robuxProduct?.stock || 100000;
  const PRODUCT_IMAGE = robuxProduct?.image || 'https://images.unsplash.com/photo-1659725156498-d565e9a8a109';
  
  // La descripción se toma del producto en la base de datos, con un fallback a las traducciones.
  const DESCRIPTION = robuxProduct?.description || t.calculator.subtitle;

  // Filtrar presets que excedan el stock máximo
  const availablePresets = PRESETS.filter(p => p <= MAX_STOCK);

  // OPTIMIZACIÓN: Calcular precio derivado directamente en el render para evitar doble renderizado (useEffect)
  const price = (Number(amount) || 0) * RATE;

  const handleInputChange = (e) => {
    // Permitir borrar el input completamente para escribir
    if (e.target.value === '') {
      setAmount('');
      return;
    }
    let val = Number(e.target.value);
    if (val < 0) val = 0;
    // Límite superior opcional
    if (val > MAX_STOCK) val = MAX_STOCK; 
    setAmount(val);
  };

  const handleBuy = () => {
    const val = Number(amount) || 0;
    if (val <= 0) return;

    if (!robuxProduct) {
        console.error("Robux product not found in database context");
        return;
    }
    
    // Añadir el producto al carrito (la notificación 'toast' ya se dispara automáticamente desde el CartContext)
    addToCart(robuxProduct, val);
  };

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Product Info Section */}
      <div className="bg-gray-900 rounded-3xl border border-white/10 p-8 shadow-2xl h-fit flex flex-col gap-6 relative overflow-hidden group">
        {/* Decorative background */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl -mr-40 -mt-40 pointer-events-none transition-opacity duration-500 group-hover:opacity-70"></div>

        <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-white/5 shadow-lg">
          <img 
            src={PRODUCT_IMAGE} 
            alt="Robux Product" 
            className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" 
            loading="lazy"
            decoding="async"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-80" />
        </div>
        
        <div className="relative z-10">
            <h3 className="text-2xl font-bold text-white mb-3 flex items-center gap-2 tracking-tight">
              {t.calculator.productDescription}
            </h3>
            
            <div className="text-gray-400 leading-relaxed whitespace-pre-line text-sm font-medium">
              {DESCRIPTION}
            </div>
        </div>
      </div>

      {/* Calculator Section */}
      <div className="bg-gray-900 rounded-3xl border border-white/10 p-8 shadow-2xl h-fit flex flex-col gap-6 relative overflow-hidden">
        {/* Decorative background */}
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-pink-600/10 rounded-full blur-3xl -ml-40 -mb-40 pointer-events-none"></div>

        {/* Header */}
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gray-800 rounded-xl border border-white/10 shadow-inner">
              <Calculator className="w-6 h-6 text-white" />
            </div>
            <div>
                <h2 className="text-xl font-bold text-white leading-tight">{t.calculator.title}</h2>
                <p className="text-xs text-gray-500 font-medium">{t.calculator.subtitle}</p>
            </div>
          </div>
          <div className="text-xs font-bold text-purple-300 bg-purple-500/10 px-3 py-1.5 rounded-lg border border-purple-500/20">
            {t.calculator.conversionRate.replace('{rate}', formatPrice(RATE))}
          </div>
        </div>

        {/* Main Calculator Inputs */}
        <div className="space-y-6 relative z-10">
          
          {/* Amount Input */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">
              {t.calculator.amount}
            </label>
            <div className="relative group">
              <input
                type="number"
                value={amount}
                onChange={handleInputChange}
                className="w-full bg-black/40 border border-white/10 text-white text-4xl font-bold rounded-2xl px-6 py-5 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all placeholder-gray-700 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                placeholder="0"
              />
              <div className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-600 font-bold pointer-events-none text-sm uppercase tracking-widest">
                {t.calculator.currencyName}
              </div>
            </div>
          </div>

          {/* Presets */}
          <div>
            <div className="flex justify-between items-center mb-3">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">{t.calculator.quickSelect}</p>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                {availablePresets.map((preset) => (
                <button
                    key={preset}
                    onClick={() => setAmount(preset)}
                    className={`py-2.5 rounded-xl text-xs font-bold transition-all border flex items-center justify-center ${
                    amount === preset
                        ? 'bg-white text-black border-white shadow-lg scale-105'
                        : 'bg-white/5 text-gray-400 border-white/5 hover:bg-white/10 hover:text-white hover:border-white/20'
                    }`}
                >
                    {preset.toLocaleString()}
                </button>
                ))}
            </div>
          </div>

          {/* Price Display */}
          <div className="pt-2">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-white/10 p-1">
                <div className="absolute inset-0 bg-white/5 backdrop-blur-sm"></div>
                <div className="relative flex justify-between items-center px-6 py-5">
                    <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">{t.calculator.price}</p>
                        <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-black text-white">{formatPrice(price)}</span>
                            <span className="text-sm text-gray-400 font-medium">{currency}</span>
                        </div>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center">
                        <ShoppingCart className="w-5 h-5 text-white" />
                    </div>
                </div>
            </div>
          </div>

        </div>

        {/* Action Button */}
        <button
          onClick={handleBuy}
          disabled={Number(amount) <= 0}
          className="relative z-10 w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-5 rounded-2xl shadow-xl shadow-purple-900/20 border border-white/10 transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] group text-center"
        >
          <span className="text-lg tracking-wide">{t.calculator.buy}</span>
        </button>

        {/* Footer Info */}
        <div className="flex items-center justify-center gap-6 text-xs font-medium text-gray-500 pt-2 border-t border-white/5 relative z-10">
           <div className="flex items-center gap-1.5">
             <Zap className="w-3.5 h-3.5 text-yellow-500/80" />
             <span>{t.home.features.fastDelivery}</span>
           </div>
           <div className="flex items-center gap-1.5">
             <ShieldCheck className="w-3.5 h-3.5 text-green-500/80" />
             <span>{t.home.features.securePayment}</span>
           </div>
        </div>

      </div>
    </div>
  );
};

// OPTIMIZACIÓN: React.memo para evitar re-renderizados si el contexto padre cambia pero las props no
export default React.memo(RobuxCalculator);