/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,

  experimental: {
    optimizePackageImports: [
      "@react-three/drei",
      "@react-three/fiber"
    ]
  }
}

module.exports = nextConfig