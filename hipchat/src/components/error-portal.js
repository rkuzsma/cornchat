import ReactDOM from "react-dom";

const ErrorPortal = ({children}) => {
  const errorsRootEl = function() {
    var rootEl = document.getElementById('CORN_errorsRoot');
    if (rootEl) return rootEl;
    rootEl = $("<ul class='aui-nav'><div id='CORN_errorsRoot'></div></ul>");
    var el = $('div.aui-header-primary');
    $(el).append(rootEl);
    return document.getElementById('CORN_errorsRoot');
  };
  return ReactDOM.createPortal(
    children,
    errorsRootEl()
  );
};

export default ErrorPortal;
