import log from './logger';
import AWS from 'aws-sdk/global';
import Lambda from 'aws-sdk/clients/lambda';

import HipchatWindow from './hipchat-window';

class ApiToken {
  static generateTokenForCurrentHipChatUser(fn) {
    var hipchatUserId = HipchatWindow.userId();
    var hipchatOauthAccessToken = HipchatWindow.oauthToken();
    ApiToken.generateToken(hipchatUserId, hipchatOauthAccessToken, fn);
  }

  static generateToken(hipchatUserId, hipchatOauthAccessToken, fn) {
    try {
      // This lambda can be invoked without authenticated credentials.
      this._resetCognitoCreds();
      log("ApiToken: generateToken(" + hipchatUserId + ")");
      var lambda = new Lambda();
      lambda.invoke({
        FunctionName: CORNCHAT_APP_NAME + '-GenerateTokenLambda',
        Payload: JSON.stringify({
          hipchatUserId: hipchatUserId,
          hipchatOauthAccessToken: hipchatOauthAccessToken
        })
      }, fn);
    }
    catch(err) {
      log("ApiToken: Error in generateToken: " + err);
      log(err.stack);
      fn(err, null);
    }
  }

  static loginWithApiToken(apiToken, fn) {
    try {
      // This lambda can (and should) be invoked without authenticated credentials.
      this._resetCognitoCreds();
      log("ApiToken: loginWithApiToken(" + apiToken + ")");
      var lambda = new Lambda();
      lambda.invoke({
        FunctionName: CORNCHAT_APP_NAME + '-LoginLambda',
        Payload: JSON.stringify({
          apiToken: apiToken
        })
      }, function(err, data) {
        if (err) {
          log("ApiToken: Login error: " + err);
          log(err.stack);
          return fn(err, null);
        }
        var output = JSON.parse(data.Payload);
        if (!output.login) {
          log("ApiToken: Invalid API Token");
          return fn("Invalid API Token", null);
        }
        log("ApiToken: Authenticated user. IdentityId: " + output.identityId + ", token: " + output.token.substring(output.token.length - 10) + "...");
        var creds = AWS.config.credentials;
        creds.params.IdentityId = output.identityId;
        creds.params.Logins = {
           'cognito-identity.amazonaws.com': output.token
        };
        creds.expired = true;
        return fn(null, AWS);
      });
    }
    catch(err) {
      log("ApiToken: Error in loginWithApiToken: " + err);
      log(err.stack);
      return fn(err, null);
    }
  }

  // Clear your Cognito Creds, ensuring that the next AWS call will be unauthenticated.
  static _resetCognitoCreds() {
    if (AWS.config.credentials?.params) {
      log("ApiToken: IdentityPoolId: " + AWS.config.credentials.params.IdentityPoolId);
      log("ApiToken: IdentityId: " + AWS.config.credentials.params.IdentityId);
    }
    if (AWS.config.credentials?.params?.IdentityPoolId !== CORNCHAT_IDENTITY_POOL_ID) {
      log("ApiToken: Resetting AWS Cognito Credentials");
      var anonymousCognitoCreds = new AWS.CognitoIdentityCredentials({
        IdentityPoolId: CORNCHAT_IDENTITY_POOL_ID,
        IdentityId: null
      });
      // Cognito caches identityId in localStorage:
      // https://github.com/aws/aws-sdk-js/blob/master/lib/credentials/cognito_identity_credentials.js
      // If you don't clear the cached identityId, AWS will throw an error,
      // "CognitoError: Missing credentials in config".
      // There is no risk of creating excessive Identities; if your user account already
      // has an identityId, the login lambda will find it and reuse it later.
      anonymousCognitoCreds.clearCachedId();
      AWS.config.update({
        region: CORNCHAT_AWS_REGION,
        credentials: anonymousCognitoCreds
      });
      log("ApiToken: IdentityPoolId: " + AWS.config.credentials.params.IdentityPoolId);
      log("ApiToken: IdentityId: " + AWS.config.credentials.params.IdentityId);
    }
  }
}

export default ApiToken;
