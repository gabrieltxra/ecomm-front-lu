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
