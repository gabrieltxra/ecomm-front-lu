import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { updateProfile, updatePassword } from '@/services/authService';
import { searchCep } from '../services/viaCepService';
import { 
  User, MapPin, Lock, Edit, Save, X, LogOut,
  Package, Truck, Calendar, CreditCard
} from 'lucide-react';
import { getUserOrders, Order } from '@/services/ordersService';
import { Link } from "react-router-dom";

import { toast } from 'sonner';

function getPickupStatusLabel(status?: string | null) {
  const normalized = String(status || '').toLowerCase();
  if (normalized === 'pronto_para_retirada') return 'Pronto para retirada';
  if (normalized === 'retirado') return 'Retirado';
  return 'Aguardando retirada';
}

const Perfil: React.FC = () => {
  const { user, isLoggedIn, isLoading, logout, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('perfil');
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [isSearchingCep, setIsSearchingCep] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [ordersLoaded, setOrdersLoaded] = useState(false); 

  // Estados para dados pessoais
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    telefone: '',
    cpf: ''
  });

  // Estados para endereço
  const [addressData, setAddressData] = useState({
    cep: '',
    rua: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
    pais: 'Brasil'
  });

  // Estados para senha
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Carregar dados do usuário quando o componente montar ou quando o user mudar
  useEffect(() => {
    if (user) {
      
      setFormData({
        name: user.name || '',
        email: user.email || '',
        telefone: user.telefone || '',
        cpf: user.cpf || ''
      });

      // Tentar carregar dados de endereço da estrutura flattened primeiro
      // Se não encontrar, tentar da estrutura aninhada
      const enderecoData = user.endereco;
      
      setAddressData({
        cep: user.cep || enderecoData?.cep || '',
        rua: user.rua || enderecoData?.rua || '',
        numero: user.numero || enderecoData?.numero || '',
        complemento: user.complemento || enderecoData?.complemento || '',
        bairro: user.bairro || enderecoData?.bairro || '',
        cidade: user.cidade || enderecoData?.cidade || '',
        estado: user.estado || enderecoData?.estado || '',
        pais: user.pais || enderecoData?.pais || 'Brasil'
      });
    }
  }, [user]);

   useEffect(() => {
    const load = async () => {
      if (activeTab !== 'pedidos' || ordersLoaded || loadingOrders) return;
      try {
        setLoadingOrders(true);
        const list = await getUserOrders();
        setOrders(list);
        setOrdersLoaded(true);
      } catch (e: any) {
        toast.error(e?.message || 'Erro ao carregar pedidos');
      } finally {
        setLoadingOrders(false);
      }
    };
    load();
  }, [activeTab]);

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      navigate('/login');
    }
  }, [isLoading, isLoggedIn, navigate]);

  // Mostrar loading enquanto carrega
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-rose-50 dark:from-slate-900 dark:to-slate-800 pt-24 pb-16">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-400 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando perfil...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const handleCepSearch = async (cep: string) => {
    if (cep.length === 8) {
      setIsSearchingCep(true);
      try {
        toast.info('Buscando CEP...');
        const cepData = await searchCep(cep);
        
        setAddressData({
          ...addressData,
          cep: cepData.cep,
          rua: cepData.logradouro,
          bairro: cepData.bairro,
          cidade: cepData.localidade,
          estado: cepData.uf
        });
        
        toast.success('CEP encontrado!');
      } catch (error: any) {
        toast.error(error.message || 'Erro ao buscar CEP');
      } finally {
        setIsSearchingCep(false);
      }
    }
  };

  const handlePersonalDataSave = async () => {
    setIsSaving(true);
    try {
      const payload = {
        name: formData.name,
        telefone: formData.telefone || undefined,
      };

      await updateProfile(payload);
      await refreshProfile();
      toast.success('Dados pessoais atualizados com sucesso!');
      setIsEditing(false);
    } catch (error: any) {
      console.error('Erro ao salvar dados pessoais:', error);
      toast.error(error.message || 'Erro ao atualizar dados pessoais');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddressSave = async () => {
    setIsSaving(true);
    try {
      const payload = {
        endereco: {
          cep: addressData.cep,
          rua: addressData.rua,
          numero: addressData.numero,
          complemento: addressData.complemento,
          bairro: addressData.bairro,
          cidade: addressData.cidade,
          estado: addressData.estado,
          pais: addressData.pais
        }
      } as any;

      await updateProfile(payload);
      await refreshProfile();
      toast.success('Endereço atualizado com sucesso!');
      setIsEditingAddress(false);
    } catch (error: any) {
      console.error('Erro ao salvar endereço:', error);
      toast.error(error.message || 'Erro ao atualizar endereço');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordSave = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }
    
    setIsSaving(true);
    try {
      await updatePassword(passwordData.currentPassword, passwordData.newPassword);
      toast.success('Senha atualizada com sucesso!');
      setIsEditingPassword(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error: any) {
      console.error('Erro ao alterar senha:', error);
      toast.error(error.message || 'Erro ao atualizar senha');
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: 'perfil', label: 'Dados Pessoais', icon: User },
    { id: 'endereco', label: 'Endereço', icon: MapPin },
    { id: 'senha', label: 'Alterar Senha', icon: Lock },
    { id: 'pedidos', label: 'Meus Pedidos', icon: Package },
  ];

  const formatMoney = (n: number) =>
    (n ?? 0).toFixed(2).replace('.', ',');

  const statusPill = (s) => {
    const base = 'px-2 py-1 text-xs rounded-full font-medium';
    switch (s) {
      case 'Pago': return `${base} bg-green-100 text-green-700`;
      case 'Preparando envio': return `${base} bg-amber-100 text-amber-700`;
      case 'Enviado': return `${base} bg-sky-100 text-sky-700`;
      case 'Entregue': return `${base} bg-emerald-100 text-emerald-700`;
      case 'Pendente': return `${base} bg-orange-100 text-orange-700`;
      case 'Cancelado': return `${base} bg-red-100 text-red-700`;
      case 'Devolvido': return `${base} bg-zinc-200 text-zinc-700`;
      case 'Pronto para retirada': return `${base} bg-blue-100 text-blue-700`;
      case 'Retirado': return `${base} bg-emerald-100 text-emerald-700`;
      case 'Revisao necessaria': return `${base} bg-red-100 text-red-700`;
      default: return `${base} bg-gray-100 text-gray-700`;
    }
  };

  const reloadOrders = async () => {
    try {
      setLoadingOrders(true);
      const list = await getUserOrders();
      setOrders(list);
      setOrdersLoaded(true);
    } catch (e: any) {
      toast.error(e?.message || 'Erro ao recarregar');
    } finally {
      setLoadingOrders(false);
    }
  };


  return (
    <div className="min-h-screen overflow-x-hidden bg-gradient-to-br from-white to-rose-50 dark:from-slate-900 dark:to-slate-800 pt-20 sm:pt-24 pb-16">
      <div className="container mx-auto px-3 py-6 sm:px-4 sm:py-8">
        <div className="mx-auto w-full max-w-4xl">
          {/* Header */}
          <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-lg shadow-lg dark:shadow-dark p-4 sm:p-6 mb-6 sm:mb-8 border border-gray-200 dark:border-slate-700/50">
            <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
              <h1 className="text-2xl font-bold text-rose-400 sm:text-3xl">Meu Perfil</h1>
              <p className="mt-2 max-w-full break-all text-gray-600 dark:text-gray-300">{user.email}</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-lg shadow-lg dark:shadow-dark overflow-hidden border border-gray-200 dark:border-slate-700/50">
            <div className="grid grid-cols-2 border-b border-gray-200 dark:border-slate-700/50 sm:grid-cols-4">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex min-w-0 items-center justify-center gap-2 px-2 py-3 text-center text-sm font-medium transition-colors sm:px-4 sm:py-4 sm:text-base ${
                      activeTab === tab.id
                        ? 'text-rose-400 border-b-2 border-rose-400 bg-rose-50 dark:bg-slate-700/50'
                        : 'text-gray-600 dark:text-slate-300 hover:text-rose-400 hover:bg-gray-50 dark:hover:bg-slate-700/50'
                    }`}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <span className="leading-tight">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="p-4 sm:p-6">
              {/* Dados Pessoais */}
              {activeTab === 'perfil' && (
                <div className="space-y-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Informações Pessoais</h2>
                    {!isEditing ? (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-rose-400 px-4 py-2 text-white transition-colors hover:bg-rose-500 sm:w-auto"
                      >
                        <Edit className="h-4 w-4" />
                        <span>Editar</span>
                      </button>
                    ) : (
                      <div className="grid grid-cols-2 gap-2 sm:flex">
                        <button
                          onClick={handlePersonalDataSave}
                          disabled={isSaving}
                          className="flex items-center justify-center gap-2 rounded-lg bg-green-500 px-4 py-2 text-white transition-colors hover:bg-green-600 disabled:bg-gray-400"
                        >
                          {isSaving ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          ) : (
                            <Save className="h-4 w-4" />
                          )}
                          <span>{isSaving ? 'Salvando...' : 'Salvar'}</span>
                        </button>
                        <button
                          onClick={() => setIsEditing(false)}
                          disabled={isSaving}
                          className="flex items-center justify-center gap-2 rounded-lg bg-gray-500 px-4 py-2 text-white transition-colors hover:bg-gray-600 disabled:bg-gray-400"
                        >
                          <X className="h-4 w-4" />
                          <span>Cancelar</span>
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                        Nome Completo
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        disabled={!isEditing}
                        className="min-w-0 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-rose-400 focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        E-mail
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        readOnly
                        disabled
                        className="min-w-0 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-400 focus:border-transparent disabled:bg-gray-100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Telefone
                      </label>
                      <input
                        type="tel"
                        value={formData.telefone}
                        onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                        disabled={!isEditing}
                        className="min-w-0 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-400 focus:border-transparent disabled:bg-gray-100"
                        placeholder="(11) 99999-9999"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CPF
                      </label>
                      <input
                        type="text"
                        value={formData.cpf}
                        readOnly
                        disabled
                        className="min-w-0 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-400 focus:border-transparent disabled:bg-gray-100"
                        placeholder="000.000.000-00"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Endereço */}
              {activeTab === 'endereco' && (
                <div className="space-y-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <h2 className="text-xl font-semibold text-gray-800">Endereço de Entrega</h2>
                    {!isEditingAddress ? (
                      <button
                        onClick={() => setIsEditingAddress(true)}
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-rose-400 px-4 py-2 text-white transition-colors hover:bg-rose-500 sm:w-auto"
                      >
                        <Edit className="h-4 w-4" />
                        <span>Editar</span>
                      </button>
                    ) : (
                      <div className="grid grid-cols-2 gap-2 sm:flex">
                        <button
                          onClick={handleAddressSave}
                          disabled={isSaving}
                          className="flex items-center justify-center gap-2 rounded-lg bg-green-500 px-4 py-2 text-white transition-colors hover:bg-green-600 disabled:bg-gray-400"
                        >
                          {isSaving ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          ) : (
                            <Save className="h-4 w-4" />
                          )}
                          <span>{isSaving ? 'Salvando...' : 'Salvar'}</span>
                        </button>
                        <button
                          onClick={() => setIsEditingAddress(false)}
                          disabled={isSaving}
                          className="flex items-center justify-center gap-2 rounded-lg bg-gray-500 px-4 py-2 text-white transition-colors hover:bg-gray-600 disabled:bg-gray-400"
                        >
                          <X className="h-4 w-4" />
                          <span>Cancelar</span>
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CEP
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={addressData.cep}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '');
                            setAddressData({ ...addressData, cep: value });
                            if (value.length === 8) {
                              handleCepSearch(value);
                            }
                          }}
                          disabled={!isEditingAddress}
                          className="min-w-0 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-400 focus:border-transparent disabled:bg-gray-100"
                          placeholder="00000000"
                          maxLength={8}
                        />
                        {isSearchingCep && (
                          <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-rose-400"></div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rua
                      </label>
                      <input
                        type="text"
                        value={addressData.rua}
                        onChange={(e) => setAddressData({ ...addressData, rua: e.target.value })}
                        disabled={!isEditingAddress}
                        className="min-w-0 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-400 focus:border-transparent disabled:bg-gray-100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Número
                      </label>
                      <input
                        type="text"
                        value={addressData.numero}
                        onChange={(e) => setAddressData({ ...addressData, numero: e.target.value })}
                        disabled={!isEditingAddress}
                        className="min-w-0 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-400 focus:border-transparent disabled:bg-gray-100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Complemento
                      </label>
                      <input
                        type="text"
                        value={addressData.complemento}
                        onChange={(e) => setAddressData({ ...addressData, complemento: e.target.value })}
                        disabled={!isEditingAddress}
                        className="min-w-0 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-400 focus:border-transparent disabled:bg-gray-100"
                        placeholder="Apartamento, bloco, etc."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bairro
                      </label>
                      <input
                        type="text"
                        value={addressData.bairro}
                        onChange={(e) => setAddressData({ ...addressData, bairro: e.target.value })}
                        disabled={!isEditingAddress}
                        className="min-w-0 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-400 focus:border-transparent disabled:bg-gray-100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cidade
                      </label>
                      <input
                        type="text"
                        value={addressData.cidade}
                        onChange={(e) => setAddressData({ ...addressData, cidade: e.target.value })}
                        disabled={!isEditingAddress}
                        className="min-w-0 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-400 focus:border-transparent disabled:bg-gray-100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Estado
                      </label>
                      <select
                        value={addressData.estado}
                        onChange={(e) => setAddressData({ ...addressData, estado: e.target.value })}
                        disabled={!isEditingAddress}
                        className="min-w-0 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-400 focus:border-transparent disabled:bg-gray-100"
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
              )}

              {/* Alterar Senha */}
              {activeTab === 'senha' && (
                <div className="space-y-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <h2 className="text-xl font-semibold text-gray-800">Alterar Senha</h2>
                    {!isEditingPassword ? (
                      <button
                        onClick={() => setIsEditingPassword(true)}
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-rose-400 px-4 py-2 text-white transition-colors hover:bg-rose-500 sm:w-auto"
                      >
                        <Edit className="h-4 w-4" />
                        <span>Alterar</span>
                      </button>
                    ) : (
                      <div className="grid grid-cols-2 gap-2 sm:flex">
                        <button
                          onClick={handlePasswordSave}
                          disabled={isSaving}
                          className="flex items-center justify-center gap-2 rounded-lg bg-green-500 px-4 py-2 text-white transition-colors hover:bg-green-600 disabled:bg-gray-400"
                        >
                          {isSaving ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          ) : (
                            <Save className="h-4 w-4" />
                          )}
                          <span>{isSaving ? 'Salvando...' : 'Salvar'}</span>
                        </button>
                        <button
                          onClick={() => {
                            setIsEditingPassword(false);
                            setPasswordData({
                              currentPassword: '',
                              newPassword: '',
                              confirmPassword: ''
                            });
                          }}
                          disabled={isSaving}
                          className="flex items-center justify-center gap-2 rounded-lg bg-gray-500 px-4 py-2 text-white transition-colors hover:bg-gray-600 disabled:bg-gray-400"
                        >
                          <X className="h-4 w-4" />
                          <span>Cancelar</span>
                        </button>
                      </div>
                    )}
                  </div>
                  

                  {isEditingPassword && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Senha Atual
                        </label>
                        <input
                          type="password"
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                          className="min-w-0 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-400 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nova Senha
                        </label>
                        <input
                          type="password"
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                          className="min-w-0 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-400 focus:border-transparent"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Confirmar Nova Senha
                        </label>
                        <input
                          type="password"
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                          className="min-w-0 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-400 focus:border-transparent"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
              {activeTab === 'pedidos' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Meus Pedidos</h2>
                  </div>

                  {!loadingOrders && orders.length === 0 && (
                    <div className="text-center p-8 border border-dashed rounded-lg dark:border-slate-700">
                      <Package className="w-10 h-10 mx-auto opacity-70 mb-2" />
                      <p className="text-gray-600 dark:text-gray-300">
                        Você ainda não possui pedidos.
                      </p>
                    </div>
                  )}

                  <div className="space-y-4">
                    {orders.map((o) => {
                      const isPickup = String(o.shipping_method || '').toLowerCase().includes('retirada');
                      const pickupStatus = getPickupStatusLabel(o.shipping?.status);

                      return (
                      <Link
                        to={`/order/${o.id}`}
                        key={o.id}
                        className="block bg-white dark:bg-slate-800/50 border border-gray-200 
                                  dark:border-slate-700/50 rounded-lg p-4 shadow-sm 
                                  hover:shadow-md hover:border-rose-300 transition"
                      >
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                          <div className="flex min-w-0 items-start gap-3">
                            <Package className="mt-0.5 h-5 w-5 flex-shrink-0 text-rose-400" />
                            <div className="min-w-0">
                              <div className="break-all font-semibold">Pedido #{o.id}</div>
                              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                <Calendar className="h-4 w-4 flex-shrink-0" />
                                {new Date(o.created_at).toLocaleString("pt-BR")}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className={statusPill(o.status)}>
                              {o.status}
                            </span>
                          </div>
                        </div>

                        <div className="mt-3 grid grid-cols-1 gap-3 text-sm md:grid-cols-3">
                          <div className="flex min-w-0 items-start gap-2">
                            <CreditCard className="mt-0.5 h-4 w-4 flex-shrink-0" />
                            <span className="min-w-0 break-words">
                              Pagamento: {o.payment_method} ({o.payment_status})
                            </span>
                          </div>
                          <div className="flex min-w-0 items-start gap-2">
                            <Truck className="mt-0.5 h-4 w-4 flex-shrink-0" />
                            <span className="min-w-0 break-words">{isPickup ? 'Retirada' : 'Entrega'}: {o.shipping_method}</span>
                          </div>
                          <div className="font-semibold md:text-left">
                            Total: R$ {formatMoney(o.total + o.shipping_cost)}
                          </div>
                        </div>

                        {isPickup && (
                          <div className="mt-2 text-sm text-amber-700 dark:text-amber-300">
                            Retirada: {pickupStatus}
                          </div>
                        )}

                        {o.items?.length ? (
                          <div className="mt-3 border-t border-gray-200 dark:border-slate-700 pt-3">
                            <ul className="space-y-1 text-sm">
                              {o.items.map((it) => (
                                <li
                                  key={it.id ?? `${it.product_id}-${it.price}`}
                                  className="flex flex-col gap-1 sm:flex-row sm:justify-between"
                                >
                                  <span className="min-w-0 break-words text-gray-700 dark:text-gray-200">
                                    {it.product_name} × {it.quantity}
                                  </span>
                                  <span className="flex-shrink-0 text-gray-600">
                                    R$ {formatMoney(it.price * it.quantity)}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ) : null}
                      </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Botão Sair */}
          <div className="mt-8 text-center">
            <button
              onClick={logout}
              className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg transition-colors mx-auto"
            >
              <LogOut className="h-5 w-5" />
              <span>Sair da Conta</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Perfil;
