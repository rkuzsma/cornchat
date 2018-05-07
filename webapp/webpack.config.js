// Original source: https://github.com/rricard/lambda-es6-example/blob/master/webpack.config.js
const path = require("path");
const fs = require("fs");
const webpack = require('webpack');

const envVar = (varName, defaultVal) => {
  return process.env[varName] ?
    process.env[varName] :
    defaultVal;
}

module.exports = {
  entry: fs.readdirSync(path.join(__dirname, "./lambdas"))
         .filter(filename => /\.js$/.test(filename))
         .map(filename => {
           var entry = {};
           entry[filename.replace(".js", "")] = path.join(
             __dirname,
             "./lambdas/",
             filename
           );
           return entry;
         })
         .reduce((finalObject, entry) => Object.assign(finalObject, entry), {}),
  output: {
    path: path.join(__dirname, "build", "lambda"),
    library: "[name]",
    libraryTarget: "commonjs2",
    filename: "[name].js"
  },
  externals: [
      'aws-sdk'
  ],
  target: "node",
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel',
        query: JSON.parse(
          fs.readFileSync(path.join(__dirname, ".babelrc"), {encoding: "utf8"})
        )
      },
      {
        test: /\.json$/,
        loader: 'json'
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      // All default values come from our "TestCornChat" AWS cloudformation stack
      'CORNCHAT_AWS_REGION': JSON.stringify(envVar('CORNCHAT_AWS_REGION',
          "us-east-1")),
      'CORNCHAT_APP_NAME': JSON.stringify(envVar('CORNCHAT_APP_NAME',
          "TestCornChat")),
      'CORNCHAT_IDENTITY_POOL_ID': JSON.stringify(envVar('CORNCHAT_IDENTITY_POOL_ID',
          "us-east-1:b772f252-e167-400f-98d8-8ade0a45feb8")),
      'CORNCHAT_TABLE_API_TOKENS': JSON.stringify(envVar('CORNCHAT_TABLE_API_TOKENS',
          "TestCornChat_ApiTokens")),
      'CORNCHAT_IDENTITY_POOL_DEVELOPER_PROVIDER_NAME': JSON.stringify(envVar('CORNCHAT_IDENTITY_POOL_DEVELOPER_PROVIDER_NAME',
          "login.TestCornChat"))
    })
  ]
};
