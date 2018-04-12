'use strict';

import log from './logger';
import TagsStore from './tags-store';
import ReactDOM from "react-dom";
import CornCob from './components/corn-cob';

export default function renderCorn() {

  try {

    const findVisibleMsgIds = function() {
      var tags = {};
      var msgDivs = $('div.msg-line');
      var concatenated_ids = '';
      var random = 0;
      const msgIdsFromMsgDivs = function(msgDivs) {
        return _.reduce(msgDivs, function(res, msgDiv) {
          var msgId = $(msgDiv).data('mid');
          if (msgId) {
            res[msgId] = msgId;
          }
          return res;
        }, {});
      }
      return msgIdsFromMsgDivs(msgDivs);
    };

    const renderCob = function(cornCobRootEl, tags, msgId) {

      const handleThumbsUp = function() {
        alert('TODO: Save a +1 for msg ' + this.props.msgId)
      }

      const handleAddTag = function(tag) {
        TagsStore.storeTag(msgId, tag.name, function(err, data) {
          if (err) {
            log("Error storing tag: " + err);
            alert('Error storing tag in CornChat');
          }
          else {
            log("Stored tag " + tag.name + " for msgId " + msgId + ". id: " + data);
          }
        });
      }

      const handleFilterByTag = function(tag) {
        alert('TODO: Only show messages tagged with ' + tag.name);
      }

      ReactDOM.render(
        (
          <CornCob
            tags={tags}
            onFilterByTag={handleFilterByTag}
            onThumbsUp={handleThumbsUp}
            onAddTag={handleAddTag} />
        ), cornCobRootEl);
    }

    const renderCobs = function(allTags) {
      var scrollAdjustment = 0;
      var msgs = $('div.actionable-msg-container');
      _.each(msgs, function(msg, key) {
        var msgHeight = msg.offsetHeight;
        var msgLineDiv = $(msg).find('div.msg-line');
        var hasMsgLineDiv = msgLineDiv.length;
        if (hasMsgLineDiv) {
          var msgId = $(msgLineDiv).data('mid');
          var tags = allTags[msgId];
          var hasCornCobRootEl = $(msg).find('div.CORN-cob').length;
          if (!hasCornCobRootEl) {
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
          }

          // Re-render into the root el
          const cornCobRootEl = $(msg).find('div.CORN-cob');
          renderCob(tags, msgId, cornCobRootEl);

          // The cob may wrap hipchat msg down a line, necessitating a scroll.
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

    TagsStore.fetchTags(findVisibleMsgIds(), function(err, tags) {
      if (err) {
        log("Error in fetchMsgTags: " + err);
        tags = [];
      }
      renderCobs(tags);
    });
  }
  catch(err) {
    alert('CornChat could not load: ' + err);
  }
}
