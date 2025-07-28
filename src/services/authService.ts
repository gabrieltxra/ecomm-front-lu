const API = import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:3000/api';

interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  telefone?: string;
  cpf?: string;
  endereco?: {
    cep: string;
    rua: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    estado: string;
    pais: string;
  };
}

interface UpdateProfilePayload {
  name?: string;
  email?: string;
  telefone?: string;
  cpf?: string;
  // (estrutura flattened)
  cep?: string;
  rua?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  pais?: string;
  // Estrutura aninhada 
  endereco?: {
    cep: string;
    rua: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    estado: string;
    pais: string;
  };
}

export async function login(email: string, password: string) {
  const res = await fetch(`${API}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  if (!res.ok) throw new Error('Credenciais inválidas');
  return await res.json(); // { user, token }
}

export async function register(payload: RegisterPayload) {
  const res = await fetch(`${API}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
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

export async function updateProfile(payload: UpdateProfilePayload) {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('Token não encontrado');

  console.log('Enviando payload para updateProfile:', payload);

  const res = await fetch(`${API}/me`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });

  console.log('Status da resposta PUT /me:', res.status);

  if (!res.ok) {
    const errorText = await res.text();
    console.error('Resposta de erro do servidor:', errorText);
    throw new Error(`Erro ao atualizar perfil: ${res.status} - ${errorText}`);
  }
  
  const responseData = await res.json();
  console.log('Resposta de sucesso:', responseData);
  return responseData;
}

export async function updatePassword(currentPassword: string, newPassword: string) {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('Token não encontrado');

  const res = await fetch(`${API}/password`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ currentPassword, newPassword })
  });

  if (!res.ok) throw new Error('Erro ao atualizar senha');
  return await res.json();
}
