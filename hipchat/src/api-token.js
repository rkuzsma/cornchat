import Constants from './constants';
import log from './logger';
import AWS from 'aws-sdk';

class ApiToken {
  static _withPoolId(poolId, fn) {
    try {
      AWS.config.update({
        region: 'us-east-1',
        credentials: new AWS.CognitoIdentityCredentials({
          IdentityPoolId: Constants.cornchat_identity_pool_id
        })
      });
      AWS.config.getCredentials(function(err) {
        if (err) {
          log("Retrying 1 time to get pool creds");
          try {
            AWS.config.getCredentials(function(err) {
              fn(err);
            });
          }
          catch(err) {
            log("Error in _withPoolId: " + err);
            fn(err);
          }
        }
        else {
          fn(null);
        }
      });
    }
    catch(err) {
      log("Error in generateToken: " + err);
      log(err.stack);
      fn(err);
    }
  }

  static generateTokenForCurrentHipChatUser(fn) {
    var hipchatUserId = window.HC.ApplicationStore.data.config.user_id;
    var hipchatOauthAccessToken = window.HC.ApplicationStore.data.config.oauth_token;
    ApiToken.generateToken(hipchatUserId, hipchatOauthAccessToken, fn);
  }

  static generateToken(hipchatUserId, hipchatOauthAccessToken, fn) {
    try {
      this._withPoolId(Constants.cornchat_identity_pool_id, function(err) {
        if (err) {
          log("Failed to establish pool ID creds");
          fn(err, null);
        }
        else {
          try {
            var lambda = new AWS.Lambda();
            lambda.invoke({
              FunctionName: 'LambdAuthGenerateApiToken',
              Payload: JSON.stringify({
                hipchatUserId: hipchatUserId,
                hipchatOauthAccessToken: hipchatOauthAccessToken
              })
            }, fn);
          }
          catch(err) {
            log("Error in lambda invocation of generateToken: " + err);
            log(err.stack);
            fn(err, null);
          }
        }
      });
    }
    catch(err) {
      log("Error in generateToken: " + err);
      log(err.stack);
      fn(err, null);
    }
  }

  static loginWithApiToken(apiToken, fn) {
    const updateAwsConfig = function() {
      AWS.config.update({
        region: 'us-east-1',
        credentials: new AWS.CognitoIdentityCredentials({
          IdentityPoolId: Constants.cornchat_identity_pool_id
        })
      });
    }

    const withAwsConfig = function(fn) {
      try {
        updateAwsConfig();
        AWS.config.getCredentials(function(err) {
          if (err) {
            // retry
            log("Refreshing stale credentials config");
            updateAwsConfig();
            try {
              AWS.config.getCredentials(function(err) {
                if(err) {
                  fn(err);
                }
                else {
                  fn(null);
                }
              });
            }
            catch(err) {
              log("Error getting credentials in withAwsConfig: " + err);
              log(err.stack);
              fn(err);
            }
          }
          else {
            fn(null);
          }
        });
      }
      catch(err) {
        log("Error in withAwsConfig: " + err);
        log(err.stack);
        fn(err, null);
      }
    }

    try {
      withAwsConfig(function(err) {
        try {
          if (err) {
            log("Error in loginWithApiToken: " + err);
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

export default ApiToken;
