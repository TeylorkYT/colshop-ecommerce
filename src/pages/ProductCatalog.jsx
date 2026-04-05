import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, ArrowUpDown } from 'lucide-react';
import { useDatabase } from '@/contexts/DatabaseContext';
import { useLanguage } from '@/contexts/LanguageContext';
import ProductCard from '@/components/ProductCard';
import CategoryFilter from '@/components/CategoryFilter';
import RobuxCalculator from '@/components/RobuxCalculator';
import { Button } from '@/components/ui/button';

const ProductCatalog = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { products, categories } = useDatabase();
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState(location.state?.category || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');

  const filteredProducts = useMemo(() => {
    let filtered = products;

    if (selectedCategory) {
      filtered = filtered.filter(p => p.category === selectedCategory);
    } else {
      // Si estamos viendo "Todos", ocultamos los items de robux porque tienen su propia vista especial
      filtered = filtered.filter(p => p.category !== 'robux');
    }

    if (searchQuery) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered.sort((a, b) => {
      return sortOrder === 'asc' ? a.price - b.price : b.price - a.price;
    });
  }, [products, selectedCategory, searchQuery, sortOrder]);

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  return (
    <div className="min-h-screen bg-gray-900 pt-24 pb-12">
      <Helmet>
        <title>{t.catalog.title} - Colshop</title>
        <meta name="description" content={t.catalog.subtitle} />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-4">{t.catalog.title}</h1>
          <p className="text-gray-400">{t.catalog.subtitle}</p>
        </motion.div>

        {/* Search and Sort */}
        <div className="mb-8 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder={t.catalog.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-purple-500/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50"
            />
          </div>
          <Button
            onClick={toggleSortOrder}
            variant="outline"
            className="border-purple-500/20 hover:bg-purple-500/10"
          >
            <ArrowUpDown className="w-4 h-4 mr-2" />
            {sortOrder === 'asc' ? t.catalog.priceLowToHigh : t.catalog.priceHighToLow}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800/30 backdrop-blur-sm p-6 rounded-xl border border-purple-500/20 sticky top-24">
              <CategoryFilter
                categories={categories}
                selectedCategory={selectedCategory}
                onSelectCategory={handleCategorySelect}
              />
            </div>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {selectedCategory === 'robux' ? (
              <RobuxCalculator />
            ) : (!filteredProducts || filteredProducts.length === 0) ? (
              <div className="text-center py-16">
                <p className="text-gray-400 text-lg">{t.catalog.noProducts}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProducts.map((product, index) => (
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCatalog;