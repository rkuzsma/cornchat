console.log('Loading function');

// dependencies
var AWS = require('aws-sdk');
var config = require('./config.json');

// Get reference to AWS clients
var dynamodb = new AWS.DynamoDB();

function storeApiToken(email, apiToken, fn) {
	dynamodb.putItem({
		TableName: config.DDB_TOKENS_TABLE,
		Item: {
			apiToken: {
				S: apiToken
			},
			email: {
				S: email
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

exports.handler = function(event, context) {
	var email = event.email;
	var apiToken = uuidv4();

	storeApiToken(email, apiToken, function(err) {
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
			console.log('Generated token for email: ' + email);
			context.succeed({
				email: email,
				apiToken: apiToken
			});
		}
	});
}
