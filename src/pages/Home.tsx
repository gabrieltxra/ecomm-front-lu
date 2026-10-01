import React, { useEffect, useMemo } from 'react';
import { ArrowRight, ArrowUpRight, Heart, MessageCircle, ShieldCheck, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

import CachedImage from '@/components/CachedImage';
import Head from '@/components/ui/Head';
import ProductGrid from '../components/ProductGrid';
import { useProducts } from '@/services/productsService';
import { getOptimizedImageUrl, getProductImageSrcSet } from '@/lib/productImages';

const defaultFilters = {
  category: '',
  minPrice: 0,
  maxPrice: 0,
  sortBy: 'name',
};

const storeBenefits = [
  { icon: Heart, title: 'Feito com afeto', text: 'Escolhas cuidadosas, com o jeitinho do ateliê' },
  { icon: Sparkles, title: 'Curadoria criativa', text: 'Peças e materiais escolhidos com intenção' },
  { icon: ShieldCheck, title: 'Compra tranquila', text: 'Atendimento próximo em cada etapa' },
];

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

    const imageByCategory = new Map(Array.from(seen.values()).map((category) => [category.name, category.image]));
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

  return (
    <div className="min-h-screen bg-[#f8f4ed] pt-20 text-[#302b27]">
      <Head title="Ateliê Lu | Peças e materiais escolhidos com afeto" />
      <section className="relative overflow-hidden border-b border-[#473d35]/10">
        <div className="pointer-events-none absolute -left-32 top-12 h-72 w-72 rounded-full bg-[#e7c8b5]/25 blur-3xl" />
        <div className="mx-auto grid max-w-[1380px] gap-10 px-5 py-12 sm:px-8 md:py-16 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:px-12 lg:py-20">
          <div className="relative z-10 max-w-2xl">
            <div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.28em] text-[#a64f4a]">
              <span className="h-px w-9 bg-[#a64f4a]" />
              A loja do Ateliê Lu
            </div>
            <h1 className="mt-6 font-elegant text-[clamp(3rem,5.8vw,6.25rem)] font-medium leading-[0.94] tracking-[-0.04em]">
              Coisas bonitas para criar com{' '}
              <span className="font-script font-normal italic text-[#b45f5a]">afeto.</span>
            </h1>
            <p className="mt-7 max-w-xl text-base leading-7 text-[#6c6058] sm:text-lg sm:leading-8">
              Uma curadoria de peças, materiais e achados especiais para inspirar ideias e dar vida a novos projetos.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/produtos"
                className="group inline-flex min-h-14 items-center justify-center gap-3 rounded-full bg-[#b45f5a] px-7 text-sm font-bold text-white shadow-[0_14px_34px_rgba(117,58,53,0.2)] transition hover:-translate-y-0.5 hover:bg-[#9f4e49]"
              >
                Explorar a coleção
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <a
                href="https://wa.me/5519991893513"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-14 items-center justify-center gap-3 rounded-full border border-[#514841]/20 bg-[#fffaf3]/60 px-7 text-sm font-bold text-[#4d443e] transition hover:-translate-y-0.5 hover:bg-[#fffaf3]"
              >
                <MessageCircle className="h-4 w-4" />
                Preciso de ajuda
              </a>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[720px] lg:ml-auto" aria-label="Composição criativa do Ateliê Lu">
            <div className="relative aspect-[5/4] overflow-hidden rounded-t-[11rem] bg-[#d7a59a] shadow-[0_30px_70px_rgba(58,45,37,0.18)] sm:rounded-t-[15rem]">
              <div className="absolute inset-0 opacity-40 [background-image:radial-gradient(#fffaf3_1px,transparent_1px)] [background-size:18px_18px]" />
              <div className="absolute -left-[8%] bottom-[-12%] h-[64%] w-[60%] rotate-[-8deg] rounded-[2rem] bg-[#efe2d4] shadow-[0_25px_60px_rgba(65,42,34,0.18)]" />
              <div className="absolute right-[7%] top-[10%] h-[66%] w-[54%] rotate-[6deg] rounded-[2rem] bg-[#fffaf3] p-7 shadow-[0_25px_60px_rgba(65,42,34,0.2)] sm:p-10">
                <span className="block text-[10px] font-bold uppercase tracking-[0.3em] text-[#a64f4a]">Do Ateliê Lu</span>
                <span className="mt-7 block font-elegant text-3xl leading-tight text-[#302b27] sm:text-5xl">Ideias que viram</span>
                <span className="mt-1 block font-script text-4xl italic text-[#b45f5a] sm:text-6xl">coisas lindas.</span>
                <span className="absolute bottom-8 left-8 h-px w-16 bg-[#b45f5a]/60 sm:left-10" />
              </div>
              <div className="absolute left-[8%] top-[13%] h-24 w-24 rounded-full bg-[#8f6f62] shadow-xl sm:h-32 sm:w-32" />
              <div className="absolute bottom-[9%] left-[28%] h-16 w-16 rounded-full border-[10px] border-[#b45f5a] bg-transparent sm:h-20 sm:w-20" />
            </div>
            <div className="absolute -bottom-5 left-4 rounded-full bg-[#302b27] px-5 py-3 text-xs font-semibold text-[#fffaf3] shadow-lg sm:left-8">
              Curadoria criativa • escolha com carinho
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-[#473d35]/10 bg-[#efe5dc]">
        <div className="mx-auto grid max-w-[1380px] divide-y divide-[#473d35]/10 px-5 sm:px-8 md:grid-cols-3 md:divide-x md:divide-y-0 lg:px-12">
          {storeBenefits.map(({ icon: BenefitIcon, title, text }) => (
              <div key={title} className="flex items-center gap-4 py-6 md:px-7 lg:px-9">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#fffaf3] text-[#a64f4a]">
                  <BenefitIcon className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-elegant text-lg font-semibold">{title}</p>
                  <p className="mt-0.5 text-xs leading-5 text-[#796d64]">{text}</p>
                </div>
              </div>
            ))}
        </div>
      </section>

      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-[1380px] px-5 sm:px-8 lg:px-12">
          <div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-[#a64f4a]">Escolhas do ateliê</p>
              <h2 className="mt-3 font-elegant text-4xl tracking-[-0.025em] sm:text-5xl">Produtos em destaque</h2>
            </div>
            <Link to="/produtos" className="group inline-flex items-center gap-2 text-sm font-bold text-[#9f4e49]">
              Ver coleção completa
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </div>

          {loading && featuredProducts.length === 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="h-[390px] animate-pulse rounded-[1.5rem] bg-[#eadfd4]" />
              ))}
            </div>
          ) : (
            <ProductGrid products={featuredProducts} priorityCount={2} />
          )}
        </div>
      </section>

      {categories.length > 0 && (
        <section id="categorias" className="bg-[#302b27] py-20 text-[#f8f1e8] sm:py-24">
          <div className="mx-auto max-w-[1380px] px-5 sm:px-8 lg:px-12">
            <div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-[#d99790]">Encontre o que procura</p>
                <h2 className="mt-3 font-elegant text-4xl tracking-[-0.025em] sm:text-5xl">Compre por categoria</h2>
              </div>
              <Link to="/produtos" className="text-sm font-bold text-[#d99790] transition hover:text-white">Ver tudo</Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {categories.map((category, index) => (
                <Link
                  key={category.name}
                  to={`/produtos?category=${encodeURIComponent(category.name)}`}
                  className="group relative min-h-72 overflow-hidden rounded-[1.25rem] bg-[#463d37]"
                >
                  {category.image ? (
                    <CachedImage
                      src={getOptimizedImageUrl(category.image, { width: 640, quality: 74 })}
                      srcSet={getProductImageSrcSet(category.image, [320, 480, 640])}
                      sizes="(max-width: 639px) calc(100vw - 2.5rem), (max-width: 1023px) 50vw, 25vw"
                      fallbackSrc={category.image}
                      alt={category.name}
                      loading="lazy"
                      decoding="async"
                      width={640}
                      height={720}
                      className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className={`absolute inset-0 transition duration-700 group-hover:scale-105 ${[
                      'bg-[#ad776b]',
                      'bg-[#8d776b]',
                      'bg-[#bf9277]',
                      'bg-[#75685f]',
                    ][index % 4]}`}>
                      <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-script text-8xl italic text-white/20">
                        {category.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1f1916]/85 via-[#1f1916]/5 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-6">
                    <div>
                      <h3 className="font-elegant text-2xl">{category.name}</h3>
                      <p className="mt-1 text-xs text-white/65">{category.count} produto{category.count !== 1 ? 's' : ''}</p>
                    </div>
                    <span className="grid h-10 w-10 place-items-center rounded-full border border-white/30 transition group-hover:bg-white group-hover:text-[#302b27]">
                      <ArrowUpRight className="h-4 w-4" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="bg-[#b45f5a] px-5 py-16 text-white sm:px-8 sm:py-20">
        <div className="mx-auto flex max-w-[1180px] flex-col gap-7 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#f2cec8]">Atendimento próximo</p>
            <h2 className="mt-3 max-w-2xl font-elegant text-3xl leading-tight sm:text-4xl">Procurando algo especial para o seu próximo projeto?</h2>
          </div>
          <a
            href="https://wa.me/5519991893513"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-14 shrink-0 items-center justify-center gap-3 rounded-full bg-[#fffaf3] px-7 text-sm font-bold text-[#8f4541] transition hover:-translate-y-0.5 hover:bg-white"
          >
            <MessageCircle className="h-4 w-4" />
            Conversar com a Lu
          </a>
        </div>
      </section>
    </div>
  );
};

export default Home;
