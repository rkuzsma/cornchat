const path = require('path');
const fs = require('fs');
const webpack = require('webpack');

const envVar = (varName, defaultVal) => {
  return process.env[varName] ?
    process.env[varName] :
    defaultVal;
}

module.exports = {
  context: __dirname,
  entry: './src/app-loader.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/'
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
        test: /\.css$/,
        use: [ 'style-loader', 'css-loader' ]
      },
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      // All default values come from our "TestCornChat" AWS cloudformation stack
      // To get the values for a stack, in ../webapp run: ./list-env.sh TestCornChat
      'CORNCHAT_AWS_REGION': JSON.stringify(envVar('CORNCHAT_AWS_REGION',
          "us-east-1")),
      'CORNCHAT_APP_NAME': JSON.stringify(envVar('CORNCHAT_APP_NAME',
          "TestCornChat")),
      'CORNCHAT_IDENTITY_POOL_ID': JSON.stringify(envVar('CORNCHAT_IDENTITY_POOL_ID',
          "us-east-1:6d9338ec-3686-466c-a05d-591256b4832b")),
      'CORNCHAT_GRAPHQL_ENDPOINT_URL': JSON.stringify(envVar('CORNCHAT_GRAPHQL_ENDPOINT_URL',
          "https://aics5bg7rjgvrcahbotr2lscaq.appsync-api.us-east-1.amazonaws.com/graphql")),
    })
  ]
};
