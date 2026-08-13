# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

BasicTechShop is an e-commerce application for computer products. This repo is the **frontend**, built with Next.js 16 (App Router), TypeScript, Tailwind CSS v4, and shadcn/ui.

### Nuevo enfoque: migración del backend a NestJS

El backend (antes implementado como API routes de Next.js + Prisma + NextAuth + Stripe) está **migrado a un API independiente en NestJS**: `../../nest/basictech-api`.

- Mismo modelo de datos (Prisma/PostgreSQL `basictech_shop`).
- Auth en Nest con **JWT** (access 15m + refresh 7d) en lugar de NextAuth.
- El frontend consume `http://localhost:3001` (API Nest) vía `src/lib/api.ts` (cliente fetch con JWT en localStorage + auto-refresh single-flight). Las API routes de Next (`src/app/api/*`) fueron eliminadas.

Estado de la migración:
- ✅ Migrado a Nest: auth (register/login/refresh/me), products, catalog (categories/brands), orders, addresses, checkout/Stripe + webhook, upload/Cloudinary, admin dashboard, admin users.
- ✅ Frontend conectado al API Nest (`http://localhost:3001`) y eliminadas las API routes de Next (`src/app/api/*`) y NextAuth.
- ⚠️ No crear features nuevas en Next; implementar en Nest (`../../nest/basictech-api`) y consumirlas con el cliente `src/lib/api.ts`.

Auth en el frontend:
- `src/stores/auth-store.ts` (Zustand) expone `user`, `status` y `init/login/register/logout`.
- `src/components/providers/AuthProvider.tsx` llama `init()` al montar (reemplaza a SessionProvider/NextAuth).
- Tokens en `localStorage` (`bts_access_token`, `bts_refresh_token`, `bts_user`); cookies `auth_token`/`auth_role` solo para el guard de rutas en `src/proxy.ts`.

### Component Organization
```
src/components/
├── layout/      # Header, Footer, TopBar, MobileNav, ThemeToggle
├── home/        # HeroBanner, CategoryGrid, FeaturedProducts, BrandSection
├── products/    # ProductCard, ProductGrid, FilterSidebar, filters
├── cart/        # CartItem, CartSummary, StripeCheckoutButton
├── checkout/    # ShippingForm, PaymentForm, OrderSummary
├── admin/       # AdminSidebar, AdminHeader, StatsCard, ImageUpload
├── profile/     # ProfileSidebar, ProfileMobileNav
├── providers/   # ThemeProvider, SessionProvider (next-themes/next-auth)
└── ui/          # shadcn/ui components
```

### Data Layer
- `src/data/mock-products.ts` - Products, categories, brands (todavía usado por BrandSection, CategoryFilter, BrandFilter, checkout)
- `src/data/mock-user.ts` - User profile, addresses, orders, favorites
- `src/data/mock-admin.ts` - Admin stats, users, payments
- `src/types/index.ts` - Core interfaces (Product, Category, CartItem, FilterState)

> Nota: algunos componentes/páginas aún usan datos mock (checkout, favorites, admin/payments, filtros de marca/categoría). Verificar antes de asumir datos reales. Los datos reales vienen de las API routes (`/api/*`).

### Styling System
- Tailwind CSS v4 with CSS variables in OKLCH color space
- Dark/light themes via `next-themes` (class strategy)
- Theme variables in `src/app/globals.css`
- Use `cn()` utility from `src/lib/utils.ts` for class merging

### Key Patterns

- Server Components by default, `"use client"` for interactivity
- useState for local UI state (filters, quantities)
- useMemo for computed values (filtered/sorted products)
- Layouts with nested routes for shared UI (admin, profile)
- Mobile-first responsive design with Sheet components for mobile nav
- Estado global con Zustand (`src/stores/`) para carrito, productos y usuario
- Formularios con react-hook-form + zod

## Configuration

- **Path alias**: `@/*` maps to `./src/*`
- **Images**: Remote patterns configured for `images.unsplash.com` y `res.cloudinary.com`
- **shadcn/ui**: "new-york" style, "neutral" base color, lucide icons
- **Variables de entorno**: `.env` (no versionado). NO contiene ni usa `NOTION_TOKEN` (token obsoleto removido; el MCP de Notion lee del entorno, no de este repo).

## Project Plan

See `/docs/PLAN.md` for the original implementation plan. El plan actual es la migración del backend a NestJS (`../../nest/basictech-api`).

## Rules

- Al momento de crear datos nuevos no uses Modales, usa paginas dedicadas para los formularios 
- no uses server actions, usa Route handlers
- para manejo de estado global usa Zustand
- para formularios usar react-hook-form y zod
