const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add buffer polyfill for react-native-svg
config.resolver.alias = {
  ...config.resolver.alias,
  buffer: require.resolve('buffer'),
};

config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

module.exports = config;