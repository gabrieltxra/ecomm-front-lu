// src/pages/Login.tsx

import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { login as loginApi } from "@/services/authService";
import { useCart } from "@/contexts/CartContext";
import { Eye, EyeOff } from "lucide-react";

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
      navigate("/");
    } catch (err: any) {
      setErro(err?.message || "Erro ao fazer login.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-rose-50 pt-24 pb-16 flex items-center justify-center">
      <form
        onSubmit={handleLogin}
        className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md border border-rose-100"
      >
        <h1 className="text-3xl font-bold text-rose-400 mb-6 text-center font-elegant">
          Entrar no Ateliê
        </h1>

        {erro && (
          <p className="text-sm text-red-500 mb-4 text-center">{erro}</p>
        )}

        <div className="mb-4">
          <label className="block text-gray-700 mb-1 text-sm font-medium">
            E-mail
          </label>
          <input
            type="email"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-rose-400 focus:border-transparent"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>

        {/* ✅ Senha com olhinho */}
        <div className="mb-6">
          <label className="block text-gray-700 mb-1 text-sm font-medium">
            Senha
          </label>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              className="w-full px-4 py-2 pr-11 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-rose-400 focus:border-transparent"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              autoComplete="current-password"
            />

            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-gray-700"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-rose-400 hover:bg-rose-500 text-white py-2 rounded-lg transition font-semibold"
        >
          Entrar
        </button>

        <p className="text-center text-sm text-gray-600 mt-4">
          Não tem conta?{" "}
          <Link
            to="/cadastro"
            className="text-rose-500 font-medium hover:underline"
          >
            Criar conta
          </Link>
        </p>

        <p className="text-center text-sm text-gray-600 mt-4">
          Esqueceu a senha?{" "}
          <Link
            to="/forgot-password"
            className="text-rose-500 font-medium hover:underline"
          >
            Esqueci a senha
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
