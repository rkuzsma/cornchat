import log from '../logger';
import React from "react";
import ReactDOM from "react-dom";
import PropTypes from 'prop-types';

class MsgsDecorator extends React.Component {
  static propTypes = {
    msgElements: PropTypes.array.isRequired,
    decorators: PropTypes.array.isRequired
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
        
        // Preserve any embedded images, links, etc.
        const childHtml = [];
        $(msgLineEl).children().each(function(i) {
          // .innerText converts <br> to newlines, which we need for proper syntax highlighting to work
          if (this.outerHTML !== '<br>') {
            childHtml.push(this.outerHTML);
            this.outerHTML = "CORNCHAT_EMBEDDED_HTML_TOKEN_" + i;
          }
        });


        // Decorate the msg text
        let isDecorated = false;
        this.props.decorators.forEach((decorator) => {
          const decorated = decorator(msgLineEl.innerText);
          if (decorated !== msgLineEl.innerText) {
            isDecorated = true;
            msgLineEl.innerHTML = decorated;
            // Re-inject the embedded images, links
            let resolvedHtml = msgLineEl.innerHTML;
            childHtml.forEach((html, i) => {
              resolvedHtml = resolvedHtml.replace("CORNCHAT_EMBEDDED_HTML_TOKEN_" + i, html);
            });
            msgLineEl.innerHTML = resolvedHtml;
          }
        });
        if (!isDecorated) {
          // No changes made; revert back to version without any CORNCHAT_EMBEDDED_HTML_TOKEN_#s
          msgLineEl.innerHTML = originalHTML;
        }
        else {
          // Preserve original HTML so user can revert later in the UI
          msgLineEl.setAttribute('CORNCHAT-undecorated-html', originalHTML);
          msgLineEl.innerHTML = '<div class="CORN-toggle-markdown">' +
            '<div class="CORN-toggle-markdown-button" onClick="var msg=this.parentElement.parentElement; msg.innerHTML=msg.getAttribute(\'CORNCHAT-undecorated-html\');">Show Original</div>' +
            msgLineEl.innerHTML +
            '</div>';
        }
      });
    });
    return null;
  }
}

export default MsgsDecorator;
