import log from '../logger';
import ReactDOM from "react-dom";
import PropTypes from 'prop-types';

// Render a corn cob into a single HipChat message's div.actionable-msg-container element
class CornCobPortal extends React.Component {
  render() {
    return ReactDOM.createPortal(
      this.props.children,
      this.cornCobRootEl(this.props.msgEl)
    );
  }

  cornCobRootEl(msgEl) {
    var hasCornCobRootEl = $(msgEl).find('div.CORN-cob').length;
    if (!hasCornCobRootEl) {
      // Render for the first time
      var msgDivs = $(msgEl).children('div');
      $(msgEl).html('');
      var htmlStructure = "<div class='CORN-msgContainer'>";
      htmlStructure += '<div class="CORN-msg" style="width: 90%; float: left;">';
      htmlStructure += '<div class="CORN-tags-portal"></div>';
      htmlStructure += '</div>';
      htmlStructure += '<div class="CORN-cob" style="width: 10%; float: right; word-wrap:break-word;"></div>';
      htmlStructure += '<div class="CORN-clear" style="clear:both;"></div>';
      htmlStructure += '</div>';
      $(msgEl).append($(htmlStructure));
      $(msgEl).find('div.CORN-msg').append(msgDivs);
      $(msgEl).find('div.CORN-msg').append($('<div class="CORN-reactions-portal"></div>'));
    }
    return $(msgEl).find('div.CORN-cob')[0];
  }
}

CornCobPortal.propTypes = {
  msgEl: PropTypes.object.isRequired
};

export default CornCobPortal;
