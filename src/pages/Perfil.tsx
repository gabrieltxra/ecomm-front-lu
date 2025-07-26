import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { 
  User, 
  MapPin, 
  Lock, 
  Mail, 
  Phone, 
  Edit, 
  Save, 
  X, 
  LogOut,
  Camera
} from 'lucide-react';
import { toast } from 'sonner';

const Perfil: React.FC = () => {
  const { user, isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('perfil');
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);

  // Estados para dados pessoais
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    cpf: user?.cpf || ''
  });

  // Estados para endereço
  const [addressData, setAddressData] = useState({
    cep: user?.address?.cep || '',
    street: user?.address?.street || '',
    number: user?.address?.number || '',
    complement: user?.address?.complement || '',
    neighborhood: user?.address?.neighborhood || '',
    city: user?.address?.city || '',
    state: user?.address?.state || ''
  });

  // Estados para senha
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (!isLoggedIn) navigate('/login');
  }, [isLoggedIn, navigate]);

  if (!user) return null;

  const handlePersonalDataSave = async () => {
    try {
      // Aqui você implementaria a chamada para a API
      toast.success('Dados pessoais atualizados com sucesso!');
      setIsEditing(false);
    } catch (error) {
      toast.error('Erro ao atualizar dados pessoais');
    }
  };

  const handleAddressSave = async () => {
    try {
      // Aqui você implementaria a chamada para a API
      toast.success('Endereço atualizado com sucesso!');
      setIsEditingAddress(false);
    } catch (error) {
      toast.error('Erro ao atualizar endereço');
    }
  };

  const handlePasswordSave = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }
    
    try {
      // Aqui você implementaria a chamada para a API
      toast.success('Senha atualizada com sucesso!');
      setIsEditingPassword(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      toast.error('Erro ao atualizar senha');
    }
  };

  const handleCepSearch = async (cep: string) => {
    if (cep.length === 8) {
      try {
        // Aqui você implementaria a busca do CEP na API
        // Por enquanto, vamos simular
        toast.info('Buscando CEP...');
      } catch (error) {
        toast.error('Erro ao buscar CEP');
      }
    }
  };

  const tabs = [
    { id: 'perfil', label: 'Dados Pessoais', icon: User },
    { id: 'endereco', label: 'Endereço', icon: MapPin },
    { id: 'senha', label: 'Alterar Senha', icon: Lock }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-rose-50 dark:from-slate-900 dark:to-slate-800 pt-24 pb-16">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-lg shadow-lg dark:shadow-dark p-6 mb-8 border border-gray-200 dark:border-slate-700/50">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-rose-100 dark:border-gray-600">
                  <img
                    src={user.avatarUrl || '/placeholder.svg'}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
                <button className="absolute bottom-0 right-0 bg-rose-400 text-white p-2 rounded-full hover:bg-rose-500 transition-colors">
                  <Camera className="h-4 w-4" />
                </button>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-rose-400 mb-2">Meu Perfil</h1>
                <p className="text-gray-600 dark:text-gray-300">{user.email}</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-lg shadow-lg dark:shadow-dark overflow-hidden border border-gray-200 dark:border-slate-700/50">
            <div className="flex border-b border-gray-200 dark:border-slate-700/50">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'text-rose-400 border-b-2 border-rose-400 bg-rose-50 dark:bg-slate-700/50'
                        : 'text-gray-600 dark:text-slate-300 hover:text-rose-400 hover:bg-gray-50 dark:hover:bg-slate-700/50'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="p-6">
              {/* Dados Pessoais */}
              {activeTab === 'perfil' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Informações Pessoais</h2>
                    {!isEditing ? (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center space-x-2 bg-rose-400 text-white px-4 py-2 rounded-lg hover:bg-rose-500 transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                        <span>Editar</span>
                      </button>
                    ) : (
                      <div className="flex space-x-2">
                        <button
                          onClick={handlePersonalDataSave}
                          className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                        >
                          <Save className="h-4 w-4" />
                          <span>Salvar</span>
                        </button>
                        <button
                          onClick={() => setIsEditing(false)}
                          className="flex items-center space-x-2 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
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
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-rose-400 focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        E-mail
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        disabled={!isEditing}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-400 focus:border-transparent disabled:bg-gray-100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Telefone
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        disabled={!isEditing}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-400 focus:border-transparent disabled:bg-gray-100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CPF
                      </label>
                      <input
                        type="text"
                        value={formData.cpf}
                        onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                        disabled={!isEditing}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-400 focus:border-transparent disabled:bg-gray-100"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Endereço */}
              {activeTab === 'endereco' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-800">Endereço de Entrega</h2>
                    {!isEditingAddress ? (
                      <button
                        onClick={() => setIsEditingAddress(true)}
                        className="flex items-center space-x-2 bg-rose-400 text-white px-4 py-2 rounded-lg hover:bg-rose-500 transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                        <span>Editar</span>
                      </button>
                    ) : (
                      <div className="flex space-x-2">
                        <button
                          onClick={handleAddressSave}
                          className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                        >
                          <Save className="h-4 w-4" />
                          <span>Salvar</span>
                        </button>
                        <button
                          onClick={() => setIsEditingAddress(false)}
                          className="flex items-center space-x-2 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
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
                      <input
                        type="text"
                        value={addressData.cep}
                        onChange={(e) => {
                          setAddressData({ ...addressData, cep: e.target.value });
                          handleCepSearch(e.target.value);
                        }}
                        disabled={!isEditingAddress}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-400 focus:border-transparent disabled:bg-gray-100"
                        placeholder="00000-000"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rua
                      </label>
                      <input
                        type="text"
                        value={addressData.street}
                        onChange={(e) => setAddressData({ ...addressData, street: e.target.value })}
                        disabled={!isEditingAddress}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-400 focus:border-transparent disabled:bg-gray-100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Número
                      </label>
                      <input
                        type="text"
                        value={addressData.number}
                        onChange={(e) => setAddressData({ ...addressData, number: e.target.value })}
                        disabled={!isEditingAddress}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-400 focus:border-transparent disabled:bg-gray-100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Complemento
                      </label>
                      <input
                        type="text"
                        value={addressData.complement}
                        onChange={(e) => setAddressData({ ...addressData, complement: e.target.value })}
                        disabled={!isEditingAddress}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-400 focus:border-transparent disabled:bg-gray-100"
                        placeholder="Apartamento, bloco, etc."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bairro
                      </label>
                      <input
                        type="text"
                        value={addressData.neighborhood}
                        onChange={(e) => setAddressData({ ...addressData, neighborhood: e.target.value })}
                        disabled={!isEditingAddress}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-400 focus:border-transparent disabled:bg-gray-100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cidade
                      </label>
                      <input
                        type="text"
                        value={addressData.city}
                        onChange={(e) => setAddressData({ ...addressData, city: e.target.value })}
                        disabled={!isEditingAddress}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-400 focus:border-transparent disabled:bg-gray-100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Estado
                      </label>
                      <select
                        value={addressData.state}
                        onChange={(e) => setAddressData({ ...addressData, state: e.target.value })}
                        disabled={!isEditingAddress}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-400 focus:border-transparent disabled:bg-gray-100"
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
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-800">Alterar Senha</h2>
                    {!isEditingPassword ? (
                      <button
                        onClick={() => setIsEditingPassword(true)}
                        className="flex items-center space-x-2 bg-rose-400 text-white px-4 py-2 rounded-lg hover:bg-rose-500 transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                        <span>Alterar</span>
                      </button>
                    ) : (
                      <div className="flex space-x-2">
                        <button
                          onClick={handlePasswordSave}
                          className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                        >
                          <Save className="h-4 w-4" />
                          <span>Salvar</span>
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
                          className="flex items-center space-x-2 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
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
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-400 focus:border-transparent"
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
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-400 focus:border-transparent"
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
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-400 focus:border-transparent"
                        />
                      </div>
                    </div>
                  )}
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
