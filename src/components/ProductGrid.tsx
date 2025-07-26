
import React from 'react';
import ProductCard from './ProductCard';
import { Product } from '@/types/Product';

interface ProductGridProps {
  products: Product[];
  title: string;
}

const ProductGrid: React.FC<ProductGridProps> = ({ products, title }) => {
  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        {/* Section Title */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-elegant font-bold text-rose-500 dark:text-rose-400 mb-4">
            {title}
          </h2>
          <div className="w-24 h-1 bg-rose-500 dark:bg-rose-400 mx-auto rounded-full shadow-lg"></div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductGrid;
