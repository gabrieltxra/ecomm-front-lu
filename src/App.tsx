import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "./contexts/CartContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import Header from "./components/Header";
import Home from "./pages/Home";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import NotFound from "./pages/NotFound";
import Products from "./pages/Products";
import { FaWhatsapp } from 'react-icons/fa';
import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro";
import Perfil from "./pages/Perfil";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeProvider>
        <CartProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <div className="min-h-screen bg-background relative">
              <Header />
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
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              {/* Botão flutuante do WhatsApp */}
              <a
                href="https://wa.me/5519991893513"
                target="_blank"
                rel="noopener noreferrer"
                className="fixed z-50 bottom-6 right-6 bg-rose-400 hover:bg-rose-500 text-white rounded-full shadow-lg p-4 flex items-center justify-center transition-all border-4 border-white"
                aria-label="Fale conosco no WhatsApp"
              >
                <FaWhatsapp className="w-7 h-7 text-white drop-shadow" />
              </a>
            </div>
          </BrowserRouter>
        </CartProvider>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
