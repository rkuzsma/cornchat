import log from '../logger';
import TagsStore from '../tags-store';
import ReactDOM from "react-dom";
import CornCob from './corn-cob';
import Constants from '../constants';

class CornCobs extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tags: {}
    }

    // Keep checking for new tags
    window.setInterval(() => {
      TagsStore.fetchTags(this.findVisibleMsgIds(), (err, tags) => {
        if (err) {
          log("Error in fetchMsgTags: " + err);
          tags = {};
        }
        this.setState({tags: tags});
      });
    }, Constants.tag_fetch_loop_interval);

    this.findVisibleMsgIds = this.findVisibleMsgIds.bind(this);
    this.handleThumbsUp = this.handleThumbsUp.bind(this);
    this.handleAddTag = this.handleAddTag.bind(this);
    this.handleFilterByTag = this.handleFilterByTag.bind(this);
    this._renderCob = this._renderCob.bind(this);
  }

  findVisibleMsgIds() {
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
    var res = msgIdsFromMsgDivs(msgDivs);
    return res;
  }

  handleThumbsUp() {
    alert('TODO: Save a +1 for msg ' + this.props.msgId)
  }

  handleAddTag(tag) {
    TagsStore.storeTag(msgId, tag.name, (err, data) => {
      if (err) {
        log("Error storing tag: " + err);
        alert('Error storing tag in CornChat');
      }
      else {
        log("Stored tag " + tag.name + " for msgId " + msgId + ". id: " + data);
      }
    });
  }

  handleFilterByTag(tag) {
    alert('TODO: Only show messages tagged with ' + tag.name);
  }

  _renderCob(msgId, cornCobRootEl) {
    ReactDOM.render(
        <CornCob
          tags={this.state.tags[msgId]}
          onFilterByTag={this.handleFilterByTag}
          onThumbsUp={this.handleThumbsUp}
          onAddTag={this.handleAddTag} />
      , cornCobRootEl);
  }

  render() {
    var allTags = this.state.tags;
    var scrollAdjustment = 0;
    var msgs = $('div.actionable-msg-container');
    _.each(msgs, (msg, key) => {
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
        const cornCobRootEl = $(msg).find('div.CORN-cob')[0];
        this._renderCob(msgId, cornCobRootEl);

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
    return null;
  }
}

export default CornCobs;
