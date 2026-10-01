// src/pages/Login.tsx

import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { login as loginApi } from "@/services/authService";
import { useCart } from "@/contexts/CartContext";
import { ArrowRight, Eye, EyeOff, Sparkles } from "lucide-react";
import Head from "@/components/ui/Head";

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { loadCartFromServer } = useCart();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");

    try {
      const { user, token } = await loginApi(email, senha);
      localStorage.setItem("token", token);
      login(user, token);
      await loadCartFromServer();
      navigate("/ecommerce");
    } catch (err: any) {
      setErro(err?.message || "Erro ao fazer login.");
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f4ed] pt-20 text-[#302b27]">
      <Head title="Entrar | Ateliê Lu" />
      <div className="relative flex min-h-[calc(100vh-5rem)] items-center justify-center overflow-hidden px-5 py-10 sm:px-8 lg:px-12">
        <div className="pointer-events-none absolute -left-24 top-16 h-72 w-72 rounded-full bg-[#d8a69b]/25 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-[#e7c8b5]/30 blur-3xl" />

        <section className="relative grid w-full max-w-5xl overflow-hidden rounded-[1.75rem] border border-[#473d35]/10 bg-[#fffaf3] shadow-[0_28px_80px_rgba(61,45,36,0.12)] lg:grid-cols-[0.9fr_1.1fr]">
          <aside className="relative hidden min-h-[590px] flex-col justify-between overflow-hidden bg-[#302b27] p-10 text-[#fffaf3] lg:flex lg:p-12">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full border-[44px] border-[#b45f5a]/50" />
            <div className="absolute -bottom-28 -left-24 h-72 w-72 rounded-full bg-[#b45f5a] opacity-80" />
            <div className="relative">
              <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-[#d99790]">
                <Sparkles className="h-4 w-4" />
                Seu espaço no Ateliê Lu
              </span>
              <h2 className="mt-8 max-w-sm font-elegant text-5xl leading-[1.05] tracking-[-0.035em]">
                Um cantinho para guardar suas escolhas.
              </h2>
              <p className="mt-6 max-w-sm text-sm leading-7 text-[#c9bbb1]">
                Acompanhe pedidos, organize seus dados e continue de onde parou.
              </p>
            </div>
            <p className="relative font-script text-3xl italic text-[#f0c1ba]">feito com afeto.</p>
          </aside>

          <form onSubmit={handleLogin} className="p-7 sm:p-10 lg:p-14">
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#a64f4a]">Bem-vinda de volta</p>
            <h1 className="mt-3 font-elegant text-4xl font-medium tracking-[-0.035em] sm:text-5xl">Entrar no Ateliê</h1>
            <p className="mt-4 text-sm leading-6 text-[#746860]">Acesse sua conta para ver seus pedidos e continuar comprando.</p>

            {erro && (
              <p className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{erro}</p>
            )}

            <div className="mt-8">
              <label htmlFor="login-email" className="mb-2 block text-[11px] font-bold uppercase tracking-[0.16em] text-[#5e554e]">
                E-mail
              </label>
              <input
                id="login-email"
                type="email"
                className="h-14 w-full rounded-xl border border-[#473d35]/15 bg-[#f8f4ed] px-4 text-sm outline-none transition placeholder:text-[#a99c93] focus:border-[#b45f5a] focus:ring-4 focus:ring-[#b45f5a]/10"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voce@email.com"
                required
                autoComplete="email"
              />
            </div>

            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between gap-4">
                <label htmlFor="login-password" className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#5e554e]">Senha</label>
                <Link to="/forgot-password" className="text-xs font-semibold text-[#a64f4a] transition hover:text-[#873c38]">Esqueci a senha</Link>
              </div>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  className="h-14 w-full rounded-xl border border-[#473d35]/15 bg-[#f8f4ed] px-4 pr-12 text-sm outline-none transition focus:border-[#b45f5a] focus:ring-4 focus:ring-[#b45f5a]/10"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required
                  autoComplete="current-password"
                />

                <button
                  type="button"
                  className="absolute right-2 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full text-[#7b6f66] transition hover:bg-[#eadfd4] hover:text-[#9f4e49]"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="group mt-7 inline-flex min-h-14 w-full items-center justify-center gap-3 rounded-full bg-[#302b27] px-6 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#b45f5a]"
            >
              Entrar
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>

            <p className="mt-7 text-center text-sm text-[#746860]">
              Ainda não tem conta?{" "}
              <Link to="/cadastro" className="font-bold text-[#a64f4a] transition hover:text-[#873c38] hover:underline">
                Criar conta
              </Link>
            </p>
          </form>
        </section>
      </div>
    </div>
  );
};

export default Login;
