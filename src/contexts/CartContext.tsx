import { Product as ProductType } from '@/types/Product';
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface Product extends ProductType {}

export interface CartItem extends Product {
  quantity: number;
}

const API = import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:3000/api';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  clearCart: () => void;
  loadCartFromServer: () => Promise<void>; 
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
  const token = localStorage.getItem('token');
    const navigate = useNavigate();


  const loadCartFromServer = async () => {
  const token = localStorage.getItem('token'); 
  if (!token) return;

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
  }
};

  const addToCart = async (product: Product) => {
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      await fetch(`${API}/cartItem`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId: product.id, quantity: 1 }),
      });

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
    } catch (err) {
      console.error('Erro ao adicionar produto no carrinho:', err);
    }
  };

  const removeFromCart = async (productId: number) => {
    if (!token) return;

    try {
      await fetch(`${API}/cartItem/${productId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setItems(prevItems => prevItems.filter(item => item.id !== productId));
    } catch (err) {
      console.error('Erro ao remover produto do carrinho:', err);
    }
  };

 const updateQuantity = async (productId: number, quantity: number) => {
  if (quantity <= 0) {
    removeFromCart(productId);
    return;
  }

  setItems(prevItems =>
    prevItems.map(item =>
      item.id === productId ? { ...item, quantity } : item
    )
  );

  try {
    await fetch(`${API}/cartItem/${productId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ quantity }),
    });
  } catch (err) {
    console.error('Erro ao atualizar quantidade no backend:', err);
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
        loadCartFromServer 
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
