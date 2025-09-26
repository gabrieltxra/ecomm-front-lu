export interface OrderItem {
  id?: string;
  order_id: string;
  product_id: string;
  product_name: string;
  product_image: string;
  quantity: number;
  price: number;
}

export interface Order {
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
  items?: OrderItem[];
}

const paymentMethodMap = {
  'card': 'Cartão de Crédito',
  'pix': 'Pix',
  'boleto': 'Boleto',
};

const paymentStatusMap = {
  'pending': 'Pendente',
  'pending_payment': 'Pendente',
  'paid': 'Pago',
  'failed': 'Falhou',
  'succeeded': 'Concluído',
};

const API_BASE_URL =
  import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:3000';

function normalizeOrder(raw: any): Order {
  const items: OrderItem[] = Array.isArray(raw.items)
    ? raw.items.map((it: any) => ({
        id: it.id,
        order_id: String(it.order_id),
        product_id: String(it.product_id),
        product_name: String(it.product_name ?? ''),
        product_image: String(it.product_image ?? ''),
        quantity: Number(it.quantity ?? 0),
        price: Number(it.price ?? 0),
      }))
    : [];

  const createdAtDate = new Date(raw.created_at);
  createdAtDate.setHours(createdAtDate.getHours() - 3);
  const created_at = createdAtDate.toISOString();

  let updated_at: string | undefined = undefined;
  if (raw.updated_at) {
    const updatedAtDate = new Date(raw.updated_at);
    updatedAtDate.setHours(updatedAtDate.getHours() - 3);
    updated_at = updatedAtDate.toISOString();
  }

  return {
    id: raw.id?.toString(),
    user_id: Number(raw.user_id),
    status: paymentStatusMap[raw.status] || raw.status,
    total: Number(raw.total ?? 0),
    shipping_method: String(raw.shipping_method ?? ''),
    shipping_cost: Number(raw.shipping_cost ?? 0),
    payment_method: paymentMethodMap[raw.payment_method] || raw.payment_method,
    payment_status: paymentStatusMap[raw.payment_status] || raw.payment_status,
    stripe_session_id: raw.stripe_session_id,
    stripe_payment_intent: raw.stripe_payment_intent,
    address: {
      cep: String(raw.address?.cep ?? ''),
      street: String(raw.address?.street ?? ''),
      number: String(raw.address?.number ?? ''),
      city: String(raw.address?.city ?? ''),
      state: String(raw.address?.state ?? ''),
      phone: String(raw.address?.phone ?? ''),
    },
    created_at,
    updated_at,
    items,
  };
}

export async function getOrderById(id: string | number): Promise<Order | null> {
  try {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE_URL}/orders/${id}`, {
      method: 'GET',
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      }
    });

    if (!res.ok) {
      const msg = await res.text();
      throw new Error(msg || 'Erro ao buscar pedido');
    }

    const data = await res.json();
    const raw = data?.order ?? data;
    return normalizeOrder(raw);
  } catch (err) {
    console.error('Erro ao buscar pedido por ID:', err);
    return null;
  }
}

export async function getUserOrders(): Promise<Order[]> {
  try {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE_URL}/orders`, {
      method: 'GET',
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      }
    });

    if (!res.ok) {
      const msg = await res.text();
      throw new Error(msg || 'Erro ao buscar pedidos do usuário');
    }

    const data = await res.json();
    return data.map(normalizeOrder);
  } catch (err) {
    console.error('Erro ao buscar pedidos do usuário:', err);
    return [];
  }
}
