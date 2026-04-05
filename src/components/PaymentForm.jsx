import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Lock, AlertTriangle, CheckSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { useDatabase } from '@/contexts/DatabaseContext';

const PaymentForm = ({ amount, cartItems, onCreateOrder, onBack }) => {
  const { toast } = useToast();
  const { t, language } = useLanguage();
  const { formatCurrency, config } = useDatabase();
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Estados para checkboxes de términos y condiciones
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedStreaming, setAcceptedStreaming] = useState(false);
  const [acceptedAccountRisk, setAcceptedAccountRisk] = useState(false);

  // Usamos la lógica centralizada del contexto
  // FIX: Recalcular total desde items para ignorar impuestos del carrito (10%) y cobrar solo el valor real del producto
  const numericAmount = useMemo(() => {
    if (cartItems && cartItems.length > 0) {
      return cartItems.reduce((sum, item) => sum + (Number(item.price) * (item.quantity || 1)), 0);
    }
    return Number(amount) || 0;
  }, [cartItems, amount]);

  // FIX: Agregar comisión/impuesto de Mercado Pago (Ej: 5%)
  const TAX_RATE = 0.05; 
  const totalWithFee = numericAmount * (1 + TAX_RATE);

  // Detectar tipos de productos en el carrito
  const hasStreaming = cartItems?.some(item => item.category === 'streaming');
  const hasAccounts = cartItems?.some(item => ['minecraft', 'fortnite'].includes(item.category));

  const handleMercadoPagoPayment = async () => {
    setIsProcessing(true);

    try {
      // 1. Crear el pedido en base de datos primero
      // FIX: Pasar el estado de aceptación de términos al crear la orden para pasar la validación del Context
      // FIX CRÍTICO: Pasar también los 'items' y el 'total'. Si no se pasan, el Context rechaza la orden por falta de productos.
      const order = await onCreateOrder({ 
        items: cartItems,
        taxRate: TAX_RATE, // FIX: Enviar la tasa de impuesto para que el Context la aplique al total
        termsAccepted: acceptedTerms 
      });
      
      if (!order) {
        throw new Error("No se pudo crear la orden");
      }

      // Calcular el valor exacto de la comisión para agregarla como item en Mercado Pago
      const subtotal = order.items.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);
      const feeAmount = Math.round(subtotal * TAX_RATE); // FIX: Redondear para evitar decimales que MP pueda rechazar

      // Crear lista de items para MP incluyendo la comisión
      // FIX: Mapear explícitamente a la estructura que espera Mercado Pago (title, unit_price, quantity)
      const preferenceItems = order.items.map(item => ({
        id: item.id,
        title: item.name, // Mercado Pago usa 'title', no 'name'
        quantity: Number(item.quantity),
        unit_price: Number(item.price), // Mercado Pago usa 'unit_price', no 'price'
        currency_id: 'COP', // Moneda explícita
        picture_url: item.image,
        description: item.description
      }));

      if (feeAmount > 0) {
        preferenceItems.push({
          id: 'fee-mp',
          title: 'Comisión Mercado Pago / Impuestos',
          quantity: 1,
          unit_price: feeAmount,
          currency_id: 'COP' // Asegúrate de usar la moneda correcta
        });
      }

      // 2. Create preference on the backend
      const response = await fetch('/api/create_preference.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // FIX: Enviar cookie de sesión
        body: JSON.stringify({
          items: preferenceItems, // FIX: Enviar items + comisión a Mercado Pago
          shippingInfo: order.shippingInfo,
          orderId: order.id
        }),
      });

      const preference = await response.json();

      // FIX: Redireccionar automáticamente a Mercado Pago (comportamiento tipo ePayco)
      if (preference.init_point) {
        toast({
          title: 'Conectando con Mercado Pago',
          description: 'Serás redirigido para completar tu pago de forma segura.',
        });
        window.location.href = preference.init_point;
      } else {
        // Loguear el error real de MP para depuración
        console.error("Error Mercado Pago:", preference);
        throw new Error(preference.message || 'No se pudo generar el link de pago');
      }

    } catch (error) {
      console.error("Error en proceso de pago:", error);
      // Solo mostramos el toast genérico si no es el error de "No se pudo crear la orden"
      // ya que ese caso ya mostró su propio toast específico en el contexto.
      if (error.message !== "No se pudo crear la orden") {
        toast({
          title: 'Error',
          description: 'Hubo un error al procesar el pago. Por favor, intenta de nuevo.',
          variant: 'destructive',
        });
      }
      setIsProcessing(false); // Solo desbloqueamos si hubo error. Si redirige, mantenemos el loading.
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-gray-900/40 backdrop-blur-xl p-8 rounded-2xl border border-white/10 shadow-2xl"
    >
      <div className="flex items-center gap-2 mb-6">
        <CreditCard className="w-6 h-6 text-orange-500" />
        <h2 className="text-2xl font-bold text-white">{t.checkout.paymentDetails}</h2>
        {/* Indicador visual para saber si estamos en modo desarrollo/pruebas */}
        {!import.meta.env.PROD && (
          <span className="ml-auto px-2 py-1 bg-yellow-500/10 text-yellow-500 text-xs font-mono rounded border border-yellow-500/20">
            {t.checkout.testMode}
          </span>
        )}
      </div>

      <div className="mb-6 p-5 bg-black/20 border border-white/10 rounded-xl backdrop-blur-md">
        <div className="flex items-center gap-2 text-purple-400 mb-2">
          <Lock className="w-4 h-4" />
          <span className="text-sm font-medium">{t.checkout.securePaymentMercadoPago}</span>
        </div>
        
        {/* Desglose de tarifa */}
        <div className="mt-3 pt-3 border-t border-purple-500/20 text-sm space-y-1">
            <div className="flex justify-between text-gray-400">
                <span>Subtotal:</span>
                <span>{formatCurrency(numericAmount)}</span>
            </div>
            <div className="flex justify-between text-gray-400">
                <span>Comisión MP (5%):</span>
                <span>{formatCurrency(totalWithFee - numericAmount)}</span>
            </div>
            <div className="flex justify-between font-bold text-white pt-1">
                <span>{t.checkout.totalToPay}:</span>
                <span>{formatCurrency(totalWithFee)}</span>
            </div>
        </div>

        <p className="text-xs text-gray-400 mt-3">
          {t.checkout.redirectMessage}
        </p>
      </div>

      {/* Validaciones y Términos */}
      <div className="space-y-4 mb-6">
        {hasStreaming && (
          <div className="flex items-start gap-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <input 
              type="checkbox" 
              id="streaming-terms"
              checked={acceptedStreaming}
              onChange={(e) => setAcceptedStreaming(e.target.checked)}
              className="mt-1 w-4 h-4 rounded border-gray-600 text-purple-600 focus:ring-purple-500 bg-gray-800"
            />
            <label htmlFor="streaming-terms" className="text-sm text-gray-300 cursor-pointer">
              Entiendo que si cambio el <strong>correo</strong> o la <strong>contraseña</strong> de la cuenta de streaming, perderé la garantía inmediatamente.
            </label>
          </div>
        )}

        {hasAccounts && (
          <div className="flex items-start gap-3 p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
            <input 
              type="checkbox" 
              id="account-terms"
              checked={acceptedAccountRisk}
              onChange={(e) => setAcceptedAccountRisk(e.target.checked)}
              className="mt-1 w-4 h-4 rounded border-gray-600 text-purple-600 focus:ring-purple-500 bg-gray-800"
            />
            <label htmlFor="account-terms" className="text-sm text-gray-300 cursor-pointer">
              Acepto que estoy comprando una cuenta de terceros y asumo el riesgo asociado a los Términos de Servicio del juego.
            </label>
          </div>
        )}

        <div className="flex items-center gap-3 pt-2">
          <input 
            type="checkbox" 
            id="general-terms"
            checked={acceptedTerms}
            onChange={(e) => setAcceptedTerms(e.target.checked)}
            className="w-4 h-4 rounded border-gray-600 text-purple-600 focus:ring-purple-500 bg-gray-800"
          />
          <label htmlFor="general-terms" className="text-sm text-gray-400 cursor-pointer">
            He leído y acepto los <a href="/terms" target="_blank" className="text-purple-400 hover:text-purple-300 underline">Términos y Condiciones</a>
          </label>
        </div>
      </div>

        <div className="pt-4 space-y-3">
            <Button
              onClick={handleMercadoPagoPayment}
              disabled={isProcessing || !acceptedTerms || (hasStreaming && !acceptedStreaming) || (hasAccounts && !acceptedAccountRisk)}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 py-6 text-lg font-bold shadow-lg shadow-orange-900/20 border border-white/10 rounded-xl"
            >
              {isProcessing ? (
                "Redirigiendo a Mercado Pago..."
              ) : (
                t.checkout.payWith.replace('{amount}', formatCurrency(totalWithFee))
              )}
            </Button>

          <Button
            type="button"
            onClick={onBack}
            variant="outline"
            disabled={isProcessing}
            className="w-full border-white/10 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white py-6 rounded-xl"
          >
            {t.checkout.backToShipping}
          </Button>
        </div>
    </motion.div>
  );
};

// Optimización: React.memo para evitar re-renderizados durante el proceso de checkout
export default React.memo(PaymentForm);