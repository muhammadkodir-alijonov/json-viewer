/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone', // Docker uchun minimal bundle
  allowedDevOrigins: ['10.50.71.116'], // ofis tarmog'idagi boshqa qurilmalar
};

module.exports = nextConfig;
