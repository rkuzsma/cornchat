const remoteConfigPromise = require('./webpack.remote.js');
const merge = require('webpack-merge');
//const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const envVar = (varName, defaultVal) => process.env[varName] ? process.env[varName] : defaultVal;

const CORNCHAT_APP_NAME = envVar('CORNCHAT_APP_NAME', "ProdCornChat");

const prodConfig = {
  output: {
    filename: CORNCHAT_APP_NAME+'-bundle.js',
    // Tweak this to match your GitHub project name
    publicPath: "/cornchat/"
  },
  plugins: [
    //new BundleAnalyzerPlugin()
  ],
  mode: 'production'
}

module.exports = () => {
  return new Promise((resolve, reject) => {
    remoteConfigPromise(CORNCHAT_APP_NAME).then((remoteConfig) => {
      resolve(merge(remoteConfig, prodConfig));
    });
  });
}
