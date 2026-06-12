const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_URL || "http://localhost:3000";

export type PaymentMethod = "pix" | "card_mercadopago";

export interface CheckoutPayload {
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

export interface OrderStatusResponse {
  id?: string;
  user_id: number;
  status:
    | "created"
    | "pending_payment"
    | "payment_confirmed"
    | "paid"
    | "preparing_shipment"
    | "shipped"
    | "delivered"
    | "cancelled"
    | "returned"
    | "expired";
  total: number;
  shipping_method: string;
  shipping_cost: number;
  payment_method: string;
  mp_payment_method_id?: string | null;
  payment_status: "pending" | "paid" | "failed" | "succeeded" | "expired";
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

export type CheckoutErrorItem = {
  id: string;
  name: string;
  requested: number;
  stock: number;
  ok?: boolean;
};

export class CheckoutError extends Error {
  status?: number;
  code?: string;
  items?: CheckoutErrorItem[];

  constructor(message: string, options?: { status?: number; code?: string; items?: CheckoutErrorItem[] }) {
    super(message);
    this.name = "CheckoutError";
    this.status = options?.status;
    this.code = options?.code;
    this.items = options?.items;
  }
}

type CheckoutResponse =
  | { type: "card"; provider: "mercadopago"; url: string; orderId?: string }
  | { type: "pix"; url: string; orderId?: string; billingId?: string }
  | any;

export const iniciarCheckout = async (
  data: CheckoutPayload,
  paymentMethod: PaymentMethod = "card_mercadopago"
): Promise<CheckoutResponse> => {
  try {
    const token = localStorage.getItem("token");

    const endpointMap: Record<PaymentMethod, string> = {
      pix: `${API_BASE_URL}/checkout/pix`,
      card_mercadopago: `${API_BASE_URL}/checkout/mercadopago`,
    };

    const res = await fetch(endpointMap[paymentMethod], {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    const result = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new CheckoutError(result?.message || "Erro ao iniciar checkout", {
        status: res.status,
        code: result?.code,
        items: Array.isArray(result?.items) ? result.items : [],
      });
    }

    if (paymentMethod === "pix") {
      if (result?.type === "pix" && result?.url) return result;
      if (result?.url) return { type: "pix", url: result.url, ...result };
      return result;
    }

    if (paymentMethod === "card_mercadopago") {
      if (result?.type === "card" && result?.url) {
        return { ...result, provider: "mercadopago" };
      }
      if (result?.url) {
        return { type: "card", provider: "mercadopago", url: result.url, orderId: result.orderId };
      }
      return result;
    }

    return result;
  } catch (err) {
    console.error("Erro ao iniciar checkout:", err);
    throw err;
  }
};

export const checkOrderStatus = async (transactionId: string): Promise<OrderStatusResponse> => {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_BASE_URL}/session/${transactionId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(result?.message || "Erro ao consultar o status do pedido");
    }

    return result as OrderStatusResponse;
  } catch (err) {
    console.error("Erro ao consultar o status do pedido:", err);
    throw err;
  }
};

export const syncMercadoPagoOrder = async (
  orderId: string,
  paymentId?: string | null
): Promise<{ synced: boolean; syncResult?: any; order?: any }> => {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_BASE_URL}/checkout/mercadopago/sync`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ orderId, paymentId: paymentId || undefined }),
    });

    const result = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(result?.message || "Erro ao sincronizar pagamento do Mercado Pago");
    }

    return result;
  } catch (err) {
    console.error("Erro ao sincronizar pedido do Mercado Pago:", err);
    throw err;
  }
};
