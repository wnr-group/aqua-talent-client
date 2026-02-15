const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'
const TOKEN_KEY = 'aqua_talent_token'

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | undefined>
}

export class ApiClientError extends Error {
  status: number
  code?: string

  constructor(message: string, status: number, code?: string) {
    super(message)
    this.name = 'ApiClientError'
    this.status = status
    this.code = code
  }
}

// Token management
export const tokenManager = {
  getToken: (): string | null => {
    return localStorage.getItem(TOKEN_KEY)
  },
  setToken: (token: string): void => {
    localStorage.setItem(TOKEN_KEY, token)
  },
  clearToken: (): void => {
    localStorage.removeItem(TOKEN_KEY)
  },
}

function buildUrl(endpoint: string, params?: Record<string, string | number | undefined>): string {
  const url = new URL(`${API_BASE_URL}${endpoint}`)

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.append(key, String(value))
      }
    })
  }

  return url.toString()
}

export async function fetchApi<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { params, ...fetchOptions } = options
  const url = buildUrl(endpoint, params)

  const token = tokenManager.getToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers as Record<string, string>),
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  let response: Response

  try {
    response = await fetch(url, {
      ...fetchOptions,
      credentials: 'include',
      headers,
    })
  } catch (networkError) {
    // Handle network errors (backend not running, CORS, etc.)
    throw new ApiClientError(
      'Unable to connect to server. Please check if the backend is running.',
      0,
      'NETWORK_ERROR'
    )
  }

  if (!response.ok) {
    let errorMessage = 'An error occurred'
    let errorCode: string | undefined

    try {
      const errorData = await response.json()
      // Handle both backend formats: { error: "..." } and { message: "..." }
      errorMessage = errorData.error || errorData.message || errorMessage
      errorCode = errorData.code
    } catch {
      errorMessage = response.statusText
    }

    throw new ApiClientError(errorMessage, response.status, errorCode)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json()
}

export const api = {
  get: <T>(endpoint: string, params?: Record<string, string | number | undefined>) =>
    fetchApi<T>(endpoint, { method: 'GET', params }),

  post: <T>(endpoint: string, data?: unknown) =>
    fetchApi<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }),

  patch: <T>(endpoint: string, data?: unknown) =>
    fetchApi<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    }),

  delete: <T>(endpoint: string) =>
    fetchApi<T>(endpoint, { method: 'DELETE' }),
}
