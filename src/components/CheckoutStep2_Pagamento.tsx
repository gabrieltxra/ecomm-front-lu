import { iniciarCheckout } from "@/services/checkoutService";

export default function CheckoutStep2({ onNext, onBack, updateData, data }: any) {
  const handlePagamento = async () => {
    try {
      const checkoutData = {
        cart: data.cart,
        shipping_address: {
          cep: data.endereco.cep,
          street: data.endereco.rua,
          number: data.endereco.numero,
          city: data.endereco.cidade || "São Paulo", // futuro: viaCep
          state: data.endereco.estado || "SP",
          phone: data.endereco.telefone,
        },
        shipping: {
          method: data.frete.name,
          cost: data.frete.price,
          estimated_delivery: `${data.frete.delivery_time.days} dias`,
        },
      };

      const url = await iniciarCheckout(checkoutData);
      window.location.href = url; // Redireciona para a Stripe
    } catch (err) {
      console.error("Erro ao iniciar pagamento:", err);
      alert("Erro ao iniciar pagamento.");
    }
  };

  const isRetirada =
    data.method === "retirar" ||
    data.frete?.id === "retirar" ||
    (data.frete?.name || "").toLowerCase().includes("retirada");

  const formatBRL = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const subtotal =
    data.cart?.reduce((acc: number, it: any) => acc + it.price * it.quantity, 0) || 0;
  const frete = Number(data?.frete?.price || 0);
  const total = subtotal + frete;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      {/* Step indicator */}
      <div className="flex items-center justify-center mb-6 w-full max-w-2xl">
        <div className="flex items-center w-full">
          <div className="w-8 h-8 bg-rose-200 text-gray-500 rounded-full flex items-center justify-center">1</div>
          <div className="flex-1 h-1 bg-rose-200 mx-2"></div>
          <div className="w-8 h-8 bg-rose-500 text-white rounded-full flex items-center justify-center font-bold">2</div>
          <div className="flex-1 h-1 bg-rose-200 mx-2"></div>
          <div className="w-8 h-8 bg-rose-200 text-gray-500 rounded-full flex items-center justify-center">3</div>
        </div>
      </div>

      <div className="w-full max-w-2xl p-6 bg-white shadow-lg rounded-xl">
        <h2 className="text-2xl font-semibold text-rose-300 mb-4">Revisar e pagar</h2>

        {/* Resumo do pedido */}
        <div className="border rounded-lg p-4 mb-3 text-sm text-gray-700">
          <h3 className="font-semibold mb-2">Resumo do pedido</h3>

          <ul className="divide-y">
            {data.cart?.map((item: any) => (
              <li key={item.id} className="flex justify-between py-1">
                <span>
                  {item.name} (x{item.quantity})
                </span>
                <span>{formatBRL(item.price * item.quantity)}</span>
              </li>
            ))}
          </ul>

          <div className="flex justify-between mt-2">
            <span>Frete ({data.frete?.name || "—"})</span>
            <span>{formatBRL(frete)}</span>
          </div>

          <div className="flex justify-between font-bold mt-2">
            <span>Total</span>
            <span>{formatBRL(total)}</span>
          </div>

          {data.frete?.delivery_time?.days && (
            <p className="text-xs text-gray-500 mt-1">
              Prazo estimado: {data.frete.delivery_time.days} dias úteis
            </p>
          )}
        </div>

        {/* Endereço de entrega */}
        {isRetirada ? (
          <div className="border rounded-lg p-4 mb-4 text-sm text-gray-700">
            <h3 className="font-semibold mb-2">Retirada no local</h3>
            <div>Lu Cortinas Ateliê — Rua Jurunas, 398, Santa Bárbara d'Oeste - SP</div>
            <div>CEP: 13457-038 • Tel: (19) 99189-3513</div>
          </div>
        ) : (
          data.endereco && (
            <div className="border rounded-lg p-4 mb-4 text-sm text-gray-700">
              <h3 className="font-semibold mb-2">Endereço de entrega</h3>
              <div className="space-y-0.5">
                <div>
                  {data.endereco.rua || "Rua não informada"},{" "}
                  {data.endereco.numero || "s/n"}
                </div>
                <div>
                  {(data.endereco.cidade || "São Paulo")} - {(data.endereco.estado || "SP")}
                </div>
                <div>CEP: {data.endereco.cep || "—"}</div>
                <div>Telefone: {data.endereco.telefone || "—"}</div>
              </div>
            </div>
          )
        )}

        <p className="text-gray-600 mb-4">
          Clique em <strong>“Finalizar pagamento”</strong> para ser redirecionado à página segura da Stripe,
          onde você poderá escolher entre PIX, Cartão, Boleto e outros.
        </p>

        {/* Botões de ação */}
        <div className="flex gap-4">
          <button
            onClick={onBack}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 rounded-md transition"
          >
            Voltar
          </button>
          <button
            onClick={handlePagamento}
            className="flex-1 bg-rose-300 hover:bg-rose-600 text-white font-semibold py-2 rounded-md transition"
          >
            Finalizar pagamento
          </button>
        </div>
      </div>
    </div>
  );
}
