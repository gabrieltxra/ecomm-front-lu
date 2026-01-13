// src/services/checkoutService.ts
const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_URL || "http://localhost:3000";

type PaymentMethod = "pix" | "card";

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
  } | null;
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
    | "created"
    | "pending_payment"
    | "payment_confirmed"
    | "preparing_shipment"
    | "shipped"
    | "delivered"
    | "cancelled"
    | "returned";
  total: number;
  shipping_method: string;
  shipping_cost: number;
  payment_method: string;
  payment_status: "pending" | "paid" | "failed";
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

// Resposta padronizada do "iniciarCheckout"
type CheckoutResponse =
  | { type: "card"; url: string }
  | { type: "pix"; url: string; orderId?: string; billingId?: string }
  | any;

export const iniciarCheckout = async (
  data: CheckoutPayload,
  paymentMethod: PaymentMethod = "card"
): Promise<CheckoutResponse> => {
  try {
    const token = localStorage.getItem("token");

    const endpoint =
      paymentMethod === "pix" ? `${API_BASE_URL}/checkout/pix` : `${API_BASE_URL}/checkout`;

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    const result = await res.json().catch(() => ({}));

    if (!res.ok) {
      // tenta dar mensagem útil do backend
      const msg = result?.message || "Erro ao iniciar checkout";
      throw new Error(msg);
    }

    // IMPORTANTÍSSIMO:
    // - Stripe normalmente devolve { url: "..." }
    // - Pix (AbacatePay) devolve { type:"pix", url:"...", ... }
    //
    // Vamos normalizar:
    if (paymentMethod === "card") {
      // se backend já devolver {type:"card", url}, ok
      if (result?.type === "card" && result?.url) return result;
      // se backend devolver só {url}, normaliza
      if (result?.url) return { type: "card", url: result.url };
      return result;
    }

    if (paymentMethod === "pix") {
      // se backend já devolver {type:"pix", url}, ok
      if (result?.type === "pix" && result?.url) return result;
      // se backend devolver só {url}, normaliza
      if (result?.url) return { type: "pix", url: result.url, ...result };
      return result;
    }

    return result;
  } catch (err) {
    console.error("Erro ao iniciar checkout:", err);
    throw err;
  }
};

export const checkOrderStatus = async (sessionId: string): Promise<Order> => {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_BASE_URL}/session/${sessionId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(result?.message || "Erro ao consultar o status do pedido");
    }

    return result as Order;
  } catch (err) {
    console.error("Erro ao consultar o status do pedido:", err);
    throw err;
  }
};
