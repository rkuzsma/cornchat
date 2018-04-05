const merge = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
  output: {
    // Tweak this to match your GitHub project name
    publicPath: "/cornchat/",
  },
  mode: 'production'
});
