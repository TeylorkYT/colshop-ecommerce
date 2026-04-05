import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, User, Menu, X, LogOut, Package } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import LanguageSelector from '@/components/LanguageSelector';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, currentUser, logout } = useAuth();
  const { getCartCount } = useCart();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const cartCount = getCartCount();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-black/40 border-b border-white/10 shadow-sm supports-[backdrop-filter]:bg-black/20 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group" aria-label="Colshop Home">
            <div className="bg-gradient-to-br from-purple-600 to-pink-600 p-2 rounded-full group-hover:scale-105 transition-transform shadow-lg shadow-purple-500/30">
              <img
                src="https://horizons-cdn.hostinger.com/ae0efb5f-b662-4e3e-9432-d1efac38eb1c/c248486beab37ce16e1787973a319fe0.png"
                alt="Colshop Logo"
                className="w-9 h-9 object-contain drop-shadow-md transition-transform duration-300 group-hover:rotate-[-12deg]"
              />
            </div>
            <span 
              className="text-3xl font-bold tracking-tighter bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
              style={{ textShadow: '0 0 20px rgba(232, 121, 249, 0.2)' }}
            >
              Colshop
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <NavLink to="/">{t.header.home}</NavLink>
            <NavLink to="/catalog">{t.header.catalog}</NavLink>
            {isAuthenticated && (
              <NavLink to="/orders">{t.header.orders}</NavLink>
            )}
            {currentUser?.role === 'admin' && (
              <NavLink to="/admin/inventory">{t.header.inventory}</NavLink>
            )}
            {/* Agrega esto junto a los otros enlaces del menú */}
            {currentUser?.role === 'admin' && (
              <NavLink to="/admin/tickets">{t.header.tickets}</NavLink>
            )}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            <LanguageSelector />
            
            <Link to="/cart" className="relative">
              <Button variant="ghost" size="icon" className="relative hover:bg-white/5 text-gray-300 hover:text-white transition-colors">
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center shadow-lg shadow-purple-500/50">
                    {cartCount}
                  </span>
                )}
              </Button>
            </Link>
            
            {isAuthenticated ? (
              <div className="flex items-center gap-3 pl-4 border-l border-white/10">
                <div className="flex flex-col items-end">
                  <span className="text-xs text-gray-400">Hola,</span>
                  <span className="text-sm font-medium text-white leading-none">{currentUser?.email?.split('@')[0]}</span>
                </div>
                <Button variant="ghost" size="icon" onClick={handleLogout} title={t.header.logout} className="hover:bg-red-500/10 hover:text-red-400">
                  <LogOut className="w-5 h-5" />
                </Button>
              </div>
            ) : (
              <Link to="/login">
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg shadow-purple-900/20 border border-white/10">
                  {t.header.login}
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-4">
            <LanguageSelector />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-3 -m-3 text-gray-300 hover:text-white rounded-full"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden bg-gray-900/95 border-t border-purple-500/20"
        >
          <div className="px-4 py-4 space-y-3">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-gray-300 hover:text-white transition-colors py-2"
            >
              {t.header.home}
            </Link>
            <Link
              to="/catalog"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-gray-300 hover:text-white transition-colors py-2"
            >
              {t.header.catalog}
            </Link>
            <Link
              to="/cart"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-gray-300 hover:text-white transition-colors py-2 flex items-center gap-2"
            >
              <ShoppingCart className="w-5 h-5" />
              {t.header.cart} {cartCount > 0 && `(${cartCount})`}
            </Link>
            {isAuthenticated && (
              <Link
                to="/orders"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-gray-300 hover:text-white transition-colors py-2"
              >
                {t.header.orders}
              </Link>
            )}
            {currentUser?.role === 'admin' && (
              <Link
                to="/admin/inventory"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-gray-300 hover:text-white transition-colors py-2"
              >
                {t.header.inventory}
              </Link>
            )}
            <div className="pt-3 border-t border-purple-500/20">
              {isAuthenticated ? (
                <div className="space-y-2">
                  <div className="text-sm text-gray-400">{currentUser?.email}</div>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleLogout}
                  >
                    {t.header.logout}
                  </Button>
                </div>
              ) : (
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500">
                    {t.header.login}
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </header>
  );
};

// Optimización: Componente extraído para evitar re-renderizados innecesarios
const NavLink = ({ to, children }) => (
  <Link 
    to={to} 
    className="relative text-sm font-medium text-gray-300 hover:text-white transition-colors group py-2"
  >
    {children}
    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300 group-hover:w-full shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
  </Link>
);

export default Header;