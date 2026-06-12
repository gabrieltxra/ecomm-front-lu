import React, { useEffect, useMemo } from 'react';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

import ProductGrid from '../components/ProductGrid';
import { useProducts } from '@/services/productsService';

const defaultFilters = {
  category: '',
  minPrice: 0,
  maxPrice: 0,
  sortBy: 'name',
};

const Home: React.FC = () => {
  const { products, fetchProducts, loading } = useProducts();

  useEffect(() => {
    void fetchProducts(defaultFilters, 1);
  }, []);

  const featuredProducts = useMemo(() => products.slice(0, 8), [products]);
  const curatedProducts = useMemo(() => products.slice(8, 12), [products]);

  const categories = useMemo(() => {
    const seen = new Map<string, { name: string; image: string; count: number }>();

    for (const product of products) {
      const categoryName = String(product.category || '').trim();
      if (!categoryName) continue;

      const current = seen.get(categoryName);
      if (current) {
        current.count += 1;
        continue;
      }

      seen.set(categoryName, {
        name: categoryName,
        image: product.image_urls?.[0] || '',
        count: 1,
      });
    }

    return Array.from(seen.values()).slice(0, 6);
  }, [products]);

  const heroImage = featuredProducts[0]?.image_urls?.[0] || categories[0]?.image || '';

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <section className="border-b border-rose-100 bg-gradient-to-b from-rose-50 to-white pt-24 dark:border-slate-800 dark:from-slate-900 dark:to-slate-950">
        <div className="container mx-auto px-4 pb-10 md:pb-14">
          <div className="grid gap-8 overflow-hidden rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-rose-100 md:p-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center dark:bg-slate-900 dark:ring-slate-800">
            <div className="max-w-xl">
              <span className="inline-flex rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-rose-600 dark:bg-rose-500/10 dark:text-rose-300">
                Atelie Lu Cortinas
              </span>
              <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-900 md:text-5xl dark:text-white">
                Escolha cortinas e persianas com foco no seu ambiente.
              </h1>
              <p className="mt-4 max-w-lg text-base leading-7 text-slate-600 dark:text-slate-300">
                Navegue por categorias reais do nosso catalogo e encontre pecas pensadas para controle de luz,
                acabamento e composicao do seu espaco.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/produtos"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-500 px-5 py-3 font-semibold text-white transition hover:bg-rose-600"
                >
                  Ver produtos
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href="#categorias"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  Explorar categorias
                  <ChevronRight className="h-4 w-4" />
                </a>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -left-6 -top-6 h-24 w-24 rounded-full bg-rose-100 blur-2xl dark:bg-rose-500/10" />
              <div className="absolute -bottom-6 -right-6 h-28 w-28 rounded-full bg-amber-100 blur-2xl dark:bg-amber-500/10" />
              <div className="relative overflow-hidden rounded-[1.75rem] bg-slate-100 dark:bg-slate-800">
                {heroImage ? (
                  <img src={heroImage} alt="Colecao de cortinas e persianas" className="h-[320px] w-full object-cover md:h-[420px]" />
                ) : (
                  <div className="flex h-[320px] items-center justify-center text-sm text-slate-500 md:h-[420px] dark:text-slate-400">
                    Em breve, novos destaques visuais por aqui.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="categorias" className="py-10 md:py-14">
        <div className="container mx-auto px-4">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-rose-500">Categorias</p>
              <h2 className="mt-2 text-2xl font-bold text-slate-900 md:text-3xl dark:text-white">Compre por categoria</h2>
            </div>
            <Link to="/produtos" className="text-sm font-semibold text-rose-500 transition hover:text-rose-600">
              Ver catalogo completo
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {categories.map((category) => (
              <Link
                key={category.name}
                to={`/produtos?category=${encodeURIComponent(category.name)}`}
                className="group overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white transition hover:-translate-y-1 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="relative h-44 overflow-hidden bg-slate-100 dark:bg-slate-800">
                  {category.image ? (
                    <img
                      src={category.image}
                      alt={category.name}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-slate-500 dark:text-slate-400">
                      Sem imagem
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between p-5">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{category.name}</h3>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      {category.count} produto{category.count !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-rose-50 text-rose-500 transition group-hover:bg-rose-500 group-hover:text-white dark:bg-rose-500/10 dark:text-rose-300">
                    <ChevronRight className="h-5 w-5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-slate-50 py-4 dark:border-slate-800 dark:bg-slate-900/60">
        <div className="container mx-auto px-4">
          <div className="grid gap-3 text-sm font-medium text-slate-700 md:grid-cols-3 dark:text-slate-200">
            <div className="rounded-xl bg-white px-4 py-3 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
              Sob medida para diferentes ambientes
            </div>
            <div className="rounded-xl bg-white px-4 py-3 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
              Controle de luz e privacidade com acabamento premium
            </div>
            <div className="rounded-xl bg-white px-4 py-3 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
              Atendimento para entrega ou retirada no local
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-rose-500">Destaques</p>
              <h2 className="mt-2 text-2xl font-bold text-slate-900 md:text-3xl dark:text-white">Produtos em destaque</h2>
            </div>
            <Link to="/produtos" className="text-sm font-semibold text-rose-500 transition hover:text-rose-600">
              Ver todos
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="h-80 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />
              ))}
            </div>
          ) : (
            <ProductGrid products={featuredProducts} />
          )}
        </div>
      </section>

      <section className="pb-12 md:pb-16">
        <div className="container mx-auto px-4">
          <div className="mb-6 max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-rose-500">Selecao da loja</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900 md:text-3xl dark:text-white">
              Mais opcoes para compor seu projeto
            </h2>
            <p className="mt-3 text-slate-600 dark:text-slate-300">
              Uma segunda vitrine para facilitar a descoberta de modelos, texturas e categorias que combinam com o seu espaco.
            </p>
          </div>

          <ProductGrid products={curatedProducts.length ? curatedProducts : featuredProducts.slice(0, 4)} />
        </div>
      </section>

      <section className="border-t border-slate-200 bg-slate-50 py-12 dark:border-slate-800 dark:bg-slate-900/50">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-rose-500">Atelie Lu Cortinas</p>
              <h2 className="mt-2 text-2xl font-bold text-slate-900 md:text-3xl dark:text-white">
                Uma home mais proxima do catalogo, sem perder o toque do atelie.
              </h2>
              <p className="mt-4 max-w-2xl text-slate-600 dark:text-slate-300">
                Selecionamos cortinas, persianas e acessorios com foco em uso real, acabamento e estilo. A ideia aqui e facilitar sua descoberta antes de entrar no catalogo completo.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              <div className="rounded-2xl bg-white px-5 py-4 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
                <h3 className="font-semibold text-slate-900 dark:text-white">Curadoria visual</h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Produtos escolhidos para inspirar combinações reais.</p>
              </div>
              <div className="rounded-2xl bg-white px-5 py-4 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
                <h3 className="font-semibold text-slate-900 dark:text-white">Categorias reais</h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">A home mostra apenas categorias presentes no catalogo.</p>
              </div>
              <div className="rounded-2xl bg-white px-5 py-4 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
                <h3 className="font-semibold text-slate-900 dark:text-white">Navegacao mais direta</h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Menos discurso institucional, mais caminho ate o produto.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
