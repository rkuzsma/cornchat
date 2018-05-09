import log from '../logger';
import React from "react";
import PropTypes from 'prop-types';
import MsgElementsStore from '../msg-elements-store';

class TagFilter extends React.Component {
  constructor(props) {
    super(props);
    this.msgElementStore = new MsgElementsStore();
  }

  filterByTag(tagName) {
    this.msgElementStore.recentElements().map((item) => {
      // TODO Hook back up tag-filter, but using GraphQL instead of msgInfoStore:
      //const tags = this.msgInfoStore.recentTags()[item.msgId];
      log("TODO: FilterByTag needs re-implementation");
      const tags = null;
      if (!(tags && tags.some(e => e.name === tagName))) {
        $(item.msgEl).hide();

        // If there are no more visible msgs in this msg's hc-chat-msg row, hide row
        // item.msgEl is a div.actionable-msg-container
        // Find the parent hc-chat-row above it
        const parentHcChatRow = $(item.msgEl).closest('div.hc-chat-row');
        // Inspect all child actionable-msg-containers to see if any have been .hide()ed
        const childMsgs = $(parentHcChatRow).find('div.actionable-msg-container');
        log("childMsgsLen=" + childMsgs.length);
        if ($.makeArray($(childMsgs)).some((e) => $(e).is(":visible"))) {
          log("Not OK to hide the parent");
        }
        else {
          log("OK to hide the parent");
          $(parentHcChatRow).hide();
        }
      }
    });
  }

  clearFilterByTag() {
    this.msgElementStore.recentElements().map((item) => {
      $(item.msgEl).show();
      // And show the parent container, in case it was also .hide()ed
      $(item.msgEl).closest('div.hc-chat-row').show();
    });
  }

  render() {
    if (this.props.tag) {
      this.clearFilterByTag();
      this.filterByTag(this.props.tag.name);
    }
    else {
      this.clearFilterByTag();
    }

    return null;
  }
}

TagFilter.propTypes = {
  tag: PropTypes.object
};

export default TagFilter;
