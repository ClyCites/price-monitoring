"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/store"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = React.useState(true)
  const { user, setUser } = useAuthStore()
  const router = useRouter()

  React.useEffect(() => {
    // We can rely on Zustand's persist middleware to handle storage
    // Just need to set loading state
    setIsLoading(false)
  }, [setUser])

  return <React.Fragment>{children}</React.Fragment>
}

// This is a compatibility layer to make existing code work with the Zustand store
export function useAuth() {
  const router = useRouter()
  const { user, isAuthenticated, setUser, logout } = useAuthStore()
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    setIsLoading(false)
  }, [])

  const signIn = (userData: any) => {
    setUser(userData)
  }

  const signOut = () => {
    logout()
    router.push("/login")
  }

  return { user, isLoading, signIn, signOut }
}

