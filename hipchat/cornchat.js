'use strict';

$(document).on('hc-ready', function () {

  var CORN_loop = function() {
    try {
      var log = window.macapi.log;
      log("CORN_loop");

      var CORN_renderLogin = function(el) {
        log("CORN: Rendering login into " + el);
        $(el).append($("<div id='CORN_login' style='position:absolute; background: white; z-index: 10; width: 400px; height: 400px;'>abc<br/>def<br/><div id='amazon-root'></div><a href='#' id='LoginWithAmazon'>Login With Amazon</a></div>"));
      }
      //CORN_renderLogin($('div.hc-messages'));

      var CORN_aws = function() {

        // IAM Role that you create for Login With Amazon
        var roleArn = 'arn:aws:iam::452684070979:policy/cornchat-amazon-login';

        // Login with Amazon
        window.onAmazonLoginReady = function() {
            amazon.Login.setClientId('amzn1.application-oa2-client.71aea04ecc894ce9948adee686501a06');
        };
        (function(d) {
            var a = d.createElement('script'); a.type = 'text/javascript';
            a.async = true; a.id = 'amazon-login-sdk';
            a.src = 'https://api-cdn.amazon.com/sdk/login1.js?v=3';
            d.getElementById('amazon-root').appendChild(a);
        })(document);

        function amazonAuth(response) {
            if (response.error) {
                window.macapi.log(response.error);
                return;
            }
            AWS.config.credentials = new AWS.WebIdentityCredentials({
                RoleArn: roleArn,
                ProviderId: 'www.amazon.com',
                WebIdentityToken: response.access_token
            });
            amazon.Login.retrieveProfile(response.access_token, function() {
                alert("Logged in");
            });
        }

        document.getElementById('LoginWithAmazon').onclick = function() {
            options = { scope : 'profile' };
            amazon.Login.authorize(options, amazonAuth);
        };
      }
      //CORN_aws();

      var CORN_renderCob = function(el, tags, msg_id) {
        log("CORN: Decorating tags " + tags);

        window.CORN_filterTag = function(tag) {
          alert('TODO: Only show messages tagged with ' + tag);
        };
        window.CORN_showAddTag = function(msg_id) {
          var addTagDialog = "<div class='CORN-addTagDialog' id='addTag-" + msg_id + "'>";
            addTagDialog += "<form>";
            addTagDialog += "<input id='inputCorntag-" + msg_id + "' type='text' size='4'/>";
            addTagDialog += "<input type='button' value='tag' default='true' onClick='window.CORN_addTag(\"" + msg_id + "\");' />";
            addTagDialog += "<input type='button' value='x' cancel='true' onClick='window.CORN_hideAddTag(\"" + msg_id + "\");' /><br/>";
            //TODO: addTagDialog += "Choose from recent tags: ";
            addTagDialog += "</form>";
            addTagDialog += "</div>";
          $('#corntags-' + msg_id).append($(addTagDialog));
          $('#addTag-' + msg_id).show();
          $('input#inputCorntag-' + msg_id).focus();
        }
        window.CORN_hideAddTag = function(msg_id) {
          $('#addTag-' + msg_id).hide();
        }
        window.CORN_addTag = function(msg_id) {
          var newTag = $('input#inputCorntag-' + msg_id).val();
          log("CORN: TODO: Save a tag key/value pair for: " + msg_id + ", " + newTag);
          window.CORN_storeTag(msg_id, newTag, function(err, data) {
            if (err) {
              log("CORN: Error storing tags: " + err);
              alert('Error storing tag in CornChat');
            }
            else {
              log("CORN: Stored tag " + newTag + " for msg_id " + msg_id + ". id: " + data);
            }
          });
          $('#corntags-' + msg_id).text('...');
          $('#corntags-' + msg_id).data('corntags', '');
          $('#addTag-' + msg_id).hide();
        }
        window.CORN_thumbsUp = function(msg_id) {
          alert('TODO: Save a +1 for msg ' + msg_id)
        }

        var thumbsUpButton = "<span class='CORN-addTag' onClick='window.CORN_thumbsUp(\"" + msg_id + "\");'>👍</span>";
        var addTagButton = "<span class='CORN-addTag' onClick='window.CORN_showAddTag(\"" + msg_id + "\");'>+</span>";

        var tagsHtml = "<span id='corntags-" + msg_id + "'>";
        _.each(tags, function(value, key) {
          tagsHtml += "<span class='CORN-tag' id='corntag-" + msg_id + "' onClick='window.CORN_filterTag(\"" + value + "\")'>" + value + "</span>";
        });
        tagsHtml += "</span>";

        var cobHtml = thumbsUpButton + addTagButton + tagsHtml;
        log("CORN cob: " + cobHtml);

        el.html(cobHtml);
        $('#corntags-' + msg_id).data('corntags', tags);
      }

      var CORN_fetchMsgTags = function() {
        var tags = {};
        var msgs = $('div.msg-line');
        var concatenated_ids = '';
        var random = 0;
        _.each(msgs, function(msg, key) {
          var msg_id = $(msg).data('mid');
          if (msg_id) {
            if (random % 3 === 0) {
              tags[msg_id] = ['red','green'];
            }
            else {
              tags[msg_id] = ['blue'];
            }
            random += 1;
            concatenated_ids += msg_id + '&';
          }
        });
        log("CORN: TODO: fetch tags from remote keystore");
        return tags;
      };

      var CORN_renderCobs = function(allTags) {
        var scrollAdjustment = 0;
        var msgs = $('div.actionable-msg-container');
        _.each(msgs, function(msg, key) {
          var msgHeight = msg.offsetHeight;
          var msgLineDiv = $(msg).find('div.msg-line');
          var hasMsgLineDiv = msgLineDiv.length;
          if (hasMsgLineDiv) {
            var msg_id = $(msgLineDiv).data('mid');
            var tags = allTags[msg_id];
            var hasCornCob = $(msg).find('div.CORN-cob').length;
            if (hasCornCob) {
              // Re-render existing cob
              if (!_.isEqual($('#corntags-' + msg_id).data('corntags'), tags)) {
                log("CORN: re-rendering cob");
                CORN_renderCob($(msg).find('div.CORN-cob'), tags, msg_id);
              }
            }
            else {
              // Render for the first time
              var msgDivs = $(msg).children('div');
              $(msg).html('');
              var htmlStructure = "<div>";
              htmlStructure += '<div class="CORN-msg" style="width: 85%; float: left;"></div>';
              htmlStructure += '<div class="CORN-cob" style="width: 15%; float: right; word-wrap:break-word;"></div>';
              htmlStructure += '<div class="CORN-clear" style="clear:both;"></div>';
              htmlStructure += '</div>';
              $(msg).append($(htmlStructure));
              $(msg).find('div.CORN-msg').append(msgDivs);
              CORN_renderCob($(msg).find('div.CORN-cob'), tags, msg_id);
            }
            var newMsgHeight = $(msg)[0].offsetHeight;
            var heightDiff = newMsgHeight - msgHeight;
            scrollAdjustment += heightDiff;
          }
        });
        if (scrollAdjustment != 0) {
          // Reducing the msg-line width to 85% can wrap text onto another line.
          // Scroll down to account for the extra height added.
          $('div.hc-chat-scrollbox')[0].scrollTop += scrollAdjustment;
        }
      }

      CORN_renderCobs(CORN_fetchMsgTags());






      window.CORN_storeTag = function(mid, tag, fn) {
        function CORN_ddbStoreTag(mid, tag, fn) {
          function uuidv4() {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
              var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
              return v.toString(16);
            });
          }
          var id = uuidv4();
          ddb.putItem({
            TableName: "CornchatTags",
            Item: {
              id: {
                S: id
              },
              mid: {
                S: mid
              },
              tag: {
                S: tag
              }
            }
          }, function(err, data) {
            if (err) return fn(err);
            else fn(null, id);
          });
        }

        log("CORN: TestSend");
        try {
          AWS.config.region = 'us-east-1';
          AWS.config.credentials = new AWS.CognitoIdentityCredentials({
            IdentityPoolId: 'us-east-1:83c77c52-ef3f-4e51-bf39-d682eda27aad'
          }, {
              region: 'us-east-1'
          });
          log("CORN: AWS.config.credentials: " + JSON.stringify(AWS.config.credentials));
          var ddb = new AWS.DynamoDB();
          var input = {
            email: "rkuzsma2@gmail.com",
            password: "123456"
          };
          log("CORN: TestSend - lambda.invoke");
          var lambda = new AWS.Lambda({region: "us-east-1"});
          lambda.invoke({
            FunctionName: 'LambdAuthLogin',
            Payload: JSON.stringify(input)
            }, function(err, data) {
              log("CORN: Lambda Invoked!");
              if (err) log("CORN: failed to login: " + err);
              else {
                var output = JSON.parse(data.Payload);
                if (!output.login) {
                  log("CORN: not logged in");
                } else {
                  log("CORN: Logged in with IdentityId: " + output.identityId + '<br>');
                  var creds = AWS.config.credentials;
                  creds.params.IdentityId = output.identityId;
                  creds.params.Logins = {
                    'cognito-identity.amazonaws.com': output.token
                  };
                  creds.expired = true;

                  CORN_ddbStoreTag(mid, tag, function(err, data) {
                    if (err) {
                      log("CORN: ddbStoreTag err: " + err);
                      fn(err, null);
                    }
                    else {
                      log("CORN: Stored " + data + "<br/>");
                      fn(null, data);
                    }
                  });
                }
              }
            }
          );
        }
        catch(err) {
          log("CORN: TestSend error: " + err);
        }
      }




    }
    catch(err) {
      alert('CornChat could not load: ' + err);
    }
    window.setTimeout(function() {
      CORN_loop();
    }, 3000);
  }

  CORN_loop();
});
