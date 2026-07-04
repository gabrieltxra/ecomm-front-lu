import { useCallback, useEffect, useRef, useState } from 'react';

import { Product } from '@/types/Product';

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

const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:3000/api';

const EMPTY_FILTERS_CONFIG: FiltersConfig = {
  categories: [],
  priceRange: { min: 0, max: 10000 },
  sortOptions: [],
};

const isAbortError = (error: unknown) => error instanceof DOMException && error.name === 'AbortError';

export const getFiltersConfig = async (signal?: AbortSignal): Promise<FiltersConfig> => {
  try {
    const response = await fetch(`${API_BASE_URL}/products/filters-config`, { signal });
    if (!response.ok) throw new Error('Erro ao buscar configuracoes dos filtros');

    return await response.json();
  } catch (error) {
    if (isAbortError(error)) throw error;

    console.error('Erro ao buscar configuracoes dos filtros:', error);
    return EMPTY_FILTERS_CONFIG;
  }
};

export const getProducts = async (
  filters: FilterState,
  page: number = 1,
  limit: number = 12,
  signal?: AbortSignal
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

    const response = await fetch(`${API_BASE_URL}/products?${queryParams}`, { signal });
    if (!response.ok) throw new Error('Erro ao buscar produtos');

    const data = await response.json();
    const products: Product[] = data.products.map((product: Product) => ({
      ...product,
      price: Number(product.price),
    }));

    return {
      products,
      total: data.total,
      page: data.page,
      limit: data.limit,
      totalPages: data.totalPages,
    };
  } catch (error) {
    if (isAbortError(error)) throw error;

    console.error('Erro ao buscar produtos:', error);
    throw error;
  }
};

export const getProductById = async (id: string | number): Promise<Product | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/product/${id}`);
    if (!response.ok) throw new Error('Produto nao encontrado');

    return await response.json();
  } catch (error) {
    console.error('Erro ao buscar produto:', error);
    return null;
  }
};

export const getRelatedProducts = async (
  productId: string | number,
  _category: string,
  limit: number = 4
): Promise<Product[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${productId}/related?limit=${limit}`);
    if (!response.ok) throw new Error('Erro ao buscar produtos relacionados');

    return await response.json();
  } catch (error) {
    console.error('Erro ao buscar produtos relacionados:', error);
    return [];
  }
};

export const useProducts = () => {
  const [productsData, setProductsData] = useState<ProductsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filtersConfig, setFiltersConfig] = useState<FiltersConfig | null>(null);
  const productsRequestId = useRef(0);
  const productsAbortRef = useRef<AbortController | null>(null);
  const filtersAbortRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      productsAbortRef.current?.abort();
      filtersAbortRef.current?.abort();
    };
  }, []);

  const fetchProducts = useCallback(async (filters: FilterState, page: number = 1, limit: number = 12) => {
    const requestId = productsRequestId.current + 1;
    productsRequestId.current = requestId;
    productsAbortRef.current?.abort();

    const controller = new AbortController();
    productsAbortRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const response = await getProducts(filters, page, limit, controller.signal);

      if (mountedRef.current && productsRequestId.current === requestId) {
        setProductsData(response);
      }
    } catch (err) {
      if (isAbortError(err)) return;

      if (mountedRef.current && productsRequestId.current === requestId) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      }
    } finally {
      if (mountedRef.current && productsRequestId.current === requestId) {
        setLoading(false);
      }
    }
  }, []);

  const fetchFiltersConfig = useCallback(async () => {
    filtersAbortRef.current?.abort();

    const controller = new AbortController();
    filtersAbortRef.current = controller;

    try {
      const config = await getFiltersConfig(controller.signal);
      if (mountedRef.current) setFiltersConfig(config);
    } catch (err) {
      if (isAbortError(err)) return;
      console.error('Erro ao buscar configuracoes dos filtros:', err);
    }
  }, []);

  return {
    products: productsData?.products || [],
    productsData,
    loading,
    error,
    filtersConfig,
    fetchProducts,
    fetchFiltersConfig,
  };
};
