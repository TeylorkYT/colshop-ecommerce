import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Package } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useDatabase } from '@/contexts/DatabaseContext';
import { useLanguage } from '@/contexts/LanguageContext';
import OrderCard from './OrderCard'; // 1. IMPORTAR OrderCard

const UserDashboard = () => {
  const { currentUser } = useAuth();
  const { getUserOrders } = useDatabase();
  const { t } = useLanguage();

  // 2. OBTENER ORDENES: La lógica para obtener ordenes permanece igual
  const orders = getUserOrders(currentUser?.id);

  // 3. SIMPLIFICACIÓN: Se eliminan getStatusColor, getStatusText, formatPrice
  //    Toda la lógica de renderizado se delega a OrderCard.

  return (
    <div className="min-h-screen bg-gray-900 pt-24 pb-12">
      <Helmet>
        <title>{t.dashboard.title} - Colshop</title>
        <meta name="description" content="View your order history and details" />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">{t.dashboard.title}</h1>
          <p className="text-gray-400">{t.dashboard.subtitle}</p>
        </motion.div>

        {/* User Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-sm p-6 rounded-xl border border-purple-500/20 mb-8"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {currentUser?.email?.[0].toUpperCase() || '?'}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{currentUser?.email}</h2>
              <p className="text-gray-400">
                {/* FIX: Añadida verificación para evitar crash si no hay createdAt */}
                {currentUser?.createdAt 
                  ? t.dashboard.memberSince.replace('{date}', new Date(currentUser.createdAt).toLocaleDateString())
                  : 'Miembro reciente'}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Orders List */}
        {/* 4. REFACTORIZACIÓN: Lógica de renderizado de ordenes */}
        {(!orders || orders.length === 0) ? (
          <div className="text-center py-16">
            <Package className="w-24 h-24 mx-auto text-gray-600 mb-6" />
            <h2 className="text-2xl font-bold text-white mb-4">{t.dashboard.noOrders}</h2>
            <p className="text-gray-400">{t.dashboard.noOrdersDesc}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* 5. USAR OrderCard: Mapeamos las ordenes y renderizamos el componente OrderCard */}
            {orders.map((order) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <OrderCard order={order} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;