const merge = require('webpack-merge');
const webpack = require('webpack');
const fetch = require('node-fetch');
const chalk = require('chalk');

const commonConfig = require('./webpack.common.js');

const envVar = (varName, defaultVal) => process.env[varName] ? process.env[varName] : defaultVal;

// Fetch back-end config and inject constants into our JS source at build time.
// Public back-end config like identity pool ID and Graph QL API ID are
// exposed on a public-read JSON file in an S3 bucket.
// See ../webapp/lambda/WritePublicConfig.js
// Set $CORNCHAT_APP_NAME in your shell to build against a different back-end.
const fetchRemoteConfig = (CORNCHAT_APP_NAME) => {
  // AppName matches the name of a deployed CloudFormation stack, e.g. "TestCornChat"
  let CORNCHAT_S3_CONFIG_URL = envVar('CORNCHAT_S3_CONFIG_URL',
    "https://s3.amazonaws.com/cornchat/public/" + CORNCHAT_APP_NAME + "/public-config/config.json");
  return fetch(CORNCHAT_S3_CONFIG_URL)
    .catch(err => {
      console.error(chalk.bold.red(
        "\nERROR fetching remote configuration for '" + CORNCHAT_APP_NAME + "' at " + CORNCHAT_S3_CONFIG_URL + ": " + err + "\n"))
    })
    .then(res => res.json())
    .then(json =>  {
      if (!json.CORNCHAT_APP_NAME) {
        console.error(chalk.bold.red("\nERROR: Failed to parse remote configuration for '" + CORNCHAT_APP_NAME + "' at " + CORNCHAT_S3_CONFIG_URL + "\n"));
        return {};
      }
      // Wrap values in JSON.stringify because they will be directly injected into src
      remoteConfig = {
  			"CORNCHAT_APP_NAME": JSON.stringify(json.CORNCHAT_APP_NAME),
  			"CORNCHAT_AWS_REGION": JSON.stringify(json.CORNCHAT_AWS_REGION),
  		  "CORNCHAT_IDENTITY_POOL_ID": JSON.stringify(json.CORNCHAT_IDENTITY_POOL_ID),
  		  "CORNCHAT_IDENTITY_POOL_DEVELOPER_PROVIDER_NAME": JSON.stringify(json.CORNCHAT_IDENTITY_POOL_DEVELOPER_PROVIDER_NAME),
  		  "CORNCHAT_GRAPHQL_ENDPOINT_URL": JSON.stringify(json.CORNCHAT_GRAPHQL_ENDPOINT_URL),
        "CORNCHAT_S3_CONFIG_URL": JSON.stringify(CORNCHAT_S3_CONFIG_URL)
  		}
      console.log("Remote config:");
      console.dir(remoteConfig);
      return {
        plugins: [
          new webpack.DefinePlugin(remoteConfig)
        ]
      }
    });
}

module.exports = (CORNCHAT_APP_NAME) => {
  return new Promise((resolve, reject) => {
    fetchRemoteConfig(CORNCHAT_APP_NAME).then((remoteConfig) => {
      resolve(merge(remoteConfig, commonConfig));
    });
  });
};
