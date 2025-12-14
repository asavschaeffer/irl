const path = require('path');

module.exports = function (api) {
  api.cache(true);
  return {
    sourceType: 'unambiguous',
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      'nativewind/babel',
    ],
    plugins: [
      [
        'module-resolver',
        {
          alias: {
            '@unitools/image': '@unitools/image-expo',
            '@unitools/link': '@unitools/link-expo',
            '@unitools/router': '@unitools/router-expo',
          },
        },
      ],
      // Custom plugin to inline EXPO_ROUTER_APP_ROOT for require.context()
      // This is needed because require.context() requires string literals
      // NOTE: expo-router/babel is deprecated in SDK 50+ - don't add it back
      path.resolve(__dirname, 'babel-plugin-inline-expo-router-app-root'),
    ],
  };
};
