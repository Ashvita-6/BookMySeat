// library-seat-frontend/next.config.ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Remove experimental features that might cause issues
  // experimental: {
  //   serverActions: true, // Removed unless you're actually using Server Actions
  // },
  
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api',
    NEXT_PUBLIC_SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5001',
  },
  
  // Add this to help with hydration issues
  reactStrictMode: true,
  
  // Disable SWC minification if having issues (optional)
  // swcMinify: false,
  
  // Configure images if using Next.js Image component
  images: {
    domains: ['localhost'],
  },
}

export default nextConfig