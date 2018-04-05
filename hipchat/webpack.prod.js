const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = merge(common, {
  output: {
    // Tweak this to match your GitHub project name
    publicPath: "/cornchat/",
  },
  plugins: [
     new CopyWebpackPlugin([
         { from: 'src/assets' }
     ])
 ],
  mode: 'production'
});
