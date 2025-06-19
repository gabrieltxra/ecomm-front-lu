// Serviço para integração com API de produtos
// Este arquivo demonstra como integrar os filtros com dados do banco

import React, { useState } from 'react';
import { Product } from '../contexts/CartContext';

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
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Função para buscar configurações dos filtros
export const getFiltersConfig = async (): Promise<FiltersConfig> => {
  try {
    const response = await fetch(`${API_BASE_URL}/products/filters-config`);
    if (!response.ok) throw new Error('Erro ao buscar configurações dos filtros');
    
    return await response.json();
  } catch (error) {
    console.error('Erro ao buscar configurações dos filtros:', error);
    
    // Fallback com dados mockados
    return {
      categories: [
        { id: 1, name: 'Blackout', count: 2 },
        { id: 2, name: 'Voil', count: 1 },
        { id: 3, name: 'Persianas', count: 1 },
        { id: 4, name: 'Linho', count: 1 },
        { id: 5, name: 'Acessórios', count: 1 },
        { id: 6, name: 'Premium', count: 1 }
      ],
      priceRange: { min: 159.90, max: 349.90 },
      sortOptions: [
        { value: 'name', label: 'Nome A-Z' },
        { value: 'price', label: 'Menor preço' },
        { value: 'price-desc', label: 'Maior preço' },
        { value: 'newest', label: 'Mais recentes' },
        { value: 'popular', label: 'Mais populares' }
      ]
    };
  }
};

// Função para buscar produtos com filtros
export const getProducts = async (filters: FilterState, page: number = 1, limit: number = 12): Promise<ProductsResponse> => {
  try {
    // Construir query string com filtros
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
      ...(filters.availability && { availability: filters.availability })
    });

    const response = await fetch(`${API_BASE_URL}/products?${queryParams}`);
    if (!response.ok) throw new Error('Erro ao buscar produtos');
    
    return await response.json();
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    
    // Fallback com dados mockados
    const { products } = await import('../data/products');
    return {
      products,
      total: products.length,
      page: 1,
      limit: products.length,
      totalPages: 1
    };
  }
};

// Função para buscar produto por ID
export const getProductById = async (id: string | number): Promise<Product | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${id}`);
    if (!response.ok) throw new Error('Produto não encontrado');
    
    return await response.json();
  } catch (error) {
    console.error('Erro ao buscar produto:', error);
    
    // Fallback com dados mockados
    const { products } = await import('../data/products');
    return products.find(p => p.id === Number(id)) || null;
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
    
    // Fallback com dados mockados
    const { products } = await import('../data/products');
    return products
      .filter(p => p.id !== Number(productId) && p.category === category)
      .slice(0, limit);
  }
};

// Hook personalizado para gerenciar produtos (exemplo de uso)
export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filtersConfig, setFiltersConfig] = useState<FiltersConfig | null>(null);

  const fetchProducts = async (filters: FilterState, page: number = 1) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await getProducts(filters, page);
      setProducts(response.products);
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
    products,
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