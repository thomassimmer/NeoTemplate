/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  swcMinify: false,
  images: {
    domains: ['localhost', 'neotemplate.com'],
  },
  async redirects() {
    return [];
  },
  async rewrites() {
    return [
      {
        source: '/media/:path*',
        destination: `${process.env.NEXT_PRIVATE_BACKEND_URL}/media/:path*`,
      },
      {
        source: '/api/auth/password/reset/',
        destination: `${process.env.NEXT_PRIVATE_BACKEND_URL}/api/auth/password/reset/`,
      },
    ];
  },
};

module.exports = nextConfig;
