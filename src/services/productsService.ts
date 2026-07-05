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
const PRODUCTS_CACHE_TTL_MS = 60_000;
const FILTERS_CACHE_TTL_MS = 5 * 60_000;

type ClientCacheEntry<T> = {
  expiresAt: number;
  value: T;
};

const productsCache = new Map<string, ClientCacheEntry<ProductsResponse>>();
const productByIdCache = new Map<string, ClientCacheEntry<Product>>();
let filtersConfigCache: ClientCacheEntry<FiltersConfig> | null = null;

function getClientCache<T>(cache: Map<string, ClientCacheEntry<T>>, key: string) {
  const entry = cache.get(key);
  if (!entry) return null;

  if (entry.expiresAt <= Date.now()) {
    cache.delete(key);
    return null;
  }

  cache.delete(key);
  cache.set(key, entry);
  return entry.value;
}

function setClientCache<T>(cache: Map<string, ClientCacheEntry<T>>, key: string, value: T, ttlMs: number) {
  cache.set(key, {
    value,
    expiresAt: Date.now() + ttlMs,
  });

  if (cache.size <= 30) return;

  const oldestKey = cache.keys().next().value;
  if (oldestKey) cache.delete(oldestKey);
}

export const getFiltersConfig = async (signal?: AbortSignal): Promise<FiltersConfig> => {
  if (filtersConfigCache && filtersConfigCache.expiresAt > Date.now()) {
    return filtersConfigCache.value;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/products/filters-config`, { signal });
    if (!response.ok) throw new Error('Erro ao buscar configuracoes dos filtros');

    const config = await response.json();
    filtersConfigCache = {
      value: config,
      expiresAt: Date.now() + FILTERS_CACHE_TTL_MS,
    };

    return config;
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

    const requestUrl = `${API_BASE_URL}/products?${queryParams}`;
    const cached = getClientCache(productsCache, requestUrl);
    if (cached) return cached;

    const response = await fetch(requestUrl, { signal });
    if (!response.ok) throw new Error('Erro ao buscar produtos');

    const data = await response.json();
    const products: Product[] = data.products.map((product: Product) => ({
      ...product,
      price: Number(product.price),
    }));

    const result = {
      products,
      total: data.total,
      page: data.page,
      limit: data.limit,
      totalPages: data.totalPages,
    };

    setClientCache(productsCache, requestUrl, result, PRODUCTS_CACHE_TTL_MS);

    return result;
  } catch (error) {
    if (isAbortError(error)) throw error;

    console.error('Erro ao buscar produtos:', error);
    throw error;
  }
};

export const getProductById = async (id: string | number): Promise<Product | null> => {
  const cacheKey = String(id);
  const cached = getClientCache(productByIdCache, cacheKey);
  if (cached) return cached;

  try {
    const response = await fetch(`${API_BASE_URL}/product/${id}`);
    if (!response.ok) throw new Error('Produto nao encontrado');

    const product = await response.json();
    setClientCache(productByIdCache, cacheKey, product, PRODUCTS_CACHE_TTL_MS);

    return product;
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
