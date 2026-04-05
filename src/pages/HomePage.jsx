import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, Shield, Zap, Clock, Calculator, Star, Gamepad2, MonitorPlay, Crown, ChevronRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDatabase } from '@/contexts/DatabaseContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import ProductCard from '@/components/ProductCard';
import DiscordButton from '@/components/DiscordButton';

const HomePage = () => {
  const { products, formatCurrency } = useDatabase();
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();
  
  // Revertir a 3 productos para un layout de 4 columnas
  const featuredProducts = products.filter(p => p.category !== 'robux').slice(0, 3);
  const robuxProduct = products.find(p => p.category === 'robux');

  const trustBadges = [
    { icon: Zap, title: "Entrega Inmediata", desc: "Sistema automatizado" },
    { icon: Shield, title: "Pagos Seguros", desc: "Encriptación 256-bit" },
    { icon: Star, title: "Clientes Felices", desc: "Miles de valoraciones" },
    { icon: CheckCircle2, title: "Garantía Total", desc: "Soporte post-venta" }
  ];

  const features = [
    {
      icon: Shield,
      title: t.home.features.securePayment,
      description: t.home.features.securePaymentDesc
    },
    {
      icon: Zap,
      title: t.home.features.fastDelivery,
      description: t.home.features.fastDeliveryDesc
    },
    {
      icon: Clock,
      title: t.home.features.support,
      description: t.home.features.supportDesc,
      link: "https://discord.gg/colshoprobux"
    },
    {
      icon: ShoppingBag,
      title: t.home.features.bestPrices,
      description: t.home.features.bestPricesDesc
    }
  ];

  return (
    <div className="min-h-screen bg-[#0B0B0F] selection:bg-purple-500/30">
      <Helmet>
        <title>Colshop - {t.home.heroTitleSuffix}</title>
        <meta name="description" content={t.home.heroSubtitle} />
      </Helmet>
      
      <DiscordButton />

      {/* Hero Section Épico */}
      <section className="relative pt-36 pb-24 px-4 overflow-hidden min-h-[90vh] flex flex-col justify-center">
        {/* Background Effects */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-purple-600/30 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-pink-600/20 rounded-full blur-[100px]" />
        </div>
        <div className="absolute inset-0 opacity-20 mix-blend-overlay pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300"><filter id="cs-noise-filter"><feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/></filter><rect width="100%" height="100%" filter="url(#cs-noise-filter)"/></svg>`)}")` }}></div>

        <div className="relative max-w-5xl mx-auto text-center z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-md shadow-2xl hover:bg-white/10 transition-colors cursor-default"
            >
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
                ))}
              </div>
              <span className="text-xs font-bold text-gray-200 tracking-wider uppercase border-l border-white/20 pl-3">
                La Tienda #1 de Gaming
              </span>
            </motion.div>

            <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tight leading-[1.1]">
              <span className="bg-gradient-to-br from-white to-gray-400 bg-clip-text text-transparent">
                {t.home.heroTitlePrefix || "Sube de Nivel"}
              </span><br />
              <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-purple-500 bg-clip-text text-transparent">
                {t.home.heroTitleSuffix || "Tu Experiencia"}
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              {t.home.heroSubtitle}
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link to="/catalog">
                <Button size="lg" className="relative group bg-purple-600 hover:bg-purple-500 text-white text-lg px-8 h-14 rounded-xl overflow-hidden transition-all shadow-[0_0_40px_rgba(147,51,234,0.3)] hover:shadow-[0_0_60px_rgba(147,51,234,0.5)] border border-purple-500/50">
                  <span className="relative z-10 flex items-center font-bold">
                    {t.home.browseCatalog} <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </Button>
              </Link>
              {isAuthenticated ? (
                <Link to="/orders">
                  <Button size="lg" variant="outline" className="text-lg px-8 h-14 rounded-xl border-white/10 bg-white/5 text-white hover:bg-white/10 hover:border-white/20 backdrop-blur-md">
                    {t.header.orders}
                  </Button>
                </Link>
              ) : (
                <Link to="/login">
                  <Button size="lg" variant="outline" className="text-lg px-8 h-14 rounded-xl border-white/10 bg-white/5 text-white hover:bg-white/10 hover:border-white/20 backdrop-blur-md">
                    {t.home.getStarted}
                  </Button>
                </Link>
              )}
            </div>
          </motion.div>
        </div>
        
        {/* Trust Banner Flotante */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="absolute bottom-0 left-0 right-0 w-full border-t border-white/5 bg-black/40 backdrop-blur-xl z-20 hidden md:block"
        >
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="grid grid-cols-4 divide-x divide-white/5">
              {trustBadges.map((badge, i) => (
                <div key={i} className="flex items-center justify-center gap-4 px-4">
                  <badge.icon className="w-8 h-8 text-purple-400 opacity-80" />
                  <div className="text-left">
                    <h4 className="text-white font-bold text-sm uppercase tracking-wide">{badge.title}</h4>
                    <p className="text-gray-500 text-xs">{badge.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* Featured Products */}
      <section className="pt-16 pb-20 px-4 relative z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-purple-900/10 to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16 relative z-10"
          >
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">{t.home.featuredTitle}</h2>
            <p className="text-gray-400 text-lg">{t.home.featuredSubtitle}</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
            {/* Tarjeta Especial de Calculadora Robux */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0 }}
              className="h-full group"
            >
              <Link to="/catalog" state={{ category: 'robux' }} className="block h-full">
                <div className="relative h-full bg-gray-900/80 backdrop-blur-xl rounded-2xl overflow-hidden border border-purple-500/30 group-hover:border-purple-400 group-hover:-translate-y-2 group-hover:shadow-[0_20px_40px_-15px_rgba(147,51,234,0.5)] transition-all duration-500 flex flex-col">
                  <div className="absolute inset-0 bg-gradient-to-b from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="relative h-40 overflow-hidden">
                    {robuxProduct?.image ? (
                      <img 
                        src={robuxProduct.image} 
                        alt="Robux" 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-purple-900 to-pink-900 flex items-center justify-center">
                        <Calculator className="w-12 h-12 text-white/80" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent" />
                  </div>
                  
                  <div className="p-5 flex-grow flex flex-col relative z-10">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-2xl font-black text-white tracking-tight group-hover:text-purple-300 transition-colors pr-2 leading-tight">{t.calculator.title}</h3>
                      <div className="flex-shrink-0 flex items-center gap-1 bg-purple-500/20 text-purple-300 text-[10px] uppercase font-bold px-2.5 py-1 rounded-md border border-purple-500/30">
                        <Zap className="w-3 h-3 text-purple-400" />
                        <span>{t.home.robuxCard.badge}</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center text-xs border-t border-white/10 pt-2 mt-auto">
                      <div className="flex flex-col">
                        <span className="text-gray-500 uppercase font-bold tracking-wider text-[10px]">{t.home.robuxCard.price}</span>
                        <span className="text-green-400 font-bold text-sm">
                          {t.home.robuxCard.pricePerUnit.replace('{price}', formatCurrency(robuxProduct?.price || 45))}
                        </span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-gray-500 uppercase font-bold tracking-wider text-[10px]">{t.home.robuxCard.stock}</span>
                        <span className="text-white font-bold text-sm flex items-center gap-1.5">
                          <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span></span>
                          {robuxProduct?.stock?.toLocaleString() || '100k+'}
                        </span>
                      </div>
                    </div>

                    <div className="pt-3">
                      <div className="h-11 px-4 flex items-center justify-center bg-purple-600 group-hover:bg-purple-500 text-white text-sm font-bold uppercase tracking-widest rounded-xl transition-colors text-center w-full">
                        {t.calculator.buy} <ChevronRight className="w-4 h-4 ml-1 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>

            {featuredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 + index * 0.1 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12 relative z-10">
            <Link to="/catalog">
              <Button variant="outline" size="lg" className="border-white/10 bg-white/5 text-white hover:bg-white/10 hover:border-white/20 backdrop-blur-md rounded-xl px-10 h-12 font-bold tracking-wide">
                {t.home.viewAll}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              const content = (
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-900 border border-white/10 rounded-2xl mb-6 shadow-lg group-hover:scale-110 group-hover:border-purple-500/50 transition-all duration-500">
                    <Icon className="w-8 h-8 text-purple-400 group-hover:text-pink-400 transition-colors" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
                </div>
              );

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="h-full group"
                >
                  {feature.link ? (
                    <a href={feature.link} target="_blank" rel="noopener noreferrer" className="block h-full relative overflow-hidden bg-gray-900/50 backdrop-blur-xl p-8 rounded-3xl border border-[#5865F2]/30 hover:border-[#5865F2] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(88,101,242,0.3)]">
                      <div className="absolute inset-0 bg-gradient-to-br from-[#5865F2]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      {content}
                    </a>
                  ) : (
                    <div className="block h-full relative overflow-hidden bg-gray-900/50 backdrop-blur-xl p-8 rounded-3xl border border-white/5 hover:border-purple-500/30 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(147,51,234,0.15)]">
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      {content}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;