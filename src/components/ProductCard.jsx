import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/components/ui/use-toast';

// FIX: Decodificador recursivo para renderizar HTML escapado desde la BD
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

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { t, language } = useLanguage();
  const { toast } = useToast();

  const getStockStatus = () => {
    if (product.stock === 0) return { text: t.product.stock.out, color: 'text-red-500' };
    if (product.stock < 20) return { text: t.product.stock.low.replace('{stock}', product.stock), color: 'text-yellow-500' };
    return { text: t.product.stock.in, color: 'text-green-500' };
  };

  const stockStatus = getStockStatus();

  const handleAddToCart = (e) => {
    e.preventDefault();
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
    addToCart(product);
    toast({
      title: t.product.addedToCart,
      description: t.product.addedToCartDesc.replace('{quantity}', 1).replace('{name}', product.name),
    });
  };

  return (
    <Link to={`/product/${product.id}`}>
      <motion.div
        whileHover={{ y: -8 }}
        // OPTIMIZACIÓN: Diseño Premium sin blur para máximo rendimiento (igual que Robux Card)
        className="bg-gray-900 rounded-2xl overflow-hidden border border-purple-500/20 transition-all group shadow-lg hover:shadow-purple-500/20 hover:border-purple-500/40"
      >
        <div className="relative aspect-video overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            loading="lazy"
            decoding="async"
          />
          {/* Overlay sutil al hacer hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          <div className="absolute top-2 right-2">
            <span className="bg-gray-900/80 backdrop-blur-md border border-white/10 text-white text-xs px-2.5 py-1 rounded-lg font-medium shadow-sm">
              {t.catalog.categories[product.category] || product.category}
            </span>
          </div>
        </div>
        
        <div className="p-5 flex flex-col gap-4">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white group-hover:text-purple-400 transition-colors line-clamp-1 tracking-tight">
              {product.name}
            </h3>
            <div 
              className="text-sm text-gray-400 line-clamp-2 leading-relaxed [&>p]:inline"
              dangerouslySetInnerHTML={{ __html: parseHTML(product.description) }}
            />
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-white/5 gap-3">
            <div className="flex flex-col">
              <div className="text-xl font-bold text-white">
                {product.displayPrice}
              </div>
              <div className={`text-xs font-medium ${stockStatus.color}`}>
                {stockStatus.text}
              </div>
            </div>
            
            <Button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg shadow-purple-900/20 border border-white/10 disabled:opacity-50 h-9 px-4 flex items-center justify-center rounded-xl transition-all group-hover:scale-105"
              size="sm"
            > 
              <ShoppingCart className="w-4 h-4 mr-1.5 shrink-0" />
              <span className="text-xs font-bold uppercase tracking-wide">{t.product.addToCart}</span>
            </Button>
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

// Validación de tipos para evitar errores silenciosos
ProductCard.propTypes = {
  product: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    image: PropTypes.string,
    category: PropTypes.string,
    stock: PropTypes.number,
    description: PropTypes.string,
    displayPrice: PropTypes.string
  }).isRequired
};

// Optimización: React.memo previene re-renderizados si las props no cambian
export default React.memo(ProductCard);