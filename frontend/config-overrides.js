const webpack = require('webpack');

module.exports = function override(config) {
  // Dodaj alias dla process/browser
  config.resolve = {
    ...config.resolve,
    alias: {
      ...config.resolve.alias,
      'process/browser': 'process/browser.js'
    },
    fallback: {
      crypto: require.resolve('crypto-browserify'),
      stream: require.resolve('stream-browserify'),
      assert: require.resolve('assert'),
      http: require.resolve('stream-http'),
      https: require.resolve('https-browserify'),
      os: require.resolve('os-browserify'),
      url: require.resolve('url'),
      vm: require.resolve('vm-browserify'),
      buffer: require.resolve('buffer'),
      process: require.resolve('process/browser')
    }
  };

  // Usuń istniejące definicje process.env
  config.plugins = config.plugins.filter(plugin => 
    !(plugin instanceof webpack.DefinePlugin)
  );

  // Dodaj nową definicję process.env
  config.plugins.push(
    new webpack.DefinePlugin({
      'process.env': JSON.stringify(process.env)
    }),
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer']
    })
  );

  return config;
}; 