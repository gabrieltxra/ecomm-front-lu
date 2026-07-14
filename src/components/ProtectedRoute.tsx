import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isLoggedIn, isLoading } = useAuth();
  const location = useLocation();
  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center pt-20" aria-busy="true" role="status">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-rose-200 border-t-rose-500" />
          <p className="mt-3 text-sm text-muted-foreground">Carregando sua conta...</p>
        </div>
      </div>
    );
  }
  if (!isLoggedIn) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <>{children}</>;
}
