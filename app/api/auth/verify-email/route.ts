import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js'; // Import the standard client for Admin API

// Define the expected payload structure of the JWT
interface VerificationTokenPayload {
  userId: string;
  iat: number; // Issued at timestamp
  exp: number; // Expiration timestamp
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const token = requestUrl.searchParams.get('token');
  const loginUrl = `${requestUrl.origin}/login`; // Base login URL

  if (!token) {
    return NextResponse.redirect(`${loginUrl}?error=Missing verification token`);
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret || jwtSecret === "YOUR_STRONG_RANDOM_SECRET_HERE") { // Check placeholder too
    console.error("JWT_SECRET environment variable is not set or is still the placeholder.");
    return NextResponse.redirect(`${loginUrl}?error=Server configuration error`);
  }

  try {
    // Verify the JWT token
    const decoded = jwt.verify(token, jwtSecret) as VerificationTokenPayload;
    const userId = decoded.userId; // Get userId from token

    if (!userId) {
      throw new Error("Invalid token payload: userId missing.");
    }

    // Initialize Supabase Admin Client (requires SERVICE_ROLE_KEY)
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY! // Use the Service Role Key here
    );

    // Add a small delay (e.g., 1 second) before attempting the update
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Update the user to confirm the email using the userId from the token
    const { data: updatedUserData , error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      userId, // Use userId directly from JWT
      { email_confirm: true } // Use email_confirm: true as per Admin API docs
    );

    if (updateError) {
      console.error("Error updating user confirmation:", updateError);
      // Distinguish user not found from other errors if possible
      if (updateError.message.includes("User not found")) {
         return NextResponse.redirect(`${loginUrl}?error=User not found during verification`);
      }
      throw new Error("Failed to update email confirmation status.");
    }

    console.log(`Email successfully confirmed for user ID: ${userId}`);
    // Redirect to login page with a success message
    return NextResponse.redirect(`${loginUrl}?message=Email verified successfully! Please log in.`);

  } catch (error: any) {
    console.error("Verification error:", error);
    let errorMessage = "Invalid or expired verification link.";
    if (error.name === 'TokenExpiredError') {
      errorMessage = "Verification link has expired.";
    } else if (error.name === 'JsonWebTokenError') {
      errorMessage = "Invalid verification link.";
    }
    return NextResponse.redirect(`${loginUrl}?error=${encodeURIComponent(errorMessage)}`);
  }
}
