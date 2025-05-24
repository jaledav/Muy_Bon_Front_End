import dotenv from "dotenv";
dotenv.config(); // Explicitly load .env.local

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

console.log("RESEND_API_KEY at build time:", process.env.RESEND_API_KEY); // Debugging

export default nextConfig
