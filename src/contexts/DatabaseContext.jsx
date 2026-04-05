import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

const DatabaseContext = createContext();

export const useDatabase = () => {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error('useDatabase must be used within DatabaseProvider');
  }
  return context;
};

const initialCategories = [
  { id: 'streaming', name: 'Streaming', icon: 'Video' },
  { id: 'robux', name: 'Robux', icon: 'Gem', type: 'calculator' },
  { id: 'gamepasses', name: 'Gamepasses', icon: 'Ticket' },
  { id: 'minecraft', name: 'Minecraft', icon: 'Box' },
  { id: 'fortnite', name: 'Fortnite', icon: 'Zap' },
  { id: 'clash-royale', name: 'Clash Royale', icon: 'Crown' },
  { id: 'ingame-items', name: 'Items In-Game', icon: 'Sword' } // Nueva categoría con icono de espada
];

const SUPPORTED_GAMES = [
  { id: 'blox-fruits', name: 'Blox Fruits' },
  { id: 'pet-simulator-99', name: 'Pet Simulator 99' },
  { id: 'adopt-me', name: 'Adopt Me' },
  { id: 'murder-mystery-2', name: 'Murder Mystery 2' },
  { id: 'da-hood', name: 'Da Hood' }
];

const DELIVERY_METHODS = [
  { id: 'trade', name: 'Trade / Intercambio' },
  { id: 'gift', name: 'Gift / Regalo' }
];

const initialProducts = [
  {
    id: '1',
    name: 'Netflix Premium 1 Month',
    category: 'streaming',
    price: 64000,
    stock: 50,
    description: 'Suscripción Netflix Premium por 1 mes. Incluye streaming 4K y 4 pantallas simultáneas.',
    // PERFORMANCE: Agregar parámetros de Unsplash para reducir tamaño y usar formato WebP
    image: 'https://images.unsplash.com/photo-1684746564637-8067c52499f3?auto=format&fit=crop&w=600&q=80',
    type: 'subscription',
    disclaimer: 'Servicio gestionado por terceros. Garantía de funcionamiento de 30 días.',
  },
  {
    id: 'robux-currency',
    name: 'Robux Coin',
    category: 'robux',
    price: 45,
    stock: 100000,
    description: 'Lleva tu avatar al siguiente nivel. Entrega rápida, precios competitivos y cero riesgos para tu cuenta. ¡Es hora de conseguir esos items exclusivos!',
    image: 'https://images.unsplash.com/photo-1659725156498-d565e9a8a109?auto=format&fit=crop&w=600&q=80',
    type: 'currency',
    disclaimer: 'La compra de items fuera de la tienda oficial conlleva riesgos. Al comprar aceptas la responsabilidad.',
  },
  {
    id: '3',
    name: 'Minecraft VIP Rank',
    category: 'minecraft',
    price: 100000,
    stock: 30,
    description: 'Rango VIP con beneficios exclusivos y comandos en nuestro servidor de Minecraft.',
    image: 'https://images.unsplash.com/photo-1684746564637-8067c52499f3?auto=format&fit=crop&w=600&q=80',
    type: 'rank',
  },
  {
    id: '4',
    name: '2800 V-Bucks',
    category: 'fortnite',
    price: 80000,
    stock: 75,
    description: 'PaVos (V-Bucks) de Fortnite para comprar skins, bailes y el Pase de Batalla.',
    image: 'https://images.unsplash.com/photo-1659725156498-d565e9a8a109?auto=format&fit=crop&w=600&q=80',
    type: 'currency',
    disclaimer: 'Transacción de terceros. Existe un riesgo potencial de sanción por parte de los desarrolladores del juego.',
  },
  {
    id: '5',
    name: 'Spotify Premium 3 Months',
    category: 'streaming',
    price: 120000,
    stock: 40,
    description: 'Spotify Premium por 3 meses. Música sin anuncios y descargas offline.',
    image: 'https://images.unsplash.com/photo-1684746564637-8067c52499f3?auto=format&fit=crop&w=600&q=80',
    type: 'subscription',
    disclaimer: 'Cuenta familiar/compartida. Garantía de reposición durante el periodo contratado.',
  },
  {
    id: '7',
    name: 'Clash Royale Pass Royale',
    category: 'clash-royale',
    price: 20000,
    stock: 120,
    description: 'Pass Royale con recompensas exclusivas, reacciones y skins de torre.',
    image: 'https://images.unsplash.com/photo-1684746564637-8067c52499f3?auto=format&fit=crop&w=600&q=80',
    type: 'pass',
  },
  {
    id: '8',
    name: 'Minecraft MVP++ Rank',
    category: 'minecraft',
    price: 200000,
    stock: 15,
    description: 'Rango MVP++ definitivo con todos los beneficios, comandos y cosméticos exclusivos.',
    image: 'https://images.unsplash.com/photo-1659725156498-d565e9a8a109?auto=format&fit=crop&w=600&q=80',
    type: 'rank',
  },
  // EJEMPLO NUEVO PRODUCTO: Fruta de Blox Fruits
  {
    id: 'blox-fruit-leopard',
    name: 'Leopard Fruit (Blox Fruits)',
    category: 'ingame-items', // Categoría principal
    type: 'blox-fruits',      // Subcategoría para el filtro
    price: 25000,
    stock: 5,
    description: 'Fruta Leopardo física para Blox Fruits. Entrega vía trade en el juego.',
    image: 'https://images.unsplash.com/photo-1629760946220-5693ee4c46ac?auto=format&fit=crop&w=600&q=80', // Optimizado
    deliveryMethod: 'trade',   // Campo opcional para saber cómo entregar
    disclaimer: 'Requiere nivel 700+ para intercambio (Sea 2).',
  }
];

export const DatabaseProvider = ({ children }) => {
  const { t, language, getNestedTranslation } = useLanguage();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);  
  const [coupons, setCoupons] = useState([]);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState('COP'); // Moneda por defecto
  // MEJORA: Estados de carga y error para operaciones individuales
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [isUpdatingProduct, setIsUpdatingProduct] = useState(false);
  const [isDeletingProduct, setIsDeletingProduct] = useState(false);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [isAddingCoupon, setIsAddingCoupon] = useState(false);
  const [isUpdatingCoupon, setIsUpdatingCoupon] = useState(false);
  const [isDeletingCoupon, setIsDeletingCoupon] = useState(false);
  const [isFetchingCoupons, setIsFetchingCoupons] = useState(false);
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);
  const [isFetchingOrders, setIsFetchingOrders] = useState(false);
  const [error, setError] = useState(null);
  // MEJORA: Cargar traducciones guardadas para no gastar API ni tiempo de carga
  const [autoTranslations, setAutoTranslations] = useState(() => {
    try {
      const saved = localStorage.getItem('autoTranslations');
      return (saved && saved !== "undefined" && saved !== "null") ? JSON.parse(saved) : {};
    } catch (e) {
      if (import.meta.env.DEV) {
        console.error("Error parsing autoTranslations from localStorage", e);
      }
      return {};
    }
  });

  // Constantes de configuración (Tasas de cambio y Tarifas)
  // MEJORA: En una aplicación real, estas claves y tarifas deberían venir de un backend seguro o variables de entorno.
  const CONFIG = useMemo(() => ({
    RATES: {
      USD_COP: 3850, // 1 USD = 3850 COP
      BRL_USD: 5.50, // 1 USD = 5.50 BRL
      MXN_USD: 18.1, // 1 USD = 18.1 MXN
      ARS_USD: 1517, // 1 USD = 1517 ARS
      CLP_USD: 908,  // 1 USD = 908 CLP
      PEN_USD: 3.52  // 1 USD = 3.52 PEN
    },
    FEES: {
      // Fees are now handled by the payment gateway
    },
    // FIX: Añadir las llaves de API públicas que faltaban.
    // En una aplicación real, estas deberían cargarse desde variables de entorno (p. ej. import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY).
    KEYS: {
        // PARA PRUEBAS: Usa la llave que empieza con TEST-
        MERCADOPAGO_PUBLIC_KEY: import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY
    }
  }), []);

  // OPTIMIZACIÓN: Crear formateadores una sola vez para mejorar rendimiento en listas largas
  const formatters = useMemo(() => ({
    USD: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }),
    BRL: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }),
    COP: new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 0 }),
    MXN: new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }),
    ARS: new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }),
    CLP: new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }),
    PEN: new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }),
  }), []);

  // Función centralizada para formatear moneda según el idioma
  const formatCurrency = useCallback((amount) => {
    const numericAmount = Number(amount) || 0;
    
    // Si es COP, retornamos directo (base)
    if (currency === 'COP') return formatters.COP.format(numericAmount);

    // Convertir a USD primero (Base intermedia)
    const valInUsd = numericAmount / CONFIG.RATES.USD_COP;

    switch (currency) {
      case 'USD': return formatters.USD.format(valInUsd);
      case 'BRL': return formatters.BRL.format(valInUsd * CONFIG.RATES.BRL_USD);
      case 'MXN': return formatters.MXN.format(valInUsd * CONFIG.RATES.MXN_USD);
      case 'ARS': return formatters.ARS.format(valInUsd * CONFIG.RATES.ARS_USD);
      case 'CLP': return formatters.CLP.format(valInUsd * CONFIG.RATES.CLP_USD);
      case 'PEN': return formatters.PEN.format(valInUsd * CONFIG.RATES.PEN_USD);
      default: return formatters.COP.format(numericAmount);
    }
  }, [currency, formatters, CONFIG.RATES]);

  // Función centralizada para formatear fechas según el idioma
  const formatDate = useCallback((dateString) => {
    if (!dateString) return '...';
    // Fix: Reemplazar espacio por T para compatibilidad con Safari/iOS
    const date = new Date(String(dateString).replace(' ', 'T'));
    if (isNaN(date.getTime())) return language === 'en' ? 'Pending' : 'Pendiente';

    const locales = { es: 'es-CO', en: 'en-US', pt: 'pt-BR' };
    return date.toLocaleDateString(locales[language] || 'es-CO', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }, [language]);

  // Deprecated: Fee calculation is now handled by Mercado Pago
  const calculatePaymentFee = useCallback((baseAmount) => {
    return baseAmount;
  }, []);

  // Helper para obtener detalles visuales del estado del pedido (Color, Icono, Texto)
  const getStatusDetails = useCallback((status) => {
    const s = status?.toLowerCase();
    
    const config = {
      completed: { 
        label: getNestedTranslation('dashboard.status.completed'),
        className: 'text-green-300 bg-green-500/10 border border-green-500/20 backdrop-blur-md shadow-[0_0_10px_rgba(74,222,128,0.1)]',
        iconType: 'check'
      },
      processing: { 
        label: getNestedTranslation('dashboard.status.processing'),
        className: 'text-blue-300 bg-blue-500/10 border border-blue-500/20 backdrop-blur-md shadow-[0_0_10px_rgba(59,130,246,0.1)]',
        iconType: 'clock'
      },
      cancelled: { 
        label: getNestedTranslation('dashboard.status.cancelled'),
        className: 'text-red-300 bg-red-500/10 border border-red-500/20 backdrop-blur-md shadow-[0_0_10px_rgba(248,113,113,0.1)]',
        iconType: 'x'
      },
      pending: { 
        label: getNestedTranslation('dashboard.status.pending'),
        className: 'text-yellow-300 bg-yellow-500/10 border border-yellow-500/20 backdrop-blur-md shadow-[0_0_10px_rgba(250,204,21,0.1)]',
        iconType: 'clock'
      }
    };

    return config[s] || { 
      label: getNestedTranslation('dashboard.status.unknown'), 
      className: 'text-gray-300 bg-gray-500/10 border border-gray-500/20 backdrop-blur-md',
      iconType: 'help'
    };
  }, [getNestedTranslation]);

  // API: Validar cupón
  const validateCoupon = useCallback(async (code, subtotal, userId) => {
    try {
      const response = await fetch('/api/validate_coupon.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ code, subtotal, userId })
      });
      const data = await response.json();
      if (data.success) setAppliedCoupon(data.coupon);
      return data;
    } catch (error) {
      return { success: false, message: "Error al conectar con el servidor" };
    }
  }, []);

  // API: Obtener cupones
  const fetchCoupons = useCallback(async () => {
    setIsFetchingCoupons(true);
    try {
      const response = await fetch('/api/get_coupons.php', { credentials: 'include' });
      const data = await response.json();
      if (Array.isArray(data)) setCoupons(data);
    } catch (error) {
      console.error("Error fetching coupons:", error);
    } finally {
      setIsFetchingCoupons(false);
    }
  }, []);

  // API: Actualizar cupón
  const updateCoupon = useCallback(async (id, updates) => {
    setIsUpdatingCoupon(true);
    try {
      const response = await fetch('/api/update_coupon.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id, ...updates })
      });
      const data = await response.json();
      if (data.success) {
        toast({ title: "Éxito", description: "Cupón actualizado correctamente." });
        fetchCoupons();
      }
    } finally {
      setIsUpdatingCoupon(false);
    }
  }, [fetchCoupons, toast]);

  // API: Eliminar cupón
  const deleteCoupon = useCallback(async (id) => {
    setIsDeletingCoupon(true);
    try {
      const response = await fetch('/api/delete_coupon.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id })
      });
      const data = await response.json();
      if (data.success) {
        toast({ title: "Eliminado", description: "Cupón eliminado." });
        fetchCoupons();
      }
    } finally {
      setIsDeletingCoupon(false);
    }
  }, [fetchCoupons, toast]);

  // API: Crear cupón (Admin)
  const addCoupon = useCallback(async (couponData) => {
    setIsAddingCoupon(true);
    try {
      const response = await fetch('/api/add_coupon.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(couponData)
      });
      const data = await response.json();
      if (data.success) {
        toast({ title: "Éxito", description: "Cupón creado correctamente." });
      } else {
        toast({ title: "Error", description: data.error, variant: "destructive" });
      }
      return data;
    } catch (error) {
      return { success: false, error: "Error de conexión" };
    } finally {
      setIsAddingCoupon(false);
    }
  }, [toast]);

  // API: Verify ePayco transaction (legacy)
  const verifyEpaycoPayment = useCallback(async (ref_payco) => {
    setIsVerifyingPayment(true);
    try {
      // FIX: Añadir timestamp para evitar caché y ver el estado real de la transacción inmediatamente
      const response = await fetch(`/api/verify_transaction.php?ref_payco=${ref_payco}&t=${Date.now()}`);
      const data = await response.json();
      if (!data || !data.success) toast({ title: data?.message || getNestedTranslation('checkout.failedTitle'), variant: 'destructive' });
      return data;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Error verifying payment:", error);
      }
      toast({ title: getNestedTranslation('checkout.failedTitle') || "Payment verification failed.", variant: 'destructive' });
      return { success: false, message: "Error de conexión con el servidor" };
    } finally {
      setIsVerifyingPayment(false);
    }
  }, [t]);

  // API: Verify Mercado Pago transaction
  const verifyMercadoPagoPayment = useCallback(async (payment_id) => {
    try {
      // FIX: Implementación de verificación de Mercado Pago
      // Añadimos timestamp para evitar caché, igual que en ePayco
      const response = await fetch(`/api/verify_mercadopago.php?id=${payment_id}&t=${Date.now()}`);
      return await response.json();
    } catch (error) {
      console.error("Error verifying Mercado Pago payment:", error);
      return { success: false, message: "Error al verificar el pago." };
    }
  }, []);

  const verifyPayment = useCallback(async (paymentId, provider = 'mercadopago') => {
    // FIX: Mercado Pago es ahora el proveedor por defecto
    if (provider === 'mercadopago') {
      return verifyMercadoPagoPayment(paymentId);
    }
    // Soporte legacy para ePayco
    return verifyEpaycoPayment(paymentId);
  }, [verifyEpaycoPayment, verifyMercadoPagoPayment]);

  const fetchData = useCallback(async (isBackground = false) => {
    if (!isBackground) setLoading(true);    
    if (!isBackground) setError(null);
    
    try {
      // Fetch products from Hostinger API
      // FIX: Añadir timestamp para evitar caché del navegador y asegurar precios actualizados
      // Esto previene el error de "discrepancia en el precio" al crear la orden
      const response = await fetch(`/api/products.php?t=${Date.now()}`);
      if (!response.ok) throw new Error('API response was not ok');
      const productsData = await response.json();
      
      if (Array.isArray(productsData)) {
        // OPTIMIZACIÓN: Solo actualizar estado si los datos realmente cambiaron para evitar re-renders innecesarios
        // PERFORMANCE: Eliminada la comparación JSON.stringify profunda. Es muy costosa en CPU.
        // React ya optimiza actualizaciones si la referencia es idéntica, o podemos confiar en el re-render (es más barato que stringify).
        setProducts(productsData);
      }
    } catch (error) {
      if (!isBackground) {
        setError('No se pudieron cargar los productos. Por favor, intente de nuevo más tarde.');
        if (import.meta.env.DEV) {
          console.error('API Error:', error);
        }
        // SEGURIDAD: No usar datos hardcodeados (initialProducts) como fallback en producción.
        // Esto evita que se muestren precios desactualizados o erróneos si la API falla.
        setProducts([]);
      }
    } finally {
      // Solo si es la carga inicial, desactivamos el loading
      if (!isBackground) {
        setCategories(initialCategories);
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchData();
    // Polling: Actualizar datos cada 30 segundos (optimizado para rendimiento) y solo si es visible
    const interval = setInterval(() => {
      // Optimización: No actualizar si el usuario no está viendo la pestaña
      if (!document.hidden) {
        fetchData(true);
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Función para subir tus productos iniciales a la nube (Ejecutar una sola vez)
  const seedDatabase = useCallback(async () => {
    // SEGURIDAD: Desactivar completamente la lógica de seed en el cliente
    if (import.meta.env.DEV) {
      console.warn("La función seedDatabase está desactivada en modo Hostinger. Usa phpMyAdmin para importar datos.");
    }
  }, [toast]);

  // Efecto para traducir automáticamente descripciones faltantes usando una API gratuita
  useEffect(() => {
    if (!language || language === 'es') return; // No traducir si estamos en español

    const translateMissingDescriptions = async () => {
      // Identificar productos que no tienen traducción manual y tampoco automática
      // FIX: Excluir el producto de Robux de la traducción automática.
      const productsToTranslate = products.filter(p => 
        p.id !== 'robux-currency' && p.category !== 'robux' && !t.products?.[p.id] && 
        (!autoTranslations[`${p.id}_${language}`] || !autoTranslations[`${p.id}_name_${language}`])
      );

      if (productsToTranslate.length === 0) return;

      // Optimización: Peticiones en paralelo (Promise.all) en lugar de una por una
      // Esto hace que las descripciones carguen mucho más rápido
      const newTranslationsData = await Promise.all(
        productsToTranslate.map(async (product) => {
          const results = [];
          
          // Traducir Descripción
          if (!autoTranslations[`${product.id}_${language}`]) {
            try {
              const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(product.description)}&langpair=es|${language}`);
              const data = await response.json();
              if (data.responseData?.translatedText) results.push({ key: `${product.id}_${language}`, text: data.responseData.translatedText });
            } catch (error) {
              // Silently fail in production
            }
          }

          // Traducir Nombre
          if (!autoTranslations[`${product.id}_name_${language}`]) {
            try {
              const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(product.name)}&langpair=es|${language}`);
              const data = await response.json();
              if (data.responseData?.translatedText) results.push({ key: `${product.id}_name_${language}`, text: data.responseData.translatedText });
            } catch (error) {
              // Silently fail in production
            }
          }
          return results;
        })
      );

      // Actualizar el estado una sola vez al final para evitar re-renderizados innecesarios
      const updates = {};
      newTranslationsData.flat().forEach(item => {
        if (item && item.text) updates[item.key] = item.text;
      });

      if (Object.keys(updates).length > 0) {
        setAutoTranslations(prev => {
          const newState = { ...prev, ...updates };
          return newState;
        });
      }
    };

    if (products.length > 0) {
      translateMissingDescriptions();
    }
  }, [products, language, t, autoTranslations]);

  // PERFORMANCE: Guardar en localStorage en un efecto separado para no bloquear el renderizado
  useEffect(() => {
    try {
      localStorage.setItem('autoTranslations', JSON.stringify(autoTranslations));
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn("No se pudo guardar en caché (LocalStorage lleno)", error);
      }
    }
  }, [autoTranslations]);

  // Productos traducidos dinámicamente
  const translatedProducts = useMemo(() => {
    return products.map(product => {
      let translatedProduct = { ...product };

      // 1. Prioridad: Traducción manual (translations.js)
      const manualTranslation = t.products?.[product.id];
      if (manualTranslation) {
        // Primero, aplica todas las traducciones manuales que existan.
        translatedProduct = { ...product, ...manualTranslation };

        // FIX DEFINITIVO: Para el producto Robux, forzamos explícitamente que la descripción
        // sea la que viene de la base de datos (inventario), ignorando la del archivo de traducción.
        // Esto evita que la descripción del inventario sea sobrescrita al cambiar de idioma.
        if (product.id === 'robux-currency' || product.category === 'robux') {
          translatedProduct.description = product.description;
        }
      } else if (product.id !== 'robux-currency' && product.category !== 'robux') {
        // 2. Prioridad: Traducción automática (API)
        const autoDesc = autoTranslations[`${product.id}_${language}`];
        const autoName = autoTranslations[`${product.id}_name_${language}`];
        
        if (autoDesc) translatedProduct.description = autoDesc;
        if (autoName) translatedProduct.name = autoName;
      }

      // Usar la función centralizada
      const displayPrice = formatCurrency(product.price);

      // Calcular estado de stock pre-formateado
      let stockStatus = 'in';
      let stockLabel = getNestedTranslation('product.stock.in');
      
      if (product.stock <= 0) {
        stockStatus = 'out';
        stockLabel = getNestedTranslation('product.stock.out');
      } else if (product.stock < 10) {
        stockStatus = 'low';
        stockLabel = getNestedTranslation('product.stock.low').replace('{stock}', product.stock);
      }

      return { ...translatedProduct, displayPrice, stockStatus, stockLabel };
    });
  }, [products, t, autoTranslations, language, formatCurrency, getNestedTranslation]);

  // MEJORA UX: Generar Skeletons para la carga inicial
  const skeletonProducts = useMemo(() => 
    Array(8).fill(null).map((_, index) => ({ id: `skeleton-${index}` }))
  , []);

  // Helper: Obtener productos relacionados (mismo categoría, excluyendo el actual)
  const getRelatedProducts = useCallback((productId, limit = 4) => { // Aumentado límite para más variedad
    const product = translatedProducts.find(p => p.id === productId);
    if (!product) return [];
    
    return translatedProducts
      .filter(p => p.category === product.category && p.id !== productId)
      .slice(0, limit);
  }, [translatedProducts]);

  // Helper: Buscar productos (por nombre o descripción)
  const searchProducts = useCallback((query) => {
    if (!query) return translatedProducts;
    const lowerQuery = query.toLowerCase();
    return translatedProducts.filter(p => 
      p.name.toLowerCase().includes(lowerQuery) || 
      (p.description && p.description.toLowerCase().includes(lowerQuery))
    );
  }, [translatedProducts]);

  // Product CRUD
  const getProducts = useCallback(() => translatedProducts, [translatedProducts]);

  const getProductById = useCallback((id) => translatedProducts.find(p => p.id == id), [translatedProducts]);

  const addProduct = useCallback(async (product) => {
    setIsAddingProduct(true);
    const newProduct = {
      ...product,
      // MEJORA SEGURIDAD: ID más robusto si randomUUID falla
      id: window.crypto?.randomUUID ? window.crypto.randomUUID() : Date.now().toString() + Math.random().toString(36).substring(2),
    };
    
    // Optimistic update (actualizar UI inmediatamente)
    setProducts([...products, newProduct]);

    // Hostinger API insert
    await fetch('/api/add_product.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // Enviar cookie de sesión
      body: JSON.stringify(newProduct)
    })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Server error');
        toast({ title: getNestedTranslation('inventory.successAdd') || "Product added successfully!" });
        fetchData(); // Refrescar datos para asegurar consistencia
        return data;
      })
      .catch(err => {
        if (import.meta.env.DEV) {
          console.error("Error adding product:", err);
        }
        toast({ title: getNestedTranslation('inventory.errorAdd') || "Failed to add product.", variant: 'destructive' });
        setProducts(prev => prev.filter(p => p.id !== newProduct.id)); // Revertir optimistic update
      })
      .finally(() => setIsAddingProduct(false));
  }, [products, t, fetchData, toast]);

  const updateProduct = useCallback(async (id, updates) => {
    setIsUpdatingProduct(true);
    const previousProducts = [...products]; // Backup para revertir

    // Optimistic update
    const updatedProducts = products.map(p => 
      p.id === id ? { ...p, ...updates } : p
    );
    setProducts(updatedProducts);
    
    // Database update
    await fetch('/api/update_product.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // Enviar cookie de sesión
      body: JSON.stringify({ id, ...updates })
    })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Server error');
        toast({ title: getNestedTranslation('inventory.successUpdate') || "Product updated successfully!" });
        fetchData(); // Refrescar datos para asegurar consistencia
      })
      .catch(err => {
        if (import.meta.env.DEV) {
          console.error("Error updating product:", err);
        }
        toast({ title: getNestedTranslation('inventory.errorUpdate') || "Failed to update product.", variant: 'destructive' });
        setProducts(previousProducts); // Revertir explícitamente al estado anterior
      })
      .finally(() => setIsUpdatingProduct(false));
  }, [products, t, fetchData, toast]);

  // Función especializada para actualizar Tasa de Robux
  const updateRobuxRate = useCallback(async (newRate) => {
    // El Robux se maneja como un producto con ID 'robux-currency'
    return updateProduct('robux-currency', { price: Number(newRate) });
  }, [updateProduct]);

  const deleteProduct = useCallback(async (id) => {
    setIsDeletingProduct(true);
    const previousProducts = [...products]; // Backup para revertir

    // Optimistic update
    const updatedProducts = products.filter(p => p.id !== id);
    setProducts(updatedProducts);
    
    // Database delete
    await fetch('/api/delete_product.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // Enviar cookie de sesión
      body: JSON.stringify({ id })
    })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Server error');
        toast({ title: getNestedTranslation('inventory.successDelete') || "Product deleted successfully!" });
      })
      .catch(err => {
        if (import.meta.env.DEV) {
          console.error("Error deleting product:", err);
        }
        toast({ title: getNestedTranslation('inventory.errorDelete') || "Failed to delete product.", variant: 'destructive' });
        setProducts(previousProducts); // Revertir explícitamente al estado anterior
      })
      .finally(() => setIsDeletingProduct(false));
  }, [products, t, fetchData, toast]);

  const updateStock = useCallback((productId, quantity) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      updateProduct(productId, { stock: product.stock - quantity });
    }
  }, [products, updateProduct]);

    // API: Fetch paginado exclusivo para el Admin (Server-Side)
    const fetchPaginatedProducts = useCallback(async (params) => {
      try {
        // Limpiamos parámetros vacíos o nulos
        const cleanParams = Object.fromEntries(Object.entries(params).filter(([_, v]) => v != null && v !== ''));
        const query = new URLSearchParams(cleanParams).toString();
        const response = await fetch(`/api/products.php?${query}&t=${Date.now()}`);
        const data = await response.json();
        
        // FIX: Si el backend devuelve un Array (versión antigua de PHP), hacemos el filtrado como Fallback
        if (Array.isArray(data)) {
          let result = data;
          
          if (params.search) {
            const lower = params.search.toLowerCase();
            result = result.filter(p => p.name?.toLowerCase().includes(lower) || p.category?.toLowerCase().includes(lower) || p.type?.toLowerCase().includes(lower));
          }
          if (params.category && params.category !== 'all') result = result.filter(p => p.category === params.category);
          if (params.stock === 'out') result = result.filter(p => p.stock === 0);
          else if (params.stock === 'low') result = result.filter(p => p.stock > 0 && p.stock < 10);
          else if (params.stock === 'in') result = result.filter(p => p.stock >= 10);

          result.sort((a, b) => {
            switch (params.sort) {
              case 'price-asc': return a.price - b.price;
              case 'price-desc': return b.price - a.price;
              case 'stock-asc': return a.stock - b.stock;
              case 'stock-desc': return b.stock - a.stock;
              case 'name-asc': return a.name.localeCompare(b.name);
              case 'name-desc': return b.name.localeCompare(a.name);
              default: return 0;
            }
          });

          const page = params.page || 1;
          const limit = params.limit || 12;
          return { products: result.slice((page - 1) * limit, page * limit), total: result.length };
        }

        // Si el backend fue actualizado, devuelve la data directamente
        return data;
      } catch (error) {
        console.error("Error fetching paginated products:", error);
        return { products: [], total: 0 };
      }
    }, []);

    // API: Subir imagen al servidor
    const uploadImage = useCallback(async (file) => {
      const formData = new FormData();
      formData.append('image', file);
      try {
        const response = await fetch('/api/upload_image.php', {
          method: 'POST',
          credentials: 'include',
          body: formData
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Error al subir la imagen');
        return data.url;
      } catch (error) {
        throw error;
      }
    }, []);

    // API: Descargar imagen externa al servidor automáticamente
    const downloadImageFromUrl = useCallback(async (url) => {
      try {
        const response = await fetch('/api/download_image.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ url })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Error al descargar la imagen');
        return data.url;
      } catch (error) {
        throw error;
      }
    }, []);

  // Category CRUD
  const getCategories = useCallback(() => categories, [categories]);

  // Order CRUD
  const createOrder = useCallback(async (orderData) => {
    setIsCreatingOrder(true);

    // QA FIX: Validar estructura básica para evitar crash por "undefined"
    if (!orderData || !Array.isArray(orderData.items)) {
      setIsCreatingOrder(false);
      throw new Error("Datos del pedido inválidos o incompletos.");
    }

    // --- AUDITORÍA LEGAL: VALIDACIÓN DE CONSENTIMIENTO ---
    // FIX: Bloquear la orden si no hay aceptación explícita de términos (GDPR / Habeas Data)
    if (orderData.termsAccepted !== true) {
      const errorMsg = t.checkout?.errors?.terms || "Por requisitos legales, debes aceptar los Términos y Condiciones para continuar.";
      toast({ title: "Consentimiento Requerido", description: errorMsg, variant: 'destructive' });
      setIsCreatingOrder(false);
      throw new Error(errorMsg);
    }

    // FIX: Verificar que los productos estén cargados para evitar falsos positivos de stock
    if (!products || products.length === 0) {
      const errorMsg = "Error: El inventario no se ha cargado correctamente. Por favor, recarga la página.";
      toast({ title: "Error de Sincronización", description: errorMsg, variant: 'destructive' });
      setIsCreatingOrder(false);
      return null;
    }

    // FIX CRÍTICO Y UX: Saneamiento de precios y stock estricto.
    // En lugar de eliminar silenciosamente los productos sin stock (lo que cobra un total menor al cliente y genera quejas),
    // bloqueamos el proceso y avisamos exactamente qué producto falló.
    const sanitizedItems = [];
    for (const item of orderData.items) {
      const currentProduct = products.find(p => String(p.id) === String(item.id));
      
      if (!currentProduct) {
        const errorMsg = `El producto "${item.name}" ya no está disponible en la tienda.`;
        toast({ title: "Producto no encontrado", description: errorMsg, variant: 'destructive' });
        setIsCreatingOrder(false);
        throw new Error(errorMsg);
      }
      
      const quantityInCart = item.quantity || 1;
      
      if (currentProduct.stock < quantityInCart) {
        const errorMsg = `Stock insuficiente para "${currentProduct.name}". Solicitado: ${quantityInCart}, Disponible: ${currentProduct.stock}.`;
        toast({ title: "Stock Insuficiente", description: errorMsg, variant: 'destructive' });
        setIsCreatingOrder(false);
        throw new Error(errorMsg);
      }
      
      sanitizedItems.push({ 
        ...item, 
        name: currentProduct.name, // Asegurar que el nombre viene de la BD para el título de MP
        price: Number(currentProduct.price), 
        quantity: quantityInCart,
        image: currentProduct.image 
      });
    }

    // FIX ADICIONAL: Si después de sanear no quedan items, la orden es inválida.
    if (sanitizedItems.length === 0) {
      const errorMsg = t.checkout?.errors?.noValidItems || "La orden no contiene productos válidos o disponibles.";
      toast({ title: "Pedido Fallido", description: errorMsg, variant: 'destructive' });
      setIsCreatingOrder(false);
      // Devolvemos null para que PaymentForm sepa que la creación de la orden falló
      // y no intente abrir la pasarela de pago.
      return null;
    }

    // Recalcular el total con los precios saneados
    const sanitizedTotal = sanitizedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // --- CÁLCULO PROFESIONAL DE DESCUENTO ---
    let discountAmount = 0;
    if (appliedCoupon) {
      if (appliedCoupon.type === 'percentage') {
        discountAmount = Math.round(sanitizedTotal * (appliedCoupon.value / 100));
      } else {
        discountAmount = Math.min(appliedCoupon.value, sanitizedTotal);
      }
    }

    const subtotalAfterDiscount = Math.max(0, sanitizedTotal - discountAmount);

    // FIX: Calcular impuestos sobre el valor descontado (Comisión MP)
    const taxRate = orderData.taxRate || 0;
    const taxAmount = Math.round(subtotalAfterDiscount * taxRate);
    const finalTotal = subtotalAfterDiscount + taxAmount;

    const newOrder = {
      ...orderData,
      items: sanitizedItems, // Usar items con precios verificados
      total: finalTotal,
      discount_amount: discountAmount, // Auditoría UI
      couponCode: appliedCoupon ? appliedCoupon.code : null, 
      paymentMethod: 'Mercado Pago', // Forzar Mercado Pago como método de pago
      // MEJORA SEGURIDAD: ID más robusto para evitar enumeración de pedidos
      id: window.crypto?.randomUUID ? window.crypto.randomUUID() : Date.now().toString() + Math.random().toString(36).substring(2),
      created_at: new Date().toISOString(),
      status: 'pending'
    };

    // Create order via Hostinger API
    try {
      const response = await fetch('/api/create_order.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // FIX: Enviar cookie de sesión para autenticación
        body: JSON.stringify(newOrder)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Error al crear el pedido en Hostinger');

      // SEGURIDAD: Usar los datos confirmados por el servidor (incluyendo el precio real recalculado)
      // Si el backend detectó manipulación y corrigió el precio, usamos ese valor.
      const confirmedOrder = {
        ...newOrder,
        id: data.id || newOrder.id,
        total: data.correctedTotal || newOrder.total // Asumiendo que el backend devuelve el total real si cambió
      };

      setOrders(prevOrders => [...prevOrders, confirmedOrder]);
      setAppliedCoupon(null); // Limpiar cupón tras orden exitosa
      toast({ title: t.checkout.successTitle || "Order created successfully!" });
      return confirmedOrder;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error creating order:', error);
      }
      toast({ title: t.checkout.failedTitle || "Failed to create order.", variant: 'destructive' });
      throw error; // Re-lanzar para que el componente que llama pueda manejarlo
    } finally {
      setIsCreatingOrder(false);
    }
  }, [t, toast, products, appliedCoupon, getNestedTranslation]);

  const updateOrderStatus = useCallback(async (orderId, status) => {
    // No hay estado de carga específico para esto, ya que se usa en el admin
    await fetch('/api/update_order_status.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // Enviar cookie de sesión
      body: JSON.stringify({ orderId, status })
    });

    setOrders(prevOrders => prevOrders.map(o => o.id === orderId ? { ...o, status } : o));
  }, []);

  const fetchUserOrders = useCallback(async (userId) => {
    setIsFetchingOrders(true);
    try {
      // Usar API de Hostinger
      // Añadimos timestamp para evitar caché del navegador
      const response = await fetch(`/api/get_orders.php?userId=${userId}&t=${Date.now()}`, {
        credentials: 'include'
      });
      const data = await response.json();
      
      // FIX: Detectar error explícito del backend antes de verificar si es array
      if (data && data.error) {
        throw new Error(data.error);
      }

      if (Array.isArray(data)) {
        setOrders(data);
      } else {
        setOrders([]);
      }
      return data;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error fetching orders from Hostinger:', error);
      }
      toast({ title: t.dashboard.errorFetchingOrders || "Failed to load orders.", variant: 'destructive' });
      return [];
    } finally {
      setIsFetchingOrders(false);
    }
  }, [t, toast, getNestedTranslation]);

  // Fetch orders when user is logged in
  useEffect(() => {
    if (currentUser) fetchUserOrders(currentUser.id);
    else setOrders([]); // Limpiar pedidos al cerrar sesión
  }, [currentUser, fetchUserOrders]);

  const getUserOrders = useCallback((userId) => { // This can now just return the state
    return orders.filter(o => o.userId == userId);
  }, [orders]);

  const getOrderById = useCallback((orderId) => {
    return orders.find(o => o.id === orderId);
  }, [orders]);

  const refreshOrders = useCallback(async () => {
    await fetchData(); // Recargar productos para actualizar el stock en pantalla
    if (currentUser) await fetchUserOrders(currentUser.id);
  }, [fetchData, currentUser, fetchUserOrders]);

  const value = useMemo(() => ({
    // Products
    config: CONFIG, // Exponemos la configuración global
    currency,
    setCurrency,
    products: translatedProducts,
    getProducts,
    formatCurrency,
    formatDate,
    calculatePaymentFee,
    getStatusDetails,
    getRelatedProducts,
    validateCoupon,
    addCoupon,
    updateRobuxRate,
    isAddingCoupon,
    coupons,
    fetchCoupons,
    updateCoupon,
    isUpdatingCoupon,
    deleteCoupon,
    isDeletingCoupon,
    isFetchingCoupons,
    appliedCoupon,
    setAppliedCoupon,
    isVerifyingPayment,
    isFetchingOrders,
    searchProducts,
    verifyEpaycoPayment,
    verifyMercadoPagoPayment,
    verifyPayment,
    getProductById,
    seedDatabase,
    loading,
    skeletonProducts, // Exponer los skeletons
    error,
    addProduct,
    isAddingProduct,
    updateProduct,
    isUpdatingProduct,
    deleteProduct,
    isDeletingProduct,
    updateStock,
      fetchPaginatedProducts,
    uploadImage,
    downloadImageFromUrl,
    // Categories
    categories,
    getCategories,
    supportedGames: SUPPORTED_GAMES,
    deliveryMethods: DELIVERY_METHODS,
    // Orders
    orders,
    createOrder,
    isCreatingOrder,
    updateOrderStatus,
    getUserOrders,
    getOrderById,
    refreshOrders
  }), [
    CONFIG, currency, setCurrency, translatedProducts, getProducts, formatCurrency, formatDate, calculatePaymentFee, getStatusDetails, getRelatedProducts, validateCoupon, addCoupon, updateRobuxRate, isAddingCoupon, coupons, fetchCoupons, updateCoupon, isUpdatingCoupon, deleteCoupon, isDeletingCoupon, isFetchingCoupons, appliedCoupon, setAppliedCoupon, isVerifyingPayment, isFetchingOrders, searchProducts, verifyEpaycoPayment, verifyMercadoPagoPayment, verifyPayment, getProductById, seedDatabase, loading, skeletonProducts, error, addProduct, isAddingProduct, updateProduct, isUpdatingProduct, deleteProduct, isDeletingProduct, updateStock, fetchPaginatedProducts, uploadImage, downloadImageFromUrl, categories, getCategories, orders, createOrder, isCreatingOrder, updateOrderStatus, getUserOrders, getOrderById, refreshOrders
  ]);

  return (
    <DatabaseContext.Provider value={value}>
      {children}
    </DatabaseContext.Provider>
  );
};