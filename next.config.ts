import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  
  // Disable performance profiling to prevent .cpuprofile files
  experimental: {
    // instrumentationHook is no longer needed in Next.js 15
  },
  
  // Disable webpack performance profiling
  webpack: (config, { isServer, dev }) => {
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
    
    // Disable performance profiling in development
    if (dev) {
      config.optimization = {
        ...config.optimization,
        removeAvailableModules: false,
        removeEmptyChunks: false,
        splitChunks: false,
      };
      
      // Disable source maps for better performance
      config.devtool = false;
    }
    
    return config;
  },
  
  // Disable performance monitoring
  onDemandEntries: {
    // period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 25 * 1000,
    // number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 2,
  },
};

export default nextConfig;
