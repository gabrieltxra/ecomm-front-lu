
import React, { useCallback, useRef, useState } from 'react';
import ProductCard from './ProductCard';
import AddToCartDialog from './AddToCartDialog';
import { useProgressiveImagePreload } from '@/hooks/useProgressiveImagePreload';
import { Product } from '@/types/Product';

interface ProductGridProps {
  products: Product[];
  compact?: boolean;
  priorityCount?: number;
}

const ProductGrid: React.FC<ProductGridProps> = React.memo(({
  products,
  compact = false,
  priorityCount = 0,
}) => {
  const [addedProduct, setAddedProduct] = useState<Product | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useProgressiveImagePreload(gridRef, products);

  const handleDialogChange = useCallback((open: boolean) => {
    if (!open) setAddedProduct(null);
  }, []);

  return (
    <>
      <div ref={gridRef} className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product, index) => (
          <div key={product.id} data-product-image-index={index} className="h-full">
            <ProductCard
              product={product}
              compact={compact}
              priority={index < priorityCount}
              onAddedToCart={setAddedProduct}
            />
          </div>
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
