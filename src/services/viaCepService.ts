interface ViaCepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
}

export async function searchCep(cep: string): Promise<ViaCepResponse> {
  // Remove caracteres não numéricos
  const cleanCep = cep.replace(/\D/g, '');
  
  if (cleanCep.length !== 8) {
    throw new Error('CEP deve ter 8 dígitos');
  }

  const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
  
  if (!response.ok) {
    throw new Error('Erro ao buscar CEP');
  }

  const data = await response.json();
  
  if (data.erro) {
    throw new Error('CEP não encontrado');
  }

  return data;
} 