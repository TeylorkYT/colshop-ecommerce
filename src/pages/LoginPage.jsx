import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, ArrowRight, ShieldCheck, Gamepad2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { login } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(email, password);
      toast({
        title: t.auth.successLogin,
        description: t.auth.successLogin,
        variant: "success"
      });
      navigate('/');
    } catch (error) {
      toast({
        title: "Login Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-900">
      <Helmet>
        <title>{t.auth.loginTitle} - Colshop</title>
        <meta name="description" content="Login to your Colshop account" />
      </Helmet>

      {/* Left Panel - Branding & Trust (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gray-900 border-r border-white/5">
        {/* 1. Deep Space Background */}
        <div className="absolute inset-0 bg-[#0B0B0F] z-0" />
        
        {/* 2. Animated Glowing Orbs (Juegos de colores y luces) */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
          <div className="absolute -top-[10%] -left-[10%] w-[70%] h-[70%] rounded-full bg-purple-600/30 blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
          <div className="absolute -bottom-[10%] -right-[10%] w-[70%] h-[70%] rounded-full bg-pink-600/20 blur-[120px] animate-pulse" style={{ animationDuration: '12s' }} />
        </div>

        {/* 3. Tech Grid Pattern (Líneas / Textura) */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px] z-0" />
        
        {/* 4. Center Logo with Dynamic Glow (Logo interactuando con la luz) */}
        <div className="absolute inset-0 flex items-center justify-center z-0 opacity-40">
          <img src="/logo.png" alt="Brand Logo" className="w-[55%] max-w-md object-contain drop-shadow-[0_0_80px_rgba(168,85,247,0.6)]" />
        </div>

        {/* 5. Vignette Shadows & Text Readability Fade (Sombras para contraste) */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#0B0B0F_100%)] z-0 opacity-80" />
        <div className="absolute bottom-0 left-0 w-full h-2/3 bg-gradient-to-t from-[#0B0B0F] via-[#0B0B0F]/80 to-transparent z-0" />

        {/* Brand Content */}
        <div className="relative z-10 flex flex-col justify-end p-12 w-full h-full">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="space-y-6 max-w-lg">
            <h2 className="text-4xl font-bold text-white leading-tight">
              Bienvenido de vuelta a tu plataforma gamer de confianza.
            </h2>
            <p className="text-gray-400 text-lg">
              Accede a tus pedidos, gestiona tus compras digitales y descubre nuevas ofertas exclusivas.
            </p>
            <div className="flex items-center gap-4 text-sm font-medium text-gray-300 pt-4">
              <div className="flex items-center gap-2 bg-gray-800/50 px-4 py-2 rounded-full border border-white/5 backdrop-blur-md">
                <ShieldCheck className="w-5 h-5 text-green-400" />
                <span>Pagos 100% Seguros</span>
              </div>
              <div className="flex items-center gap-2 bg-gray-800/50 px-4 py-2 rounded-full border border-white/5 backdrop-blur-md">
                 <Lock className="w-5 h-5 text-purple-400" />
                 <span>Privacidad Garantizada</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
        {/* Subtle mobile background */}
        <div className="lg:hidden absolute inset-0 bg-gradient-to-b from-purple-900/20 to-gray-900 z-0" />
        
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md relative z-10"
        >
          <div className="text-center lg:text-left mb-10">
            <h1 className="text-3xl font-bold text-white mb-2">{t.auth.loginTitle}</h1>
            <p className="text-gray-400">{t.auth.loginSubtitle}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                {t.auth.email}
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 group-focus-within:text-purple-400 transition-colors">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  inputMode="email"
                  className="w-full pl-10 pr-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white text-base placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all shadow-sm"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                  {t.auth.password}
                </label>
                <Link to="/forgot-password" className="text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 group-focus-within:text-purple-400 transition-colors">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white text-base placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all shadow-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center pt-2">
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-gray-700 bg-gray-900 text-purple-600 focus:ring-purple-600 focus:ring-offset-gray-900 cursor-pointer"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-400 cursor-pointer select-none">
                Recordarme en este equipo
              </label>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 mt-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium text-lg transition-all active:scale-[0.98] shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>{t.auth.loginButton}</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-800 text-center">
            <p className="text-gray-400 text-sm">
              {t.auth.noAccount}{' '}
              <Link to="/signup" className="text-purple-400 hover:text-purple-300 font-semibold transition-colors">
                {t.auth.signupButton}
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;