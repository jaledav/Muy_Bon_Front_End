import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { Database } from "@/lib/supabase.types"

export async function GET(request: Request) {
  const cookieStore = await cookies()

  // Create Supabase client with cookies
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    },
  )

  try {
    // Get user based on session managed by ssr client
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    // If there's no user or an error, return a 200 response with user: null
    // This prevents errors in the client and allows the app to work for non-authenticated users
    if (error || !user) {
      console.log("No authenticated user found:", error?.message || "No user in session")
      return NextResponse.json({ user: null }, { status: 200 })
    }

    // Return the user object
    return NextResponse.json({ user })
  } catch (err: any) {
    console.error("Route Error:", err)
    // Return a 200 response with user: null instead of an error
    return NextResponse.json({ user: null }, { status: 200 })
  }
}
