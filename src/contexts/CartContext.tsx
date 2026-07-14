import { Product as ProductType } from '@/types/Product';
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

type Product = ProductType;

export interface CartItem extends Product {
  quantity: number;
}

const API = import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:3000/api';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product) => Promise<boolean>;
  removeFromCart: (productId: number) => Promise<void>;
  updateQuantity: (productId: number, quantity: number) => Promise<void>;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  clearCart: () => void;
  clearCartFromServer: () => Promise<void>;
  loadCartFromServer: () => Promise<void>;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();


  const loadCartFromServer = async () => {
  const token = localStorage.getItem('token'); 
  if (!token) {
    setItems([]);
    setIsLoading(false);
    return;
  }

  setIsLoading(true);
  try {
    const res = await fetch(`${API}/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error('Falha ao carregar carrinho');
    }

    const data = await res.json();

    if (Array.isArray(data.cart)) {
      setItems(data.cart.map(item => ({
        ...item,
        quantity: item.quantity || 1 
      })));
    }
  } catch (err) {
    console.error('Erro ao carregar carrinho do backend:', err);
  } finally {
    setIsLoading(false);
  }
};

  const addToCart = async (product: Product) => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return false;
    }

    try {
      const response = await fetch(`${API}/cartItem`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId: product.id, quantity: 1 }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.message || 'Erro ao adicionar produto');
      }

      setItems(prevItems => {
        const existingItem = prevItems.find(item => item.id === product.id);
        if (existingItem) {
          return prevItems.map(item =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        }
        return [...prevItems, { ...product, quantity: 1 }];
      });
      return true;
    } catch (err) {
      console.error('Erro ao adicionar produto no carrinho:', err);
      toast.error(err instanceof Error ? err.message : 'Erro ao adicionar produto');
      return false;
    }
  };

  const removeFromCart = async (productId: number) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`${API}/cartItem/${productId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Erro ao remover produto');

      setItems(prevItems => prevItems.filter(item => item.id !== productId));
    } catch (err) {
      console.error('Erro ao remover produto do carrinho:', err);
      toast.error(err instanceof Error ? err.message : 'Erro ao remover produto');
    }
  };

 const updateQuantity = async (productId: number, quantity: number) => {
  if (quantity <= 0) {
    removeFromCart(productId);
    return;
  }

  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API}/cartItem/${productId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ quantity }),
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data?.message || 'Erro ao atualizar quantidade');
    }
    setItems(prevItems =>
      prevItems.map(item => item.id === productId ? { ...item, quantity } : item)
    );
  } catch (err) {
    console.error('Erro ao atualizar quantidade no backend:', err);
    toast.error(err instanceof Error ? err.message : 'Erro ao atualizar quantidade');
  }
};

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const clearCart = () => {
    setItems([]);
  };

  const clearCartFromServer = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setItems([]);
      return;
    }

    try {
      const res = await fetch(`${API}/cart`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error('Erro ao limpar carrinho no backend');
      }

      setItems([]);
    } catch (err) {
      console.error('Erro ao limpar carrinho:', err);
      throw err;
    }
  };

  useEffect(() => {
    loadCartFromServer();
  }, []);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        getTotalItems,
        getTotalPrice,
        clearCart,
        clearCartFromServer,
        loadCartFromServer,
        isLoading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
