import log from '../logger';
import ReactDOM from "react-dom";

// Render a corn cob into a single HipChat message's div.actionable-msg-container element
class CornCobPortal extends React.Component {
  render() {
    return ReactDOM.createPortal(
      this.props.children,
      this.cornCobRootEl(this.props.msgEl)
    );
  }

  componentDidMount() {
    this.afterHeight = $(this.props.msgEl)[0].parentElement.offsetHeight;
    const difference = this.afterHeight - this.beforeHeight;
    $('div.hc-chat-scrollbox')[0].scrollTop += difference;
  }

  cornCobRootEl(msgEl) {
    var hasCornCobRootEl = $(msgEl).find('div.CORN-cob').length;
    if (!hasCornCobRootEl) {
      // Render for the first time
      this.beforeHeight = $(msgEl)[0].parentElement.offsetHeight;
      var msgDivs = $(msgEl).children('div');
      $(msgEl).html('');
      var htmlStructure = "<div>";
      htmlStructure += '<div class="CORN-msg" style="width: 85%; float: left;"></div>';
      htmlStructure += '<div class="CORN-cob" style="width: 15%; float: right; word-wrap:break-word;"></div>';
      htmlStructure += '<div class="CORN-clear" style="clear:both;"></div>';
      htmlStructure += '</div>';
      $(msgEl).append($(htmlStructure));
      $(msgEl).find('div.CORN-msg').append(msgDivs);
    }
    return $(msgEl).find('div.CORN-cob')[0];
  }
}

export default CornCobPortal;
