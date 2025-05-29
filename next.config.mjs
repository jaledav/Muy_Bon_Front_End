/** @type {import('next').NextConfig} */
const nextConfig = {
  // ESLint and TypeScript checks are enabled by default when these are removed
  images: {
    domains: [
      "streetviewpixels-pa.googleapis.com",
      "lh3.googleusercontent.com",
      "images.trvl-media.com"
    ],
    // unoptimized: true, // Consider removing this to enable Next.js image optimization
  },
}

export default nextConfig