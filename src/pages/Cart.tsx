
import React from 'react';
import { useCart } from '../contexts/CartContext';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

const Cart: React.FC = () => {
  const { items, removeFromCart, updateQuantity, getTotalPrice, clearCartFromServer } = useCart();

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
      <div className="min-h-screen pt-16">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center max-w-md mx-auto">
            <ShoppingBag className="h-24 w-24 mx-auto text-muted-foreground mb-6" />
            <h1 className="text-3xl font-elegant font-bold mb-4">Carrinho Vazio</h1>
            <p className="text-muted-foreground mb-8">
              Você ainda não adicionou nenhum produto ao seu carrinho.
            </p>
            <Link
              to="/"
              className="inline-block bg-atelie-gradient text-white px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
            >
              Continuar Comprando
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-elegant font-bold text-gradient mb-2">
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
              <div key={item.id} className="bg-card rounded-lg p-4 sm:p-6 border border-border">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  {/* Product Image */}
                  <div className="flex min-w-0 flex-1 items-center gap-4">
                    <div className="flex-shrink-0">
                      <img
                        src={item.image_urls[0]}
                        alt={item.name}
                        className="h-20 w-20 object-cover rounded-lg"
                      />
                    </div>

                    {/* Product Info */}
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-lg mb-1 break-words">{item.name}</h3>
                      <p className="text-muted-foreground text-sm mb-2">
                        {item.category}
                      </p>
                      <div className="text-lg font-bold text-gradient">
                        {formatPrice(item.price)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4 sm:justify-end">
                    {/* Quantity Controls */}
                    <div className="flex items-center gap-3 rounded-lg border border-border px-2 py-1">
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
            <div className="bg-card rounded-lg p-6 border border-border sticky top-24">
              <h2 className="text-xl font-semibold mb-6">Resumo do Pedido</h2>
              
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
                  <span className="text-gradient">{formatPrice(getTotalPrice())}</span>
                </div>
              </div>

              <div className="space-y-3">
                <Link
                  to="/checkout"
                  className="w-full bg-atelie-gradient text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity text-center block"
                >
                  Finalizar Compra
                </Link>
                
                <Link
                  to="/produtos"
                  className="block w-full text-center border border-border py-3 rounded-lg hover:bg-accent transition-colors"
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
