import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDatabase } from '@/contexts/DatabaseContext';
import { useToast } from '@/components/ui/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

const PaymentStatus = () => {
  const [message, setMessage] = useState('Verificando tu pago, por favor espera...');
  const location = useLocation();
  const navigate = useNavigate();
  // FIX: Importar correctamente las funciones del contexto para evitar el error "is not defined"
  const { verifyPayment, refreshOrders } = useDatabase();
  const { toast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    const verify = async () => {
      const params = new URLSearchParams(location.search);
      const paymentId = params.get('payment_id');
      const status = params.get('status');
      const externalReference = params.get('external_reference'); // Este es el ID de tu orden

      if (!paymentId || !status) {
        toast({
          title: 'Error de Redirección',
          description: 'No se encontraron los datos del pago. Serás redirigido.',
          variant: 'destructive',
        });
        setTimeout(() => navigate('/cart'), 3000);
        return;
      }

      if (status === 'approved') {
        setMessage('Pago aprobado. Actualizando tu pedido...');
        try {
          const result = await verifyPayment(paymentId, 'mercadopago');
          
          if (result && result.success) {
            // FIX SEGURIDAD: Validar el estado real que devuelve el backend, no solo que la petición HTTP haya sido exitosa
            if (result.status === 'processing' || result.status === 'completed') {
              const finalOrderId = result.order_id || externalReference;
              toast({
                title: '¡Pago Confirmado!',
                description: `Tu pedido #${finalOrderId} ha sido actualizado.`,
              });
              await refreshOrders(); 
              navigate(`/ticket/${finalOrderId}`); 
            } else if (result.status === 'pending') {
              setMessage('Tu pago ha sido registrado, pero aún está pendiente de aprobación por el banco.');
              toast({ title: 'Pago Pendiente', description: 'Te notificaremos en cuanto se apruebe.' });
              await refreshOrders();
              setTimeout(() => navigate('/orders'), 5000);
            } else {
              setMessage('El pago fue rechazado o cancelado por la entidad bancaria.');
              toast({ title: 'Pago Rechazado', description: 'Tu orden no fue procesada.', variant: 'destructive' });
              setTimeout(() => navigate('/cart'), 5000);
            }
          } else {
            setMessage('Hubo un problema al verificar tu pago. Contacta a soporte si el problema persiste.');
            toast({
              title: 'Error de Verificación',
              description: result.message || 'No se pudo confirmar el pago con el servidor.',
              variant: 'destructive',
            });
            setTimeout(() => navigate('/orders'), 5000);
          }
        } catch (error) {
          console.error("Excepción durante la verificación del pago:", error);
          setMessage('Error de red al verificar el estado de tu pago. Por favor revisa tus pedidos.');
          toast({
            title: 'Interrupción de Red',
            description: 'No pudimos contactar al servidor, pero tu pago está seguro.',
            variant: 'destructive',
          });
          setTimeout(() => navigate('/orders'), 5000);
        }
      } else if (status === 'pending') {
         setMessage('Tu pago está pendiente. Serás notificado cuando se apruebe.');
         toast({
            title: 'Pago Pendiente',
            description: 'Tu pedido se actualizará una vez que el pago sea aprobado por Mercado Pago.',
         });
         await refreshOrders();
         setTimeout(() => navigate('/orders'), 5000);
      } else { // rejected, cancelled, etc.
         setMessage('El pago fue rechazado o cancelado.');
         toast({
            title: 'Pago Fallido',
            description: 'Puedes intentar nuevamente desde el carrito.',
            variant: 'destructive',
         });
         setTimeout(() => navigate('/cart'), 5000);
      }
    };

    verify();
  }, [location, navigate, verifyPayment, refreshOrders, toast, t]);

  return (
    <div className="min-h-screen bg-gray-900 pt-24 pb-12 flex flex-col justify-center items-center text-white">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mb-4"></div>
      <h2 className="text-xl font-semibold">{message}</h2>
      <p className="text-gray-400">Serás redirigido en unos segundos...</p>
    </div>
  );
};

export default PaymentStatus;