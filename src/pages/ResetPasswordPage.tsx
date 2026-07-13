import Head from '@/components/ui/Head';
import { verifyResetTokenApi, resetPasswordApi } from '@/services/authService';
import React, { useState, FormEvent, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// Cores baseadas no seu design (image_89d298.jpg)
const PRIMARY_COLOR = '#E11D48';
const DARK_TEXT_COLOR = '#333333';
const GRAY_BACKGROUND = '#f6f8fb';

// Validação rápida no cliente (alinha com o backend)
function clientValidatePassword(pw: string, minLen = 8): string[] {
  const errs: string[] = [];
  if (!pw || pw.length < minLen) errs.push(`Mínimo de ${minLen} caracteres.`);
  if (!/[A-Z]/.test(pw) || !/[a-z]/.test(pw)) errs.push('Use maiúsculas e minúsculas.');
  if (!/\d/.test(pw)) errs.push('Inclua pelo menos um número.');
  return errs;
}

const ResetPasswordPage: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Estados de validação/inicialização
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isTokenValid, setIsTokenValid] = useState(false);

  const [loading, setLoading] = useState(false); // submit
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [pwHints, setPwHints] = useState<string[]>([]); // dicas/erros da senha

  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  // --- Validação do token ao carregar a página ---
  useEffect(() => {
    if (!token) {
      setError('Token de redefinição ausente. Por favor, use o link do seu e-mail.');
      setIsInitialLoading(false);
      return;
    }

    (async () => {
      try {
        await verifyResetTokenApi(token);
        setIsTokenValid(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Link inválido ou expirado.');
      } finally {
        setIsInitialLoading(false);
      }
    })();
  }, [token]);

  // Feedback de força/validade da senha em tempo real (UX)
  useEffect(() => {
    setPwHints(clientValidatePassword(password, 8));
  }, [password]);

  // --- Submit da nova senha ---
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    const pwErrors = clientValidatePassword(password, 8);
    if (pwErrors.length) {
      setError(pwErrors.join(' '));
      return;
    }

    setLoading(true);
    try {
      await resetPasswordApi({ token: token!, newPassword: password });
      setMessage('Sua senha foi redefinida com sucesso! Você será redirecionado para o login.');
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido ao redefinir a senha.');
    } finally {
      setLoading(false);
    }
  };

  // --- Renderização condicional ---
  if (isInitialLoading) {
    return (
      <div style={{ backgroundColor: GRAY_BACKGROUND, minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: DARK_TEXT_COLOR }}>
        <Head title={'Carregando | Ateliê Cortinas'} />
        <p>Verificando link de redefinição...</p>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: GRAY_BACKGROUND, minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <Head title={'Redefinir Senha | Ateliê Cortinas'} />

      <div style={{
        maxWidth: '400px',
        width: '90%',
        padding: '40px',
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}>

        <h1 style={{ color: DARK_TEXT_COLOR, textAlign: 'center', fontSize: '24px', marginBottom: '30px' }}>
          {isTokenValid ? 'Nova Senha' : 'Link Inválido'}
        </h1>

        {/* Mensagens de sucesso ou erro */}
        {message && <p style={{ color: 'green', backgroundColor: '#e8f5e9', padding: '10px', borderRadius: '4px', textAlign: 'center' }}>{message}</p>}
        {error && <p style={{ color: 'red', backgroundColor: '#ffebee', padding: '10px', borderRadius: '4px', textAlign: 'center' }}>{error}</p>}

        {/* Formulário somente se o token for válido e não houver success */}
        {isTokenValid && !message && (
          <form onSubmit={handleSubmit}>
            {/* 1. Nova Senha */}
            <div style={{ marginBottom: '12px' }}>
              <label htmlFor="password" style={{ display: 'block', color: DARK_TEXT_COLOR, marginBottom: '8px', fontSize: '14px' }}>Nova Senha</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                style={{ width: '100%', padding: '12px', border: `1px solid #ccc`, borderRadius: '4px', boxSizing: 'border-box' }}
              />
            </div>

            {/* Dicas/erros da senha (ao digitar) */}
            {password && pwHints.length > 0 && (
              <ul style={{ margin: '0 0 8px', paddingLeft: '18px', color: '#b00020', fontSize: '12px', lineHeight: 1.4 }}>
                {pwHints.map((h) => <li key={h}>{h}</li>)}
              </ul>
            )}

            {/* 2. Confirmação */}
            <div style={{ marginBottom: '20px' }}>
              <label htmlFor="confirmPassword" style={{ display: 'block', color: DARK_TEXT_COLOR, marginBottom: '8px', fontSize: '14px' }}>Confirme a Nova Senha</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
                style={{ width: '100%', padding: '12px', border: `1px solid #ccc`, borderRadius: '4px', boxSizing: 'border-box' }}
              />
            </div>

            {/* 3. Botão de Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                backgroundColor: PRIMARY_COLOR,
                color: 'white',
                padding: '12px',
                border: 'none',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                fontWeight: 'bold',
                opacity: loading ? 0.7 : 1,
                transition: 'background-color 0.3s',
              }}
            >
              {loading ? 'Redefinindo...' : 'Redefinir Senha'}
            </button>
          </form>
        )}

        {/* Link para solicitar novamente se inválido */}
        {!isTokenValid && !isInitialLoading && (
          <div style={{ textAlign: 'center' }}>
            <p className="mb-4">Ocorreu um erro. Por favor, solicite um novo link de redefinição.</p>
            <button
              onClick={() => navigate('/login')}
              style={{ backgroundColor: DARK_TEXT_COLOR, color: 'white', padding: '10px 20px', borderRadius: '4px', border: 'none' }}
            >
              Voltar para o Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordPage;
