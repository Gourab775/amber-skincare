# AMBER — Natural Skincare

A premium e-commerce skincare website built with Next.js, featuring a clean aesthetic with natural tones, Shopify integration, and a seamless shopping experience.

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![React](https://img.shields.io/badge/React-19-61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38BDF8)

## Features

- **Modern UI/UX** — Clean, warm aesthetic with DM Sans + Playfair Display typography
- **Shopify Integration** — Product catalog powered by Shopify Storefront API
- **Cart System** — Context-based cart with slide-out drawer
- **Responsive Design** — Mobile-first layout across all pages
- **Dark/Light Mode** — Theme-aware with automatic system preference detection
- **Vercel Analytics** — Built-in performance monitoring

## Pages

| Route | Description |
|-------|-------------|
| `/` | Homepage with hero, products, ingredients, testimonials, newsletter |
| `/shop` | Full product catalog with filtering |
| `/product/[id]` | Individual product detail page |

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Styling:** Tailwind CSS 4 + shadcn/ui components
- **Backend:** Shopify Storefront API
- **Deployment:** Vercel

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

```env
NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN=your-token
```

## License

Private — All rights reserved.
