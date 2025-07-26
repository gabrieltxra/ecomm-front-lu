import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Product } from '@/types/Product';
import { products } from '@/data/products';

interface SimilarProductsProps {
  currentProduct: Product;
  maxProducts?: number;
}

const SimilarProducts: React.FC<SimilarProductsProps> = ({ 
  currentProduct, 
  maxProducts = 4 
}) => {
  const navigate = useNavigate();

  // Filtra produtos da mesma categoria, excluindo o produto atual
  const similarProducts = products
    .filter(product => 
      product.category === currentProduct.category && 
      product.id !== currentProduct.id
    )
    .slice(0, maxProducts);

  // Se não houver produtos da mesma categoria, mostra produtos aleatórios
  const fallbackProducts = products
    .filter(product => product.id !== currentProduct.id)
    .slice(0, maxProducts);

  const displayProducts = similarProducts.length > 0 ? similarProducts : fallbackProducts;

  if (displayProducts.length === 0) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  return (
    <section className="py-16 bg-gray-50 dark:bg-slate-900/50 section-dark">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-elegant font-bold text-foreground mb-4">
            Produtos Similares
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Descubra outros produtos que podem combinar com seu estilo e necessidades
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white dark:bg-slate-800/50 product-card rounded-lg shadow-md dark:shadow-dark overflow-hidden hover:shadow-lg dark:hover:shadow-dark transition-shadow cursor-pointer group border border-gray-200 dark:border-slate-700/50 backdrop-blur-sm"
              onClick={() => navigate(`/product/${product.id}`)}
            >
              <div className="aspect-square overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              
              <div className="p-4">
                <span className="inline-block bg-atelie-gradient text-white px-2 py-1 rounded-full text-xs font-medium mb-2">
                  {product.category}
                </span>
                
                <h3 className="font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                  {product.name}
                </h3>
                
                <p className="text-2xl font-bold text-rose-500 dark:text-rose-400 mb-3">
                  {formatPrice(product.price)}
                </p>
                
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {product.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <button
            onClick={() => navigate('/products')}
            className="bg-rose-500 dark:bg-rose-400 hover:bg-rose-600 dark:hover:bg-rose-500 text-white px-8 py-3 rounded-lg font-semibold transition-colors shadow-lg hover:shadow-xl"
          >
            Ver Todos os Produtos
          </button>
        </div>
      </div>
    </section>
  );
};

export default SimilarProducts; 