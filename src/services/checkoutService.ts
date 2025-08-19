// src/services/checkoutService.ts
const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_URL || "http://localhost:3000";

interface CheckoutPayload {
  cart: {
    id: string;
    name: string;
    price: number;
    quantity: number;
  }[];
  shipping_address: {
    cep: string;
    street: string;
    number: string;
    city: string;
    state: string;
    phone: string;
  };
  shipping: {
    method: string;
    cost: number;
    estimated_delivery: string;
  };
}

interface Order {
  id?: string;
  user_id: number;
  status:
    | 'created'
    | 'pending_payment'
    | 'payment_confirmed'
    | 'preparing_shipment'
    | 'shipped'
    | 'delivered'
    | 'cancelled'
    | 'returned';
  total: number;
  shipping_method: string;
  shipping_cost: number;
  payment_method: string;
  payment_status: 'pending' | 'paid' | 'failed';
  stripe_session_id?: string;
  stripe_payment_intent?: string;
  address: {
    cep: string;
    street: string;
    number: string;
    city: string;
    state: string;
    phone: string;
  };
  created_at: string;
  updated_at?: string;
}

export const iniciarCheckout = async (data: CheckoutPayload): Promise<string> => {
  try {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE_URL}/checkout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });

    if (!res.ok) throw new Error("Erro ao iniciar checkout");

    const result = await res.json();
    return result.url; // URL do checkout da Stripe
  } catch (err) {
    console.error("Erro ao iniciar checkout:", err);
    throw err;
  }
};

export const checkOrderStatus = async (sessionId: string): Promise<Order> => {
  try {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE_URL}/session/${sessionId}`, {
      method: "GET",
      headers: {
        // A autenticação pode ser necessária dependendo das regras do seu backend
        Authorization: `Bearer ${token}`
      }
    });

    if (!res.ok) {
      // Se a order não for encontrada (404) ou outro erro ocorrer
      const errorData = await res.json();
      throw new Error(errorData.message || "Erro ao consultar o status do pedido");
    }

    const result: Order = await res.json();
    return result;
    
  } catch (err) {
    console.error("Erro ao consultar o status do pedido:", err);
    throw err; // Re-lança o erro para que o componente que chamou a função possa tratá-lo
  }
};
