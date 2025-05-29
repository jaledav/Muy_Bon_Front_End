import { NextResponse } from "next/server";
import { Resend } from "resend";
import dotenv from "dotenv";
dotenv.config(); // Explicitly load .env.local

export async function POST() {
  console.log("Test email route triggered");
  console.log("RESEND_API_KEY available:", !!process.env.RESEND_API_KEY);
  console.log("RESEND_API_KEY value:", process.env.RESEND_API_KEY); // Debugging
  console.log("RESEND_API_KEY at runtime:", process.env.RESEND_API_KEY); // Debugging
  
  try {
    // Initialize Resend with a safety check
    if (!process.env.RESEND_API_KEY) {
      console.error("Missing Resend API key");
      return NextResponse.json(
        { 
          success: false, 
          error: "Missing Resend API key",
          apiKeyAvailable: false
        }, 
        { status: 500 }
      );
    }
    
    const resend = new Resend(process.env.RESEND_API_KEY);
    
    // Attempt to send a test email
    const { data, error } = await resend.emails.send({
      from: "onboarding@resend.dev", // Use your verified domain when possible
      to: "test@example.com", // Replace with your real email to test
      subject: "Test Email from Muy Bon App",
      html: "<p>This is a test email to verify that Resend is properly configured.</p>",
    });
    
    if (error) {
      console.error("Failed to send test email:", error);
      return NextResponse.json(
        { 
          success: false, 
          error: error.message,
          apiKeyAvailable: true
        }, 
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: "Test email sent successfully",
      data,
      apiKeyAvailable: true
    });
  } catch (error) {
    console.error("Error sending test email:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error",
        apiKeyAvailable: !!process.env.RESEND_API_KEY
      }, 
      { status: 500 }
    );
  }
}
