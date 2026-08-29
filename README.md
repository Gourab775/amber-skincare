# Amber Commerce

Premium skincare commerce workspace with curated catalog, cart operations, and storefront integration.

**Live Demo:** https://amber-skincare.vercel.app

**Category:** E-Commerce / Beauty & Retail
**Stack:** Next.js 16 · React 19 · TypeScript · Tailwind CSS 4 · Radix UI · Shopify Storefront API
**Language:** TypeScript

## Overview

Amber Commerce is a full-stack e-commerce platform for premium skincare brands. It delivers a warm, natural aesthetic with clean typography and a conversion-focused shopping experience. With Shopify-powered product catalog, context-based cart, and responsive storefront pages, it provides a professional retail presence ready for production deployment.

## Features

- **Curated Catalog** — Homepage with hero, featured products, ingredients, and testimonials; dedicated shop page with filtering and product detail routes.
- **Cart Operations** — Context-based cart state with slide-out drawer, quantity management, and checkout preparation.
- **Shopify Integration** — Product data sourced via Shopify Storefront API for reliable inventory and pricing.
- **Responsive Storefront** — Mobile-first layouts, optimized imagery, and consistent design tokens across devices.
- **Theme & Analytics** — Light/dark theme via next-themes with automatic system preference and Vercel Analytics for performance insights.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) |
| Frontend | React 19, TypeScript |
| Styling | Tailwind CSS 4, tw-animate-css, PostCSS |
| UI Primitives | Radix UI, class-variance-authority, clsx, tailwind-merge, shadcn/ui |
| Commerce | Shopify Storefront API (via `NEXT_PUBLIC_SHOPIFY_*`) |
| Forms & Validation | react-hook-form, zod, @hookform/resolvers |
| Utilities | lucide-react, sonner, embla-carousel, date-fns, vaul |
| Analytics | Vercel Analytics |

## Project Structure

```
amber-skincare/
├── app/
│   ├── page.tsx              # Homepage — hero, products, ingredients, testimonials, newsletter
│   ├── layout.tsx            # Root layout, providers, theme
│   ├── globals.css           # Global styles and design tokens (warm natural palette)
│   ├── shop/page.tsx         # Shop catalog with filtering
│   ├── product/[id]/page.tsx # Product detail page
│   └── actions/              # Server actions for commerce operations
├── components/
│   ├── ui/                   # Reusable UI primitives (button, card, dialog, etc.)
│   ├── header / navigation   # Site navigation variants
│   └── cart / product cards  # Commerce-specific components
├── hooks/                    # Custom React hooks
├── lib/
│   └── utils.ts              # Utility helpers (cn, etc.)
├── public/                   # Static assets and imagery
├── styles/                   # Additional styles
├── components.json           # shadcn/ui configuration
├── next.config.mjs           # Next.js configuration
├── tsconfig.json             # TypeScript configuration
├── postcss.config.mjs        # PostCSS configuration
└── package.json
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm / pnpm / bun

### Installation

```bash
npm install
cp .env.example .env.local
# Configure Shopify variables (see Environment Variables)
npm run dev
```

Open http://localhost:3000 to view the storefront.

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN` | Yes | Your Shopify store domain, e.g. `your-store.myshopify.com`. |
| `NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN` | Yes | Shopify Storefront API access token. |
| `SERVICE_API_KEY` | Optional | Platform service API key when integrating service features. |
| `SERVICE_BASE_URL` | Optional | Gateway base URL. |
| `SERVICE_MODEL` | Optional | Model identifier. |

> Alias: `SERVICE_*` is the canonical naming. `SERVICE_API_KEY`, `SERVICE_BASE_URL`, and `SERVICE_MODEL` are aliases for `AI_GATEWAY_API_KEY`, `AI_GATEWAY_BASE_URL`, and `AI_GATEWAY_MODEL` for backward compatibility. Prefer `SERVICE_*` for new deployments.

### Build

```bash
npm run build
npm start
```

## Deployment

**Vercel (recommended for Next.js + Shopify):**
- Import the repository, framework preset Next.js, build command `npm run build`, output `.next`, set Shopify env vars.

**Netlify:**
- Build command `npm run build`, publish `.next` (with Next.js plugin), add the same env vars.

**GitHub Pages (static export):**
- Set `output: 'export'` in `next.config.mjs` for static catalog, run `npm run build`, publish `out/` via GitHub Actions. For dynamic cart/checkout, use Vercel/Netlify with server functions.

## Customization

- **Branding:** Update `app/globals.css` for color tokens, typography (DM Sans + Playfair Display), and spacing.
- **Catalog:** Edit product fetching in `app/actions/` and shop pages under `app/shop/` and `app/product/`.
- **Cart:** Customize cart context and drawer components under `components/`.
- **Navigation:** Modify header/footer components and routing for new collections or pages.
- **Theme:** Adjust `components/theme-provider` logic and `app/layout.tsx` for default theme handling.

## License

MIT
