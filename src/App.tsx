import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider, Helmet } from "react-helmet-async";
import { lazy, Suspense } from "react";
import { CartProvider } from "./contexts/CartContext";
import { ThemeProvider } from "./contexts/ThemeContext";

import Footer from "./components/Footer";
import { AuthProvider } from "./contexts/AuthContext";
import Header from "./components/Header";
import ScrollToTop from "./components/ScrollToTop";
import ProtectedRoute from "./components/ProtectedRoute";
import { MessageCircle } from "lucide-react";

const queryClient = new QueryClient();

const Home = lazy(() => import("./pages/Home"));
const Products = lazy(() => import("./pages/Products"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const Login = lazy(() => import("./pages/Login"));
const Cadastro = lazy(() => import("./pages/Cadastro"));
const Perfil = lazy(() => import("./pages/Perfil"));
const Cart = lazy(() => import("./pages/Cart"));
const CheckoutPage = lazy(() => import("./pages/Checkout"));
const CheckoutStep3 = lazy(() => import("./components/CheckoutStep3_Success"));
const CheckoutStepPending = lazy(() => import("./components/CheckoutStepPending"));
const CheckoutStepError = lazy(() => import("./components/CheckoutStepError"));
const OrderDetail = lazy(() => import("./pages/OrderDetail"));
const OrderSupport = lazy(() => import("./pages/OrderSupport"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage"));
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPasswordPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

const PageFallback = () => (
  <div className="flex min-h-[60vh] items-center justify-center" role="status">
    <div className="h-10 w-10 animate-spin rounded-full border-4 border-rose-200 border-t-rose-500" />
    <span className="sr-only">Carregando página</span>
  </div>
);

const App = () => (
  <HelmetProvider>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <ThemeProvider>
            <CartProvider>
              <AuthProvider>
              <Toaster />
              <Sonner />
              {/* SEO Meta Tags */}
              <Helmet>
                <title>Ateliê Lu Cortinas - Cortinas e Persianas Sob Medida</title>
                <meta name="description" content="Transforme seu lar com elegância e personalidade. Cortinas e persianas sob medida há mais de 10 anos. Qualidade premium, atendimento exclusivo e entrega para todo Brasil." />
                <meta name="keywords" content="cortinas, persianas, sob medida, decoração, ateliê, lu cortinas, cortinas personalizadas, persianas personalizadas" />
                <meta name="author" content="Ateliê Lu Cortinas" />
                <meta name="robots" content="index, follow" />
                
                {/* Open Graph */}
                <meta property="og:title" content="Ateliê Lu Cortinas - Cortinas e Persianas Sob Medida" />
                <meta property="og:description" content="Transforme seu lar com elegância e personalidade. Cortinas e persianas sob medida há mais de 10 anos." />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://atelielucortinas.com" />
                
                {/* Twitter Card */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="Ateliê Lu Cortinas" />
                <meta name="twitter:description" content="Cortinas e persianas sob medida com qualidade premium" />
                
                {/* Favicon */}
                <link rel="icon" type="image/x-icon" href="/favicon.ico" />
                
                {/* Preconnect para performance */}
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
              </Helmet>
              <div className="min-h-screen bg-background relative flex flex-col">
                <ScrollToTop />
                <Header />
                <main className="flex-1">
                  <Suspense fallback={<PageFallback />}>
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/produtos" element={<Products />} />
                      <Route path="/product/:id" element={<ProductDetail />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/cadastro" element={<Cadastro />} />
                      <Route path="/perfil" element={<ProtectedRoute><Perfil /></ProtectedRoute>} />
                      <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
                      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                      <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
                      {/* <Route path="/cortinas" element={<Home />} />
                      <Route path="/persianas" element={<Home />} />
                      <Route path="/sob-medida" element={<Home />} /> */}
                      <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
                      <Route path="/success" element={<ProtectedRoute><CheckoutStep3 /></ProtectedRoute>} />
                      <Route path="/checkout/pending" element={<ProtectedRoute><CheckoutStepPending /></ProtectedRoute>} />
                      <Route path="/checkout/error" element={<ProtectedRoute><CheckoutStepError /></ProtectedRoute>} />
                      <Route path="/order/:id" element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />
                      <Route path="/order/:id/support" element={<ProtectedRoute><OrderSupport /></ProtectedRoute>} />
                      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Suspense>
                </main>
                <Footer />
                {/* Botão flutuante do WhatsApp */}
                <a
                  href="https://wa.me/5519991893513"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="fixed z-50 bottom-6 right-6 bg-rose-400 hover:bg-rose-500 text-white rounded-full shadow-lg dark:shadow-dark p-4 flex items-center justify-center transition-all border-4 border-white dark:border-slate-800 backdrop-blur-sm"
                  aria-label="Fale conosco no WhatsApp"
                >
                  <MessageCircle className="h-7 w-7 text-white drop-shadow" />
                </a>
              </div>
            </AuthProvider>
          </CartProvider>
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </BrowserRouter>
</HelmetProvider>
);

export default App;
