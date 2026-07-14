import { checkOrderStatus, syncMercadoPagoOrder } from "@/services/checkoutService";
import { getOrderById } from "@/services/ordersService";
import { formatDateTimeBr } from "@/utils/dateTime";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";

type Variant = "success" | "pending" | "error";

type Props = {
  variant: Variant;
};

function norm(v: any) {
  return String(v ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function isReviewLike(order: any) {
  return norm(order?.payment_status) === "review" || norm(order?.status) === "payment_review";
}

function isPaidLike(order: any) {
  if (isReviewLike(order)) return false;
  const ps = norm(order?.payment_status);
  const st = norm(order?.status);
  return ["succeeded", "paid", "pago", "concluido", "aprovado"].includes(ps)
    || ["succeeded", "paid", "pago", "concluido", "aprovado"].includes(st)
    || Boolean(order?.paid_at || order?.paidAt);
}

function isFailedLike(order: any) {
  const ps = norm(order?.payment_status);
  const st = norm(order?.status);
  return [ps, st].some((value) => ["failed", "error", "canceled", "cancelled", "falhou", "recusado"].includes(value));
}

function isExpiredLike(order: any) {
  const ps = norm(order?.payment_status);
  const st = norm(order?.status);
  return ps === "expired" || st === "expired" || st === "expirado";
}

function getFriendlyStatus(order: any) {
  if (isReviewLike(order)) return "Pagamento recebido, aguardando conferencia";
  if (!order) return "Aguardando atualização";
  if (isPaidLike(order)) return "Pagamento aprovado";
  if (isExpiredLike(order)) return "Pagamento expirado";
  if (isFailedLike(order)) return "Pagamento não confirmado";

  const paymentMethod = norm(order?.payment_method);
  if (paymentMethod.includes("parcelado")) {
    return "Pagamento parcelado aguardando confirmação";
  }

  return "Pagamento pendente de confirmação";
}

function buildQuery(params: URLSearchParams) {
  const next = new URLSearchParams();
  const orderId = params.get("orderId") || params.get("externalId");
  const provider = params.get("provider");
  const sessionId = params.get("session_id");
  const paymentId = params.get("payment_id") || params.get("collection_id");
  const merchantOrderId = params.get("merchant_order_id");
  const status = params.get("status");

  if (orderId) next.set("orderId", orderId);
  if (provider) next.set("provider", provider);
  if (sessionId) next.set("session_id", sessionId);
  if (paymentId) next.set("payment_id", paymentId);
  if (merchantOrderId) next.set("merchant_order_id", merchantOrderId);
  if (status) next.set("status", status);

  return next.toString();
}

export default function CheckoutStatusPage({ variant }: Props) {
  const [search] = useSearchParams();
  const navigate = useNavigate();
  const redirectedRef = useRef(false);

  const sessionId = search.get("session_id");
  const orderId = search.get("orderId") || search.get("externalId");
  const provider = norm(search.get("provider"));
  const paymentId = search.get("payment_id") || search.get("collection_id");
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const mercadoPagoSyncAttemptedRef = useRef(false);

  const paid = useMemo(() => isPaidLike(order), [order]);
  const expired = useMemo(() => isExpiredLike(order), [order]);
  const failed = useMemo(() => isFailedLike(order), [order]);
  const pending = useMemo(() => !!order && !paid && !failed && !expired, [order, paid, failed, expired]);

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

    const fetchOnce = async () => {
      try {
        if (!cancelled) {
          setLoading(true);
          setError(null);
        }

        let data: any = null;
        if (orderId) {
          if (provider === "mercadopago" && !mercadoPagoSyncAttemptedRef.current) {
            mercadoPagoSyncAttemptedRef.current = true;
            try {
              await syncMercadoPagoOrder(orderId, paymentId);
            } catch {
              // A consulta do pedido abaixo ainda pode refletir uma atualização via webhook.
            }
          }

          data = await getOrderById(orderId);
        } else if (sessionId) {
          data = await checkOrderStatus(sessionId);
        } else {
          throw new Error("Pedido inválido.");
        }

        if (cancelled) return;
        setOrder(data);

        if (!data) {
          throw new Error("Pedido não encontrado.");
        }

        const query = buildQuery(search);

        if (!redirectedRef.current && isPaidLike(data) && variant !== "success") {
          redirectedRef.current = true;
          stop();
          navigate(`/success${query ? `?${query}` : ""}`, { replace: true });
          return;
        }

        if (!redirectedRef.current && isFailedLike(data) && variant !== "error") {
          redirectedRef.current = true;
          stop();
          navigate(`/checkout/error${query ? `?${query}` : ""}`, { replace: true });
          return;
        }

        if (!redirectedRef.current && isExpiredLike(data) && variant !== "error") {
          redirectedRef.current = true;
          stop();
          navigate(`/checkout/error${query ? `?${query}` : ""}`, { replace: true });
          return;
        }

        if (!redirectedRef.current && !isPaidLike(data) && !isFailedLike(data) && !isExpiredLike(data) && variant === "success") {
          redirectedRef.current = true;
          stop();
          navigate(`/checkout/pending${query ? `?${query}` : ""}`, { replace: true });
          return;
        }

        if (isPaidLike(data) || isFailedLike(data) || isExpiredLike(data)) {
          stop();
        }
      } catch (err: any) {
        if (cancelled) return;
        setError(err?.message || "Não foi possível consultar o pagamento.");
        stop();
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchOnce();

    if (variant !== "error") {
      const everyMs = orderId ? 5000 : 3000;
      intervalId = window.setInterval(fetchOnce, everyMs);
      timeoutId = window.setTimeout(() => stop(), variant === "pending" ? 2 * 60_000 : 60_000);
    }

    return () => {
      cancelled = true;
      stop();
    };
  }, [navigate, orderId, paymentId, provider, search, sessionId, variant]);

  const title = variant === "success"
    ? paid
      ? "Compra confirmada"
      : "Confirmando pagamento"
    : variant === "pending"
    ? "Aguardando confirmação"
    : expired
    ? "Pagamento expirado"
    : "Pagamento não confirmado";

  const description = variant === "success"
    ? paid
      ? "Seu pagamento foi processado com sucesso!"
      : "Estamos confirmando seu pagamento com segurança."
    : variant === "pending"
    ? "Seu pagamento ainda está em análise ou aguardando confirmação."
    : expired
    ? "O prazo para concluir este pagamento terminou. Você pode iniciar uma nova tentativa."
    : "Não foi possível confirmar o pagamento desta tentativa.";

  const friendlyStatus = useMemo(() => getFriendlyStatus(order), [order]);
  const paymentMethodLabel = useMemo(() => String(order?.payment_method || "Forma de pagamento não identificada"), [order]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl p-6 bg-white shadow-lg rounded-xl">
        {loading && <p className="text-center text-gray-600">Validando pagamento...</p>}

        {error && (
          <div className="text-center">
            <h2 className="text-xl font-semibold text-red-600 mb-2">Erro</h2>
            <p className="mb-4">{error}</p>
            <Link to="/checkout" className="text-rose-500 underline">Voltar ao checkout</Link>
          </div>
        )}

        {!loading && !error && order && (
          <div className="text-center">
            <h2 className={`text-2xl font-semibold mb-2 ${variant === "error" ? "text-red-600" : "text-rose-500"}`}>{title}</h2>
            <p className="text-gray-600 mb-4">{description}</p>

            <div className="bg-gray-50 p-4 rounded-md mb-6 text-sm text-gray-700">
              <p><strong>Pedido:</strong> #{order.id}</p>
              <p><strong>Forma de pagamento:</strong> {paymentMethodLabel}</p>
              <p><strong>Status:</strong> {friendlyStatus}</p>
              <p><strong>Atualizado em:</strong> {formatDateTimeBr(order.updated_at)}</p>
            </div>

            {paid ? (
              <div className="flex gap-4">
                <Link to="/" className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 rounded-md text-center">Voltar à loja</Link>
                <Link to={`/order/${order.id}`} className="flex-1 bg-rose-500 hover:bg-rose-600 text-white font-semibold py-2 rounded-md text-center">Ver pedido</Link>
              </div>
             ) : failed || expired ? (
               <div className="flex gap-4">
                 <Link to="/checkout" className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 rounded-md text-center">Tentar novamente</Link>
                 <Link to={`/order/${order.id}`} className="flex-1 bg-rose-500 hover:bg-rose-600 text-white font-semibold py-2 rounded-md text-center">Ver pedido</Link>
              </div>
            ) : (
              <div className="flex gap-4">
                <Link to={`/order/${order.id}`} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 rounded-md text-center">Ver pedido</Link>
                <Link to="/checkout" className="flex-1 bg-rose-500 hover:bg-rose-600 text-white font-semibold py-2 rounded-md text-center">Voltar ao checkout</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
