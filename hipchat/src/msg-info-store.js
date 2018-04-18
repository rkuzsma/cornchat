import log from './logger';
import CornChatUser from './cornchat-user';
import Constants from './constants';
import MsgElementsStore from './msg-elements-store';

let _instance = null;

// Persistence for all metadata that CornChat attaches to HipChat messages,
// including tags and thumbs up counts.
class MsgInfoStore {
  constructor() {
    if (!_instance) {
      log("MsgInfoStore: Initializing");
      _instance = this;
      this.msgInfo = this.emptyMsgInfo();
      this.listeners = [];
      this._watch();
    }
    return _instance;
  }

  emptyMsgInfo() {
    return {
      tags: {},
      thumbs: {}
    }
  }

  // Returns most recently fetched tags in the form:
  // {"699a1266-c937-44d8-bf54-2fa40c59005c": [{name: "Red"},{name: "Blue"}],
  //  "deadbeef-c937-44d8-bf54-bf54bf54bf54": [{name: "Green"}]}}
  recentTags() {
    return this.msgInfo.tags;
  }

  // Returns most recently fetched thumbs counts in the form:
  // {"699a1266-c937-44d8-bf54-2fa40c59005c": '2',
  //  "deadbeef-c937-44d8-bf54-bf54bf54bf54": ''
  recentThumbs() {
    return this.msgInfo.thumbs;
  }

  // Listen for onTagsChanged(prevTags, currentTags)
  addListener(listener) {
    this.listeners.push(listener);
  }

  removeListener(listener) {
    this.listeners = this.listeners.filter(item => item !== listener);
  }

  _onTagsChanged(prev, current) {
    this.listeners.forEach((listener) => {
      if (listener.onTagsChanged) {
        listener.onTagsChanged(prev, current);
      }
    });
  }

  _onThumbsChanged(prev, current) {
    this.listeners.forEach((listener) => {
      if (listener.onThumbsChanged) {
        listener.onThumbsChanged(prev, current);
      }
    });
  }

  _watch() {
    // Wire up a MsgElementsStore and re-fetch tags whenever the visible HipChat messages change.
    this.msgStore = new MsgElementsStore;
    this.msgStoreListener = {
      onElementsChanged: ((prevMsgElements, currentMsgElements) => {
        log("MsgInfoStore: Messages changed. Re-fetching msg info");
        log(JSON.stringify(currentMsgElements));
        const msgIds = currentMsgElements.map((item) => item.msgId);
        this._updateMsgInfo(msgIds);
      })
    };
    this.msgStore.addListener(this.msgStoreListener);
    this.msgStoreListener.onElementsChanged(null, this.msgStore.recentElements());

    // Also wire up a poller to check for new tags in this room
    // TODO Cache this better, perhaps send a 'updated_since' timestamp instead of all msgIds
    window.setInterval(() => {
      log("MsgInfoStore: Polling for new msg info on existing messages");
      const msgIds = this.msgStore.recentElements().map((item) => item.msgId);
      this._updateMsgInfo(msgIds);
    }, Constants.tag_fetch_loop_interval);
  }

  _updateMsgInfo(msgIds) {
    this._fetchMsgInfo(msgIds, (err, data) => {
      const prevMsgInfo = this.msgInfo;
      if (err || !data) {
        log("Failed to fetch msg info. Clearing info state.");
        this.msgInfo = this.emptyMsgInfo();
      }
      else {
        //log("FETCHED " + JSON.stringify(data));
        this.msgInfo = this._prettifyMsgInfo(data);
        //log("CONVERTED " + JSON.stringify(this.msgInfo));
      }

      // Performs an optimized deep comparison between the two objects
      if (!_.isEqual(prevMsgInfo.tags, this.msgInfo.tags)) {
        log("MsgInfoStore: Fetched msg info. Tags changed.");
        this._onTagsChanged(prevMsgInfo.tags, this.msgInfo.tags);
      }
      else {
        log("MsgInfoStore: Fetched msg info. No tag changes.");
      }

      if (!_.isEqual(prevMsgInfo.thumbs, this.msgInfo.thumbs)) {
        log("MsgInfoStore: Fetched msg info. Thumbs counts changed.");
        this._onThumbsChanged(prevMsgInfo.thumbs, this.msgInfo.thumbs);
      }
      else {
        log("MsgInfoStore: Fetched msg info. No thumbs count changes.");
      }
    });
  }

  // Convert raw dynamodb msgInfo response to a friendlier data structure:
  /*
  {
    "tags": {
      "699a1266-c937-44d8-bf54-2fa40c59005c": [{name: "Red"},{name: "Blue"}],
      "deadbeef-c937-44d8-bf54-bf54bf54bf54": [{name: "Green"}]
    },
    "thumbs": {
      "699a1266-c937-44d8-bf54-2fa40c59005c": '2',
      "deadbeef-c937-44d8-bf54-bf54bf54bf54": ''
    }
  }
  */
  _prettifyMsgInfo(data) {
    var result = {
      tags: {},
      thumbs: {}
    };
    if (data && data.Responses && data.Responses.CornchatTags) {
      data.Responses.CornchatTags.forEach((midItem) => {
        var itemTags = [];
        if (midItem.tags) {
          midItem.tags.L.forEach((tagItem) => {
            itemTags.push({name: tagItem.M.Name.S});
          });
        }
        var itemThumbs = '';
        if (midItem.thumbs) {
          itemThumbs = midItem.thumbs.N;
        }
        result.tags[midItem.mid.S] = itemTags;
        result.thumbs[midItem.mid.S] = itemThumbs;
      });
    }
    return result;
  }

  // Fetch msg info from DynamoDB for a list of HipChat Msg IDs.
  // mids: Array of message ID strings for which to fetch tags, thumbs, and other attached msg info
  // fn: Function to callback with the resulting map of msg info.
  //
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
  _fetchMsgInfo(mids, fn) {
    log("MsgInfoStore: _fetchMsgInfo()");
    try {
      if (!mids || mids.length === 0) {
        fn(null, {});
        return;
      }
      CornChatUser.withAuthenticatedUser((err, authUser) => {
        if (err) {
          log("_fetchMsgInfo failed, authentication error: " + err);
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
                ProjectionExpression: 'mid, tags, thumbs'
              }
            }
          };
          ddb.batchGetItem(params, function(err, data) {
            if (err) {
              log("_fetchMsgInfo failed: " + err);
              return fn(err);
            }
            else {
              return fn(null, data);
            }
          });
        }
        catch(err) {
          log("_fetchMsgInfo error: " + err);
          return fn(err);
        }
      });
    }
    catch(err) {
      log("_fetchMsgInfo error: " + err);
      return fn(err);
    }
  }

  incrementThumbs(mid, fn) {
    return this._incrementCounter(mid, "thumbs", fn);
  }

  _incrementCounter(mid, counterName, fn) {
    log(`incrementCounter(${mid}, ${counterName})`);
    try {
      CornChatUser.withAuthenticatedUser((err, authUser) => {
        if (err) {
          log("incrementCounter failed, authentication error: " + err);
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
            UpdateExpression: "SET #counter_name = if_not_exists(#counter_name, :initial_count) + :n",
            ExpressionAttributeValues: {
              ":n": {"N":"1"},
              ":initial_count": {"N":"0"}
            },
            ExpressionAttributeNames: {
              "#counter_name": counterName
            },
            ReturnValues:"UPDATED_NEW"
          }, function(err, data) {
            if (err) {
              log("incrementCounter failed: " + err);
              return fn(err);
            }
            else {
              log("Incremented: " + JSON.stringify(data));
              fn(null, data);
            }
          });
        }
        catch(err) {
          log("incrementCounter error: " + err);
          return fn(err);
        }
      });
    }
    catch(err) {
      log("incrementCounter error: " + err);
      return fn(err);
    }
  }

  storeTag(mid, tag, fn) {
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
            UpdateExpression: "SET tags = list_append(if_not_exists(tags, :empty_list), :new_tags)",
            ExpressionAttributeValues: {
              ":new_tags": {
                "L": [
                  {
                    "M": {
                      "Name": {"S": tag}
                    }
                  }
                ]
              },
              ":empty_list": {
                "L": [
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

export default MsgInfoStore;
