"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase-client"

export interface User {
  id: string
  email: string
  name: string
  created_at: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signup: (
    name: string,
    email: string,
    password: string,
  ) => Promise<{ success: boolean; message?: string; error?: string }>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    console.log("AuthProvider: useEffect running, checking auth...")

    // Check if user is logged in on mount
    const checkAuth = async () => {
      try {
        console.log("AuthProvider: Fetching /api/auth/me...")
        const res = await fetch("/api/auth/me")
        console.log(`AuthProvider: /api/auth/me response status: ${res.status}`)

        if (res.ok) {
          const userData = await res.json()
          console.log("AuthProvider: User data received:", userData)

          // Only set the user if userData.user exists
          if (userData && userData.user) {
            console.log("AuthProvider: Setting user state with:", userData.user)
            setUser(userData.user)
          } else {
            console.log("AuthProvider: No user data in response, setting user to null")
            setUser(null)
          }
        } else {
          console.log("AuthProvider: Error response from /api/auth/me")
          setUser(null)
        }
      } catch (error) {
        console.error("AuthProvider: Auth check fetch failed:", error)
        setUser(null)
      } finally {
        console.log("AuthProvider: Setting isLoading to false.")
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        return { success: false, error: data.message || "Login failed" }
      }

      setUser(data.user)
      router.refresh()
      return { success: true }
    } catch (error) {
      console.error("Login error:", error)
      return { success: false, error: "An unexpected error occurred" }
    } finally {
      setIsLoading(false)
    }
  }

  const signup = async (name: string, email: string, password: string) => {
    try {
      // First attempt the signup
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Signup failed");
      }

      // The API route handles user creation and email sending.
      // The user will be authenticated after verifying their email.
      // We don't need to sign them in immediately here.

      return {
        success: true,
        message: data.message,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true)
      await fetch("/api/auth/logout", { method: "POST" })
      setUser(null)
      router.refresh()
      router.push("/")
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
