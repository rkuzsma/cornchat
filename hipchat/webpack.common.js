const path = require('path');
const fs = require('fs');
const webpack = require('webpack');

module.exports = {
  context: __dirname,
  entry: './src/app-loader.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  mode: 'development'
};
