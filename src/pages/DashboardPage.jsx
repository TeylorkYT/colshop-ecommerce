import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useDatabase } from '@/contexts/DatabaseContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Package, CheckCircle, XCircle, MessageSquare, Copy, MapPin, Clock, AlertCircle, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

const DashboardPage = () => {
  const { currentUser } = useAuth();
  // FIX: Importar formatCurrency del contexto global para respetar las tasas de cambio de toda la tienda
  const { getUserOrders, refreshOrders, formatCurrency } = useDatabase();
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    if (currentUser) {
      refreshOrders();
    }
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-900 pt-24 flex items-center justify-center">
        <div className="text-white">Inicia sesión para ver tus pedidos.</div>
      </div>
    );
  }

  const orders = getUserOrders(currentUser.id);
  
  const sortedOrders = useMemo(() => {
    return [...orders].sort((a, b) => {
      const getDate = (d) => {
        if (!d) return 0;
        const date = new Date(d.replace(' ', 'T'));
        return isNaN(date.getTime()) ? 0 : date.getTime();
      };
      const dateA = getDate(a.created_at);
      const dateB = getDate(b.created_at);
      return dateB - dateA;
    });
  }, [orders]);

  const filteredOrders = useMemo(() => {
    return sortedOrders.filter(order => {
      if (activeTab === 'all') return true;
      return order.status === activeTab;
    });
  }, [sortedOrders, activeTab]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "ID Copiado",
      description: "El ID del pedido se ha copiado al portapapeles.",
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      // Intento 1: Formato ISO directo
      const isoDate = dateString.replace(' ', 'T');
      let date = new Date(isoDate);
      // Intento 2: Si falla, usar string original (algunos navegadores son flexibles)
      if (isNaN(date.getTime())) date = new Date(dateString);
      
      if (isNaN(date.getTime())) return dateString; // Devolver string original si todo falla
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return dateString || 'N/A';
    }
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'completed':
        return { color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', icon: <CheckCircle className="w-4 h-4"/>, label: t.dashboard.status.completed };
      case 'processing':
        return { color: 'text-blue-400 bg-blue-500/10 border-blue-500/20', icon: <Clock className="w-4 h-4"/>, label: t.dashboard.status.processing || 'En Proceso' };
      case 'pending':
        return { color: 'text-amber-400 bg-amber-500/10 border-amber-500/20', icon: <Clock className="w-4 h-4"/>, label: t.dashboard.status.pending };
      case 'cancelled':
        return { color: 'text-rose-400 bg-rose-500/10 border-rose-500/20', icon: <XCircle className="w-4 h-4"/>, label: t.dashboard.status.cancelled };
      default:
        return { color: 'text-gray-400 bg-gray-500/10 border-gray-500/20', icon: <AlertCircle className="w-4 h-4"/>, label: status };
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">{t.dashboard.title}</h1>
          <p className="text-gray-400 text-lg">{t.dashboard.subtitle}</p>
        </div>

        {/* Pestañas de Filtro */}
        <div className="flex justify-center gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          {[
            { id: 'all', label: 'Todos' },
            { id: 'completed', label: t.dashboard.status.completed },
            { id: 'processing', label: t.dashboard.status.processing || 'En Proceso' },
            { id: 'pending', label: t.dashboard.status.pending },
            { id: 'cancelled', label: t.dashboard.status.cancelled }
          ].map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "outline"}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap rounded-full px-6 ${
                activeTab === tab.id 
                  ? 'bg-purple-600 hover:bg-purple-700 border-transparent' 
                  : 'border-purple-500/20 hover:bg-purple-500/10 text-gray-300'
              }`}
            >
              {tab.label}
            </Button>
          ))}
        </div>

        {(!filteredOrders || filteredOrders.length === 0) ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-purple-500/20 p-12 text-center"
          >
            <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">{t.dashboard.noOrders}</h3>
            <p className="text-gray-400 mb-6">{t.dashboard.noOrdersDesc}</p>
            <Link to="/catalog">
              <Button className="bg-purple-600 hover:bg-purple-700">
                {t.home.browseCatalog}
              </Button>
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => {
              // FIX: Normalizar el estado (minúsculas y sin espacios) para evitar fallos de igualdad estricta
              const orderStatus = String(order.status || '').trim().toLowerCase();
              const statusConfig = getStatusConfig(orderStatus);
              // Protección adicional en frontend: si total falla, usa 0
              const orderTotal = parseFloat(order.total) || 0;
              const orderItems = Array.isArray(order.items) ? order.items : [];
              
              return (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                key={order.id}
                className="group relative rounded-2xl border border-white/5 bg-gray-800/30 backdrop-blur-md overflow-hidden hover:bg-gray-800/50 hover:border-white/10 transition-all duration-300 shadow-xl"
              >
                {/* Decorative status top border */}
                <div className={`absolute top-0 left-0 right-0 h-[3px] ${
                  orderStatus === 'completed' ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' :
                  orderStatus === 'processing' ? 'bg-gradient-to-r from-blue-500 to-purple-500' :
                  orderStatus === 'pending' ? 'bg-gradient-to-r from-amber-500 to-orange-400' :
                  'bg-gradient-to-r from-rose-500 to-red-400'
                } opacity-80`} />

                <div className="p-6">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                      <div className="flex items-center gap-3 mb-1.5">
                        <h3 className="text-xl font-bold text-white tracking-tight">
                          {/* FIX: Castear ID a String de forma segura para evitar Crash si es numérico */}
                          Pedido <span className="text-gray-400 font-mono text-lg ml-1">#{String(order.id).slice(0, 8).toUpperCase()}</span>
                        </h3>
                        <button 
                          onClick={() => copyToClipboard(order.id)}
                          className="p-1.5 text-gray-500 hover:text-white hover:bg-white/10 rounded-md transition-colors"
                          title="Copiar ID Completo"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Calendar className="w-4 h-4" />
                        {formatDate(order.created_at)}
                      </div>
                    </div>
                    
                    <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-sm font-medium border ${statusConfig.color}`}>
                      {statusConfig.icon}
                      {statusConfig.label}
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent mb-6" />

                  {/* Content Split: Items & Summary */}
                  <div className="flex flex-col md:flex-row gap-8">
                    
                    {/* Items List */}
                    <div className="flex-1 space-y-3">
                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Artículos del Pedido</h4>
                      {orderItems.map((item, idx) => {
                        // FIX: Normalizar variables primero para cálculos limpios
                        const qty = item.quantity || 1;
                        const itemPrice = Number(item.price) || 0;
                        
                        return (
                          <div key={idx} className="flex items-center gap-4 group/item">
                          <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-gray-900 border border-white/5 flex-shrink-0">
                            {item.image ? (
                              <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-500"/>
                            ) : (
                              <Package className="w-5 h-5 absolute inset-0 m-auto text-gray-600" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-200 truncate">{item.name}</p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {qty} {qty === 1 ? 'unidad' : 'unidades'} × {formatCurrency(itemPrice)}
                            </p>
                          </div>
                          <div className="text-sm font-semibold text-white">
                            {formatCurrency(itemPrice * qty)}
                          </div>
                        </div>
                        );
                      })}

                      {/* Shipping Info */}
                      {order.shippingInfo && Object.keys(order.shippingInfo).length > 0 && (
                        <div className="mt-6 p-4 bg-gray-900/50 rounded-xl border border-white/5 flex gap-3 items-start">
                          <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                          <div className="text-xs text-gray-400 space-y-1">
                            <p className="text-gray-300 font-medium mb-2 uppercase tracking-wider text-[10px]">Dirección de Envío</p>
                            <p className="text-gray-300">{order.shippingInfo.fullName}</p>
                            <p>{order.shippingInfo.address}, {order.shippingInfo.city}</p>
                            <p>{order.shippingInfo.country} • {order.shippingInfo.postalCode}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right Sidebar: Summary & Actions */}
                    <div className="md:w-72 flex flex-col justify-between bg-gray-900/40 rounded-2xl p-5 border border-white/5">
                      <div className="space-y-4 mb-6">
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Resumen del Pago</h4>
                        
                        {/* Subtotal antes de descuentos */}
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-400">Subtotal</span>
                          <span className="text-gray-300">
                            {formatCurrency(orderItems.reduce((acc, item) => acc + (Number(item.price) * (item.quantity || 1)), 0))}
                          </span>
                        </div>
                        
                        {/* Descuento aplicado */}
                        {parseFloat(order.discount_amount) > 0 && (
                          <div className="flex justify-between items-center text-sm text-emerald-400">
                            <span className="flex items-center gap-1">Descuento {order.coupon_code && <span className="text-[10px] bg-emerald-500/20 px-1.5 rounded">({order.coupon_code})</span>}</span>
                            <span>-{formatCurrency(order.discount_amount)}</span>
                          </div>
                        )}

                        <div className="h-px w-full bg-white/5" />
                        
                        <div className="flex justify-between items-end">
                          <span className="text-sm text-gray-400">Total</span>
                          <span className="text-2xl font-bold text-white tracking-tight">
                            {formatCurrency(orderTotal)}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="space-y-3 mt-auto">
                        {(orderStatus === 'completed' || orderStatus === 'processing') && (
                          <Link to={`/ticket/${order.id}`} className="block">
                            <Button className="w-full relative group overflow-hidden bg-purple-600 hover:bg-purple-500 text-white border-none shadow-[0_0_20px_rgba(147,51,234,0.3)] hover:shadow-[0_0_25px_rgba(168,85,247,0.5)] transition-all duration-300 h-12 rounded-xl">
                              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-purple-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                              <span className="relative flex items-center justify-center gap-2 text-base font-semibold">
                                <MessageSquare className="w-5 h-5" />
                                {t.ticket?.button || 'Acceder al Ticket'}
                              </span>
                            </Button>
                          </Link>
                        )}
                        {orderStatus === 'pending' && (
                          <div className="text-center px-4 py-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400 text-sm font-medium">
                            Esperando confirmación de pago
                          </div>
                        )}
                      </div>
                    </div>

                  </div>
                </div>
              </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;