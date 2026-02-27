import { createContext, useContext, useState, useEffect } from 'react'
import { api, clearStoredTokens } from '../api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined) // undefined = loading

  useEffect(() => {
    api.getMe().then((res) => {
      setUser(res.data?.user ?? null)
    })
  }, [])

  const logout = () => {
    api.logout()
    clearStoredTokens()
    setUser(null)
  }

  const refreshUser = async () => {
    const res = await api.getMe()
    setUser(res.data?.user ?? null)
  }

  return (
    <AuthContext.Provider value={{ user, setUser, logout, refreshUser }}>
      {user !== undefined ? children : null}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
