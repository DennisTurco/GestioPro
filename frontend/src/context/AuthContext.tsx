import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { UserAPI } from '../services/user.api'
import type { User } from '../types'

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('auth_token')
    if (!token) { setLoading(false); return }
    UserAPI.me()
      .then(setUser)
      .catch(() => localStorage.removeItem('auth_token'))
      .finally(() => setLoading(false))
  }, [])

  async function login(username: string, password: string) {
    const { token, user } = await UserAPI.login(username, password)
    localStorage.setItem('auth_token', token)
    setUser(user)
  }

  function logout() {
    localStorage.removeItem('auth_token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
