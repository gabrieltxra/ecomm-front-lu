import React, { useEffect, useState } from 'react';
import { ShoppingCart, LogIn, Menu, X, Search } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Header: React.FC = () => {
  const { getTotalItems, isLoading: isCartLoading } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isLoggedIn, isLoading: isAuthLoading } = useAuth();

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Produtos', href: '/produtos' },
    // { name: 'Cortinas', href: '/cortinas' },
    // { name: 'Persianas', href: '/persianas' },
    // { name: 'Sob Medida', href: '/sob-medida' }
  ];

  const isActive = (href: string) => location.pathname === href;

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSearchTerm(location.pathname === '/produtos' ? params.get('search') || '' : '');
  }, [location.pathname, location.search]);

  const submitSearch = () => {
    const value = searchTerm.trim();
    navigate(value ? `/produtos?search=${encodeURIComponent(value)}` : '/produtos');
    setIsMenuOpen(false);
    setIsSearchOpen(false);
  };

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submitSearch();
  };

  const totalItems = getTotalItems();
  const cartLabel = isCartLoading
    ? 'Carregando carrinho de compras'
    : `Carrinho de compras com ${totalItems} ${totalItems === 1 ? 'item' : 'itens'}`;

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
                className={`rounded-lg px-3 py-2 text-sm font-semibold transition-all duration-150 hover:-translate-y-0.5 hover:bg-accent hover:text-accent-foreground hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                  isActive(item.href)
                    ? 'bg-accent text-accent-foreground ring-1 ring-primary/20 shadow-sm'
                    : 'text-muted-foreground'
                }`}
                aria-current={isActive(item.href) ? 'page' : undefined}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          <form
            onSubmit={handleSearchSubmit}
            className="hidden min-w-0 flex-1 max-w-sm items-center rounded-full border border-border bg-background px-3 py-2 md:flex"
            role="search"
          >
            <button
              type="submit"
              className="rounded-full p-1 text-muted-foreground transition hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              aria-label="Enviar busca"
            >
              <Search className="h-4 w-4" />
            </button>
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  submitSearch();
                }
              }}
              placeholder="Buscar produtos"
              className="min-w-0 flex-1 bg-transparent px-2 text-sm outline-none placeholder:text-muted-foreground"
              aria-label="Buscar produtos"
            />
          </form>

          {/* Actions */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <button
              type="button"
              onClick={() => setIsSearchOpen((open) => !open)}
              className="rounded-lg p-2 text-muted-foreground transition-all duration-150 hover:-translate-y-0.5 hover:bg-accent hover:text-accent-foreground hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 md:hidden"
              aria-label="Buscar produtos"
            >
              <Search className="h-5 w-5" />
            </button>

            {/* Cart */}
            <Link 
              to="/cart" 
              className="relative rounded-lg p-2 text-muted-foreground transition-all duration-150 hover:-translate-y-0.5 hover:bg-accent hover:text-accent-foreground hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              aria-label={cartLabel}
              aria-busy={isCartLoading}
            >
              <ShoppingCart className="h-5 w-5" />
              {!isCartLoading && totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 dark:bg-rose-400 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium animate-pulse">
                  {totalItems}
                </span>
              )}
            </Link>
            {isAuthLoading ? (
              <div
                className="h-8 w-8 animate-pulse rounded-full bg-muted"
                role="status"
                aria-label="Carregando conta"
              />
            ) : isLoggedIn && user ? (
              <Link
                to="/perfil"
                className="w-8 h-8 rounded-full overflow-hidden border-2 border-primary hover:scale-105 transition-transform"
                aria-label={`Abrir perfil de ${user.name}`}
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
              <Link to="/login" aria-label="Entrar na conta" className="rounded-lg p-2 text-muted-foreground transition-all duration-150 hover:-translate-y-0.5 hover:bg-accent hover:text-accent-foreground hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                <LogIn className="h-5 w-5" />
              </Link>
            )}
            {/* Mobile Menu Button */}
            <button
              type="button"
              className="rounded-lg p-2 text-muted-foreground transition-all duration-150 hover:-translate-y-0.5 hover:bg-accent hover:text-accent-foreground hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? 'Fechar menu principal' : 'Abrir menu principal'}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-navigation"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {isSearchOpen && (
          <form
            onSubmit={handleSearchSubmit}
            className="mb-3 flex items-center rounded-full border border-border bg-background px-3 py-2 shadow-sm md:hidden"
            role="search"
          >
            <button
              type="submit"
              className="rounded-full p-1 text-muted-foreground transition hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              aria-label="Enviar busca"
            >
              <Search className="h-4 w-4" />
            </button>
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  submitSearch();
                }
              }}
              placeholder="Buscar produtos"
              className="min-w-0 flex-1 bg-transparent px-2 text-sm outline-none placeholder:text-muted-foreground"
              aria-label="Buscar produtos"
              autoFocus
            />
          </form>
        )}

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div id="mobile-navigation" className="md:hidden py-4 border-t border-border animate-fade-in">
            <nav className="flex flex-col space-y-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`rounded-lg px-3 py-2 text-sm font-semibold transition-all duration-150 hover:bg-accent hover:text-accent-foreground ${
                    isActive(item.href)
                      ? 'bg-accent text-accent-foreground ring-1 ring-primary/20'
                      : 'text-muted-foreground'
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
