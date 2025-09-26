import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider, Helmet } from "react-helmet-async";
import { CartProvider } from "./contexts/CartContext";
import { ThemeProvider } from "./contexts/ThemeContext";

import Footer from "./components/Footer";
import Home from "./pages/Home";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import NotFound from "./pages/NotFound";
import Products from "./pages/Products";
import { FaWhatsapp } from 'react-icons/fa';
import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro";
import Perfil from "./pages/Perfil";
import { AuthProvider } from "./contexts/AuthContext";
import CheckoutPage from "./pages/Checkout";
import Header from "./components/Header";
import CheckoutStep3 from "./components/CheckoutStep3_Success";
import OrderDetail from "./pages/OrderDetail";

const queryClient = new QueryClient();

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
                <Header />
                <main className="flex-1">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/produtos" element={<Products />} />
                    <Route path="/product/:id" element={<ProductDetail />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/cadastro" element={<Cadastro />} />
                    <Route path="/perfil" element={<Perfil />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/cortinas" element={<Home />} />
                    <Route path="/persianas" element={<Home />} />
                    <Route path="/sob-medida" element={<Home />} />
                    <Route path="/checkout" element={<CheckoutPage />} />
                    <Route path="/success" element={<CheckoutStep3 />} />
                    <Route path="/order/:id" element={<OrderDetail />} />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
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
                  <FaWhatsapp className="w-7 h-7 text-white drop-shadow" />
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
