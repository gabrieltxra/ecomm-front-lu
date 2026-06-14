import React, { useState, useMemo, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import { Filter, Search, X } from 'lucide-react';
import { useProducts } from '@/services/productsService';
import { useSearchParams } from 'react-router-dom';

const Products: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const { productsData, loading, fetchProducts, fetchFiltersConfig, filtersConfig } = useProducts();
  const categoryFromUrl = searchParams.get('category') || '';
  const searchFromUrl = searchParams.get('search') || '';

  const [filters, setFilters] = useState({
    category: categoryFromUrl,
    minPrice: 0,
    maxPrice: 0,
    sortBy: 'name',
  });

  useEffect(() => {
    fetchFiltersConfig();
  }, []);

  useEffect(() => {
    fetchProducts(filters, searchFromUrl ? 1 : currentPage, searchFromUrl ? 200 : 12);
  }, [filters, currentPage, searchFromUrl]);

  useEffect(() => {
    setFilters((prev) => {
      if (prev.category === categoryFromUrl) return prev;
      return { ...prev, category: categoryFromUrl };
    });
    setCurrentPage(1);
  }, [categoryFromUrl]);

  const defaultPriceRange = useMemo(() => {
    if (!productsData || productsData.products.length === 0) return { min: 0, max: 10000 };
    const prices = productsData?.products?.map(p => Number(p.price));
    return {
      min: Math.min(...prices),
      max: Math.max(...prices)
    };
  }, [productsData]);

  useEffect(() => {
    if (productsData && productsData.products.length > 0 && filters.maxPrice === 0) {
      const prices = productsData?.products?.map(p => Number(p.price));
      const min = Math.min(...prices);
      const max = Math.max(...prices);

      setFilters(prev => ({
        ...prev,
        minPrice: min,
        maxPrice: max,
      }));
    }
  }, [productsData]);

  const clearFilters = () => {
    setSearchParams({});
    setFilters({
      category: '',
      minPrice: defaultPriceRange.min,
      maxPrice: defaultPriceRange.max,
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
    if (!productsData) return [];
    const unique = [...new Set(productsData?.products?.map(p => p.category))];
    return unique.map((cat, i) => ({
      id: i + 1,
      name: cat,
      count: productsData.products.filter(p => p.category === cat).length
    }));
  }, [productsData]);

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

  if (loading) {
    return (
      <div className="min-h-screen pt-20 bg-white">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-80"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-black mb-2">Nossos Produtos</h1>
          <p className="text-gray-600">
            {displayedProducts.length} produto{displayedProducts.length !== 1 ? 's' : ''} encontrado{displayedProducts.length !== 1 ? 's' : ''}
          </p>
          {searchFromUrl && (
            <p className="mt-2 inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1 text-sm text-rose-600">
              <Search className="h-4 w-4" />
              Busca: {searchFromUrl}
            </p>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filtros */}
          <div className="lg:w-64">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden w-full bg-rose-400 text-white py-3 px-4 rounded-lg flex items-center justify-center gap-2 mb-4"
            >
              <Filter className="w-5 h-5" />
              Filtros
              {showFilters && <X className="w-5 h-5" />}
            </button>

            <div className={`lg:block ${showFilters ? 'block' : 'hidden'} bg-white border border-gray-200 rounded-lg p-6 sticky top-24`}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-black">Filtros</h3>
                <button onClick={clearFilters} className="text-rose-400 hover:text-rose-500 text-sm font-medium">Limpar</button>
              </div>

              {/* Categoria */}
              <div className="mb-6">
                <h4 className="font-medium text-black mb-3">Categoria</h4>
                <div className="space-y-2">
                  <label className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="category"
                        value=""
                        checked={filters.category === ''}
                        onChange={(e) => handleCategoryChange(e.target.value)}
                        className="mr-2 text-rose-400"
                      />
                      <span className="text-gray-700">Todas</span>
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
                          className="mr-2 text-rose-400"
                        />
                        <span className="text-gray-700">{cat.name}</span>
                      </div>
                      <span className="text-xs text-gray-500">{cat.count}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Preço */}
              <div className="mb-6">
                <h4 className="font-medium text-black mb-3">Faixa de Preço</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Mínimo</label>
                    <input
                      type="number"
                      value={filters.minPrice}
                      onChange={(e) => setFilters({ ...filters, minPrice: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Máximo</label>
                    <input
                      type="number"
                      value={filters.maxPrice}
                      onChange={(e) => setFilters({ ...filters, maxPrice: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
              </div>

              {/* Ordenar */}
              <div>
                <h4 className="font-medium text-black mb-3">Ordenar por</h4>
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="name">Nome A-Z</option>
                  <option value="price">Menor preço</option>
                  <option value="price-desc">Maior preço</option>
                </select>
              </div>
            </div>
          </div>

          {/* Lista de produtos */}
          <div className="flex-1">
            {displayedProducts.length === 0 ? (
              <p className="text-gray-500">Nenhum produto encontrado.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {displayedProducts.map(product => (
                  <ProductCard key={product.id} product={product} compact />
                ))}
              </div>
            )}

            {/* Paginação */}
            {!searchFromUrl && productsData?.totalPages > 1 && (
              <div className="flex justify-center mt-10 gap-4">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                  className="px-4 py-2 border rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                >
                  Anterior
                </button>
                <span className="text-gray-700 font-medium">
                  Página {productsData.page} de {productsData.totalPages}
                </span>
                <button
                  disabled={currentPage === productsData.totalPages}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  className="px-4 py-2 border rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                >
                  Próxima
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;
