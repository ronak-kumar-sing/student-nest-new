module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['.'],
          alias: {
            '@': './',
            '@store': './src/store',
            '@components': './components',
            '@services': './src/services',
            '@utils': './src/utils',
            '@hooks': './src/hooks',
          },
        },
      ],
    ],
  };
};