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
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.(png|jpg|gif)$/,
        use: [
          {
            loader: 'base64-inline-loader?limit=1000&name=[name].[ext]'
          }
        ]
      },
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      }
    ]
  }
};
