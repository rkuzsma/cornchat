import log from '../logger';
import React from "react";
import PropTypes from 'prop-types';
import LogoPortal from './logo-portal';
import Tag from './tag';

class TagFilterContainer extends React.Component {
  static propTypes = {
    renderProp: PropTypes.func.isRequired,
    tags: PropTypes.object.isRequired,
    msgElements: PropTypes.array.isRequired
  }

  constructor(props) {
    super(props);
    this.state = {
      currentlyFilteredTag: null
    }

    this.handleClearFilter = this.handleClearFilter.bind(this);
    this.handleToggleFilter = this.handleToggleFilter.bind(this);
  }

  handleToggleFilter(tag) {
    log("handleToggleFilter(" + JSON.stringify(tag) + ")")
    this.setState({ currentlyFilteredTag: this.state.currentlyFilteredTag === tag ? null : tag });
  }

  handleClearFilter() {
    this.setState({ tagFilter: null });
  }

  domFilterByTag(tagName) {
    this.props.msgElements.map((item) => {
      const tags = this.props.tags[item.msgId];
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

  domClearFilterByTag() {
    this.props.msgElements.map((item) => {
      $(item.msgEl).show();
      // And show the parent container, in case it was also .hide()ed
      $(item.msgEl).closest('div.hc-chat-row').show();
    });
  }

  render() {
    if (this.state.currentlyFilteredTag) {
      this.domClearFilterByTag();
      this.domFilterByTag(this.state.currentlyFilteredTag.name);
    }
    else {
      this.domClearFilterByTag();
    }

    const myProps = {
      onToggleFilterByTag: this.handleToggleFilter,
      onClearTagFilter: this.handleClearFilter,
      currentlyFilteredTag: this.state.currentlyFilteredTag
    }

    return this.props.renderProp(myProps);
  }
}

export default TagFilterContainer;
