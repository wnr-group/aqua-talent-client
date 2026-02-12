import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

async function enableMocking() {
  // Only enable MSW mock server if:
  // 1. Running in development mode AND
  // 2. No real API URL is configured (VITE_API_URL is not set)
  const useRealBackend = !!import.meta.env.VITE_API_URL

  if (import.meta.env.DEV && !useRealBackend) {
    console.log('[MSW] Mock server enabled - no VITE_API_URL configured')
    const { worker } = await import('./mocks/browser')
    return worker.start({
      onUnhandledRequest: 'bypass',
    })
  }

  if (useRealBackend) {
    console.log(`[API] Using real backend: ${import.meta.env.VITE_API_URL}`)
  }
}

enableMocking().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
})
