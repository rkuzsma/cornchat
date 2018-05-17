import log from '../logger';
import React from "react";
import PropTypes from 'prop-types';
import LogoPortal from './logo-portal';
import Tag from './tag';

class TagFilter extends React.Component {
  static propTypes = {
    onToggleFilterByTag: PropTypes.func.isRequired,
    onClearTagFilter: PropTypes.func.isRequired,
    currentlyFilteredTag: PropTypes.object  // Not required; null is allowed, undefined is not.
  }

  render() {
    if (this.props.currentlyFilteredTag === null) {
      return null;
    }
    return (
      <LogoPortal>
        <div className="CORN-tagFilter">
          <span>Showing new and <Tag tag={this.props.currentlyFilteredTag} key='__filtering' onClickTag={this.props.onToggleFilterByTag} /> messages &nbsp;&nbsp;&nbsp;</span>
          <button className="CORN-button" onClick={this.props.onClearTagFilter} >Show All</button>
        </div>
      </LogoPortal>
    )
  }
}

export default TagFilter;
