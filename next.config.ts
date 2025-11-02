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
  },
  webpack: (config) => {
    // Suppress unreachable code warnings from dependencies
    config.ignoreWarnings = [
      { module: /node_modules\/@apollo\/client/ },
      { module: /node_modules\/klaro/ },
      /unreachable code after return statement/
    ]
    return config
  }
};

export default nextConfig;
