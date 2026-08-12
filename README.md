# BasicTechShop

E-commerce de productos de computación construido con Next.js 16, TypeScript y Tailwind CSS.

## Descripción

BasicTechShop es una tienda online especializada en hardware, periféricos y componentes de computación. Incluye:

- **Tienda pública**: Catálogo con filtros, carrito y checkout
- **Panel de usuario**: Perfil, historial de pedidos y direcciones
- **Panel de administración**: Gestión de productos, usuarios y pedidos

## Stack Tecnológico

| Tecnología | Uso |
|------------|-----|
| Next.js 16 | Framework (App Router) |
| TypeScript | Lenguaje |
| Tailwind CSS v4 | Estilos |
| shadcn/ui | Componentes UI |
| Prisma | ORM |
| PostgreSQL | Base de datos |
| Zustand | Estado global |
| NextAuth.js | Autenticación |

## Requisitos

- Node.js 18+
- PostgreSQL (para backend)
- Docker (opcional)

## Instalación

```bash
# Clonar repositorio
git clone <repo-url>
cd ecommerce-basictech

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# Iniciar base de datos con Docker (opcional)
docker-compose up -d

# Ejecutar migraciones
npx prisma migrate dev

# Sembrar datos iniciales
npx prisma db seed
```

## Desarrollo

```bash
# Servidor de desarrollo
npm run dev

# Abrir http://localhost:3000
```

## Scripts Disponibles

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Inicia servidor de desarrollo |
| `npm run build` | Genera build de producción |
| `npm run start` | Inicia servidor de producción |
| `npm run lint` | Ejecuta ESLint |

## Estructura del Proyecto

```
src/
├── app/
│   ├── (shop)/          # Rutas públicas (tienda)
│   ├── (admin-panel)/   # Panel de administración
│   ├── (auth)/          # Login y registro
│   └── api/             # API Routes
├── components/
│   ├── ui/              # shadcn/ui
│   ├── layout/          # Header, Footer, Nav
│   ├── products/        # Componentes de productos
│   ├── cart/            # Carrito
│   └── admin/           # Panel admin
├── data/                # Datos mock
├── lib/                 # Utilidades
├── stores/              # Zustand stores
└── types/               # Tipos TypeScript
```

## Documentación

- [PRD](./docs/PRD.md) - Documento de requisitos del producto
- [Plan](./docs/PLAN.md) - Plan de implementación
- [Modelo de datos](./docs/DATA-MODEL.md) - Schema de base de datos
- [Páginas](./docs/PAGES.md) - Listado de rutas y endpoints

## Licencia

MIT
