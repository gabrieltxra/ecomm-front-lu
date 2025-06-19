import React from 'react';
import Carousel from '../components/Carousel';
import ProductGrid from '../components/ProductGrid';
import { products, banners } from '../data/products';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  const featuredProducts = products.slice(0, 8);
  const bestSellers = products.slice(0, 4); // Exemplo para seção de mais vendidos

  return (
    <div className="min-h-screen bg-white">
      {/* Banner Principal */}
      <section className="pt-20 pb-8 bg-white">
        <div className="container mx-auto px-4 flex flex-col lg:flex-row items-center gap-8">
          <div className="flex-1">
            <Carousel items={banners} />
          </div>
          <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-black leading-tight">
              Transforme seu lar com <span className="text-rose-400">elegância</span> e <span className="text-black">personalidade</span>
            </h1>
            <p className="text-lg text-gray-700 mb-6 max-w-md">
              Cortinas e persianas sob medida, feitas para impressionar. Qualidade premium, atendimento exclusivo e entrega rápida para todo o Brasil.
            </p>
            <Link to="/produtos" className="bg-rose-400 hover:bg-rose-500 text-white font-semibold px-8 py-3 rounded-lg shadow transition-all">
              Ver Produtos
            </Link>
          </div>
        </div>
      </section>

      {/* Selo de Benefícios */}
      <section className="py-4 bg-rose-50 border-y border-rose-100">
        <div className="container mx-auto px-4 flex flex-wrap justify-center gap-6 text-black text-sm font-medium">
          <div className="flex items-center gap-2"><span className="font-bold">✓</span> + de 10 anos deixando os Lares Aconchegantes</div>
          <div className="flex items-center gap-2"><span className="font-bold">✓</span> 6x sem juros</div>
          <div className="flex items-center gap-2"><span className="font-bold">✓</span> Entrega para todo Brasil</div>
          <div className="flex items-center gap-2"><span className="font-bold">✓</span> Atendimento personalizado</div>
        </div>
      </section>

      {/* Produtos em Destaque */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 flex items-center justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-black">Produtos em Destaque</h2>
          <Link to="/produtos" className="text-rose-400 hover:underline font-semibold">Ver todos</Link>
        </div>
        <ProductGrid products={featuredProducts} title="Produtos em Destaque" />
      </section>

      {/* Mais Vendidos */}
      <section className="py-12 bg-rose-50">
        <div className="container mx-auto px-4 flex items-center justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-black">Mais Vendidos</h2>
        </div>
        <ProductGrid products={bestSellers} title="Mais Vendidos" />
      </section>

      {/* Sobre (rodapé visual) */}
      <section className="py-16 bg-gradient-to-br from-white to-rose-50 border-t border-rose-100 mt-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-elegant font-bold text-rose-400 mb-6">
              Sobre o Ateliê Lu Cortinas
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-8">
              Há mais de 10 anos transformando lares com cortinas e persianas sob medida. Nossa paixão pela decoração e atenção aos detalhes nos permite criar peças únicas que refletem o estilo e personalidade de cada cliente.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-rose-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-2xl font-bold">+</span>
                </div>
                <h3 className="font-elegant text-xl font-semibold mb-2 text-black">Qualidade Premium</h3>
                <p className="text-gray-700">Materiais selecionados e acabamento impecável</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-rose-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-2xl font-bold">✓</span>
                </div>
                <h3 className="font-elegant text-xl font-semibold mb-2 text-black">Sob Medida</h3>
                <p className="text-gray-700">Cada peça é única e feita especialmente para você</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-rose-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-2xl font-bold">♥</span>
                </div>
                <h3 className="font-elegant text-xl font-semibold mb-2 text-black">Atendimento Exclusivo</h3>
                <p className="text-gray-700">Consultoria personalizada do projeto à instalação</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
