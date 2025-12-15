export default { 
  experimental: { 
    serverActions: {
      enabled: true
    }
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        crypto: false,
        fs: false,
        path: false,
        os: false,
      };
    }
    config.resolve.alias = {
      ...config.resolve.alias,
      'node:crypto': false,
      'node:fs': false,
      'node:path': false,
      'node:os': false,
    };
    return config;
  }
};
