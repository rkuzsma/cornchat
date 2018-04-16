import log from './logger';
import CornChatUser from './cornchat-user';

export default {

  fetchTags: function(mids, fn) {
    log(`fetchTags(${JSON.stringify(mids)})`);
    try {
      if (!mids || Object.keys(mids).length === 0) {
        fn(null, {});
        return;
      }
      CornChatUser.withAuthenticatedUser((err, authUser) => {
        if (err) {
          log("fetchTags failed, authentication error: " + err);
          return fn(err);
        }
        try {
          var aws = authUser.aws;
          var ddb = new aws.DynamoDB();
          var keys = Object.keys(mids).map((mid) => {
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
              //
              // {"Responses":{"CornchatTags": [
              //   {"mid":{"S":"699a1266-c937-44d8-bf54-2fa40c59005c"},
              //    "tags":{"L": [
              //      {"M":{"Name":{"S":"Red"}}},
              //      {"M":{"Name":{"S":"Blue"}}}
              //    ]}
              //   },
              //   {"mid":{"S":"deadbeef-c937-44d8-bf54-bf54bf54bf54"},
              //    "tags":{"L": [
              //      {"M":{"Name":{"S":"Green"}}}
              //    ]}
              //   }
              // ]},"UnprocessedKeys":{}}
              //
              // Convert to a friendlier data structure:
              //
              // {"699a1266-c937-44d8-bf54-2fa40c59005c": [{name: "Red"},{name: "Blue"}],
              //  "deadbeef-c937-44d8-bf54-bf54bf54bf54": [{name: "Green"}]}}
              //
              var midsTagsMap = {};
              data.Responses.CornchatTags.forEach((midItem) => {
                var midsTagsArray = [];
                midItem.tags.L.forEach((tagItem) => {
                  midsTagsArray.push({name: tagItem.M.Name.S});
                });
                midsTagsMap[midItem.mid.S] = midsTagsArray;
              });
              fn(null, midsTagsMap);
            }
          });
        }
        catch(err) {
          log("fetchTags error: " + err);
          return fn(err);
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
      CornChatUser.withAuthenticatedUser((err, authUser) => {
        if (err) {
          log("storeTag failed, authentication error: " + err);
          return fn(err);
        }
        try {
          var aws = authUser.aws;
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
      });
    }
    catch(err) {
      log("storeTag error: " + err);
      return fn(err);
    }
  }

}
