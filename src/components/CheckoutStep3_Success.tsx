import { checkOrderStatus } from "@/services/checkoutService";
import { getOrderById } from "@/services/ordersService";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";

export default function CheckoutStep3() {
  const [search] = useSearchParams();

  // Stripe
  const sessionId = search.get("session_id");

  // Pix (AbacatePay)
  const orderId = search.get("orderId") || search.get("externalId");

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // normaliza texto (lower, trim, remove acentos)
  const norm = (v: any) =>
    String(v ?? "")
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  const isPaidLike = (psRaw: any, stRaw: any, paidAt?: any) => {
    const ps = norm(psRaw);
    const st = norm(stRaw);

    return (
      ps === "succeeded" ||
      ps === "paid" ||
      ps === "concluido" ||
      ps === "aprovado" ||
      st === "paid" ||
      st === "concluido" ||
      st === "aprovado" ||
      !!paidAt
    );
  };

  const isFailedLike = (psRaw: any, stRaw: any) => {
    const ps = norm(psRaw);
    const st = norm(stRaw);

    return (
      ps === "failed" ||
      ps === "error" ||
      ps === "canceled" ||
      ps === "cancelled" ||
      ps === "falhou" ||
      ps === "recusado" ||
      ps === "expirado" ||
      st === "failed" ||
      st === "error" ||
      st === "canceled" ||
      st === "cancelled" ||
      st === "falhou" ||
      st === "recusado" ||
      st === "expirado"
    );
  };

  const paid = useMemo(() => {
    if (!order) return false;
    return isPaidLike(order.payment_status, order.status, order.paid_at ?? order.paidAt);
  }, [order]);

  const failed = useMemo(() => {
    if (!order) return false;
    return isFailedLike(order.payment_status, order.status);
  }, [order]);

  const pending = useMemo(() => !!order && !paid && !failed, [order, paid, failed]);

  useEffect(() => {
    let cancelled = false;
    let intervalId: number | null = null;
    let timeoutId: number | null = null;

    const stop = () => {
      if (intervalId) window.clearInterval(intervalId);
      if (timeoutId) window.clearTimeout(timeoutId);
      intervalId = null;
      timeoutId = null;
    };

    const isDone = (data: any) => {
      return (
        isPaidLike(data?.payment_status, data?.status, data?.paid_at ?? data?.paidAt) ||
        isFailedLike(data?.payment_status, data?.status)
      );
    };

    const fetchOnce = async () => {
      try {
        if (!cancelled) {
          setError(null);
          setLoading(true);
        }

        let data: any = null;

        // Regra: se tem orderId, prioriza Pix sempre
        if (orderId) {
          data = await getOrderById(orderId);
        } else if (sessionId) {
          data = await checkOrderStatus(sessionId);
        } else {
          if (!cancelled) setError("Pedido inválido.");
          stop();
          return;
        }

        if (cancelled) return;

        // Debug (pode remover depois)
        // console.log("[CheckoutStep3] payload:", data);

        setOrder(data);

        if (isDone(data)) {
          stop();
        }
      } catch (err: any) {
        if (cancelled) return;
        setError(err?.message || "Não foi possível confirmar o pagamento.");
        stop();
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchOnce();

    // Polling
    const everyMs = orderId ? 5000 : 3000; // Pix 5s | Stripe 3s
    intervalId = window.setInterval(fetchOnce, everyMs);

    // Safety timeout
    timeoutId = window.setTimeout(() => stop(), orderId ? 60_000 : 2 * 60_000);

    return () => {
      cancelled = true;
      stop();
    };
  }, [sessionId, orderId]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl p-6 bg-white shadow-lg rounded-xl">
        {loading && <p className="text-center text-gray-600">Validando pagamento...</p>}

        {error && (
          <div className="text-center">
            <h2 className="text-xl font-semibold text-red-600 mb-2">Erro</h2>
            <p className="mb-4">{error}</p>
            <Link to="/checkout" className="text-rose-500 underline">
              Voltar ao checkout
            </Link>
          </div>
        )}

        {!loading && !error && paid && order && (
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-rose-500 mb-2">Compra confirmada</h2>
            <p className="text-gray-600 mb-4">Seu pagamento foi processado com sucesso!</p>

            <div className="bg-gray-50 p-4 rounded-md mb-6 text-sm text-gray-700">
              <p>
                <strong>Pedido:</strong> #{order.id}
              </p>
              <p>
                <strong>Status:</strong> {order.payment_status || order.status}
              </p>
              <p>
                <strong>Atualizado em:</strong>{" "}
                {order.updated_at ? new Date(order.updated_at).toLocaleString("pt-BR") : "—"}
              </p>
            </div>

            <div className="flex gap-4">
              <Link
                to="/"
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 rounded-md text-center"
              >
                Voltar à loja
              </Link>
              <Link
                to={`/order/${order.id}`}
                className="flex-1 bg-rose-500 hover:bg-rose-600 text-white font-semibold py-2 rounded-md text-center"
              >
                Ver pedido
              </Link>
            </div>
          </div>
        )}

        {!loading && !error && failed && order && (
          <div className="text-center">
            <h2 className="text-xl font-semibold text-red-600 mb-2">Pagamento não confirmado</h2>
            <p className="mb-4">O pagamento falhou ou expirou. Você pode tentar novamente.</p>

            <div className="bg-gray-50 p-4 rounded-md mb-6 text-sm text-gray-700">
              <p>
                <strong>Pedido:</strong> #{order.id}
              </p>
              <p>
                <strong>Status:</strong> {order.payment_status || order.status}
              </p>
            </div>

            <Link to="/checkout" className="text-rose-500 underline">
              Voltar ao checkout
            </Link>
          </div>
        )}

        {!loading && !error && pending && order && (
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Aguardando confirmação</h2>
            <p className="mb-4">Seu pagamento ainda está pendente. Esta página atualiza automaticamente.</p>

            <div className="bg-gray-50 p-4 rounded-md mb-6 text-sm text-gray-700">
              <p>
                <strong>Pedido:</strong> #{order.id}
              </p>
              <p>
                <strong>Status:</strong> {order.payment_status || order.status}
              </p>
            </div>

            <Link to={`/order/${order.id}`} className="text-rose-500 underline">
              Ver detalhes do pedido
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
