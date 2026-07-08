import React, { useEffect, useMemo } from 'react';
import { ArrowRight, ChevronRight, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

import CachedImage from '@/components/CachedImage';
import ProductGrid from '../components/ProductGrid';
import { useProducts } from '@/services/productsService';
import { fallbackToOriginalImage, getOptimizedImageUrl } from '@/lib/productImages';

const defaultFilters = {
  category: '',
  minPrice: 0,
  maxPrice: 0,
  sortBy: 'name',
};

const Home: React.FC = () => {
  const { products, fetchProducts, fetchFiltersConfig, filtersConfig, loading } = useProducts();

  useEffect(() => {
    void fetchProducts(defaultFilters, 1, 24);
    void fetchFiltersConfig();
  }, [fetchFiltersConfig, fetchProducts]);

  const featuredProducts = useMemo(() => products.slice(0, 8), [products]);

  const categories = useMemo(() => {
    const seen = new Map<string, { name: string; image: string; productIds: Set<string> }>();

    for (const product of products) {
      const categoryName = String(product.category || '').trim();
      if (!categoryName) continue;

      const current = seen.get(categoryName);
      if (current) {
        current.productIds.add(String(product.id));
        continue;
      }

      seen.set(categoryName, {
        name: categoryName,
        image: product.image_urls?.[0] || '',
        productIds: new Set([String(product.id)]),
      });
    }

    const imageByCategory = new Map(
      Array.from(seen.values()).map((category) => [category.name, category.image])
    );
    const sourceCategories = filtersConfig?.categories?.length
      ? filtersConfig.categories
      : Array.from(seen.values()).map((category) => ({
          name: category.name,
          count: category.productIds.size,
        }));

    return sourceCategories.slice(0, 4).map((category) => ({
      name: category.name,
      image: imageByCategory.get(category.name) || '',
      count: category.count || 0,
    }));
  }, [filtersConfig, products]);

  const heroImage = featuredProducts[0]?.image_urls?.[0] || categories[0]?.image || '';

  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-white">
      <section className="border-b border-rose-100 bg-rose-50/70 pt-20 md:pt-24 dark:border-slate-800 dark:bg-slate-900">
        <div className="container mx-auto grid gap-6 px-4 pb-8 md:gap-8 md:pb-14 lg:grid-cols-[1fr_0.9fr] lg:items-center">
          <div className="max-w-2xl">
            <p className="text-lg font-semibold text-rose-600 dark:text-rose-300">Atelie Lu Cortinas</p>
            <h1 className="mt-3 text-4xl font-bold leading-tight md:text-5xl">
              Cortinas, persianas e almofadas para deixar sua casa mais bonita.
            </h1>
            <p className="mt-5 max-w-xl text-xl leading-8 text-slate-700 dark:text-slate-200">
              Veja os produtos com calma, escolha o que gostou e compre em poucos passos. Se precisar de ajuda,
              fale conosco pelo WhatsApp.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/produtos"
                className="inline-flex min-h-14 items-center justify-center gap-2 rounded-lg bg-rose-500 px-6 text-lg font-semibold text-white shadow-sm transition hover:bg-rose-600"
              >
                Ver produtos
                <ArrowRight className="h-5 w-5" />
              </Link>
              <a
                href="https://wa.me/5519991893513"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-14 items-center justify-center gap-2 rounded-lg border border-rose-200 bg-white px-6 text-lg font-semibold text-rose-600 shadow-sm transition hover:bg-rose-50 dark:border-slate-700 dark:bg-slate-900 dark:text-rose-300 dark:hover:bg-slate-800"
              >
                Pedir ajuda
                <Phone className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-rose-100 dark:bg-slate-900 dark:ring-slate-800">
            {heroImage ? (
              <CachedImage
                src={getOptimizedImageUrl(heroImage, { width: 960, quality: 76 })}
                fallbackSrc={heroImage}
                alt="Produto do Atelie Lu Cortinas"
                fetchPriority="high"
                decoding="async"
                onError={(event) => fallbackToOriginalImage(event, heroImage)}
                className="h-[210px] w-full object-cover sm:h-[260px] md:h-[420px]"
              />
            ) : (
              <div className="flex h-[210px] items-center justify-center px-6 text-center text-slate-500 sm:h-[260px] md:h-[420px] dark:text-slate-400">
                Em breve, novos produtos em destaque.
              </div>
            )}
          </div>
        </div>
      </section>

      {categories.length > 0 && (
        <section id="categorias" className="border-y border-slate-200 bg-slate-50 py-10 dark:border-slate-800 dark:bg-slate-900/60">
          <div className="container mx-auto px-4">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-3xl font-bold">Escolha por categoria</h2>
                <p className="mt-2 text-lg text-slate-600 dark:text-slate-300">
                  Comece pelo tipo de produto que voce procura.
                </p>
              </div>
              <Link to="/produtos" className="text-lg font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-300">
                Ver tudo
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {categories.map((category) => (
                <Link
                  key={category.name}
                  to={`/produtos?category=${encodeURIComponent(category.name)}`}
                  className="group overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="h-40 bg-slate-100 dark:bg-slate-800">
                    {category.image ? (
                      <CachedImage
                        src={getOptimizedImageUrl(category.image, { width: 480, quality: 72 })}
                        fallbackSrc={category.image}
                        alt={category.name}
                        loading="lazy"
                        decoding="async"
                        onError={(event) => fallbackToOriginalImage(event, category.image)}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-slate-500 dark:text-slate-400">
                        Sem imagem
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between p-4">
                    <div>
                      <h3 className="text-xl font-semibold">{category.name}</h3>
                      <p className="mt-1 text-base text-slate-500 dark:text-slate-400">
                        {category.count} produto{category.count !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <ChevronRight className="h-6 w-6 text-rose-500" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-10 md:py-14">
        <div className="container mx-auto px-4">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-3xl font-bold">Produtos em destaque</h2>
              <p className="mt-2 text-lg text-slate-600 dark:text-slate-300">
                Alguns produtos para voce conhecer primeiro.
              </p>
            </div>
            <Link to="/produtos" className="text-lg font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-300">
              Ver todos os produtos
            </Link>
          </div>

          {loading && featuredProducts.length === 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="h-[360px] animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
              ))}
            </div>
          ) : (
            <ProductGrid products={featuredProducts} />
          )}
        </div>
      </section>

      <section className="border-t border-slate-200 bg-rose-50 py-10 dark:border-slate-800 dark:bg-slate-900">
        <div className="container mx-auto flex flex-col gap-5 px-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-3xl font-bold">Ficou com duvida?</h2>
            <p className="mt-2 text-lg text-slate-700 dark:text-slate-200">
              A gente ajuda voce a escolher o melhor produto.
            </p>
          </div>
          <a
            href="https://wa.me/5519991893513"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-14 items-center justify-center gap-2 rounded-lg bg-rose-500 px-6 text-lg font-semibold text-white shadow-sm transition hover:bg-rose-600"
          >
            Chamar no WhatsApp
            <Phone className="h-5 w-5" />
          </a>
        </div>
      </section>
    </div>
  );
};

export default Home;
