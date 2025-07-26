import React, { useState } from 'react';
import { ShoppingCart, LogIn, Menu, X, Sun, Moon } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useTheme } from '../contexts/ThemeContext';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Header: React.FC = () => {
  const { getTotalItems } = useCart();
  const { theme, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { user, isLoggedIn } = useAuth();

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Produtos', href: '/produtos' },
    { name: 'Cortinas', href: '/cortinas' },
    { name: 'Persianas', href: '/persianas' },
    { name: 'Sob Medida', href: '/sob-medida' }
  ];

  const isActive = (href: string) => location.pathname === href;

  return (
    <header className="fixed top-0 w-full bg-background/95 backdrop-blur-sm border-b border-border z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-full bg-atelie-gradient flex items-center justify-center">
              <span className="text-white font-script text-lg font-bold">L</span>
            </div>
            <div className="hidden sm:block">
              <span className="text-gradient font-elegant text-xl font-semibold">Ateliê</span>
              <span className="text-gradient font-script text-xl ml-1">Lu</span>
              <span className="text-gradient font-elegant text-lg block text-xs">Cortinas</span>
            </div>
        </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8" role="navigation" aria-label="Menu principal">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`text-sm font-medium transition-colors hover:text-rose-500 dark:hover:text-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-500 dark:focus:ring-rose-400 rounded px-2 py-1 ${
                  isActive(item.href) ? 'text-rose-500 dark:text-rose-400 font-semibold' : 'text-muted-foreground'
                }`}
                aria-current={isActive(item.href) ? 'page' : undefined}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-accent transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500 dark:focus:ring-rose-400"
              aria-label={theme === 'light' ? 'Ativar modo escuro' : 'Ativar modo claro'}
            >
              {theme === 'light' ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </button>
            {/* Cart */}
            <Link 
              to="/cart" 
              className="relative p-2 rounded-lg hover:bg-accent transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500 dark:focus:ring-rose-400"
              aria-label={`Carrinho de compras com ${getTotalItems()} itens`}
            >
              <ShoppingCart className="h-5 w-5" />
              {getTotalItems() > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 dark:bg-rose-400 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium animate-pulse">
                  {getTotalItems()}
                </span>
              )}
            </Link>
            {isLoggedIn ? (
              <Link
                to="/perfil" // <- ADAPTAR DEPOIS PARA PAGE DE PERFIL
                className="w-8 h-8 rounded-full overflow-hidden border-2 border-primary hover:scale-105 transition-transform"
              >
             {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-rose-400 text-white text-xl font-bold uppercase">
                {user.name[0]
                }
              </div>
            )}
              </Link>
            ) : (
              <Link to="/login" className="p-2 rounded-lg hover:bg-accent transition-colors">
                <LogIn className="h-5 w-5" />
              </Link>
            )}
            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-accent transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border animate-fade-in">
            <nav className="flex flex-col space-y-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    isActive(item.href) ? 'text-primary' : 'text-muted-foreground'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
