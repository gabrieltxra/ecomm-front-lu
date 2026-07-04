
import React, { useCallback, useState } from 'react';
import ProductCard from './ProductCard';
import AddToCartDialog from './AddToCartDialog';
import { Product } from '@/types/Product';

interface ProductGridProps {
  products: Product[];
  compact?: boolean;
}

const ProductGrid: React.FC<ProductGridProps> = React.memo(({ products, compact = false }) => {
  const [addedProduct, setAddedProduct] = useState<Product | null>(null);

  const handleDialogChange = useCallback((open: boolean) => {
    if (!open) setAddedProduct(null);
  }, []);

  return (
    <>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product, index) => (
          <ProductCard
            key={product.id}
            product={product}
            compact={compact}
            priority={index < 4}
            onAddedToCart={setAddedProduct}
          />
        ))}
      </div>

      {addedProduct && (
        <AddToCartDialog
          product={addedProduct}
          open={Boolean(addedProduct)}
          onOpenChange={handleDialogChange}
        />
      )}
    </>
  );
});

export default ProductGrid;
