
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, ShoppingCart, Star } from 'lucide-react';
import { products } from '../data/products';
import { useCart } from '../contexts/CartContext';
import { toast } from 'sonner';
import { getProductById } from '@/services/productsService';
import { Product } from '@/types/Product';
import { useEffect } from 'react';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

const [product, setProduct] = useState<Product | null>(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchProduct = async () => {
    if (!id) return;
    try {
      const data = await getProductById(id);
      if (data) {
        setProduct(data);
      } else {
        setProduct(null);
      }
    } catch (error) {
      console.error(error);
      setProduct(null);
    } finally {
      setLoading(false);
    }
  };

  fetchProduct();
}, [id]);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Produto não encontrado</h1>
          <button
            onClick={() => navigate('/')}
            className="bg-atelie-gradient text-white px-6 py-2 rounded-lg"
          >
            Voltar à Home
          </button>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
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
    <div className="min-h-screen pt-16">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Voltar</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Images Section */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
              <img
                src={product.image_urls[selectedImageIndex]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Thumbnail Images */}
            <div className="grid grid-cols-3 gap-4">
              {product.image_urls.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImageIndex === index
                      ? 'border-primary scale-105'
                      : 'border-transparent hover:border-border'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Category Badge */}
            <span className="inline-block bg-atelie-gradient text-white px-3 py-1 rounded-full text-sm font-medium">
              {product.category}
            </span>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-elegant font-bold text-foreground">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center space-x-2">
              <div className="flex space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span className="text-muted-foreground">(48 avaliações)</span>
            </div>

            {/* Price */}
            <div className="text-4xl font-bold text-gradient">
              {formatPrice(product.price)}
            </div>

            {/* Description */}
            <div className="prose prose-gray max-w-none">
              <p className="text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Features */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Características:</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Tecido de alta qualidade</li>
                <li>• Medidas personalizadas</li>
                <li>• Instalação incluída</li>
                <li>• Garantia de 2 anos</li>
              </ul>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-atelie-gradient text-white py-3 px-6 rounded-lg font-semibold hover:opacity-90 transition-opacity flex items-center justify-center space-x-2"
              >
                <ShoppingCart className="h-5 w-5" />
                <span>Adicionar ao Carrinho</span>
              </button>
              
              <button className="flex items-center justify-center space-x-2 border border-border py-3 px-6 rounded-lg hover:bg-accent transition-colors">
                <Heart className="h-5 w-5" />
                <span>Favoritar</span>
              </button>
            </div>

            {/* Contact Info */}
            <div className="bg-accent/50 rounded-lg p-6 space-y-3">
              <h3 className="font-semibold text-lg">Dúvidas sobre o produto?</h3>
              <p className="text-muted-foreground">
                Entre em contato conosco para esclarecimentos ou orçamento personalizado.
              </p>
              <button className="bg-background border border-border py-2 px-4 rounded-lg hover:bg-accent transition-colors">
                Falar com Consultor
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
