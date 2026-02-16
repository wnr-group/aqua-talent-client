import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    host: true, // Listen on all addresses
    port: 5173, // Non-privileged local dev port
    // Allow local development domains
    // Students use main domain, company and admin use subdomains
    allowedHosts: [
      'localhost',
      'aquatalent.local',
      'company.aquatalent.local',
      'admin.aquatalent.local',
    ],
  },
})
