import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  webpack: (config, { isServer }) => {
    // Exclude figma folder from webpack compilation
    config.watchOptions = {
      ...config.watchOptions,
      ignored: /figma/,
    };
    return config;
  },
};

export default nextConfig;
