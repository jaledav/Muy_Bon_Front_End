"use client"

import type React from "react"

import { useState } from "react"
import { SendIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChatbotResponse } from "@/components/chatbot-response"

export default function Hero() {
  const [query, setQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [chatResponse, setChatResponse] = useState<string | null>(null)
  const [restaurants, setRestaurants] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setIsLoading(true)
    setChatResponse(null)
    setError(null)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      })

      if (!response.ok) {
        throw new Error(`API request failed with status: ${response.status}`)
      }

      const data = await response.json()
      
      // Debugging log to verify API response
      console.log("API Response:", data);

      setChatResponse(data.message)
      setRestaurants(data.restaurants || [])
    } catch (error) {
      console.error("Error in chat request:", error)
      setError("I'm sorry, I had trouble finding restaurants matching your request. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative px-4 py-24 overflow-hidden bg-[#f9f5f0]">
      <div className="container mx-auto max-w-7xl">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl font-playfair">
            Discover London's Finest Dining
          </h1>
          <p className="mb-10 text-lg text-muted-foreground">
            From hidden gems to celebrated institutions, find your next memorable meal
          </p>

          <form onSubmit={handleSubmit} className="flex w-full max-w-xl mx-auto mb-8 space-x-2">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="I need a romantic spot in Hackney for Thursday at 8pm..."
              className="h-12 text-base"
              disabled={isLoading}
            />
            <Button type="submit" size="lg" disabled={isLoading}>
              <SendIcon className="w-4 h-4" />
              <span className="sr-only">Send</span>
            </Button>
          </form>

          {isLoading && (
            <div className="flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" />
              <span className="ml-2">Finding the perfect spot...</span>
            </div>
          )}

          {error && <div className="p-4 text-red-600 bg-red-50 rounded-lg">{error}</div>}

          {chatResponse && <ChatbotResponse response={chatResponse} restaurants={restaurants} />}
        </div>
      </div>
    </div>
  )
}
