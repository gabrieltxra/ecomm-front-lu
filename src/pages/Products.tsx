import React, { useState, useMemo, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import { Filter, X } from 'lucide-react';
import { useProducts } from '@/services/productsService';

// Interfaces para integração com banco de dados
interface Category {
  id: string | number;
  name: string;
  slug?: string;
  count?: number; // Quantidade de produtos na categoria
}

interface PriceRange {
  min: number;
  max: number;
}

interface SortOption {
  value: string;
  label: string;
}

interface FilterState {
  category: string;
  minPrice: number;
  maxPrice: number;
  sortBy: string;
  // Campos adicionais para futuras expansões
  brand?: string;
  color?: string;
  material?: string;
  availability?: 'in_stock' | 'out_of_stock' | 'all';
}

interface ProductsPageProps {
  // Props para integração futura com API
  categories?: Category[];
  priceRange?: PriceRange;
  sortOptions?: SortOption[];
  loading?: boolean;
  onFiltersChange?: (filters: FilterState) => void;
}

const Products: React.FC<ProductsPageProps> = ({
  categories = [],
  priceRange,
  sortOptions = [],
  onFiltersChange
}) => {

  const [showFilters, setShowFilters] = useState(false);
  const { products, loading, fetchProducts, fetchFiltersConfig } = useProducts();
  const [filters, setFilters] = useState<FilterState>({
    category: '',
    minPrice: 0,
    maxPrice: 0,
    sortBy: 'name',
    // brand, color, material, availability can be added here if needed
  });

  useEffect(() => {
  if (products.length > 0 && filters.maxPrice === 0) {
    const prices = products.map(p => Number(p.price));
    const min = Math.min(...prices);
    const max = Math.max(...prices);

    setFilters(prev => ({
      ...prev,
      minPrice: min,
      maxPrice: max,
    }));
  }
}, [products]);


  useEffect(() => {
    fetchFiltersConfig();
  }, []);

  useEffect(() => {
    fetchProducts(filters);
  }, [filters]);

  // Categorias padrão (fallback para dados mockados)
 const defaultCategories: Category[] = useMemo(() => {
    if (categories.length > 0) return categories;

    if (!products || products.length === 0) return [];

    const uniqueCategories = [...new Set(products.map(product => product.category))];
    return uniqueCategories.map((cat, index) => ({
      id: index + 1,
      name: cat,
      count: products.filter(p => p.category === cat).length
    }));
  }, [categories, products]); 


  // Opções de ordenação padrão
  const defaultSortOptions: SortOption[] = useMemo(() => {
    if (sortOptions.length > 0) return sortOptions;
    
    return [
      { value: 'name', label: 'Nome A-Z' },
      { value: 'price', label: 'Menor preço' },
      { value: 'price-desc', label: 'Maior preço' },
      { value: 'newest', label: 'Mais recentes' },
      { value: 'popular', label: 'Mais populares' }
    ];
  }, [sortOptions]);

  // Faixa de preço padrão
  const defaultPriceRange: PriceRange = useMemo(() => {
    if (priceRange) return priceRange;
    
    const prices = products.map(p => Number(p.price));
    return {
      min: prices.length > 0 ? Math.min(...prices) : 0,
      max: prices.length > 0 ? Math.max(...prices) : 10000
    };
  }, [priceRange]);

  // Filtrar e ordenar produtos
  const filteredProducts = useMemo(() => {
    let filtered = products.filter(product => {
      const matchesCategory = !filters.category || product.category === filters.category;
      const matchesPrice = product.price >= filters.minPrice && product.price <= filters.maxPrice;
      
      // Filtros adicionais para futuras expansões
      const matchesBrand = !filters.brand || product.category === filters.brand; // Placeholder
      const matchesColor = !filters.color || true; // Placeholder
      const matchesMaterial = !filters.material || true; // Placeholder
      
      return matchesCategory && matchesPrice && matchesBrand && matchesColor && matchesMaterial;
    });

    // Ordenar produtos
    switch (filters.sortBy) {
      case 'price':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'name':
      default:
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    return filtered;
  }, [filters]);

  // Notificar mudanças nos filtros (para integração com API)
  useEffect(() => {
    if (onFiltersChange) {
      onFiltersChange(filters);
    }
  }, [filters, onFiltersChange]);

  const clearFilters = () => {
    const resetFilters = {
      category: '',
      minPrice: defaultPriceRange.min,
      maxPrice: defaultPriceRange.max,
      sortBy: 'name'
    };
    setFilters(resetFilters);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen pt-20 bg-white">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-gray-200 rounded-lg h-80"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-black mb-2">Nossos Produtos</h1>
          <p className="text-gray-600">
            {filteredProducts.length} produto{filteredProducts.length !== 1 ? 's' : ''} encontrado{filteredProducts.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filtros Laterais */}
          <div className="lg:w-64">
            {/* Botão para mobile */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden w-full bg-rose-400 text-white py-3 px-4 rounded-lg flex items-center justify-center gap-2 mb-4"
            >
              <Filter className="w-5 h-5" />
              Filtros
              {showFilters && <X className="w-5 h-5" />}
            </button>

            {/* Filtros Desktop */}
            <div className={`lg:block ${showFilters ? 'block' : 'hidden'} bg-white border border-gray-200 rounded-lg p-6 sticky top-24`}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-black">Filtros</h3>
                <button
                  onClick={clearFilters}
                  className="text-rose-400 hover:text-rose-500 text-sm font-medium"
                >
                  Limpar
                </button>
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
                        onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                        className="mr-2 text-rose-400"
                      />
                      <span className="text-gray-700">Todas</span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {products.length}
                    </span>
                  </label>
                  {defaultCategories.map((category) => (
                    <label key={category.id} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <input
                          type="radio"
                          name="category"
                          value={category.name}
                          checked={filters.category === category.name}
                          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                          className="mr-2 text-rose-400"
                        />
                        <span className="text-gray-700">{category.name}</span>
                      </div>
                      {category.count && (
                        <span className="text-xs text-gray-500">
                          {category.count}
                        </span>
                      )}
                    </label>
                  ))}
                </div>
              </div>

              {/* Faixa de Preço */}
              <div className="mb-6">
                <h4 className="font-medium text-black mb-3">Faixa de Preço</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Preço mínimo</label>
                    <input
                      type="number"
                      value={filters.minPrice}
                      onChange={(e) => setFilters({ ...filters, minPrice: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-400 focus:border-transparent"
                      placeholder={defaultPriceRange.min.toString()}
                      min={defaultPriceRange.min}
                      max={defaultPriceRange.max}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Preço máximo</label>
                    <input
                      type="number"
                      value={filters.maxPrice}
                      onChange={(e) => setFilters({ ...filters, maxPrice: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-400 focus:border-transparent"
                      placeholder={defaultPriceRange.max.toString()}
                      min={defaultPriceRange.min}
                      max={defaultPriceRange.max}
                    />
                  </div>
                </div>
              </div>

              {/* Ordenação */}
              <div>
                <h4 className="font-medium text-black mb-3">Ordenar por</h4>
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-400 focus:border-transparent"
                >
                  {defaultSortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filtros adicionais para futuras expansões */}
              {/* 
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-medium text-black mb-3">Marca</h4>
                <select
                  value={filters.brand || ''}
                  onChange={(e) => setFilters({ ...filters, brand: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-400 focus:border-transparent"
                >
                  <option value="">Todas as marcas</option>
                  {/* Aqui virão as marcas do banco de dados */}
                {/* </select>
              </div>
              */}
            </div>
          </div>

          {/* Grid de Produtos */}
          <div className="flex-1">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Filter className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-xl font-semibold text-black mb-2">Nenhum produto encontrado</h3>
                <p className="text-gray-600 mb-4">
                  Tente ajustar os filtros para encontrar o que procura.
                </p>
                <button
                  onClick={clearFilters}
                  className="bg-rose-400 hover:bg-rose-500 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Limpar Filtros
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products; 