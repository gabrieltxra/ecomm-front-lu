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
          city: "São Paulo", // pode puxar do viaCep futuramente
          state: "SP",
          phone: data.endereco.telefone,
        },
        shipping: {
          method: data.frete.name,
          cost: data.frete.price,
          estimated_delivery: `${data.frete.delivery_time.days} dias`,
        }
      };

      const url = await iniciarCheckout(checkoutData);

      window.location.href = url; // Redireciona para a Stripe
    } catch (err) 
    {
      console.error("Erro ao iniciar pagamento:", err);
      alert("Erro ao iniciar pagamento.");
    }
  };

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
        <p className="text-gray-600 mb-4">
          Clique em <strong>“Finalizar pagamento”</strong> para ser redirecionado à página segura da Stripe, onde você poderá escolher entre PIX, Cartão, Boleto e outros.
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
