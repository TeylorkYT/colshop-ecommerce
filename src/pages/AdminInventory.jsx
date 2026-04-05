import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useDatabase } from '@/contexts/DatabaseContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  Plus, Search, Edit2, Trash2, Tag, Percent, Filter,
  Zap, Package, ShoppingBag, Loader2, AlertCircle, X, Save, ChevronLeft, ChevronRight, Power,
  Copy, FilePlus2
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { motion, AnimatePresence } from 'framer-motion';
import ReactQuill from 'react-quill';

// Componente Modal Reutilizable y Animado
const Modal = ({ isOpen, onClose, title, children }) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-gray-900 border border-white/10 rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.5)] w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col"
        >
          <div className="flex justify-between items-center p-6 border-b border-white/10 bg-gray-800/50">
            <h2 className="text-xl font-bold text-white">{title}</h2>
            <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-400 hover:text-white hover:bg-white/10 rounded-full h-8 w-8">
              <X className="w-5 h-5" />
            </Button>
          </div>
          <div className="p-6 overflow-y-auto custom-scrollbar">
            {children}
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

// Configuración de las herramientas del editor (Negrita, Listas, Enlaces, etc.)
const quillModules = {
  toolbar: [
    [{ 'header': [1, 2, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{'list': 'ordered'}, {'list': 'bullet'}],
    ['link', 'clean']
  ],
};

// FIX RENDIMIENTO: Aislar y memoizar el editor de texto para evitar lag al escribir en otros inputs
const MemoizedQuill = React.memo(({ value, onChange }) => (
  <ReactQuill 
    theme="snow" 
    value={value || ''} 
    onChange={onChange} 
    modules={quillModules}
    placeholder="Detalles de lo que incluye el producto, beneficios, etc."
  />
));

// FIX: Decodificador recursivo de HTML para evitar doble escape ("&amp;lt;p&amp;gt;") al editar
const decodeHtmlForEditor = (htmlStr) => {
  if (!htmlStr) return '';
  let decoded = String(htmlStr);
  for (let i = 0; i < 3; i++) {
    const prev = decoded;
    decoded = decoded.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#039;/g, "'");
    if (prev === decoded) break;
  }
  return decoded;
};

const AdminInventory = () => {
  const { t } = useLanguage();
  const { 
    products, loading, addProduct, updateProduct, deleteProduct,
    coupons, fetchCoupons, addCoupon, updateCoupon, deleteCoupon,
    updateRobuxRate, isAddingProduct, isUpdatingProduct, isAddingCoupon, isUpdatingCoupon, isFetchingCoupons, formatCurrency, categories,
    supportedGames, deliveryMethods, fetchPaginatedProducts, uploadImage, downloadImageFromUrl
  } = useDatabase();
  const { toast } = useToast();
  
  // Estados Generales
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [robuxPrice, setRobuxPrice] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12; // Un poco más de items por página para aprovechar pantallas grandes
  
  const [adminProducts, setAdminProducts] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [isFetchingAdmin, setIsFetchingAdmin] = useState(true);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const nameInputRef = useRef(null); // Ref para el auto-focus

  // Estados de Modales y Formularios
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isCouponFormOpen, setIsCouponFormOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);

  const defaultProductForm = {
    name: '', category: '', price: '', stock: '', description: '', image: '', type: '', deliveryMethod: '', disclaimer: ''
  };
  const defaultCouponForm = {
    code: '', type: 'percentage', value: '', min_purchase: '0', usage_limit: '', active: true, expiry_date: ''
  };

  const [productForm, setProductForm] = useState(defaultProductForm);
  const [couponForm, setCouponForm] = useState(defaultCouponForm);

  useEffect(() => {
    fetchCoupons();
    const robuxProd = products.find(p => p.id === 'robux-currency' || p.category === 'robux');
    if (robuxProd) setRobuxPrice(robuxProd.price);
  }, [products, fetchCoupons]);

  useEffect(() => {
    // Debouncer: Espera 500ms después de que dejas de escribir para buscar
    const handler = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    setCurrentPage(1); // Reset paginación al cambiar filtros
  }, [debouncedSearch, categoryFilter, stockFilter, sortBy]);

  useEffect(() => {
    if (isProductFormOpen) {
      // Auto-focus en el primer campo al abrir el modal para una mejor UX
      setTimeout(() => nameInputRef.current?.focus(), 100);
    }
  }, [isProductFormOpen]);

  // Fetch Server-Side (Paginación desde la Base de Datos)
  useEffect(() => {
    const loadAdminProducts = async () => {
      setIsFetchingAdmin(true);
      const data = await fetchPaginatedProducts({
        page: currentPage, limit: itemsPerPage, search: debouncedSearch,
        category: categoryFilter, stock: stockFilter, sort: sortBy
      });
      setAdminProducts(data.products || []);
      setTotalItems(data.total || 0);
      setIsFetchingAdmin(false);
    };
    loadAdminProducts();
  }, [currentPage, debouncedSearch, categoryFilter, stockFilter, sortBy, fetchPaginatedProducts, products]); // Se recarga si cambian los productos globales (CRUD)

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // --- Controladores CRUD Productos ---
  const openAddProduct = () => { setEditingProduct(null); setProductForm(defaultProductForm); setIsProductFormOpen(true); };
  const openEditProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name || '', category: product.category || '', price: product.price?.toString() || '',
      stock: product.stock?.toString() || '', description: decodeHtmlForEditor(product.description), image: product.image || '', type: product.type || '',
      deliveryMethod: product.deliveryMethod || '', disclaimer: product.disclaimer || ''
    });
    setIsProductFormOpen(true);
  };
  const openDuplicateProduct = (product) => {
    setEditingProduct(null); // Importante: es un producto nuevo
    toast({ title: "Producto Duplicado", description: "Ahora estás creando una copia. No olvides guardar." });
    setProductForm({
      name: `Copia de ${product.name}`,
      category: product.category || '',
      price: product.price?.toString() || '',
      stock: '0', // Forzar revisión de stock en copias
      description: decodeHtmlForEditor(product.description),
      image: product.image || '',
      type: product.type || '',
      deliveryMethod: product.deliveryMethod || '',
      disclaimer: product.disclaimer || ''
    });
    setIsProductFormOpen(true);
  };

  // Controlador memoizado para el editor de texto
  const handleDescriptionChange = useCallback((content) => {
    setProductForm(prev => ({ ...prev, description: content }));
  }, []);

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setIsUploadingImage(true); // Bloqueamos el botón de guardar
    let finalImageUrl = productForm.image;

    try {
      const data = { ...productForm, image: finalImageUrl, price: Number(productForm.price), stock: Number(productForm.stock) };
      
      // Asegurar que los campos opcionales vacíos se limpien realmente en la base de datos
      if (!data.deliveryMethod) data.deliveryMethod = "";
      if (!data.disclaimer) data.disclaimer = "";

      if (editingProduct) await updateProduct(editingProduct.id, data);
      else await addProduct(data);
      setIsProductFormOpen(false);
      toast({ title: "Éxito", description: editingProduct ? "Producto actualizado." : "Producto añadido correctamente." });
    } catch (err) {
      toast({ title: "Error", description: err.message || "No se pudo guardar el producto.", variant: "destructive" });
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar este producto? Esta acción no se puede deshacer.")) {
      await deleteProduct(id);
      toast({ title: "Eliminado", description: "Producto eliminado correctamente." });
    }
  };

  // --- Controladores CRUD Cupones ---
  const openAddCoupon = () => { setEditingCoupon(null); setCouponForm(defaultCouponForm); setIsCouponFormOpen(true); };
  const openEditCoupon = (coupon) => {
    setEditingCoupon(coupon);
    setCouponForm({
      code: coupon.code || '', type: coupon.type || 'percentage', value: coupon.value?.toString() || '',
      min_purchase: coupon.min_purchase?.toString() || '0', usage_limit: coupon.usage_limit?.toString() || '',
      active: coupon.active !== undefined ? coupon.active : true,
      expiry_date: coupon.expiry_date ? coupon.expiry_date.split(' ')[0] : ''
    });
    setIsCouponFormOpen(true);
  };

  const handleCouponSubmit = async (e) => {
    e.preventDefault();
    const data = { ...couponForm, code: couponForm.code.toUpperCase(), value: Number(couponForm.value),
      min_purchase: Number(couponForm.min_purchase), usage_limit: couponForm.usage_limit ? Number(couponForm.usage_limit) : null,
      expiry_date: couponForm.expiry_date || null };
    try {
      if (editingCoupon) await updateCoupon(editingCoupon.id, data);
      else await addCoupon(data);
      setIsCouponFormOpen(false);
    } catch (err) {}
  };

  const handleDeleteCoupon = async (id) => {
    if (window.confirm("¿Eliminar definitivamente este cupón?")) await deleteCoupon(id);
  };

  const handleUpdateRobux = async () => {
    try {
      await updateRobuxRate(robuxPrice);
      toast({ title: "Tasa actualizada", description: `La tasa de Robux se fijó en ${formatCurrency(robuxPrice)}.` });
    } catch(e) {
      toast({ title: "Error", description: "No se pudo actualizar la tasa.", variant: "destructive" });
    }
  };

  // Extraer el producto actual de Robux para monitorizar su stock en tiempo real
  const currentRobuxProduct = products.find(p => p.id === 'robux-currency' || p.category === 'robux');

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-purple-500" />
          <p className="text-gray-400 font-medium">Cargando inventario...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl animate-in fade-in duration-500">
      <header className="mb-8">
        <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2">
          {t.inventory.title}
        </h1>
        <p className="text-gray-400 text-lg">
          Panel central de gestión de activos y promociones de Colshop.
        </p>
      </header>

      <Tabs defaultValue="products" className="space-y-6">
        <TabsList className="bg-gray-900/50 border border-white/10 p-1 rounded-xl">
          <TabsTrigger value="products" className="data-[state=active]:bg-purple-600 rounded-lg px-6 py-2.5 transition-all">
            <Package className="w-4 h-4 mr-2" />
            Productos
          </TabsTrigger>
          <TabsTrigger value="robux" className="data-[state=active]:bg-orange-600 rounded-lg px-6 py-2.5 transition-all">
            <Zap className="w-4 h-4 mr-2" />
            Tasa Robux
          </TabsTrigger>
          <TabsTrigger value="coupons" className="data-[state=active]:bg-emerald-600 rounded-lg px-6 py-2.5 transition-all">
            <Tag className="w-4 h-4 mr-2" />
            Cupones
          </TabsTrigger>
        </TabsList>

        {/* SECCIÓN PRODUCTOS */}
        <TabsContent value="products" className="space-y-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <Input 
                  placeholder="Buscar por nombre, categoría o tipo..." 
                  className="pl-10 bg-gray-900/40 border-white/10 text-white"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button onClick={openAddProduct} className="bg-purple-600 hover:bg-purple-500 shadow-lg shadow-purple-900/20 whitespace-nowrap">
                <Plus className="w-4 h-4 mr-2" /> {t.inventory.addProduct}
              </Button>
            </div>
            
            {/* Filtros Avanzados */}
            <div className="flex flex-wrap gap-3 p-3 bg-gray-900/40 border border-white/10 rounded-xl overflow-x-auto scrollbar-hide">
              <div className="flex items-center gap-2 mr-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-400 font-medium hidden md:inline">Filtros:</span>
              </div>
              <select 
                value={categoryFilter} 
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="h-9 rounded-md border border-white/10 bg-black/40 px-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
              >
                <option value="all">Todas las Categorías</option>
                {categories?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <select 
                value={stockFilter} 
                onChange={(e) => setStockFilter(e.target.value)}
                className="h-9 rounded-md border border-white/10 bg-black/40 px-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
              >
                <option value="all">Todo el Stock</option>
                <option value="in">En Stock (10+)</option>
                <option value="low">Stock Bajo (1-9)</option>
                <option value="out">Agotado (0)</option>
              </select>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="h-9 rounded-md border border-white/10 bg-black/40 px-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-purple-500 md:ml-auto"
              >
                <option value="newest">Ordenar por Defecto</option>
                <option value="price-desc">Precio: Mayor a Menor</option>
                <option value="price-asc">Precio: Menor a Mayor</option>
                <option value="stock-desc">Stock: Mayor a Menor</option>
                <option value="stock-asc">Stock: Menor a Mayor</option>
                <option value="name-asc">Nombre: A-Z</option>
                <option value="name-desc">Nombre: Z-A</option>
              </select>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-white/10 bg-gray-900/20 backdrop-blur-sm">
            <table className="w-full text-left">
              <thead className="bg-white/5 text-gray-400 text-sm uppercase font-semibold">
                <tr>
                  <th className="px-6 py-4">Producto</th>
                  <th className="px-6 py-4">Categoría</th>
                  <th className="px-6 py-4">Precio</th>
                  <th className="px-6 py-4">Stock</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {isFetchingAdmin ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-400">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto text-purple-500 mb-3" />
                      Cargando productos del servidor...
                    </td>
                  </tr>
                ) : adminProducts.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-400">
                      <Package className="w-12 h-12 mx-auto mb-3 opacity-20" />
                      No se encontraron productos.
                    </td>
                  </tr>
                ) : (
                adminProducts.map(product => (
                  <tr key={product.id} className={`hover:bg-white/[0.04] transition-colors group ${product.stock === 0 ? 'bg-red-900/5' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {product.image ? (
                          <img src={product.image} className="w-10 h-10 rounded-lg object-cover border border-white/10" alt={product.name} />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-gray-800 border border-white/10 flex items-center justify-center">
                            <Package className="w-5 h-5 text-gray-500" />
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-white">{product.name}</div>
                          <div className="text-[11px] text-gray-500 uppercase font-bold tracking-wider mt-0.5">
                            {product.category === 'ingame-items' 
                              ? supportedGames?.find(g => g.id === product.type)?.name || product.type || 'N/A'
                              : product.type || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-md bg-white/5 text-[11px] font-bold text-gray-300 uppercase tracking-wider">
                        {categories?.find(c => c.id === product.category)?.name || product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-white font-medium">{formatCurrency(product.price)}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${
                        product.stock === 0 ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                        product.stock < 10 ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                        'bg-green-500/10 text-green-400 border-green-500/20'
                      }`}>
                        {product.stock === 0 ? 'Agotado' : `${product.stock} disp.`}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1 opacity-50 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" onClick={() => openDuplicateProduct(product)} className="w-8 h-8 text-gray-400 hover:text-green-400 hover:bg-green-500/10" title="Duplicar Producto">
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => openEditProduct(product)} className="w-8 h-8 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10" title="Editar Producto">
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDeleteProduct(product.id)} 
                          className="w-8 h-8 text-gray-400 hover:text-red-400 hover:bg-red-500/10" 
                          title="Eliminar Producto">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                )))}
              </tbody>
            </table>
            
            {/* Paginación */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center p-4 bg-gray-900/40 border-t border-white/10">
                <span className="text-sm text-gray-400 font-medium">
                  Mostrando {totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} a {Math.min(currentPage * itemsPerPage, totalItems)} de {totalItems}
                </span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="border-white/10 hover:bg-white/5 text-gray-300">
                    <ChevronLeft className="w-4 h-4 mr-1" /> Anterior
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="border-white/10 hover:bg-white/5 text-gray-300">
                    Siguiente <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        {/* SECCIÓN ROBUX - CALCULADORA */}
        <TabsContent value="robux">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gray-900/40 border border-white/10 p-8 rounded-2xl shadow-xl">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-orange-500/20 rounded-xl text-orange-500">
                  <Zap className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Tasa de Cambio Robux</h3>
                  <p className="text-sm text-gray-400">Define el precio unitario por cada 1 R$</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Precio actual (COP)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-orange-500">$</span>
                    <Input 
                      type="number" 
                      value={robuxPrice} 
                      onChange={(e) => setRobuxPrice(e.target.value)}
                      className="pl-8 h-14 bg-black/40 border-white/10 text-2xl font-bold text-white focus-visible:ring-orange-500"
                    />
                  </div>
                </div>
                <Button 
                  onClick={handleUpdateRobux}
                  className="w-full h-12 bg-orange-600 hover:bg-orange-500 text-lg font-bold"
                >
                  Actualizar Tasa Global
                </Button>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="bg-blue-500/5 border border-blue-500/20 p-6 rounded-2xl flex-1">
                <div className="flex items-center gap-2 text-blue-400 mb-4">
                  <AlertCircle className="w-5 h-5" />
                  <h4 className="font-semibold">Información del Sistema</h4>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Este valor afecta directamente a la calculadora de Robux en el frontend. 
                  Al cambiar la tasa, todos los pedidos nuevos se calcularán con este precio de forma inmediata.
                </p>
              </div>
              
              {/* Monitor de Stock en Tiempo Real */}
              <div className="bg-gray-900/40 border border-white/10 p-6 rounded-2xl flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-1">Stock de Robux (R$)</h4>
                  <p className="text-xs text-gray-500">Sincronizado con ID: robux-currency</p>
                </div>
                <div className="text-right flex flex-col items-end gap-2">
                  <span className={`text-2xl font-black ${currentRobuxProduct?.stock < 1000 ? 'text-red-400' : 'text-green-400'}`}>
                    {currentRobuxProduct ? currentRobuxProduct.stock.toLocaleString('es-CO') : '0'}
                  </span>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="h-7 text-xs border-white/10 bg-black/20 hover:bg-white/10 text-gray-300" 
                    onClick={() => currentRobuxProduct && openEditProduct(currentRobuxProduct)}>
                    <Edit2 className="w-3 h-3 mr-1" /> Editar Stock
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* SECCIÓN CUPONES */}
        <TabsContent value="coupons" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-white">Gestión de Cupones</h3>
            <Button onClick={openAddCoupon} className="bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-900/20">
              <Plus className="w-4 h-4 mr-2" /> Crear Cupón
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {isFetchingCoupons ? (
               Array(3).fill(0).map((_, i) => (
                <div key={i} className="h-40 rounded-xl bg-white/5 animate-pulse border border-white/10" />
               ))
            ) : coupons.length === 0 ? (
               <div className="col-span-full py-12 text-center text-gray-400 border border-dashed border-white/10 rounded-xl bg-white/[0.02]">
                 <Tag className="w-12 h-12 mx-auto mb-3 opacity-20" />
                 <p>No hay cupones activos en este momento.</p>
               </div>
            ) : coupons.map(coupon => (
                <div key={coupon.id} className={`relative group bg-gray-900/40 border p-6 rounded-xl transition-all ${coupon.active ? 'border-emerald-500/30 hover:border-emerald-500/60' : 'border-white/10 opacity-60'}`}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className={`text-2xl font-black tracking-tighter ${coupon.active ? 'text-emerald-400' : 'text-gray-500'}`}>{coupon.code}</span>
                      <div className="flex items-center gap-2 mt-1">
                        {coupon.type === 'percentage' ? (
                          <Percent className="w-3.5 h-3.5 text-gray-500" />
                        ) : (
                          <ShoppingBag className="w-3.5 h-3.5 text-gray-500" />
                        )}
                        <span className="text-xs text-gray-400 uppercase font-bold">
                          {coupon.type === 'percentage' ? `${coupon.value}% OFF` : `${formatCurrency(coupon.value)} OFF`}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1 md:opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => updateCoupon(coupon.id, { active: !coupon.active })} 
                        title={coupon.active ? "Desactivar Cupón" : "Activar Cupón"}
                        className={`w-8 h-8 ${coupon.active ? 'text-emerald-400 hover:bg-emerald-500/10' : 'text-gray-500 hover:text-emerald-400 hover:bg-emerald-500/10'}`}
                      >
                        <Power className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => openEditCoupon(coupon)} className="w-8 h-8 text-gray-400 hover:text-white hover:bg-white/10">
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="w-8 h-8 text-gray-400 hover:text-red-400 hover:bg-red-500/10"
                        onClick={() => handleDeleteCoupon(coupon.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-white/5 text-[10px] uppercase font-bold tracking-widest text-gray-500">
                    <div>
                      <p>Usos</p>
                      <p className="text-gray-300 text-sm">{coupon.used_count} / {coupon.usage_limit || '∞'}</p>
                    </div>
                    <div className="text-center">
                      <p>Min. Compra</p>
                      <p className="text-gray-300 text-sm">{formatCurrency(coupon.min_purchase)}</p>
                    </div>
                    <div className="text-right">
                      <p>Expira</p>
                      <p className="text-gray-300 text-sm">{coupon.expiry_date ? new Date(coupon.expiry_date).toLocaleDateString('es-CO') : 'Nunca'}</p>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Modal Crear/Editar Producto */}
      <Modal isOpen={isProductFormOpen} onClose={() => setIsProductFormOpen(false)} title={
        <div className="flex items-center gap-3">
          <FilePlus2 className="w-6 h-6 text-purple-400"/>
          <span>{editingProduct ? 'Editar Producto' : 'Añadir Nuevo Producto'}</span>
        </div>
      }>
        <form onSubmit={handleProductSubmit} className="space-y-6">
          
          <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold text-gray-400">Nombre del Producto</label>
              <Input ref={nameInputRef} required value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} className="bg-black/40 border-white/10 text-white focus-visible:ring-purple-500 h-11" placeholder="Ej: Fruta Leopardo (Blox Fruits)" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-400">Categoría</label>
              <select required value={productForm.category} onChange={e => setProductForm({...productForm, category: e.target.value})} className="w-full h-11 rounded-md border border-white/10 bg-black/40 px-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all">
                <option value="" disabled>Selecciona...</option>
                {categories?.map(c => <option key={c.id} value={c.id} className="bg-gray-900">{c.name}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-400">Imagen (Archivo o URL)</label>
              <div className="flex flex-col gap-2">
                <Input 
                  type="file" 
                  accept="image/*" 
                  disabled={isUploadingImage}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      try {
                        setIsUploadingImage(true);
                        const url = await uploadImage(file);
                        setProductForm({...productForm, image: url});
                        toast({ title: "Éxito", description: "Imagen subida al servidor." });
                      } catch (err) {
                        toast({ title: "Error", description: "No se pudo subir la imagen.", variant: "destructive" });
                      } finally {
                        setIsUploadingImage(false);
                      }
                    }
                  }}
                  className="bg-black/40 border-white/10 text-white file:bg-gray-800 file:text-white file:border-0 file:rounded-md file:px-3 file:py-1 file:mr-3 hover:file:bg-gray-700 w-full cursor-pointer h-11 py-2 text-xs" 
                />
                <div className="flex items-center gap-2">
                  <Input type="text" required value={productForm.image} onChange={e => setProductForm({...productForm, image: e.target.value})} className="bg-black/40 border-white/10 text-white focus-visible:ring-purple-500 h-11 flex-1" placeholder="Ej: /uploads/img.jpg o https://..." />
                  {productForm.image && (
                    <div className="w-11 h-11 rounded-md border border-white/10 bg-gray-800 shrink-0 flex items-center justify-center relative overflow-hidden">
                      <img src={productForm.image} alt="Preview" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                      {isUploadingImage && <div className="absolute inset-0 bg-black/60 flex items-center justify-center"><Loader2 className="w-4 h-4 text-white animate-spin" /></div>}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </fieldset>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-400">Precio Base (COP)</label>
              <Input type="number" required min="0" step="100" value={productForm.price} onChange={e => setProductForm({...productForm, price: e.target.value})} className="bg-black/40 border-white/10 text-white focus-visible:ring-purple-500 h-11" placeholder="0" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-400">Stock Disponible</label>
              <Input type="number" required min="0" value={productForm.stock} onChange={e => setProductForm({...productForm, stock: e.target.value})} className="bg-black/40 border-white/10 text-white focus-visible:ring-purple-500 h-11" placeholder="0" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-400">Descripción Completa</label>
            <div className="rounded-xl border border-white/10 overflow-hidden bg-black/40 [&_.ql-toolbar]:bg-gray-900 [&_.ql-toolbar]:border-none [&_.ql-toolbar]:border-b [&_.ql-toolbar]:border-white/10 [&_.ql-container]:border-none [&_.ql-editor]:text-white [&_.ql-editor]:min-h-[120px] [&_.ql-editor.ql-blank::before]:text-gray-500 [&_.ql-stroke]:stroke-gray-400 [&_.ql-fill]:fill-gray-400 [&_.ql-picker]:text-gray-400 [&_.ql-picker-options]:bg-gray-900 [&_.ql-picker-options]:border-white/10 [&_.ql-picker-item:hover]:text-purple-400 [&_.ql-active]:text-purple-400 [&_.ql-active_.ql-stroke]:stroke-purple-400">
              <MemoizedQuill 
                value={productForm.description} 
                onChange={handleDescriptionChange} 
              />
            </div>
          </div>
          
          {/* --- FORMULARIO INTELIGENTE --- */}
          <fieldset className="border-t border-dashed border-white/10 pt-6 space-y-5">
            <legend className="text-sm font-semibold text-gray-400 -translate-y-9 bg-gray-900 px-2">Opciones Específicas</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 -mt-2">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-400 flex items-center gap-2">
                  {productForm.category === 'ingame-items' ? 'Juego Específico' : 'Tipo de Ítem'}
                  {['ingame-items'].includes(productForm.category) && <span className="text-purple-400 text-xs">(Requerido)</span>}
                </label>
                {productForm.category === 'ingame-items' ? (
                  <select required value={productForm.type} onChange={e => setProductForm({...productForm, type: e.target.value})} className="w-full h-11 rounded-md border border-white/10 bg-black/40 px-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all">
                    <option value="" disabled>Selecciona un juego...</option>
                    {supportedGames?.map(game => (<option key={game.id} value={game.id} className="bg-gray-900">{game.name}</option>))}
                    <option value="other" className="bg-gray-900">Otro</option>
                  </select>
                ) : (
                  <Input value={productForm.type} onChange={e => setProductForm({...productForm, type: e.target.value})} className="bg-black/40 border-white/10 text-white focus-visible:ring-purple-500 h-11" placeholder="ej. subscription, rank, currency" />
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-400 flex items-center gap-2">
                Método de Entrega
                {['ingame-items', 'minecraft'].includes(productForm.category) && <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" title="Sugerido para esta categoría"></span>}
              </label>
                <select value={productForm.deliveryMethod || ''} onChange={e => setProductForm({...productForm, deliveryMethod: e.target.value})} className="w-full h-11 rounded-md border border-white/10 bg-black/40 px-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all">
                  <option value="" className="bg-gray-900">Automático / No aplica</option>
                  {deliveryMethods?.map(method => (
                    <option key={method.id} value={method.id} className="bg-gray-900">{method.name}</option>
                  ))}
                  <option value="credentials" className="bg-gray-900">Credenciales / Cuenta</option>
                </select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-semibold text-gray-400">Aviso Legal (Disclaimer)</label>
                <Input value={productForm.disclaimer || ''} onChange={e => setProductForm({...productForm, disclaimer: e.target.value})} className="bg-black/40 border-white/10 text-white focus-visible:ring-purple-500 h-11" placeholder="Ej: Requiere nivel 700+. Riesgo de ban por TOS..." />
              </div>
            </div>
          </fieldset>

          <div className="pt-4 flex justify-end gap-3 border-t border-white/10">
            <Button type="button" variant="ghost" onClick={() => setIsProductFormOpen(false)} className="hover:bg-white/5 text-gray-300">Cancelar</Button>
            <Button type="submit" disabled={isAddingProduct || isUpdatingProduct || isUploadingImage} className="bg-purple-600 hover:bg-purple-500 min-w-[140px]">
              {isAddingProduct || isUpdatingProduct || isUploadingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              {editingProduct ? 'Guardar Cambios' : 'Añadir Producto'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Crear/Editar Cupón */}
      <Modal isOpen={isCouponFormOpen} onClose={() => setIsCouponFormOpen(false)} title={editingCoupon ? 'Editar Cupón' : 'Crear Nuevo Cupón'}>
        <form onSubmit={handleCouponSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-[13px] font-semibold text-gray-400 uppercase tracking-wide">Código de Descuento</label>
              <Input required value={couponForm.code} onChange={e => setCouponForm({...couponForm, code: e.target.value.toUpperCase()})} className="bg-black/40 border-white/10 text-white font-mono uppercase focus-visible:ring-emerald-500 h-11" placeholder="EJ: VERANO2025" />
            </div>
            <div className="space-y-2">
              <label className="text-[13px] font-semibold text-gray-400 uppercase tracking-wide">Tipo de Aplicación</label>
              <select required value={couponForm.type} onChange={e => setCouponForm({...couponForm, type: e.target.value})} className="w-full h-11 rounded-md border border-white/10 bg-black/40 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all">
                <option value="percentage" className="bg-gray-900">Porcentaje (%)</option>
                <option value="fixed" className="bg-gray-900">Monto Fijo Exacto</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[13px] font-semibold text-gray-400 uppercase tracking-wide">Valor {couponForm.type === 'percentage' ? '(%)' : 'Descontado'}</label>
              <Input type="number" required min="1" max={couponForm.type === 'percentage' ? "100" : undefined} value={couponForm.value} onChange={e => setCouponForm({...couponForm, value: e.target.value})} className="bg-black/40 border-white/10 text-white focus-visible:ring-emerald-500 h-11" placeholder="Ej: 15" />
            </div>
            <div className="space-y-2">
              <label className="text-[13px] font-semibold text-gray-400 uppercase tracking-wide">Mínimo de Compra</label>
              <Input type="number" required min="0" value={couponForm.min_purchase} onChange={e => setCouponForm({...couponForm, min_purchase: e.target.value})} className="bg-black/40 border-white/10 text-white focus-visible:ring-emerald-500 h-11" placeholder="0 para sin mínimo" />
            </div>
            <div className="space-y-2">
              <label className="text-[13px] font-semibold text-gray-400 uppercase tracking-wide">Límite Global de Usos</label>
              <Input type="number" min="1" value={couponForm.usage_limit} onChange={e => setCouponForm({...couponForm, usage_limit: e.target.value})} placeholder="Dejar vacío para ∞" className="bg-black/40 border-white/10 text-white focus-visible:ring-emerald-500 h-11" />
            </div>
            <div className="space-y-2">
              <label className="text-[13px] font-semibold text-gray-400 uppercase tracking-wide">Fecha de Expiración</label>
              <Input type="date" value={couponForm.expiry_date} onChange={e => setCouponForm({...couponForm, expiry_date: e.target.value})} className="bg-black/40 border-white/10 text-white focus-visible:ring-emerald-500 h-11 [color-scheme:dark]" />
            </div>
            <div className="space-y-2 flex items-center md:items-end md:pb-2">
               <label className="flex items-center gap-3 text-[14px] font-semibold text-gray-300 cursor-pointer hover:text-white transition-colors">
                 <input type="checkbox" checked={couponForm.active} onChange={e => setCouponForm({...couponForm, active: e.target.checked})} className="rounded border-white/20 bg-black/40 text-emerald-500 w-5 h-5 focus:ring-emerald-500 focus:ring-offset-gray-900 transition-all" />
                 Habilitar para el público
               </label>
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-3 border-t border-white/10">
            <Button type="button" variant="ghost" onClick={() => setIsCouponFormOpen(false)} className="hover:bg-white/5 text-gray-300">Cancelar</Button>
            <Button type="submit" disabled={isAddingCoupon || isUpdatingCoupon} className="bg-emerald-600 hover:bg-emerald-500 min-w-[140px]">
              {isAddingCoupon || isUpdatingCoupon ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              {editingCoupon ? 'Guardar Cambios' : 'Crear Cupón'}
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
};

export default AdminInventory;