// src/pages/ForgotPasswordPage.tsx
import Head from '@/components/ui/Head';
import React, { useEffect, useMemo, useState } from 'react';
import { ApiError, forgotPasswordApi } from '@/services/authService';
import { useNavigate } from 'react-router-dom';

const PRIMARY_COLOR = '#F0B5BA';
const DARK_TEXT_COLOR = '#333333';
const GRAY_BACKGROUND = '#f6f8fb';
const COOLDOWN_MS = 5 * 60 * 1000; // 5 minutos

function emailKey(email: string) {
  return `forgot_last_sent_${email.toLowerCase()}`;
}

function getRemainingMs(email: string) {
  const last = localStorage.getItem(emailKey(email));
  if (!last) return 0;
  const diff = COOLDOWN_MS - (Date.now() - Number(last));
  return Math.max(0, diff);
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [remaining, setRemaining] = useState(0);
  const navigate = useNavigate();

  // Atualiza o countdown a cada segundo quando há cooldown
  useEffect(() => {
    if (!email) return;
    setRemaining(getRemainingMs(email));
    const id = setInterval(() => {
      setRemaining(getRemainingMs(email));
    }, 1000);
    return () => clearInterval(id);
  }, [email]);

  const disabled = useMemo(() => submitting || !email || remaining > 0, [submitting, email, remaining]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg('');
    setErr('');

    // Validação simples
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      setErr('Informe um e-mail válido.');
      return;
    }

    // Enforce cooldown no cliente
    if (getRemainingMs(email) > 0) return;

    setSubmitting(true);
    try {
  await forgotPasswordApi(email);
  setMsg('Se o e-mail existir, enviaremos um link de redefinição.');
  localStorage.setItem(emailKey(email), String(Date.now()));
  setRemaining(COOLDOWN_MS);
} catch (e) {
  const error = e as ApiError;
  if (error.status === 429 && error.retryAfterMs) {
    localStorage.setItem(emailKey(email), String(Date.now() - (COOLDOWN_MS - error.retryAfterMs)));
    setRemaining(error.retryAfterMs);
    setErr('Aguarde alguns minutos antes de solicitar novamente.');
  } else {
    setErr(error.message || 'Erro ao solicitar redefinição.');
  }
}
finally {
      setSubmitting(false);
    }
  }

  const mm = Math.floor(remaining / 60000);
  const ss = Math.floor((remaining % 60000) / 1000);
  const countdownLabel = remaining > 0 ? `Aguarde ${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')} para reenviar.` : '';

  return (
    <div style={{ backgroundColor: GRAY_BACKGROUND, minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <Head title="Recuperar Senha | Ateliê Cortinas" />
      <div style={{
        maxWidth: '420px',
        width: '92%',
        padding: '32px',
        backgroundColor: '#fff',
        borderRadius: '10px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.08)'
      }}>
        <h1 style={{ color: DARK_TEXT_COLOR, textAlign: 'center', fontSize: '22px', marginBottom: '18px' }}>
          Recuperar senha
        </h1>
        <p style={{ color: '#555', fontSize: '14px', marginBottom: '20px', textAlign: 'center' }}>
          Informe seu e-mail para enviarmos um link de redefinição de senha.
        </p>

        {msg && <p style={{ color: 'green', backgroundColor: '#e8f5e9', padding: '10px', borderRadius: '4px', textAlign: 'center' }}>{msg}</p>}
        {err && <p style={{ color: 'red', backgroundColor: '#ffebee', padding: '10px', borderRadius: '4px', textAlign: 'center' }}>{err}</p>}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label htmlFor="email" style={{ display: 'block', color: DARK_TEXT_COLOR, marginBottom: '6px', fontSize: '14px' }}>E-mail</label>
            <input
              id="email"
              type="email"
              value={email}
              autoComplete="email"
              onChange={(e) => setEmail(e.target.value)}
              disabled={submitting}
              required
              style={{
                width: '100%', padding: '12px', border: '1px solid #ccc',
                borderRadius: '6px', boxSizing: 'border-box'
              }}
            />
          </div>

          {remaining > 0 && (
            <p style={{ color: '#a15', marginBottom: 10, fontSize: 12, textAlign: 'center' }}>{countdownLabel}</p>
          )}

          <button
            type="submit"
            disabled={disabled}
            style={{
              width: '100%',
              backgroundColor: PRIMARY_COLOR,
              color: 'white',
              padding: '12px',
              border: 'none',
              borderRadius: '6px',
              cursor: disabled ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              fontWeight: 600,
              opacity: disabled ? 0.7 : 1,
              transition: 'background 0.2s'
            }}
          >
            {submitting ? 'Enviando...' : 'Enviar link de recuperação'}
          </button>

          <button
            type="button"
            onClick={() => navigate('/login')}
            style={{
              marginTop: 12,
              width: '100%',
              backgroundColor: DARK_TEXT_COLOR,
              color: 'white',
              padding: '10px',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 600,
              opacity: 0.9
            }}
          >
            Voltar ao login
          </button>
        </form>
      </div>
    </div>
  );
}
