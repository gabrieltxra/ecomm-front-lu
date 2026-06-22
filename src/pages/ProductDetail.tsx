
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, ShoppingCart } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { toast } from 'sonner';
import { getProductById } from '@/services/productsService';
import { Product } from '@/types/Product';
import { useEffect } from 'react';
import SimilarProducts from '@/components/SimilarProducts';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const token = localStorage.getItem('token');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

const [product, setProduct] = useState<Product | null>(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
  let active = true;

  const fetchProduct = async () => {
    setLoading(true);
    setProduct(null);

    if (!id) {
      setLoading(false);
      return;
    }

    try {
      const data = await getProductById(id);
      if (active) setProduct(data ?? null);
    } catch (error) {
      console.error(error);
      if (active) setProduct(null);
    } finally {
      if (active) setLoading(false);
    }
  };

  fetchProduct();

  return () => {
    active = false;
  };
}, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" role="status">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-rose-200 border-t-rose-500" />
        <span className="sr-only">Carregando produto</span>
      </div>
    );
  }

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
  
  const isAvailable = Number(product.stock) > 0;

  const handleAddToCart = () => {
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


           {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleAddToCart}
                disabled={!isAvailable}
                className={`flex-1 py-3 px-6 rounded-lg font-semibold flex items-center justify-center space-x-2
                  ${!isAvailable 
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed" 
                    : "bg-atelie-gradient text-white hover:opacity-90 transition-opacity"
                  }`}
              >
                <ShoppingCart className="h-5 w-5" />
                <span>
                  {!isAvailable ? "Indisponível" : "Adicionar ao Carrinho"}
                </span>
              </button>
            </div>


            {/* Contact Info */}
            <div className="bg-accent/50 rounded-lg p-6 space-y-3">
              <h3 className="font-semibold text-lg">Dúvidas sobre o produto?</h3>
              <p className="text-muted-foreground">
                Entre em contato conosco para esclarecimentos ou orçamento personalizado.
              </p>
              <a
                href="https://wa.me/5519991893513"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-rose-500 px-5 text-base font-semibold text-white shadow-sm transition hover:bg-rose-600"
              >
                Chamar no WhatsApp
                <Phone className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
      
      {/* Produtos Similares */}
      {product && <SimilarProducts currentProduct={product} />}
    </div>
  );
};

export default ProductDetail;
