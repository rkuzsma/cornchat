import Constants from './constants';
import log from './logger';
import AWS from 'aws-sdk';

export default {
  generateToken: function(email, fn) {
    try {
      AWS.config.update({
        region: 'us-east-1',
        credentials: new AWS.CognitoIdentityCredentials({
          IdentityPoolId: Constants.cornchat_identity_pool_id
        })
      });
      AWS.config.getCredentials(function(err) {
        if (err) {
          fn(err, null);
        }
        else {
          var lambda = new AWS.Lambda();
          lambda.invoke({
            FunctionName: 'LambdAuthGenerateApiToken',
            Payload: JSON.stringify({
              email: email
            })
          }, fn);
        }
      })
    }
    catch(err) {
      log("Error in generateToken: " + err);
      log(err.stack);
      fn(err, null);
    }
  },

  loginWithApiToken: function(apiToken, fn) {
    const updateAwsConfig = function() {
      AWS.config.update({
        region: 'us-east-1',
        credentials: new AWS.CognitoIdentityCredentials({
          IdentityPoolId: Constants.cornchat_identity_pool_id
        })
      });
    }

    const withAwsConfig = function(fn) {
      updateAwsConfig();
      AWS.config.getCredentials(function(err) {
        if (err) {
          // retry
          log("Refreshing stale credentials config");
          updateAwsConfig();
          AWS.config.getCredentials(function(err) {
            fn(err);
          });
        }
        else {
          fn(null);
        }
      });
    }

    try {
      withAwsConfig(function(err) {
        try {
          if (err) {
            throw err;
          }
          var lambda = new AWS.Lambda();
          lambda.invoke({
            FunctionName: 'LambdAuthApiTokenLogin',
            Payload: JSON.stringify({
              apiToken: apiToken
            })
          }, function(err, data) {
            var output = JSON.parse(data.Payload);
            if (!output.login) {
              throw("Invalid API Token");
            }
            log("Authenticated user. IdentityId: " + output.identityId);
            var creds = AWS.config.credentials;
            creds.params.IdentityId = output.identityId;
            creds.params.Logins = {
               'cognito-identity.amazonaws.com': output.token
            };
            creds.expired = true;
            fn(null, AWS);
          });
        }
        catch(err) {
          log("Error in loginWithApiToken: " + err);
          log(err.stack);
          fn(err, null);
        }
      })
    }
    catch(err) {
      log("Error in loginWithApiToken updating AWS credentials: " + err);
      log(err.stack);
      fn(err, null);
    }
  }
}
