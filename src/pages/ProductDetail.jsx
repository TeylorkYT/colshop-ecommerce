import React, { useState, useMemo, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, Minus, Plus, Package, Check, ChevronRight, Loader2, ShieldCheck, Headphones } from 'lucide-react';
import { useDatabase } from '@/contexts/DatabaseContext';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import ProductCard from '@/components/ProductCard';

import DOMPurify from 'dompurify';

// FIX: Decodificador recursivo para renderizar HTML escapado múltiples veces desde la BD
const parseHTML = (htmlStr) => {
  if (!htmlStr) return '';
  let decoded = String(htmlStr);
  for (let i = 0; i < 3; i++) {
    const prev = decoded;
    decoded = decoded.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#039;/g, "'");
    if (prev === decoded) break;
  }
  return decoded;
};

const ProductDetail = () => {
  const { id } = useParams();
  const { getProductById, getRelatedProducts, loading, currency } = useDatabase();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  // FIX: Scroll to top when navigating between related products
  useEffect(() => {
    // Usamos 'smooth' para una transición más agradable
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  const product = getProductById(id);

  // FIX: Reglas de los Hooks. Llamar al useMemo SIEMPRE antes del return condicional.
  // Optimización: Memorizar el resultado para evitar recálculos innecesarios
  const relatedProducts = useMemo(() => getRelatedProducts(id, 4), [getRelatedProducts, id]);

  // FIX UX: Evitar pantallazo de "No encontrado" mientras los datos están cargando desde el servidor
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 pt-24 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-purple-500" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-900 pt-24 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">{t.product.notFound}</h2>
          <Link to="/catalog">
            <Button>{t.product.backToCatalog}</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast({
        title: t.product.loginRequired,
        description: t.product.loginRequiredDesc,
        variant: "destructive"
      });
      return;
    }
    if (product.stock === 0) {
      toast({
        title: t.product.stock.out,
        description: t.product.stock.out,
        variant: "destructive"
      });
      return;
    }
    if (quantity > product.stock) {
      toast({
        title: t.product.insufficientStock,
        description: t.product.insufficientStockDesc.replace('{stock}', product.stock),
        variant: "destructive"
      });
      return;
    }
    addToCart(product, quantity);
    toast({
      title: t.product.addedToCart,
      description: t.product.addedToCartDesc.replace('{quantity}', quantity).replace('{name}', product.name),
    });
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2500);
  };

  const incrementQuantity = () => {
    if (quantity < product.stock) {
      setQuantity(prev => prev + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };


  return (
    <div className="min-h-screen bg-gray-900 pt-24 pb-12">
      <Helmet>
        <title>{product.name} - Colshop</title>
        {/* Limpiamos el HTML para que la descripción sea texto plano en los metadatos */}
        <meta name="description" content={product.description?.replace(/<[^>]*>?/gm, '').substring(0, 160)} />
        
        {/* E-Commerce SEO: Open Graph para previsualizaciones ricas en Discord, WhatsApp, Twitter */}
        <meta property="og:title" content={`${product.name} - Colshop`} />
        <meta property="og:description" content={product.description?.replace(/<[^>]*>?/gm, '').substring(0, 160)} />
        <meta property="og:image" content={product.image} />
        <meta property="og:type" content="product" />
        
        {/* E-Commerce SEO: Schema.org (JSON-LD) para que Google muestre precio y stock en los resultados */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org/",
            "@type": "Product",
            "name": product.name,
            "image": product.image,
            "description": product.description?.replace(/<[^>]*>?/gm, ''),
            "offers": { "@type": "Offer", "priceCurrency": currency || "COP", "price": product.price, "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock" }
          })}
        </script>
      </Helmet>

      <div className="max-w-7xl mx-auto px-4">
        {/* Product Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16 items-start">
          {/* Columna Izquierda: Imagen y Badges de Confianza (Fija al hacer scroll) */}
          <div className="lg:sticky lg:top-28 space-y-4 md:space-y-6 z-10">
            {/* Image */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="relative w-full aspect-square md:aspect-[4/3] lg:aspect-video bg-gray-800/30 rounded-3xl overflow-hidden border border-white/5 flex items-center justify-center p-8 backdrop-blur-sm group shadow-2xl"
            >
            {/* Glow background sutil decorativo */}
            <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/5 via-transparent to-pink-500/5 opacity-50" />
            
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-contain drop-shadow-2xl z-10 relative transition-transform duration-700 group-hover:scale-105"
                fetchPriority="high" /* OPTIMIZACIÓN LCP: La imagen principal nunca debe ser lazy loaded */
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center z-10 relative">
                <Package className="w-32 h-32 text-gray-600 opacity-50" />
              </div>
            )}
            <div className="absolute top-6 left-6 z-20">
              <span className="bg-gray-900/80 backdrop-blur-md border border-white/10 text-white px-4 py-1.5 rounded-full text-sm font-medium shadow-xl flex items-center gap-2">
                {t.catalog.categories[product.category] || product.category}
              </span>
            </div>
          </motion.div>

            {/* Badges de Confianza - Llenando el espacio vacío de forma útil */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-3 gap-3 md:gap-4"
            >
              <div className="bg-gray-800/40 p-3 md:p-4 rounded-2xl border border-white/5 flex flex-col items-center text-center gap-2 hover:bg-gray-800/60 transition-colors">
                <ShieldCheck className="w-6 h-6 md:w-7 md:h-7 text-green-400" />
                <span className="text-[10px] md:text-xs text-gray-300 font-medium leading-tight">Pago 100%<br/>Seguro</span>
              </div>
              <div className="bg-gray-800/40 p-3 md:p-4 rounded-2xl border border-white/5 flex flex-col items-center text-center gap-2 hover:bg-gray-800/60 transition-colors">
                <Package className="w-6 h-6 md:w-7 md:h-7 text-purple-400" />
                <span className="text-[10px] md:text-xs text-gray-300 font-medium leading-tight">Entrega<br/>Garantizada</span>
              </div>
              <div className="bg-gray-800/40 p-3 md:p-4 rounded-2xl border border-white/5 flex flex-col items-center text-center gap-2 hover:bg-gray-800/60 transition-colors">
                <Headphones className="w-6 h-6 md:w-7 md:h-7 text-blue-400" />
                <span className="text-[10px] md:text-xs text-gray-300 font-medium leading-tight">Soporte<br/>Dedicado</span>
              </div>
            </motion.div>
          </div>

          {/* Details */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            {/* Migas de pan (Breadcrumbs) - UX E-commerce estándar */}
            <motion.nav variants={itemVariants} className="flex items-center text-sm text-gray-500 font-medium">
              <Link to="/" className="hover:text-purple-400 transition-colors">Inicio</Link>
              <ChevronRight className="w-4 h-4 mx-2 opacity-50" />
              <Link to="/catalog" className="hover:text-purple-400 transition-colors">Catálogo</Link>
              <ChevronRight className="w-4 h-4 mx-2 opacity-50" />
              <span className="text-gray-300 truncate max-w-[200px]">{product.name}</span>
            </motion.nav>

            <motion.div variants={itemVariants}>
              <h1 className="text-4xl font-bold text-white mb-4">{product.name}</h1>
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20 shadow-lg shadow-purple-900/10">
                <div 
                  className="text-gray-200 text-lg leading-relaxed [&>p]:mb-4 [&>ul]:list-disc [&>ul]:ml-6 [&>ol]:list-decimal [&>ol]:ml-6 [&_a]:text-purple-400 [&_a]:underline"
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(parseHTML(product.description)) }}
                />
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="flex items-center gap-4">
              <span className="text-4xl font-extrabold text-white tracking-tight">{product.displayPrice}</span>
              <div className={`px-3 py-1.5 rounded-full text-sm font-semibold border flex items-center gap-2 shadow-sm ${
                  product.stockStatus === 'in' ? 'bg-green-500/10 text-green-400 border-green-500/20 shadow-green-500/10' :
                  product.stockStatus === 'low' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20 shadow-yellow-500/10' :
                  'bg-red-500/10 text-red-400 border-red-500/20 shadow-red-500/10'
              }`}>
                <span className={`w-2 h-2 rounded-full ${
                  product.stockStatus === 'in' ? 'bg-green-400 animate-pulse' :
                  product.stockStatus === 'low' ? 'bg-yellow-400' : 'bg-red-400'
                }`} />
                {product.stockLabel}
              </div>
            </motion.div>

            {/* Specifications */}
            {product.specs && (
              <motion.div variants={itemVariants} className="bg-gray-800/30 backdrop-blur-sm p-6 rounded-xl border border-purple-500/20">
                <h3 className="text-lg font-semibold text-white mb-4">{t.product.specifications}</h3>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(product.specs).map(([key, value]) => (
                    <div key={key}>
                      <div className="text-gray-400 text-sm capitalize">{key}</div>
                      <div className="text-white font-medium">{value}</div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Quantity Selector */}
            <motion.div variants={itemVariants} className="flex items-center gap-4">
              <span className="text-white font-medium">{t.product.quantity}:</span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={decrementQuantity}
                  disabled={quantity <= 1}
                  className="border-purple-500/20 hover:bg-purple-500/10">
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="text-white font-bold text-xl w-12 text-center">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={incrementQuantity}
                  disabled={quantity >= product.stock}
                  className="border-purple-500/20 hover:bg-purple-500/10">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>

            {/* Add to Cart Button */}
            <motion.div variants={itemVariants}>
              <Button
                onClick={handleAddToCart}
                disabled={product.stock === 0 || isAdded}
                className={`w-full h-14 text-lg font-bold transition-all duration-300 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed rounded-xl ${
                  isAdded
                    ? 'bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/25 border border-green-400/50'
                    : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-xl shadow-purple-500/25 border border-purple-500/50'
                }`}
              >
                {isAdded ? (
                  <Check className="w-5 h-5 mr-2" />
                ) : (
                  <ShoppingCart className="w-5 h-5 mr-2" />
                )}
                {isAdded ? t.product.added : t.product.addToCart}
              </Button>
            </motion.div>

            <div className="mt-6 pt-6 border-t border-white/10 text-xs text-gray-500">
              <p>Aviso Legal: Colshop es una plataforma independiente y no está afiliada, asociada, autorizada, respaldada ni conectada oficialmente con Roblox Corporation, Epic Games, Microsoft, Mojang ni ninguna de sus subsidiarias o afiliadas. Todos los nombres de productos, logotipos y marcas son propiedad de sus respectivos dueños.</p>
            </div>
          </motion.div>
        </div>

        {/* Related Products */}
        {relatedProducts && relatedProducts.length > 0 && (
          <div>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl font-bold text-white mb-8"
            >{t.product.relatedProducts}</motion.h2>
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {relatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;