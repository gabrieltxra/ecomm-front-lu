
import React from 'react';
import { Heart, ShoppingCart } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Product } from '@/types/Product';


interface ProductCardProps {
  product: Product;
  compact?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, compact = false }) => {
  const { addToCart } = useCart();
  const token = localStorage.getItem('token');
  const navigate = useNavigate();
  const isAvailable = Number(product.stock) > 0;

  const handleAddToCart = (e: React.MouseEvent) => {
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
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  return (
    <Link to={`/product/${product.id}`} className="group">
      <div className="bg-card product-card rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover-scale animate-fade-in">
        {/* Image Container */}
        <div className={`relative overflow-hidden ${compact ? 'aspect-[4/3]' : 'aspect-square'}`}>
         {product.image_urls?.length > 0 ? (
          <img
            src={product.image_urls[0]}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400">
            Sem imagem
          </div>
        )}

          
          {/* Overlay Actions */}
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div className="flex space-x-2">
              <button className="p-2 bg-white/90 hover:bg-white rounded-full transition-colors">
                <Heart className="h-5 w-5 text-gray-700" />
              </button>
              <button
                onClick={handleAddToCart}
                disabled={!isAvailable}
                className={`p-2 rounded-full transition-all ${
                  isAvailable
                    ? 'bg-atelie-gradient hover:scale-105 hover:opacity-90'
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
        <div className={compact ? 'p-3' : 'p-4'}>
          <h3 className={`font-elegant font-semibold text-foreground mb-2 line-clamp-2 ${compact ? 'text-base' : 'text-lg'}`}>
            {product.name}
          </h3>
          
          <p className={`text-muted-foreground text-sm mb-3 ${compact ? 'line-clamp-1' : 'line-clamp-2'}`}>
            {product.description}
          </p>
          
          <div className="flex items-center justify-between gap-2">
            <span className={`font-bold text-rose-500 dark:text-rose-400 ${compact ? 'text-xl' : 'text-2xl'}`}>
              {formatPrice(product.price)}
            </span>
            
            <button
              onClick={handleAddToCart}
              disabled={!isAvailable}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg ${
                isAvailable
                  ? 'bg-rose-500 text-white hover:bg-rose-600 hover:shadow-xl dark:bg-rose-400 dark:hover:bg-rose-500'
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
};

export default ProductCard;
