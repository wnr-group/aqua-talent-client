import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { AuthResponse, LoginResponse, UserType } from '@/types'
import { api, tokenManager } from '@/services/api/client'

interface AuthContextType {
  user: AuthResponse | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (username: string, password: string, userType: UserType) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshUser = useCallback(async () => {
    // Only try to refresh if we have a token
    const token = tokenManager.getToken()
    if (!token) {
      setUser(null)
      return
    }

    try {
      const userData = await api.get<AuthResponse>('/auth/me')
      setUser(userData)
    } catch {
      // Token is invalid or expired, clear it
      tokenManager.clearToken()
      setUser(null)
    }
  }, [])

  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true)
      await refreshUser()
      setIsLoading(false)
    }

    initAuth()
  }, [refreshUser])

  const login = async (username: string, password: string, userType: UserType) => {
    const response = await api.post<LoginResponse>('/auth/login', {
      username,
      password,
      userType,
    })
    // Store the token and set user
    tokenManager.setToken(response.token)
    setUser(response.user)
  }

  const logout = async () => {
    try {
      await api.post('/auth/logout')
    } finally {
      // Always clear local state and token, even if API call fails
      tokenManager.clearToken()
      setUser(null)
    }
  }

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    refreshUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuthContext() {
  const context = useContext(AuthContext)

  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }

  return context
}
