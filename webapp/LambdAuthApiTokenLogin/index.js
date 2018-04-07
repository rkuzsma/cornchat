// All you need to "login" to Cornchat is a valid API token.
console.log('Loading function');

// dependencies
var AWS = require('aws-sdk');
var config = require('./config.json');

// Get reference to AWS clients
var dynamodb = new AWS.DynamoDB();
var cognitoidentity = new AWS.CognitoIdentity();

// Email from API Token
function getEmailFromApiToken(apiToken, fn) {
	dynamodb.getItem({
		TableName: config.DDB_TOKENS_TABLE,
		Key: {
			apiToken: {
				S: apiToken
			}
		}
	}, function(err, data) {
		if (err) return fn(err);
		else {
			if ('Item' in data) {
				var email = data.Item.email.S;
				fn(null, email);
			} else {
				fn(null, null); // User not found
			}
		}
	});
}

// Cognito token
function getToken(email, fn) {
	var param = {
		IdentityPoolId: config.IDENTITY_POOL_ID,
		Logins: {} // To have provider name in a variable
	};
	param.Logins[config.DEVELOPER_PROVIDER_NAME] = email;
	cognitoidentity.getOpenIdTokenForDeveloperIdentity(param,
		function(err, data) {
			if (err) return fn(err); // an error occurred
			else fn(null, data.IdentityId, data.Token); // successful response
		});
}

exports.handler = function(event, context) {
	var apiToken = event.apiToken;

	getEmailFromApiToken(apiToken, function(err, email) {
		if (err) {
			context.fail('Error in getEmailFromApiToken: ' + err);
			return;
		}

		if (email == null) {
			console.log('Email not found for apiToken: ' + apiToken);
			context.succeed({
				login: false
			});
			return;
		}

		// Token OK, so Login ok
		console.log('User logged in via token. Email: ' + email);
		getToken(email, function(err, identityId, token) {
			if (err) {
				context.fail('Error in getToken: ' + err);
			} else {
				context.succeed({
					login: true,
					identityId: identityId,
					token: token
				});
			}
		});
	});
}
