/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_RAZORPAY_KEY_ID?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

interface Window {
  Razorpay?: new (options: Record<string, unknown>) => {
    open: () => void
    on: (event: string, callback: (response: unknown) => void) => void
  }
}
