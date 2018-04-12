'use strict';

import log from './logger';
import CornChatUser from './cornchat-user';

export default {

  fetchTags: function(mids, fn) {
    log(`fetchTags(${mids})`);
    try {
      var aws = CornChatUser.currentAuthenticatedUser().aws;
      var ddb = new aws.DynamoDB();
      var keys = _.map(mids, function(mid) {
        return { 'mid': {"S": mid } };
      });
      var params = {
        RequestItems: {
          'CornchatTags': {
            Keys: keys,
            ProjectionExpression: 'mid, tags'
          }
        }
      };
      ddb.batchGetItem(params, function(err, data) {
        if (err) {
          log("fetchTags failed: " + err);
          return fn(err);
        }
        else {
          // Example response:
          // {"Responses":{"CornchatTags":[{"mid":{"S":"699a1266-c937-44d8-bf54-2fa40c59005c"},"tags":{"L":[{"M":{"Name":{"S":"Red"}}},{"M":{"Name":{"S":"Blue"}}}]}}]},"UnprocessedKeys":{}}
          // Convert to a friendlier data structure
          // {"699a1266-c937-44d8-bf54-2fa40c59005c": ["Red","Blue"]}
          var resultsArray = data.Responses.CornchatTags;
          var midsTagsMap = {};
          var midsTagsArray = _.each(resultsArray, function(midItem) {
            var tagNamesArray = _.map(midItem.tags.L, function(tagItem) {
              return tagItem.M.Name.S;
            });
            midsTagsMap[midItem.mid.S] = tagNamesArray;
          });
          fn(null, midsTagsMap);
        }
      });
    }
    catch(err) {
      log("fetchTags error: " + err);
      return fn(err);
    }
  },


  storeTag: function(mid, tag, fn) {
    log(`storeTag(${mid}, ${tag})`);
    try {
      var aws = CornChatUser.currentAuthenticatedUser().aws;
      var ddb = new aws.DynamoDB();
      ddb.updateItem({
        TableName: "CornchatTags",
        Key: {
          "mid": {"S": mid}
        },
        UpdateExpression: "SET tags = :tags",
        ExpressionAttributeValues: {
          ":tags": {
            "L": [
              {
                "M": {
                  "Name": {"S": tag}
                }
              }
            ]
          }
        },
        ReturnValues:"UPDATED_NEW"
      }, function(err, data) {
        if (err) {
          log("storeTag failed: " + err);
          return fn(err);
        }
        else {
          log("Stored: " + JSON.stringify(data));
          fn(null, data);
        }
      });
    }
    catch(err) {
      log("storeTag error: " + err);
      return fn(err);
    }
  }

}
