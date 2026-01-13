// remove tudo que não for número
export const onlyDigits = (v: string) => v.replace(/\D/g, "");

// (11) 99999-9999 ou (11) 9999-9999
export const formatPhoneBR = (raw: string) => {
  const d = onlyDigits(raw).slice(0, 11);
  if (!d) return "";
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
};

// 000.000.000-00
export const formatCPF = (raw: string) => {
  const d = onlyDigits(raw).slice(0, 11);
  if (!d) return "";
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
};

export const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

// Validação real de CPF (dígitos verificadores)
export const isValidCPF = (cpfRaw: string) => {
  const cpf = onlyDigits(cpfRaw);
  if (cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  const calc = (base: string, factor: number) => {
    let total = 0;
    for (let i = 0; i < base.length; i++) total += Number(base[i]) * (factor - i);
    const mod = total % 11;
    return mod < 2 ? 0 : 11 - mod;
  };

  const d1 = calc(cpf.slice(0, 9), 10);
  const d2 = calc(cpf.slice(0, 9) + d1, 11);
  return cpf === cpf.slice(0, 9) + String(d1) + String(d2);
};

// senha “mínima decente” (ajuste como quiser)
export const validatePasswordBasic = (pw: string, opts?: { minLen?: number }) => {
  const minLen = opts?.minLen ?? 8;
  const errors: string[] = [];
  const v = pw ?? "";

  if (v.length < minLen) errors.push(`A senha deve ter pelo menos ${minLen} caracteres`);

  return { ok: errors.length === 0, errors };
};
