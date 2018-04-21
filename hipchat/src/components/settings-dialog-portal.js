import log from '../logger';
import ReactDOM from "react-dom";

const SettingsDialogPortal = ({children}) => {
  const dialogRootEl = function() {
    var dialogRootEl = document.getElementById('CORN_dialogRoot');
    if (dialogRootEl) return dialogRootEl;
    dialogRootEl = $("<div><div id='CORN_dialogRoot'></div></div>");
    $('#hipchat').append(dialogRootEl, $('#hipchat')[0].childNodes[0]);
    return document.getElementById('CORN_dialogRoot');
  };
  return ReactDOM.createPortal(
    children,
    dialogRootEl()
  );
};

export default SettingsDialogPortal;
