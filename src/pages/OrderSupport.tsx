import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Phone } from "lucide-react";
import { toast } from "sonner";

import { getOrderById, Order } from "@/services/ordersService";

const WHATSAPP_NUMBER = "5519991893513";

export default function OrderSupport() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        if (!id) return;
        const data = await getOrderById(id);
        setOrder(data);
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Erro ao carregar pedido";
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  const waLink = useMemo(() => {
    if (!order?.id) return `https://wa.me/${WHATSAPP_NUMBER}`;
    const message = `Olá! Preciso de suporte no pedido #${order.id}.`;
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  }, [order?.id]);

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center" role="status">
        <div className="text-center">
          <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-2 border-rose-200 border-t-rose-500" />
          <p className="text-sm text-slate-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center px-4">
        <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-slate-700">Pedido não encontrado.</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 inline-flex min-h-12 w-full items-center justify-center rounded-lg bg-rose-500 px-4 text-white transition hover:bg-rose-600"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-rose-50/40 pt-20 pb-16">
      <div className="container mx-auto max-w-2xl px-4">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 inline-flex min-h-11 items-center gap-2 text-sm text-rose-600 transition hover:text-rose-700"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar
        </button>

        <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="p-6 md:p-8">
            <h1 className="text-2xl font-semibold text-slate-900 md:text-3xl">Suporte</h1>

            <p className="mt-2 text-base leading-relaxed text-slate-600">
              Para suporte ou devolução, fale com a gente pelo WhatsApp e informe o pedido{" "}
              <span className="font-semibold text-slate-900">#{order.id}</span>.
            </p>

            <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm text-slate-700">Mensagem pronta para enviar:</p>
              <div className="mt-3 rounded-lg bg-white p-4 text-sm text-slate-900 ring-1 ring-slate-200">
                Olá! Preciso de suporte no pedido <b>#{order.id}</b>.
              </div>

              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-lg bg-rose-500 px-5 font-semibold text-white transition hover:bg-rose-600"
                aria-label="Entrar em contato pelo WhatsApp"
              >
                <Phone className="h-5 w-5" />
                <span>Falar no WhatsApp</span>
              </a>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={() => navigate(`/order/${order.id}`)}
                className="min-h-11 text-sm font-medium text-rose-600 hover:text-rose-700"
              >
                Voltar ao pedido
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
