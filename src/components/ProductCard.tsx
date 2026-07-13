import React, { useCallback, useState } from 'react';
import { Loader2, ShoppingCart } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import CachedImage from './CachedImage';
import { useCart } from '../contexts/CartContext';
import { preloadImage } from '@/lib/imagePreloadCache';
import { getOptimizedImageUrl } from '@/lib/productImages';
import { primeProductCache } from '@/services/productsService';
import { Product } from '@/types/Product';

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(price);
};

interface ProductCardProps {
  product: Product;
  compact?: boolean;
  priority?: boolean;
  onAddedToCart?: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = React.memo(({
  product,
  compact = false,
  priority = false,
  onAddedToCart,
}) => {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const isAvailable = Number(product.stock) > 0;
  const imageHeightClass = compact ? 'h-44 sm:h-48' : 'h-56 sm:h-60 md:h-64';
  const productImage = product.image_urls?.[0];
  const optimizedImage = getOptimizedImageUrl(productImage, {
    width: compact ? 480 : 640,
    quality: 72,
  });

  const prefetchProduct = useCallback(() => {
    primeProductCache(product);

    if (!productImage) return;

    const detailImage = getOptimizedImageUrl(productImage, { width: 960, quality: 76 });

    void preloadImage(productImage);
    if (optimizedImage !== productImage) void preloadImage(optimizedImage);
    if (detailImage !== productImage && detailImage !== optimizedImage) void preloadImage(detailImage);
  }, [optimizedImage, product, productImage]);

  const handleAddToCart = useCallback(async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (isAddingToCart) return;

    if (!isAvailable) {
      toast.error('Produto indisponivel no momento.');
      return;
    }

    const token = localStorage.getItem('token');

    if (!token) {
      toast.error('Voce precisa estar logado para adicionar produtos ao carrinho.');
      navigate('/login');
      return;
    }

    setIsAddingToCart(true);

    try {
      const added = await addToCart(product);
      if (added) onAddedToCart?.(product);
    } finally {
      setIsAddingToCart(false);
    }
  }, [addToCart, isAddingToCart, isAvailable, navigate, onAddedToCart, product]);

  return (
    <article
      className="group product-card flex h-full flex-col overflow-hidden rounded-lg border border-slate-100 bg-card shadow-sm transition-colors duration-150 md:hover:border-rose-100 md:hover:shadow-md"
      onPointerEnter={prefetchProduct}
      onFocusCapture={prefetchProduct}
      onTouchStart={prefetchProduct}
    >
      <Link to={`/product/${product.id}`} className="block">
        <div className={`relative shrink-0 overflow-hidden bg-slate-100 dark:bg-slate-800 ${imageHeightClass}`}>
          {productImage ? (
            <CachedImage
              src={optimizedImage}
              fallbackSrc={productImage}
              alt={product.name}
              loading={priority ? 'eager' : 'lazy'}
              fetchPriority={priority ? 'high' : 'low'}
              decoding="async"
              width={compact ? 480 : 640}
              height={compact ? 360 : 640}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400">
              Sem imagem
            </div>
          )}

          <div className="absolute left-3 top-3">
            <span className="rounded-full bg-atelie-gradient px-2 py-1 text-xs font-medium text-white">
              {product.category}
            </span>
          </div>
        </div>
      </Link>

      <div className={`flex flex-1 flex-col ${compact ? 'p-3' : 'p-4'}`}>
        <Link to={`/product/${product.id}`} className="block">
          <h3 className={`mb-2 line-clamp-2 font-elegant font-semibold text-foreground transition-colors group-hover:text-rose-600 ${compact ? 'text-base' : 'text-lg'}`}>
            {product.name}
          </h3>
        </Link>

        <p className={`mb-3 text-sm text-muted-foreground ${compact ? 'line-clamp-1' : 'line-clamp-2'}`}>
          {product.description}
        </p>

        <div className="mt-auto flex items-center justify-between gap-2">
          <span className={`font-bold text-rose-500 dark:text-rose-400 ${compact ? 'text-xl' : 'text-2xl'}`}>
            {formatPrice(product.price)}
          </span>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!isAvailable || isAddingToCart}
            className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold shadow-sm transition-colors ${
              isAvailable
                ? 'bg-rose-500 text-white hover:bg-rose-600 disabled:cursor-wait disabled:opacity-85 dark:bg-rose-400 dark:hover:bg-rose-500'
                : 'cursor-not-allowed bg-gray-300 text-gray-500 shadow-none dark:bg-gray-700 dark:text-gray-400'
            }`}
            aria-label={isAvailable ? `Adicionar ${product.name} ao carrinho` : `${product.name} indisponivel`}
            aria-busy={isAddingToCart}
          >
            {isAddingToCart ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ShoppingCart className="h-4 w-4" />
            )}
            {isAddingToCart ? 'Adicionando...' : isAvailable ? 'Comprar' : 'Indisponivel'}
          </button>
        </div>
      </div>
    </article>
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;
