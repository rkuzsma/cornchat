// All you need to "login" to Cornchat is a valid API token.
console.log('Loading function');

import AWS from "aws-sdk"
import type {LambdaContext} from "../lib/lambda-types.js";

// Get reference to AWS clients
const dynamodb = new AWS.DynamoDB();
const cognitoidentity = new AWS.CognitoIdentity();

const CORNCHAT_TABLE_API_TOKENS = process.env.CORNCHAT_TABLE_API_TOKENS;
const CORNCHAT_IDENTITY_POOL_ID = process.env.CORNCHAT_IDENTITY_POOL_ID;
const CORNCHAT_IDENTITY_POOL_DEVELOPER_PROVIDER_NAME = process.env.CORNCHAT_IDENTITY_POOL_DEVELOPER_PROVIDER_NAME;

// Validate a CornChat API token that was generated with LambdAuthGenerateApiToken.
//
// Live test page at: https://cornchat.s3.amazonaws.com/validateToken.html
//
function getHipchatUserIdFromApiToken(apiToken, fn) {
	dynamodb.getItem({
		TableName: CORNCHAT_TABLE_API_TOKENS,
		Key: {
			apiToken: {
				S: apiToken
			}
		}
	}, function(err, data) {
		if (err) return fn(err);
		else {
			if ('Item' in data) {
				var hipchatUserId = data.Item.hipchatUserId.S;
				fn(null, hipchatUserId);
			} else {
				fn(null, null); // User not found
			}
		}
	});
}

function getCognitoToken(hipchatUserId, optionalExistingIdentityId, fn) {
	var cognitoParams = {
		IdentityPoolId: CORNCHAT_IDENTITY_POOL_ID,
		// Reuse a previous identity ID if one available
		IdentityId: optionalExistingIdentityId,
		Logins: {} // To have provider name in a variable
	};
	// i.e. our "login.ProdCornChat" provider name.
	cognitoParams.Logins[CORNCHAT_IDENTITY_POOL_DEVELOPER_PROVIDER_NAME] = hipchatUserId;
	cognitoidentity.getOpenIdTokenForDeveloperIdentity(cognitoParams,
		function(err, data) {
			if (err) return fn(err); // an error occurred
			else fn(null, data.IdentityId, data.Token); // successful response
		});
}

exports.handler = function(event, context, callback) {
	var apiToken = event.apiToken;

	getHipchatUserIdFromApiToken(apiToken, function(err, hipchatUserId) {
		if (err) {
			context.fail('Error in getHipchatUserIdFromApiToken: ' + err);
			return;
		}

		if (hipchatUserId == null) {
			console.log('HipChat User ID not found for apiToken: ' + apiToken);
			context.succeed({
				login: false
			});
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
