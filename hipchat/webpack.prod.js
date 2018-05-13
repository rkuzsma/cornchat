const merge = require('webpack-merge');
const commonPromise = require('./webpack.common.js');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const prodConfig = {
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
}

module.exports = () => {
  return new Promise((resolve, reject) => {
    commonPromise().then((commonConfig) => {
      resolve(merge(commonConfig, prodConfig));
    });
  });
}
