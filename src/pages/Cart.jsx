import React from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useDatabase } from '@/contexts/DatabaseContext';
import { useLanguage } from '@/contexts/LanguageContext';
import CouponInput from '@/contexts/CouponInput';
import { Button } from '@/components/ui/button';

// OPTIMIZACIÓN: Componente extraído y memorizado para evitar re-renderizar TODA la lista
// cuando solo cambia la cantidad de un solo producto.
const CartItem = React.memo(({ item, index, formatPrice, onRemove, onChangeQuantity, t }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-gray-800/50 backdrop-blur-sm p-4 sm:p-6 rounded-xl border border-purple-500/20"
    >
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
        <img
          src={item.image}
          alt={item.name}
          className="w-full sm:w-32 h-32 object-cover rounded-lg"
          loading="lazy"
          decoding="async"
        />
        
        <div className="flex-1">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="text-lg sm:text-xl font-semibold text-white">{item.name}</h3>
              <p className="text-gray-400 text-sm">
                {t.catalog.categories[item.category] || item.category}
              </p>
            </div>
            <button
              onClick={() => onRemove(item.id)}
              className="text-red-400 hover:text-red-300 transition-colors"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() => onChangeQuantity(item.id, -1)}
                className="border-purple-500/20 hover:bg-purple-500/10 h-8 w-8"
              >
                <Minus className="w-4 h-4" />
              </Button>
              <span className="text-white font-semibold w-8 text-center">
                {item.quantity}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => onChangeQuantity(item.id, 1)}
                disabled={item.quantity >= item.stock}
                className="border-purple-500/20 hover:bg-purple-500/10 h-8 w-8"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            <div className="text-right">
              <div className="text-sm text-gray-400">
                {formatPrice(item.price)} {t.cart.each}
              </div>
              <div className="text-lg sm:text-xl font-bold text-white">
                {formatPrice(item.price * item.quantity)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
});

const Cart = () => {
  const { cart: cartItems, removeFromCart, changeQuantity, cartSubtotal, discountAmount, cartTax, cartTotal } = useCart();
  const { t } = useLanguage();
  const { formatCurrency } = useDatabase();
  const navigate = useNavigate();

  // FIX: Validación defensiva. Si cartItems es undefined o vacío, mostramos estado vacío.
  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 pt-24">
        <Helmet>
          <title>{t.cart.title} - Colshop</title>
          <meta name="description" content="View your shopping cart" />
        </Helmet>
        
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <ShoppingBag className="w-24 h-24 mx-auto text-gray-600 mb-6" />
          <h2 className="text-3xl font-bold text-white mb-4">{t.cart.emptyTitle}</h2>
          <p className="text-gray-400 mb-8">{t.cart.emptySubtitle}</p>
          <Link to="/catalog">
            <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
              {t.cart.browseProducts}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 pt-24 pb-12">
      <Helmet>
        <title>{t.cart.title} - Colshop</title>
        <meta name="description" content="Review your cart and proceed to checkout" />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">{t.cart.title}</h1>
          {/* FIX: Optional Chaining para evitar crash si cartItems es undefined */}
          <p className="text-gray-400">{t.cart.itemsCount.replace('{count}', cartItems?.length || 0)}</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {/* FIX: Short-circuit para asegurar que map se ejecuta sobre un array */}
            {(cartItems || []).map((item, index) => (
              <CartItem 
                key={item.id}
                item={item} 
                index={index}
                formatPrice={formatCurrency}
                onRemove={removeFromCart}
                onChangeQuantity={changeQuantity}
                t={t}
              />
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-purple-500/20 sticky top-24">
              <h2 className="text-2xl font-bold text-white mb-6">{t.cart.summary}</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-400">
                  <span>{t.cart.subtotal}</span>
                  <span className="text-white">{formatCurrency(cartSubtotal)}</span>
                </div>
                <CouponInput />
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>{t.cart.discount || 'Descuento'}</span>
                    <span>-{formatCurrency(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-400">
                  <span>{t.cart.tax} (5%)</span>
                  <span className="text-white">{formatCurrency(cartTax)}</span>
                </div>
                <div className="border-t border-purple-500/20 pt-3">
                  <div className="flex justify-between text-xl font-bold">
                    <span className="text-white">{t.cart.total}</span>
                    <span className="text-white">{formatCurrency(cartTotal)}</span>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => navigate('/checkout')}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-lg py-6"
              >
                {t.cart.proceedToCheckout}
              </Button>

              <Link to="/catalog">
                <Button variant="outline" className="w-full mt-3 border-purple-500/20 hover:bg-purple-500/10">
                  {t.cart.continueShopping}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;