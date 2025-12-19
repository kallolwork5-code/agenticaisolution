/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable all type checking and linting for speed
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Disable source maps for faster builds
  productionBrowserSourceMaps: false,
  // Optimize for development speed
  swcMinify: false,
  // Exclude problematic directories
  webpack: (config, { dev }) => {
    if (dev) {
      // Exclude test files and complex components
      config.watchOptions = {
        ignored: [
          '**/node_modules/**',
          '**/__tests__/**',
          '**/tests/**',
          '**/*.test.*',
          '**/*.spec.*'
        ]
      }
    }
    return config
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:9000/api/:path*',
      },
    ]
  },
}

module.exports = nextConfig