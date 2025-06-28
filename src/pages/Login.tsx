// src/pages/Login.tsx

import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { login as loginApi } from '@/services/authService';

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    const { user, token } = await loginApi(email, senha); 

    localStorage.setItem('token', token); 
    login(user, token);

    navigate('/'); 
  } catch (err: any) {
    setErro(err.message || 'Erro ao fazer login.');
  }
};


  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-rose-50 pt-24 pb-16 flex items-center justify-center">
      <form
        onSubmit={handleLogin}
        className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md border border-rose-100"
      >
        <h1 className="text-3xl font-bold text-rose-400 mb-6 text-center font-elegant">Entrar no Ateliê</h1>

        {erro && <p className="text-sm text-red-500 mb-4 text-center">{erro}</p>}

        <div className="mb-4">
          <label className="block text-gray-700 mb-1 text-sm font-medium">E-mail</label>
          <input
            type="email"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-rose-400"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 mb-1 text-sm font-medium">Senha</label>
          <input
            type="password"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-rose-400"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-rose-400 hover:bg-rose-500 text-white py-2 rounded-lg transition font-semibold"
        >
          Entrar
        </button>

        <p className="text-center text-sm text-gray-600 mt-4">
          Não tem conta?{' '}
          <Link to="/cadastro" className="text-rose-500 font-medium hover:underline">
            Criar conta
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
