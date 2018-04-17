import log from './logger';
import CornChatUser from './cornchat-user';
import Constants from './constants';
import MsgElementsStore from './msg-elements-store';

let _instance = null;
class TagsStore {
  constructor() {
    if (!_instance) {
      log("TagsStore: Initializing");
      _instance = this;
      this.tags = {};
      this.listeners = [];
      this._watch();
    }
    return _instance;
  }

  // Returns most recently fetched tags in the form:
  // {"699a1266-c937-44d8-bf54-2fa40c59005c": [{name: "Red"},{name: "Blue"}],
  //  "deadbeef-c937-44d8-bf54-bf54bf54bf54": [{name: "Green"}]}}
  recentTags() {
    return this.tags;
  }

  // Listen for onTagsChanged(prevTags, currentTags)
  addListener(listener) {
    this.listeners.push(listener);
  }

  removeListener(listener) {
    this.listeners = this.listeners.filter(item => item !== listener);
  }

  _onTagsChanged(prevTags, currentTags) {
    this.listeners.forEach((listener) => {
      listener.onTagsChanged(prevTags, currentTags);
    });
  }

  _watch() {
    // Wire up a MsgElementsStore and re-fetch tags whenever the visible HipChat messages change.
    this.msgStore = new MsgElementsStore;
    this.msgStoreListener = {onElementsChanged: ((prevMsgElements, currentMsgElements) => {
      log("TagsStore: Messages changed. Re-fetching tags");
      const msgIds = currentMsgElements.map((item) => item.msgId);
      this.updateTags(msgIds);
    })};
    this.msgStore.addListener(this.msgStoreListener);
    this.msgStoreListener.onElementsChanged(null, this.msgStore.recentElements());

    // Also wire up a poller to check for new tags in this room
    // TODO Cache this better, perhaps send a 'updated_since' timestamp instead of all msgIds
    window.setInterval(() => {
      log("TagsStore: Polling for new tags on existing messages");
      const msgIds = this.msgStore.recentElements().map((item) => item.msgId);
      this.updateTags(msgIds);
    }, Constants.tag_fetch_loop_interval);
  }

  updateTags(msgIds) {
    this.fetchTags(msgIds, (err, tags) => {
      const prevTags = this.tags;
      if (err || !tags) {
        log("Failed to fetch tags. Clearing tags state.");
        this.tags = {}
      }
      else {
        this.tags = tags;
      }
      // Performs an optimized deep comparison between the two objects
      if (!_.isEqual(prevTags, this.tags)) {
        log("TagsStore: Fetched tags. Tags changed.");
        this._onTagsChanged(prevTags, this.tags);
      }
      else {
        log("TagsStore: Fetched tags. No changes.");
      }
    });
  }

  // mids: Array of message ID strings for which to fetch tags
  // fn: Function to callback with the resulting map of tags.
  fetchTags(mids, fn) {
    log("TagsStore: fetchTags()");
    try {
      if (!mids || mids.length === 0) {
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
          var keys = mids.map((mid) => {
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
              return fn(null, midsTagsMap);
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
  }

  storeTag(mid, tag, fn) {

    // TODO Add a tag, don't replace existing tags    

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

export default TagsStore;
