import React from 'react';
import { motion } from 'framer-motion';
import { Video, Gem, Ticket, Box, Zap, Crown, Sword } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const iconMap = {
  'Video': Video,
  'Gem': Gem,
  'Ticket': Ticket,
  'Box': Box,
  'Zap': Zap,
  'Crown': Crown,
  'Sword': Sword
};

const CategoryFilter = ({ categories, selectedCategory, onSelectCategory }) => {
  const { t } = useLanguage();

  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold text-white mb-4">{t.catalog?.categoriesTitle || 'Categories'}</h3>
      
      <button
        onClick={() => onSelectCategory(null)}
        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all border ${
          selectedCategory === null
            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-white/10 shadow-lg shadow-purple-900/20'
            : 'bg-gray-900/40 text-gray-400 border-white/5 hover:bg-white/5 hover:text-white hover:border-white/10'
        }`}
      >
        <span className="font-medium">{t.catalog?.allProducts || 'All Products'}</span>
      </button>

      {categories.map((category) => {
        const Icon = iconMap[category.icon];
        return (
          <motion.button
            key={category.id}
            onClick={() => onSelectCategory(category.id)}
            whileHover={{ x: 4 }}
            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all border ${
              selectedCategory === category.id
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-white/10 shadow-lg shadow-purple-900/20'
                : 'bg-gray-900/40 text-gray-400 border-white/5 hover:bg-white/5 hover:text-white hover:border-white/10'
            }`}
          >
            {Icon && <Icon className="w-5 h-5" />}
            <span className="font-medium">{category.name}</span>
          </motion.button>
        );
      })}
    </div>
  );
};

// Optimización: React.memo para evitar re-renderizados innecesarios en la lista de filtros
export default React.memo(CategoryFilter);