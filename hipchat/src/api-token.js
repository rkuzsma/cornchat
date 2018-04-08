import constants from './constants';
import log from './logger';
import AWS from 'aws-sdk';

export default {
  generateToken: function(email, fn) {
    try {
      AWS.config.update({
        region: 'us-east-1',
        credentials: new AWS.CognitoIdentityCredentials({
          IdentityPoolId: constants.cornchat_identity_pool_id
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
  }
}
