console.log('Loading function');

import AWS from "aws-sdk"
import type {LambdaContext} from "../lib/lambda-types.js";
import https from 'https';

var dynamodb = new AWS.DynamoDB();

const CORNCHAT_TABLE_API_TOKENS = process.env.CORNCHAT_TABLE_API_TOKENS;

// Generates a CornChat API token for a given HipChat User ID and OAuth Access Token.
// Validates the HipChat User with HipChat.
//
// Live test page for the lambda is hosted at https://cornchat.s3.amazonaws.com/generateToken.html
//
// Deploy using CloudFormation deploy job shell script.
//
// Find your HipChat ID and Access Token by logging into the HipChat Web UI and inspecting
// in the dev tools console:
//   window.HC.ApplicationStore.data.config.oauth_token
//   window.HC.ApplicationStore.data.config.user_id
//
function storeApiToken(hipchatUserId, apiToken, fn) {
	dynamodb.putItem({
		TableName: CORNCHAT_TABLE_API_TOKENS,
		Item: {
			apiToken: {
				S: apiToken
			},
			hipchatUserId: {
				S: hipchatUserId+''
			}
		},
		ConditionExpression: 'attribute_not_exists (email)'
	}, function(err, data) {
		if (err) return fn(err);
		else fn(null);
	});
}

function uuidv4() {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
		return v.toString(16);
	});
}

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

exports.handler = function(event, context) {
	var hipchatUserId = event.hipchatUserId;
	var hipchatOauthAccessToken = event.hipchatOauthAccessToken;

	validateHipchatIdentity(hipchatUserId, hipchatOauthAccessToken, function(success) {
		if (!success) {
			context.fail('Failed to validate OAuth Access Token.');
			return;
		}

		var apiToken = uuidv4();

		storeApiToken(hipchatUserId, apiToken, function(err) {
			if (err) {
				if (err.code == 'ConditionalCheckFailedException') {
					// userId already found
					context.succeed({
						created: false
					});
				} else {
					context.fail('Error in storeUser: ' + err);
				}
			} else {
				console.log('Generated token for hipchatUserId: ' + apiToken);
				context.succeed({
					created: true,
					hipchatUserId: hipchatUserId,
					apiToken: apiToken
				});
			}
		});
	});
}
