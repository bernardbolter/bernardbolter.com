import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Whitelist the domain hosting your WordPress media files
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'artism.org',
        port: '',
        pathname: '/**', // Allows images from any path on this domain
      },
    ],
  }
};

export default nextConfig;
