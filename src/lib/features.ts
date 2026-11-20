/**
 * A loja online (vitrine, conta, carrinho, checkout e pedidos) fica desligada
 * por padrão. Para religar, defina VITE_ECOMMERCE_ENABLED=true no build.
 * Com a loja desligada, o site publica apenas a landing page.
 */
export const ECOMMERCE_ENABLED = import.meta.env.VITE_ECOMMERCE_ENABLED === "true";

export const SITE_URL = "https://lucortinas.com.br";
