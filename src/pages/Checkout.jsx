import React, { useState, Suspense } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CreditCard, MapPin, User } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useDatabase } from '@/contexts/DatabaseContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import CouponInput from '@/contexts/CouponInput';

// OPTIMIZACIÓN: Code Splitting. Cargamos el formulario de pago solo cuando se necesita.
const PaymentForm = React.lazy(() => import('@/components/PaymentForm').catch(() => {
  // FIX: Si falla la carga del chunk (por nueva versión desplegada), recargar la página para obtener los nuevos assets.
  window.location.reload();
  return new Promise(() => {}); // Mantiene el estado de carga (spinner) mientras recarga
}));

const Checkout = () => {
  // FIX: Extraer subtotal, impuesto y total directamente del contexto para evitar doble cobro
  const { cart: cartItems, cartSubtotal, discountAmount, cartTax, cartTotal, clearCart } = useCart();
  const { currentUser } = useAuth();
  // FIX: Obtener el estado de carga para prevenir race conditions
  const { createOrder, loading: productsLoading, formatCurrency } = useDatabase();
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [shippingInfo, setShippingInfo] = useState({
    fullName: '',
    email: currentUser?.email || '',
    address: '',
    city: '',
    postalCode: '',
    country: ''
  });

  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

  const handleShippingSubmit = (e) => {
    e.preventDefault();
    setShowPayment(true);
  };

  const createPendingOrder = async (paymentData = {}) => {
    try {
      const order = await createOrder({
        userId: currentUser.id,
        items: cartItems.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        })),
        total: cartTotal, // FIX: Usar el total exacto del contexto
        shippingInfo,
        termsAccepted: true,
        ...paymentData // FIX: Permitir sobrescribir datos desde PaymentForm (ej: taxRate)
      });

      // FIX: Solo limpiar el carrito si la orden se creó exitosamente en el backend
      if (order) {
        clearCart();
        return order;
      }

      // Si la orden es `null`, es porque la validación de stock/producto falló en el contexto.
      // El contexto ya mostró el Toast de error. No hacemos nada más aquí.
      return null;

    } catch (error) {
      // FIX: Propagar el error para que PaymentForm lo capture y pueda mostrar el mensaje específico en consola/UI
      // Si retornamos null aquí, PaymentForm solo vería un error genérico "No se pudo crear la orden".
      throw error;
    }
  };

  // FIX: Mostrar un estado de carga mientras los productos (y sus precios/stock) se cargan.
  // Esto evita que se pueda crear una orden antes de que la validación de precios esté lista.
  if (productsLoading) {
    return (
      <div className="min-h-screen bg-gray-900 pt-24 pb-12 flex flex-col justify-center items-center text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mb-4"></div>
        <h2 className="text-xl font-semibold">Cargando Productos...</h2>
        <p className="text-gray-400">Asegurando que los precios y el stock estén al día.</p>
      </div>
    );
  }

  // FIX: Redireccionar solo después de que la carga haya terminado, para evitar flashes de contenido.
  if (!productsLoading && cartItems.length === 0) {
    navigate('/cart', { replace: true });
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-900 pt-24 pb-12">
      <Helmet>
        <title>{t.checkout.title} - Colshop</title>
        <meta name="description" content="Complete your purchase" />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <img src="/logo.png" alt="Colshop" className="h-16 w-auto mb-6" />
          <h1 className="text-4xl font-bold text-white mb-2">{t.checkout.title}</h1>
          <p className="text-gray-400">{t.checkout.subtitle}</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Information */}
            {!showPayment && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-purple-500/20"
              >
                <div className="flex items-center gap-2 mb-6">
                  <MapPin className="w-6 h-6 text-purple-400" />
                  <h2 className="text-2xl font-bold text-white">{t.checkout.shippingInfo}</h2>
                </div>

                <form onSubmit={handleShippingSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {t.checkout.form.fullName}
                    </label>
                    <input
                      type="text"
                      value={shippingInfo.fullName}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, fullName: e.target.value })}
                      required
                      className="w-full px-4 py-3 bg-gray-900/50 border border-purple-500/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
                      placeholder={t.checkout.form.placeholder.fullName}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={shippingInfo.email}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, email: e.target.value })}
                      required
                      className="w-full px-4 py-3 bg-gray-900/50 border border-purple-500/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
                      placeholder="tu@email.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {t.checkout.form.address}
                    </label>
                    <input
                      type="text"
                      value={shippingInfo.address}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value })}
                      required
                      className="w-full px-4 py-3 bg-gray-900/50 border border-purple-500/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
                      placeholder={t.checkout.form.placeholder.address}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        {t.checkout.form.city}
                      </label>
                      <input
                        type="text"
                        value={shippingInfo.city}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })}
                        required
                        className="w-full px-4 py-3 bg-gray-900/50 border border-purple-500/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
                        placeholder={t.checkout.form.placeholder.city}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        {t.checkout.form.postalCode}
                      </label>
                      <input
                        type="text"
                        value={shippingInfo.postalCode}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, postalCode: e.target.value })}
                        required
                        className="w-full px-4 py-3 bg-gray-900/50 border border-purple-500/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
                        placeholder={t.checkout.form.placeholder.postalCode}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      {t.checkout.form.country}
                    </label>
                    <input
                      type="text"
                      value={shippingInfo.country}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, country: e.target.value })}
                      required
                      className="w-full px-4 py-3 bg-gray-900/50 border border-purple-500/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
                      placeholder={t.checkout.form.placeholder.country}
                    />
                  </div>

                  <div className="flex items-center space-x-2 pt-2">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-purple-600 focus:ring-purple-500"
                    />
                    <label htmlFor="terms" className="text-sm text-gray-400">
                      {t.checkout.acceptTerms || "He leído y acepto los"} <a href="/terms" target="_blank" className="text-purple-400 hover:underline">Términos y Condiciones</a>
                    </label>
                  </div>

                  <Button
                    type="submit"
                    disabled={!termsAccepted}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 py-6 text-lg"
                  >
                    {t.checkout.continueToPayment}
                  </Button>
                </form>
              </motion.div>
            )}

            {/* Payment Form */}
            {showPayment && (
              <Suspense fallback={
                <div className="bg-gray-800/50 backdrop-blur-sm p-12 rounded-xl border border-purple-500/20 flex justify-center items-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                </div>
              }>
                <PaymentForm
                  amount={cartSubtotal}
                  cartItems={cartItems}
                  onCreateOrder={createPendingOrder}
                  onBack={() => setShowPayment(false)}
                />
              </Suspense>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-purple-500/20 sticky top-24">
              <h2 className="text-2xl font-bold text-white mb-6">{t.cart.summary}</h2>
              
              <div className="space-y-4 mb-6">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-400">
                      {item.name} x{item.quantity}
                    </span>
                    <span className="text-white font-medium">
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-purple-500/20 pt-4 space-y-3">
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
                  <span className="text-white">{formatCurrency(cartTax)}</span>
                </div>
                <div className="border-t border-purple-500/20 pt-3">
                  <div className="flex justify-between text-xl font-bold">
                    <span className="text-white">{t.cart.total}</span>
                    <span className="text-white">{formatCurrency(cartTotal)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;