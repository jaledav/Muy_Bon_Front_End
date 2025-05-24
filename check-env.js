import dotenv from "dotenv";
dotenv.config({ path: ".env" }); // Explicitly specify the path to the new .env file

console.log("Environment variables test:");
console.log("RESEND_API_KEY available:", !!process.env.RESEND_API_KEY);
console.log("RESEND_API_KEY from .env:", process.env.RESEND_API_KEY);
