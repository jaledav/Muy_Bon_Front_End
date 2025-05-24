"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export interface User {
  id: number
  email: string
  name: string
  created_at: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  // Signup now returns a message on success
  signup: (name: string, email: string, password: string) => Promise<{ success: boolean; message?: string; error?: string }>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    console.log("AuthProvider: useEffect running, checking auth...");
    // Check if user is logged in on mount
    const checkAuth = async () => {
      try {
        console.log("AuthProvider: Fetching /api/auth/me...");
        const res = await fetch("/api/auth/me");
        console.log(`AuthProvider: /api/auth/me response status: ${res.status}`);
        if (res.ok) {
          const userData = await res.json();
          console.log("AuthProvider: User data received:", userData.user);
          setUser(userData.user);
        } else {
          console.log("AuthProvider: User not logged in or error fetching user.");
          setUser(null); // Ensure user is null if fetch wasn't ok
        }
      } catch (error) {
        console.error("AuthProvider: Auth check fetch failed:", error);
        setUser(null); // Ensure user is null on fetch error
      } finally {
        console.log("AuthProvider: Setting isLoading to false.");
        setIsLoading(false);
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
      setIsLoading(true);
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      // First check if response is ok before trying to parse JSON
      if (!res.ok) {
        try {
          const contentType = res.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const errorData = await res.json();
            return { success: false, error: errorData.message || "Signup failed" };
          } else {
            // Handle non-JSON responses
            const text = await res.text();
            console.error("Non-JSON error response:", text.substring(0, 100) + "...");
            return { success: false, error: `Server error: ${res.status}` };
          }
        } catch (parseError) {
          console.error("Error parsing error response:", parseError);
          return { success: false, error: `Server error: ${res.status}` };
        }
      }

      try {
        // Only try to parse JSON for successful responses
        const data = await res.json();
        // Don't set user here if email confirmation is needed
        // setUser(data.user) // Removed this line
        router.refresh(); // Refresh potentially needed data
        return { success: true, message: data.message };
      } catch (jsonError) {
        console.error("Error parsing JSON from successful response:", jsonError);
        return { success: false, error: "Unexpected response from server" };
      }
    } catch (error) {
      console.error("Signup error:", error);
      return { success: false, error: "An unexpected error occurred" };
    } finally {
      setIsLoading(false);
    }
  }

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
