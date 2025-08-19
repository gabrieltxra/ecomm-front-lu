import { checkOrderStatus } from "@/services/checkoutService";
import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";

const BRL = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function CheckoutStep3() {
  const [search] = useSearchParams();
  const sessionId = search.get("session_id");

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        if (!sessionId) {
          setError("Sessão inválida.");
          setLoading(false);
          return;
        }

        const data = await checkOrderStatus(sessionId);
        setOrder(data);
      } catch (err: any) {
        setError("Não foi possível confirmar o pagamento.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [sessionId]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      {/* Step indicator */}
      <div className="flex items-center justify-center mb-6 w-full max-w-2xl">
        <div className="flex items-center w-full">
          <div className="w-8 h-8 bg-rose-200 text-gray-500 rounded-full flex items-center justify-center">1</div>
          <div className="flex-1 h-1 bg-rose-200 mx-2"></div>
          <div className="w-8 h-8 bg-rose-200 text-gray-500 rounded-full flex items-center justify-center">2</div>
          <div className="flex-1 h-1 bg-rose-200 mx-2"></div>
          <div className="w-8 h-8 bg-rose-500 text-white rounded-full flex items-center justify-center font-bold">3</div>
        </div>
      </div>

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
        {!loading && !error && order && (
          <>
            <h2 className="text-2xl font-semibold text-rose-500 mb-2">Compra confirmada 🎉</h2>
            <p className="text-gray-600 mb-4">
              Seu pagamento foi processado com sucesso!
            </p>

            <div className="bg-gray-50 p-4 rounded-md mb-6 text-sm text-gray-700">
              <p><strong>Pedido:</strong> #{order.id}</p>
              <p><strong>Status:</strong> {order.status}</p>
              <p><strong>Pagamento:</strong> {order.payment_status}</p>
              <p><strong>Total pago:</strong> {BRL(order.amount_paid / 100)} {order.currency?.toUpperCase()}</p>
              <p><strong>Atualizado em:</strong> {new Date(order.updated_at).toLocaleString("pt-BR")}</p>
            </div>

            <div className="flex gap-4">
              <Link
                to="/"
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 rounded-md text-center"
              >
                Voltar à loja
              </Link>
              <Link
                to={`/orders/${order.id}`}
                className="flex-1 bg-rose-500 hover:bg-rose-600 text-white font-semibold py-2 rounded-md text-center"
              >
                Ver pedido
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
