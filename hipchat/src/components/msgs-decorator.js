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

        // Preserve any embedded images, links, etc.
        const childHtml = [];
        $(msgLineEl).children().each(function(i) {
          childHtml.push(this.outerHTML);
          this.outerHTML = "CORNCHAT_EMBEDDED_HTML_TOKEN_" + i;
        });

        // Decorate the msg text
        this.props.decorators.forEach((decorator) => {
          msgLineEl.innerHTML = decorator(msgLineEl.innerText);
          // Re-inject the embedded images, links
          let resolvedHtml = msgLineEl.innerHTML;
          childHtml.forEach((html, i) => {
            resolvedHtml = resolvedHtml.replace("CORNCHAT_EMBEDDED_HTML_TOKEN_" + i, html);
          });
          msgLineEl.innerHTML = resolvedHtml;
        });
      });
    });
    return null;
  }
}

export default MsgsDecorator;
