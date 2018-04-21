import ReactDOM from "react-dom";

const AddReactionPortal = ({children}) => {
  const element = function() {
    var rootEl = document.getElementById('CORN_reactionPortal');
    if (rootEl) return rootEl;
    rootEl = $("<div id='CORN_reactionPortal'></div>");
    $('body').append(rootEl);
    return document.getElementById('CORN_reactionPortal');
  }
  return ReactDOM.createPortal(
    children,
    element()
  );
}

export default AddReactionPortal;
