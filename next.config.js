/** @type {import('next').NextConfig} */
const nextConfig = {
output: "export",
  reactStrictMode: true,
  images: {
    unoptimized: true,
    domains: ['avatars.githubusercontent.com', 'github.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'github.com',
        pathname: '/**',
      }
    ],
  },
  trailingSlash: true,
}

module.exports = nextConfig

