import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useState, useEffect } from "react";
import { getFreteData } from "@/services/freteService";

export default function CheckoutStep1({ onNext, updateData }: any) {
  const { user } = useAuth();
  const { items: cart } = useCart();

  const [cep, setCep] = useState(user?.endereco?.cep || "");
  const [rua, setRua] = useState(user?.endereco?.rua || "");
  const [numero, setNumero] = useState(user?.endereco?.numero || "");
  const [observacao, setObservacao] = useState(user?.endereco?.complemento || "");
  const [telefone, setTelefone] = useState(user?.telefone || "");
  const [isValid, setIsValid] = useState(false);

  const [freteOptions, setFreteOptions] = useState<any[]>([]);
  const [freteSelecionado, setFreteSelecionado] = useState<any>(null);
  const [loadingFrete, setLoadingFrete] = useState(false);

  const formatCep = (value: string) => {
    const cleaned = value.replace(/\D/g, "").slice(0, 8);
    return cleaned.length > 5 ? `${cleaned.slice(0, 5)}-${cleaned.slice(5)}` : cleaned;
  };

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCep(e.target.value);
    setCep(formatted);
  };

  const handleRuaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRua(e.target.value.replace(/[^a-zA-Z0-9\s\-]/g, ""));
  };

  const handleNumeroChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNumero(e.target.value.replace(/[^a-zA-Z0-9\s\-]/g, ""));
  };

  useEffect(() => {
    const valid = cep.trim().length === 9 && numero.trim().length > 0 && telefone.trim().length >= 8;
    setIsValid(valid);
  }, [cep, numero, telefone]);

  // 📦 Consulta o frete automaticamente quando o cep for válido
  useEffect(() => {
  const fetchFrete = async () => {
    if (cep.trim().length === 9 && cart.length > 0) {
      setLoadingFrete(true);
      try {
        const products_Ids = cart.map(item => item.id);
        const result = await getFreteData({ cep, products_Ids });

        // 🧠 Filtro das opções válidas (sem erro)
        const opcoesValidas = result.filter((op: any) => !op.error);

        setFreteOptions(opcoesValidas);

        // ✅ (Opcional) selecionar automaticamente a primeira opção válida
        if (opcoesValidas.length > 0) {
          setFreteSelecionado(opcoesValidas[0]);
        }

      } catch (err) {
        console.error('Erro ao calcular frete:', err);
      } finally {
        setLoadingFrete(false);
      }
    }
  };
  fetchFrete();
}, [cep, cart]);


  const handleNext = () => {
  updateData({
    cart, 
    endereco: {
      cep,
      rua,
      numero,
      observacao,
      telefone,
    },
    frete: freteSelecionado,
  });

  onNext();
};

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="flex items-center justify-center mb-6 w-full max-w-2xl">
        <div className="flex items-center w-full">
          <div className="w-8 h-8 bg-rose-500 text-white rounded-full flex items-center justify-center font-bold">1</div>
          <div className="flex-1 h-1 bg-rose-200 mx-2"></div>
          <div className="w-8 h-8 bg-rose-200 text-gray-500 rounded-full flex items-center justify-center">2</div>
          <div className="flex-1 h-1 bg-rose-200 mx-2"></div>
          <div className="w-8 h-8 bg-rose-200 text-gray-500 rounded-full flex items-center justify-center">3</div>
        </div>
      </div>

      <div className="w-full max-w-2xl p-6 bg-white shadow-lg rounded-xl">
        <h2 className="text-2xl font-semibold text-rose-300 mb-4">Endereço para entrega</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            value={cep}
            onChange={handleCepChange}
            placeholder="CEP (ex: 12345-678)"
            maxLength={9}
            className="border border-gray-300 rounded-md px-4 py-2"
          />
          <input
            value={rua}
            onChange={handleRuaChange}
            placeholder="Rua"
            className="border border-gray-300 rounded-md px-4 py-2"
          />
          <input
            value={numero}
            onChange={handleNumeroChange}
            placeholder="Número"
            className="border border-gray-300 rounded-md px-4 py-2"
          />
          <input
            value={observacao}
            onChange={(e) => setObservacao(e.target.value)}
            placeholder="Observação (opcional)"
            className="border border-gray-300 rounded-md px-4 py-2 col-span-full"
          />
          <input
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            placeholder="Telefone com DDD"
            className="border border-gray-300 rounded-md px-4 py-2 col-span-full"
          />
        </div>

        {/* Opções de frete */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Opções de frete:</h3>
          {loadingFrete && <p>Carregando...</p>}
          {!loadingFrete && freteOptions.length === 0 && <p>Nenhuma opção disponível.</p>}

          {!loadingFrete && freteOptions.map((op) => (
            <label key={op.id} className="flex items-center gap-3 border p-2 rounded-md my-1 cursor-pointer">
              <input
                type="radio"
                name="frete"
                value={op.id}
                checked={freteSelecionado?.id === op.id}
                onChange={() => setFreteSelecionado(op)}
              />
              <span>
                <strong>Frete</strong> R$ {op.price} - entrega estimada em {op.delivery_time} dias
              </span>
            </label>
          ))}
        </div>

        <button
          onClick={handleNext}
          disabled={!isValid || !freteSelecionado}
          className={`w-full mt-6 py-2 rounded-md font-semibold transition ${
            isValid && freteSelecionado
              ? "bg-rose-300 hover:bg-rose-600 text-white"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          Próximo
        </button>
      </div>
    </div>
  );
}
