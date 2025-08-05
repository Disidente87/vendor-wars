import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  webpack: (config, { isServer }) => {
    // Exclude figma folder from webpack compilation
    config.watchOptions = {
      ...config.watchOptions,
      ignored: /figma/,
    };
    
    // Exclude scripts directory from build
    config.module.rules.push({
      test: /scripts\/.*\.ts$/,
      loader: 'ignore-loader'
    });
    
    return config;
  },
};

export default nextConfig;
