import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '@/services/authService';
import { toast } from 'sonner';
import { MapPin, Search } from 'lucide-react';

const Cadastro: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    telefone: '',
    cpf: ''
  });

  const [addressData, setAddressData] = useState({
    cep: '',
    rua: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: ''
  });

  const [erro, setErro] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCepSearch = async (cep: string) => {
    if (cep.length === 8) {
      try {
        //BUSCA DO CEP NA API ESPERANDO FAZER PEDRAO
        toast.info('Buscando CEP...');
        // Simular preenchimento automático
        setTimeout(() => {
          setAddressData({
            ...addressData,
            rua: 'Rua Exemplo',
            bairro: 'Centro',
            cidade: 'São Paulo',
            estado: 'SP'
          });
          toast.success('CEP encontrado!');
        }, 1000);
      } catch (error) {
        toast.error('Erro ao buscar CEP');
      }
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');

    // Validações
    if (formData.senha !== formData.confirmarSenha) {
      setErro('As senhas não coincidem');
      return;
    }

    if (formData.senha.length < 6) {
      setErro('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setIsLoading(true);

    try {
      const { user, token } = await register(formData.nome, formData.email, formData.senha);
      localStorage.setItem('token', token);
      login(user, token);
      toast.success('Conta criada com sucesso!');
      navigate('/');
    } catch (err: any) {
      setErro(err.message || 'Erro ao cadastrar');
      toast.error('Erro ao criar conta');
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
            <h1 className="text-3xl font-bold text-rose-400 mb-6 text-center font-elegant">
              Criar Conta
            </h1>

            {erro && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg mb-6">
                {erro}
              </div>
            )}

            {/* Dados Pessoais */}
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
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    required
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
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-1 text-sm font-medium">
                    Telefone
                  </label>
                  <input
                    type="tel"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-rose-400 focus:border-transparent"
                    value={formData.telefone}
                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                    placeholder="(11) 99999-9999"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-1 text-sm font-medium">
                    CPF
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-rose-400 focus:border-transparent"
                    value={formData.cpf}
                    onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                    placeholder="000.000.000-00"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-1 text-sm font-medium">
                    Senha *
                  </label>
                  <input
                    type="password"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-rose-400 focus:border-transparent"
                    value={formData.senha}
                    onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                    required
                    minLength={6}
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-1 text-sm font-medium">
                    Confirmar Senha *
                  </label>
                  <input
                    type="password"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-rose-400 focus:border-transparent"
                    value={formData.confirmarSenha}
                    onChange={(e) => setFormData({ ...formData, confirmarSenha: e.target.value })}
                    required
                    minLength={6}
                  />
                </div>
              </div>
            </div>

            {/* Endereço */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-rose-400" />
                Endereço de Entrega
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-1">
                  <label className="block text-gray-700 mb-1 text-sm font-medium">
                    CEP
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-rose-400 focus:border-transparent"
                      value={addressData.cep}
                      onChange={(e) => {
                        setAddressData({ ...addressData, cep: e.target.value });
                        handleCepSearch(e.target.value);
                      }}
                      placeholder="00000-000"
                      maxLength={8}
                    />
                    <button
                      type="button"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-rose-400"
                    >
                      <Search className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-gray-700 mb-1 text-sm font-medium">
                    Rua
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-rose-400 focus:border-transparent"
                    value={addressData.rua}
                    onChange={(e) => setAddressData({ ...addressData, rua: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-1 text-sm font-medium">
                    Número
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-rose-400 focus:border-transparent"
                    value={addressData.numero}
                    onChange={(e) => setAddressData({ ...addressData, numero: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-1 text-sm font-medium">
                    Complemento
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-rose-400 focus:border-transparent"
                    value={addressData.complemento}
                    onChange={(e) => setAddressData({ ...addressData, complemento: e.target.value })}
                    placeholder="Apartamento, bloco, etc."
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-1 text-sm font-medium">
                    Bairro
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-rose-400 focus:border-transparent"
                    value={addressData.bairro}
                    onChange={(e) => setAddressData({ ...addressData, bairro: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-1 text-sm font-medium">
                    Cidade
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-rose-400 focus:border-transparent"
                    value={addressData.cidade}
                    onChange={(e) => setAddressData({ ...addressData, cidade: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-1 text-sm font-medium">
                    Estado
                  </label>
                  <select
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-rose-400 focus:border-transparent"
                    value={addressData.estado}
                    onChange={(e) => setAddressData({ ...addressData, estado: e.target.value })}
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
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-rose-400 hover:bg-rose-500 disabled:bg-gray-400 text-white py-3 rounded-lg transition font-semibold flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Criando conta...
                </>
              ) : (
                'Criar Conta'
              )}
            </button>
            
            <p className="text-center text-sm text-gray-600 mt-4">
              Já tem uma conta?{' '}
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
