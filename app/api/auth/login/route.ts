import { createServerClient } from '@supabase/ssr'; // Correct import
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { Database } from '@/lib/supabase.types'; // Import Database type
import type { CookieOptions } from '@supabase/ssr'; // Import CookieOptions type

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json({ message: "Email and password are required" }, { status: 400 });
    }

    console.log("Login request received with payload:", { email }); // Don't log password

    const cookieStore = await cookies(); // Add await here
    // Initialize Supabase client correctly for SSR
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          async get(name: string) { // Add async
            return await cookieStore.get(name)?.value; // Add await
          },
          async set(name: string, value: string, options: CookieOptions) { // Add async
            try {
              await cookieStore.set({ name, value, ...options }); // Add await
            } catch (error) {
              // The `set` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
          async remove(name: string, options: CookieOptions) { // Add async
            try {
              await cookieStore.set({ name, value: '', ...options }); // Add await
            } catch (error) {
              // The `delete` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    );

    // Authenticate user with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    console.log("Supabase signInWithPassword response:", { data, error });

    if (error) {
      console.error("Supabase authentication error:", error);
      // Use a more generic error message for security
      return NextResponse.json({ message: "Invalid email or password" }, { status: 401 });
    }

    // No need to manually set cookie, createServerClient handles it

    // Return user data (without sensitive info)
    return NextResponse.json({
      message: "Login successful",
      user: {
        id: data.user?.id,
        email: data.user?.email,
        created_at: data.user?.created_at,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
