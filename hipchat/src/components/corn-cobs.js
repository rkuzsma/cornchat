import log from '../logger';
import TagsStore from '../tags-store';
import ReactDOM from "react-dom";
import CornCob from './corn-cob';
import Constants from '../constants';
import PropTypes from 'prop-types';

class CornCobs extends React.Component {
  constructor(props) {
    super(props);
    this.handleThumbsUp = this.handleThumbsUp.bind(this);
    this.handleAddTag = this.handleAddTag.bind(this);
    this._renderCob = this._renderCob.bind(this);
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

  _renderCob(msgId, cornCobRootEl) {
    ReactDOM.render(
        <CornCob
          tags={this.props.tags[msgId]}
          onFilterByTag={this.props.onFilterByTag}
          onThumbsUp={this.handleThumbsUp}
          onAddTag={this.handleAddTag} />
      , cornCobRootEl);
  }

  render() {
    var allTags = this.props.tags;
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

CornCobs.propTypes = {
  tags: PropTypes.object.isRequired,
  onFilterByTag: PropTypes.func.isRequired
};

export default CornCobs;
