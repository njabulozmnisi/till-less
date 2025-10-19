/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@tillless/shared', '@tillless/database', '@tillless/ocr'],
  experimental: {
    serverActions: {
      enabled: true,
    },
  },
};

module.exports = nextConfig;
