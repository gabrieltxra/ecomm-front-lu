import React, { useEffect, useState } from 'react';
import { LogIn, Menu, Search, ShoppingBag, X } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

const Header: React.FC = () => {
  const { getTotalItems, isLoading: isCartLoading } = useCart();
  const { user, isLoggedIn, isLoading: isAuthLoading } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  const navigation = [
    { name: 'Loja', href: '/ecommerce' },
    { name: 'Produtos', href: '/produtos' },
    { name: 'O ateliê', href: '/' },
  ];

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSearchTerm(location.pathname === '/produtos' ? params.get('search') || '' : '');
    setIsMenuOpen(false);
    setIsSearchOpen(false);
  }, [location.pathname, location.search]);

  const submitSearch = () => {
    const value = searchTerm.trim();
    navigate(value ? `/produtos?search=${encodeURIComponent(value)}` : '/produtos');
  };

  const totalItems = getTotalItems();
  const cartLabel = isCartLoading
    ? 'Carregando carrinho de compras'
    : `Carrinho de compras com ${totalItems} ${totalItems === 1 ? 'item' : 'itens'}`;

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-[#473d35]/10 bg-[#f8f4ed]/95 text-[#302b27] backdrop-blur-xl">
      <div className="mx-auto max-w-[1380px] px-4 sm:px-8 lg:px-12">
        <div className="flex h-20 items-center justify-between gap-5">
          <Link to="/ecommerce" className="group flex shrink-0 items-center gap-3" aria-label="Ateliê Lu — loja">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#b45f5a] font-script text-xl font-bold text-white shadow-[0_8px_24px_rgba(109,56,51,0.18)] transition-transform group-hover:-rotate-6">
              L
            </span>
            <span className="hidden leading-none sm:block">
              <span className="block font-elegant text-lg font-semibold tracking-[0.03em]">Ateliê Lu</span>
              <span className="mt-1 block text-[9px] font-semibold uppercase tracking-[0.32em] text-[#8a7770]">Ateliê</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-6 lg:flex" aria-label="Menu principal">
            {navigation.map((item) => {
              const active = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`border-b py-2 text-sm font-semibold transition-colors ${
                    active
                      ? 'border-[#b45f5a] text-[#9f4e49]'
                      : 'border-transparent text-[#6f645c] hover:text-[#9f4e49]'
                  }`}
                  aria-current={active ? 'page' : undefined}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              submitSearch();
            }}
            className="hidden min-w-0 max-w-xs flex-1 items-center rounded-full border border-[#514841]/15 bg-[#fffaf3]/75 px-4 py-2.5 md:flex"
            role="search"
          >
            <Search className="h-4 w-4 shrink-0 text-[#9f4e49]" />
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Buscar na coleção"
              className="min-w-0 flex-1 bg-transparent px-3 text-sm text-[#403832] outline-none placeholder:text-[#9a8d84]"
              aria-label="Buscar produtos"
            />
          </form>

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => setIsSearchOpen((open) => !open)}
              className="grid h-10 w-10 place-items-center rounded-full text-[#5e554e] transition hover:bg-[#ead9cd] hover:text-[#9f4e49] md:hidden"
              aria-label="Buscar produtos"
            >
              <Search className="h-5 w-5" />
            </button>

            <Link
              to="/cart"
              className="relative grid h-10 w-10 place-items-center rounded-full text-[#5e554e] transition hover:bg-[#ead9cd] hover:text-[#9f4e49]"
              aria-label={cartLabel}
              aria-busy={isCartLoading}
            >
              <ShoppingBag className="h-5 w-5" />
              {!isCartLoading && totalItems > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-[#b45f5a] px-1 text-[10px] font-bold text-white">
                  {totalItems}
                </span>
              )}
            </Link>

            {isAuthLoading ? (
              <div className="h-9 w-9 animate-pulse rounded-full bg-[#ead9cd]" aria-label="Carregando conta" />
            ) : isLoggedIn && user ? (
              <Link
                to="/perfil"
                className="h-9 w-9 overflow-hidden rounded-full border-2 border-[#b45f5a] transition hover:scale-105"
                aria-label={`Abrir perfil de ${user.name}`}
              >
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  <span className="grid h-full w-full place-items-center bg-[#b45f5a] text-sm font-bold uppercase text-white">
                    {user.name[0]}
                  </span>
                )}
              </Link>
            ) : (
              <Link
                to="/login"
                className="grid h-10 w-10 place-items-center rounded-full text-[#5e554e] transition hover:bg-[#ead9cd] hover:text-[#9f4e49]"
                aria-label="Entrar na conta"
              >
                <LogIn className="h-5 w-5" />
              </Link>
            )}

            <button
              type="button"
              className="grid h-10 w-10 place-items-center rounded-full text-[#5e554e] transition hover:bg-[#ead9cd] lg:hidden"
              onClick={() => setIsMenuOpen((open) => !open)}
              aria-label={isMenuOpen ? 'Fechar menu principal' : 'Abrir menu principal'}
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {isSearchOpen && (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              submitSearch();
            }}
            className="mb-4 flex items-center rounded-full border border-[#514841]/15 bg-[#fffaf3] px-4 py-3 md:hidden"
          >
            <Search className="h-4 w-4 text-[#9f4e49]" />
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Buscar na coleção"
              className="min-w-0 flex-1 bg-transparent px-3 text-sm outline-none"
              aria-label="Buscar produtos"
              autoFocus
            />
          </form>
        )}

        {isMenuOpen && (
          <nav className="grid gap-1 border-t border-[#473d35]/10 py-4 lg:hidden" aria-label="Menu mobile">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="rounded-xl px-4 py-3 text-sm font-semibold text-[#5e554e] transition hover:bg-[#ead9cd] hover:text-[#9f4e49]"
              >
                {item.name}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
