import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { AuthResponse, UserType } from '@/types'
import { api } from '@/services/api/client'

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
    try {
      const userData = await api.get<AuthResponse>('/auth/me')
      setUser(userData)
    } catch {
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
    const userData = await api.post<AuthResponse>('/auth/login', {
      username,
      password,
      userType,
    })
    setUser(userData)
  }

  const logout = async () => {
    await api.post('/auth/logout')
    setUser(null)
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
