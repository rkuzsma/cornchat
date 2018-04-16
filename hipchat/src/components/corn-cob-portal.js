import log from '../logger';
import ReactDOM from "react-dom";

// Render a corn cob into a single HipChat message's div.actionable-msg-container element
const CornCobPortal = function(portalProps) {
  const cornCobRootEl = function(msgEl) {
    var hasCornCobRootEl = $(msgEl).find('div.CORN-cob').length;
    if (!hasCornCobRootEl) {
      // Render for the first time
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
  return ReactDOM.createPortal(
    portalProps.children,
    cornCobRootEl(portalProps.msgEl)
  );
}

export default CornCobPortal;
