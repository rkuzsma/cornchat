import ReactDOM from "react-dom";

const AddTagDialogPortal = ({children}) => {
  const element = function() {
    var rootEl = document.getElementById('CORN_addTagDialogPortal');
    if (rootEl) return rootEl;
    rootEl = $("<div id='CORN_addTagDialogPortal'></div>");
    $('#page').append(rootEl);
    return document.getElementById('CORN_addTagDialogPortal');
  }
  return ReactDOM.createPortal(
    children,
    element()
  );
}

export default AddTagDialogPortal;
