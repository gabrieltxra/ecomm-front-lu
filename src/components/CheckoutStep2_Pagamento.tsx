import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckoutError, CheckoutPayload, PaymentMethod, iniciarCheckout } from "@/services/checkoutService";
import { useMemo, useState } from "react";
import CachedImage from "@/components/CachedImage";
import { getOptimizedImageUrl } from "@/lib/productImages";

function formatCheckoutError(err: unknown) {
  if (err instanceof Error && err.message) {
    return err.message;
  }

  return "Erro ao iniciar pagamento.";
}

export default function CheckoutStep2({ onBack, updateData, data }: any) {
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("pix");
  const [stockErrorOpen, setStockErrorOpen] = useState(false);
  const [stockErrorItems, setStockErrorItems] = useState<CheckoutError["items"]>([]);
  const cartItems = Array.isArray(data?.cart) ? data.cart : [];

  const isRetirada =
    data?.method === "retirar" ||
    data?.frete?.id === "retirar" ||
    (data?.frete?.name || "").toLowerCase().includes("retirada");

  const formatBRL = (v: number) =>
    Number(v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const subtotal = useMemo(() => {
    const items = Array.isArray(data?.cart) ? data.cart : [];
    return items.reduce((acc: number, it: any) => {
      const price = Number(it?.price ?? it?.preco ?? 0);
      const qty = Number(it?.quantity ?? it?.quantidade ?? 1);
      if (!Number.isFinite(price) || !Number.isFinite(qty) || qty <= 0) return acc;
      return acc + price * qty;
    }, 0);
  }, [data]);

  const frete = useMemo(() => {
    if (isRetirada) return 0;
    const v = Number(data?.frete?.price ?? 0);
    return Number.isFinite(v) ? v : 0;
  }, [data, isRetirada]);

  const total = useMemo(() => subtotal + frete, [subtotal, frete]);

  const deliveryDays = useMemo(() => {
    if (isRetirada) return 0;
    const raw = data?.frete?.delivery_time;
    const d = typeof raw === "number" ? raw : typeof raw?.days === "number" ? raw.days : Number(raw ?? 0);
    return Number.isFinite(d) ? d : 0;
  }, [data, isRetirada]);

  const cartOk = useMemo(() => {
    const items = Array.isArray(data?.cart) ? data.cart : [];
    return items.length > 0;
  }, [data]);

  const cepOk = useMemo(() => {
    const cep = String(data?.endereco?.cep || "").trim();
    return cep.replace(/\D/g, "").length === 8;
  }, [data]);

  const numeroOk = useMemo(() => String(data?.endereco?.numero || "").trim().length > 0, [data]);

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

  const buildCheckoutData = (): CheckoutPayload => {
    const items = Array.isArray(data?.cart) ? data.cart : [];
    const cepStr = String(data?.endereco?.cep || "").trim();
    const cepClean = cepStr.replace(/\D/g, "");
    const cepFormatted = cepClean.length === 8 ? `${cepClean.slice(0, 5)}-${cepClean.slice(5)}` : cepStr;

    if (isRetirada) {
      return {
        cart: items.map((item: any) => ({ id: String(item.id), quantity: Number(item.quantity) })),
        shipping_address: {
          cep: "",
          street: "",
          number: "",
          city: "",
          state: "",
          phone: "",
        },
        shipping: {
          mode: "pickup",
        },
      };
    }

    return {
      cart: items.map((item: any) => ({ id: String(item.id), quantity: Number(item.quantity) })),
      shipping_address: {
        cep: cepFormatted,
        street: data?.endereco?.rua || "",
        number: data?.endereco?.numero || "",
        city: data?.endereco?.cidade || "",
        state: data?.endereco?.estado || "",
        phone: data?.endereco?.telefone || "",
      },
      shipping: {
        mode: "delivery",
        quote_token: data?.frete?.quote_token,
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
      setStockErrorOpen(false);
      setStockErrorItems([]);
      const checkoutData = buildCheckoutData();

      updateData?.({
        subtotal,
        total,
        payment_method: paymentMethod,
      });

      const result: any = await iniciarCheckout(checkoutData, paymentMethod);

      if ((result?.type === "card" || result?.type === "pix") && result?.url) {
        window.location.href = result.url;
        return;
      }

      throw new Error("Resposta inesperada do checkout.");
    } catch (err) {
      console.error("Erro ao iniciar pagamento:", err);

      if (err instanceof CheckoutError && err.code === "INSUFFICIENT_STOCK") {
        setStockErrorItems(Array.isArray(err.items) ? err.items : []);
        setStockErrorOpen(true);
        return;
      }

      alert(formatCheckoutError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={stockErrorOpen} onOpenChange={setStockErrorOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Estoque atualizado</DialogTitle>
            <DialogDescription>
              Alguns itens do seu pedido nao estao mais disponiveis na quantidade solicitada.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            {(stockErrorItems ?? []).length > 0 ? (
              stockErrorItems?.map((item) => (
                <div key={item.id} className="rounded-lg border border-rose-100 bg-rose-50 p-3 text-sm text-gray-700">
                  <div className="font-medium text-gray-900">{item.name}</div>
                  <div>Solicitado: {item.requested}</div>
                  <div>Disponivel: {item.stock}</div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-600">Revise o carrinho antes de continuar.</p>
            )}
          </div>

          <DialogFooter>
            <button
              type="button"
              onClick={() => setStockErrorOpen(false)}
              className="w-full rounded-md bg-rose-300 px-4 py-2 font-semibold text-white transition hover:bg-rose-600 sm:w-auto"
            >
              Entendi
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="min-h-screen w-full overflow-x-hidden px-3 pb-28 pt-24 sm:px-4 lg:px-6">
        <div className="mx-auto mb-5 flex w-full max-w-2xl items-center justify-center sm:mb-6">
          <div className="flex items-center w-full">
            <div className="w-8 h-8 bg-rose-200 text-gray-500 rounded-full flex items-center justify-center">1</div>
            <div className="flex-1 h-1 bg-rose-200 mx-2"></div>
            <div className="w-8 h-8 bg-rose-500 text-white rounded-full flex items-center justify-center font-bold">2</div>
            <div className="flex-1 h-1 bg-rose-200 mx-2"></div>
            <div className="w-8 h-8 bg-rose-200 text-gray-500 rounded-full flex items-center justify-center">3</div>
          </div>
        </div>

        <div className="mx-auto w-full max-w-5xl overflow-hidden rounded-2xl bg-white p-4 shadow-lg sm:rounded-3xl sm:p-6 md:p-8">
          <h2 className="mb-4 text-2xl font-semibold text-rose-300 sm:text-3xl">Revisar e pagar</h2>

          <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(280px,1fr)] lg:items-start">
            <div className="min-w-0 space-y-4">
              <div className="min-w-0 rounded-2xl border border-rose-100 bg-rose-50/40 p-3 text-sm text-gray-700 sm:p-4 md:p-5">
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-900">Resumo do pedido</h3>
                    <p className="text-xs text-gray-500">Confira os itens antes de seguir para o pagamento.</p>
                  </div>
                  <div className="w-fit rounded-full bg-white px-3 py-1 text-xs font-medium text-rose-400 shadow-sm">
                    {cartItems.length} {cartItems.length === 1 ? "item" : "itens"}
                  </div>
                </div>

                <div className="space-y-3">
                  {cartItems.map((item: any) => {
                    const imageUrl = Array.isArray(item?.image_urls) ? item.image_urls[0] : undefined;
                    const quantity = Number(item?.quantity ?? 0);
                    const price = Number(item?.price ?? 0);

                    return (
                      <div key={item.id} className="flex min-w-0 gap-3 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-rose-100">
                        <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-rose-100 text-xs font-medium text-rose-400">
                          {imageUrl ? (
                            <CachedImage
                              src={getOptimizedImageUrl(imageUrl, { width: 160, height: 160, quality: 68 })}
                              fallbackSrc={imageUrl}
                              alt={item.name}
                              className="h-full w-full object-cover"
                              loading="lazy"
                              decoding="async"
                              width={160}
                              height={160}
                            />
                          ) : (
                            <span>Sem imagem</span>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0">
                              <h4 className="line-clamp-2 break-words font-semibold leading-snug text-gray-900">{item.name}</h4>
                              <p className="text-xs text-gray-500">Quantidade: {quantity}</p>
                              <p className="text-xs text-gray-500">Unitário: {formatBRL(price)}</p>
                            </div>
                            <div className="shrink-0 text-sm font-semibold text-gray-900">
                              {formatBRL(price * quantity)}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {isRetirada ? (
                <div className="min-w-0 rounded-2xl border p-4 text-sm text-gray-700 md:p-5">
                  <h3 className="mb-2 font-semibold text-gray-900">Retirada no local</h3>
                  <div className="break-words">Lu Cortinas Ateliê — Rua Jurunas, 398, Santa Bárbara d'Oeste - SP</div>
                  <div className="break-words">CEP: 13457-038 • Tel: (19) 99189-3513</div>
                  <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 shadow-sm">
                    <div className="mb-1 font-semibold uppercase tracking-wide text-amber-700">Aviso de retirada</div>
                    <p className="break-words">
                      Entraremos em contato para avisar quando seu pedido estiver disponível para retirada.
                    </p>
                  </div>
                </div>
              ) : (
                data?.endereco && (
                  <div className="min-w-0 rounded-2xl border p-4 text-sm text-gray-700 md:p-5">
                    <h3 className="mb-2 font-semibold text-gray-900">Endereço de entrega</h3>
                    <div className="space-y-0.5">
                      <div className="break-words">{data.endereco.rua || "Rua não informada"}, {data.endereco.numero || "s/n"}</div>
                      <div className="break-words">{data.endereco.cidade || "Cidade não informada"} - {data.endereco.estado || "Estado não informado"}</div>
                      {data.endereco.bairro && <div className="break-words">Bairro: {data.endereco.bairro}</div>}
                      <div className="break-words">CEP: {data.endereco.cep || "—"}</div>
                      <div className="break-words">Telefone: {data.endereco.telefone || "—"}</div>
                    </div>
                  </div>
                )
              )}
            </div>

            <div className="min-w-0 space-y-4 lg:sticky lg:top-24">
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 md:p-5">
                <h3 className="mb-4 font-semibold text-gray-900">Resumo financeiro</h3>

                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <span>Subtotal</span>
                    <span className="shrink-0 font-medium">{formatBRL(subtotal)}</span>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <span>Frete</span>
                    <span className="shrink-0 font-medium">{formatBRL(frete)}</span>
                  </div>

                  {!isRetirada && deliveryDays > 0 && (
                    <div className="rounded-xl bg-white px-3 py-2 text-xs text-gray-500 ring-1 ring-gray-200">
                      Prazo estimado: {deliveryDays} dias úteis
                    </div>
                  )}

                  <div className="border-t border-dashed border-gray-300 pt-3">
                    <div className="flex items-center justify-between gap-3 text-base font-semibold text-gray-900">
                      <span>Total</span>
                      <span className="shrink-0">{formatBRL(total)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border p-4 text-sm text-gray-700 md:p-5">
                <h3 className="mb-2 font-semibold text-gray-900">Forma de pagamento</h3>
                <div className="flex flex-col gap-3">
                  <label className="flex min-w-0 cursor-pointer items-start gap-3 rounded-xl border p-3 transition hover:bg-gray-50">
                    <input className="mt-1 shrink-0" type="radio" name="paymentMethod" value="pix" checked={paymentMethod === "pix"} onChange={() => setPaymentMethod("pix")} />
                    <div className="min-w-0">
                      <div className="font-semibold">Pix</div>
                      <div className="text-xs text-gray-500">Você será redirecionado para pagar via Pix</div>
                    </div>
                  </label>

                  <label className="flex min-w-0 cursor-pointer items-start gap-3 rounded-xl border p-3 transition hover:bg-gray-50">
                    <input className="mt-1 shrink-0" type="radio" name="paymentMethod" value="card_mercadopago" checked={paymentMethod === "card_mercadopago"} onChange={() => setPaymentMethod("card_mercadopago")} />
                    <div className="min-w-0">
                      <div className="font-semibold">Cartão de crédito</div>
                      <div className="text-xs text-gray-500">Você será redirecionado para o Mercado Pago</div>
                    </div>
                  </label>
                </div>
              </div>

              <div className="rounded-2xl bg-gray-900 p-4 text-sm text-gray-100 md:p-5">
                <p className="mb-4 text-gray-200">Clique em <strong>“Finalizar pagamento”</strong> para continuar.</p>

                <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                  <button
                    onClick={onBack}
                    disabled={loading}
                    className="min-h-11 flex-1 rounded-md bg-white/10 px-4 py-2 font-semibold text-white transition hover:bg-white/20 disabled:opacity-60"
                  >
                    Voltar
                  </button>

                  <button
                    onClick={handlePagamento}
                    disabled={!canPay}
                    className="min-h-11 flex-1 rounded-md bg-rose-300 px-4 py-2 font-semibold text-white transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? "Processando..." : paymentMethod === "pix" ? "Ir para o Pix" : "Ir para pagamento"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
