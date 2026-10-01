import React, { useCallback, useState } from 'react';
import { Loader2, ShoppingCart } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import CachedImage from './CachedImage';
import { useCart } from '../contexts/CartContext';
import { preloadImage } from '@/lib/imagePreloadCache';
import { getOptimizedImageUrl, getProductImageSrcSet } from '@/lib/productImages';
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
  const imageHeightClass = compact ? 'h-52 sm:h-56' : 'h-64 sm:h-72 md:h-80';
  const productImage = product.image_urls?.[0];
  const optimizedImage = getOptimizedImageUrl(productImage, {
    width: compact ? 480 : 640,
    quality: 72,
  });

  const prefetchProduct = useCallback(() => {
    primeProductCache(product);

    if (!productImage) return;

    const detailImage = getOptimizedImageUrl(productImage, { width: 960, quality: 76 });

    if (detailImage !== productImage && detailImage !== optimizedImage) {
      void preloadImage(detailImage).catch(() => undefined);
    }
  }, [optimizedImage, product, productImage]);

  const handleAddToCart = useCallback(async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (isAddingToCart) return;

    if (!isAvailable) {
      toast.error('Produto indisponível no momento.');
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
      className="group product-card flex h-full flex-col overflow-hidden rounded-[1.35rem] border border-[#473d35]/10 bg-[#fffaf3] shadow-[0_10px_30px_rgba(64,48,39,0.06)] transition duration-300 md:hover:-translate-y-1 md:hover:border-[#b45f5a]/25 md:hover:shadow-[0_18px_38px_rgba(64,48,39,0.12)]"
      onPointerEnter={prefetchProduct}
      onFocusCapture={prefetchProduct}
      onTouchStart={prefetchProduct}
    >
      <Link to={`/product/${product.id}`} className="block">
        <div className={`relative shrink-0 overflow-hidden bg-[#eadfd4] ${imageHeightClass}`}>
          {productImage ? (
            <CachedImage
              src={optimizedImage}
              srcSet={getProductImageSrcSet(productImage, [320, 480, 640])}
              sizes="(max-width: 639px) calc(100vw - 2rem), (max-width: 1023px) calc(50vw - 2rem), (max-width: 1279px) calc(33vw - 2rem), 300px"
              fallbackSrc={productImage}
              alt={product.name}
              loading={priority ? 'eager' : 'lazy'}
              fetchPriority={priority ? 'high' : 'low'}
              decoding="async"
              width={compact ? 480 : 640}
              height={compact ? 360 : 480}
              className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.035]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[#eadfd4] text-[#8a7d74]">
              Sem imagem
            </div>
          )}

          <div className="absolute left-3 top-3">
            <span className="rounded-full bg-[#fffaf3]/90 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#8f4541] shadow-sm backdrop-blur-sm">
              {product.category}
            </span>
          </div>
        </div>
      </Link>

      <div className={`flex flex-1 flex-col ${compact ? 'p-4' : 'p-5'}`}>
        <Link to={`/product/${product.id}`} className="block">
          <h3 className={`mb-2 line-clamp-2 font-elegant font-semibold leading-snug text-[#302b27] transition-colors group-hover:text-[#9f4e49] ${compact ? 'text-lg' : 'text-xl'}`}>
            {product.name}
          </h3>
        </Link>

        <p className={`mb-4 text-sm leading-6 text-[#7b6f66] ${compact ? 'line-clamp-1' : 'line-clamp-2'}`}>
          {product.description}
        </p>

        <div className="mt-auto flex items-center justify-between gap-2">
          <span className={`font-sans font-bold tabular-nums tracking-[-0.02em] text-[#9f4e49] ${compact ? 'text-xl' : 'text-2xl'}`}>
            {formatPrice(product.price)}
          </span>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!isAvailable || isAddingToCart}
            className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all ${
              isAvailable
                ? 'bg-[#302b27] text-white hover:-translate-y-0.5 hover:bg-[#b45f5a] disabled:cursor-wait disabled:opacity-85'
                : 'cursor-not-allowed bg-[#ddd2c8] text-[#8a7d74] shadow-none'
            }`}
            aria-label={isAvailable ? `Adicionar ${product.name} ao carrinho` : `${product.name} indisponível`}
            aria-busy={isAddingToCart}
          >
            {isAddingToCart ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ShoppingCart className="h-4 w-4" />
            )}
            {isAddingToCart ? 'Adicionando...' : isAvailable ? 'Comprar' : 'Indisponível'}
          </button>
        </div>
      </div>
    </article>
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;
