import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import ProductGrid from '../components/ProductGrid';
import { ChevronLeft, ChevronRight, Filter, Search, X } from 'lucide-react';
import { getProducts, useProducts } from '@/services/productsService';
import { useSearchParams } from 'react-router-dom';
import { trackSearch, trackViewItemList } from '@/lib/analytics';
import Head from '@/components/ui/Head';

const Products: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const { productsData, loading, fetchProducts, fetchFiltersConfig, filtersConfig } = useProducts();
  const categoryFromUrl = searchParams.get('category') || '';
  const searchFromUrl = searchParams.get('search') || '';
  const lastFetchKeyRef = useRef('');
  const lastAnalyticsListKeyRef = useRef('');
  const lastAnalyticsSearchRef = useRef('');

  const [filters, setFilters] = useState({
    category: categoryFromUrl,
    minPrice: 0,
    maxPrice: 0,
    sortBy: 'name',
  });

  useEffect(() => {
    fetchFiltersConfig();
  }, [fetchFiltersConfig]);

  useEffect(() => {
    const fetchKey = JSON.stringify({ filters, searchFromUrl });
    const shouldDebounce = lastFetchKeyRef.current !== fetchKey;
    lastFetchKeyRef.current = fetchKey;

    const timeoutId = window.setTimeout(() => {
      void fetchProducts(filters, searchFromUrl ? 1 : currentPage, searchFromUrl ? 200 : 12);
    }, shouldDebounce ? 180 : 0);

    return () => window.clearTimeout(timeoutId);
  }, [currentPage, fetchProducts, filters, searchFromUrl]);

  useEffect(() => {
    setFilters((prev) => {
      if (prev.category === categoryFromUrl) return prev;
      return { ...prev, category: categoryFromUrl };
    });
    setCurrentPage(1);
  }, [categoryFromUrl]);

  const defaultPriceRange = useMemo(() => {
    if (filtersConfig?.priceRange) return filtersConfig.priceRange;
    if (!productsData || productsData.products.length === 0) return { min: 0, max: 10000 };
    const prices = productsData.products.map(p => Number(p.price));
    return {
      min: 0,
      max: Math.max(...prices)
    };
  }, [filtersConfig, productsData]);

  const clearFilters = () => {
    setSearchParams({});
    setFilters({
      category: '',
      minPrice: 0,
      maxPrice: 0,
      sortBy: 'name'
    });
    setCurrentPage(1);
  };

  const handleCategoryChange = (value: string) => {
    setFilters({ ...filters, category: value });
    setCurrentPage(1);
    const nextParams: Record<string, string> = {};
    if (value) {
      nextParams.category = value;
    }
    if (searchFromUrl) {
      nextParams.search = searchFromUrl;
    }

    if (Object.keys(nextParams).length > 0) {
      setSearchParams(nextParams);
      return;
    }

    setSearchParams({});
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const defaultCategories = useMemo(() => {
    if (filtersConfig?.categories?.length) return filtersConfig.categories;
    if (!productsData) return [];

    const counts = new Map<string, number>();
    for (const product of productsData.products) {
      counts.set(product.category, (counts.get(product.category) || 0) + 1);
    }

    return Array.from(counts.entries()).map(([name, count], i) => ({
      id: i + 1,
      name,
      count,
    }));
  }, [filtersConfig, productsData]);

  const displayedProducts = useMemo(() => {
    const products = productsData?.products || [];
    const term = searchFromUrl.trim().toLowerCase();
    if (!term) return products;

    return products.filter((product) => {
      const searchable = [
        product.name,
        product.description,
        product.category,
      ].join(' ').toLowerCase();

      return searchable.includes(term);
    });
  }, [productsData, searchFromUrl]);

  useEffect(() => {
    if (loading || !productsData || displayedProducts.length === 0) return;

    const listName = searchFromUrl
      ? `Busca: ${searchFromUrl}`
      : filters.category
      ? `Categoria: ${filters.category}`
      : 'Catálogo';
    const listKey = `${listName}:${displayedProducts.map((product) => product.id).join(',')}`;

    if (lastAnalyticsListKeyRef.current !== listKey) {
      lastAnalyticsListKeyRef.current = listKey;
      trackViewItemList(displayedProducts, listName);
    }

    const searchTerm = searchFromUrl.trim();
    if (searchTerm && lastAnalyticsSearchRef.current !== searchTerm) {
      lastAnalyticsSearchRef.current = searchTerm;
      trackSearch(searchTerm);
    }
  }, [displayedProducts, filters.category, loading, productsData, searchFromUrl]);

  const totalPages = productsData?.totalPages || 1;
  const activePage = productsData?.page || currentPage;

  useEffect(() => {
    if (!productsData || searchFromUrl || loading) return;

    const pagesToPrefetch = [activePage + 1, activePage - 1]
      .filter((page) => page >= 1 && page <= totalPages && page !== activePage);

    for (const page of pagesToPrefetch) {
      void getProducts(filters, page, 12).catch(() => undefined);
    }
  }, [activePage, filters, loading, productsData, searchFromUrl, totalPages]);

  const goToPage = useCallback((page: number) => {
    const nextPage = Math.min(Math.max(page, 1), totalPages);
    if (nextPage === currentPage || loading) return;
    setCurrentPage(nextPage);
  }, [currentPage, loading, totalPages]);

  if (loading && !productsData) {
    return (
      <div className="min-h-screen bg-[#f8f4ed] pt-20">
        <div className="mx-auto max-w-[1380px] px-5 py-12 sm:px-8 lg:px-12">
          <div className="grid animate-pulse grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-96 rounded-[1.35rem] bg-[#eadfd4]" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f4ed] pt-20 text-[#302b27]">
      <Head title="Coleção | Ateliê Lu" />
      <section className="border-b border-[#473d35]/10 bg-[#efe5dc]">
        <div className="mx-auto max-w-[1380px] px-5 py-12 sm:px-8 sm:py-16 lg:px-12">
          <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-[#a64f4a]">Coleção Ateliê Lu</p>
          <h1 className="mt-3 font-elegant text-4xl tracking-[-0.03em] sm:text-5xl md:text-6xl">Encontre a peça certa.</h1>
          <p className="mt-4 text-sm text-[#746860]">
            {displayedProducts.length} produto{displayedProducts.length !== 1 ? 's' : ''} encontrado{displayedProducts.length !== 1 ? 's' : ''}
          </p>
          {searchFromUrl && (
            <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#fffaf3] px-4 py-2 text-sm font-semibold text-[#9f4e49] ring-1 ring-[#b45f5a]/15">
              <Search className="h-4 w-4" />
              Busca: {searchFromUrl}
            </p>
          )}
        </div>
      </section>

      <div className="mx-auto max-w-[1380px] px-5 py-12 sm:px-8 lg:px-12 lg:py-16">
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Filtros */}
          <div className="lg:w-72 lg:shrink-0">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="mb-4 flex w-full items-center justify-center gap-2 rounded-full bg-[#b45f5a] px-4 py-3 font-semibold text-white lg:hidden"
            >
              <Filter className="w-5 h-5" />
              Filtros
              {showFilters && <X className="w-5 h-5" />}
            </button>

            <div className={`sticky top-24 rounded-[1.35rem] border border-[#473d35]/10 bg-[#fffaf3] p-6 shadow-[0_10px_30px_rgba(64,48,39,0.05)] lg:block ${showFilters ? 'block' : 'hidden'}`}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-elegant text-xl font-semibold text-[#302b27]">Filtros</h3>
                <button onClick={clearFilters} className="text-sm font-semibold text-[#a64f4a] hover:text-[#8f4541]">Limpar</button>
              </div>

              {/* Categoria */}
              <div className="mb-6">
                <h4 className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-[#6c6058]">Categoria</h4>
                <div className="space-y-2">
                  <label className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="category"
                        value=""
                        checked={filters.category === ''}
                        onChange={(e) => handleCategoryChange(e.target.value)}
                        className="mr-2 accent-[#b45f5a]"
                      />
                      <span className="text-sm text-[#5e554e]">Todas</span>
                    </div>
                  </label>
                  {defaultCategories.map((cat) => (
                    <label key={cat.id} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <input
                          type="radio"
                          name="category"
                          value={cat.name}
                          checked={filters.category === cat.name}
                          onChange={(e) => handleCategoryChange(e.target.value)}
                          className="mr-2 accent-[#b45f5a]"
                        />
                        <span className="text-sm text-[#5e554e]">{cat.name}</span>
                      </div>
                      <span className="text-xs text-[#9a8d84]">{cat.count}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Preço */}
              <div className="mb-6">
                <h4 className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-[#6c6058]">Faixa de preço</h4>
                <div className="space-y-3">
                  <div>
                    <label className="mb-1 block text-xs text-[#7b6f66]">Mínimo</label>
                    <input
                      type="number"
                      value={filters.minPrice}
                      onChange={(e) => setFilters({ ...filters, minPrice: Number(e.target.value) })}
                      className="w-full rounded-xl border border-[#473d35]/15 bg-[#f8f4ed] px-3 py-2.5 text-sm outline-none transition focus:border-[#b45f5a] focus:ring-2 focus:ring-[#b45f5a]/10"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-[#7b6f66]">Máximo (opcional)</label>
                    <input
                      type="number"
                      value={filters.maxPrice || ''}
                      onChange={(e) => setFilters({ ...filters, maxPrice: Number(e.target.value) })}
                      min={0}
                      placeholder={`Sem limite (até ${formatPrice(defaultPriceRange.max)})`}
                      className="w-full rounded-xl border border-[#473d35]/15 bg-[#f8f4ed] px-3 py-2.5 text-sm outline-none transition focus:border-[#b45f5a] focus:ring-2 focus:ring-[#b45f5a]/10"
                    />
                  </div>
                </div>
              </div>

              {/* Ordenar */}
              <div>
                <h4 className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-[#6c6058]">Ordenar por</h4>
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                  className="w-full rounded-xl border border-[#473d35]/15 bg-[#f8f4ed] px-3 py-2.5 text-sm outline-none transition focus:border-[#b45f5a] focus:ring-2 focus:ring-[#b45f5a]/10"
                >
                  <option value="name">Nome A-Z</option>
                  <option value="price">Menor preço</option>
                  <option value="price-desc">Maior preço</option>
                </select>
              </div>
            </div>
          </div>

          {/* Lista de produtos */}
          <div className={`flex-1 transition-opacity duration-200 ${loading ? 'opacity-70' : 'opacity-100'}`}>
            {displayedProducts.length === 0 ? (
              <div className="rounded-[1.35rem] border border-[#473d35]/10 bg-[#fffaf3] px-6 py-16 text-center text-[#7b6f66]">Nenhum produto encontrado.</div>
            ) : (
              <ProductGrid products={displayedProducts} compact priorityCount={1} />
            )}

            {/* Paginação */}
            {!searchFromUrl && productsData?.totalPages > 1 && (
              <nav className="mt-12 flex flex-col items-center justify-center gap-3 border-t border-[#473d35]/10 pt-8 sm:flex-row sm:gap-4" aria-label={`Paginação de produtos, página ${activePage} de ${totalPages}`}>
                <button
                  disabled={currentPage === 1 || loading}
                  onClick={() => goToPage(currentPage - 1)}
                  className="inline-flex h-11 min-w-32 items-center justify-center gap-2 rounded-full border border-[#473d35]/15 bg-[#fffaf3] px-4 text-sm font-semibold text-[#5e554e] transition hover:border-[#b45f5a]/30 hover:text-[#9f4e49] disabled:cursor-not-allowed disabled:opacity-45"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </button>
                <div className="flex min-h-11 items-center rounded-full bg-[#eadfd4] px-4 text-sm font-semibold text-[#5e554e] ring-1 ring-[#473d35]/10">
                  Página {productsData.page} de {productsData.totalPages}
                  {loading && (
                    <span className="ml-2 h-2 w-2 animate-pulse rounded-full bg-[#b45f5a]" />
                  )}
                </div>
                <button
                  disabled={currentPage === totalPages || loading}
                  onClick={() => goToPage(currentPage + 1)}
                  className="inline-flex h-11 min-w-32 items-center justify-center gap-2 rounded-full border border-[#473d35]/15 bg-[#fffaf3] px-4 text-sm font-semibold text-[#5e554e] transition hover:border-[#b45f5a]/30 hover:text-[#9f4e49] disabled:cursor-not-allowed disabled:opacity-45"
                >
                  Próxima
                  <ChevronRight className="h-4 w-4" />
                </button>
              </nav>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;
