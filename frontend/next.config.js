/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    // Monaco editor uchun
    config.resolve.alias = {
      ...config.resolve.alias,
    };
    return config;
  },
};

module.exports = nextConfig;
