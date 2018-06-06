import log from './logger';
import AWS from 'aws-sdk/global';
import Lambda from 'aws-sdk/clients/lambda';

class Authenticate {
  static loginWithHipchatOauthToken(hipchatUserId, hipchatOauthAccessToken, fn) {
    try {
      // This lambda can be invoked without authenticated credentials.
      this._resetCognitoCreds();
      log("Authenticate: loginWithHipchatOauthToken(" + hipchatUserId + ", <REDACTED>)");
      var lambda = new Lambda();
      lambda.invoke({
        FunctionName: CORNCHAT_APP_NAME + '-AuthenticateLambda',
        Payload: JSON.stringify({
          hipchatUserId: hipchatUserId,
          hipchatOauthAccessToken: hipchatOauthAccessToken
        })
      }, function(err, data) {
        if (err) {
          log("Authenticate: Login error: " + err);
          log(err.stack);
          return fn(err, null);
        }
        var output = JSON.parse(data.Payload);
        if (!output.login) {
          log("Authenticate: Invalid Hipchat Oauth Token");
          return fn("Invalid Hipchat Oauth Token", null);
        }
        log("Authenticate: Authenticated user. IdentityId: " + output.identityId + ", token: " + output.token.substring(output.token.length - 10) + "...");

        // Set the region where your identity pool exists (us-east-1, eu-west-1)
        AWS.config.region = CORNCHAT_AWS_REGION;
        // Configure the credentials provider to use your identity pool
        AWS.config.credentials = new AWS.CognitoIdentityCredentials({
           IdentityPoolId: CORNCHAT_IDENTITY_POOL_ID,
           IdentityId: output.identityId,
           Logins: {
              'cognito-identity.amazonaws.com': output.token
           }
        });
        // Make the call to obtain credentials
        AWS.config.credentials.get(() => {
          const creds = {
            accessKeyId: AWS.config.credentials.accessKeyId,
            secretAccessKey: AWS.config.credentials.secretAccessKey,
            sessionToken: AWS.config.credentials.sessionToken
          }
          return fn(null, creds);
        });
      });
    }
    catch(err) {
      log("Authenticate: Error in loginWithHipchatOauthToken: " + err);
      log(err.stack);
      fn(err, null);
    }
  }

  // Clear your Cognito Creds, ensuring that the next AWS call will be unauthenticated.
  static _resetCognitoCreds() {
    if (AWS.config.credentials?.params) {
      log("Authenticate: IdentityPoolId: " + AWS.config.credentials.params.IdentityPoolId);
      log("Authenticate: IdentityId: " + AWS.config.credentials.params.IdentityId);
    }
    if (AWS.config.credentials?.params?.IdentityPoolId !== CORNCHAT_IDENTITY_POOL_ID) {
      log("Authenticate: Resetting AWS Cognito Credentials");
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
      log("Authenticate: IdentityPoolId: " + AWS.config.credentials.params.IdentityPoolId);
      log("Authenticate: IdentityId: " + AWS.config.credentials.params.IdentityId);
    }
  }
}

export default Authenticate;
