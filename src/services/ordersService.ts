export interface OrderItem {
  id?: string;
  order_id: string;
  product_id: string;
  product_name: string;
  product_image: string;
  quantity: number;
  price: number;
  image_url?: string;
}

export interface OrderShipping {
  status?: string | null;
  method?: string | null;
  tracking_code?: string | null;
  estimated_delivery?: string | null;
  cost?: number | null;
  updated_at?: string | null;
}

export interface Order {
  id?: string;
  user_id: number;
  status:
    | 'created'
    | 'pending_payment'
    | 'paid'
    | 'preparing_shipment'
    | 'shipped'
    | 'delivered'
    | 'cancelled'
    | 'returned'
    | 'expired';
  total: number;
  shipping_method: string;
  shipping_cost: number;
  payment_method: string;
  mp_payment_method_id?: string | null;
  payment_status: 'pending' | 'succeeded' | 'failed' | 'expired';
  stripe_session_id?: string;
  stripe_payment_intent?: string;

  nfe_pdf_url?: string | null;

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
  shipping?: OrderShipping;
}

const paymentMethodMap: Record<string, string> = {
  card: 'Cartão de Crédito à vista',
  card_installments: 'Cartão de Crédito parcelado',
  pix: 'Pix',
  boleto: 'Boleto',
};

const paymentStatusMap: Record<string, string> = {
  pending: 'Pendente',
  pending_payment: 'Pendente',
  paid: 'Pago',
  failed: 'Falhou',
  succeeded: 'Concluído',
  expired: 'Expirado',
};
const API_BASE_URL =
  import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:3000';

const legacyMercadoPagoCardMethods = new Set([
  'visa',
  'master',
  'mastercard',
  'elo',
  'amex',
  'hipercard',
  'diners',
  'discover',
  'jcb',
  'aura',
  'mercadopago',
]);

function formatMercadoPagoMethodDetail(value: string | null | undefined) {
  const normalized = String(value ?? '').trim().toLowerCase();
  if (!normalized) return null;

  const labels: Record<string, string> = {
    visa: 'Visa',
    master: 'Mastercard',
    mastercard: 'Mastercard',
    elo: 'Elo',
    amex: 'Amex',
    hipercard: 'Hipercard',
    diners: 'Diners',
    discover: 'Discover',
    jcb: 'JCB',
    aura: 'Aura',
  };

  return labels[normalized] || normalized.toUpperCase();
}

function normalizeOrder(raw: any): Order {
  const items: OrderItem[] = Array.isArray(raw.items)
    ? raw.items.map((it: any) => ({
        id: it.id,
        order_id: String(it.order_id),
        product_id: String(it.product_id),
        product_name: String(it.product_name ?? ''),
        quantity: Number(it.quantity ?? 0),
        price: Number(it.price ?? 0),
        image_url: it.image_url ? String(it.image_url) : undefined,
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

  const rawPaymentMethod = String(raw.payment_method ?? '').toLowerCase();
  const paymentMethodDetail = formatMercadoPagoMethodDetail(raw.mp_payment_method_id);
  const legacyPaymentMethodDetail = legacyMercadoPagoCardMethods.has(rawPaymentMethod)
    ? formatMercadoPagoMethodDetail(raw.payment_method)
    : null;
  const normalizedPaymentMethod = rawPaymentMethod === 'card_installments' || legacyMercadoPagoCardMethods.has(rawPaymentMethod)
    ? paymentMethodDetail
      ? `Cartão de Crédito parcelado (${paymentMethodDetail})`
      : legacyPaymentMethodDetail
      ? `Cartão de Crédito parcelado (${legacyPaymentMethodDetail})`
      : 'Cartão de Crédito parcelado'
    : paymentMethodMap[rawPaymentMethod] || raw.payment_method;

  return {
    id: raw.id?.toString(),
    user_id: Number(raw.user_id),
    status: paymentStatusMap[raw.status] || raw.status,
    nfe_pdf_url: raw.nfe_pdf_url ?? null,
    total: Number(raw.total ?? 0),
    shipping_method: String(raw.shipping_method ?? ''),
    shipping_cost: Number(raw.shipping_cost ?? 0),
    payment_method: normalizedPaymentMethod,
    mp_payment_method_id: raw.mp_payment_method_id ? String(raw.mp_payment_method_id) : null,
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
    shipping: raw.shipping
      ? {
          status: raw.shipping.status ? String(raw.shipping.status) : null,
          method: raw.shipping.method ? String(raw.shipping.method) : null,
          tracking_code: raw.shipping.tracking_code ? String(raw.shipping.tracking_code) : null,
          estimated_delivery: raw.shipping.estimated_delivery ? String(raw.shipping.estimated_delivery) : null,
          cost: raw.shipping.cost != null ? Number(raw.shipping.cost) : null,
          updated_at: raw.shipping.updated_at ? String(raw.shipping.updated_at) : null,
        }
      : undefined,
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
