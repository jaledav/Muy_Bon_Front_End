"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createClient } from "@supabase/supabase-js"

export default function DirectSignupTest() {
  const [name, setName] = useState("Test User")
  const [email, setEmail] = useState("test@example.com")
  const [password, setPassword] = useState("password123")
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const testDirectSignup = async () => {
    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      console.log("Testing direct Supabase signup...")

      // Create a fresh Supabase client
      const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

      // Sign up directly
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
          // Use NEXT_PUBLIC_APP_URL for redirect to ensure it works in different environments
          emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
        },
      })

      if (error) {
        throw error
      }

      setResult({
        success: true,
        user: data.user,
        session: data.session,
      })
    } catch (e) {
      console.error("Direct signup error:", e)
      setError(e instanceof Error ? e.message : "Unknown error")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Direct Supabase Signup Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="direct-name">Name</Label>
          <Input id="direct-name" value={name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)} disabled={isLoading} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="direct-email">Email</Label>
          <Input
            id="direct-email"
            type="email"
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="direct-password">Password</Label>
          <Input
            id="direct-password"
            type="password"
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            disabled={isLoading}
          />
        </div>

        <Button onClick={testDirectSignup} disabled={isLoading} className="w-full">
          {isLoading ? "Testing..." : "Test Direct Signup"}
        </Button>

        {result && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">Result:</h3>
            <div className="bg-gray-100 p-4 rounded-md overflow-auto max-h-96">
              <pre className="text-sm">{JSON.stringify(result, null, 2)}</pre>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
