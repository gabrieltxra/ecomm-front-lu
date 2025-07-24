import { useState, useEffect } from "react";

export default function CheckoutStep1({ onNext, updateData }: any) {
  const [cep, setCep] = useState("");
  const [numero, setNumero] = useState("");
  const [observacao, setObservacao] = useState("");
  const [telefone, setTelefone] = useState("");
  const [isValid, setIsValid] = useState(false);

  // Função para formatar o CEP ao digitar
  const formatCep = (value: string) => {
    const cleaned = value.replace(/\D/g, "").slice(0, 8); // somente números, máx 8 dígitos
    if (cleaned.length > 5) {
      return cleaned.slice(0, 5) + "-" + cleaned.slice(5);
    }
    return cleaned;
  };

  // Atualiza os campos formatados
  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCep(e.target.value);
    setCep(formatted);
  };

  const handleNumeroChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = e.target.value.replace(/[^a-zA-Z0-9\s\-]/g, "");
    setNumero(formatted);
  };

  // Validação (CEP com 9 caracteres formatado, número não vazio, telefone com 8+)
  useEffect(() => {
    const valid =
      cep.trim().length === 9 &&
      numero.trim().length > 0 &&
      telefone.trim().length >= 8;

    setIsValid(valid);
  }, [cep, numero, telefone]);

  const handleNext = () => {
    updateData({
      endereco: {
        cep,
        numero,
        observacao,
        telefone,
      },
    });
    onNext();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      {/* Step indicator */}
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
            className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-rose-300"
          />
          <input
            value={numero}
            onChange={handleNumeroChange}
            placeholder="Número"
            className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-rose-300"
          />
          <input
            value={observacao}
            onChange={(e) => setObservacao(e.target.value)}
            placeholder="Observação (opcional)"
            className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-rose-300 col-span-full"
          />
          <input
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            placeholder="Telefone com DDD"
            className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-rose-300 col-span-full"
          />
        </div>

        <button
          onClick={handleNext}
          disabled={!isValid}
          className={`w-full mt-6 py-2 rounded-md font-semibold transition ${
            isValid
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
