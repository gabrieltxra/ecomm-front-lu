import { useState } from "react";
import { useLocation } from "react-router-dom";
import {
  getAnalyticsConsent,
  setAnalyticsConsent,
  trackPageView,
  type AnalyticsConsent as AnalyticsConsentValue,
} from "@/lib/analytics";

export default function AnalyticsConsent() {
  const location = useLocation();
  const [choice, setChoice] = useState<AnalyticsConsentValue | null>(() => getAnalyticsConsent());
  const [open, setOpen] = useState(() => getAnalyticsConsent() === null);

  const choose = (nextChoice: AnalyticsConsentValue) => {
    setAnalyticsConsent(nextChoice);
    setChoice(nextChoice);
    setOpen(false);

    if (nextChoice === "granted") {
      const safePath = location.pathname.startsWith("/reset-password/")
        ? "/reset-password"
        : location.pathname;
      trackPageView(safePath);
    }
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-3 left-3 z-40 rounded-full border border-slate-300 bg-white/95 px-3 py-2 text-xs font-medium text-slate-700 shadow-md backdrop-blur hover:bg-slate-50"
        aria-label="Alterar preferências de cookies"
      >
        Cookies
      </button>
    );
  }

  return (
    <div className="fixed inset-x-3 bottom-3 z-[60] mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-5 text-slate-800 shadow-2xl sm:p-6" role="dialog" aria-modal="true" aria-labelledby="analytics-consent-title">
      <div className="space-y-4 sm:flex sm:items-center sm:justify-between sm:gap-6 sm:space-y-0">
        <div>
          <h2 id="analytics-consent-title" className="font-semibold">Sua privacidade importa</h2>
          <p className="mt-1 text-sm leading-relaxed text-slate-600">
            Usamos cookies analíticos opcionais para entender a navegação e melhorar a loja. Dados de login e pagamento não são enviados ao Analytics.
          </p>
          {choice && (
            <p className="mt-1 text-xs text-slate-500">
              Preferência atual: {choice === "granted" ? "analytics permitido" : "analytics recusado"}.
            </p>
          )}
        </div>

        <div className="flex shrink-0 flex-col gap-2 sm:min-w-44">
          <button type="button" onClick={() => choose("granted")} className="rounded-lg bg-rose-500 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-600">
            Aceitar analytics
          </button>
          <button type="button" onClick={() => choose("denied")} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            Recusar
          </button>
        </div>
      </div>
    </div>
  );
}
