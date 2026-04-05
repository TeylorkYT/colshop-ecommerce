import React, { useState } from 'react';
import { useDatabase } from '@/contexts/DatabaseContext';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Ticket, X, Check, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CouponInput = () => {
  const [code, setCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const { validateCoupon, appliedCoupon, setAppliedCoupon } = useDatabase();
  const { cartSubtotal } = useCart();
  const { currentUser } = useAuth();
  const { toast } = useToast();

  const handleApply = async () => {
    if (!code.trim()) return;
    
    setIsValidating(true);
    try {
      const result = await validateCoupon(code, cartSubtotal, currentUser?.id);
      if (result.success) {
        toast({ title: "¡Cupón aplicado!", description: `Se ha aplicado el código ${result.coupon.code}.` });
        setCode('');
      } else {
        toast({ title: "Error", description: result.message || "Cupón inválido", variant: "destructive" });
      }
    } finally {
      setIsValidating(false);
    }
  };

  const handleRemove = () => {
    setAppliedCoupon(null);
    toast({ title: "Cupón removido", description: "El descuento ha sido eliminado del carrito." });
  };

  return (
    <div className="py-2">
      <AnimatePresence mode="wait">
        {appliedCoupon ? (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex items-center justify-between p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg"
          >
            <div className="flex items-center gap-2.5">
              <div className="bg-emerald-500/20 p-1.5 rounded-full">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-emerald-500/70 uppercase font-bold tracking-wider">Cupón Activado</span>
                <span className="text-sm font-semibold text-emerald-400">{appliedCoupon.code}</span>
              </div>
            </div>
            <button 
              onClick={handleRemove}
              className="p-2 hover:bg-emerald-500/20 rounded-lg transition-colors text-emerald-400"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-2.5"
          >
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Ticket className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  placeholder="Código de descuento"
                  value={code}
                  // FIX: Eliminar espacios automáticamente y forzar mayúsculas
                  onChange={(e) => setCode(e.target.value.replace(/\s/g, '').toUpperCase())}
                  className="flex h-11 w-full rounded-md border border-white/10 bg-gray-900/50 px-3 py-2 text-sm pl-9 text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500/50 transition-all outline-none"
                  onKeyDown={(e) => e.key === 'Enter' && handleApply()}
                />
              </div>
              <Button 
                onClick={handleApply}
                disabled={isValidating || !code.trim()}
                className="bg-purple-600 hover:bg-purple-500 h-11 px-5 font-bold transition-all active:scale-95 disabled:opacity-50"
              >
                {isValidating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Aplicar'}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CouponInput;