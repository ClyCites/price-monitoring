"\"use client"

import { useMutation } from "@tanstack/react-query"
import axios from "axios"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/context/auth-context"
import Cookies from "js-cookie"
import { useAuthStore } from "@/lib/store"

const API_URI = process.env.NEXT_PUBLIC_API_URL

export type LoginCredentials = {
  email: string
  password: string
}

export type RegisterCredentials = {
  name: string
  email: string
  password: string
}

export type ForgotPasswordData = {
  email: string
}

export type ResetPasswordData = {
  token: string
  newPassword: string
}

export type User = {
  _id: string
  name: string
  email: string
  role: string
}

export function useLogin() {
  const router = useRouter()
  const { signIn } = useAuth()
  const setToken = useAuthStore((state) => state.setToken)

  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const { data } = await axios.post(`${API_URI}/auth/login`, credentials)
      return data
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message ?? error.message)
    },
    onSuccess: (data) => {
      try {
        // Store in localStorage
        localStorage.setItem("user", JSON.stringify(data.data))
        localStorage.setItem("token", JSON.stringify(data.data.token))
        // Store in cookies
        Cookies.set("user", JSON.stringify(data.data), { expires: 7 })
        Cookies.set("token", data.data.token, { expires: 7 })
        // Set auth header
        axios.defaults.headers.common["Authorization"] = `Bearer ${data.data.token}`

        signIn(data.data)
        setToken(data.data.token)
        toast.success(data?.message ?? "Login successful!")

        router.push("/dashboard")
      } catch (error) {
        console.error("Error processing login response:", error)
        toast.error("Login successful, but there was an error processing the response")
      }
    },
  })
}

export function useRegister() {
  const router = useRouter()

  return useMutation({
    mutationFn: async (credentials: RegisterCredentials) => {
      const { data } = await axios.post(`${API_URI}/auth/register`, credentials)
      return data
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message ?? error.message)
    },
    onSuccess: (data) => {
      toast.success(data?.message ?? "Registration successful!")

      setTimeout(() => {
        router.push("/login")
      }, 2000)
    },
  })
}

export function useLogout() {
  const router = useRouter()
  const { signOut } = useAuth()
  const logout = useAuthStore((state) => state.logout)

  return useMutation({
    mutationFn: async () => {
      try {
        // Remove from localStorage
        localStorage.removeItem("user")
        localStorage.removeItem("token")
        // Remove from cookies
        Cookies.remove("user")
        Cookies.remove("token")
        // Remove auth header
        delete axios.defaults.headers.common["Authorization"]
      } catch (error) {
        console.error("Error during logout:", error)
      }
      return true
    },
    onSuccess: () => {
      signOut()
      logout()
      toast.success("Logged out successfully!")
      router.push("/login")
    },
  })
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: async (email: string) => {
      const { data } = await axios.post(`${API_URI}/auth/forgot-password`, { email })
      return data
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message ?? error.message)
    },
    onSuccess: (data) => {
      toast.success(data?.message ?? "Password reset email sent to your email!")
    },
  })
}

export function useResetPassword() {
  const router = useRouter()

  return useMutation({
    mutationFn: async ({ token, newPassword }: ResetPasswordData) => {
      const { data } = await axios.post(`${API_URI}/auth/reset-password/${token}`, { newPassword })
      return data
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message ?? error.message)
    },
    onSuccess: (data) => {
      toast.success(data?.message ?? "Password reset successfully!")
      setTimeout(() => {
        router.push("/login")
      }, 2000)
    },
  })
}

export function useUpdateProfile() {
  const { signIn } = useAuth()

  return useMutation({
    mutationFn: async (data: { name: string; email: string }) => {
      const response = await axios.put(`${API_URI}/users/profile`, data)
      return response.data
    },
    onSuccess: (data) => {
      try {
        // Update user in localStorage and cookies
        const updatedUser = data.user
        localStorage.setItem("user", JSON.stringify(updatedUser))
        Cookies.set("user", JSON.stringify(updatedUser), { expires: 7 })

        // Update auth context
        signIn(updatedUser)

        toast.success(data?.message ?? "Profile updated successfully!")
      } catch (error) {
        console.error("Error updating profile:", error)
        toast.error("Profile update successful, but there was an error processing the response")
      }
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message ?? error.message)
    },
  })
}

export function useChangePassword() {
  return useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      const response = await axios.put(`${API_URI}/users/change-password`, data)
      return response.data
    },
    onSuccess: (data) => {
      toast.success(data?.message ?? "Password changed successfully!")
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message ?? error.message)
    },
  })
}

