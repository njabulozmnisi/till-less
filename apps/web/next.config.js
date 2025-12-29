const { withSentryConfig } = require('@sentry/nextjs');

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

// Sentry configuration options
const sentryWebpackPluginOptions = {
  // Suppress logs during build
  silent: true,
  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/
};

// Wrap config with Sentry only if DSN is configured
const moduleExports = process.env.NEXT_PUBLIC_SENTRY_DSN
  ? withSentryConfig(nextConfig, sentryWebpackPluginOptions)
  : nextConfig;

module.exports = moduleExports;
