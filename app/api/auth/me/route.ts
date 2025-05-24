import { createServerClient } from '@supabase/ssr'; // Correct import for v0.6.1
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { Database } from '@/lib/supabase.types'; // Import Database type

export async function GET(request: Request) {
  const cookieStore = await cookies(); // Add await here
  // Use the correct function name and pass cookies correctly
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async get(name: string) { // Add async
          return await cookieStore.get(name)?.value // Add await
        },
      },
    }
  );

  try {
    // Get user based on session managed by ssr client
    const { data: { user }, error } = await supabase.auth.getUser(); // Destructure user directly

    if (error || !user) {
      console.error('Supabase Auth Error:', error?.message || 'No user found');
      // If there's an error or no user, return 401
      return NextResponse.json({ error: 'Unauthorized: ' + (error?.message || 'No active session') }, { status: 401 });
    }

    // Return the user object
    return NextResponse.json({ user });
  } catch (err: any) { // Add type annotation for err
    console.error('Route Error:', err);
    // Provide a more generic error message to the client
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
