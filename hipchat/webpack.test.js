const webpack = require('webpack');
const merge = require('webpack-merge');
const nodeExternals = require('webpack-node-externals');
const commonConfig = require('./webpack.common.js');

const testConfig = {
  target: 'node', // webpack should compile node compatible code
  externals: [nodeExternals()], // in order to ignore all modules in node_modules folder
  mode: 'development',
  node: {
    fs: "empty"
  }
}

module.exports = merge(testConfig, commonConfig);
