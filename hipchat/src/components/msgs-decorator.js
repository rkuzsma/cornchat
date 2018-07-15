import log from '../logger';
import React from "react";
import ReactDOM from "react-dom";
import PropTypes from 'prop-types';
import decorateMsgLineEl from './msg-decorator';

class MsgsDecorator extends React.Component {
  static propTypes = {
    msgElements: PropTypes.array.isRequired,
    decorators: PropTypes.array.isRequired,
    settingValues: PropTypes.object
  }

  render() {
    if (!this.props.msgElements) return null;

    // $($('div.actionable-msg-container')[27]).children('div.msg-line')[0].innerHTML = "<b>Foo</b>"
    this.props.msgElements.forEach(({ msgEl, msgId }) => {
      $(msgEl).children('div.msg-line').toArray().forEach((msgLineEl) => {
        if ($(msgLineEl).hasClass('truncated')) {
          // <div class="msg-line truncatable ...
          //   <div class="truncate-wrap ...
          //     <div class="msg-wrap ...
          //       <div class="msg-wrap ... > Message Text </div>
          const truncatedEl = $(msgLineEl).find('div.msg-wrap div:not(:has(div))');
          if (truncatedEl.length == 1) {
            msgLineEl = truncatedEl[0];
          }
        }

        const originalHTML = msgLineEl.innerHTML;

        if (decorateMsgLineEl($(msgLineEl), this.props.decorators, this.props.settingValues)) {
          // Preserve original HTML so user can revert later in the UI
          // var replacementNode = document.createElement('div');
          // replacementNode.innerHTML = msgLineEl.innerHTML;
          // msgLineEl.parentNode.insertBefore(replacementNode, msgLineEl);
          // msgLineEl.parentNode.removeChild(msgLineEl);
          msgLineEl.innerHTML = '<div class="CORN-toggle-markdown">' +
            '<div title="Unapply Markdown Formatting" class="CORN-toggle-markdown-button" onClick="var msg=this.parentElement.parentElement; msg.innerHTML=msg.getAttribute(\'CORNCHAT-undecorated-html\');"><span>M⬇</span></div>' +
            msgLineEl.innerHTML +
            '</div>';
          msgLineEl.setAttribute('CORNCHAT-undecorated-html', originalHTML);
        }
      });
    });
    return null;
  }
}

export default MsgsDecorator;
