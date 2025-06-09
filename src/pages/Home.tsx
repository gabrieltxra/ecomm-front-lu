
import React from 'react';
import Carousel from '../components/Carousel';
import ProductGrid from '../components/ProductGrid';
import { products, banners } from '../data/products';

const Home: React.FC = () => {
  const featuredProducts = products.slice(0, 6);

  return (
    <div className="min-h-screen">
      {/* Hero Carousel */}
      <section className="pt-16">
        <div className="container mx-auto px-4 py-8">
          <Carousel items={banners} />
        </div>
      </section>

      {/* Featured Products */}
      <ProductGrid products={featuredProducts} title="Produtos em Destaque" />

      {/* About Section */}
      <section className="py-16 bg-gradient-to-br from-background to-accent/20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-elegant font-bold text-gradient mb-6">
              Sobre o Ateliê Lu Cortinas
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              Há mais de 10 anos transformando lares com cortinas e persianas sob medida. 
              Nossa paixão pela decoração e atenção aos detalhes nos permite criar peças únicas 
              que refletem o estilo e personalidade de cada cliente.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-atelie-gradient rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-2xl font-bold">+</span>
                </div>
                <h3 className="font-elegant text-xl font-semibold mb-2">Qualidade Premium</h3>
                <p className="text-muted-foreground">Materiais selecionados e acabamento impecável</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-atelie-gradient rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-2xl font-bold">✓</span>
                </div>
                <h3 className="font-elegant text-xl font-semibold mb-2">Sob Medida</h3>
                <p className="text-muted-foreground">Cada peça é única e feita especialmente para você</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-atelie-gradient rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-2xl font-bold">♥</span>
                </div>
                <h3 className="font-elegant text-xl font-semibold mb-2">Atendimento Exclusivo</h3>
                <p className="text-muted-foreground">Consultoria personalizada do projeto à instalação</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
