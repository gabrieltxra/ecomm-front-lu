// src/pages/OrderDetails.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getOrderById, Order } from "@/services/ordersService";
import { toast } from "sonner";
import { ArrowLeft, Package, Truck, Calendar, CreditCard } from "lucide-react";

const OrderDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="pt-24 text-center">
        <p>Carregando pedido...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="pt-24 text-center">
        <p>Pedido não encontrado.</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 bg-rose-400 text-white rounded-lg"
        >
          Voltar
        </button>
      </div>
    );
  }

  const formatMoney = (n: number) =>
    (n ?? 0).toFixed(2).replace(".", ",");

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-rose-50 dark:from-slate-900 dark:to-slate-800 pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-3xl">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm mb-6 text-rose-500 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar
        </button>

        <div className="bg-white dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-lg p-6 shadow-lg">
          <h1 className="text-2xl font-bold mb-4 text-rose-400">
            Pedido #{order.id}
          </h1>

          <div className="grid gap-3 text-sm mb-6">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>
                Data: {new Date(order.created_at).toLocaleString("pt-BR")}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              <span>
                Pagamento: {order.payment_method} ({order.payment_status})
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4" />
              <span>Entrega: {order.shipping_method}</span>
            </div>
          </div>

          <h2 className="font-semibold mb-2">Itens</h2>
          <ul className="space-y-1 text-sm border-t border-b py-3">
            {order.items?.map((it) => (
              <li key={it.id ?? `${it.product_id}-${it.price}`} className="flex justify-between">
                <span>
                  {it.product_name} × {it.quantity}
                </span>
                <span>R$ {formatMoney(it.price * it.quantity)}</span>
              </li>
            ))}
            {order.shipping_cost > 0 && (
              <li className="flex justify-between">
                <span>Frete</span>
                <span>R$ {formatMoney(order.shipping_cost)}</span>
              </li>
            )}
          </ul>

          <div className="text-right mt-4 font-bold text-lg">
            Total: R$ {formatMoney(order.total + order.shipping_cost)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
