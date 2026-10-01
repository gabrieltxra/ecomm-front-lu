
import React, { useEffect, useRef } from 'react';
import { useCart } from '../contexts/CartContext';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

import CachedImage from '@/components/CachedImage';
import { getOptimizedImageUrl } from '@/lib/productImages';
import { trackBeginCheckout, trackViewCart } from '@/lib/analytics';

const Cart: React.FC = () => {
  const { items, removeFromCart, updateQuantity, getTotalPrice, clearCartFromServer } = useCart();
  const viewCartTrackedRef = useRef(false);

  useEffect(() => {
    if (!viewCartTrackedRef.current && items.length > 0) {
      viewCartTrackedRef.current = true;
      trackViewCart(items);
    }
  }, [items]);

  const handleClearCart = async () => {
    try {
      await clearCartFromServer();
      toast.success('Carrinho limpo com sucesso.');
    } catch {
      toast.error('Não foi possível limpar o carrinho.');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#f8f4ed] pt-20 text-[#27231f]">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center max-w-md mx-auto">
            <ShoppingBag className="mx-auto mb-6 h-20 w-20 text-[#b45f5a]" strokeWidth={1.3} />
            <h1 className="mb-4 font-serif text-4xl font-normal">Seu carrinho está vazio</h1>
            <p className="mb-8 text-[#6f655d]">
              Você ainda não adicionou nenhum produto ao seu carrinho.
            </p>
            <Link
              to="/ecommerce"
              className="inline-block rounded-full bg-[#27231f] px-8 py-3 font-semibold text-white transition hover:bg-[#b45f5a]"
            >
              Continuar Comprando
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f4ed] pt-20 text-[#27231f]">
      <div className="mx-auto max-w-[1380px] px-5 py-12 sm:px-8 lg:px-12">
        <div className="mb-8">
          <p className="mb-3 text-[0.7rem] font-bold uppercase tracking-[0.28em] text-[#a64f4a]">Sua seleção</p>
          <h1 className="mb-2 font-serif text-4xl font-normal md:text-5xl">
            Meu Carrinho
          </h1>
          <p className="text-muted-foreground">
            {items.length} {items.length === 1 ? 'item' : 'itens'} no carrinho
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="rounded-[1.35rem] border border-[#473d35]/10 bg-[#fffaf3] p-4 sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  {/* Product Image */}
                  <div className="flex min-w-0 flex-1 items-center gap-4">
                    <div className="flex-shrink-0">
                      <CachedImage
                        src={getOptimizedImageUrl(item.image_urls?.[0], { width: 160, height: 160, quality: 68 })}
                        fallbackSrc={item.image_urls?.[0]}
                        alt={item.name}
                        className="h-20 w-20 rounded-xl object-cover"
                        loading="lazy"
                        decoding="async"
                        width={160}
                        height={160}
                      />
                    </div>

                    {/* Product Info */}
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-lg mb-1 break-words">{item.name}</h3>
                      <p className="text-muted-foreground text-sm mb-2">
                        {item.category}
                      </p>
                      <div className="font-sans text-lg font-bold tabular-nums tracking-[-0.02em] text-[#a64f4a]">
                        {formatPrice(item.price)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4 sm:justify-end">
                    {/* Quantity Controls */}
                    <div className="flex items-center gap-3 rounded-full border border-[#473d35]/15 px-2 py-1">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="flex h-9 w-9 items-center justify-center rounded-md hover:bg-accent transition-colors"
                        aria-label="Diminuir quantidade"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="flex h-9 w-9 items-center justify-center rounded-md hover:bg-accent transition-colors"
                        aria-label="Aumentar quantidade"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="flex h-10 w-10 flex-shrink-0 items-center justify-center text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                      aria-label="Remover produto do carrinho"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Clear Cart */}
            <div className="flex justify-end">
              <button
                onClick={() => void handleClearCart()}
                className="text-destructive hover:bg-destructive/10 px-4 py-2 rounded-lg transition-colors"
              >
                Limpar Carrinho
              </button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-[1.35rem] border border-[#473d35]/10 bg-[#efe5dc] p-6">
              <h2 className="mb-6 font-serif text-2xl">Resumo do pedido</h2>
              
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>{item.name} x{item.quantity}</span>
                    <span>{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-border pt-4 mb-6">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="font-sans font-bold tabular-nums tracking-[-0.02em] text-[#a64f4a]">{formatPrice(getTotalPrice())}</span>
                </div>
              </div>

              <div className="space-y-3">
                <Link
                  to="/checkout"
                  onClick={() => trackBeginCheckout(items)}
                  className="block w-full rounded-full bg-[#27231f] py-3 text-center font-semibold text-white transition hover:bg-[#b45f5a]"
                >
                  Finalizar Compra
                </Link>
                
                <Link
                  to="/produtos"
                  className="block w-full rounded-full border border-[#473d35]/20 py-3 text-center transition-colors hover:bg-[#fffaf3]"
                >
                  Continuar Comprando
                </Link>
              </div>

              <div className="mt-6 text-sm text-muted-foreground">
                <p>✓ Frete grátis para pedidos acima de R$ 500</p>
                <p>✓ Parcelamento em até 12x sem juros</p>
                <p>✓ Garantia de 2 anos</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
