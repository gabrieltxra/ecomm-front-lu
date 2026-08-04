export type AnalyticsConsent = "granted" | "denied";

export type AnalyticsItemInput = {
  id: string | number;
  name: string;
  category?: string | null;
  price: number;
  quantity?: number;
  variant_label?: string | null;
};

type AnalyticsEventParameters = Record<string, unknown>;

declare global {
  interface Window {
    dataLayer?: unknown[][];
    gtag?: (...args: unknown[]) => void;
  }
}

const CONSENT_STORAGE_KEY = "lu_analytics_consent_v1";
const DEFAULT_MEASUREMENT_ID = "G-TP5L2DMT5S";
const MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || DEFAULT_MEASUREMENT_ID;

let consentDefaultsApplied = false;
let googleTagConfigured = false;

function ensureGtag() {
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || ((...args: unknown[]) => window.dataLayer?.push(args));
  return window.gtag;
}

function applyConsentDefaults() {
  if (consentDefaultsApplied) return;
  consentDefaultsApplied = true;

  ensureGtag()("consent", "default", {
    analytics_storage: "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    wait_for_update: 500,
  });
}

function loadGoogleTag() {
  if (document.getElementById("google-analytics-tag")) return;

  const script = document.createElement("script");
  script.id = "google-analytics-tag";
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(MEASUREMENT_ID)}`;
  document.head.appendChild(script);
}

function configureGoogleTag() {
  if (googleTagConfigured) return;
  googleTagConfigured = true;

  const gtag = ensureGtag();
  loadGoogleTag();
  gtag("js", new Date());
  gtag("config", MEASUREMENT_ID, {
    send_page_view: false,
  });
}

function clearAnalyticsCookies() {
  const cookieNames = document.cookie
    .split(";")
    .map((cookie) => cookie.split("=")[0]?.trim())
    .filter((name) => name === "_ga" || name?.startsWith("_ga_"));

  const hostParts = window.location.hostname.split(".");
  const domains = [window.location.hostname];
  if (hostParts.length >= 2) domains.push(`.${hostParts.slice(-2).join(".")}`);

  cookieNames.forEach((name) => {
    document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax`;
    domains.forEach((domain) => {
      document.cookie = `${name}=; Max-Age=0; path=/; domain=${domain}; SameSite=Lax`;
    });
  });
}

export function getAnalyticsConsent(): AnalyticsConsent | null {
  try {
    const stored = localStorage.getItem(CONSENT_STORAGE_KEY);
    return stored === "granted" || stored === "denied" ? stored : null;
  } catch {
    return null;
  }
}

export function initializeAnalyticsFromStoredConsent() {
  applyConsentDefaults();
  if (getAnalyticsConsent() === "granted") {
    ensureGtag()("consent", "update", {
      analytics_storage: "granted",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
    });
    configureGoogleTag();
  }
}

export function setAnalyticsConsent(consent: AnalyticsConsent) {
  try {
    localStorage.setItem(CONSENT_STORAGE_KEY, consent);
  } catch {
    // Continue with an in-memory consent update when storage is unavailable.
  }

  applyConsentDefaults();
  ensureGtag()("consent", "update", {
    analytics_storage: consent,
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });

  if (consent === "granted") configureGoogleTag();
  else clearAnalyticsCookies();

  window.dispatchEvent(new CustomEvent("analytics-consent-changed", { detail: consent }));
}

export function trackEvent(eventName: string, parameters: AnalyticsEventParameters = {}) {
  if (getAnalyticsConsent() !== "granted") return false;
  configureGoogleTag();
  ensureGtag()("event", eventName, parameters);
  return true;
}

export function trackPageView(path: string, title = document.title) {
  const safePath = path.startsWith("/") ? path : "/";
  return trackEvent("page_view", {
    page_path: safePath,
    page_location: `${window.location.origin}${safePath}`,
    page_title: title,
  });
}

export function toAnalyticsItem(item: AnalyticsItemInput) {
  return {
    item_id: String(item.id),
    item_name: item.name,
    item_category: item.category || undefined,
    item_variant: item.variant_label || undefined,
    price: Number(item.price),
    quantity: Number(item.quantity || 1),
  };
}

function itemsValue(items: AnalyticsItemInput[]) {
  return items.reduce(
    (total, item) => total + Number(item.price || 0) * Number(item.quantity || 1),
    0,
  );
}

function ecommerceParameters(items: AnalyticsItemInput[], extra: AnalyticsEventParameters = {}) {
  return {
    currency: "BRL",
    value: itemsValue(items),
    items: items.map(toAnalyticsItem),
    ...extra,
  };
}

export const trackViewItem = (product: AnalyticsItemInput) =>
  trackEvent("view_item", ecommerceParameters([product]));

export const trackViewItemList = (products: AnalyticsItemInput[], listName = "Catálogo") =>
  trackEvent("view_item_list", ecommerceParameters(products, { item_list_name: listName }));

export const trackAddToCart = (product: AnalyticsItemInput, quantity = 1) =>
  trackEvent("add_to_cart", ecommerceParameters([{ ...product, quantity }]));

export const trackRemoveFromCart = (product: AnalyticsItemInput, quantity = 1) =>
  trackEvent("remove_from_cart", ecommerceParameters([{ ...product, quantity }]));

export const trackViewCart = (items: AnalyticsItemInput[]) =>
  trackEvent("view_cart", ecommerceParameters(items));

export const trackBeginCheckout = (items: AnalyticsItemInput[]) =>
  trackEvent("begin_checkout", ecommerceParameters(items));

export const trackAddShippingInfo = (items: AnalyticsItemInput[], shippingTier: string) =>
  trackEvent("add_shipping_info", ecommerceParameters(items, { shipping_tier: shippingTier }));

export const trackAddPaymentInfo = (items: AnalyticsItemInput[], paymentType: string) =>
  trackEvent("add_payment_info", ecommerceParameters(items, { payment_type: paymentType }));

export const trackSearch = (searchTerm: string) =>
  trackEvent("search", { search_term: searchTerm });

export function trackPurchase(input: {
  transactionId: string;
  items: AnalyticsItemInput[];
  value: number;
  shipping?: number;
}) {
  const dedupeKey = `lu_ga_purchase_${input.transactionId}`;
  try {
    if (localStorage.getItem(dedupeKey)) return false;
  } catch {
    // The transaction_id still allows GA4 to deduplicate when storage is unavailable.
  }

  const sent = trackEvent("purchase", {
    transaction_id: input.transactionId,
    currency: "BRL",
    value: Number(input.value),
    shipping: Number(input.shipping || 0),
    items: input.items.map(toAnalyticsItem),
  });

  if (sent) {
    try {
      localStorage.setItem(dedupeKey, new Date().toISOString());
    } catch {
      // GA4 will still deduplicate using transaction_id.
    }
  }

  return sent;
}
