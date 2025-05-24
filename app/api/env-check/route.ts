import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Return availability of key environment variables (not their values for security)
    return NextResponse.json({
      NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      RESEND_API_KEY: !!process.env.RESEND_API_KEY,
      NEXT_PUBLIC_APP_URL: !!process.env.NEXT_PUBLIC_APP_URL
    });
  } catch (error) {
    console.error("Error checking environment variables:", error);
    return NextResponse.json(
      { error: "Failed to check environment variables" },
      { status: 500 }
    );
  }
}