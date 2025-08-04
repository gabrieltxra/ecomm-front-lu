// Serviço para integração com API de produtos
// Este arquivo demonstra como integrar os filtros com dados do banco

import { Product } from '@/types/Product';
import { useState } from 'react';

// Interfaces para API
export interface Category {
  id: string | number;
  name: string;
  slug?: string;
  count?: number;
}

export interface PriceRange {
  min: number;
  max: number;
}

export interface SortOption {
  value: string;
  label: string;
}

export interface FilterState {
  category: string;
  minPrice: number;
  maxPrice: number;
  sortBy: string;
  brand?: string;
  color?: string;
  material?: string;
  availability?: 'in_stock' | 'out_of_stock' | 'all';
}

export interface ProductsResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface FiltersConfig {
  categories: Category[];
  priceRange: PriceRange;
  sortOptions: SortOption[];
  brands?: string[];
  colors?: string[];
  materials?: string[];
}

// Configuração da API
const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:3000/api';

// Função para buscar configurações dos filtros
export const getFiltersConfig = async (): Promise<FiltersConfig> => {
  try {
    const response = await fetch(`${API_BASE_URL}/products/filters-config`);
    if (!response.ok) throw new Error('Erro ao buscar configurações dos filtros');
    
    return await response.json();
  } catch (error) {
    console.error('Erro ao buscar configurações dos filtros:', error);
  }
};

// Função para buscar produtos com filtros
export const getProducts = async (
  filters: FilterState,
  page: number = 1,
  limit: number = 12
): Promise<ProductsResponse> => {
  try {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(filters.category && { category: filters.category }),
      ...(filters.minPrice && { minPrice: filters.minPrice.toString() }),
      ...(filters.maxPrice && { maxPrice: filters.maxPrice.toString() }),
      ...(filters.sortBy && { sortBy: filters.sortBy }),
      ...(filters.brand && { brand: filters.brand }),
      ...(filters.color && { color: filters.color }),
      ...(filters.material && { material: filters.material }),
      ...(filters.availability && { availability: filters.availability }),
    });

    const response = await fetch(`${API_BASE_URL}/products?${queryParams}`);
    if (!response.ok) throw new Error('Erro ao buscar produtos');

    const data = await response.json();


    const products: Product[] = data.products.map((p: any) => ({
      ...p,
      price: Number(p.price)
    }));


    return {
      products,
      total: data.total,
      page: data.page,
      limit: data.limit,
      totalPages: data.totalPages,
    };
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
};}


// Função para buscar produto por ID
export const getProductById = async (id: string | number): Promise<Product | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/product/${id}`);
    if (!response.ok) throw new Error('Produto não encontrado');
    
    return await response.json();
  } catch (error) {
    console.error('Erro ao buscar produto:', error);
  }
};

// Função para buscar produtos relacionados
export const getRelatedProducts = async (productId: string | number, category: string, limit: number = 4): Promise<Product[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${productId}/related?limit=${limit}`);
    if (!response.ok) throw new Error('Erro ao buscar produtos relacionados');
    
    return await response.json();
  } catch (error) {
    console.error('Erro ao buscar produtos relacionados:', error);
};
  return [];
}

// Hook personalizado para gerenciar produtos (exemplo de uso)
export const useProducts = () => {
  const [productsData, setProductsData] = useState<ProductsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filtersConfig, setFiltersConfig] = useState<FiltersConfig | null>(null);

  const fetchProducts = async (filters: FilterState, page: number = 1) => {
    setLoading(true);
    setError(null);

    try {
      const response = await getProducts(filters, page);
      setProductsData(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const fetchFiltersConfig = async () => {
    try {
      const config = await getFiltersConfig();
      setFiltersConfig(config);
    } catch (err) {
      console.error('Erro ao buscar configurações dos filtros:', err);
    }
  };

  return {
    products: productsData?.products || [],
    productsData,
    loading,
    error,
    filtersConfig,
    fetchProducts,
    fetchFiltersConfig
  };
};

// Exemplo de como usar no componente Products:
/*
import { useProducts } from '../services/productsService';

const Products = () => {
  const { products, loading, error, filtersConfig, fetchProducts, fetchFiltersConfig } = useProducts();
  const [filters, setFilters] = useState<FilterState>({...});

  useEffect(() => {
    fetchFiltersConfig();
  }, []);

  useEffect(() => {
    fetchProducts(filters);
  }, [filters]);

  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  return (
    <Products
      categories={filtersConfig?.categories}
      priceRange={filtersConfig?.priceRange}
      sortOptions={filtersConfig?.sortOptions}
      loading={loading}
      onFiltersChange={handleFiltersChange}
    />
  );
};
*/ 