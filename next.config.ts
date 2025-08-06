import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  
  // Disable webpack performance profiling completely
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
    
    // Completely disable performance profiling in development
    if (dev) {
      config.optimization = {
        ...config.optimization,
        removeAvailableModules: false,
        removeEmptyChunks: false,
        splitChunks: false,
      };
      
      // Disable source maps and profiling
      config.devtool = false;
      
      // Disable performance monitoring
      config.performance = {
        hints: false,
        maxEntrypointSize: 512000,
        maxAssetSize: 512000,
      };
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
  
  // Disable all profiling and monitoring
  poweredByHeader: false,
  generateEtags: false,
  
  // Disable experimental features that might cause profiling
  experimental: {
    // instrumentationHook is no longer needed in Next.js 15
    optimizePackageImports: [],
  },
};

export default nextConfig;
