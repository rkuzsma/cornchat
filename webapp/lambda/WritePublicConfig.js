import AWS from "aws-sdk"
import response from "../lib/cfn-response"

// Publish a config.json file to a publicly accessible S3 bucket folder containing
// publicly allowed information about the stack, such as Identity Pool ID and GraphQL API endpoint URL.
//
// The cloudformation stack invokes this lambda after the stack is provisioned.
exports.handler = function(event, context, callback) {
	console.log("Invoking WritePublicConfigLambda with awsRequestId " + context.awsRequestId + " and event: " + JSON.stringify(event));
	try {
		var s3 = new AWS.S3();

		var publicConfig = {
		  "CORNCHAT_IDENTITY_POOL_ID": process.env.CORNCHAT_IDENTITY_POOL_ID,
		  "CORNCHAT_IDENTITY_POOL_DEVELOPER_PROVIDER_NAME": process.env.CORNCHAT_IDENTITY_POOL_DEVELOPER_PROVIDER_NAME,
		  "CORNCHAT_GRAPHQL_ENDPOINT_URL": process.env.CORNCHAT_GRAPHQL_ENDPOINT_URL
		}

		var params = {
				Bucket : process.env.PublicConfigS3Bucket,
				Key : process.env.PublicConfigS3Folder + "/config.json",
				Body : JSON.stringify(publicConfig),
				ACL: 'public-read'
		}

		console.log("Putting object into bucket " + params.Bucket + " at key " + params.Key);
		s3.putObject(params, function(err, data) {
			console.log("Put the object");
			if (err) {
				const responseData = {
					Error: 'WritePublicConfig failed to store config in S3: ' + err
				}
				console.log(err, err.stack);
				response.send(event, context, response.FAILED, responseData, null, function(err, result) {
					return callback(err, result);
				});
			}
			else {
				response.send(event, context, response.SUCCESS, data, null, function(err, result) {
					return callback(err, result);
				});
			}
		});
	}
	catch (err) {
		const responseData = {
			Error: 'WritePublicConfig call failed'
		}
		console.log("Error invoking WritePublicConfig: " + err, err.stack);
		response.send(event, context, response.FAILED, responseData, null, function(err, result) {
			return callback(err, result);
		});
	}
}
