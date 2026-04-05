import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CookieBanner = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      // Pequeño retraso para no ser intrusivo al cargar
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie_consent', 'true');
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-4 right-4 z-50 max-w-sm w-[calc(100%-2rem)]"
        >
          <div className="bg-gray-900/95 backdrop-blur-md border border-purple-500/20 p-4 rounded-xl shadow-2xl shadow-purple-900/20 flex flex-col sm:flex-row items-center gap-4">
            <div className="p-2 bg-purple-500/10 rounded-full shrink-0">
              <Cookie className="w-6 h-6 text-purple-400" />
            </div>
            <p className="text-sm text-gray-300 flex-grow text-center sm:text-left">
              Usamos cookies esenciales para asegurar tu sesión y compra. Al continuar, aceptas su uso.
            </p>
            <Button 
              onClick={handleAccept}
              size="sm"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white border border-white/10 whitespace-nowrap w-full sm:w-auto"
            >
              Entendido
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieBanner;