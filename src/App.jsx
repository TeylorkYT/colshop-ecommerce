import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { DatabaseProvider } from '@/contexts/DatabaseContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { CurrencyProvider } from '@/contexts/CurrencyContext';
import { Toaster } from '@/components/ui/toaster';
import Header from '@/components/Header';
import { HelmetProvider } from 'react-helmet-async';
import { Loader2 } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import RobuxCalculator from '@/components/RobuxCalculator';
import CookieBanner from '@/components/CookieBanner';

const HomePage = lazy(() => import('@/pages/HomePage'));
const ProductCatalog = lazy(() => import('@/pages/ProductCatalog'));
const ProductDetail = lazy(() => import('@/pages/ProductDetail'));
const Cart = lazy(() => import('@/pages/Cart'));
const Checkout = lazy(() => import('@/pages/Checkout'));
const UserDashboard = lazy(() => import('@/pages/UserDashboard'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const SignupPage = lazy(() => import('@/pages/SignupPage'));
const AdminInventory = lazy(() => import('./pages/AdminInventory'));
const TicketPage = lazy(() => import('@/pages/TicketPage'));
const AdminTicketDashboard = lazy(() => import('@/pages/AdminTicketDashboard'));
const PaymentResponse = lazy(() => import('@/pages/PaymentResponse'));
const PaymentStatus = lazy(() => import('@/pages/PaymentStatus'));
const TermsPage = lazy(() => import('@/pages/TermsPage'));

// FIX: Componente auxiliar para ocultar el Header en rutas específicas (Login/Signup)
const ConditionalHeader = () => {
  const location = useLocation();
  const hiddenRoutes = ['/login', '/signup'];
  if (hiddenRoutes.includes(location.pathname)) return null;
  return <Header />;
};

function App() {
  return (
    <BrowserRouter>
      <HelmetProvider>
      <LanguageProvider>
        <CurrencyProvider>
            <AuthProvider>
              <DatabaseProvider>
              <CartProvider>
                <div className="min-h-screen bg-gray-900">
                  <ConditionalHeader />
                  <Suspense fallback={<div className="flex h-[80vh] items-center justify-center"><Loader2 className="w-12 h-12 animate-spin text-purple-500" /></div>}>
                    <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/catalog" element={<ProductCatalog />} />
                    <Route path="/product/:id" element={<ProductDetail />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signup" element={<SignupPage />} />
                    <Route
                      path="/checkout"
                      element={
                        <ProtectedRoute>
                          <Checkout />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/orders"
                      element={
                        <ProtectedRoute>
                          <UserDashboard />
                        </ProtectedRoute>
                      }
                  />
                  <Route
                    path="/ticket/:orderId"
                    element={
                      <ProtectedRoute>
                        <TicketPage />
                      </ProtectedRoute>
                    }
                    />
                    <Route path="/payment/status" element={<PaymentStatus />} />
                    <Route
                      path="/payment-response"
                      element={
                        <ProtectedRoute>
                          <PaymentResponse />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin/tickets"
                      element={
                        <ProtectedRoute adminOnly>
                          <AdminTicketDashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin/inventory"
                      element={
                        <ProtectedRoute adminOnly>
                      <AdminInventory />
                        </ProtectedRoute>
                      }
                    />
                    <Route path="/terms" element={<TermsPage />} />
                    </Routes>
                  </Suspense>
                  <Toaster />
                  <CookieBanner />
                </div>
              </CartProvider>
            </DatabaseProvider>
          </AuthProvider>
        </CurrencyProvider>
      </LanguageProvider>
      </HelmetProvider>
    </BrowserRouter>
  );
}

export default App;