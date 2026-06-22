// src/services/freteService.ts

const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:3000/api';

export interface FreteParams {
  cep: string;
  items: Array<{ id: string | number; quantity: number }>;
}

export interface FreteOption {
  id: string;
  name: string;
  price: number;
  delivery_time: number;
  quote_token: string;
}

export const getFreteData = async (params: FreteParams): Promise<FreteOption[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/frete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(params)
    });

    if (!response.ok) throw new Error('Erro ao consultar o frete');

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao buscar frete:', error);
    throw error;
  }
};
