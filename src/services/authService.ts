const API = import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:3000/api';

interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  telefone: string;
  cpf: string;
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

interface ResetPasswordPayload {
  token: string;
  newPassword: string;
}

interface UpdateProfilePayload {
  name?: string;
  telefone?: string;
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

type ApiErrorPayload = { error?: string; details?: string[]; [k: string]: any };

export async function register(payload: RegisterPayload) {
  const res = await fetch(`${API}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  // sucesso
  if (res.ok) {
    return await res.json();
  }

  // erro: tenta ler JSON, senão lê texto
  let data: ApiErrorPayload | null = null;
  try {
    data = await res.json();
  } catch {
    const text = await res.text().catch(() => "");
    data = text ? ({ error: text } as any) : null;
  }

  const message =
    data?.details?.[0] ||
    data?.error ||
    `Erro ao registrar (HTTP ${res.status})`;

  const error: any = new Error(message);
  error.status = res.status;
  error.data = data;
  throw error;
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


  const res = await fetch(`${API}/me`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });


  if (!res.ok) {
    const errorText = await res.text();
    console.error('Resposta de erro do servidor:', errorText);
    throw new Error(`Erro ao atualizar perfil: ${res.status} - ${errorText}`);
  }
  
  const responseData = await res.json();
  return responseData;
}

export async function verifyResetTokenApi(token: string): Promise<void> {
  const res = await fetch(`${API}/reset-password/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token })
  });
  
  // Se não for OK (400, 404), o backend retorna um erro.
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || 'Link inválido ou expirado.');
  }
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

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.error || 'Erro ao atualizar senha');
  }
  return await res.json();
}

export async function resetPasswordApi(payload: ResetPasswordPayload): Promise<void> {
  const res = await fetch(`${API}/reset-password`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.message || data?.error || 'Erro ao redefinir senha.');
  }
}

export interface ApiError extends Error {
  status?: number;
  retryAfterMs?: number;
}

export async function forgotPasswordApi(email: string): Promise<void> {
  const res = await fetch(`${API}/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  if (!res.ok) {
    // Lê o corpo da resposta (pode ou não vir JSON)
    const retryAfterHeader = res.headers.get('Retry-After');
    const contentType = res.headers.get('Content-Type') || '';

    let data: Record<string, unknown> = {};
    if (contentType.includes('application/json')) {
      try {
        data = await res.json();
      } catch {
        data = {};
      }
    } else {
      const text = await res.text().catch(() => '');
      data = { message: text };
    }

    const err: ApiError = new Error(
      (data.message as string) ||
      (data.error as string) ||
      'Falha ao enviar e-mail de recuperação.'
    );

    err.status = res.status;

    if (res.status === 429 && retryAfterHeader) {
      const seconds = Number(retryAfterHeader);
      if (!Number.isNaN(seconds)) err.retryAfterMs = seconds * 1000;
    }

    throw err;
  }
}
