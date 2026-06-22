import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useMemo, useState, useEffect, useRef } from "react";
import { getFreteData } from "@/services/freteService";
import { searchCep } from "@/services/viaCepService";

export default function CheckoutStep1({ onNext, updateData }: any) {
  const { user } = useAuth();
  const { items: cart } = useCart();

  const [modoEntrega, setModoEntrega] = useState<"retirar" | "entregar">("entregar");

  const [cep, setCep] = useState(user?.endereco?.cep || "");
  const [rua, setRua] = useState(user?.endereco?.rua || "");
  const [numero, setNumero] = useState(user?.endereco?.numero || "");
  const [observacao, setObservacao] = useState(user?.endereco?.complemento || "");
  const [bairro, setBairro] = useState(user?.endereco?.bairro || "");
  const [cidade, setCidade] = useState(user?.endereco?.cidade || "");
  const [estado, setEstado] = useState(user?.endereco?.estado || "");
  const [pais, setPais] = useState(user?.endereco?.pais || "Brasil");
  const [telefone, setTelefone] = useState(user?.telefone || "");
  const [isValid, setIsValid] = useState(false);
  const didHydrateFromProfileRef = useRef(false);
  const lastCepLookupRef = useRef<string>("");

  const [freteOptions, setFreteOptions] = useState<any[]>([]);
  const [freteSelecionado, setFreteSelecionado] = useState<any>(null);
  const [loadingFrete, setLoadingFrete] = useState(false);

  const formatCep = (value: string) => {
    const cleaned = value.replace(/\D/g, "").slice(0, 8);
    return cleaned.length > 5 ? `${cleaned.slice(0, 5)}-${cleaned.slice(5)}` : cleaned;
  };

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCep(formatCep(e.target.value));
  };

  useEffect(() => {
    if (!user || didHydrateFromProfileRef.current) return;

    const profileAddress = user.endereco;

    setCep((prev) => prev || formatCep(profileAddress?.cep || user.cep || ""));
    setRua((prev) => prev || profileAddress?.rua || user.rua || "");
    setNumero((prev) => prev || profileAddress?.numero || user.numero || "");
    setObservacao((prev) => prev || profileAddress?.complemento || user.complemento || "");
    setBairro((prev) => prev || profileAddress?.bairro || user.bairro || "");
    setCidade((prev) => prev || profileAddress?.cidade || user.cidade || "");
    setEstado((prev) => prev || profileAddress?.estado || user.estado || "");
    setPais((prev) => prev || profileAddress?.pais || user.pais || "Brasil");
    setTelefone((prev) => prev || user.telefone || "");

    didHydrateFromProfileRef.current = true;
  }, [user]);

  useEffect(() => {
    const cleanCep = cep.replace(/\D/g, "");
    if (cleanCep.length !== 8) return;
    if (lastCepLookupRef.current === cleanCep) return;

    let cancelled = false;

    const hydrateFromCep = async () => {
      try {
        const cepData = await searchCep(cleanCep);
        if (cancelled) return;

        lastCepLookupRef.current = cleanCep;
        setRua((prev) => prev || cepData.logradouro || "");
        setBairro((prev) => prev || cepData.bairro || "");
        setCidade((prev) => prev || cepData.localidade || "");
        setEstado((prev) => prev || cepData.uf || "");
      } catch {
        if (!cancelled) {
          lastCepLookupRef.current = cleanCep;
        }
      }
    };

    hydrateFromCep();

    return () => {
      cancelled = true;
    };
  }, [cep]);

  // ===== Totais =====
  const subtotal = useMemo(() => {
    return cart.reduce((acc: number, item: any) => {
      const price = Number(item.price ?? item.preco ?? 0);
      const qty = Number(item.quantity ?? item.quantidade ?? 1);
      if (!Number.isFinite(price) || !Number.isFinite(qty)) return acc;
      return acc + price * qty;
    }, 0);
  }, [cart]);

  const freteValue = useMemo(() => {
    if (modoEntrega === "retirar") return 0;
    const v = Number(freteSelecionado?.price ?? 0);
    return Number.isFinite(v) ? v : 0;
  }, [modoEntrega, freteSelecionado]);

  const total = useMemo(() => subtotal + freteValue, [subtotal, freteValue]);

  // ===== Validação: não deixa passar "entregar" com frete 0 =====
  useEffect(() => {
    const enderecoOk =
      cep.trim().length === 9 &&
      numero.trim().length > 0 &&
      telefone.trim().length >= 8;

    const freteOk =
      modoEntrega === "retirar" ||
      (!!freteSelecionado &&
        typeof freteSelecionado.price === "number" &&
        Number.isFinite(freteSelecionado.price) &&
        freteSelecionado.price > 0);

    const valid = modoEntrega === "retirar" || (enderecoOk && freteOk);

    setIsValid(valid);
  }, [cep, numero, telefone, modoEntrega, freteSelecionado]);

  // ===== Buscar frete =====
  useEffect(() => {
    const fetchFrete = async () => {
      if (modoEntrega !== "entregar") return;

      // reset quando alterna pra entregar / muda CEP inválido
      if (cep.trim().length !== 9 || cart.length === 0) {
        setFreteOptions([]);
        setFreteSelecionado(null);
        return;
      }

      setLoadingFrete(true);
      try {
        const items = cart.map((item) => ({ id: item.id, quantity: item.quantity }));
        const result = await getFreteData({ cep, items });

        const opcoesValidas = result
          .filter((op: any) => !op.error)
          .map((op: any) => ({
            id: String(op.id),
            name: op.name || "Frete",
            price: typeof op.price === "number" ? op.price : parseFloat(op.price || "0"),
            delivery_time: op.delivery_time || 0,
            quote_token: op.quote_token,
          }))
          // não aceita frete 0 / inválido para entrega
          .filter((op: any) => Number.isFinite(op.price) && op.price > 0)
          .sort((a: any, b: any) => a.price - b.price);

        setFreteOptions(opcoesValidas);
        setFreteSelecionado(opcoesValidas[0] || null);
      } catch (err) {
        console.error("Erro ao calcular frete:", err);
        setFreteOptions([]);
        setFreteSelecionado(null);
      } finally {
        setLoadingFrete(false);
      }
    };

    fetchFrete();
  }, [cep, cart, modoEntrega]);

  const handleNext = () => {
    // blindagem final: não passa entregar com frete 0
    if (modoEntrega === "entregar") {
      const price = Number(freteSelecionado?.price);
      if (!freteSelecionado || !Number.isFinite(price) || price <= 0) {
        alert("Selecione uma opção de frete válida (valor maior que R$ 0,00).");
        return;
      }
    }

    const freteFinal =
      modoEntrega === "retirar"
        ? { id: "retirar", name: "Retirada no local", price: 0, delivery_time: 0 }
        : freteSelecionado;

    updateData({
      cart,
      endereco: { cep, rua, numero, observacao, bairro, cidade, estado, pais, telefone },
      method: modoEntrega,
      frete: freteFinal,
      subtotal,
      total,
    });

    onNext();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      {/* Barra de progresso */}
      <div className="flex items-center justify-center mb-6 w-full max-w-2xl">
        <div className="flex items-center w-full">
          <div className="w-8 h-8 bg-rose-500 text-white rounded-full flex items-center justify-center font-bold">
            1
          </div>
          <div className="flex-1 h-1 bg-rose-200 mx-2"></div>
          <div className="w-8 h-8 bg-rose-200 text-gray-500 rounded-full flex items-center justify-center">
            2
          </div>
          <div className="flex-1 h-1 bg-rose-200 mx-2"></div>
          <div className="w-8 h-8 bg-rose-200 text-gray-500 rounded-full flex items-center justify-center">
            3
          </div>
        </div>
      </div>

      <div className="w-full max-w-2xl p-6 bg-white shadow-lg rounded-xl">
        <h2 className="text-2xl font-semibold text-rose-300 mb-4">Opções de entrega</h2>

        {/* Botões de modo de entrega */}
        <div className="flex gap-4 mb-6">
          <button
            className={`flex-1 py-2 rounded-md border transition ${
              modoEntrega === "retirar" ? "bg-rose-300 text-white border-rose-400" : "border-gray-300"
            }`}
            onClick={() => setModoEntrega("retirar")}
          >
            Retirar no local
          </button>
          <button
            className={`flex-1 py-2 rounded-md border transition ${
              modoEntrega === "entregar" ? "bg-rose-300 text-white border-rose-400" : "border-gray-300"
            }`}
            onClick={() => setModoEntrega("entregar")}
          >
            Entregar
          </button>
        </div>

        {/* Área dinâmica */}
        {modoEntrega === "retirar" ? (
          <div className="mb-6">
            <h4 className="font-semibold mb-2">Endereço para retirada:</h4>
            <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 shadow-sm">
              <div className="mb-1 font-semibold uppercase tracking-wide text-amber-700">Importante</div>
              <p>
                Entraremos em contato para avisar quando seu pedido estiver disponível para retirada.
              </p>
            </div>
            <iframe
              src="https://www.google.com/maps?q=13457038&output=embed"
              width="100%"
              height="300"
              style={{ border: 0 }}
              loading="lazy"
              className="rounded-lg shadow"
            ></iframe>
          </div>
        ) : (
          <div className="mb-6">
            {/* Formulário */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input value={cep} onChange={handleCepChange} placeholder="CEP" className="border rounded-md px-4 py-2" />
              <input value={rua} onChange={(e) => setRua(e.target.value)} placeholder="Rua" className="border rounded-md px-4 py-2" />
              <input value={numero} onChange={(e) => setNumero(e.target.value)} placeholder="Número" className="border rounded-md px-4 py-2" />
              <input
                value={observacao}
                onChange={(e) => setObservacao(e.target.value)}
                placeholder="Complemento"
                className="border rounded-md px-4 py-2 col-span-full"
              />
              <input
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                placeholder="Telefone com DDD"
                className="border rounded-md px-4 py-2 col-span-full"
              />
            </div>

            {/* Lista de opções de frete */}
            {loadingFrete && <p>Carregando opções...</p>}

            {!loadingFrete && freteOptions.length === 0 && cep.trim().length === 9 && cart.length > 0 && (
              <p className="text-sm text-gray-500">Nenhuma opção de frete disponível para este CEP.</p>
            )}

            {!loadingFrete && freteOptions.length > 0 && (
              <div className="space-y-2">
                {freteOptions.map((op) => (
                  <label
                    key={op.id}
                    className={`flex items-center gap-3 border p-3 rounded-lg cursor-pointer ${
                      freteSelecionado?.id === op.id ? "border-rose-400 bg-rose-50" : "border-gray-200"
                    }`}
                  >
                    <input
                      type="radio"
                      name="frete"
                      value={op.id}
                      checked={freteSelecionado?.id === op.id}
                      onChange={() => setFreteSelecionado(op)}
                    />
                    <span>
                      R$ {op.price.toFixed(2)} - entrega estimada em {op.delivery_time} dias
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Resumo + botão */}
        <div className="mt-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-left w-full md:w-auto space-y-1">
            <div className="text-sm text-gray-500">Subtotal: R$ {subtotal.toFixed(2)}</div>
            <div className="text-sm text-gray-500">Frete: R$ {freteValue.toFixed(2)}</div>
            <div className="text-lg font-semibold">Total: R$ {total.toFixed(2)}</div>

            <div className="text-sm font-semibold">
              {modoEntrega === "retirar"
                ? "Retirada no local"
                : freteSelecionado
                ? `Entrega em ${freteSelecionado.delivery_time} dias`
                : "Selecione uma opção de frete"}
            </div>
          </div>

          <button
            onClick={handleNext}
            disabled={!isValid}
            className={`px-6 py-2 rounded-md font-semibold transition ${
              isValid ? "bg-rose-300 hover:bg-rose-600 text-white" : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            Próximo
          </button>
        </div>
      </div>
    </div>
  );
}
