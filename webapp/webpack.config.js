// Original source: https://github.com/rricard/lambda-es6-example/blob/master/webpack.config.js
const path = require("path");
const fs = require("fs");

const envVar = (varName, defaultVal) => {
  return process.env[varName] ?
    process.env[varName] :
    defaultVal;
}

module.exports = {
  entry: fs.readdirSync(path.join(__dirname, "./lambda"))
         .filter(filename => /\.js$/.test(filename))
         .map(filename => {
           var entry = {};
           entry[filename.replace(".js", "")] = path.join(
             __dirname,
             "./lambda/",
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
  }
};
