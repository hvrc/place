/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['storage.googleapis.com'],
    allowedDevOrigins: ['http://localhost:3000'],
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(ttf|woff|woff2)$/,
      type: 'asset/resource',
    });
    return config;
  },
};

module.exports = nextConfig;