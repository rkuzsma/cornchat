// Given a hipchat msgLine DIV, apply all text decorators to it.
// decorateMsgLineEl modifies the DOM in-place.

const decorateText = (text, decorators, settingValues) => {
  decorators.forEach((decorator) => {
    text = decorator(text, settingValues);
  });
  return text;
}

const isBrTagNode = (node) => {
  return (node != null && node != undefined &&
    node.nodeType === 1 && node.tagName === 'BR');
}
const isNonEmptyTextNode = (node) => {
  return (node != null && node != undefined &&
    node.nodeType === 3 && node.textContent.trim() !== '');
}
const getTextContent = (node) => {
  if (isNonEmptyTextNode(node)) {
    return node.textContent;
  }
  if (isBrTagNode(node)) {
    return "\n";
  }
  return '';
}

// Recursively drill down through a DIV, decorating any text nodes.
const decorateDiv = (div, decorators, settingValues) => {
  let isDecorated = false;
  let bufferedContentNodes = [];
  const contents = div.contents();
  contents.each(function(index) {
    // if it's a non-empty text node, decorate it
    if (isNonEmptyTextNode(this) || isBrTagNode(this)) {
      bufferedContentNodes.push(this);
      if (index < contents.length - 1) {
        const peek = contents.get(index+1);
        if (isNonEmptyTextNode(peek) || isBrTagNode(peek)) {
          return;
        }
      }
      // Replace the text node with a decorated HTML span
      const bufferedContent = bufferedContentNodes.reduce((accumulator, currentValue) => {
        return accumulator + getTextContent(currentValue);
      }, '');
      //console.log("decorateText:" + bufferedContent);
      const decoratedText = decorateText(bufferedContent, decorators, settingValues);
      //console.log("decorated:   " + decoratedText);
      if (decoratedText !== bufferedContent) {
        const parentNode = this.parentNode;
        const replacementNode = document.createElement('span');
        replacementNode.innerHTML = decoratedText;
        parentNode.insertBefore(replacementNode, this);
        bufferedContentNodes.forEach((node) => {
          parentNode.removeChild(node);
        });
        isDecorated = true;
      }
      bufferedContentNodes = [];
    }
    // don't traverse <a>, <img>, because decorators only operate on text.
    // hipchat doesnt have <p> tags, so only need to traverse DIV.
    else if (this.tagName === "DIV") {
      bufferedContentNodes = [];
      if (decorateDiv($(this))) {
        isDecorated = true;
      };
    }
  });
  return isDecorated;
}

// Modify the msgLineEl DOM element with decorated HTML.
// Returns true if the element was actually modified.
export default function decorateMsgLineEl(msgLineEl, decorators, settingValues) {
  return decorateDiv(msgLineEl, decorators, settingValues);
}
