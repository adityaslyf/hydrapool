import type { NextConfig } from 'next';
import withPWA from 'next-pwa';

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
    dirs: [],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Minimal webpack config
  webpack: (config: any) => {
    config.plugins = config.plugins.filter(
      (plugin: any) => plugin.constructor.name !== 'ESLintWebpackPlugin',
    );
    return config;
  },
};

export default withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
})(nextConfig);
