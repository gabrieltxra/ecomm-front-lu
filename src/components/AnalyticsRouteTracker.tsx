import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { trackPageView } from "@/lib/analytics";

export default function AnalyticsRouteTracker() {
  const location = useLocation();

  useEffect(() => {
    const safePath = location.pathname.startsWith("/reset-password/")
      ? "/reset-password"
      : location.pathname;
    trackPageView(safePath);
  }, [location.pathname]);

  return null;
}
