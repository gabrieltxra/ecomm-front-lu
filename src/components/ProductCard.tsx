
import React from 'react';
import { Heart, ShoppingCart } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Product } from '@/types/Product';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    toast.success(`${product.name} adicionado ao carrinho!`);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  return (
    <Link to={`/product/${product.id}`} className="group">
      <div className="bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover-scale animate-fade-in">
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden">
         {product.image_urls?.length > 0 ? (
          <img
            src={product.image_urls[0]}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
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
                className="p-2 bg-atelie-gradient hover:opacity-90 rounded-full transition-all transform hover:scale-105"
              >
                <ShoppingCart className="h-5 w-5 text-white" />
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
        <div className="p-4">
          <h3 className="font-elegant text-lg font-semibold text-foreground mb-2 line-clamp-2">
            {product.name}
          </h3>
          
          <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
            {product.description}
          </p>
          
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-gradient">
              {formatPrice(product.price)}
            </span>
            
            <button
              onClick={handleAddToCart}
              className="bg-atelie-gradient text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Comprar
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
