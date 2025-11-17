module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Convert entry to an array if it's an object
      if (typeof webpackConfig.entry === 'object' && !Array.isArray(webpackConfig.entry)) {
        webpackConfig.entry = [];
      }
      
      // If entry is still not an array, make it one
      if (!Array.isArray(webpackConfig.entry)) {
        webpackConfig.entry = [];
      }
      
      // Filter out any JavaScript entry points
      webpackConfig.entry = webpackConfig.entry.filter(
        (entry) => {
          if (typeof entry === 'string') {
            return !entry.includes('index.js');
          }
          return true;
        }
      );
      
      // Add the TypeScript entry point if not already present
      const tsEntry = require.resolve('./src/index.tsx');
      if (!webpackConfig.entry.includes(tsEntry)) {
        webpackConfig.entry.push(tsEntry);
      }
      
      return webpackConfig;
    },
  },
};
