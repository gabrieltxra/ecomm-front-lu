// src/services/supportTicketsService.ts

export type SupportTicketStatus = "open" | "in_progress" | "resolved" | "closed";

export interface ContactValues {
  email?: string;
  phone?: string;
  whatsapp?: string;
  [key: string]: any;
}

export interface SupportTicket {
  id?: number;
  user_id: number;
  order_id?: string | null;
  message: string;
  contact_values: ContactValues;
  status: SupportTicketStatus;
  created_at: string;
  updated_at?: string | null;
  closed_at?: string | null;
}

const statusMap: Record<string, SupportTicketStatus> = {
  open: "open",
  in_progress: "in_progress",
  resolved: "resolved",
  closed: "closed",
};

const API_BASE_URL =
  import.meta.env.VITE_REACT_APP_API_URL || "http://localhost:3000";

function isoMinus3(rawDate: any): string | null {
  if (!rawDate) return null;
  const d = new Date(rawDate);
  if (Number.isNaN(d.getTime())) return null;
  d.setHours(d.getHours() - 3);
  return d.toISOString();
}

function normalizeSupportTicket(raw: any): SupportTicket {
  return {
    id: raw.id != null ? Number(raw.id) : undefined,
    user_id: Number(raw.user_id),
    order_id: raw.order_id ? String(raw.order_id) : null,
    message: String(raw.message ?? ""),
    contact_values:
      raw.contact_values && typeof raw.contact_values === "object"
        ? raw.contact_values
        : {},
    status: statusMap[String(raw.status)] || "open",
    created_at: isoMinus3(raw.created_at) ?? new Date().toISOString(),
    updated_at: isoMinus3(raw.updated_at),
    closed_at: isoMinus3(raw.closed_at),
  };
}

function authHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export async function createSupportTicket(payload: {
  order_id?: string | null;
  message: string;
  contact_values: ContactValues;
}): Promise<SupportTicket> {
  const body = {
    order_id: payload.order_id ? String(payload.order_id) : null, 
    message: payload.message,
    contact_values: payload.contact_values,
  };

  const res = await fetch(`${API_BASE_URL}/supportTicket`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    let msg = "Erro ao criar support ticket";
    try {
      const data = await res.json();
      msg = data?.message || data?.error || msg;
    } catch {
      const text = await res.text().catch(() => "");
      if (text) msg = text;
    }
    throw new Error(msg);
  }

  const data = await res.json();
  const raw = data?.ticket ?? data;
  return normalizeSupportTicket(raw);
}

export async function getSupportTicketByOrderId(
  orderId: string
): Promise<SupportTicket | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/supportTicket/${orderId}`, {
      method: "GET",
      headers: authHeaders(),
    });

    if (res.status === 404) return null;

    if (!res.ok) {
      const msg = await res.text().catch(() => "");
      throw new Error(msg || "Erro ao buscar support ticket");
    }

    const data = await res.json();
    const raw = data?.ticket ?? data;
    return normalizeSupportTicket(raw);
  } catch (err) {
    console.error("Erro ao buscar support ticket:", err);
    return null;
  }
}
