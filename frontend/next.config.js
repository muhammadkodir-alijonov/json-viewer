/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone', // Docker uchun minimal bundle
};

module.exports = nextConfig;
