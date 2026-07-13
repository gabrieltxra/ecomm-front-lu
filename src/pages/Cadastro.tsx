import { useMemo, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { register } from "@/services/authService";
import { searchCep } from "@/services/viaCepService";
import { toast } from "sonner";
import { MapPin } from "lucide-react";
import { Eye, EyeOff } from "lucide-react";

import {
  onlyDigits,
  formatPhoneBR,
  formatCPF,
  isValidEmail,
  isValidCPF,
  validatePasswordBasic,
} from "../utils/validators";

/** =========================
 * Helper: extrair erro da API
 * (funciona com axios e com fetch)
 * ========================= */
function extractApiError(err: any): {
  status?: number;
  data?: any;
  error?: string;
  details?: string[];
} {
  const status = err?.status ?? err?.response?.status;
  const data = err?.data ?? err?.response?.data ?? err?.body ?? err?.response?.body;

  const error = data?.error ?? err?.message;
  const details = Array.isArray(data?.details) ? data.details : undefined;

  return { status, data, error, details };
}

const Cadastro: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  // ✅ ETAPAS
  const [step, setStep] = useState<1 | 2>(1);

  // ✅ Olhinho
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // ✅ erro específico vindo do backend para senha
  const [passwordApiError, setPasswordApiError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    senha: "",
    confirmarSenha: "",
    telefone: "",
    cpf: "",
  });

  const [addressData, setAddressData] = useState({
    cep: "",
    rua: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    estado: "",
    pais: "Brasil",
  });

  const [erro, setErro] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSearchingCep, setIsSearchingCep] = useState(false);

  const normalized = useMemo(() => {
    const name = formData.nome.trim();
    const email = formData.email.trim().toLowerCase();
    const phoneDigits = onlyDigits(formData.telefone);
    const cpfDigits = onlyDigits(formData.cpf);
    return { name, email, phoneDigits, cpfDigits };
  }, [formData]);

  const handleCepSearch = async (cep: string) => {
    if (cep.length !== 8) return;

    setIsSearchingCep(true);
    try {
      toast.info("Buscando CEP...");
      const cepData = await searchCep(cep);

      setAddressData((prev) => ({
        ...prev,
        cep: cepData.cep,
        rua: cepData.logradouro,
        bairro: cepData.bairro,
        cidade: cepData.localidade,
        estado: cepData.uf,
      }));

      toast.success("CEP encontrado!");
    } catch (error: any) {
      toast.error(error?.message || "Erro ao buscar CEP");
    } finally {
      setIsSearchingCep(false);
    }
  };

  // ✅ valida só a etapa 1
  const validateStep1 = () => {
    setErro("");
    setPasswordApiError(null);

    if (normalized.name.length < 3) return "Informe seu nome (mínimo 3 caracteres)";
    if (!isValidEmail(normalized.email)) return "E-mail inválido";

    if (!normalized.phoneDigits) return "Informe seu telefone com DDD";
    const phoneLength = normalized.phoneDigits.length;
    if (phoneLength !== 10 && phoneLength !== 11)
      return "Telefone inválido (use DDD + número)";

    if (!normalized.cpfDigits) return "Informe seu CPF";
    if (!isValidCPF(formData.cpf)) return "CPF inválido";

    if (formData.senha !== formData.confirmarSenha) return "As senhas não coincidem";

    const pw = validatePasswordBasic(formData.senha, { minLen: 8 });
    if (!pw.ok) return pw.errors?.[0] || "Senha inválida";

    return null;
  };

  // ✅ valida etapa 2 (se endereço for opcional, só valida se começou a preencher CEP)
  const validateStep2 = () => {
    setErro("");

    if (addressData.cep && addressData.cep.length === 8) {
      if (!addressData.rua?.trim()) return "Informe a rua";
      if (!addressData.numero?.trim()) return "Informe o número do endereço";
      if (!addressData.cidade?.trim() || !addressData.estado?.trim())
        return "Complete cidade/estado do endereço";
    }

    return null;
  };

  const goToStep2 = () => {
    const err = validateStep1();
    if (err) {
      setErro(err);
      toast.error(err);
      return;
    }
    setErro("");
    setStep(2);
    toast.success("Dados pessoais ok! Agora preencha o endereço.");
  };

  const goBackToStep1 = () => {
    setErro("");
    setPasswordApiError(null);
    setStep(1);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");
    setPasswordApiError(null);

    // garante que step 1 está ok
    const err1 = validateStep1();
    if (err1) {
      setErro(err1);
      toast.error(err1);
      setStep(1);
      return;
    }

    // valida step 2 (se aplicável)
    const err2 = validateStep2();
    if (err2) {
      setErro(err2);
      toast.error(err2);
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        name: normalized.name,
        email: normalized.email,
        password: formData.senha,
        telefone: normalized.phoneDigits,
        cpf: normalized.cpfDigits,
        endereco: addressData.cep
          ? {
              cep: addressData.cep,
              rua: addressData.rua,
              numero: addressData.numero,
              complemento: addressData.complemento,
              bairro: addressData.bairro,
              cidade: addressData.cidade,
              estado: addressData.estado,
              pais: addressData.pais,
            }
          : undefined,
      };

      const { user, token } = await register(payload);

      localStorage.setItem("token", token);
      login(user, token);

      toast.success("Conta criada com sucesso!");
      navigate("/");
    } catch (err: any) {
      const { status, error, details } = extractApiError(err);

      // ✅ se for erro de senha (como seu exemplo)
      if (status === 400 && error === "Senha inválida") {
        const detailMsg = details?.[0] || "Senha inválida";
        setPasswordApiError(detailMsg); // 👈 aparece embaixo do input
        setErro(""); // opcional: não poluir o alerta geral
        toast.error(detailMsg);
        setStep(1); // volta pro step de senha
        return;
      }

      // ✅ demais erros 400 com details
      if (status === 400) {
        if (details?.length) {
          const msg = `${error || "Dados inválidos"}: ${details.join(", ")}`;
          setErro(msg);
          toast.error(msg);
          return;
        }
        if (error) {
          setErro(error);
          toast.error(error);
          return;
        }
      }

      const msg = err?.message || error || "Erro ao cadastrar";
      setErro(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-rose-50 dark:from-slate-900 dark:to-slate-800 pt-24 pb-16">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <form
            onSubmit={handleSignup}
            className="bg-white dark:bg-slate-800/50 backdrop-blur-sm shadow-lg dark:shadow-dark rounded-lg p-8 border border-rose-100 dark:border-slate-700/50"
          >
            <h1 className="text-3xl font-bold text-rose-400 mb-2 text-center font-elegant">
              Criar Conta
            </h1>

            {/* ✅ indicador de etapa */}
            <div className="flex items-center justify-center gap-2 mb-6 text-sm">
              <span
                className={`px-3 py-1 rounded-full border ${
                  step === 1
                    ? "bg-rose-100 border-rose-300 text-rose-700"
                    : "bg-gray-50 border-gray-200 text-gray-500 dark:bg-slate-700/40 dark:border-slate-600"
                }`}
              >
                1) Dados pessoais
              </span>
              <span className="text-gray-400">→</span>
              <span
                className={`px-3 py-1 rounded-full border ${
                  step === 2
                    ? "bg-rose-100 border-rose-300 text-rose-700"
                    : "bg-gray-50 border-gray-200 text-gray-500 dark:bg-slate-700/40 dark:border-slate-600"
                }`}
              >
                2) Endereço
              </span>
            </div>

            {/* erro geral */}
            {erro && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg mb-6">
                {erro}
              </div>
            )}

            {/* =======================
                ETAPA 1 - DADOS PESSOAIS
               ======================= */}
            {step === 1 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-rose-400" />
                  Dados Pessoais
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 dark:text-gray-200 mb-1 text-sm font-medium">
                      Nome completo *
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-700/50 focus:ring-2 focus:ring-rose-400 focus:border-transparent text-gray-900 dark:text-slate-100 backdrop-blur-sm"
                      value={formData.nome}
                      onChange={(e) =>
                        setFormData({ ...formData, nome: e.target.value })
                      }
                      required
                      minLength={3}
                      maxLength={120}
                      autoComplete="name"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 dark:text-gray-200 mb-1 text-sm font-medium">
                      E-mail *
                    </label>
                    <input
                      type="email"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-700/50 focus:ring-2 focus:ring-rose-400 focus:border-transparent text-gray-900 dark:text-slate-100 backdrop-blur-sm"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      required
                      maxLength={160}
                      autoComplete="email"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 dark:text-gray-200 mb-1 text-sm font-medium">
                      Telefone *
                    </label>
                    <input
                      type="tel"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-700/50 focus:ring-2 focus:ring-rose-400 focus:border-transparent text-gray-900 dark:text-slate-100"
                      value={formData.telefone}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          telefone: formatPhoneBR(e.target.value),
                        })
                      }
                      placeholder="(11) 99999-9999"
                      maxLength={15}
                      autoComplete="tel"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 dark:text-gray-200 mb-1 text-sm font-medium">
                      CPF *
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-700/50 focus:ring-2 focus:ring-rose-400 focus:border-transparent text-gray-900 dark:text-slate-100"
                      value={formData.cpf}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          cpf: formatCPF(e.target.value),
                        })
                      }
                      placeholder="000.000.000-00"
                      maxLength={14}
                      autoComplete="off"
                      inputMode="numeric"
                      required
                    />
                  </div>

                  <p className="md:col-span-2 text-xs text-gray-500 dark:text-gray-300 -mt-1">
                    Telefone e CPF são necessários para processar pagamentos com segurança.
                  </p>

                  {/* ✅ Senha com olhinho */}
                  <div className="md:col-span-1">
                    <label className="block text-gray-700 dark:text-gray-200 mb-1 text-sm font-medium">
                      Senha *
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        className={`w-full px-4 py-2 pr-11 border rounded-lg bg-gray-50 dark:bg-slate-700/50 focus:ring-2 focus:ring-rose-400 focus:border-transparent text-gray-900 dark:text-slate-100 ${
                          passwordApiError
                            ? "border-red-400 dark:border-red-500"
                            : "border-gray-300 dark:border-slate-600"
                        }`}
                        value={formData.senha}
                        onChange={(e) => {
                          setPasswordApiError(null);
                          setFormData({ ...formData, senha: e.target.value });
                        }}
                        required
                        minLength={8}
                        maxLength={72}
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
                        onClick={() => setShowPassword((v) => !v)}
                        aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>

                    {/* ✅ erro específico da API (ex.: senha muito comum) */}
                    {passwordApiError ? (
                      <p className="text-xs text-red-600 dark:text-red-300 mt-1">
                        {passwordApiError}
                      </p>
                    ) : (
                      <p className="text-xs text-gray-500 dark:text-gray-300 mt-1">
                        Use no mínimo 8 caracteres.
                      </p>
                    )}
                  </div>

                  {/* ✅ Confirmar senha com olhinho */}
                  <div className="md:col-span-1">
                    <label className="block text-gray-700 dark:text-gray-200 mb-1 text-sm font-medium">
                      Confirmar Senha *
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        className="w-full px-4 py-2 pr-11 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-700/50 focus:ring-2 focus:ring-rose-400 focus:border-transparent text-gray-900 dark:text-slate-100"
                        value={formData.confirmarSenha}
                        onChange={(e) => {
                          setPasswordApiError(null);
                          setFormData({
                            ...formData,
                            confirmarSenha: e.target.value,
                          });
                        }}
                        required
                        minLength={8}
                        maxLength={72}
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
                        onClick={() => setShowConfirmPassword((v) => !v)}
                        aria-label={
                          showConfirmPassword ? "Ocultar senha" : "Mostrar senha"
                        }
                      >
                        {showConfirmPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* ✅ botão de continuar */}
                <button
                  type="button"
                  onClick={goToStep2}
                  className="w-full mt-6 bg-rose-400 hover:bg-rose-500 text-white py-3 rounded-lg transition font-semibold"
                >
                  Continuar
                </button>
              </div>
            )}

            {/* =======================
                ETAPA 2 - ENDEREÇO
               ======================= */}
            {step === 2 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-rose-400" />
                  Endereço de Entrega
                  <span className="ml-2 text-xs text-gray-500 dark:text-gray-300">
                    (opcional)
                  </span>
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-1">
                    <label className="block text-gray-700 dark:text-gray-200 mb-1 text-sm font-medium">
                      CEP
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-700/50 focus:ring-2 focus:ring-rose-400 focus:border-transparent text-gray-900 dark:text-slate-100"
                        value={addressData.cep}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, "").slice(0, 8);
                          setAddressData((prev) => ({ ...prev, cep: value }));
                          if (value.length === 8) handleCepSearch(value);
                        }}
                        placeholder="00000000"
                        maxLength={8}
                        inputMode="numeric"
                        autoComplete="postal-code"
                      />
                      {isSearchingCep && (
                        <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-rose-400"></div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-gray-700 dark:text-gray-200 mb-1 text-sm font-medium">
                      Rua
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-700/50 focus:ring-2 focus:ring-rose-400 focus:border-transparent text-gray-900 dark:text-slate-100"
                      value={addressData.rua}
                      onChange={(e) =>
                        setAddressData({ ...addressData, rua: e.target.value })
                      }
                      maxLength={160}
                      autoComplete="address-line1"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 dark:text-gray-200 mb-1 text-sm font-medium">
                      Número
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-700/50 focus:ring-2 focus:ring-rose-400 focus:border-transparent text-gray-900 dark:text-slate-100"
                      value={addressData.numero}
                      onChange={(e) =>
                        setAddressData({ ...addressData, numero: e.target.value })
                      }
                      maxLength={20}
                      autoComplete="address-line2"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 dark:text-gray-200 mb-1 text-sm font-medium">
                      Complemento
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-700/50 focus:ring-2 focus:ring-rose-400 focus:border-transparent text-gray-900 dark:text-slate-100"
                      value={addressData.complemento}
                      onChange={(e) =>
                        setAddressData({ ...addressData, complemento: e.target.value })
                      }
                      placeholder="Apartamento, bloco, etc."
                      maxLength={120}
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 dark:text-gray-200 mb-1 text-sm font-medium">
                      Bairro
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-700/50 focus:ring-2 focus:ring-rose-400 focus:border-transparent text-gray-900 dark:text-slate-100"
                      value={addressData.bairro}
                      onChange={(e) =>
                        setAddressData({ ...addressData, bairro: e.target.value })
                      }
                      maxLength={120}
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 dark:text-gray-200 mb-1 text-sm font-medium">
                      Cidade
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-700/50 focus:ring-2 focus:ring-rose-400 focus:border-transparent text-gray-900 dark:text-slate-100"
                      value={addressData.cidade}
                      onChange={(e) =>
                        setAddressData({ ...addressData, cidade: e.target.value })
                      }
                      maxLength={120}
                      autoComplete="address-level2"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 dark:text-gray-200 mb-1 text-sm font-medium">
                      Estado
                    </label>
                    <select
                      className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-700/50 focus:ring-2 focus:ring-rose-400 focus:border-transparent text-gray-900 dark:text-slate-100"
                      value={addressData.estado}
                      onChange={(e) =>
                        setAddressData({ ...addressData, estado: e.target.value })
                      }
                      autoComplete="address-level1"
                    >
                      <option value="">Selecione um estado</option>
                      <option value="AC">Acre</option>
                      <option value="AL">Alagoas</option>
                      <option value="AP">Amapá</option>
                      <option value="AM">Amazonas</option>
                      <option value="BA">Bahia</option>
                      <option value="CE">Ceará</option>
                      <option value="DF">Distrito Federal</option>
                      <option value="ES">Espírito Santo</option>
                      <option value="GO">Goiás</option>
                      <option value="MA">Maranhão</option>
                      <option value="MT">Mato Grosso</option>
                      <option value="MS">Mato Grosso do Sul</option>
                      <option value="MG">Minas Gerais</option>
                      <option value="PA">Pará</option>
                      <option value="PB">Paraíba</option>
                      <option value="PR">Paraná</option>
                      <option value="PE">Pernambuco</option>
                      <option value="PI">Piauí</option>
                      <option value="RJ">Rio de Janeiro</option>
                      <option value="RN">Rio Grande do Norte</option>
                      <option value="RS">Rio Grande do Sul</option>
                      <option value="RO">Rondônia</option>
                      <option value="RR">Roraima</option>
                      <option value="SC">Santa Catarina</option>
                      <option value="SP">São Paulo</option>
                      <option value="SE">Sergipe</option>
                      <option value="TO">Tocantins</option>
                    </select>
                  </div>
                </div>

                {/* ✅ botões step 2 */}
                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={goBackToStep1}
                    className="w-1/3 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-100 py-3 rounded-lg transition font-semibold hover:bg-gray-50 dark:hover:bg-slate-700/60"
                    disabled={isLoading || isSearchingCep}
                  >
                    Voltar
                  </button>

                  <button
                    type="submit"
                    disabled={isLoading || isSearchingCep}
                    className="w-2/3 bg-rose-400 hover:bg-rose-500 disabled:bg-gray-400 text-white py-3 rounded-lg transition font-semibold flex items-center justify-center"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Criando conta...
                      </>
                    ) : isSearchingCep ? (
                      "Buscando CEP..."
                    ) : (
                      "Criar Conta"
                    )}
                  </button>
                </div>
              </div>
            )}

            <p className="text-center text-sm text-gray-600 dark:text-gray-300 mt-4">
              Já tem uma conta?{" "}
              <Link to="/login" className="text-rose-500 font-medium hover:underline">
                Fazer login
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Cadastro;
