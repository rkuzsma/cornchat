import log from '../logger';
import ReactDOM from "react-dom";

const LogoPortal = ({children}) => {
  const logoRootEl = function() {
    var logoRootEl = document.getElementById('CORN_logoRoot');
    if (logoRootEl) return logoRootEl;
    logoRootEl = $("<ul class='aui-nav'><div id='CORN_logoRoot'></div></ul>");
    var el = $('div.aui-header-primary');
    $(el).append(logoRootEl);
    return document.getElementById('CORN_logoRoot');
  };
  return ReactDOM.createPortal(
    children,
    logoRootEl()
  );
};

export default LogoPortal;
