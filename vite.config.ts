import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// Rotas da loja online. Com a loja desligada, o Cloudflare Pages responde 301
// para a landing via _redirects, e os buscadores retiram essas URLs do índice.
const ECOMMERCE_PATHS = [
  "/ecommerce",
  "/produtos",
  "/product/*",
  "/login",
  "/cadastro",
  "/perfil",
  "/cart",
  "/forgot-password",
  "/reset-password/*",
  "/checkout",
  "/checkout/*",
  "/success",
  "/order/*",
];

const ecommerceRedirects = (enabled: boolean): Plugin => ({
  name: "ecommerce-redirects",
  apply: "build",
  generateBundle() {
    if (enabled) return;
    this.emitFile({
      type: "asset",
      fileName: "_redirects",
      source: ECOMMERCE_PATHS.map((from) => `${from} / 301`).join("\n") + "\n",
    });
  },
});

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");
  const ecommerceEnabled = env.VITE_ECOMMERCE_ENABLED === "true";

  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [
      react(),
      ecommerceRedirects(ecommerceEnabled),
      mode === 'development' &&
      componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
