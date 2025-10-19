/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@tillless/shared', '@tillless/database'],
  experimental: {
    serverActions: {
      enabled: true,
    },
  },
};

module.exports = nextConfig;
