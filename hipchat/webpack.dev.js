const merge = require('webpack-merge');
const commonPromise = require('./webpack.common.js');
const path = require('path');
const fs = require('fs');
const webpack = require('webpack');

const envVar = (varName, defaultVal) => {
  return process.env[varName] ?
    process.env[varName] :
    defaultVal;
}

const CORNCHAT_APP_NAME = envVar('CORNCHAT_APP_NAME', "TestCornChat");

const devConfig = {
  // https://localhost:8080/bundle.js
  // https://localhost:8080/cornchat.css
  devServer: {
    contentBase: [
      './src/assets'
    ],
    disableHostCheck: true,
    https: true,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    https: {
      key: fs.readFileSync(__dirname + "/dev-certs/key.pem"),
      cert: fs.readFileSync(__dirname + "/dev-certs/cert.pem")
    }
  },
  devtool: 'inline-source-map',  // turn off eval() statements so we can map source easier in the debugger
  output: {
    filename: CORNCHAT_APP_NAME+'-bundle.js'
  },
  mode: 'development'
}

module.exports = () => {
  return new Promise((resolve, reject) => {
    commonPromise().then((commonConfig) => {
      resolve(merge(commonConfig, devConfig));
    });
  });
}
