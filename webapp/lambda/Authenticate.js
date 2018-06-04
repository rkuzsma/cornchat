console.log('Invoking CornChat Authenticate');

import AWS from "aws-sdk"
import type {LambdaContext} from "../lib/lambda-types.js";
import https from 'https';

// Authenticates a user given a HipChat User ID and HipChat OAuth Access Token.
// Validates the HipChat User with HipChat and returns a Cognito auth token.
//
// Deploy using CloudFormation deploy job shell script.
//
// Find your HipChat ID and Access Token by logging into the HipChat Web UI and inspecting
// in the dev tools console:
//   window.HC.ApplicationStore.data.config.oauth_token
//   window.HC.ApplicationStore.data.config.user_id
//

const cognitoidentity = new AWS.CognitoIdentity();

const CORNCHAT_IDENTITY_POOL_ID = process.env.CORNCHAT_IDENTITY_POOL_ID;
const CORNCHAT_IDENTITY_POOL_DEVELOPER_PROVIDER_NAME = process.env.CORNCHAT_IDENTITY_POOL_DEVELOPER_PROVIDER_NAME;

function validateHipchatIdentity(hipchatUserId, hipchatOauthAccessToken, fn) {
	console.log("Validating HipChat OAuth Access Token");
	var body='';

	var options = {
			host: 'api.hipchat.com',
			path: '/v2/oauth/token/' + hipchatOauthAccessToken,
			method: 'GET',
			headers: {
					'Content-Type': 'application/json',
					'Authorization': 'Bearer ' + hipchatOauthAccessToken
			}
	};

	var req = https.request(options, function(res) {
		try {
			if (res.statusCode != 200) {
				console.log("Invalid HipChat OAuth Access Token. Received from HipChat server: " + res.statusCode);
				fn(false);
			}
			else {
				res.on('data', function (chunk) {
						body += chunk;
				});
				res.on('end', function() {
					var bodyObj = JSON.parse(body);
					fn(bodyObj && bodyObj.owner && (bodyObj.owner.id +'') === (hipchatUserId+''));
				});
			}
		}
		catch(err) {
			console.log("Error validating HipChat identity: "+ err);
			fn(false);
		}
	});
	req.on('error', function(err) {
		console.log("Failed to validate HipChat identity: "+ err);
		fn(false);
	});
	req.end();
}

function getCognitoToken(hipchatUserId, optionalExistingIdentityId, fn) {
	var cognitoParams = {
		IdentityPoolId: CORNCHAT_IDENTITY_POOL_ID,
		// Reuse a previous identity ID if one available
		IdentityId: optionalExistingIdentityId,
		Logins: {} // To have provider name in a variable
	};
	// i.e. our "login.ProdCornChat" provider name.
	cognitoParams.Logins[CORNCHAT_IDENTITY_POOL_DEVELOPER_PROVIDER_NAME] = hipchatUserId+'';
	cognitoidentity.getOpenIdTokenForDeveloperIdentity(cognitoParams,
		function(err, data) {
			if (err) return fn(err); // an error occurred
			else fn(null, data.IdentityId, data.Token); // successful response
		});
}

exports.handler = function(event, context, callback) {
	var hipchatUserId = event.hipchatUserId;
	var hipchatOauthAccessToken = event.hipchatOauthAccessToken;

	validateHipchatIdentity(hipchatUserId, hipchatOauthAccessToken, function(success) {
		if (!success) {
			context.fail('Failed to validate HipChat OAuth Access Token.');
			return;
		}

		// Token OK, so Login ok
		console.log('User logged in via token. HipChat User ID: ' + hipchatUserId);
		var cognitoIdentityId = null;
		if(context.identity && context.identity.cognitoIdentityId){
			cognitoIdentityId = context.identity.cognitoIdentityId;
			console.log("Reusing identity ID: " + cognitoIdentityId);
	  }
		console.log("getCognitoToken(" + hipchatUserId + "," + cognitoIdentityId + ")");
		getCognitoToken(hipchatUserId, cognitoIdentityId, function(err, identityId, token) {
			if (err) {
				context.fail('Error in getCognitoToken: ' + err);
			} else {
				console.log("Got a Cognito Token. IdentityId: " + identityId);
				context.succeed({
					login: true,
					identityId: identityId,
					token: token
				});
			}
		});
	});
}
