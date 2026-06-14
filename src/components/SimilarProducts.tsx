import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import ProductGrid from '@/components/ProductGrid';
import { getProducts } from '@/services/productsService';
import { Product } from '@/types/Product';

interface SimilarProductsProps {
  currentProduct: Product;
  maxProducts?: number;
}

const SimilarProducts: React.FC<SimilarProductsProps> = ({
  currentProduct,
  maxProducts = 4,
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadProducts = async () => {
      setLoading(true);

      try {
        const sameCategoryResponse = await getProducts(
          {
            category: currentProduct.category,
            minPrice: 0,
            maxPrice: 0,
            sortBy: 'name',
            availability: 'all',
          },
          1,
          maxProducts + 1
        );

        let nextProducts = (sameCategoryResponse?.products || []).filter(
          (product) => String(product.id) !== String(currentProduct.id)
        );

        if (nextProducts.length < maxProducts) {
          const fallbackResponse = await getProducts(
            {
              category: '',
              minPrice: 0,
              maxPrice: 0,
              sortBy: 'name',
              availability: 'all',
            },
            1,
            maxProducts + 4
          );

          const fallbackProducts = (fallbackResponse?.products || []).filter(
            (product) =>
              String(product.id) !== String(currentProduct.id) &&
              !nextProducts.some((item) => String(item.id) === String(product.id))
          );

          nextProducts = [...nextProducts, ...fallbackProducts];
        }

        if (active) {
          setProducts(nextProducts.slice(0, maxProducts));
        }
      } catch (error) {
        console.error('Erro ao buscar produtos similares:', error);
        if (active) setProducts([]);
      } finally {
        if (active) setLoading(false);
      }
    };

    void loadProducts();

    return () => {
      active = false;
    };
  }, [currentProduct.category, currentProduct.id, maxProducts]);

  if (!loading && products.length === 0) return null;

  return (
    <section className="border-t border-slate-200 bg-slate-50 py-10 dark:border-slate-800 dark:bg-slate-900/60">
      <div className="container mx-auto px-4">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-3xl font-bold">Produtos similares</h2>
            <p className="mt-2 text-lg text-slate-600 dark:text-slate-300">
              Outros produtos do catalogo que podem combinar com sua escolha.
            </p>
          </div>
          <Link to="/produtos" className="text-lg font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-300">
            Ver todos os produtos
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(maxProducts)].map((_, index) => (
              <div key={index} className="h-80 animate-pulse rounded-lg bg-white dark:bg-slate-800" />
            ))}
          </div>
        ) : (
          <ProductGrid products={products} />
        )}
      </div>
    </section>
  );
};

export default SimilarProducts;
