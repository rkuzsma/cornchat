const path = require('path');
const fs = require('fs');
const webpack = require('webpack');

module.exports = {
  context: __dirname,
  entry: './src/app-loader.js',
  // http://localhost:8080/bundle.js
  // http://localhost:8080/cornchat.css
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
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  mode: 'development'
};

const productionConfig = merge([
  {
    output: {
      // Tweak this to match your GitHub project name
      publicPath: "/cornchat/",
    }
  }
]);
