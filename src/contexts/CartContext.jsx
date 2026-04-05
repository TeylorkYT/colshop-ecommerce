import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useDatabase } from '@/contexts/DatabaseContext';
import { useToast } from '@/components/ui/use-toast';

const CartContext = createContext();

// Nota: El componente CouponInput ahora debería ser importado en los componentes 
// de vista (como CartDrawer o CheckoutPage) y no aquí, para mantener el contexto limpio.

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const { products } = useDatabase(); // Fuente de la verdad para precios y stock
  const { toast } = useToast();
  
  // 1. Persistencia: Cargar del localStorage al iniciar
  const [cart, setCart] = useState(() => {
    try {
      const savedCart = localStorage.getItem('colshop_cart');
      
      // ROBUST FIX: Parseo seguro con fallback explícito
      // Si savedCart es null o "null", el || [] garantiza un array.
      const parsedCart = JSON.parse(savedCart) || [];
      
      // QA FIX: Validación de Estructura (Persistencia Corrupta)
      // Si el JSON es válido pero no es un array (ej: objeto, null, string), reseteamos.
      if (!Array.isArray(parsedCart)) {
        console.warn("Estructura de carrito corrupta (No es Array). Reseteando.");
        return [];
      }

      // QA FIX: Sanitización de Items
      // Filtramos items que no tengan ID o tengan cantidades inválidas
      return parsedCart.filter(item => item && item.id != null && typeof item.quantity === 'number' && item.quantity > 0);
    } catch (error) {
      console.error("Error parsing cart from localStorage:", error);
      return [];
    }
  });

  // Persistencia: Guardar en localStorage cada vez que cambie el carrito
  useEffect(() => {
    localStorage.setItem('colshop_cart', JSON.stringify(cart));
  }, [cart]);

  // Impuesto / Comisión de Mercado Pago centralizado (5%)
  const TAX_RATE = 0.05;

  const { appliedCoupon } = useDatabase();

  // 3. Manipulación de Precios (Blindaje Visual)
  const cartSubtotal = useMemo(() => {
    // FIX: Defensive coding (cart || []) para evitar crash si cart es undefined
    return (cart || []).reduce((total, item) => {
      const product = products.find(p => p.id === item.id);
      // Si el producto existe en la BD, usamos su precio actual. Si no (carga), usamos el del item.
      const price = product ? Number(product.price) : Number(item.price);
      return total + (price * item.quantity);
    }, 0);
  }, [cart, products]);

  // --- CÁLCULO PROFESIONAL DE TOTALES CON CUPÓN ---
  const discountAmount = useMemo(() => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.type === 'percentage') {
      return Math.round(cartSubtotal * (appliedCoupon.value / 100));
    }
    return Math.min(appliedCoupon.value, cartSubtotal);
  }, [appliedCoupon, cartSubtotal]);

  const subtotalAfterDiscount = Math.max(0, cartSubtotal - discountAmount);

  // Calcular impuestos y total final basado en el valor neto
  const cartTax = useMemo(() => Math.round(subtotalAfterDiscount * TAX_RATE), [subtotalAfterDiscount]);
  const cartTotal = useMemo(() => subtotalAfterDiscount + cartTax, [subtotalAfterDiscount, cartTax]);

  const itemCount = useMemo(() => {
    // FIX: Defensive coding
    return (cart || []).reduce((total, item) => {
      const dbProduct = products.find(p => p.id === item.id);
      const isRobux = item.id === 'robux-currency' || (dbProduct && dbProduct.category === 'robux');
      return total + (isRobux ? 1 : item.quantity);
    }, 0);
  }, [cart, products]);

  // 2. Validación de Cantidad y Refactorización Blindada
  const addToCart = useCallback((product, quantity = 1) => {
    // QA FIX: Evitar crash si el producto es undefined/null
    if (!product || !product.id) return;

    // HACKER FIX: Forzar entero positivo para evitar "Truco del Precio Negativo" o decimales
    // Math.max(1, ...) asegura que nunca sea 0 o negativo.
    const safeQuantity = Math.max(1, Math.floor(Number(quantity) || 1));

    // Validación: Stock real desde DatabaseContext
    const dbProduct = products.find(p => p.id === product.id);
    const currentStock = dbProduct ? dbProduct.stock : product.stock;

    if (currentStock < safeQuantity) {
      toast({ title: "Stock insuficiente", description: `Solo quedan ${currentStock} unidades.`, variant: "destructive" });
      return;
    }

    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      
      if (existingItem) {
        // Validar que la suma no exceda el stock
        if (currentStock < (existingItem.quantity + safeQuantity)) {
           toast({ title: "Stock límite alcanzado", description: "No puedes agregar más unidades de las disponibles.", variant: "destructive" });
           return prevCart;
        }

        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + safeQuantity }
            : item
        );
      }

      // Al agregar, usamos el precio actual del DatabaseContext si es posible
      return [...prevCart, {
        id: product.id,
        name: product.name,
        image: product.image,
        price: dbProduct ? Number(dbProduct.price) : Number(product.price),
        quantity: safeQuantity
      }];
    });

    toast({ 
      title: "Agregado al carrito", 
      description: (
        <div className="flex flex-col gap-1 mt-1">
          <span>{product.name} x{safeQuantity}</span>
          <Link to="/cart" className="inline-flex items-center text-purple-400 hover:text-purple-300 font-semibold text-sm transition-colors mt-1">
            Ir al carrito <span className="ml-1" aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      ) 
    });
  }, [products, toast]);

  const removeFromCart = useCallback((productId) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId, newQuantity) => {
    if (newQuantity < 1) {
        removeFromCart(productId);
        return;
    }

    const dbProduct = products.find(p => p.id === productId);
    const currentStock = dbProduct ? dbProduct.stock : 999; // Fallback si no carga

    if (newQuantity > currentStock) {
        toast({ title: "Stock insuficiente", description: `Solo quedan ${currentStock} unidades.`, variant: "destructive" });
        return;
    }

    setCart(prev => prev.map(item => 
      item.id === productId ? { ...item, quantity: newQuantity } : item
    ));
  }, [products, removeFromCart, toast]);

  // 4. QA FIX: Función segura para modificar cantidades (evita Race Conditions en UI)
  // Usa deltas (+1, -1) en lugar de valores absolutos para que los clics rápidos se acumulen correctamente.
  const changeQuantity = useCallback((productId, delta) => {
    setCart(prevCart => {
      const item = prevCart.find(i => i.id === productId);
      if (!item) return prevCart;

      const newQty = item.quantity + delta;
      
      // Validaciones atómicas dentro del callback
      if (newQty < 1) return prevCart.filter(i => i.id !== productId);
      
      const dbProduct = products.find(p => p.id === productId);
      const maxStock = dbProduct ? dbProduct.stock : item.stock;

      if (newQty > maxStock) {
        // Nota: Side-effect en render es riesgoso, pero necesario para feedback inmediato aquí
        toast({ title: "Stock límite alcanzado", description: `Solo quedan ${maxStock} unidades.`, variant: "destructive" });
        return prevCart;
      }

      return prevCart.map(i => 
        i.id === productId ? { ...i, quantity: newQty } : i
      );
    });
  }, [products, toast]);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const value = useMemo(() => ({
    cart: cart || [], // FIX: Asegurar que nunca se exporte como undefined
    cartSubtotal,
    discountAmount,
    cartTax,
    cartTotal,
    itemCount,
    addToCart,
    removeFromCart,
    updateQuantity,
    changeQuantity, // Exportamos la nueva función segura
    clearCart
  }), [cart, cartSubtotal, cartTax, cartTotal, itemCount, addToCart, removeFromCart, updateQuantity, changeQuantity, clearCart]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};