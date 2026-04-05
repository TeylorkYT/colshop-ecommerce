import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2, Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDatabase } from '@/contexts/DatabaseContext';

const PaymentResponse = () => {
  const [searchParams] = useSearchParams();
  const { refreshOrders, verifyPayment } = useDatabase();
  const navigate = useNavigate();
  const ref_payco = searchParams.get('ref_payco');
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (ref_payco) {
      handleVerification();
    } else {
      setStatus('error');
    }
  }, [ref_payco]);

  const handleVerification = async () => {
    try {
      // Usamos la función centralizada del contexto
      const data = await verifyPayment(ref_payco);
      
      // Actualizamos la lista de pedidos para que el usuario vea el nuevo estado en su dashboard
      await refreshOrders();

      if (data.status === 'completed') {
        setStatus('success');
        setTimeout(() => navigate('/orders'), 3000);
      } else if (data.status === 'pending') {
        setStatus('pending');
        setErrorMessage(data.message);
      } else if (data.status === 'cancelled') {
        setStatus('cancelled');
        setErrorMessage(data.message);
      } else {
        setStatus('error');
        setErrorMessage(data.message || 'Error desconocido al verificar el pago.');
      }
    } catch (error) {
      console.error(error);
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 pt-24 px-4 flex items-center justify-center">
      <div className="bg-gray-800 p-8 rounded-xl border border-purple-500/20 text-center max-w-md w-full">
        {status === 'loading' && (
          <>
            <Loader2 className="w-16 h-16 text-purple-500 animate-spin mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Verificando pago...</h2>
            <p className="text-gray-400">Por favor espera un momento.</p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">¡Pago Aprobado!</h2>
            <p className="text-gray-400 mb-6">Tu ticket ha sido creado. Redirigiendo a tus pedidos...</p>
            <Button onClick={() => navigate('/orders')} className="bg-green-600 hover:bg-green-700">
              Ir a Mis Pedidos
            </Button>
          </>
        )}

        {status === 'pending' && (
          <>
            <Clock className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Pago Pendiente</h2>
            <p className="text-gray-400 mb-6">{errorMessage || "Tu pago está siendo procesado. Te notificaremos cuando se complete."}</p>
            <Button onClick={() => navigate('/orders')} className="bg-yellow-600 hover:bg-yellow-700">
              Ir a Mis Pedidos
            </Button>
          </>
        )}

        {status === 'cancelled' && (
          <>
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Pago Rechazado</h2>
            <p className="text-gray-400 mb-6">{errorMessage || "La transacción fue rechazada o cancelada."}</p>
            <Button onClick={() => navigate('/cart')} variant="outline">
              Intentar de nuevo
            </Button>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Pago no completado</h2>
            <p className="text-gray-400 mb-6">{errorMessage || "No se pudo verificar el pago o fue rechazado."}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={handleVerification} className="bg-purple-600 hover:bg-purple-700">
                Reintentar Verificación
              </Button>
              <Button onClick={() => navigate('/cart')} variant="outline">
                Volver al Carrito
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentResponse;
