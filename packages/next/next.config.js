module.exports = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  poweredByHeader: false,
  swcMinify: true,
  webpack: (config, { defaultLoaders }) => ({
    ...config,
    module: {
      ...config.module,
      rules: [
        ...config.module.rules,
        {
          include: [/packages/],
          test: /\.ts$/,
          use: [defaultLoaders.babel],
        },
      ],
    },
  }),
};
