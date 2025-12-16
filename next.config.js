/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  experimental: {
    serverComponentsExternalPackages: ['natural', 'simple-spellchecker']
  }
};

export default nextConfig;
