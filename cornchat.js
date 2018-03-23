  'use strict';

  $(document).on('hc-ready', function () {

    var CORN_loop = function() {
      try {
        var log = window.macapi.log;
        log("CORN_loop");
        log("CORN: " + $('div.actionable-msg-container') + "--element");

        var CORN_renderCob = function(el, tags, msg_id) {
          log("CORN: Decorating tags " + tags);

          window.CORN_filterTag = function(tag) {
            alert('TODO: Only show messages tagged with ' + tag);
          };
          window.CORN_showAddTag = function(msg_id) {
            $('#addTag-' + msg_id).show();
            $('input#inputCorntag-' + msg_id).focus();
          }
          window.CORN_hideAddTag = function(msg_id) {
            $('#addTag-' + msg_id).hide();
          }
          window.CORN_addTag = function(msg_id) {
            var newTag = $('input#inputCorntag-' + msg_id).val();
            log("CORN: TODO: Save a tag key/value pair for: " + msg_id + ", " + newTag);
            $('#corntags-' + msg_id).text('...');
            $('#corntags-' + msg_id).data('corntags', '');
            $('#addTag-' + msg_id).hide();
          }
          window.CORN_thumbsUp = function(msg_id) {
            alert('TODO: Save a +1 for msg ' + msg_id)
          }

          var thumbsUpButton = "<span class='CORN-addTag' onClick='window.CORN_thumbsUp(\"" + msg_id + "\");'>👍</span>";
          var addTagDialog = "<div class='CORN-addTagDialog' id='addTag-" + msg_id + "'>";
            addTagDialog += "<input id='inputCorntag-" + msg_id + "' type='text' size='4'/>";
            addTagDialog += "<input type='button' value='tag' default='true' onClick='window.CORN_addTag(\"" + msg_id + "\");' />";
            addTagDialog += "<input type='button' value='x' cancel='true' onClick='window.CORN_hideAddTag(\"" + msg_id + "\");' /><br/>";
            //TODO: addTagDialog += "Choose from recent tags: ";
            addTagDialog += "</div>";
          var addTagButton = "<span class='CORN-addTag' onClick='window.CORN_showAddTag(\"" + msg_id + "\");'>+</span>";

          var tagsHtml = "<span id='corntags-" + msg_id + "'>";
          _.each(tags, function(value, key) {
            tagsHtml += "<span class='CORN-tag' id='corntag-" + msg_id + "' onClick='window.CORN_filterTag(\"" + value + "\")'>" + value + "</span>";
          });
          tagsHtml += "</span>";

          var cobHtml = thumbsUpButton + addTagDialog + addTagButton + tagsHtml;
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
          var msgs = $('div.actionable-msg-container');
          _.each(msgs, function(msg, key) {
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
                var msgDivs = $(msg).find('div');
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
            }
          });
        }

        CORN_renderCobs(CORN_fetchMsgTags());
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
}());
