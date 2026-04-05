import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Filter } from 'lucide-react';
import { useDatabase } from '@/contexts/DatabaseContext';
import { useLanguage } from '@/contexts/LanguageContext';
import ProductCard from '@/components/ProductCard';
import CategoryFilter from '@/components/CategoryFilter';
import GameFilter from '@/components/GameFilter';

const Catalog = () => {
  const { products, categories, skeletonProducts, loading } = useDatabase();
  const { t } = useLanguage();
  const location = useLocation();

  // Estados de filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedGame, setSelectedGame] = useState(null); // Nuevo estado para el juego
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' | 'desc'

  // Efecto para leer la categoría desde la navegación (ej: clic en tarjeta de Robux en Home)
  useEffect(() => {
    if (location.state?.category) {
      setSelectedCategory(location.state.category);
      // Limpiar el estado para que no persista al navegar
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  // Resetear el juego seleccionado si cambiamos de categoría principal
  useEffect(() => {
    if (selectedCategory !== 'ingame-items') {
      setSelectedGame(null);
    }
  }, [selectedCategory]);

  // Lógica de filtrado
  const filteredProducts = useMemo(() => {
    let result = products;

    // 1. Filtro por Categoría
    if (selectedCategory) {
      result = result.filter(p => p.category === selectedCategory);
    }

    // 2. Filtro por Juego (Solo si estamos en Items In-Game)
    if (selectedCategory === 'ingame-items' && selectedGame) {
      result = result.filter(p => p.type === selectedGame);
    }

    // 3. Búsqueda
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(query) || 
        p.description?.toLowerCase().includes(query)
      );
    }

    // 4. Ordenamiento
    return result.sort((a, b) => {
      return sortOrder === 'asc' ? a.price - b.price : b.price - a.price;
    });
  }, [products, selectedCategory, selectedGame, searchQuery, sortOrder]);

  const displayProducts = loading ? skeletonProducts : filteredProducts;

  return (
    <div className="min-h-screen bg-gray-900 pt-24 pb-12">
      <Helmet>
        <title>{t.catalog.title} - Colshop</title>
        <meta name="description" content={t.catalog.subtitle} />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4">
        {/* Header del Catálogo */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">{t.catalog.title}</h1>
          <p className="text-gray-400">{t.catalog.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar de Filtros */}
          <div className="lg:col-span-1 space-y-6">
            {/* Barra de Búsqueda */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={t.catalog.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-800/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>

            {/* Filtros de Categoría */}
            <CategoryFilter 
              categories={categories} 
              selectedCategory={selectedCategory} 
              onSelectCategory={setSelectedCategory} 
            />
          </div>

          {/* Grid de Productos */}
          <div className="lg:col-span-3">
            {/* Sub-filtro de Juegos (Solo visible en Items In-Game) */}
            {selectedCategory === 'ingame-items' && (
              <div className="mb-6">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 ml-1">Filtrar por Juego</h4>
                <GameFilter selectedGame={selectedGame} onSelectGame={setSelectedGame} />
              </div>
            )}

            {(displayProducts && displayProducts.length > 0) ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <Filter className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">{t.catalog.noProducts}</h3>
                <p className="text-gray-400">Intenta ajustar tus filtros o búsqueda</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Catalog;