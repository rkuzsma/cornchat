const merge = require('webpack-merge');
const commonPromise = require('./webpack.common.js');
const CopyWebpackPlugin = require('copy-webpack-plugin');
//const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const prodConfig = {
  output: {
    // Tweak this to match your GitHub project name
    publicPath: "/cornchat/",
  },
  plugins: [
    //new BundleAnalyzerPlugin(),
    new CopyWebpackPlugin([
      { from: 'src/assets' }
    ])
 ],
  mode: 'production'
}

module.exports = () => {
  return new Promise((resolve, reject) => {
    commonPromise().then((commonConfig) => {
      resolve(merge(commonConfig, prodConfig));
    });
  });
}
