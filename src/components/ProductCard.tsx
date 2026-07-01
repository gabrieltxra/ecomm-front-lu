
import React, { useCallback } from 'react';
import { Heart, ShoppingCart } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Product } from '@/types/Product';
import { getOptimizedImageUrl, getProductImageSrcSet } from '@/lib/productImages';

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(price);
};

interface ProductCardProps {
  product: Product;
  compact?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = React.memo(({ product, compact = false }) => {
  const { addToCart } = useCart();
  const token = localStorage.getItem('token');
  const navigate = useNavigate();
  const isAvailable = Number(product.stock) > 0;
  const imageHeightClass = compact ? 'h-44 sm:h-48' : 'h-56 sm:h-60 md:h-64';
  const productImage = product.image_urls?.[0];
  const optimizedImage = getOptimizedImageUrl(productImage, {
    width: compact ? 480 : 640,
    quality: 72,
  });

  const handleAddToCart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAvailable) {
      toast.error('Produto indisponível no momento.');
      return;
    }

    if (token) {
      addToCart(product);
      toast.success(`${product.name} adicionado ao carrinho!`);
    } else {
      toast.error('Você precisa estar logado para adicionar produtos ao carrinho.');
      navigate('/login');
    }
  }, [addToCart, isAvailable, navigate, product, token]);

  return (
    <Link to={`/product/${product.id}`} className="group block h-full">
      <div className="bg-card product-card flex h-full flex-col overflow-hidden rounded-lg border border-slate-100 shadow-sm transition-colors duration-150 md:hover:border-rose-100 md:hover:shadow-md">
        {/* Image Container */}
        <div className={`relative shrink-0 overflow-hidden bg-slate-100 dark:bg-slate-800 ${imageHeightClass}`}>
         {product.image_urls?.length > 0 ? (
          <img
            src={optimizedImage}
            srcSet={getProductImageSrcSet(productImage, compact ? [320, 480, 640] : [360, 540, 720])}
            sizes={compact ? '(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw' : '(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw'}
            alt={product.name}
            loading="lazy"
            decoding="async"
            width={compact ? 480 : 640}
            height={compact ? 360 : 640}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400">
            Sem imagem
          </div>
        )}

          
          {/* Overlay Actions */}
          <div className="absolute inset-0 hidden bg-black/15 opacity-0 transition-opacity duration-150 md:flex md:items-center md:justify-center md:group-hover:opacity-100">
            <div className="flex space-x-2">
              <button className="p-2 bg-white/90 hover:bg-white rounded-full transition-colors">
                <Heart className="h-5 w-5 text-gray-700" />
              </button>
              <button
                onClick={handleAddToCart}
                disabled={!isAvailable}
                className={`p-2 rounded-full transition-colors ${
                  isAvailable
                    ? 'bg-atelie-gradient hover:opacity-90'
                    : 'cursor-not-allowed bg-gray-300'
                }`}
                aria-label={isAvailable ? 'Adicionar ao carrinho' : 'Produto indisponível'}
              >
                <ShoppingCart className={`h-5 w-5 ${isAvailable ? 'text-white' : 'text-gray-500'}`} />
              </button>
            </div>
          </div>

          {/* Category Badge */}
          <div className="absolute top-3 left-3">
            <span className="bg-atelie-gradient text-white px-2 py-1 rounded-full text-xs font-medium">
              {product.category}
            </span>
          </div>
        </div>

                {/* Product Info */}
        <div className={`flex flex-1 flex-col ${compact ? 'p-3' : 'p-4'}`}>
          <h3 className={`font-elegant font-semibold text-foreground mb-2 line-clamp-2 ${compact ? 'text-base' : 'text-lg'}`}>
            {product.name}
          </h3>
          
          <p className={`text-muted-foreground text-sm mb-3 ${compact ? 'line-clamp-1' : 'line-clamp-2'}`}>
            {product.description}
          </p>
          
          <div className="mt-auto flex items-center justify-between gap-2">
            <span className={`font-bold text-rose-500 dark:text-rose-400 ${compact ? 'text-xl' : 'text-2xl'}`}>
              {formatPrice(product.price)}
            </span>
            
            <button
              onClick={handleAddToCart}
              disabled={!isAvailable}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm ${
                isAvailable
                  ? 'bg-rose-500 text-white hover:bg-rose-600 dark:bg-rose-400 dark:hover:bg-rose-500'
                  : 'cursor-not-allowed bg-gray-300 text-gray-500 shadow-none dark:bg-gray-700 dark:text-gray-400'
              }`}
            >
              {isAvailable ? 'Comprar' : 'Indisponível'}
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
});

export default ProductCard;
