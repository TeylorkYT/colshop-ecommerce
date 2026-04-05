import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-900/40 backdrop-blur-xl p-12 rounded-2xl border border-white/10 shadow-2xl text-center max-w-lg w-full">
        <h1 className="text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-4">404</h1>
        <h2 className="text-2xl font-bold text-white mb-4">Página no encontrada</h2>
        <p className="text-gray-400 mb-8">Lo sentimos, la página que buscas no existe o ha sido movida.</p>
        <Link to="/">
          <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-8 py-6 text-lg rounded-xl shadow-lg shadow-purple-900/20 w-full sm:w-auto">
            <Home className="w-5 h-5 mr-2" />
            Volver al Inicio
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;