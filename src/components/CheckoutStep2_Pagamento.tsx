import { useMemo, useState } from "react";
import { iniciarCheckout } from "@/services/checkoutService";

type PaymentMethod = "pix" | "card";

export default function CheckoutStep2({ onNext, onBack, updateData, data }: any) {
  const [loading, setLoading] = useState(false);

  // método de pagamento selecionado
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("pix");

  const isRetirada =
    data?.method === "retirar" ||
    data?.frete?.id === "retirar" ||
    (data?.frete?.name || "").toLowerCase().includes("retirada");

  const formatBRL = (v: number) =>
    Number(v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  // ===== Normalização de cart/subtotal =====
  const subtotal = useMemo(() => {
    const items = Array.isArray(data?.cart) ? data.cart : [];
    return items.reduce((acc: number, it: any) => {
      const price = Number(it?.price ?? it?.preco ?? 0);
      const qty = Number(it?.quantity ?? it?.quantidade ?? 1);
      if (!Number.isFinite(price) || !Number.isFinite(qty) || qty <= 0) return acc;
      return acc + price * qty;
    }, 0);
  }, [data]);

  // ===== Normalização do frete =====
  const frete = useMemo(() => {
    if (isRetirada) return 0;
    const v = Number(data?.frete?.price ?? 0);
    return Number.isFinite(v) ? v : 0;
  }, [data, isRetirada]);

  const total = useMemo(() => subtotal + frete, [subtotal, frete]);

  // ===== Prazo (aceita number ou {days}) =====
  const deliveryDays = useMemo(() => {
    if (isRetirada) return 0;
    const raw = data?.frete?.delivery_time;
    const d =
      typeof raw === "number"
        ? raw
        : typeof raw?.days === "number"
        ? raw.days
        : Number(raw ?? 0);

    return Number.isFinite(d) ? d : 0;
  }, [data, isRetirada]);

  // ===== Validações extras (camada de segurança) =====
  const cartOk = useMemo(() => {
    const items = Array.isArray(data?.cart) ? data.cart : [];
    return items.length > 0;
  }, [data]);

  const cepOk = useMemo(() => {
    const cep = String(data?.endereco?.cep || "").trim();
    const cleaned = cep.replace(/\D/g, "");
    return cleaned.length === 8;
  }, [data]);

  const numeroOk = useMemo(() => {
    const n = String(data?.endereco?.numero || "").trim();
    return n.length > 0;
  }, [data]);

  const telefoneOk = useMemo(() => {
    const t = String(data?.endereco?.telefone || "").replace(/\D/g, "");
    return t.length >= 10;
  }, [data]);

  const enderecoOk = useMemo(() => {
    if (isRetirada) return true;
    return cepOk && numeroOk && telefoneOk;
  }, [isRetirada, cepOk, numeroOk, telefoneOk]);

  const freteOk = useMemo(() => {
    if (isRetirada) return true;
    return Number.isFinite(frete) && frete > 0;
  }, [isRetirada, frete]);

  const totalsOk = useMemo(() => {
    return Number.isFinite(subtotal) && subtotal >= 0 && Number.isFinite(total) && total >= 0;
  }, [subtotal, total]);

  const canPay = cartOk && enderecoOk && freteOk && totalsOk && !loading;

  const buildCheckoutData = () => {
    const items = Array.isArray(data?.cart) ? data.cart : [];

    const cepStr = String(data?.endereco?.cep || "").trim();
    const cepClean = cepStr.replace(/\D/g, "");
    const cepFormatted =
      cepClean.length === 8 ? `${cepClean.slice(0, 5)}-${cepClean.slice(5)}` : cepStr;
      if (isRetirada) {
        return {
          cart: items,
          shipping_address: {
            cep: "",
            street: "",
            number: "",
            city: "",
            state: "",
            phone: "",
          },
          shipping: {
            method: "Retirada no local",
            cost: 0,
            estimated_delivery: "Retirada",
          },
        };
      }

    return {
      cart: items,
      shipping_address: {
        cep: cepFormatted,
        street: data?.endereco?.rua || "",
        number: data?.endereco?.numero || "",
        city: data?.endereco?.cidade || "São Paulo",
        state: data?.endereco?.estado || "SP",
        phone: data?.endereco?.telefone || "",
      },
      shipping: {
        method: data?.frete?.name || "Envio padrão",
        cost: frete,
        estimated_delivery: deliveryDays > 0 ? `${deliveryDays} dias` : "—",
      },
    };
  };

  const handlePagamento = async () => {
    if (!canPay) {
      const msg = !cartOk
        ? "Seu carrinho está vazio."
        : !enderecoOk
        ? "Endereço inválido. Verifique CEP, número e telefone."
        : !freteOk
        ? "Frete inválido. Para entrega, selecione um frete com valor maior que R$ 0,00."
        : "Dados inválidos. Verifique o pedido.";
      alert(msg);
      return;
    }

    setLoading(true);
    try {
      const checkoutData = buildCheckoutData();

      updateData?.({
        subtotal,
        total,
        payment_method: paymentMethod,
      });

      const result: any = await iniciarCheckout(checkoutData, paymentMethod);

      // Cartão (Stripe)
      if (result?.type === "card" && result?.url) {
        window.location.href = result.url;
        return;
      }

      // Pix (AbacatePay) -> redireciona pro link que o backend já devolveu
      if (result?.type === "pix" && result?.url) {
        window.location.href = result.url;
        return;
      }

      throw new Error("Resposta inesperada do checkout.");
    } catch (err) {
      console.error("Erro ao iniciar pagamento:", err);
      alert("Erro ao iniciar pagamento.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
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

        <div className="border rounded-lg p-4 mb-3 text-sm text-gray-700">
          <h3 className="font-semibold mb-2">Resumo do pedido</h3>

          <ul className="divide-y">
            {(data?.cart || []).map((item: any) => (
              <li key={item.id} className="flex justify-between py-1">
                <span>
                  {item.name} (x{item.quantity})
                </span>
                <span>{formatBRL(Number(item.price) * Number(item.quantity))}</span>
              </li>
            ))}
          </ul>

          <div className="flex justify-between mt-2">
            <span>Frete</span>
            <span>{formatBRL(frete)}</span>
          </div>

          <div className="flex justify-between font-bold mt-2">
            <span>Total</span>
            <span>{formatBRL(total)}</span>
          </div>

          {!isRetirada && deliveryDays > 0 && (
            <p className="text-xs text-gray-500 mt-1">Prazo estimado: {deliveryDays} dias úteis</p>
          )}

          {!cartOk && <p className="text-xs text-red-500 mt-2">Carrinho vazio.</p>}
          {!isRetirada && !freteOk && (
            <p className="text-xs text-red-500 mt-2">
              Frete inválido. Para entrega, o frete precisa ser maior que R$ 0,00.
            </p>
          )}
          {!enderecoOk && !isRetirada && (
            <p className="text-xs text-red-500 mt-2">
              Endereço inválido (verifique CEP, número e telefone).
            </p>
          )}
        </div>

        {isRetirada ? (
          <div className="border rounded-lg p-4 mb-4 text-sm text-gray-700">
            <h3 className="font-semibold mb-2">Retirada no local</h3>
            <div>Lu Cortinas Ateliê — Rua Jurunas, 398, Santa Bárbara d'Oeste - SP</div>
            <div>CEP: 13457-038 • Tel: (19) 99189-3513</div>
          </div>
        ) : (
          data?.endereco && (
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

        <div className="border rounded-lg p-4 mb-4 text-sm text-gray-700">
          <h3 className="font-semibold mb-2">Forma de pagamento</h3>

          <div className="flex flex-col gap-3">
            <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="paymentMethod"
                value="pix"
                checked={paymentMethod === "pix"}
                onChange={() => setPaymentMethod("pix")}
              />
              <div>
                <div className="font-semibold">Pix</div>
                <div className="text-xs text-gray-500">Você será redirecionado para pagar via Pix</div>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="paymentMethod"
                value="card"
                checked={paymentMethod === "card"}
                onChange={() => setPaymentMethod("card")}
              />
              <div>
                <div className="font-semibold">Cartão</div>
                <div className="text-xs text-gray-500">Você será redirecionado para a Stripe</div>
              </div>
            </label>
          </div>
        </div>

        <p className="text-gray-600 mb-4">
          Clique em <strong>“Finalizar pagamento”</strong> para continuar.
        </p>

        <div className="flex gap-4">
          <button
            onClick={onBack}
            disabled={loading}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 rounded-md transition disabled:opacity-60"
          >
            Voltar
          </button>

          <button
            onClick={handlePagamento}
            disabled={!canPay}
            className="flex-1 bg-rose-300 hover:bg-rose-600 text-white font-semibold py-2 rounded-md transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Processando..." : paymentMethod === "pix" ? "Ir para o Pix" : "Ir para pagamento"}
          </button>
        </div>
      </div>
    </div>
  );
}
