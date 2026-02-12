# Quickstart: Job Marketplace Platform

**Date**: 2026-02-13
**Branch**: `001-job-marketplace`
**Scope**: Frontend development setup

## Prerequisites

- Node.js 18+ (LTS recommended)
- npm 9+ or pnpm 8+
- Git
- Code editor (VS Code recommended)

## Quick Start

```bash
# 1. Clone and enter project
cd aqua-talent-client

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

## Project Setup (From Scratch)

### 1. Initialize Vite + React + TypeScript

```bash
npm create vite@latest . -- --template react-ts
npm install
```

### 2. Install Dependencies

```bash
# Core dependencies
npm install react-router-dom react-hook-form @hookform/resolvers zod date-fns

# Dev dependencies
npm install -D tailwindcss postcss autoprefixer @tailwindcss/forms
npm install -D vitest @testing-library/react @testing-library/jest-dom
npm install -D msw --save-dev
```

### 3. Configure Tailwind CSS

```bash
npx tailwindcss init -p
```

Update `tailwind.config.js`:
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
```

Update `src/index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 4. Configure TypeScript

Update `tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### 5. Configure Path Aliases

Update `vite.config.ts`:
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

### 6. Environment Variables

Create `.env.development`:
```bash
VITE_API_URL=http://localhost:3001/api
```

Create `.env.production`:
```bash
VITE_API_URL=https://api.aquatalent.com
```

## Development Modes

### With Mock API (No Backend)

MSW (Mock Service Worker) provides realistic API mocking:

```bash
# Enable mocks (set in .env.development)
VITE_ENABLE_MOCKS=true

npm run dev
```

### With Real API

```bash
# Disable mocks
VITE_ENABLE_MOCKS=false

# Point to your API
VITE_API_URL=http://localhost:3001/api

npm run dev
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (http://localhost:5173) |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run test` | Run tests with Vitest |
| `npm run test:ui` | Run tests with UI |
| `npm run lint` | Run ESLint |
| `npm run type-check` | Run TypeScript compiler check |

## Project Structure

```
src/
├── components/          # Shared UI components
├── features/            # Feature modules
│   ├── auth/           # Authentication
│   ├── company/        # Company portal
│   ├── student/        # Student portal
│   └── admin/          # Admin portal
├── services/api/       # API client
├── contexts/           # React contexts
├── hooks/              # Shared hooks
├── types/              # TypeScript types
├── utils/              # Utilities
├── config/             # Configuration
└── mocks/              # MSW handlers (dev only)
```

## Portal Routes

| Portal | Base URL | Description |
|--------|----------|-------------|
| Auth | `/login`, `/register/:type` | Shared authentication |
| Company | `/company/*` | Job posting, applicant management |
| Student | `/student/*` | Job search, applications |
| Admin | `/admin/*` | Moderation queues |

## Testing

```bash
# Run all tests
npm run test

# Run with coverage
npm run test -- --coverage

# Run specific test file
npm run test -- src/features/auth/
```

## Recommended VS Code Extensions

- ESLint
- Prettier
- Tailwind CSS IntelliSense
- TypeScript Vue Plugin (Volar) - for better TS support

## Troubleshooting

### Port 5173 already in use
```bash
npm run dev -- --port 3000
```

### TypeScript errors after install
```bash
rm -rf node_modules package-lock.json
npm install
```

### API connection issues
- Check `VITE_API_URL` in `.env.development`
- Ensure CORS is enabled on API server
- Check browser Network tab for actual requests

## Next Steps

1. Run `/speckit.tasks` to generate implementation tasks
2. Start with Phase 1 (Setup) tasks
3. Implement features by user story priority (P1 → P2 → P3 → P4)
