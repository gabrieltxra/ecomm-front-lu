import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const Perfil: React.FC = () => {
  const { user, isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn) navigate('/login');
  }, [isLoggedIn, navigate]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-rose-50 pt-24 pb-16 flex items-center justify-center">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md border border-rose-100 text-center">
        <h1 className="text-2xl font-bold text-rose-400 mb-4">Meu Perfil</h1>
        <div className="w-24 h-24 mx-auto rounded-full overflow-hidden border-2 border-primary mb-4">
          <img
            src={user.avatarUrl || '/images/avatar-default.jpg'}
            alt="Avatar"
            className="w-full h-full object-cover"
          />
        </div>
        <p className="text-lg font-semibold">{user.name}</p>
        <p className="text-gray-600 mb-6">{user.email}</p>

        <button
          onClick={logout}
          className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded transition"
        >
          Sair
        </button>
      </div>
    </div>
  );
};

export default Perfil;
