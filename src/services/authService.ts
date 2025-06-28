const API = import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:3000/api';

export async function login(email: string, password: string) {
  const res = await fetch(`${API}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  if (!res.ok) throw new Error('Credenciais inválidas');
  return await res.json(); // { user, token }
}

export async function register(name: string, email: string, password: string) {
  const res = await fetch(`${API}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password })
  });

  if (!res.ok) throw new Error('Erro ao registrar');
  return await res.json(); 
}

export async function getProfile() {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('Token não encontrado');

  const res = await fetch(`${API}/me`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) throw new Error('Erro ao buscar perfil');
  return await res.json(); 
}
