# Ateliê Lu Cortinas — site

Landing page e loja online do Ateliê Lu Cortinas (`https://lucortinas.com.br`), publicada no Cloudflare Pages.

## Loja online desativada (novembro de 2026)

A loja online está **desligada por tempo indeterminado**. O site publica apenas a landing page em `/`. O código da loja continua no repositório e pode ser religado por uma variável de ambiente.

### Como funciona

A chave é `VITE_ECOMMERCE_ENABLED`, lida em `src/lib/features.ts`. Só o valor exato `true` liga a loja; ausente ou qualquer outro valor mantém a loja desligada.

Com a loja **desligada** (padrão):

- `src/App.tsx` renderiza só a landing. Qualquer outra rota (`/ecommerce`, `/produtos`, `/product/:id`, `/login`, `/cadastro`, `/perfil`, `/cart`, `/checkout`, `/success`, `/order/:id`, recuperação de senha) volta para `/`.
- O carrinho e o login não são montados, então a landing não faz nenhuma chamada à API.
- Os botões da landing que levavam à loja passam a apontar para o WhatsApp, para a seção de projetos e para o Instagram.
- O build (`vite.config.ts`) gera `dist/_redirects` com redirecionamento 301 dessas rotas para `/`, para os buscadores retirarem as páginas antigas do índice. Esse arquivo só é gerado com a loja desligada.

### Para religar a loja

1. No Cloudflare Pages, defina `VITE_ECOMMERCE_ENABLED=true` nas variáveis de build e faça um novo deploy.
2. No backend (Render), defina `ECOMMERCE_ENABLED=true` e confira as credenciais de Mercado Pago, AbacatePay e Melhor Envio. Sem isso, as rotas da loja respondem 503.
3. Publique a API antes da loja, para que a vitrine não abra com a API ainda bloqueada.
4. Revise `public/sitemap.xml`, que hoje lista só a landing.

Para desligar de novo, remova a variável (ou use `false`) nos dois lados. Nesse caso, publique a loja antes da API, para que ninguém navegue na vitrine enquanto a API já recusa as chamadas.

### Rodar localmente

```sh
npm ci
npm run dev            # loja desligada (padrão)
VITE_ECOMMERCE_ENABLED=true npm run dev   # loja ligada; precisa de VITE_REACT_APP_API_URL
npm run build
npm run lint
```

---

# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/7f90d510-4219-4328-8608-3d0492ef6ae1

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/7f90d510-4219-4328-8608-3d0492ef6ae1) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/7f90d510-4219-4328-8608-3d0492ef6ae1) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
