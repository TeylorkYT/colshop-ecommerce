import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Package, MessageSquare, CheckCircle, XCircle, Clock, HelpCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useDatabase } from '@/contexts/DatabaseContext';

const OrderCard = ({ order }) => {
  const { t } = useLanguage();
  const { formatCurrency, formatDate, getStatusDetails } = useDatabase();

  // FIX: Normalizar el estado para evitar fallos si la BD devuelve espacios o mayúsculas
  const orderStatus = String(order.status || '').trim().toLowerCase();

  // 0. FILTRO: Ocultar pedidos pendientes (solo mostrar Aprobados o Rechazados)
  if (orderStatus === 'pending') return null;

  // 1. FECHA: Usar formateador centralizado (soporta idiomas y corrección Safari)
  const formattedDate = formatDate(order.created_at);

  // 2. CORRECCIÓN ITEMS: Calcular la cantidad total de artículos sumando las cantidades
  let itemsCount = 0;
  try {
    // Si viene como string JSON, lo parseamos; si ya es objeto, lo usamos directo
    const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
    if (Array.isArray(items)) {
      itemsCount = items.reduce((total, item) => total + (item.quantity || 0), 0);
    }
  } catch (error) {
    console.error("Error leyendo items del pedido:", error);
  }

  // 3. CORRECCIÓN PRECIO: Asegurar que sea un número para evitar NaN
  const total = Number(order.total) || 0;

  // Obtener configuración visual desde el contexto (Centralizado y Traducido)
  const statusInfo = getStatusDetails(orderStatus);

  // Mapeo de iconos basado en el tipo devuelto por el contexto
  const StatusIcon = {
    check: CheckCircle,
    x: XCircle,
    clock: Clock,
    help: HelpCircle
  }[statusInfo.iconType] || HelpCircle;

  return (
    <div className={`relative p-px rounded-2xl transition-all duration-300 hover:scale-[1.01] hover:shadow-xl
      ${orderStatus === 'cancelled' ? 'bg-gradient-to-br from-red-500/20 to-gray-800/50' : 'bg-gradient-to-br from-purple-500/30 to-gray-800/50'}`}>
      <div className="bg-gray-900/60 backdrop-blur-xl p-6 rounded-[15px] h-full border border-white/5">

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Sección Izquierda: Información */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-white">
              {/* UI/UX: Mostramos solo los primeros 8 caracteres del ID para que no sea tan largo */}
              {t.dashboard.orderId.replace('{id}', String(order.id).substring(0, 8))}
            </h3>
            <span className={`px-3 py-1 rounded-full text-sm font-medium border flex items-center ${statusInfo.className}`}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {statusInfo.label}
            </span>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {formattedDate}
            </div>
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              {/* FIX: Renderizado seguro para evitar "{count} artículos" o crash */}
              {(itemsCount === 1 ? t.dashboard.items.one : t.dashboard.items.other).replace('{count}', itemsCount)}
            </div>
          </div>
        </div>

        {/* Sección Derecha: Precio y Acciones */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-2xl font-bold text-white">
              {formatCurrency(total)}
            </div>
            {orderStatus === 'cancelled' && (
              <div className="text-xs text-red-400">{t.dashboard.orderNotPaid}</div>
            )}
          </div>
          
          {/* Botón Ticket (Solo si está aprobado) */}
          {(orderStatus === 'completed' || orderStatus === 'processing') && (
            <Link 
              to={`/ticket/${order.id}`}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors h-10 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white"
            > 
              <MessageSquare className="w-4 h-4 mr-2" /> {/* Icono de mensaje */}
              {/* FIX SEGURIDAD: Prevenir que el botón desaparezca si falta la traducción */}
              {t.ticket?.button || 'Ver Ticket'}
            </Link>
          )}
        </div>
      </div>
      </div>
    </div>
  );
};

export default OrderCard;