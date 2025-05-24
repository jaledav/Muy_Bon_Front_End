import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

async function main() {
  console.log("Testing Resend API key...");
  console.log("API key available:", !!process.env.RESEND_API_KEY);
  console.log("API key value:", process.env.RESEND_API_KEY ? "Key exists (not showing for security)" : "No key found");
  
  try {
    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not defined");
    }
    
    const { data, error } = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: "test@example.com",
      subject: "Test Email",
      html: "<p>This is a test email</p>"
    });
    
    console.log("Send attempt result:", { data, error });
  } catch (error) {
    console.error("Error testing Resend:", error);
  }
}

main();
