import log from '../logger';
import PropTypes from 'prop-types';
import Tag from './tag';
import React from 'react';
import Dimensions from 'react-dimensions';

class Tags extends React.Component {
  constructor(props) {
    super(props);
  }

  getSnapshotBeforeUpdate(prevProps, prevState) {
    // The react-dimensions HOC gives us this prop.
    log("!!! snapshot: " + this.props.containerHeight);
    return this.props.containerHeight;
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    const newHeight = this.props.containerHeight;
    const difference = newHeight - snapshot;
    log("!!! componentDidUpdate: " + difference);
    $('div.hc-chat-scrollbox')[0].scrollTop += difference;
  }


  componentDidMount() {
    this.afterHeight = this.props.containerHeight;
    const difference = this.afterHeight - this.beforeHeight;
    log("!!! componentDidMount, difference:" + difference);
    $('div.hc-chat-scrollbox')[0].scrollTop += difference;
  }

  render() {
    log("!!! render, beforeHeight=" + this.props.containerHeight);
    this.beforeHeight = this.props.containerHeight;
    if (!this.props.tags) return null;
    const tagItems = this.props.tags.map((tag) =>
      <Tag
        ref={this.elementRef}
        tag={tag}
        key={tag.name}
        onFilterByTag={this.props.onFilterByTag} />
    );
    return (
      <span className='CORN-tags'>
        {tagItems}
      </span>
    )
  }
}

Tags.propTypes = {
  tags: PropTypes.array,
  onFilterByTag: PropTypes.func.isRequired
};

export default Dimensions()(Tags);
