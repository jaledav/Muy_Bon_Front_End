import { type CookieOptions, createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { sendVerificationEmail } from "@/lib/email/sender"; // Import email sender
import jwt from 'jsonwebtoken'; // Import jsonwebtoken

export async function POST(request: Request) {
  // Debug log for environment variables
  console.log('Environment check in signup route:');
  console.log('- NEXT_PUBLIC_SUPABASE_URL available:', !!process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log('- NEXT_PUBLIC_SUPABASE_ANON_KEY available:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  console.log('- RESEND_API_KEY available:', !!process.env.RESEND_API_KEY);

  try {
    const requestUrl = new URL(request.url);
    const { name, email, password } = await request.json();
    const cookieStore = await cookies(); // Add await here

    try {
      // Validate input
      if (!name || !email || !password) {
        return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
      }

      if (password.length < 8) {
        return NextResponse.json(
          { message: "Password must be at least 8 characters" },
          { status: 400 }
        );
      }

      const supabase = createServerClient(
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
                console.error("Error setting cookie in signup:", error);
              }
            },
            async remove(name: string, options: CookieOptions) { // Add async
              try {
                await cookieStore.set({ name, value: "", ...options }); // Add await
              } catch (error) {
                console.error("Error removing cookie in signup:", error);
              }
            },
          },
        }
      );

      // Sign up with Supabase. Ensure "Confirm email" is ENABLED in Supabase settings
      // even though we handle sending, Supabase needs it enabled to mark user as unconfirmed initially.
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name, // Include name in user metadata
          },
          // emailRedirectTo: undefined, // Not needed for manual flow
        },
      });

      // Handle potential signup errors, including the email sending failure if "Confirm email" is enabled
      if (signUpError) {
         // If the specific error is the internal email sending failure, log it but proceed
         // because we are sending our own email. Otherwise, return the error.
        if (signUpError.message.includes("Error sending confirmation email")) {
            console.warn("Supabase internal confirmation email failed (expected, as we send manually):", signUpError.message);
        } else {
            console.error("Supabase signup error:", signUpError);
            return NextResponse.json(
              { message: signUpError.message || "Could not authenticate user" },
              { status: signUpError.status || 400 }
            );
        }
      }

      // Ensure user object and ID exist before proceeding
      if (!data.user?.id) {
          console.error("Signup succeeded but no user ID returned. Cannot send verification email.");
          // Return a generic success message, but verification won't work
          return NextResponse.json({ message: "Signup successful, but verification email could not be sent." });
      }

      // Send our custom verification email via Resend with JWT token
      try {
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret || jwtSecret === "YOUR_STRONG_RANDOM_SECRET_HERE") {
          console.error("JWT_SECRET environment variable is not set or is still the placeholder.");
          throw new Error("Server configuration error: JWT secret missing or invalid.");
        }

        // Generate JWT token containing user ID, expires in 1 hour
        const verificationToken = jwt.sign(
          { userId: data.user.id }, // Use userId
          jwtSecret,
          { expiresIn: '1h' }
        );

        // Generate confirmation URL pointing to the manual verification endpoint
        // ALWAYS use the request's origin to ensure the port is correct
        const confirmationUrl = `${requestUrl.origin}/api/auth/verify-email?token=${verificationToken}`;

        // Send verification email
        console.log(`Sending verification email to ${email} with link: ${confirmationUrl}`);
        const emailResult = await sendVerificationEmail({
          to: email,
          name,
          confirmationUrl // Pass the JWT link to the email template
        });

        if (!emailResult.success) {
          console.error("Failed to send verification email via Resend:", emailResult.error);
          // Optionally, return an error here if email sending is critical
        } else {
          console.log("Verification email sent successfully via Resend.");
        }
      } catch (emailError) {
        console.error("Error preparing or sending verification email:", emailError);
        // Optionally, return an error response
      }

      // Return success message prompting user to check email
      return NextResponse.json({ message: "Signup successful, please check your email for confirmation." });

    } catch (error) {
      console.error("Unexpected signup error:", error);
      return NextResponse.json(
        { message: "Internal server error during signup" },
        { status: 500 }
      );
    }
  } catch (parseError) {
    console.error("Error parsing request JSON:", parseError);
    return NextResponse.json(
      { message: "Invalid request format" },
      { status: 400 }
    );
  }
}
