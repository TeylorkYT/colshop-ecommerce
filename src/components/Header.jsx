import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, User, Menu, X, LogOut, Package, Search } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { useDatabase } from '@/contexts/DatabaseContext';
import LanguageSelector from '@/components/LanguageSelector';

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

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, currentUser, logout } = useAuth();
  const { itemCount } = useCart(); // Usamos el valor directo optimizado
  const { t } = useLanguage();
  const { currency, setCurrency, searchProducts } = useDatabase();
  const navigate = useNavigate();

  // Estado para el buscador
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const searchRef = useRef(null);

  // Efecto para buscar mientras escribes
  useEffect(() => {
    // OPTIMIZACIÓN: Debounce para evitar lag al escribir rápido
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim()) {
        const results = searchProducts(searchQuery);
        setSearchResults(results.slice(0, 5)); // Limitar a 5 resultados
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, searchProducts]);

  // Cerrar buscador al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchResults([]);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-sm bg-black/90 border-b border-white/10 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group mr-8 shrink-0 relative">
            {/* Aura de neón (Glow) que reacciona al pasar el mouse */}
            <div className="absolute -inset-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500" />
            
            {/* Contenedor del Logo (Glassmorphism) */}
            <div className="relative w-14 h-14 flex items-center justify-center rounded-xl bg-black/40 border border-white/10 backdrop-blur-md shadow-2xl group-hover:border-purple-500/50 group-hover:scale-105 group-hover:-rotate-3 transition-all duration-300">
              <img
                src="/logo.png"
                alt="Colshop Logo"
                className="w-full h-full object-contain drop-shadow-[0_0_8px_rgba(168,85,247,0.5)] scale-125 group-hover:scale-[1.4] transition-transform duration-500"
                // OPTIMIZACIÓN: Carga prioritaria para el logo (LCP)
                loading="eager"
                fetchPriority="high"
              />
            </div>
            
            {/* Tipografía contundente con micro-interacción */}
            <span className="text-2xl font-black tracking-tighter text-white relative">
              Colshop
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 group-hover:w-full transition-all duration-300 ease-out" />
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6 shrink-0">
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

                    {/* Search Bar (Desktop) */}

                    <div className="hidden md:block flex-1 max-w-md mx-4 relative" ref={searchRef}>

                      <div className="relative group">

                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-purple-400 transition-colors" />

                        <input 

                          type="text"

                          placeholder={t.header.search}

                          value={searchQuery}

                          onChange={(e) => setSearchQuery(e.target.value)}

                          className="w-full bg-black/20 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-purple-500/50 focus:bg-black/40 transition-all placeholder-gray-500"

                        />

                      </div>

                      

                      {/* Dropdown de Resultados */}

                      {searchQuery && (

                        <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">

                          {searchResults.length > 0 ? (

                            searchResults.map(product => (

                              <Link 

                                key={product.id} 

                                to={`/product/${product.id}`}

                                onClick={() => setSearchQuery('')}

                                className="flex items-center gap-4 p-3 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"

                              >

                                <img src={product.image} alt={product.name} className="w-10 h-10 rounded-lg object-cover" />

                                <div className="flex-1 min-w-0">

                                  <div className="text-sm font-medium text-white truncate">{product.name}</div>

                                  <div className="text-xs text-purple-400">{product.displayPrice}</div>

                                </div>

                              </Link>

                            ))

                          ) : (

                            <div className="p-4 text-center text-gray-400 text-sm">{t.product.notFound}</div>

                          )}

                        </div>

                      )}

                    </div>

          

                    {/* Desktop Actions */}

                    <div className="hidden md:flex items-center gap-5">

                      <LanguageSelector />

                      

                      {/* Selector de Moneda */}

                      <select 

                        value={currency}

                        onChange={(e) => setCurrency(e.target.value)}

                        className="bg-black/20 border border-white/10 text-gray-300 text-sm rounded-md px-3 py-1.5 focus:outline-none focus:border-purple-500 cursor-pointer hover:text-white transition-colors"

                      >

                        <option value="COP" className="bg-gray-900">COP</option>

                        <option value="USD" className="bg-gray-900">USD</option>

                        <option value="MXN" className="bg-gray-900">MXN</option>

                        <option value="ARS" className="bg-gray-900">ARS</option>

                        <option value="CLP" className="bg-gray-900">CLP</option>

                        <option value="PEN" className="bg-gray-900">PEN</option>

                        <option value="BRL" className="bg-gray-900">BRL</option>

                      </select>

                      

                      <Link to="/cart" className="relative">

                        <Button variant="ghost" size="icon" className="relative hover:bg-white/10 text-gray-300 hover:text-white transition-colors rounded-full w-10 h-10">

                          <ShoppingCart className="w-5 h-5 stroke-[1.5]" />

                          {itemCount > 0 && (

                            <span className="absolute top-0 right-0 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center shadow-md shadow-purple-500/40 ring-2 ring-black">

                              {itemCount}

                            </span>

                          )}

                        </Button>

                      </Link>

                      

                      {isAuthenticated ? (

                        <div className="flex items-center gap-3 pl-5 border-l border-white/10">

                          <div className="flex flex-col items-end">

                            <span className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">{t.header.hello}</span>

                            <span className="text-sm font-medium text-gray-200 leading-none max-w-[100px] truncate">{currentUser?.email?.split('@')[0]}</span>

                          </div>

                          <Button variant="ghost" size="icon" onClick={handleLogout} title={t.header.logout} className="hover:bg-red-500/10 hover:text-red-400 rounded-full w-9 h-9 transition-colors">

                            <LogOut className="w-4 h-4" />

                          </Button>

                        </div>

                      ) : (

                        <Link to="/login">

                          <Button className="bg-white text-black hover:bg-gray-200 font-semibold px-6 rounded-full shadow-lg shadow-white/5 transition-all hover:scale-105 active:scale-95">

                            {t.header.login}

                          </Button>

                        </Link>

                      )}

                    </div>

          

                              {/* Mobile Menu Button */}

          

                              <div className="md:hidden flex items-center">

          

                                <button

          

                                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}

          

                                  className="p-2 text-gray-300 hover:text-white"

          

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

          

                              className="md:hidden bg-black/95 border-t border-white/10 backdrop-blur-xl"

          

                            >

          

                              <div className="px-4 py-4 space-y-3">

          

                                 {/* Search Bar (Mobile) */}

          

                              <div className=" md:hidden flex-1 max-w-md mx-4 relative" ref={searchRef}>

          

                                <div className="relative group">

          

                                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-purple-400 transition-colors" />

          

                                  <input 

          

                                    type="text"

          

                                    placeholder={t.header.search}

          

                                    value={searchQuery}

          

                                    onChange={(e) => setSearchQuery(e.target.value)}

          

                                    className="w-full bg-black/20 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-purple-500/50 focus:bg-black/40 transition-all placeholder-gray-500"

          

                                  />

          

                                </div>

          

                                

          

                                {/* Dropdown de Resultados */}

          

                                {searchQuery && (

          

                                  <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">

          

                                    {searchResults.length > 0 ? (

          

                                      searchResults.map(product => (

          

                                        <Link 

          

                                          key={product.id} 

          

                                          to={`/product/${product.id}`}

          

                                          onClick={() => setSearchQuery('')}

          

                                          className="flex items-center gap-4 p-3 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"

          

                                        >

          

                                          <img src={product.image} alt={product.name} className="w-10 h-10 rounded-lg object-cover" />

          

                                          <div className="flex-1 min-w-0">

          

                                            <div className="text-sm font-medium text-white truncate">{product.name}</div>

          

                                            <div className="text-xs text-purple-400">{product.displayPrice}</div>

          

                                          </div>

          

                                        </Link>

          

                                      ))

          

                                    ) : (

          

                                      <div className="p-4 text-center text-gray-400 text-sm">{t.product.notFound}</div>

          

                                    )}

          

                                  </div>

          

                                )}

          

                              </div>

          

                              <div className='flex justify-between items-center'>

          

                                <LanguageSelector />

          

                                <select 

          

                                  value={currency}

          

                                  onChange={(e) => setCurrency(e.target.value)}

          

                                  className="bg-black/20 border border-white/10 text-gray-300 text-xs rounded-md px-1 py-1 focus:outline-none focus:border-purple-500"

          

                                >

          

                                  <option value="COP" className="bg-gray-900">COP</option>

          

                                  <option value="USD" className="bg-gray-900">USD</option>

          

                                  <option value="MXN" className="bg-gray-900">MXN</option>

          

                                  <option value="ARS" className="bg-gray-900">ARS</option>

          

                                  <option value="CLP" className="bg-gray-900">CLP</option>

          

                                  <option value="PEN" className="bg-gray-900">PEN</option>

          

                                  <option value="BRL" className="bg-gray-900">BRL</option>

          

                                </select>

          

                                </div>

          

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

                        className="flex text-gray-300 hover:text-white transition-colors py-2 items-center gap-2"

                      >

                        <ShoppingCart className="w-5 h-5" />

                        {t.header.cart} {itemCount > 0 && `(${itemCount})`}

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

                      {currentUser?.role === 'admin' && (

                        <Link

                          to="/admin/tickets"

                          onClick={() => setMobileMenuOpen(false)}

                          className="block text-gray-300 hover:text-white transition-colors py-2"

                        >

                          {t.header.tickets}

                        </Link>

                      )}

                      <div className="pt-3 border-t border-purple-500/20">

                        {isAuthenticated ? (

                          <div className="space-y-2">

                            <div className="text-sm text-gray-400 px-2">{currentUser?.email}</div>

                            <Button

                              variant="outline"

                              className="w-full"

                              onClick={handleLogout}

                            >

                              {t.header.logout}

                            </Button>

                          </div>

                        ) : (

                          <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block mt-4">

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

          

          export default Header;

          