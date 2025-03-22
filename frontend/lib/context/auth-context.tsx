"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/store"

export type User = {
  _id: string
  name: string
  email: string
  role: string
  token: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  signIn: (user: User) => void
  signOut: () => void
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = React.useState(true)
  const router = useRouter()
  const { user, setUser } = useAuthStore()

  React.useEffect(() => {
    // Check for stored user data
    try {
      const storedUser = localStorage.getItem("user")
      if (storedUser) {
        const userData = JSON.parse(storedUser)
        setUser(userData)
      }
    } catch (error) {
      console.error("Failed to parse stored user data:", error)
      localStorage.removeItem("user")
    }
    setIsLoading(false)
  }, [setUser])

  const signIn = (userData: User) => {
    setUser(userData)
    localStorage.setItem("user", JSON.stringify(userData))
  }

  const signOut = () => {
    setUser(null)
    localStorage.removeItem("user")
    localStorage.removeItem("token")
    router.push("/login")
  }

  return <AuthContext.Provider value={{ user, isLoading, signIn, signOut }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = React.useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

