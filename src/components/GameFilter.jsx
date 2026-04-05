import React, { useMemo } from 'react';
import { useDatabase } from '@/contexts/DatabaseContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';

const GameFilter = ({ selectedGame, onSelectGame }) => {
  const { products } = useDatabase();
  const { t } = useLanguage();

  // Lógica Inteligente: Escanea tus productos y extrae los juegos disponibles
  const games = useMemo(() => {
    const gameTypes = new Set();
    products.forEach(p => {
      // Solo buscamos tipos dentro de la categoría de items in-game
      if (p.category === 'ingame-items' && p.type) {
        gameTypes.add(p.type);
      }
    });
    return Array.from(gameTypes).sort();
  }, [products]);

  // Convierte "blox-fruits" a "Blox Fruits" visualmente
  const formatGameName = (id) => {
    return id
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Si no hay juegos detectados, no mostramos nada
  if (games.length === 0) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full overflow-x-auto pb-4 no-scrollbar"
    >
      <div className="flex gap-2">
        <button
          onClick={() => onSelectGame(null)}
          className={`px-4 py-2 rounded-full text-sm font-bold transition-all border whitespace-nowrap ${
            selectedGame === null
              ? 'bg-purple-600 text-white border-purple-500 shadow-lg shadow-purple-500/20'
              : 'bg-gray-900/50 text-gray-400 border-white/10 hover:bg-white/5 hover:text-white'
          }`}
        >
          {t.catalog?.categories?.all || 'Todos'}
        </button>
        
        {games.map((gameId) => (
          <button
            key={gameId}
            onClick={() => onSelectGame(gameId)}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-all border whitespace-nowrap ${
              selectedGame === gameId
                ? 'bg-purple-600 text-white border-purple-500 shadow-lg shadow-purple-500/20'
                : 'bg-gray-900/50 text-gray-400 border-white/10 hover:bg-white/5 hover:text-white'
            }`}
          >
            {formatGameName(gameId)}
          </button>
        ))}
      </div>
    </motion.div>
  );
};

export default GameFilter;