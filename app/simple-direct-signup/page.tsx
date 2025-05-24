"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function SimpleDirectSignupPage() {
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
      // Make a direct API call to Supabase's signup endpoint
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        },
        body: JSON.stringify({
          email,
          password,
        }),
      })

      const data = await response.json()
      setResult(data)

      if (!response.ok) {
        throw new Error(data.error || data.msg || "Signup failed")
      }
    } catch (e) {
      console.error("Direct signup error:", e)
      setError(e instanceof Error ? e.message : "Unknown error")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#f9f5f0] py-16">
      <div className="container px-4 mx-auto max-w-7xl">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Simple Direct Signup Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="simple-email">Email</Label>
              <Input
                id="simple-email"
                 type="email"
                 value={email}
                 onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                 disabled={isLoading}
               />
            </div>

            <div className="space-y-2">
              <Label htmlFor="simple-password">Password</Label>
              <Input
                id="simple-password"
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
      </div>
    </main>
  )
}
