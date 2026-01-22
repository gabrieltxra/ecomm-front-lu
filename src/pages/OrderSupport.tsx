import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Phone } from "lucide-react";
import { toast } from "sonner";

import { getOrderById, Order } from "@/services/ordersService";

const WHATSAPP_NUMBER = "5519991893513";

export default function OrderSupport() {
  const { id } = useParams<{ id: string }>(); // orderId
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        if (!id) return;
        const data = await getOrderById(id);
        setOrder(data);
      } catch (e: any) {
        toast.error(e?.message || "Erro ao carregar pedido");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  const waLink = useMemo(() => {
    if (!order?.id) return `https://wa.me/${WHATSAPP_NUMBER}`;
    const msg = `Olá! Preciso de suporte no pedido #${order.id}.`;
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
  }, [order?.id]);

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-3 h-10 w-10 rounded-full border-2 border-rose-200 border-t-rose-500 animate-spin" />
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Carregando...
          </p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900">
          <p className="text-slate-700 dark:text-slate-200">Pedido não encontrado.</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-rose-500 px-4 py-2.5 text-white hover:bg-rose-600 transition"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-rose-50 dark:from-slate-950 dark:to-slate-900 pt-20 pb-16">
      <div className="container mx-auto px-4 max-w-2xl">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm mb-6 text-rose-600 hover:text-rose-700 dark:text-rose-300 dark:hover:text-rose-200"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar
        </button>

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/5">
          <div className="p-6 md:p-8">
            <h1 className="text-2xl md:text-3xl font-semibold text-slate-900 dark:text-white">
              Suporte
            </h1>

            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Para suporte/devolução, fale com a gente no WhatsApp e envie o ID do pedido:
              <span className="font-semibold text-slate-900 dark:text-white">
                {" "}
                #{order.id}
              </span>
              .
            </p>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/5">
              <p className="text-sm text-slate-700 dark:text-slate-200">
                Mensagem pronta pra enviar:
              </p>
              <div className="mt-3 rounded-xl bg-white p-4 text-sm text-slate-900 ring-1 ring-slate-200 dark:bg-slate-950/40 dark:text-white dark:ring-white/10">
                Olá! Preciso de suporte no pedido <b>#{order.id}</b>.
              </div>

              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 flex items-center justify-center md:justify-end space-x-3 text-slate-600 dark:text-slate-300 hover:text-rose-500 dark:hover:text-rose-400 transition-colors font-medium group"
                aria-label="Entre em contato via WhatsApp"
              >
                <Phone className="h-5 w-5 group-hover:scale-110 transition-transform" />
                <span>+55 19 99189-3513</span>
              </a>
            </div>

            <div className="mt-8 flex items-center justify-end">
              <button
                onClick={() => navigate(`/order/${order.id}`)}
                className="text-sm text-rose-600 hover:text-rose-700 dark:text-rose-300 dark:hover:text-rose-200"
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
